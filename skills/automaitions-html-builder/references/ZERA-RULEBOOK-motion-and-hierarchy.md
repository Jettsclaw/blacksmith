# ZERA RULEBOOK — Motion & Hierarchy

A consistency reference for any HTML/web build. Follow it; don’t re-derive. Numbers are locked defaults — deviate only with a stated reason.

-----

## 0. The one rule above all

**Motion is felt, not noticed.** If an animation only exists to look cool, cut it. Premium = restraint. Showy = amateur. When unsure, do less.

-----

## 1. Animation timings (locked)

|Move                        |Duration   |Easing                       |Notes                       |
|----------------------------|-----------|-----------------------------|----------------------------|
|Section reveal (fade + rise)|0.55s      |`cubic-bezier(0.22,1,0.36,1)`|the workhorse               |
|Stagger child               |0.40s      |same                         |+0.06s delay per child      |
|Hero line reveal (SplitText)|0.85s      |`power3.out`                 |stagger 0.12s, delay 0.2s   |
|Stat counter                |1.8s       |`power2.out`                 |fire once, on enter         |
|Parallax                    |scrub `1.5`|`none`                       |position-linked, never timed|
|Progress bar                |scrub `0`  |`none`                       |tied to page scroll         |
|Hover state                 |0.15s      |`ease`                       |snappy, desktop pointer only|
|Nav drawer open             |0.35s      |`power2.out`                 |close 0.30s `power2.in`     |

**Reveal distance:** section `y: 20px`, stagger child `y: 12px`. Small. Big slides feel cheap.

**Stagger step:** 0.06s default (0.04–0.08 range). Above 0.10s drags.

-----

## 2. Easing logic

- **Reveals / entrances** → ease-OUT (fast in, soft land). `power2.out`, `power3.out`, or the cubic above.
- **Exits** → ease-IN (`power2.in`).
- **Scrubbed (parallax/progress)** → `none`. Always. Eased scrub feels broken.
- **One** custom ease per page max, hero only, if you want a signature feel. Otherwise stock.

-----

## 3. Motion tiering — apply by tier, not by availability

The trap is stacking every effect on one page. Budget: **never more than ~4 active systems.**

