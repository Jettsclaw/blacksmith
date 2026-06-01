# Lessons Learned — Bugs, Gotchas & Regressions

The compounding memory of the skill. Every bug a previous build hit,
catalogued so the next build doesn't hit it twice.

---

## Rule — UPDATE THIS FILE

**When you encounter a bug, gotcha, or surprising behaviour that isn't
already catalogued here, ADD AN ENTRY after fixing it.** This is part
of every build's workflow, not optional.

Why:
- The 30-second cost of writing a learning saves a 30-minute debug
  next time, for you AND every future user of the skill.
- Patterns compound. A new entry today prevents a class of bug
  forever — across all installs of the skill.
- This file ships with the skill. Every install benefits from past
  mistakes.

### When to add an entry

Add one if any of these are true:

- You spent more than 10 minutes debugging something whose root cause
  wasn't obvious from reading the existing references.
- You found a CSS specificity / cascade / browser-rendering quirk that
  bit the build.
- A "documented" pattern from another reference file produced
  unexpected behaviour.
- You discovered that a previously-recommended fix doesn't fully
  resolve a problem (regression / partial fix).
- You hit a platform / device / browser quirk (iOS Safari is the
  usual suspect).

If the fix is just "I forgot the rule from `ZERA-RULEBOOK.md`" — read
that file better next time, don't add a learning. This file is for
discoveries, not skill-rule failures.

### Entry template

```
### N. Short symptom-style title

**Symptom:** What you see / what's wrong.

**Root cause:** Why it happens. Technical, not vague.

**Fix:** The exact code / CSS / pattern that resolves it.

**Why:** One-line takeaway for the next build.

**See also:** ZERA §X · reference-file.md · related entry N
```

---

## Announce-and-calibrate protocol — MANDATORY

You do NOT silently add entries to this file. Every time you log a
learning, you announce it in your reply to the user BEFORE writing it.
This gives them the chance to correct, expand, or veto the entry in
real time — the protocol calibrates with the user, not for them.

### The exact format

In the reply where you fix the bug, include this line:

```
📒 Logging this in lessons.md §<N> — <one-line summary of bug + fix>.
   So it doesn't recur on future builds.
```

Then write the entry. Then continue with whatever the user asked.

### Why this format

- **The 📒 marker** is a visible signal — the user can scan replies
  for new learnings being added.
- **One-line summary** gives them enough to react to without re-reading
  the whole entry.
- **The section number** lets them point at the exact entry to amend.
- **"So it doesn't recur"** reminds them what the doc is for.

### What the user can do in response

- **Correct it:** "actually call that 'Lenis touch handler conflict'
  not 'mobile scroll issue'" — you rename + rewrite.
- **Expand it:** "also note that the fix breaks in Firefox <120, add
  that" — you append the note to the entry.
- **Veto it:** "don't bother, that was a one-off" — you remove the
  entry. Not every bug needs a learning.
- **Approve silently:** no reply = entry stays as written.

### When to announce vs not

Announce when:
- You spent >10min on a debug whose root cause wasn't obvious from
  existing references.
- You found a specificity/cascade/browser quirk.
- A previous fix turned out to be incomplete.
- A platform/device quirk bit the build.

DON'T announce / DON'T add an entry when:
- The fix was "I forgot the rule from ZERA / tokens / components" —
  that's a skim-the-references failure, not a discovery.
- The bug is identical to an entry that already exists — link to the
  existing one instead.
- The user explicitly said "don't bother logging this".

### Worked example

> **User:** "the sticky pin isn't holding anymore"
>
> **Claude:** "Found it — `overflow: hidden` on `.splash` was breaking
> `position: sticky` on the pin children. Scoped overflow to
> `.hero.splash` only; pin sections lose their `::before` glow but
> sticky works again. Pushed as `0dc1a2a`.
>
> 📒 Logging this in lessons.md §3.1 — `.splash` with `overflow:
> hidden` silently breaks `position: sticky` descendants (browser
> ignores sticky inside scroll containers). So it doesn't recur on
> future builds.
>
> Anything else broken?"

