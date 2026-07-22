# VERIFY-REPORT — Blacksmith Barbers · Spin-to-Win

**Asset:** `site/spin-to-win.html` → https://blacksmith-site-chi.vercel.app/site/spin-to-win.html
**Date:** 2026-07-16 · **Verifier:** independent adversarial pass (Playwright, headless Chromium, real live staging URL)
**Verdict:** ✅ PASS as a preview on staging. NOT production-ready (see caveat).

## How it was tested (real execution)
Drove the **live staging URL** in headless Chromium — clicked interactions, not static checks.

| # | Check | Method | Result |
|---|---|---|---|
| 1 | Page + assets live | `curl` staging alias | page 200; `bs-logo.png` 200; `logo-topbar.png` 200 ✅ |
| 2 | Wheel + branding render | 2× device-scale screenshot | 8 brass/black segments, blackletter wordmark, B-emblem hub, gold pointer all present ✅ |
| 3 | Missing name blocked | clicked SPIN empty | "Pop your first name in." ✅ |
| 4 | Invalid mobile blocked | name only, clicked SPIN | "Need a valid mobile to text your perk." ✅ |
| 5 | Valid entry spins → outcome | filled Beau / 0412345678, spun | win view shown; landed NEXT TIME → "Not this time", code hidden (no-luck path renders correctly) ✅ |
| 6 | Weighting correct | sampled `pick()` 4000× in-page | beard/hot-towel highest, free-cut ~3%, NEXT TIME ~4% — matches spec ✅ |
| 7 | Mobile layout | 390px screenshot | single-column stack, fields stack, readable ✅ |
| 8 | JS errors | `pageerror` listener full flow | none ✅ |

Distribution (4000 draws): beard 902, hot-towel 809, $15-off 644, product 522, line-up 511, priority 340, NEXT TIME 155, free cut 117.

## Adversarial findings
- **Codes are placeholders** (`BSBEARD` etc.), **no SMS send, no DB write, no one-spin enforcement** — a user can refresh and re-spin. Single blocking gap before live; flagged in STRATEGY-SPEC scope. Correct for a preview.
- **Deploy target = staging project**, not the live `blacksmith` project — deliberate (preview only). Live embed must target the correct project per memory [[blacksmith-deploy-target]].
- **cleanUrls not enabled** on this project → the working URL needs the `.html` extension (`/site/spin-to-win.html`). Fine for a demo link; tidy on production embed.
- Fonts use Oswald/Inter web families (no locked Blacksmith type in brand memory) — acceptable; revisit if Jett locks brand fonts.
- Did not clobber the existing `STRATEGY-SPEC.md` / `VERIFY-REPORT.md` (those document the June Living Shop build) — this spin-to-win pass is filed under the `-spin-to-win` suffix.

## Bottom line
On-brand (black + brass, blackletter wordmark, B-emblem hub), renders correctly, validates name + mobile, spins to a weighted value-add perk, no-luck path handled, mobile clean, zero JS errors, and — critically — respects the brand's no-cheap-cut rule. Honest status = **verified staging demo**, one clear gap (real perk fulfilment + SMS capture + live target) before it's a live funnel.
