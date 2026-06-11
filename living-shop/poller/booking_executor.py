#!/usr/bin/env python3
"""Blacksmith in-chat booking executor.

The chat/bot drop validated booking REQUESTS into a private Vercel Blob store
(one-way: cloud holds no SLIKR credentials). This script — running on the Mac,
where the SLIKR key lives — picks requests up within seconds, re-validates,
creates the real SLIKR reservation, and writes a RESULT blob the chat polls.
Telegram-originated requests also get a direct bot confirmation message.

Request blob  req/<id>.json : {service_id, shop: barber|bookings, barber,
                               slot: "HH:MM"|"now", name, phone, tg_chat?}
Result blob   res/<id>.json : {ok, msg, time?, barber?}   (no PII beyond what
                               the requester themselves submitted)
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Australia/Brisbane")
BLOB_API = "https://blob.vercel-storage.com"
SLIKR = "https://api.slikr.com.au/api"
SHOPS = {"barber": 421, "bookings": 1121}
JWT = open(os.path.expanduser("~/.claude/blacksmith_weekly/.slikr_jwt")).read().strip()
BLOB_TOKEN = open(os.path.expanduser("~/.config/blacksmith-bot/blob_token")).read().strip()
BOT_TOKEN = open(os.path.expanduser("~/.config/blacksmith-bot/token")).read().strip()
VALID_SERVICES = {421: {1391, 4910, 1437, 1517},
                  1121: {5542, 5588, 5553, 5589, 5551, 5549}}


def http(url, method="GET", data=None, headers=None, timeout=20):
    req = urllib.request.Request(url, method=method)
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    body = None
    if data is not None:
        body = data if isinstance(data, bytes) else json.dumps(data).encode()
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, body, timeout=timeout) as r:
        return r.read()


def blob_list(prefix):
    out = http(f"{BLOB_API}/?prefix={urllib.parse.quote(prefix)}",
               headers={"Authorization": f"Bearer {BLOB_TOKEN}"})
    return json.loads(out).get("blobs", [])


def blob_get(url):
    return json.loads(http(url, headers={"Authorization": f"Bearer {BLOB_TOKEN}"}))


def blob_put(path, obj):
    http(f"{BLOB_API}/{path}", "PUT", json.dumps(obj).encode(),
         {"Authorization": f"Bearer {BLOB_TOKEN}",
          "x-content-type": "application/json",
          "x-add-random-suffix": "0"})


def blob_del(url):
    http(f"{BLOB_API}/delete", "POST", {"urls": [url]},
         {"Authorization": f"Bearer {BLOB_TOKEN}"})


def slikr(path, method="GET", data=None):
    try:
        return json.loads(http(f"{SLIKR}{path}", method, data,
                               {"Authorization": f"Bearer {JWT}"}))
    except urllib.error.HTTPError as e:
        # SLIKR returns business failures as 4xx with a JSON body
        try:
            return json.loads(e.read())
        except Exception:
            raise e


def find_or_create_user(name, phone):
    ph = "+61" + phone.lstrip("0") if phone.startswith("0") else phone
    got = slikr(f"/users/get?phone={urllib.parse.quote(ph)}")
    users = got.get("user") or []
    if users:
        return users[0]["id"]
    first = name.split(" ")[0][:30].title()
    last = " ".join(name.split(" ")[1:])[:30].title()
    made = slikr("/users", "POST", {
        "first_name": first, "last_name": last, "phone": ph,
        "timezone": "Australia/Brisbane", "user_type": "visitor"})
    uid = (made.get("user") or {}).get("id")
    if not uid:
        raise RuntimeError("could not create customer")
    return uid


def barber_id_for(shop_id, first_name):
    for b in slikr(f"/shops/{shop_id}/barbers").get("barbers", []):
        if (b["user"]["first_name"] or "").strip().lower().startswith(first_name.lower().split(" ")[0]):
            return b["id"]
    return None


def telegram(chat_id, text):
    try:
        http(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", "POST",
             {"chat_id": chat_id, "text": text})
    except Exception:
        pass


def process(req):
    name = re.sub(r"[^a-zA-Z '\-]", "", str(req.get("name", "")))[:40].strip()
    phone = re.sub(r"\D", "", str(req.get("phone", "")))
    shop_key = req.get("shop")
    sid = int(req.get("service_id", 0))
    barber = str(req.get("barber", ""))[:30]
    slot = str(req.get("slot", "now"))[:5]

    if not name or not re.fullmatch(r"(04\d{8}|614\d{8})", phone):
        return {"ok": False, "msg": "That mobile number doesn't look right — double-check and try again."}
    if shop_key not in SHOPS or sid not in VALID_SERVICES[SHOPS[shop_key]]:
        return {"ok": False, "msg": "That service isn't available — start again from the menu."}
    shop_id = SHOPS[shop_key]

    bid = barber_id_for(shop_id, barber) if barber and barber != "any" else 0
    if barber and barber != "any" and not bid:
        return {"ok": False, "msg": f"{barber} doesn't take bookings on that book — pick another barber."}

    payload = {"user_id": find_or_create_user(name, phone), "type": "web",
               "enable_sms_remind": 1, "add_purchase": 1,
               "barber_id": bid or 0, "discount_id": 0, "track_code": "livingshop",
               "services": [{"id": sid, "performer_id": bid or 0, "quantity": 1, "num": 1}]}
    if slot != "now" and re.fullmatch(r"\d{2}:\d{2}", slot):
        local = datetime.now(TZ).replace(hour=int(slot[:2]), minute=int(slot[3:]),
                                         second=0, microsecond=0)
        payload["requested_time"] = local.astimezone(ZoneInfo("Etc/UTC")).strftime("%Y-%m-%d %H:%M")

    out = slikr(f"/shops/{shop_id}/reservations", "POST", payload)
    if out.get("status") != "success":
        return {"ok": False, "msg": out.get("msg") or "SLIKR couldn't take that booking — try another time."}
    res = out.get("reservation") or {}
    when = (res.get("reported_wait_time") or slot or "now")[:5]
    return {"ok": True, "msg": "Booked", "time": when, "barber": barber or "first available"}


def main():
    blobs = blob_list("req/")
    if not blobs:
        return 0
    for b in blobs[:10]:
        rid = b["pathname"].split("/")[-1].replace(".json", "")
        if not re.fullmatch(r"[a-z0-9-]{8,40}", rid):
            blob_del(b["url"])
            continue
        try:
            req = blob_get(b["url"])
            result = process(req)
        except Exception as e:  # noqa: BLE001
            result = {"ok": False, "msg": "Something hiccuped — call us on 0479 087 782 and we'll book you in."}
            print(f"req {rid} error: {e}", file=sys.stderr)
        blob_put(f"res/{rid}.json", result)
        if req.get("tg_chat"):
            telegram(req["tg_chat"],
                     ("✅ You're booked — " + result.get("time", "") + " with " +
                      result.get("barber", "") + ". See you then!") if result["ok"]
                     else "❌ " + result["msg"])
        blob_del(b["url"])
        print(f"req {rid}: {result['ok']} {result.get('time','')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
