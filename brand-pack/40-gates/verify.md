# Blacksmith verify gate — run before "done", no exceptions

## 1. Machine gate
`bash brand-pack/40-gates/verify.sh <files>` — em-dash, banned strings (negation-aware
for "unlimited"), hex whitelist, font whitelist (Oswald/Inter/Scotland only), gold
discipline warn, logo-as-file. FAIL = back to build. WARNs go to the blind judge.
Bot copy and poster text run through the same gate as .txt/.md — string checks apply.

## 2. Blind judge (never grade your own homework)
Separate agent, given ONLY: the artifact (URL/file) + `00-HARD-RULES.md` + the pre-plan.
Instruction: "Find where this breaks brand or won't convert. Default to breaking it."
Judge specifically checks: proof is real (reviews/barbers/prices traceable to voc.md,
offer.md, or live SLIKR), gold used as accent not field, dark-mode discipline
(Blackrose light theme on Blackrose surfaces only), contractor-not-employee wording,
no competitor named, structure differs from previous build.

## 3. Circle-page rules — any Circle conversion surface [HARD]
- Identity-first: the tier headline sells the identity ("Your name on the wall."),
  the price follows. Never price-first, never savings-first.
- Founding scarcity stated plainly with REAL numbers from offer.md (first 30/75/100);
  no countdowns, no invented "spots left".
- Exactly ONE CTA, and it books the CALL / captures the qualify form — the page never
  pretends to self-serve-close Empire (Phase 0 is human-closed).
- Tier names always "The Cut / The Club / The Empire".

## 4. Booking-surface rules — site pages [HARD]
- "Book a Cut" → `#book` (in-site chat) reachable from hero + nav on every page.
  The sticky bottom bar was removed site-wide (Beau 2026-07-07) — never re-add it.
- No customer-facing SLIKR links or mentions (backend-only since 2026-07-06);
  booking = in-site chat + Telegram wait-bot.
- Wait times / prices shown = live feed data, never hardcoded stale numbers.
- Barber display names as shipped ("Sami", not "Sammi").

## 5. Log it
Append to `20-references/build-log.md`: date · asset · direction · URL.
