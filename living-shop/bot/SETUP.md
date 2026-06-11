# Blacksmith wait-time bot — go-live (≈5 min, needs Jett)

V1 is templates-only (no LLM — instant, free, can't hallucinate, can't be
prompt-injected). Its whole universe = the public queue.json + the copy in
webhook.js. Security manifest in STRATEGY-SPEC.md / the build prompt.

## Jett's two inputs
1. **Bot token** — Telegram → @BotFather → `/newbot` → name it (e.g.
   "Blacksmith Barbers — Live Wait", username like `BlacksmithWaitBot`).
   ⚠️ BRAND-NEW token. Never reuse/share Winston's or Beatrice's anything.
2. **Vercel access** — `npx vercel login` on the Mac (Winston drives after).

## Winston's deploy steps (after the above)
```bash
cd ~/Projects/blacksmith-site/living-shop/bot
npx vercel link   # new project: blacksmith-wait-bot
npx vercel env add BOT_TOKEN        # paste BotFather token
npx vercel env add WEBHOOK_SECRET   # openssl rand -hex 24
npx vercel deploy --prod
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<prod-url>/api/webhook" \
  -d "secret_token=<WEBHOOK_SECRET>"
```
Then test: /start in the bot → 4 buttons (Wait time · Who's on · Join queue ·
Hours & parking). Set the bot's avatar to the Blacksmith logo (BotFather
`/setuserpic`, file in `assets/logo-black.png` on white or gold).

## After it's live
- QR card for the front-desk mirror ("Wait times on your phone") — Winston
  generates once the bot username exists.
- IG bio link + pin in the barbers' group.
- V2 (only if V1 earns it): "tell me when wait < 15" subscriptions + a
  Haiku-tier LLM for free-form questions with feed+FAQ context only.

## Copy to confirm with Jett
- "🅿️ Free parking out front." — confirm wording.
- Phone in replies: 0479 087 782 (shop). Address: 9 Gateway Drive, Biggera Waters.