User then either lets it land, redirects ("call it 'sticky scroll-
container trap' instead"), or vetoes ("don't log, that was an
artefact of how I added splash midway").

---

## Categories

1. Animation & Motion
2. CSS Specificity, Cascade & Override Traps
3. Splash / Branded Section Patterns
4. Sticky Pin Patterns
5. Stat Counter Patterns
6. Layout & Reflow
7. SVG / Logo Pipeline
8. Topbar & Navigation
9. Typography
10. Token / Palette Discipline
11. Platform Gotchas
12. Workflow / Skill Compliance (meta)

---

## 1 — Animation & Motion

### 1.1 `gsap.from()` doesn't show anything when CSS sets `opacity: 0`

**Symptom:** Hero title is visible (SplitText runs on load, no CSS hiding), but everything else is blank. Page looks half-loaded.

**Root cause:** `.js .reveal { opacity: 0 }` is set by CSS, then `gsap.from(el, {opacity: 0})` snapshots the current CSS state as its target. It animates from `opacity: 0` to `opacity: 0` — nothing appears.

**Fix:** Use `classList.add('in')` to trigger the CSS transition, not `gsap.from()`:
```js
ScrollTrigger.create({
  trigger: el, start: 'top 88%',
  onEnter:     () => el.classList.add('in'),
  onLeaveBack: () => el.classList.remove('in'),
});
```

**Why:** CSS `opacity: 0` already exists. GSAP's job is to TOGGLE the class, not duplicate the animation. The CSS transition handles duration/easing/delay.

**See also:** `animations.md` §Tier-1 · `ZERA §4.1`

### 1.2 Reveals flicker on fast scroll-up at the trigger boundary

**Symptom:** Scrolling up rapidly past a reveal trigger, the section fades out (CSS transition runs in reverse) and you see a brief flicker, especially with multiple reveals nearby.

**Root cause:** `onLeaveBack: () => el.classList.remove('in')` triggers the CSS transition in reverse direction. Each rapid scroll oscillation queues new transitions.

**Fix:** Bypass the CSS transition on leaveback with an instant `gsap.set`:
```js
ScrollTrigger.batch('.reveal', {
  start: 'top bottom-=10%',
  onEnter: batch => {
    gsap.set(batch, { clearProps: 'opacity,transform' });
    batch.forEach(el => el.classList.add('in'));
  },
  onLeaveBack: batch => {
    batch.forEach(el => el.classList.remove('in'));
    gsap.set(batch, { opacity: 0, y: 20, overwrite: true });
  }
});
```

**Why:** Instant `gsap.set` snaps state with no animation. User is moving away — they don't see the snap. Next scroll-down replays cleanly.

**See also:** entry 1.1 · `animations.md`

### 1.3 Counter counts DOWN instead of UP

**Symptom:** Stat shows the target value briefly, then animates down to 0.

**Root cause:** `gsap.from({val: 0}, {val: target, ...})` reads the current state of the target object (`val: 0`) and animates *from* `val: target` *to* the current state. So it goes target → 0.

**Fix:** Use `gsap.to`, not `gsap.from`:
```js
const obj = { val: 0 };
el.textContent = fmt(0);
gsap.to(obj, {
  val: target, duration: 1.8, ease: 'power2.out',
  onUpdate: () => { el.textContent = fmt(obj.val); },
  onComplete: () => { el.textContent = fmt(target); },
  scrollTrigger: { trigger: el, start: 'top 85%', once: true }
});
```

**Why:** `gsap.from` animates *toward* current state; `gsap.to` animates *toward* the values you specify. Not interchangeable.

**Note:** `animations.md` Tier 3 example uses `gsap.from({val:0}, ...)` — that example is wrong. This entry is the corrected pattern.

### 1.4 SplitText hero shifts after load (font swap)

**Symptom:** Hero title renders, then shifts position by a noticeable amount within ~200ms.

**Root cause:** SplitText measures synchronously. If the web font (DM Serif Display) hasn't loaded yet, it splits using the fallback font's metrics, then re-flows when the real font swaps in.

**Fix:** Wait for `document.fonts.ready` before splitting:
```js
document.fonts.ready.then(() => {
  const s = SplitText.create(heroTitle, { type: 'lines', mask: 'lines' });
  gsap.from(s.lines, { yPercent: 100, opacity: 0, duration: 0.85,
    stagger: 0.12, ease: 'power3.out', delay: 0.2, overwrite: true });
  ScrollTrigger.refresh();
});
```

**See also:** ZERA §1 (locked SplitText timings)

### 1.5 ScrollTrigger thresholds wrong after font/SplitText reflow

**Symptom:** Reveals fire at the wrong scroll positions. Some never fire.

**Root cause:** Web font loading AND SplitText DOM insertion both reflow the page, shifting element positions. ScrollTrigger caches positions at startup.

**Fix:** Call `ScrollTrigger.refresh()` after fonts load AND after SplitText runs.

### 1.6 Reveals fire too late — content pops in after it's already visible

**Symptom:** You see a section's top, then it fades in. Should fade in *as* it enters.

**Root cause:** `start: 'top 88%'` fires when element top is at 88% of viewport — already 12% into view.

**Fix:** `start: 'top bottom-=10%'` — fires when top is 10% into view from below.

### 1.7 `scrub: true` lags behind scroll (feels "caught up")

**Symptom:** A scrubbed animation visibly lags scroll input on mobile. Bar fills late, jumps to catch up.

**Root cause:** `scrub: true` adds 1s smoothing by default. On mobile + Lenis, this compounds with Lenis lerp into noticeable lag.

**Fix:** Use `scrub: 1` (integer = explicit seconds of smoothing) or `scrub: 0` (no smoothing, immediate). The sticky-pin canonical pattern uses `scrub: 1`.

**Why:** Direct integer scrub is predictable. `true` defaults can shift between GSAP versions.

**See also:** `motion-deep-dives/sticky-pin-pattern.md`

### 1.8 Animating `width: 0% → 100%` causes mobile jank

**Symptom:** A scrubbed progress bar feels jumpy on mobile, worse on long scrub timelines.

**Root cause:** Animating `width` triggers layout EVERY frame — the browser recalculates layout for the bar AND every sibling. Combined with a `filter: blur()` somewhere else in the section, mobile GPU drops frames.

**Fix:** Animate `transform: scaleX(0 → 1)` instead. Set the bar to `width: 100%; transform: scaleX(0); transform-origin: 0 50%; will-change: transform`. GSAP composites the transform on the GPU layer — no layout, no paint.

**Why:** `width` = layout. `transform` = compositor. Compositor is ~10-50x cheaper.

### 1.9 Eased scrub feels broken

**Symptom:** Scrubbed timeline tweens have visible easing curve as you scroll, looks "off".

**Root cause:** Scrubbed animation = position-linked to scroll. User scroll input is linear. Adding `ease: 'power1.inOut'` to a tween inside a scrubbed timeline makes that tween non-linear vs scroll position — perceptually broken.

**Fix:** All tweens inside a scrubbed timeline use `ease: 'none'`. Always. (ZERA §2 locks this.)

**See also:** ZERA §2

---

## 2 — CSS Specificity, Cascade & Override Traps

### 2.1 `.splash p` ignored — `.hero p.lead` wins by specificity

**Symptom:** Adding `.splash p { color: var(--tx-on-splash) }` to make hero text white on indigo bg — body text stays dark.

**Root cause:** CSS specificity. `.hero p.lead` = (0, 0, 2, 1). `.splash p` = (0, 0, 1, 1). The two-class selector wins regardless of source order.

**Fix:** Use higher-specificity overrides, scoped to the splash variant:
```css
.hero.splash p.lead          { color: var(--tx-on-splash-2); }  /* 0,3,1 */
.hero.splash p.lead strong   { color: var(--tx-on-splash); }    /* 0,3,2 */
.hero.splash p.lead em       { color: var(--tx-on-splash); }    /* 0,3,2 */
.hero.splash .hero-meta      { color: var(--tx-on-splash-2); }
.hero.splash .hero-meta span strong { color: var(--tx-on-splash); }
```

**Why:** `.hero.splash` chains two classes on the same element → +1 class to specificity → beats `.hero p.lead`. Always write splash overrides with the same depth as the base rule, plus one.

**Diagnostic shortcut:** if your override "didn't work", open DevTools → Computed → see which rule is winning. The cascade tells you what specificity you need to beat.

### 2.2 `background-clip: text` gradient won't drop on element style alone

**Symptom:** Trying to disable gradient text via `style="color: var(--accent)"` — text stays transparent.

**Root cause:** `-webkit-text-fill-color: transparent` (set by the gradient rule) overrides `color`. You can't undo gradient text by setting `color` alone.

**Fix:** Reset BOTH:
```css
.counter-num.counting {
  -webkit-text-fill-color: var(--accent);  /* override the transparent */
  background: none;                          /* drop the gradient */
}
```

**Why:** Gradient text = `background: linear-gradient(...)` + `background-clip: text` + `-webkit-text-fill-color: transparent`. To turn it off, neutralise the fill-color override AND drop the background.

### 2.3 Em inside `.splash` keeps its indigo gradient → invisible on indigo bg

**Symptom:** Hero h1 em on splash bg shows the indigo-on-indigo gradient text — barely visible.

**Root cause:** `.hero h1 em` rule (the gradient) has higher specificity than `.splash em`.

**Fix:** Add explicit overrides for em inside splash:
```css
.splash h1 em, .splash h2 em, .splash em, .splash .em {
  background: none;
  background-clip: initial;
  -webkit-background-clip: initial;
  -webkit-text-fill-color: currentColor;
  color: inherit;
}
```

**Why:** Inside `.splash` the inherited colour is white (`--tx-on-splash`). Setting `color: inherit` + unsetting the gradient lets em render as italic white.

---

## 3 — Splash / Branded Section Patterns

### 3.1 `.splash` with `overflow: hidden` breaks `position: sticky` children

**Symptom:** A `position: sticky` element inside `.splash` (e.g. pin-outer or combo-outer) silently stops locking. Sticky behaviour is gone.

**Root cause:** When `.splash` sets `overflow: hidden` (needed to contain the `::before` radial glow), the browser treats it as a scroll container. `position: sticky` children stick within that container's bounds, not the viewport — effectively disabled.

**Fix:** Scope `overflow: hidden` to `.hero.splash` only (no sticky children). Long brand-moment sections (`.pin-outer.splash`, `.combo-outer.splash`) get the splash gradient and rounded corners but NO overflow:hidden and NO ::before glow.

```css
.splash { background: ...; color: ...; position: relative; isolation: isolate; }
.hero.splash { overflow: hidden; }
.hero.splash::before { /* radial glow */ ... }
.pin-outer.splash, .combo-outer.splash { /* margin + border-radius only */ }
```

**Why:** Cardinal rule — never put `overflow: hidden` on an ancestor of a `position: sticky` element. (Also see entry 4.1.)

**See also:** `motion-deep-dives/sticky-pin-pattern.md` anti-patterns

### 3.2 Contained splash with rounded corners — sticky-friendly approach

**Pattern:** When you want a splash section to feel like a contained brand card (margin + border-radius) AND contain a sticky child:

- Add `margin` and `border-radius` to the outer
- DO NOT add `overflow: hidden`
- DO NOT use a `::before` pseudo with `inset: -20%` (it'd spill outside the rounded corners)
- If you need atmosphere, use a `background: radial-gradient(...)` directly on the splash bg layer

```css
.pin-outer.splash {
  margin: clamp(12px, 2.5vw, 28px);
  border-radius: clamp(20px, 3vw, 32px);
  /* no overflow:hidden, no ::before */
}
```

### 3.3 Splash sections need explicit overrides for nested wrappers

The base `.splash h1, .splash h2, .splash p { color: var(--tx-on-splash) }` doesn't cover wrapper divs like `.pin-headline`, `.combo-text`, `.hero-meta`. Spell them out:

```css
.splash .pin-headline,
.splash .combo-text { color: var(--tx-on-splash); }
.splash .pin-sub-wrap,
.splash .hero-eyebrow,
.splash .sec-num,
.splash .pin-eyebrow-wrap,
.splash .hero-meta,
.splash .combo-text .word,
.splash .demo-use { color: var(--tx-on-splash-2); }
```

---

## 4 — Sticky Pin Patterns

### 4.1 `pin: true` fights Lenis — visible stutter

**Symptom:** A scroll-pinned section (`ScrollTrigger.create({ pin: true })`) jitters once per scroll event. Worse on trackpad.

**Root cause:** GSAP's `pin: true` writes transform to parent every frame. Lenis ALSO writes transform every frame for smooth scroll. Two systems → fight → tear.

**Fix:** Never use `pin: true`. Use native CSS `position: sticky`:

```css
.pin-outer  { height: 300vh; position: relative; }   /* runway */
.pin-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
```

Then GSAP only drives the CROSSFADE *inside* the pinned area:
```js
gsap.timeline({
  scrollTrigger: { trigger: '.pin-outer', start: 'top top',
                   end: 'bottom bottom', scrub: 1 }
}).to('.swap-a', { opacity: 0, duration: 0.3, ease: 'none' }, 0.6)
  .to('.swap-b', { opacity: 1, duration: 0.3, ease: 'none' }, 0.6);
```

**See also:** `motion-deep-dives/sticky-pin-pattern.md` (canonical values: scrub:1, durations 0.3, positions 0.6/1.3, ease:none, pin-bar duration:2)

### 4.2 Deviating from canonical pin values breaks the feel

**Symptom:** Pin crossfade feels off — too slow, too rushed, "doesn't land". Or the eased scrub looks wrong.

**Root cause:** Each value in the canonical pattern was tuned together. Changing one (e.g. scrub:0.5, duration:0.6, ease:power1.inOut) cascades.

**Fix:** Use the canonical pattern exactly. If you genuinely need to deviate, document WHY in the same file as the deviation:
- scrub: `1`
- crossfade duration: `0.3`
- crossfade positions: `0.6` and `1.3`
- pin-bar duration: `2`
- All eases inside the scrubbed timeline: `none`

### 4.3 Stacking sticky cards (Variant D) — each card slides up to cover the last

**Symptom / use-case:** You want a section that pulls the reader through several full-viewport "panels" of content (4–6 categories, principles, features) but horizontal scroll feels janky on mobile and a plain vertical stack is too quiet.

**Pattern — pure CSS, no GSAP pin:**

```html
<div class="stack-deck">
  <article class="stack-card">card 1</article>
  <article class="stack-card">card 2</article>
  <article class="stack-card">card 3</article>
  <article class="stack-card">card 4</article>
</div>
```

```css
.stack-deck { position: relative; }
.stack-card {
  position: sticky;
  top: clamp(40px, 8vh, 80px);
  height: clamp(460px, 75vh, 680px);
  margin-bottom: clamp(20vh, 25vh, 30vh);  /* runway for the next sticky */
  border-radius: clamp(20px, 3vw, 32px);
  overflow: hidden;
  isolation: isolate;
}
.stack-card:last-child { margin-bottom: 0; }
.stack-card:nth-child(1) { z-index: 1; }
.stack-card:nth-child(2) { z-index: 2; }
.stack-card:nth-child(3) { z-index: 3; }
.stack-card:nth-child(4) { z-index: 4; }
```

**Why it works:** Each card sticks at `top: 60px` while its own natural box is in the viewport. When the next card's natural top reaches the sticky line, BOTH are sticky — but the higher z-index wins visually. Card 2 covers card 1, then card 3 covers card 2, etc. The substantial `margin-bottom` gives the next card its scroll runway before it takes over.

**Optional GSAP polish:** scrub the previous card scaling down and dimming as the next approaches — "settling into a stack" feel:

```js
const cards = gsap.utils.toArray('.stack-card');
cards.forEach((card, i) => {
  const next = cards[i + 1];
  if (!next) return;  // last card stays full size
  gsap.to(card, {
    scale: 0.94, opacity: 0.55, y: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: next,
      start: 'top bottom',  // next enters viewport bottom
      end:   'top 20%',     // until next is near top
      scrub: 1
    }
  });
});
```

**Anti-patterns:**
- DON'T add `overflow: hidden` to `.stack-deck` — breaks all the sticky children (lessons.md §11.4).
- DON'T forget the `margin-bottom` on each card — without runway, all cards stick at the same position from frame 0 and the highest z-index simply wins, no dealing effect.
- DON'T use `pin: true` instead — same Lenis-fights-pin issue as §4.1.

**Pairs with:** alternating splash/light treatment per card (use `:nth-child(odd)` / `:nth-child(even)`); decorative corner glyphs that rotate-in per card via a scoped reveal trigger.

**Conflicts with:** any other sticky-pin section close-adjacent — give the reader breathing room between long sticky sequences.

**When to propose:** 4–6 categories that each deserve a full-viewport moment AND the brief is a showcase/portfolio piece OR the section is the document's brand-moment.

**Triggers:**
- Brief lists 4+ items each with their own positioning angle
- "Cards that take turns" / "deal them out" language in the user's spec
- Apple-style product page reference

**See also:** `motion-deep-dives/sticky-pin-pattern.md` (consider promoting to Variant D once observed across more builds) · §4.1 (Lenis vs `pin: true`)

---

### 4.4 Diagram animates once on first view, never re-plays on scroll-up + scroll-down

**Symptom:** Hand-crafted SVG diagram animates beautifully the first time it enters view (scrolling down). User scrolls past, scrolls back up to look again, then back down — but the animation doesn't restart. Plays once and freezes in its final state, feeling static while surrounding text reveals re-trigger cleanly.

**Root cause:** `ScrollTrigger.batch('.fig', { onEnter, onLeaveBack })` only wires TWO of the four ScrollTrigger lifecycle events. Missing `onEnterBack` (re-entry from below when scrolling up) and `onLeave` (exit out the top when scrolling down). So when the user scrolls past then back, the trigger's batch never re-fires.

**Fix:** Wire ALL FOUR handlers + cache a paused timeline per `.fig`. Restart on entry from either direction; reset to frame 0 on exit in either direction:

```js
function buildFigTimeline(fig) {
  if (fig._tl) return fig._tl;            // cache — only build once per figure
  const tl = gsap.timeline({ paused: true });
  // ... .from() / .to() per .diag-* element
  fig._tl = tl;
  return tl;
}

ScrollTrigger.batch('.fig', {
  start: 'top 78%', end: 'bottom 22%',
  onEnter:     batch => batch.forEach(fig => buildFigTimeline(fig).restart()),
  onEnterBack: batch => batch.forEach(fig => buildFigTimeline(fig).restart()),
  onLeave:     batch => batch.forEach(fig => buildFigTimeline(fig).progress(0).pause()),
  onLeaveBack: batch => batch.forEach(fig => buildFigTimeline(fig).progress(0).pause()),
});
```

**Why:** ScrollTrigger has four direction-aware lifecycle events:
- `onEnter` — element enters viewport from below (user scrolled DOWN)
- `onLeave` — element exits viewport going up (user scrolled DOWN past)
- `onEnterBack` — element re-enters viewport from above (user scrolled UP)
- `onLeaveBack` — element exits viewport going down (user scrolled UP past)

To make a diagram replay in both directions, wire entry handlers for both directions, and exit handlers (reset to frame 0 paused) for both directions. Same pattern applies to stat counters (see §5.1 alternative) and any "re-animate on viewport entry" requirement.

**See also:** §5.1 (stat counter — same 4-handler pattern as a replay alternative)

---

## 5 — Stat Counter Patterns

### 5.1 "Heaps of overlapping numbers" glitch (the famous 4.7×)

**Symptom:** Stat counter looks correct statically. During the count-up animation, near the end (e.g. as it approaches 4.8×), digits visibly overlap or ghost. Worst on iOS Safari.

**Root cause:** Three compounding issues:
1. Adding `onEnterBack` to the ScrollTrigger spawns a SECOND tween on top of the first when the user scrolls back into the trigger area. The two `onUpdate` handlers fight over `textContent`.
2. Gradient text via `background-clip: text` + `background-size: 200% 100%` causes per-frame gradient repaint when `textContent` changes. iOS Safari leaves ghost characters mid-update.
3. `toFixed(decimals)` rounds, so the display can show "4.8" before the tween actually reaches it.

**Fix — apply all three:**

(a) `once: true` on the trigger:
```js
ScrollTrigger.create({ trigger: '.counter-row', start: 'top 85%',
  once: true, onEnter: () => DEMOS['counter']() });
```

(b) Disable gradient during count via class toggle:
```css
.counter-num {
  background: linear-gradient(...);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.counter-num.counting {
  -webkit-text-fill-color: var(--accent);
  background: none;
}
```
JS adds `.counting` at start, removes `onComplete`.

(c) Floor-based rounding so display monotonically increases:
```js
const scale = Math.pow(10, decimals);
const display = decimals
  ? (Math.floor(v * scale) / scale).toFixed(decimals)
  : Math.floor(v).toLocaleString();
```

**Why:** Gradient text + rapid textContent changes = browser flicker. `gsap.to` with `overwrite: true` prevents stacked tweens. Floor rounding never backsteps.

**Bonus:** Add `font-variant-numeric: tabular-nums; font-feature-settings: "tnum"` for stable digit widths during the count.

### 5.2 Counter row "switches places" mid-animation

**Symptom:** Stat counter layout reflows during the count-up — items flip between "all in a row", "1 top / 2 bottom", "2 top / 1 bottom".

**Root cause:** `.counter-row { display: flex; flex-wrap: wrap; gap: 48px }`. As digit count grows ($0+ → $12,450+), total flex width crosses the wrap threshold at varying points mid-animation. `tabular-nums` keeps each *digit* the same width but doesn't stop the *number of digits* changing.

**Fix:** CSS grid with explicit columns:
```css
.counter-row {
  display: grid;
  grid-template-columns: 1fr;     /* mobile: stacked */
  gap: 32px;
  justify-items: center;
}
@media (min-width: 640px) {
  .counter-row { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}
```

**Why:** Grid cells have fixed widths regardless of content. Flex-wrap is reactive to content; grid is committed.

### 5.3 Stat counter mixed content types

| Stat type | Counter? | Example |
|---|---|---|
| Pure integer | ✓ | `data-target="20"` |
| Integer with suffix | ✓ | `data-target="770" data-suffix="K+"` |
| Decimal | ✓ | `data-target="4.5" data-decimals="1"` |
| Approximation | ✓ | `data-target="80" data-prefix="~"` |
| Range | ✗ | `15–25` (display only) |
| Label/credential | ✗ | `TGA`, `WADA` (display only) |
| Fraction | ✗ | `4/4` (display only) |

---

## 6 — Layout & Reflow

### 6.1 Hamburger button can't be clicked when drawer is open

**Symptom:** Tap hamburger → drawer opens. Tap the X → nothing.

**Root cause:** Drawer at `z-index: 100` covers the hamburger at `z-index: 80` (or its stacking context).

**Fix:** `.hamburger-btn { position: fixed; top: 14px; left: 14px; z-index: 110; }` — above the overlay (90) and drawer (100).

### 6.2 Z-index inside `position: sticky` doesn't escape

**Symptom:** Child z-index inside a sticky topbar appears behind elements with lower z-index outside.

**Root cause:** `position: sticky` creates a new stacking context. Children's z-index is local.

**Fix:** Take the child *out* of the sticky's stacking context with `position: fixed`.

---

## 7 — SVG / Logo Pipeline

### 7.1 Inlined wordmark is invisible (wrong viewBox)

**Symptom:** SVG logo inlined in HTML topbar/footer renders as empty space. You can see the bounding box (via inspector) but no glyph.

**Root cause:** Inlining the inner content of `mono-light.svg` / `mono-dark.svg` but using a hardcoded `viewBox="0 0 2048 2048"` (the primary.svg viewBox) wraps it in. The actual wordmark paths use `transform="translate(0, 0) scale(0.097656, -0.097656)"` which puts the rendered glyph at negative Y. Negative Y is outside `0 0 2048 2048` → clipped → invisible.

**Fix:** Use the source SVG's own viewBox: `viewBox="-200.000 -236.562 1589.941 373.799"` for the wordmark variants.

**Why:** Each brand SVG has its own viewBox calibrated to where the paths actually render. Don't reuse viewBox across variants. `logos.md`'s `wordmark()` helper had this bug — the function used `viewBox="0 0 2048 2048"` which only works for primary.svg/secondary.svg (square card variants), not the wordmark variants.

**Fixed wordmark inline pattern:**
```html
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="-200 -236.562 1589.941 373.799"
     role="img" aria-label="Automaition"
     style="height:24px;width:auto;display:block">
  <!-- inner content from mono-light.svg or primary-light.svg -->
</svg>
```

### 7.2 `mono-light.svg` vs `mono-dark.svg` naming is INVERTED from intuition

**Symptom:** Picked `mono-dark.svg` for a dark surface, logo is invisible.

**Root cause:** The naming convention is "variant for X SURFACE", not "variant in X COLOUR":
- `mono-dark.svg` = for DARK surfaces → WHITE fills
- `mono-light.svg` = for LIGHT surfaces → DARK (ink) fills
- Same for `primary-dark.svg` / `primary-light.svg`

**Fix:** Match by surface luminance:
- Light surface (lavender, paper) → `mono-light.svg` or `primary-light.svg`
- Dark surface (ink, charcoal) → `mono-dark.svg` or `primary-dark.svg`

**Why:** This is how the brand asset library is conventionally named (Adobe, Brand.ai etc). Confusing every time. Always verify by `grep -o 'fill="[^"]*"' brand/the-file.svg`.

### 7.3 Logo invisible — same-coloured fill as bg

**Symptom:** Topbar/footer shows blank space where logo should be.

**Root cause:** Wrong variant selected. Logo fill matches bg.

**Fix:** Pick variant by perceived bg luminance:
```python
L = (0.299 * r + 0.587 * g + 0.114 * b) / 255
variant = 'light_surface' if L >= 0.5 else 'dark_surface'
```

### 7.4 Logo extraction order

1. Check `brand/` for SVG → inline (preferred) or base64
2. Check existing HTML in repo for embedded base64
3. Check session uploads
4. Ask user for logo file
5. Never present a CSS wordmark as a finished solution

### 7.5 Brand name casing in body copy — match `brand-config.json` exactly

**Symptom:** Body text writes the brand as "Automaition" (Title Case) when the actual brand mark is "automaitions" (lowercase, plural with the `s`). Reads as wrong every time. Even the `<title>`, `og:title`, and `meta description` get the wrong casing because Title Case is the unconscious default.

**Root cause:** English sentence convention says "capitalise proper nouns at sentence start" — but brand identity overrides that. Some brands have very specific casing/pluralisation rules (adidas, iPhone, eBay, automaitions) that override grammar. Without an explicit reference, every Claude reaches for the default and gets it wrong.

**Fix:** Treat `brand/brand-config.json`'s `"wordmark"` field as the authoritative spelling of the brand name in any readable text. Match it character-for-character — including case, including any plural / suffix / punctuation.

```json
// brand/brand-config.json
{
  "name": "Automaition",        // marketing / formal name (proper noun, capitalised)
  "wordmark": "automaitions",   // exact string for body copy, footer, meta
  ...
}
```

When writing body copy / footer / meta:
- Use `wordmark` (e.g. `"automaitions"`) verbatim — even at sentence start.
- Use `name` (e.g. `"Automaition"`) only in proper-noun contexts where the brand is being referenced as an entity (legal copy, contracts, corporate "About" pages).
- Default to `wordmark` unless the context specifically requires the proper-noun form.

**Specific places this gets wrong:**
- Hero sub-paragraph: "Automaition is the operations layer..." → should be "automaitions is the operations layer..."
- Footer wordmark text next to the SVG: "Automaition" → "automaitions"
- `<title>` / `<meta name="description">` / `og:title` / `og:description` — all visible-to-search brand-name mentions
- Email signatures, button labels mentioning the brand

**Doesn't apply to:**
- SVG `aria-label` (screen reader friendly; capital letter is fine)
- Inside the inlined wordmark SVG itself (the visual mark IS the canonical form)
- HTML comments / code

**Why:** Brand mark and brand body-copy casing are linked — one diverging from the other makes the page feel like it's referencing the brand from outside instead of being the brand. The cost of getting it right is zero; the cost of getting it wrong is a perceived-amateur signal on every read.

**See also:** `tokens.md` brand-config schema · `logos.md`

---

### 7.6 Percentage-arc rings look wrong when arc endpoints are hand-coded (use native stroke-dasharray, not DrawSVG)

**Symptom:** A "circular percentage" diagram is supposed to show three values (e.g. 6% / 32% / 92%) as arc fills on three concentric rings. The 92% arc visually reads as ~270° (three-quarters) instead of ~331° (nearly-full with a small gap). The 32% arc may draw as a full circle. Reader gets the gist but the visual lies about the actual numbers.

**Root cause — two compounding issues:**

1. **Hand-coded arc endpoints.** Each arc authored as `<path d="M 200 105 A 65 65 0 0 1 230 116"/>` with manually-computed endpoint coordinates. The arc length = the visual distance between two points, NOT a clean percentage. The math is fragile and silently rots when the design changes.

2. **DrawSVG plugin doesn't reliably honour `pathLength="100"` on multi-arc full-circle paths.** Even with the path written as a full circle via two stitched `A` commands (`M x,y A r,r 0 1,1 x,y' A r,r 0 1,1 x,y`), DrawSVG falls back to the path's natural length when computing what `drawSVG: '0% 32%'` means. Result: 32% draws as the whole circle.

**Fix — full-circle path + native `stroke-dasharray` + `stroke-dashoffset`:**

```svg
<!-- Each path is a full circle, drawn clockwise from 12 o'clock.
     pathLength="100" + stroke-dasharray="100" together mean each unit
     of dashoffset = 1% of the circumference. SVG spec guarantees this. -->
<path d="M 200,80 A 90,90 0 1,1 200,260 A 90,90 0 1,1 200,80"
      pathLength="100"
      stroke-dasharray="100"
      stroke-dashoffset="100"
      data-arc="whey"/>
```

```js
// Tween dashoffset from 100 (invisible) to (100 - pct) → reveals pct%
gsap.to(whey, { strokeDashoffset: 68,    // 100 - 32 = 68
                duration: 1.0, ease: 'power2.out' });
```

**Why:** Hand-coding endpoint trig is almost never right and silently rots. A full-circle path with `pathLength="100"` makes the arc length literally equal to the percentage you reveal — the math becomes the visual, no translation step.

The SVG spec guarantees `stroke-dasharray` and `stroke-dashoffset` honour `pathLength` exactly (they're presentation attributes baked into rendering). The DrawSVG plugin, by contrast, computes lengths via JS and has edge cases with multi-arc paths.

**The two-arc syntax for a full circle:** SVG's elliptical arc command can only sweep up to (but not including) 360°. To make a closed circle via `<path>`, use two semicircle arcs:
`M cx,(cy-r) A r,r 0 1,1 cx,(cy+r) A r,r 0 1,1 cx,(cy-r)`
The starting M point sits at 12 o'clock so the arc draws clockwise, which is what readers expect.

**When to use DrawSVG vs native dasharray:**
- **DrawSVG:** single visible stroke you want to animate end-to-end (signatures, single-arc diagrams, "underline this word" effects)
- **Native dasharray:** percentage-of-a-circle rings, multi-arc paths, anywhere you need exact `pathLength`-relative control

**See also:** §4.4 (diagram all-4-handler pattern — wire alongside this so the arcs replay on scroll-up)

---

## 8 — Topbar & Navigation

### 8.1 Topbar over content has no bg — text bleeds through on scroll-up

**Symptom:** Smart-sticky topbar fades back in on scroll-up, but the content underneath shows through the transparent topbar — messy.

**Root cause:** Topbar has `background: transparent` always (good at scroll=0 over hero), bad after scroll.

**Fix:** Two-state topbar:
```css
header.topbar {
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background .35s var(--ease), border-color .35s var(--ease), transform .35s var(--ease);
}
.topbar.topbar-solid {
  background: var(--bg);
  border-bottom-color: var(--line);
}
```

JS toggles `.topbar-solid` on/off based on scroll position:
```js
let hidden = false, solid = false;
lenis.on('scroll', ({ scroll, direction }) => {
  if (scroll < 80) {
    if (hidden) _tb.classList.remove('topbar-hidden'), hidden = false;
    if (solid)  _tb.classList.remove('topbar-solid'),  solid = false;
    return;
  }
  if (direction === 1 && !hidden) _tb.classList.add('topbar-hidden'), hidden = true;
  else if (direction === -1 && hidden) {
    _tb.classList.remove('topbar-hidden');
    _tb.classList.add('topbar-solid');
    hidden = false; solid = true;
  }
});
```

### 8.2 Hamburger button floating top-left looks disconnected

**Symptom:** `.hamburger-btn { position: fixed; top: 14px; left: 14px; }` puts the hamburger over the page corner — visually separate from the topbar.

**Root cause:** Pre-existing default pattern for sticky access. Looks ungrouped vs Recov-style integrated topbars.

**Fix:** Move hamburger INTO the topbar flow:
```html
<header class="topbar">
  <div class="topbar-left">
    <button class="hamburger-btn" id="hamburger-btn">...</button>
    <div class="topbar-logo"><svg>...</svg></div>
  </div>
  <div class="topbar-right">
    <div class="topbar-meta">...</div>
  </div>
</header>
```

```css
header.topbar { display: flex; align-items: center; justify-content: space-between; }
.topbar-left  { display: flex; align-items: center; gap: 14px; min-width: 0; }
.topbar-right { text-align: right; min-width: 0; }
.hamburger-btn {
  background: none; border: none; cursor: pointer;
  width: 36px; height: 36px;
  /* NOT position: fixed */
}
@media (min-width: 1100px) {
  .hamburger-btn { display: none; }  /* desktop has sidebar */
}
```

**Why:** All topbar elements should sit on the same baseline. Hamburger + logo as one left-aligned cluster reads coherently.

---

## 9 — Typography

### 9.1 SplitText clips descenders (g, y, p, j, q)

**Symptom:** Letters with descenders look chopped off in the hero title. Most visible on "g" in words like "logos", "going", etc.

**Root cause:** SplitText wraps each line in `overflow: hidden` mask sized to cap height. Descenders extend below cap height → clipped.

**Fix:** Padding-bottom on the mask wrapper with compensating negative margin:
```css
.hero-title .split-line-mask,
.hero-title [style*="overflow: hidden"],
.hero-title [style*="overflow:hidden"],
.hero-title [style*="overflow: clip"],
.hero-title [style*="overflow:clip"] {
  padding-bottom: 0.25em !important;
  margin-bottom: -0.25em !important;
}
```

**Why:** `!important` needed because GSAP sets inline styles. Negative margin keeps line spacing unchanged. `overflow: clip` selectors needed for newer GSAP versions.

**Note:** 0.15em is the historical default but is too tight for DM Serif Display at large hero sizes (7vw clamp). Use 0.25em as the safer default.

### 9.2 SplitText + `text-wrap: balance` conflict

**Symptom:** SplitText mask wrappers misalign with text. Wrapping looks wrong, lines don't fade cleanly.

**Root cause:** `text-wrap: balance` recalculates after layout. SplitText measures at split time. Different moments → masks misalign.

**Fix:**
- `.hero-title` (gets SplitText) → REMOVE `text-wrap: balance` from CSS
- `.h2` (no SplitText) → KEEP `text-wrap: balance`
- Any `.h2` that needs SplitText → remove balance, add `data-no-split` attribute

### 9.3 Multiple `<em>` in one heading (ZERA §6 violation)

**Symptom:** Heading has two italic-accent emphasis words. Eye doesn't know where to land.

**Root cause:** ZERA §6 rule: "One emphasis per heading."

**Fix:** Either:
- Merge into one em phrase: `<em>structured and the output fast</em>`
- Pick the more important word, drop the em from the other

---

## 10 — Token / Palette Discipline

### 10.1 Accent text on light bg fails contrast

**Symptom:** Bright `--accent` used as body text on light surface. Contrast ratio ~1.3:1, fails WCAG AA 4.5:1.

**Root cause:** Bright accents on white/lavender almost always fail contrast for body-sized text.

**Fix:** On light themes:
- `--accent` only for backgrounds, borders, button fills, large-display text (24px+)
- `--accent-dim` for body text
- Always check with the contrast function in `colour-psychology.md`

### 10.2 Eyebrow colour: `--accent-lo` not `--accent-dim`

**Symptom:** Eyebrow / sec-num feels too heavy or too light, doesn't sit right with the headline below.

**Root cause:** ZERA §6 specifies `--accent-lo` for eyebrows. `--accent-dim` is for body-text-on-light (per §8). Two different rules, often confused.

**Fix:**
- All `.hero-eyebrow`, `.sec-num`, `.pin-eyebrow-wrap` → `color: var(--accent-lo)`
- Body text emphasis on light bg → `color: var(--accent-dim)`

**Note:** Verify contrast — `--accent-lo` is generally close enough to AA on lavender (7.5:1 in current palette).

### 10.3 Tokens must include all 5 accent shades

The checklist enforces `--accent`, `--accent-hi`, `--accent-lo`, `--accent-dim`, `--line-acc`. Don't drop any. If using named tokens (e.g. `--red` ramp), add aliases:

```css
--red: #B73535; --red-hi: #D44444; --red-lo: #8C2828; --red-dim: #4A1818;
--accent: var(--red); --accent-hi: var(--red-hi); /* etc */
```

---

## 11 — Platform Gotchas

### 11.1 iOS Quick Look / `file://` blocks all JS

**Symptom:** Open HTML in iOS Files app → no animations, no counters, no hamburger.

**Root cause:** iOS Quick Look (Files, Messages, Mail previews) strips JS execution. Has been this way since iOS 13.

**Fix:** Don't ship documents that need to work via Quick Look. Host on Vercel (30s deploy).

### 11.2 Lenis + native `scroll-behavior: smooth` fight

**Symptom:** Scroll works in Safari but breaks in Chrome (or vice versa). Stuttering, jumps.

**Root cause:** Both systems trying to drive `scrollY` → fight.

**Fix:** Remove `scroll-behavior: smooth` from CSS. Lenis IS the smooth scroll system.

### 11.3 Lenis `duration` mode "flies to bottom" on desktop

**Symptom:** Desktop trackpad scroll: slow at first, then snaps to bottom.

**Root cause:** `new Lenis({ duration: 1.2 })` smooths each input over 1.2s. High-res wheels emit events every 16ms. Targets accumulate, eventually snaps.

**Fix:** Use `lerp` mode:
```js
const lenis = new Lenis({
  lerp: 0.1,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
});
```

### 11.4 `position: sticky` + ancestor `overflow: hidden` = silent failure

**Symptom:** Sticky doesn't lock.

**Root cause:** `overflow: hidden` on any ancestor turns it into the sticky's scroll container — sticky behaves WITHIN it, effectively not at all if the ancestor is short.

**Fix:** Audit all ancestors of `position: sticky` elements for `overflow: hidden`. Move it deeper or shallower in the tree as needed.

**See also:** entry 3.1 (the .splash variant of this bug)

### 11.5 Heavy `filter: blur()` on large absolute elements jank mobile

**Symptom:** Mobile scroll gets jumpy near a section with a `::before` blur effect.

**Root cause:** Blurs are GPU-expensive, especially on large elements. A `filter: blur(80px)` on `inset: -10%` of a 300vh container = blurring a ~360vh × full-width area every frame. Mobile GPUs choke.

**Fix:**
- Smaller blur radius (40px or less)
- Smaller element bounds
- Use a static SVG gradient instead of CSS filter blur
- Drop the effect on long scrolling sections, keep it for hero-card-sized elements only

### 11.6 Vercel deploy stuck / cached

**Symptom:** Push to main, refresh URL → still see old version after 5 min.

**Root cause:** Vercel build queue can stall on a commit, serving last successful build with `x-vercel-cache: HIT`.

**Fix:** Push an empty commit to force rebuild:
```bash
git commit --allow-empty -m "Trigger Vercel rebuild"
git push origin main
```

### 11.7 GSAP version — always 3.15.0+

- 3.13.0 (mid-2025): all plugins became free
- 3.15.0 (April 2026): latest stable
- jsDelivr more reliable than cdnjs for plugin files

### 11.8 `animation-timeline` is Safari 26+ only

Not in current stable Safari (iOS or macOS) as of mid-2026. Don't use in production. Use GSAP ScrollTrigger.

---

## 12 — Workflow / Skill Compliance (meta)

### 12.1 The biggest mistake: skipping the references

**Symptom:** Build accumulates 15-20 rule violations: type scale wrong, eyebrow colour wrong, scrubbed easing wrong, pin pattern wrong, etc.

**Root cause:** Skipping `SKILL.md` step 1 ("read all 13 references before writing a line of code"). Going straight to implementation based on user spec.

**Fix:** ALWAYS read all references first. The 5-minute read pays back 50 minutes of rule-violation cleanup.

**Why:** User specs are often partial. They describe what they want, not the rules they don't know about. The skill's references encode taste-level decisions the user shouldn't have to specify.

### 12.2 Not proposing colour direction / motion plan

**Symptom:** Built straight from user spec without proposing alternatives.

**Root cause:** Skipped SKILL.md workflow steps 6 (propose colour direction) and 7 (designers-eye motion plan).

**Fix:** When the user hands you a spec, still run the propose-and-confirm steps unless they've explicitly said "skip the proposal, just build it".

### 12.3 Tuning by feel instead of matching ZERA

**Symptom:** Changed crossfade duration from 0.3s → 0.6s because "it felt too fast". Later had to revert.

**Root cause:** ZERA RULEBOOK §1 locks the values. Tuning by feel introduces inconsistency across builds.

**Fix:** Match ZERA's locked table exactly. If a build genuinely needs a deviation, document WHY in a comment at the deviation site.

### 12.4 ALWAYS update this file when finding a new bug

If you spent more than 10 minutes debugging something not catalogued here, ADD AN ENTRY before committing the fix. See the rule at the top of this file.

The skill compounds only if every fix is recorded.

### 12.5 `audit.py` checks were too literal — failed on legit alternative implementations

**Symptom:** Audit fails on a new build that's actually correct. E.g. counter check expects literal `gsap.to(obj` or `gsap.to(el._counterObj`. Descender check expects literal `padding-bottom:0.15em`. New build uses `gsap.to(el._obj` or `padding-bottom:0.25em` and the audit errors.

**Root cause:** Substring `'foo' in html` checks bake in one specific implementation. Any legitimate variant (different variable name, different valid value, etc.) trips the check.

**Fix:** Use regex matching for any value that has multiple valid forms:
```python
# Counter — accept any variable name, any val:target pattern
import re
return bool(re.search(r'gsap\.to\(\s*\w[\w.]*\s*,\s*\{[^}]*val:\s*target', html, re.DOTALL))

# Descender padding — accept 0.15-0.30em range
return bool(re.search(r'padding-bottom:\s*0\.(15|2|20|25|3|30)em', html))
```

**Why:** The audit's job is to catch *wrong* implementations, not to enforce one specific writing of a correct implementation. If a check rejects a known-good variant, the check is too strict.

**Rule for future audit additions:** if your check would reject a refactor that changed only naming or non-semantic values, broaden it to a regex.

---

## 13 — CSS Cascade Pitfalls

### 13.1 Unconditional rule placed AFTER a `@media` block kills the desktop sidebar — content slips into wrong grid column

**Symptom:** Desktop layout looks bizarre — the hero title renders as a vertical stripe of one character per line, content area collapses to ~220px wide, large empty white space dominates the rest of the page. **No JS errors in the console.** Looks like the JS broke; isn't — pure CSS cascade bug.

**Caught on:** `automaitions-showcase.html` — the hero `"The gap between the old internet and the new"` rendered with every character stacked vertically. Reproduced at every viewport ≥1100px.

**Root cause:** A rule placed BELOW the desktop `@media(min-width:1100px)` block wins the cascade at every viewport width because it has equal specificity but later source order. When that rule kills `.brief-nav{display:none}`, but the parent grid is still defined as `grid-template-columns: 220px 1fr` inside the desktop media query, `.brief-content` (the next grid item) silently slides into the empty 220px column.

```css
/* WRONG — the unconditional rule wins at every width */
@media(min-width:1100px){
  .brief-layout{display:grid;grid-template-columns:220px 1fr}
  .brief-nav{display:flex}     /* loses */
}
.brief-nav{display:none}       /* wins — same specificity, later in source */
```

**Fix:** Scope the hide to mobile explicitly.

```css
/* RIGHT */
@media(min-width:1100px){
  .brief-layout{display:grid;grid-template-columns:220px 1fr}
  .brief-nav{display:flex}
}
@media(max-width:1099px){.brief-nav{display:none}}
```

**Belt-and-braces defensive pattern:** Always pin grid children to their intended column whenever a sibling's visibility can change.

```css
.brief-content{grid-column:2}   /* or "2 / -1" to span */
```

The content can never fall into column 1 because it's explicitly assigned to column 2 — survives any future cascade mistake.

**Diagnosis playbook:** When desktop layout breaks bizarrely but console is clean:
1. DevTools → inspect grid parent. Read `grid-template-columns` from computed styles.
2. Inspect each grid child. Read `width`. If a child's width matches a sibling's defined column AND that sibling has `display:none`, you've found the cascade victim.
3. Search the CSS for the sibling's selector. Look for ANY unconditional rule AFTER the relevant `@media` block.

**Why audit didn't catch it:** `audit.py` checks markup tokens and code patterns, not computed grid widths. Add a Playwright spot-check at 1366px for any cascade rearrangement involving `.brief-layout` or any sidebar+grid pair. Even a one-line `el.getBoundingClientRect().width >= 600` assertion on `.brief-content` would have flagged it.

---

## 14 — Quote Loop / Rule Engine Logic

### 14.1 Site-visit flag set the multiplier to 1.0 — made 3-storey cheaper than 2-storey

**Symptom:** In Quote Loop's pricing rule engine, the 3+ storey option showed a CHEAPER quote than the 2-storey option. Customer-facing display said e.g. roof cleaning medium 2-storey = $700, 3+ storey = $560 (single-storey price). Looks broken even though the engine technically ran without errors.

**Root cause:** When I added a `flag_site_visit: true` attribute to the 3+ storey option (so customers see a "free site visit recommended" notice for complex jobs), I ALSO lowered the multiplier from a realistic value to `1.0`. The reasoning at the time: "the site visit will set the real price anyway, so the displayed estimate doesn't matter." Wrong — the customer still SEES the estimate and judges your pricing by it.

**Fix:** The site-visit flag and the price multiplier are independent concerns. Keep the realistic multiplier (1.55× for 3+ storey vs 1.25× for 2-storey) AND set the flag. Customer sees a sensible escalating estimate AND a clear "we'll lock the final number after a quick walkthrough" notice.

**Config diff:**

```diff
- { "label": "Three+ storey · site visit", "value": "3", "multiplier": 1.0, "flag_site_visit": true }
+ { "label": "Three+ storey · site visit", "value": "3", "multiplier": 1.55, "flag_site_visit": true }
```

**Rule:** In a rule engine where the displayed price is the customer's first impression, **never artificially flatten a modifier just because a downstream human review will refine it.** The estimate has to be defensible standalone. Site-visit / human-review flags ADD context to a realistic estimate; they don't replace the pricing logic.

**Generalisation:** Any "complex case → human review" branch in an automated quoting system should still produce a sensible estimate as if no review were happening. The review is the safety net, not the pricing engine.

---

## When stuck, check these in order

1. **Did the Vercel deploy actually finish?** Check the dashboard / curl the URL.
2. **Hard-refresh** (Cmd+Shift+R) — cached HTML/CSS/JS is a top suspect.
3. **Open DevTools console** — JS errors break everything that follows.
4. **Check element computed styles** — is something overriding via specificity?
5. **Search this file** — was the bug already catalogued?
6. **Search `docs/LEARNINGS.md`** — older / project-specific entries live there too.
7. **Are CSS and JS both updated?** Half-applied refactors are silent.
8. **Run the checklist script** on the affected file.
9. **Compare against a known-good template** — diff to find what changed.

---

*Maintained by every Claude Code instance that touches this skill.*
*Last major addition: indigo/lavender palette + sticky splash session — see entries
2.1, 3.1, 5.1, 5.2, 7.1, 7.2, 8.1, 8.2, 9.1 (0.25em bump), 9.3, 10.2.*
