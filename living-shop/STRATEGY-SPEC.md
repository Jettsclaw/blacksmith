# STRATEGY-SPEC — Blacksmith Living Shop (locked 2026-06-11)

Strategy pass run against the Creator Army × Automaitions decision frame + the locked
build prompt (`~/scripts/claude-bridge-v2/incoming/blacksmith-living-shop-BUILD-PROMPT.md`)
+ `BRAND-CONTEXT.md`. This spec governs Phases 0–4. Locked decisions from Jett are
restated here verbatim-in-substance and are NOT re-litigable.

## 1. Dream buyer + awareness level
Gold Coast male, 18–45, within ~15 min of Biggera Waters, walks in or books SLIKR.
He is **solution-aware**: he knows he needs a cut and knows barbershops exist; his
real decision variables are (a) how long will I wait, (b) will I get someone good,
(c) does this place feel like mine. He is NOT reading copy — he's glancing.

## 2. The mechanism (what makes this not a gimmick)
**"See the shop live before you drive."** The Living Shop is a real-time, charming
miniature of the actual room driven by real SLIKR queue data. The unique mechanism
is *truthful liveness*: real barbers, real chairs, real wait time — rendered as a
game diorama nobody else on the Gold Coast has. It converts the #1 anxiety (the
unknown wait) into the #1 reason to engage the page.

This is the brand made literal: "More than a barbershop. We're family" → you can
see the family working, right now, from your phone.

## 3. Offer + conversion path (the section must SELL, not just charm)
- Primary CTA: tap a barber → live status card → **"Book with [name]"** → SLIKR
  deep link (Phase 3). The scene IS the booking funnel.
- Secondary: headline wait time + queue count = walk-in trigger ("only 10 min — go now").
- Measurement: barber-click → booking-started beacon (Phase 3). A section with no
  measurable offer path is a fail per the repo build contract.

## 4. Placement + format
Full-width section immediately after the hero on `site/` only (site-v2 = Beau's,
never touched). Lazy-loaded, static poster fallback, never degrades page load.
Feature-flagged until Jett approves each phase.

## 5. Style decision frame (Phase 0 — Jett's gate)
Two candidates, ONE polished frame each, same scene (faithful-direction floor plan,
3 barbers mid-cut, bench queue, live wait sign):
- **A: Hi-bit pixel** (Eastward/Stardew bar — premium-modern, not arcade-1990).
  Bet: charm + distinctiveness + tiny asset budget (PixiJS, <2MB).
- **B: Soft low-poly 3D** (Sims-like, gentle shadows, slow drift).
  Bet: premium-modern polish closer to the dark-editorial site (Three.js).
Decision criteria handed to Jett: which feels MORE Blacksmith (warm craft, not
flashy), which survives mobile scale-down, which he's proud to show barbers.
**His pick gates all engine work.**

## 6. Truth + privacy rails (non-negotiable, from the prompt)
- Staleness: show "as of HH:MM"; >5 min stale → "call for wait time" — never a
  wrong number presented as live.
- Zero client PII anywhere public: anonymous sprites, counts only; barbers by
  first name (per-barber de-name config flag built in from day one).
- SLIKR creds live on the Mac poller only; one-way Mac → cloud publish.

## 7. Brand tokens (verbatim from BRAND-CONTEXT.md)
Near-black `#0d0d0f` ground, panel `#141417`, paper `#f3f1ea`, gold `#c8a44d`
(+ light `#e3c578`), Oswald headlines / Inter UI. Scene mood: warm pools of light
in a dark room — the real shop's actual look (verified against `assets/photos/TLB_*.jpg`).

## 8. Phase order (value ships earliest)
0 style bake-off (gate) → 1 data spine + brand-styled live wait card (ships real
value alone) → 2 living scene in chosen style → 3 booking layer → 4 public
Telegram wait bot (templates only V1, security manifest in the build prompt).

## 9. Known asset inventory (kickoff shortcut)
On file already: shop photo set (`assets/photos/`), 5 barber headshots
(`assets/barbers/`: bayli, ben, jarred, jayden, locky). Still needed from Jett:
walkthrough video (exact floor plan), Mubarak + Sammi photos, SLIKR per-barber
booking link format.
