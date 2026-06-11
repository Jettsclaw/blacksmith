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

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "timings_cache.json"), "w") as f:
        json.dump(shop.get("timings", []), f)

    start, close = todays_hours(now, shop.get("timings", []))
    is_open = (bool(start) and not shop.get("suspend")
               and parse_t(now, start) <= now < parse_t(now, close))

    # Who is rostered on a seat today: any seat slot that is a real
    # reservation/break (not the full-day "closed" block) names its barber.
    on_today = {}  # barber_id -> first name (from slot performer ids)
    for seat in seats.values():
        for slot in seat.get("time_slots", []):
            if slot.get("type") != "closed" and slot.get("performer_barber_id"):
                on_today[slot["performer_barber_id"]] = None

    # Live activity. Walk-in queue (421) drives BOTH waiting count and cutting;
    # bookings (1121) drive cutting/on-today only — an appointment at 4pm is
    # not someone waiting on the couch now.
    waiting = 0
    cutting_ids = set()
    for src, counts_waiting in ((queue, True), (bookings, False)):
        for r in src:
            status = r.get("status")
            if status in ("completed", "cancelled", "no_show"):
                continue
            res = r.get("reservation") or {}
            barber = res.get("barber") or {}
            bid = r.get("performer_barber_id") or barber.get("id")
            name = (barber.get("first_name") or "").strip().title()
            if bid:
                # Barber ids differ per shop — key the merged map by NAME when
                # we have one (Jarred has a different id in 421 vs 1121).
                key = name or bid
                on_today.setdefault(key, None)
                if name:
                    on_today[key] = name
            st = parse_t(now, r["start_time"])
            if status in ("in_progress", "processing", "started"):
                cutting_ids.add(name or bid)
            elif (counts_waiting and status == "pending"
                  and st <= now + timedelta(minutes=WAITING_HORIZON_MIN)):
                # Includes late-running queues: a pending whose estimated
                # start has slipped past is still someone waiting in the shop.
                waiting += 1

    # Fill names for rostered-but-quiet barbers from the shop roster, then
    # merge id-keyed (seat roster) and name-keyed (live activity) entries.
    roster = {b["id"]: (b.get("user") or {}).get("first_name", "").strip().title()
              for b in shop.get("barbers", []) if b.get("is_active")}
    merged = {}
    for key in on_today:
        name = on_today[key] or roster.get(key)
        if not name:
            continue
        cutting = key in cutting_ids or name in cutting_ids
        merged[name] = merged.get(name, False) or cutting
    barbers = [{"name": n if SHOW_BARBER_NAMES else "Barber", "cutting": c}
               for n, c in merged.items()]
    barbers.sort(key=lambda b: (not b["cutting"], b["name"]))

    snap = {
        "as_of": now.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "open": is_open,
        "hours_today": f"{start[:5]}–{close[:5]}" if start else "closed today",
        # SLIKR's own estimate — the same number their app shows. Never invent
        # one: if SLIKR gives nothing, publish null (widget says "call us").
        "wait_mins": (int(shop["wait_time"])
                      if is_open and shop.get("wait_time") is not None
                      else None),
        "waiting": waiting if is_open else 0,
        "barbers_on": len(barbers) if is_open else 0,
        "barbers": barbers if is_open else [],
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
