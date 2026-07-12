#!/usr/bin/env python3
"""Blacksmith Living Shop — data spine poller.

Polls SLIKR (shop 421) and publishes a tiny, PII-FREE JSON snapshot for the
website widget / Living Shop scene / wait-time bot.

HARD PRIVACY RULE (build prompt, security manifest): zero client names, phones,
emails or history may leave this machine. Output = counts, minutes, barber
FIRST NAMES + on/cutting flags, open state, timestamp. Nothing else.

Runs via launchd every 60s during (extended) shop hours. Writes out/queue.json
(the public snapshot) and pushes it via publish_remote.sh.
"""
import json
import os
import subprocess
import sys
import urllib.request
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

BASE = "https://api.slikr.com.au/api"
SHOP_ID = 421          # walk-in queue shop: drives wait_mins + "waiting" + hours
BOOKINGS_SHOP_ID = 1121  # pre-booked chairs: same room, same crew — folds into
                         # per-barber cutting/on status (NOT into the queue count)
BLACKROSE_SHOP_ID = 422  # the salon next door: Sami works both sides. Activity
                         # there tags her cutting_at="salon" (girl-client sprite)
                         # and adds the book-salon option. Never affects counts.
TZ = ZoneInfo("Australia/Brisbane")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "out")
JWT_PATH = os.path.expanduser("~/.claude/blacksmith_weekly/.slikr_jwt")
NTFY_TOPIC = "plaud-jett-x8m3p-private"
FAIL_FLAG = os.path.join(HERE, "out", ".consecutive_failures")

# Privacy config flag (build prompt: de-name barbers if any object).
SHOW_BARBER_NAMES = True

# Treat a pending reservation as "waiting in the queue now" if it is due to
# start within this window. Pre-booked slots hours away are not "waiting".
WAITING_HORIZON_MIN = 30

# First names who work BOTH Blacksmith and Blackrose (get the book-salon
# option + salon-side live status). Confirmed by Jett 2026-06-11.
DUAL_SHOP = {"Sami", "Sammy"}

# Barbers whose chairs run on the Bookings shop — their book button should
# open the bookings flow, not the walk-in queue. Derived live from where
# their reservations appear; this is just the fallback for quiet days.
BOOKINGS_DEFAULT = {"Locky", "Jarred"}

# Bookings-shop service menu (ids differ from the walk-in shop's). Refreshed
# manually if pricing changes; kept static to avoid a 4th fetch per minute.
SERVICES_BOOKINGS = [
    {"id": 5542, "name": "Men's Cut", "cost": 50, "mins": 40},
    {"id": 5588, "name": "Men's Cut + Beard (Combo)", "cost": 78, "mins": 60},
    {"id": 5553, "name": "Zero/Skin/Burst Fade", "cost": 62, "mins": 45},
    {"id": 5589, "name": "Zero/Skin Fade + Beard (Combo)", "cost": 88, "mins": 60},
    {"id": 5551, "name": "Beard trim", "cost": 35, "mins": 30},
    {"id": 5549, "name": "Cut Throat Shave", "cost": 60, "mins": 40},
]


def fetch(path: str) -> dict:
    req = urllib.request.Request(BASE + path)
    try:
        jwt = open(JWT_PATH).read().strip()
        req.add_header("Authorization", f"Bearer {jwt}")
    except OSError:
        pass  # endpoint works unauthenticated; JWT is belt-and-braces
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def parse_t(now: datetime, hms: str) -> datetime:
    h, m, s = (int(x) for x in hms.split(":"))
    return now.replace(hour=h, minute=m, second=s, microsecond=0)


def todays_hours(now: datetime, timings: list) -> tuple:
    day = now.strftime("%a")  # Mon, Tue, ...
    for t in timings:
        if day in t["day"].split(",") and not t.get("suspend"):
            return t["start"], t["close"]
    return None, None