- **Tier 1 — always:** Lenis smooth scroll · section reveals · stagger · progress bar.
- **Tier 2 — hero only:** SplitText line-mask. One showpiece, top of page, then restraint.
- **Tier 3 — selective:** stat counters (max 2–3, only on real numbers) · parallax (only on elements with genuine depth — never flat cards) · DrawSVG on actual line-work.
- **Tier 4 — propose first:** Flip, MotionPath, Draggable sliders, Observer gestures. Significant decisions — get approval.
- **Tier 5 — cut by default:** word-reveal on every heading (the #1 overused tell) · typewriter · background colour fades · counters on ranges/labels · parallax on flat cards.

Quality test per effect: *does this make the content clearer or land harder?* If “it’d just look cool” → cut.

-----

## 4. Critical motion gotchas (these cause silent breakage)

1. **Never `gsap.from()` when CSS sets `opacity:0`.** It animates 0→0; nothing appears. Use a `classList.add('in')` toggle to fire the CSS transition instead.
1. **SplitText clips descenders** (g, y, p, j, q). Always add the mask `padding-bottom: 0.15em; margin-bottom: -0.15em` fix.
1. **SplitText vs `text-wrap: balance` conflict.** Strip `balance` from any split heading. Tag balance-kept headings `data-no-split`.
1. **Never combine `scrub` + `toggleActions`** on one trigger. Scrub = position-linked; toggleActions = play/reverse. Pick one.
1. **Always wrap motion in `prefers-reduced-motion`.** On reduce: everything visible, zero transforms, zero transitions.
1. **Progressive enhancement:** content visible without JS. Add a `.js` class to `<html>`; hide-before-reveal only under `.js`.

-----

## 5. Text hierarchy (locked scale)

All sizes `clamp()` except body and below (fixed, for accessibility).

|Role           |Size                      |Family|Line-height|Tracking  |
|---------------|--------------------------|------|-----------|----------|
|Hero title     |`clamp(34px, 7vw, 58px)`  |Serif |1.08       |-.015em   |
|Section heading|`clamp(26px, 4.5vw, 38px)`|Serif |1.1        |-.015em   |
|Sub-heading    |`clamp(20px, 3vw, 28px)`  |Sans  |1.25       |0         |
|Stat number    |`clamp(28px, 4vw, 36px)`  |Serif |1          |0         |
|Body           |`16px` fixed              |Sans  |1.8        |0         |
|Body secondary |`14–15px` fixed           |Sans  |1.7        |0         |
|Label/caption  |`13px` fixed              |Sans  |1.2        |0         |
|Eyebrow        |`9px` fixed               |Sans  |1.2        |.22em CAPS|

**Display vs body:** one serif for hero/headings/pull-quotes/stat-numbers, one sans for everything else. Don’t introduce a third family.

**Body is always ≥16px.** Never shrink body text for “elegance” — it’s an accessibility floor.

**`text-wrap: balance` on all headings, never on body** (kills widows on headings; hurts perf on paragraphs).

-----

## 6. Hierarchy pairings (what goes with what)

- **Eyebrow + heading:** eyebrow in `accent-lo` (never full accent — too loud), all-caps, wide-tracked, sits above the heading. Optional `01 · SECTION` number with a hairline rule trailing to full width.
- **Heading emphasis:** italic + accent colour on the key phrase (`<em>`), nothing else. One emphasis per heading.
- **Body emphasis:** `<strong>` lifts to the brightest text colour + weight 600. Sparingly.
- **Pull quote:** serif italic, one step up from body, accent-hi colour, generous line-height (1.65). One per section max.
- **Stat:** big serif number + tiny caps label beneath. Number does the talking; label whispers.

-----

## 7. Spacing & rhythm

- **Fluid spacing:** `clamp()` on all significant padding/gap, same as type. No fixed section padding.
- **Vertical rhythm:** body paragraphs `margin-bottom: 18px`, last child 0.
- **Measure:** body column max ~65–75 characters. Wider hurts readability; that’s why a brief widens to a *sidebar + content* layout on desktop, not one giant column.
- **One accent, used little.** Accent is for emphasis, borders, one CTA — not paragraphs of coloured text. The restraint is the premium signal.

-----

## 8. Colour discipline

- **5 accent tokens minimum:** `--accent`, `--accent-hi`, `--accent-lo`, `--accent-dim`, `--line-acc`. Derive, don’t eyeball.
- **Light surfaces:** never put bright `--accent` as text (fails contrast). Use `--accent-dim` (darkened to WCAG AA 4.5:1) for any accent *text*; keep `--accent` for fills/borders only.
- **Body text passes WCAG AA (≥4.5:1).** Non-negotiable.
- **Surface is a choice, not a default.** Dark, light, warm, cool all valid — but pick one and let it drive type, borders, nav, scroll indicator consistently.

-----

## 9. Build order (layer discipline — never blend layers)

Structure → Motion → Interaction → Polish. One layer at a time, finish before the next.

1. Tokens (`:root` colour + spacing)
1. Structure + content (semantic HTML, `.reveal`/`.stagger` classes applied, stats tagged `data-target`)
1. Responsive (mobile-first, breakpoints ascending)
1. Motion layer (Tier 1 first, then up only as justified)
1. Interaction (nav, any Tier 4)
1. Polish + checklist

Diagnose before changing. If you’re iterating on the wrong layer, stop and name it.

-----

## 10. Platform reality

- **iOS Quick Look / `file://` blocks all JS.** No GSAP, no Lenis, nothing. Use CSS `@keyframes` load-time animation, or host it (Vercel deploy = 30s). Always prefer hosting.
- **Lenis on touch:** consider native momentum on mobile (`smoothTouch: false`) — fighting iOS scroll usually causes more problems than it solves.
- **Verify volatile facts before trusting them:** library latest-version, browser feature support (e.g. CSS scroll-driven animation isn’t in stable Safari yet). These rot — check, don’t assume.

-----

*One engine, consistent output. When a build wants to break a rule, that’s a decision to state out loud — not a default to drift into.*