def build_snapshot() -> dict:
    now = datetime.now(TZ)

    shop = fetch(f"/shops/{SHOP_ID}")["shop_details"]
    queue = fetch(f"/shops/{SHOP_ID}/seats/queue").get("reservations", [])
    seats = fetch(f"/shops/{SHOP_ID}/seats").get("seats", {})
    # Bookings shop (same physical room): contributes barber activity only.
    bookings = fetch(f"/shops/{BOOKINGS_SHOP_ID}/seats/queue").get("reservations", [])
    blackrose = fetch(f"/shops/{BLACKROSE_SHOP_ID}/seats/queue").get("reservations", [])

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "timings_cache.json"), "w") as f:
        json.dump(shop.get("timings", []), f)

    start, close = todays_hours(now, shop.get("timings", []))
    is_open = (bool(start) and not shop.get("suspend")
               and parse_t(now, start) <= now < parse_t(now, close))

    # Who is rostered on a seat today: any seat slot that is a real
    # reservation/break (not the full-day "closed" block) names its barber.
    on_today = {}  # barber_id -> first name (from slot performer ids)
    shift_start = {}  # barber_id -> datetime of earliest rostered (non-closed) slot today
    walkin_ids = set()  # barbers seated on the WALK-IN shop (421) = the walk-in roster
    for seat in seats.values():
        for slot in seat.get("time_slots", []):
            if slot.get("type") != "closed" and slot.get("performer_barber_id"):
                pid = slot["performer_barber_id"]
                on_today[pid] = None
                walkin_ids.add(pid)
                st = parse_t(now, slot["start_time"])
                if pid not in shift_start or st < shift_start[pid]:
                    shift_start[pid] = st

    # Live activity. Walk-in queue (421) drives BOTH waiting count and cutting;
    # bookings (1121) drive cutting/on-today only — an appointment at 4pm is
    # not someone waiting on the couch now.
    waiting = 0
    cutting_ids = set()
    cutting_at = {}   # name/bid -> "shop" | "salon" (where they're cutting NOW)
    seen_shop = {}    # name/bid -> set of sources with any activity today
    busy = {}  # name/bid -> list of (start, finish) active intervals today
    for src, counts_waiting, src_tag in ((queue, True, "shop"),
                                         (bookings, False, "bookings"),
                                         (blackrose, False, "salon")):
        for r in src:
            status = r.get("status")
            if status in ("completed", "cancelled", "no_show"):
                continue
            res = r.get("reservation") or {}
            barber = res.get("barber") or {}
            bid = r.get("performer_barber_id") or barber.get("id")
            name = (barber.get("first_name") or "").strip().title()
            # Blackrose staff stay out of the Blacksmith scene — the salon
            # feed only enriches dual-shop people (Sami cuts both sides).
            if src_tag == "salon" and name not in DUAL_SHOP:
                continue
            if bid:
                # Barber ids differ per shop — key the merged map by NAME when
                # we have one (Jarred has a different id in 421 vs 1121).
                key = name or bid
                on_today.setdefault(key, None)
                if name:
                    on_today[key] = name
            seen_shop.setdefault(name or bid, set()).add(src_tag)
            st, ft = parse_t(now, r["start_time"]), parse_t(now, r["finish_time"])
            started = status in ("in_progress", "processing", "started")
            # Barbers often don't tap "start" in SLIKR — a pending job whose
            # start time has passed is, in reality, someone in the chair.
            implied = status == "pending" and st <= now < ft and bid
            if started or implied:
                cutting_ids.add(name or bid)
                cutting_at[name or bid] = "salon" if src_tag == "salon" else "shop"
                busy.setdefault(name or bid, []).append((min(st, now), max(ft, now)))
            elif status == "pending":
                busy.setdefault(name or bid, []).append((st, ft))
                if counts_waiting and st <= now + timedelta(minutes=WAITING_HORIZON_MIN):
                    waiting += 1

    WALK_IN_FIT = 25  # a free gap this long fits a standard walk-in cut

    def free_in_minutes(key):
        """Minutes until a walk-in FITS with this barber: chain busy blocks
        until a gap >= WALK_IN_FIT appears. A barber idle with 30 free
        minutes before their next booking is free NOW."""
        ivs = sorted(busy.get(key, []))
        end = now
        for st, ft in ivs:
            if st <= end + timedelta(minutes=WALK_IN_FIT):
                end = max(end, ft)
            else:
                break
        return max(0, int((end - now).total_seconds() // 60))

    # Fill names for rostered-but-quiet barbers from the shop roster, then
    # merge id-keyed (seat roster) and name-keyed (live activity) entries.
    roster = {b["id"]: (b.get("user") or {}).get("first_name", "").strip().title()
              for b in shop.get("barbers", []) if b.get("is_active")}
    # A barber rostered to start later today isn't "on" until their shift
    # begins — don't advertise a 12pm starter as free at 9am. Key their shift
    # start by NAME so it survives the id/name merge below. Someone actually
    # cutting (started early) overrides this — reality wins.
    shift_start_name = {}
    for pid, ss in shift_start.items():
        nm = roster.get(pid)
        if nm and (nm not in shift_start_name or ss < shift_start_name[nm]):
            shift_start_name[nm] = ss
    # Walk-in roster by name: only these barbers can seat a walk-in, so only
    # they count toward the walk-in wait. Book-ahead crew (Locky/Jarred) and
    # the salon (Sami) are excluded — an idle bookings barber must NOT read as
    # "no wait" on the walk-in queue.
    walkin_names = {roster.get(pid) for pid in walkin_ids} - {None, ""}
    merged = {}
    for key in on_today:
        name = on_today[key] or roster.get(key)
        if not name:
            continue
        cutting = key in cutting_ids or name in cutting_ids
        fi = max(free_in_minutes(key), free_in_minutes(name))
        at = cutting_at.get(key) or cutting_at.get(name) or "shop"
        seen = seen_shop.get(key, set()) | seen_shop.get(name, set())
        first = name.split(" ")[0]
        # Dual-shop (Sami) runs the salon — only salon activity counts as them
        # cutting. A walk-in pinned to their idle 421 seat is NOT them on the
        # floor, so don't read it as cutting. (Beau 2026-07-07)
        if first in DUAL_SHOP and at != "salon":
            cutting = False
        if first in DUAL_SHOP:
            book = ["barber", "salon"]
        elif "bookings" in seen or first in BOOKINGS_DEFAULT:
            book = ["bookings"]
        else:
            book = ["barber"]
        prev = merged.get(name, {"cutting": False, "free_in": 0,
                                 "cutting_at": "shop", "book": book, "salon_sched": False})
        merged[name] = {"cutting": prev["cutting"] or cutting,
                        "free_in": max(prev["free_in"], fi),
                        "cutting_at": at if cutting else prev["cutting_at"],
                        "book": book,
                        "salon_sched": prev.get("salon_sched", False) or ("salon" in seen)}
    # Walk-in flag: rostered on a 421 seat AND actually AVAILABLE for a walk-in
    # (free now or soon). A barber can be on BOTH walk-ins and bookings the same
    # day (Locky) — if he's free he must show + count toward the wait. One who's
    # booked solid (Jarred) reads a big free_in and stays off. EXCEPTION: Sami
    # (dual-shop) shows whenever she's scheduled in the salon. (Beau 2026-07-12)
    WALKIN_MAX = 90  # rostered but booked further out than this = not a practical walk-in now
    def _is_walkin(n, v):
        if n.split(" ")[0] in DUAL_SHOP:
            return v.get("salon_sched", False)
        return n in walkin_names and v["free_in"] < WALKIN_MAX
    barbers = [{"name": n if SHOW_BARBER_NAMES else "Barber",
                "cutting": v["cutting"], "free_in": v["free_in"],
                "cutting_at": v["cutting_at"], "book": v["book"],
                "walkin": _is_walkin(n, v)}
               for n, v in merged.items()
               if v["cutting"] or (n.split(" ")[0] in DUAL_SHOP and v.get("salon_sched"))
               or n not in shift_start_name or now >= shift_start_name[n]]
    barbers.sort(key=lambda b: (not b["cutting"], b["name"]))

    # Walk-in wait: soonest a WALK-IN barber can seat a new walk-in (their cut
    # remaining, chained through anyone already queued — see free_in). 0 = a
    # walk-in chair is open now. None = no walk-in barber on shift.
    walkin_wait = min((b["free_in"] for b in barbers if b["walkin"]), default=None)

    # Jett's rule (2026-06-11): always advertise the SHORTEST wait — if a
    # chair is free the walk-in wait is now, regardless of SLIKR's shop-wide
    # estimate (which tracks the queue, not chair availability).
    shortest = min((b["free_in"] for b in barbers), default=None)

    # Real bookable times straight from SLIKR's own availability engine
    # (it knows shifts/breaks; our gap-maths didn't). First name -> ["HH:MM"].
    def fetch_times(path, cap=4):
        out = {}
        try:
            times = fetch(path)
            for k, v in (times.get("barbers") or {}).items():
                if k == "all" or not isinstance(v, dict):
                    continue
                nm = ((v.get("user") or {}).get("first_name") or "").strip().title()
                if nm:
                    out[nm] = [t[:5] for t in (v.get("available_times") or [])][:cap]
        except Exception:
            pass  # slots are an enhancement; the scene survives without them
        return out

    slots_map = fetch_times(f"/shops/{BOOKINGS_SHOP_ID}/seats/times?services%5B%5D=5542")
    for b in barbers:
        b["slots"] = slots_map.get(b["name"].split(" ")[0], []) if is_open else []

    # The real week ahead so the chat can always let a customer book ANY
    # scheduled day — "book Jarred for Saturday" mid-shift, not just after
    # hours. book_days = every day in the next week (incl. today while there
    # are hours left) that has bookable slots per barber. slots_next/next_date
    # keep the FIRST available day for back-compat with older callers.
    next_date = next_label = None
    slots_next = {}
    book_days = []
    cands = []
    # Today first whenever the shop still has hours left — open now, or pre-open
    # (Friday 8am, doors at 9): "book in later today" before rolling forward.
    if start and now < parse_t(now, close or start):
        cands.append((now, "today"))
    # Then scan the whole week so a day with no bookable barbers (e.g. Blacksmith
    # on a Monday) rolls forward instead of dead-ending the chat. Every day with
    # slots is offered as its own pick — not just the first one.
    for i in range(1, 8):
        cands.append((now + timedelta(days=i), None))
    for nd, lbl in cands:
        nd_str = nd.strftime("%Y-%m-%d")
        nxt = fetch_times(f"/shops/{BOOKINGS_SHOP_ID}/seats/times/00:00/{nd_str}?services%5B%5D=5542", cap=8)
        if lbl == "today":  # belt-and-braces: never offer a time that's passed
            hm = now.strftime("%H:%M")
            nxt = {k: [t for t in v if t > hm] for k, v in nxt.items()}
        nxt = {k: v for k, v in nxt.items() if v}  # drop barbers off that day
        if nxt:
            lab = "Today" if lbl == "today" else nd.strftime("%A")
            book_days.append({"date": nd_str, "label": lab, "barbers": nxt})
            if not next_date:  # first available day = back-compat single day
                next_date, next_label, slots_next = nd_str, lab, nxt

    # Walk-in roster for the next open day — powers the bot's "Join tomorrow's
    # queue" capacity line ("X barbers on walk-ins tomorrow"). Barbers with any
    # available walk-in time at shop 421 tomorrow = who's rostered. Enhancement
    # only: wrapped so any failure never breaks the main feed.
    walkin_next = None
    try:
        if next_date:
            svc421 = next((s["id"] for v in (shop.get("prices") or {}).values()
                           for s in v if s.get("is_active", 1)), None)
            if svc421:
                wt = fetch_times(f"/shops/{SHOP_ID}/seats/times/00:00/{next_date}?services%5B%5D={svc421}")
                names = sorted(n for n, v in wt.items() if v)
                if names:
                    walkin_next = {"date": next_date, "label": next_label,
                                   "barbers": names, "count": len(names)}
    except Exception:
        pass

    # Blackrose salon (shop 422): services + the stylist's real availability so
    # both chats can book the salon in-flow (Jett 2026-06-12). Enhancement
    # only — any failure here must never break the main feed.
    SALON_IDS = [5297, 5301, 5305, 5306, 5308, 5309, 5310, 5316, 5317,
                 5318, 5319, 5355, 5356, 5357]
    salon = None
    try:
        sshop = fetch(f"/shops/{BLACKROSE_SHOP_ID}")["shop_details"]
        sstart, sclose = todays_hours(now, sshop.get("timings", []))
        by_id = {s["id"]: s for v in (sshop.get("prices") or {}).values() for s in v}
        s_slots, s_label, s_date = {}, None, None
        cands_s = []
        if sstart and not sshop.get("suspend") and now < parse_t(now, sclose):
            cands_s.append((now, "today"))
        # Full week for Sami so she books like any other barber (Beau 2026-07-05).
        for i in range(1, 8):
            cands_s.append((now + timedelta(days=i), None))
        s_days = []
        for nd, lbl in cands_s:
            nd_str = nd.strftime("%Y-%m-%d")
            stimes = fetch_times(f"/shops/{BLACKROSE_SHOP_ID}/seats/times/00:00/{nd_str}?services%5B%5D=5297", cap=8)
            if lbl == "today":
                hm = now.strftime("%H:%M")
                stimes = {k: [t for t in v if t > hm] for k, v in stimes.items()}
            stimes = {k: v for k, v in stimes.items() if v}
            if stimes:
                lab = "Today" if lbl == "today" else nd.strftime("%A")
                s_days.append({"date": nd_str, "label": lab, "slots": stimes})
                if not s_date:
                    s_slots, s_label, s_date = stimes, lab, nd_str
        salon = {
            "services": [{"id": i, "name": by_id[i]["name"], "cost": by_id[i]["cost"],
                          "mins": by_id[i]["average_time"]}
                         for i in SALON_IDS if i in by_id],
            "slots": s_slots, "label": s_label, "date": s_date,
            "days": s_days or None,
            "hours_today": f"{sstart[:5]}–{sclose[:5]}" if sstart else "closed today",
        }
    except Exception:
        pass

    snap = {
        "as_of": now.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "salon": salon,
        "open": is_open,
        "hours_today": f"{start[:5]}–{close[:5]}" if start else "closed today",
        # Shortest wait across barbers (0 = a chair is free now). Falls back
        # to SLIKR's shop-wide number if we somehow have no barber data.
        "wait_mins": (shortest if shortest is not None
                      else int(shop["wait_time"]) if shop.get("wait_time") is not None
                      else None) if is_open else None,
        # SLIKR's own shop-wide estimate, kept for comparison/debug.
        "slikr_wait": (int(shop["wait_time"])
                       if is_open and shop.get("wait_time") is not None
                       else None),
        "waiting": waiting if is_open else 0,
        # Walk-in-only wait (drives the "Join the Queue" live view): counts just
        # walk-in barbers, so an idle book-ahead barber never fakes "no wait".
        "walkin_wait": walkin_wait if is_open else None,
        "barbers_on": len(barbers) if is_open else 0,
        "barbers": barbers if is_open else [],
        "week": [{"day": t["day"], "start": t["start"][:5], "close": t["close"][:5]}
                 for t in shop.get("timings", []) if not t.get("suspend")],
        "next_date": next_date,
        "next_label": next_label,
        "slots_next": slots_next or None,
        "book_days": book_days or None,
        "walkin_next": walkin_next,
        # bookable menu (id/name/cost/mins per shop) — no PII, tiny
        "services": {
            "barber": [{"id": s["id"], "name": s["name"], "cost": s["cost"],
                        "mins": s["average_time"]}
                       for v in (shop.get("prices") or {}).values() for s in v
                       if s.get("is_active", 1)][:8],
            "bookings": SERVICES_BOOKINGS,
        },
    }
    return snap


def publish(snap: dict) -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, "queue.json")
    with open(path, "w") as f:
        json.dump(snap, f, separators=(",", ":"))
    # PII self-check before anything could ship: forbid phone/email-like blobs.
    # (if/raise, not assert — must survive python -O)
    import re
    blob = json.dumps(snap)
    if "@" in blob or re.search(r"\+?61\d{8,}|04\d{8}", blob):
        raise RuntimeError("PII leak guard tripped — snapshot NOT published")
    hook = os.path.join(HERE, "publish_remote.sh")
    if os.path.exists(hook):
        subprocess.run(["bash", hook, path], timeout=60, check=True)


def alert(msg: str) -> None:
    try:
        subprocess.run(
            ["curl", "-s", "-m", "10", "-d", msg,
             f"https://ntfy.sh/{NTFY_TOPIC}"], check=False)
    except Exception:
        pass


def should_skip(now: datetime) -> bool:
    """Outside (cached) shop hours ±45 min, only poll every 10th minute —
    keeps the after-hours 'opens 8am' state fresh without hammering SLIKR."""
    cache = os.path.join(OUT_DIR, "timings_cache.json")
    try:
        timings = json.load(open(cache))
    except (OSError, ValueError):
        return False
    start, close = todays_hours(now, timings)
    pad = timedelta(minutes=45)
    in_window = bool(start) and (
        parse_t(now, start) - pad <= now < parse_t(now, close) + pad)
    return (not in_window) and now.minute % 10 != 0


def main() -> int:
    now = datetime.now(TZ)
    if should_skip(now):
        return 0
    try:
        snap = build_snapshot()
        publish(snap)
        try:
            os.remove(FAIL_FLAG)
        except OSError:
            pass
        print(json.dumps(snap, indent=1))
        return 0
    except Exception as e:  # noqa: BLE001
        os.makedirs(OUT_DIR, exist_ok=True)
        n = 1
        try:
            n = int(open(FAIL_FLAG).read()) + 1
        except (OSError, ValueError):
            pass
        open(FAIL_FLAG, "w").write(str(n))
        # Stale-rule support: widget shows "call us" when as_of goes stale,
        # so on failure we deliberately publish NOTHING (never a wrong number).
        if n in (10, 60):  # ~10 min and ~1 hr of consecutive failures
            alert(f"Blacksmith queue poller failing x{n}: {e}")
        print(f"poll failed ({n}x): {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
