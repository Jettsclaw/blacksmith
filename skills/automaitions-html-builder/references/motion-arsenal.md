# Motion Arsenal — recipes + rule cards

Companion to `motion-arsenal.html` (live at
`automaitions-skill.vercel.app/motion-arsenal.html`).

The HTML is the **showroom** — visual demos with names, no code.
This file is the **engine room** — each named demo's code recipe AND
its rule card (when to use, what it pairs with, what it conflicts
with, what to avoid).

When a user prompts *"give me a [name]"*, find the matching block here
and drop it into the brief. When `designers-eye.md` runs its auto-scan,
it iterates through the rule cards to make the design call.

> **Timing + hierarchy → ZERA rulebook.** When this file gives a
> duration that differs from ZERA Section 1, ZERA wins. This is the
> name-keyed lookup; ZERA is the spec.

---

## Rule card schema (what designers-eye reads)

Every named technique starts with a structured rule card:

```
**Tier:** 1-5 (per ZERA Section 1)
**Plugins:** [comma-separated GSAP plugins needed]
**Triggers:** [content patterns that make this technique applicable]
**Pairs with:** [techniques that amplify or co-exist safely]
**Conflicts with:** [techniques that can't share the same page]
**Avoid when:** [conditions where this should be skipped even if triggered]
**See also:** ZERA §X · LEARNINGS §Y · deep-dive file (if applicable)
```

`designers-eye.md` consumes these programmatically:
1. Scan brief content → match **Triggers** → candidate set
2. Filter by **Tier** (1-2 auto, 3 propose, 4-5 on request only)
3. Filter by **Conflicts with** (drop candidates that conflict with already-selected ones)
4. Filter by **Avoid when** (check brief context against each avoid clause)
5. Apply ZERA restraint guardrails (max ONE Tier 3, etc.)
6. Output motion plan

If you add a new technique, add a rule card. The whole system depends
on cards being complete.

---

## Deep-dive companion files

Three techniques have rich enough rule sets that they live in their own
files:

- **[motion-deep-dives/sticky-pin-pattern.md](motion-deep-dives/sticky-pin-pattern.md)** — covers all sticky pin variants (3-stage crossfade, combined pin+karaoke, horizontal scroll), the CSS-sticky-vs-GSAP-pin debate, anti-patterns
- **[motion-deep-dives/splittext-patterns.md](motion-deep-dives/splittext-patterns.md)** — covers all 6 hero text patterns, the four non-negotiables (font-loading, descender fix, text-wrap conflict, ScrollTrigger.refresh), pattern conflict matrix
- **[motion-deep-dives/flip-patterns.md](motion-deep-dives/flip-patterns.md)** — covers card swap, card expand, fit, layout-shift-on-resize, the five Flip gotchas

Arsenal entries for techniques covered in a deep-dive are short
summaries + a link. Load the deep-dive when building or proposing one
of those techniques.

---

## Index (alphabetical)

| Name | Section | Tier | Plugins |
|---|---|---|---|
| 3D card tilt (quickTo on rotateX/Y) | 05 Interactive | 4 | core |
| Bounce drop (CustomBounce) | 07 Physics & FX | 5 | CustomBounce |
| Card stack reveal (timeline + stagger) | 08 Composed | 2 | ScrollTrigger |
| Cascade reveal (SplitText lines) | 03 Hero text | 1 | SplitText |
| Char shuffle reveal | 03 Hero text | 2 | SplitText |
| Clip-path mask reveal (scrubbed) | 04 Scroll | 2 | ScrollTrigger |
| Combined sticky + scrub (pin + karaoke) | 04 Scroll | 3 | SplitText, ScrollTrigger |
| Confetti burst (Physics2D) | 07 Physics & FX | 5 | Physics2DPlugin |
| Cursor follow (gsap.quickTo) | 05 Interactive | 4 | core |
| Draggable card (with inertia) | 05 Interactive | 4 | Draggable, InertiaPlugin |
| DrawSVG (line draws itself) | 06 SVG | 2 | DrawSVGPlugin, ScrollTrigger |
| Ease library | 01 Eases | 0 | CustomEase (optional) |
| Flip card expand | 05 Interactive | 2 | Flip |
| Flip card swap (layout transition) | 05 Interactive | 4 | Flip |
| Gradient sweep across chars | 03 Hero text | 2 | SplitText, ScrollTrigger |
| Infinite marquee (modifiers) | 06 SVG | 2 | core |
| Loading sequence (master timeline) | 08 Composed | 2 | core |
| Magnetic button | 05 Interactive | 4 | core |
| MorphSVG (shape → shape) | 06 SVG | 3 | MorphSVGPlugin |
| MotionPath (travel along a path) | 06 SVG | 3 | MotionPathPlugin |
| Page progress bar (scaleX scrub) | 04 Scroll | 1 | ScrollTrigger |
| Parallax (multi-speed yPercent scrub) | 04 Scroll | 2 | ScrollTrigger |
| Pinned horizontal scroll | 04 Scroll | 3 | ScrollTrigger |
| Reveal on enter (ScrollTrigger.batch) | 04 Scroll | 1 | ScrollTrigger |
| Rotation knob (Draggable type:rotation) | 05 Interactive | 4 | Draggable, InertiaPlugin |
| Scrambled decode (ScrambleText) | 03 Hero text | 3 | ScrambleTextPlugin |
| Scrubbed text karaoke (SplitText words) | 04 Scroll | 3 | SplitText, ScrollTrigger |
| Snap to section (Observer-driven) | 04 Scroll | 3 | Observer |
| Stagger (4 from-variants) | 02 Stagger | 1 | core |
| Stat counter (with prefix/suffix/decimals) | 06 SVG | 2 | ScrollTrigger |
| Sticky pin + scrubbed crossfade | 04 Scroll | 3 | ScrollTrigger |
| Typewriter (TextPlugin) | 03 Hero text | 2 | TextPlugin |
| Wiggle on hover (CustomWiggle) | 07 Physics & FX | 5 | CustomWiggle |
| Word-by-word fade | 03 Hero text | 1 | SplitText |

---

## Plugin loadout (jsDelivr GSAP 3.15.0)

Always load Lenis + GSAP core + ScrollTrigger + SplitText. Load others
only when used.

```html
<!-- ALWAYS -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>

<!-- AS NEEDED -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/DrawSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/MorphSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/MotionPathPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrambleTextPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/TextPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Observer.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/InertiaPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Physics2DPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomEase.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomBounce.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomWiggle.min.js"></script>
```

## Setup boilerplate (always present)

```js
document.documentElement.classList.add('js');

const lenis = new Lenis({
  lerp: 0.1,              // see LEARNINGS §28 — duration-based queues on high-res wheels
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Register every plugin loaded
gsap.registerPlugin(ScrollTrigger, SplitText /* , … */);

// Honour reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
```

---

# 01 · Eases

## Ease library

**Tier:** 0 (foundational — applies to every other technique)
**Plugins:** core (+ CustomEase optionally)
**Triggers:** every animation needs an ease
**Pairs with:** all techniques
**Conflicts with:** none
**Avoid when:** never (always pick an ease — `'none'` is a valid pick for scrubs and mechanical motion)
**See also:** ZERA §1 (ease conventions per tier)

**Defaults by context:**
- UI moves: `power2.out`
- Hero text reveals: `power3.out`
- Dramatic reveals: `expo.out`
- Scrubbed animations: `none` (linear)
- Playful contexts only: `back.out(1.7)`, `bounce.out`, `elastic.out(1,0.3)`

**Custom curve recipe:**
```js
CustomEase.create('hop', 'M0,0 C0.05,0.65 0.2,0.8 0.4,0.8 0.6,0.8 0.9,1 1,1');
gsap.to('.box', { y: -200, duration: 1, ease: 'hop' });
```

**Gotcha:** `back`, `bounce`, `elastic` overshoot the target. The element
needs room in its container or you'll get layout shift.

---

# 02 · Stagger

## Stagger (4 from-variants)

**Tier:** 1
**Plugins:** core
**Triggers:** lists, card rows, stat grids, any element with multiple children that benefit from sequenced reveal
**Pairs with:** Reveal on enter, Card stack reveal, Hero cascade reveal
**Conflicts with:** none
**Avoid when:** the children are unrelated (stagger implies sequence — wrong tool for a random grid of CTAs)
**See also:** ZERA §1 (Tier 1 motion budget — every brief gets stagger)

### Variant: from start

**When:** lists, paragraphs, sequential reveals where reading order matters.
```js
gsap.to('.item', { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06 });
```

### Variant: from center

**When:** centerpiece reveals — the eye starts mid-frame, ripples out.
```js
gsap.to('.item', { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)',
  stagger: { each: 0.04, from: 'center', grid: 'auto' } });
```

### Variant: from edges

**When:** meeting-in-the-middle reveals — two streams converging.
```js
gsap.to('.item', { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out',
  stagger: { each: 0.04, from: 'edges', grid: 'auto' } });
```

### Variant: from random

**When:** organic, "spawned" feel. Particles, scattered content, glitch reveals.
```js
gsap.to('.item', { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out',
  stagger: { each: 0.03, from: 'random' } });
```

**Other shapes:** `from: 0` (specific index), `from: [0.5, 0.5]` (grid
coords), `amount: 1.2` (total spread divided across items instead of
per-item).

---

# 03 · Hero text

> **Deep-dive: [motion-deep-dives/splittext-patterns.md](motion-deep-dives/splittext-patterns.md)**
> All six patterns + the four non-negotiables (font-loading, descender
> fix, text-wrap conflict, ScrollTrigger.refresh) live there. The
> entries below are summaries with the rule card.

## Cascade reveal (SplitText lines)

**Tier:** 1 (auto-applied to every `<h1>` in a hero)
**Plugins:** SplitText
**Triggers:** any `<h1>` inside `.hero` block
**Pairs with:** Page progress bar, Reveal on enter, Word-by-word fade (in later sections)
**Conflicts with:** Char shuffle, Gradient sweep, Scrambled decode, Typewriter (one hero text pattern per page)
**Avoid when:** brief has no font-loading guarantee · `text-wrap: balance` is on the hero title
**See also:** ZERA §1.2 · LEARNINGS §2, §4, §5, §7 · splittext-patterns.md Pattern 1

```js
document.fonts.ready.then(() => {
  const s = SplitText.create('.hero-title', { type: 'lines', mask: 'lines' });
  gsap.from(s.lines, { yPercent: 110, opacity: 0,
    duration: 0.85, stagger: 0.12, ease: 'power3.out', delay: 0.15 });
  ScrollTrigger.refresh();
});
```

**Required CSS:** descender fix (see splittext-patterns.md §The four
non-negotiables §2).

## Char shuffle reveal

**Tier:** 2
**Plugins:** SplitText
**Triggers:** hero with short bold copy (3-5 words)
**Pairs with:** any non-hero text pattern
**Conflicts with:** Cascade reveal, Gradient sweep, Scrambled decode, Typewriter
**Avoid when:** hero copy is longer than ~5 words (too chaotic) · professional/corporate context (reads as playful)
**See also:** splittext-patterns.md Pattern 2

```js
document.fonts.ready.then(() => {
  const s = SplitText.create('.shuffle-title', { type: 'chars' });
  gsap.from(s.chars, {
    x: () => gsap.utils.random(-60, 60), y: () => gsap.utils.random(-40, 40),
    rotation: () => gsap.utils.random(-90, 90),
    opacity: 0, duration: 0.7,
    stagger: { each: 0.025, from: 'random' }, ease: 'power3.out'
  });
});
```

## Gradient sweep across chars

**Tier:** 2
**Plugins:** SplitText, ScrollTrigger
**Triggers:** thesis sub-headline under a hero · sub-claim that needs to feel "illuminated"
**Pairs with:** Cascade reveal (in the hero above), Page progress bar
**Conflicts with:** Scrubbed text karaoke (similar effect, different scale — pick one)
**Avoid when:** the line is the page's brand moment (use Sticky pin or Karaoke instead)
**See also:** splittext-patterns.md Pattern 3

```js
const s = SplitText.create('.sweep-title', { type: 'chars' });
gsap.fromTo(s.chars,
  { color: 'rgba(90,106,122,0.4)' },
  { color: 'var(--accent)',
    stagger: { each: 0.04, from: 'start' }, ease: 'none',
    scrollTrigger: { trigger: '.sweep-title', start: 'top 80%', end: 'top 30%', scrub: true } }
);
```

## Scrambled decode (ScrambleText)

**Tier:** 3 (ONE per page maximum)
**Plugins:** ScrambleTextPlugin
**Triggers:** tech-voice word/phrase reveal · brand voice is security/dev/AI/healthcare-tech
**Pairs with:** Reveal on enter (in surrounding sections), Stat counter (different visual register)
**Conflicts with:** all other hero text patterns · any other Tier 3 motion on the same page
**Avoid when:** brand voice is hospitality/consumer/lifestyle (reads as gimmick)
**See also:** splittext-patterns.md Pattern 4

```js
gsap.to('#decode', {
  duration: 1.4,
  scrambleText: { text: 'ACCESS GRANTED', chars: 'upperCase',
    revealDelay: 0.4, speed: 0.6, tweenLength: true },
  scrollTrigger: { trigger: '#decode', start: 'top 80%' }
});
```

## Typewriter (TextPlugin)

**Tier:** 2
**Plugins:** TextPlugin
**Triggers:** conversational openings · terminal-style output · deliberate-feeling reveals
**Pairs with:** Page progress bar, any non-hero text pattern
**Conflicts with:** Cascade reveal, Char shuffle, Gradient sweep, Scrambled decode (one hero text pattern per page)
**Avoid when:** hero copy is long (>10 words feels endless)
**See also:** splittext-patterns.md Pattern 5

```js
gsap.to('#tw', { duration: 1.6, text: 'Hello, motion.', ease: 'none' });
```

**HTML required:** see splittext-patterns.md Pattern 5 (caret span +
blink keyframes).

## Word-by-word fade

**Tier:** 1
**Plugins:** SplitText
**Triggers:** sub-headlines · manifesto lines · section openers that deserve more than a plain reveal
**Pairs with:** Cascade reveal (in the hero above), Reveal on enter, all scroll patterns
**Conflicts with:** Gradient sweep on the same line (pick one)
**Avoid when:** the line is body copy (use Reveal on enter for paragraphs)
**See also:** splittext-patterns.md Pattern 6

```js
document.fonts.ready.then(() => {
  const s = SplitText.create('.manifesto', { type: 'words' });
  gsap.from(s.words, { opacity: 0, y: 24, duration: 0.6,
    stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.manifesto', start: 'top 80%' } });
});
```

---

# 04 · Scroll patterns

## Reveal on enter (ScrollTrigger.batch)

**Tier:** 1 (auto-applied to every `.reveal` element)
**Plugins:** ScrollTrigger
**Triggers:** every section of every brief
**Pairs with:** all techniques
**Conflicts with:** none (the universal workhorse)
**Avoid when:** never — this is baseline polish
**See also:** ZERA §1.1 · LEARNINGS §3, §6, §9, §10

```css
.reveal { opacity: 0; transform: translateY(40px); }
```

```js
ScrollTrigger.batch('.reveal', {
  start: 'top bottom-=10%',
  onEnter: batch => gsap.to(batch, { opacity: 1, y: 0,
    duration: 0.55, stagger: 0.08, ease: 'power3.out', overwrite: true }),
  onLeaveBack: batch => gsap.set(batch, { opacity: 0, y: 40, overwrite: true })
});
```

**Why `onLeaveBack` with `gsap.set` (not `gsap.to`):** instant snap so
scroll-up silently re-arms. Scroll-down replays fresh. No flicker.

## Parallax (multi-speed yPercent scrub)

**Tier:** 2
**Plugins:** ScrollTrigger
**Triggers:** hero sections with real visual depth (background imagery, multi-layer illustration)
**Pairs with:** Cascade reveal (in the same hero), Page progress bar
**Conflicts with:** none directly, but don't apply to flat content
**Avoid when:** content is flat (cards, copy blocks, stat grids — looks amateur) · brief has no layered imagery
**See also:** ZERA §1.3 (Tier 2 selective use)

```html
<div class="parallax-stage">
  <div class="layer" data-speed="0.3">slow</div>
  <div class="layer" data-speed="0.6">medium</div>
  <div class="layer" data-speed="1.0">fast</div>
</div>
```

```js
document.querySelectorAll('[data-speed]').forEach(layer => {
  const speed = parseFloat(layer.dataset.speed);
  gsap.set(layer, { xPercent: -50 });    // anchor X if CSS centers via translateX
  gsap.fromTo(layer,
    { y: -speed * 120 },
    { y: speed * 120, ease: 'none',
      scrollTrigger: {
        trigger: layer.closest('.parallax-stage'),
        start: 'top bottom', end: 'bottom top',
        scrub: true
      } });
});
```

**Gotcha:** if CSS sets `transform: translateX(-50%)` for centering,
GSAP's y tween overwrites the full transform. Use `gsap.set xPercent:
-50` instead so all transforms are GSAP-managed.

## Clip-path mask reveal (scrubbed)

**Tier:** 2
**Plugins:** ScrollTrigger
**Triggers:** image reveals · coloured-block reveals · directional unveilings
**Pairs with:** Parallax (different visual register), Reveal on enter
**Conflicts with:** none
**Avoid when:** revealing text (use SplitText lines instead — clip-path on text feels cheap)

```js
gsap.fromTo('.mask-fill',
  { clipPath: 'inset(0 100% 0 0)' },
  { clipPath: 'inset(0 0% 0 0)', ease: 'none',
    scrollTrigger: { trigger: '.mask-demo', start: 'top 80%', end: 'top 30%', scrub: true } });
```

**Directions:** `inset(0 100% 0 0)` (left→right), `inset(100% 0 0 0)`
(top→bottom), `inset(0 0 100% 0)` (bottom→top), `inset(0 0 0 100%)`
(right→left).

## Page progress bar (scaleX scrub)

**Tier:** 1 (auto-applied to any brief with >3 sections)
**Plugins:** ScrollTrigger
**Triggers:** long-read documents (3+ sections)
**Pairs with:** all techniques (page-wide, doesn't compete)
**Conflicts with:** none
**Avoid when:** brief is single-section (no progress to show)

```html
<div class="progress" id="progress"></div>
```

```css
.progress{position:fixed;top:0;left:0;right:0;height:2px;background:var(--accent);
  transform:scaleX(0);transform-origin:0 50%;z-index:200}
```

```js
gsap.to('#progress', { scaleX: 1, ease: 'none',
  scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0 } });
```

## Sticky pin + scrubbed crossfade

**Tier:** 3 (ONE per page maximum)
**Plugins:** ScrollTrigger
**Triggers:** category-defining claim · 3-stage comparison · before/middle/after morph
**Pairs with:** Reveal on enter (in surrounding sections), Page progress bar
**Conflicts with:** Combined sticky + scrub, Scrubbed text karaoke, Pinned horizontal scroll, Snap to section, MorphSVG, MotionPath, Scrambled decode (any other Tier 3)
**Avoid when:** brief is <3 sections (no room) · mobile-primary audience and brief is feature-heavy · another Tier 3 already selected
**See also:** **[sticky-pin-pattern.md](motion-deep-dives/sticky-pin-pattern.md)** (full mechanic, all variants) · ZERA §1.4 · LEARNINGS §16b

```js
// Summary recipe — see deep-dive for HTML + CSS + variants
gsap.set('.pin-outer .swap-b, .pin-outer .swap-c', { opacity: 0 });
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.pin-outer', start: 'top top', end: 'bottom bottom', scrub: 1 }
});
tl.to('.pin-outer .swap-a', { opacity: 0, duration: 0.3 }, 0.6)
  .to('.pin-outer .swap-b', { opacity: 1, duration: 0.3 }, 0.6)
  .to('.pin-outer .swap-b', { opacity: 0, duration: 0.3 }, 1.3)
  .to('.pin-outer .swap-c', { opacity: 1, duration: 0.3 }, 1.3);
```

## Combined sticky + scrub (pin + karaoke)

**Tier:** 3 (ONE per page maximum)
**Plugins:** SplitText, ScrollTrigger
**Triggers:** brand manifesto · single positioning sentence the rest of the page supports
**Pairs with:** Reveal on enter (surrounding sections), Page progress bar
**Conflicts with:** Sticky pin + scrubbed crossfade, Scrubbed text karaoke, Pinned horizontal scroll, Snap to section, any other Tier 3
**Avoid when:** the sentence isn't THE positioning claim · brief has no manifesto-style line
**See also:** **[sticky-pin-pattern.md](motion-deep-dives/sticky-pin-pattern.md)** Variant B · ZERA §1.4

```js
// Summary recipe — see deep-dive for HTML + CSS
document.fonts.ready.then(() => {
  const s = SplitText.create('.combo-text', { type: 'words', wordsClass: 'word' });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.combo-outer', start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
  tl.to(s.words, { color: 'var(--accent-hi)', stagger: 1, ease: 'none' }, 0);
  const emWords = s.words.filter(w => w.querySelector('em'));
  if (emWords.length) tl.to(emWords, { color: 'var(--gold)', stagger: 0.4, ease: 'none' }, 1);
  ScrollTrigger.refresh();
});
```

## Scrubbed text karaoke (SplitText words)

**Tier:** 3 (ONE per page maximum)
**Plugins:** SplitText, ScrollTrigger
**Triggers:** thesis line · manifesto sentence (when NOT using Combined sticky + scrub)
**Pairs with:** Reveal on enter, Page progress bar
**Conflicts with:** Sticky pin + scrubbed crossfade, Combined sticky + scrub, Gradient sweep, Pinned horizontal scroll, Snap to section, any other Tier 3
**Avoid when:** the line is already inside a sticky pin (use Combined instead) · the line is body copy (too long)
**See also:** splittext-patterns.md §Scrubbed word karaoke · LEARNINGS §2

```js
document.fonts.ready.then(() => {
  const s = SplitText.create('.karaoke', { type: 'words' });
  gsap.to(s.words, {
    color: 'var(--tx-1)',
    stagger: 1, ease: 'none',
    scrollTrigger: { trigger: '.karaoke', start: 'top 70%', end: 'bottom 30%', scrub: true }
  });
  ScrollTrigger.refresh();
});
```

```css
.karaoke .word { color: var(--tx-3); }   /* dim base */
```

## Pinned horizontal scroll

**Tier:** 3 (ONE per page maximum)
**Plugins:** ScrollTrigger
**Triggers:** 3-5 feature panels that benefit from being swept through · comparison tracks
**Pairs with:** Reveal on enter (in surrounding non-pinned sections)
**Conflicts with:** Sticky pin + scrubbed crossfade, Combined sticky + scrub, Snap to section, any other Tier 3 (heavy mechanic)
**Avoid when:** fewer than 3 panels (waste) · more than 5 panels (becomes tedious — use Snap to section) · panels need long-form reading (horizontal motion + reading don't mix)
**See also:** **[sticky-pin-pattern.md](motion-deep-dives/sticky-pin-pattern.md)** Variant C

```js
const track = document.querySelector('.horiz-track');
gsap.to(track, {
  x: () => -(track.offsetWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horiz-outer',
    start: 'top top', end: 'bottom bottom',
    scrub: 1,
    invalidateOnRefresh: true
  }
});
```

## Snap to section (Observer-driven)

**Tier:** 3 (ONE per page maximum)
**Plugins:** Observer
**Triggers:** presentation-deck content · one-section-at-a-time pacing
**Pairs with:** Reveal on enter (within each snapped section)
**Conflicts with:** Sticky pin + scrubbed crossfade, Combined sticky + scrub, Pinned horizontal scroll (scroll-jacking conflict)
**Avoid when:** sections have variable height · content is long-form (forces uncomfortable rhythm)

```html
<!-- data-lenis-prevent — Lenis ignores wheel/touch inside, Observer takes over -->
<div class="snap-stage" data-lenis-prevent>
  <div class="snap-panel">…</div>
  <div class="snap-panel">…</div>
  <div class="snap-panel">…</div>
</div>
```

```js
const stage = document.querySelector('.snap-stage');
const panels = stage.querySelectorAll('.snap-panel');
let idx = 0, busy = false;
gsap.set(panels, { yPercent: i => i * 100 });

function goTo(n) {
  n = gsap.utils.clamp(0, panels.length - 1, n);
  if (n === idx || busy) return;
  busy = true;
  gsap.to(panels, { yPercent: i => (i - n) * 100,
    duration: 0.7, ease: 'power3.inOut',
    onComplete: () => busy = false });
  idx = n;
}

Observer.create({ target: stage, type: 'wheel,touch',
  onDown: () => goTo(idx - 1), onUp: () => goTo(idx + 1),
  tolerance: 12, preventDefault: true });
```

**Critical:** `data-lenis-prevent` on the stage is non-negotiable when
Lenis is loaded. Without it, Lenis listens at the window level and
smooth-scrolls the whole page WHILE Observer also fires — the snap
animation runs but the page also drifts. See LEARNINGS §30.

**Gotcha:** `preventDefault: true` blocks page scroll while the cursor
is over the stage. If the snap stage takes a full viewport, users get
trapped — pair with a "scroll past" escape hatch or constrain stage
height to <100vh.

---

# 05 · Interactive

## Cursor follow (gsap.quickTo)

**Tier:** 4 (selective — pick ONE interactive per page)
**Plugins:** core
**Triggers:** heavy hero sections · immersive landing pages · on explicit user request
**Pairs with:** any non-interactive pattern
**Conflicts with:** Magnetic button, 3D card tilt (pick ONE interactive)
**Avoid when:** brief is mobile-primary (cursor doesn't exist on touch) · brief is professional/conservative

```html
<div class="cursor-stage"><div class="cursor-blob" id="blob"></div></div>
```

```css
.cursor-stage{position:relative;cursor:none;overflow:hidden}
.cursor-blob{position:absolute;width:80px;height:80px;border-radius:50%;
  background:radial-gradient(circle,var(--accent) 0%,rgba(0,0,0,0) 70%);
  pointer-events:none;mix-blend-mode:screen;left:0;top:0}
```

```js
const stage = document.querySelector('.cursor-stage');
const blob = document.getElementById('blob');
gsap.set(blob, { xPercent: -50, yPercent: -50, opacity: 0 });
const xTo = gsap.quickTo(blob, 'x', { duration: 0.4, ease: 'power3' });
const yTo = gsap.quickTo(blob, 'y', { duration: 0.4, ease: 'power3' });
stage.addEventListener('pointerenter', () => gsap.to(blob, { opacity: 1, duration: 0.3 }));
stage.addEventListener('pointerleave', () => gsap.to(blob, { opacity: 0, duration: 0.3 }));
stage.addEventListener('pointermove', e => {
  const r = stage.getBoundingClientRect();
  xTo(e.clientX - r.left); yTo(e.clientY - r.top);
});
```

## Magnetic button

**Tier:** 4 (selective)
**Plugins:** core
**Triggers:** CTAs that need extra pull · primary buttons on landing pages
**Pairs with:** Cursor follow (in different sections), Reveal on enter
**Conflicts with:** Cursor follow + 3D tilt together (pick ONE interactive total)
**Avoid when:** mobile-primary (no hover) · multiple CTAs on the same page (only the primary)

```js
const btn = document.querySelector('.magnet-btn');
const stage = btn.closest('.magnet-stage');
const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
stage.addEventListener('pointermove', e => {
  const r = btn.getBoundingClientRect();
  xTo((e.clientX - (r.left + r.width/2)) * 0.5);
  yTo((e.clientY - (r.top  + r.height/2)) * 0.5);
});
stage.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
```

**Multiplier:** 0.3 = subtle, 0.5 = balanced (default), 0.7+ = comically magnetic.

## 3D card tilt (quickTo on rotateX/Y)

**Tier:** 4 (selective)
**Plugins:** core
**Triggers:** feature cards · product tiles · explicitly desktop-only contexts
**Pairs with:** Reveal on enter, Stagger
**Conflicts with:** Cursor follow + Magnetic button if all three on same page
**Avoid when:** mobile-primary (no hover — communicate "desktop only" in copy if you ship it) · cards contain dense text (tilt becomes nauseating)

```css
.tilt-stage { perspective: 800px; }
.tilt-card { transform-style: preserve-3d; will-change: transform; }
```

```js
const tilt = document.querySelector('.tilt-card');
const stage = tilt.closest('.tilt-stage');
const rxTo = gsap.quickTo(tilt, 'rotationX', { duration: 0.5, ease: 'power3' });
const ryTo = gsap.quickTo(tilt, 'rotationY', { duration: 0.5, ease: 'power3' });
stage.addEventListener('pointermove', e => {
  const r = tilt.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width  - 0.5;
  const py = (e.clientY - r.top)  / r.height - 0.5;
  rxTo(-py * 20); ryTo(px * 20);
});
stage.addEventListener('pointerleave', () => { rxTo(0); ryTo(0); });
```

## Draggable card (with inertia)

**Tier:** 4 (selective)
**Plugins:** Draggable, InertiaPlugin
**Triggers:** sortable lists · image stacks · physical-feeling UI
**Pairs with:** Rotation knob (same interactive family)
**Conflicts with:** Snap to section (scroll-jacking + drag = chaos)
**Avoid when:** drag isn't actually meaningful in the brief context (drag-for-the-sake-of-drag reads as gimmick)

```js
Draggable.create('.drag-card', {
  type: 'x,y',
  bounds: '.drag-stage',
  inertia: true,
  edgeResistance: 0.7,
  onPress: () => lenis.stop(),    // mobile fix — Lenis eats touch events otherwise
  onRelease: () => lenis.start()
});
```

**Mobile gotcha:** without `onPress: () => lenis.stop()` Lenis captures
touch events and Draggable never sees them. Always pair Draggable with
Lenis pause/resume in this codebase.

## Rotation knob (Draggable type:rotation)

**Tier:** 4 (selective)
**Plugins:** Draggable, InertiaPlugin
**Triggers:** dial controls · custom UI inputs · sliders that wrap (e.g. colour wheel)
**Pairs with:** Draggable card
**Conflicts with:** Snap to section
**Avoid when:** a slider or numeric input would do the same job (knob is harder to read precisely)

```js
Draggable.create('.knob', {
  type: 'rotation',
  inertia: true,
  snap: v => Math.round(v / 30) * 30,
  onPress: () => lenis.stop(),
  onRelease: () => lenis.start()
});
```

## Flip card swap (layout transition)

**Tier:** 4 (selective)
**Plugins:** Flip
**Triggers:** reorderable grids · filtered galleries · list shuffles
**Pairs with:** Reveal on enter, Stagger
**Conflicts with:** ScrollTrigger pin on the same element (pin freezes layout, Flip wants to change it)
**Avoid when:** the grid is presentational only (no actual reorder need)
**See also:** **[flip-patterns.md](motion-deep-dives/flip-patterns.md)** Pattern 1

```js
const stage = document.querySelector('.flip-stage');
stage.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    const state = Flip.getState(stage.children);
    stage.appendChild(card);
    Flip.from(state, { duration: 0.6, ease: 'power3.inOut', absolute: true });
  });
});
```

**Required CSS:** `min-height` on `.flip-stage` so it doesn't collapse
during `absolute: true` animation. See flip-patterns.md §Gotcha 1.

## Flip card expand

**Tier:** 2 (selective auto-apply — every FAQ-style content)
**Plugins:** Flip
**Triggers:** FAQ accordions · "read more" cards · expandable feature lists
**Pairs with:** Reveal on enter, Stagger
**Conflicts with:** none
**Avoid when:** the card has no meaningful collapsed/expanded difference
**See also:** **[flip-patterns.md](motion-deep-dives/flip-patterns.md)** Pattern 2

```js
document.querySelectorAll('.expand-card').forEach(card => {
  card.addEventListener('click', () => {
    const state = Flip.getState(card, { props: 'background-color' });
    card.classList.toggle('open');
    Flip.from(state, { duration: 0.5, ease: 'power2.inOut', nested: true });
  });
});
```

---

# 06 · SVG mechanics

## DrawSVG (line draws itself)

**Tier:** 2
**Plugins:** DrawSVGPlugin, ScrollTrigger
**Triggers:** SVG timelines · flowcharts · signatures · "underline this word" effects
**Pairs with:** Reveal on enter, Stat counter
**Conflicts with:** none
**Avoid when:** the SVG has fills, not strokes (DrawSVG only animates strokes)

```html
<svg viewBox="0 0 400 160">
  <path class="draw" d="M20,130 C80,40 160,40 220,90 C260,120 320,80 380,30"
        fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
</svg>
```

```js
gsap.fromTo('.draw',
  { drawSVG: '0%' },
  { drawSVG: '100%', duration: 1.5, ease: 'power2.inOut',
    scrollTrigger: { trigger: '.draw', start: 'top 80%' } });
```

**Variants:** `drawSVG: '20% 80%'` (middle band only), `'50% 50%'` →
`'0% 100%'` (draw outward from centre).

## MorphSVG (shape → shape)

**Tier:** 3 (ONE per page maximum)
**Plugins:** MorphSVGPlugin
**Triggers:** icon state transitions (play↔pause) · logo morphs · illustration storytelling
**Pairs with:** Reveal on enter, Stat counter
**Conflicts with:** any other Tier 3 motion
**Avoid when:** the morph is between visually unrelated shapes (looks like a glitch)

```js
gsap.to('#from', { duration: 0.8, morphSVG: '#to-hidden', ease: 'power2.inOut' });
// Or pass path data directly:
gsap.to('#from', { morphSVG: 'M0,0 C50,0 50,100 100,100', duration: 1 });
// Rotational mode for circular shapes:
gsap.to('#a', { morphSVG: { shape: '#b', type: 'rotational' }, duration: 1 });
```

**Gotcha:** if a morph "inverts" or twists badly, use
`MorphSVGPlugin.findShapeIndex('#a', '#b')` in the console and pass
`shapeIndex` to fix the start point.

## MotionPath (travel along a path)

**Tier:** 3 (ONE per page maximum)
**Plugins:** MotionPathPlugin
**Triggers:** mechanism diagrams · journey illustrations · molecule/particle travel
**Pairs with:** DrawSVG (draw the path first, then travel it)
**Conflicts with:** any other Tier 3 motion
**Avoid when:** the diagram is static (movement implies process — wrong tool for a snapshot)

```html
<svg viewBox="0 0 400 160">
  <path id="track" d="M30,130 C80,30 200,30 250,80 C290,120 340,80 380,30"
        fill="none" stroke="var(--line-hi)" stroke-dasharray="3 3"/>
  <circle id="traveller" r="7" fill="var(--gold)"/>
</svg>
```

```js
gsap.to('#traveller', {
  duration: 3,
  motionPath: { path: '#track', align: '#track',
    alignOrigin: [0.5, 0.5], autoRotate: true },
  ease: 'power1.inOut',
  scrollTrigger: { trigger: '#track', start: 'top 80%' }
});
```

## Stat counter (with prefix/suffix/decimals)

**Tier:** 2 (auto-applied to `.sn[data-target]` cells, max 3 per page)
**Plugins:** ScrollTrigger
**Triggers:** impact stats · dashboards · billing reveals
**Pairs with:** Reveal on enter, Stagger, Card stack reveal
**Conflicts with:** none
**Avoid when:** the value is a range (15-25 min) · the value is a label (TGA, WADA) · more than 3 on the same page (diminishing returns)
**See also:** LEARNINGS §1 (use `gsap.to`, NOT `gsap.from`)

```html
<div class="sn" data-target="12450" data-prefix="$" data-suffix="+">$0+</div>
<div class="sn" data-target="98.7" data-suffix="%" data-decimals="1">0%</div>
<div class="sn" data-target="4.8" data-suffix="×" data-decimals="1">0×</div>
```

```js
document.querySelectorAll('.sn[data-target]').forEach(el => {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  el._counterObj = el._counterObj || { val: 0 };
  el._counterObj.val = 0;
  el.textContent = prefix + (decimals ? '0.0' : '0') + suffix;
  gsap.to(el._counterObj, {
    val: target, duration: 1.8, ease: 'power2.out',
    overwrite: true,
    onUpdate: () => {
      const v = el._counterObj.val;
      el.textContent = prefix + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()) + suffix;
    },
    onComplete: () => {
      el.textContent = prefix + (decimals ? target.toFixed(decimals) : Math.round(target).toLocaleString()) + suffix;
    },
    scrollTrigger: { trigger: el, start: 'top 85%', once: true }
  });
});
```

**Critical:** cache the counter object on the element (`el._counterObj`)
+ `overwrite: true` to prevent multiple tweens stacking on re-trigger
and fighting over `el.textContent` (causes flicker near end of count).

## Infinite marquee (modifiers + utils.unitize)

**Tier:** 2
**Plugins:** core
**Triggers:** logo strips · ticker tape · manifesto loops · "many partners" implications
**Pairs with:** Reveal on enter, Stagger (in other sections)
**Conflicts with:** none
**Avoid when:** the items deserve individual focus (use a static grid instead)

```html
<div class="marquee">
  <div class="track">
    <!-- DUPLICATE content at least 2x — seamless loop requires it -->
    <span>Item</span> <span>Item</span> <span>Item</span> <span>Item</span>
  </div>
</div>
```

```css
.marquee { overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.track { display: flex; gap: 48px; width: max-content; will-change: transform; }
```

```js
const track = document.querySelector('.track');
requestAnimationFrame(() => {
  const w = track.scrollWidth / 4;   // /N where N = copies in markup
  gsap.to(track, {
    x: -w, duration: 12, ease: 'none', repeat: -1,
    modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % w) }
  });
});
```

**The modifier trick:** GSAP keeps animating `x` to `-Infinity`, the
modulo wraps the rendered value within `[0, -w]`, loops invisibly.

---

# 07 · Physics & FX

## Confetti burst (Physics2D)

**Tier:** 5 (NEVER in professional briefs without explicit ask)
**Plugins:** Physics2DPlugin
**Triggers:** celebrations · success states · easter eggs · explicit user request
**Pairs with:** Reveal on enter
**Conflicts with:** all other Tier 5 motions on the same page
**Avoid when:** brief is professional services / healthcare / B2B (always) · brief is sad / serious context (always)

```js
const COLOURS = ['#5B5BD6', '#7B7BE8', '#F4EA00', '#5AC785', '#E25A5A'];
const stage = document.querySelector('.confetti-stage');
document.querySelector('.confetti-trigger').addEventListener('click', () => {
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.background = COLOURS[i % COLOURS.length];
    stage.appendChild(p);
    gsap.set(p, { opacity: 1 });
    gsap.to(p, {
      duration: 2.5 + Math.random(),
      physics2D: { velocity: 300 + Math.random() * 300,
        angle: -90 + (Math.random() - 0.5) * 100,
        gravity: 500, friction: 0.02 },
      rotation: (Math.random() - 0.5) * 720,
      opacity: 0,
      onComplete: () => p.remove()
    });
  }
});
```

## Bounce drop (CustomBounce)

**Tier:** 5
**Plugins:** CustomBounce
**Triggers:** explicit user request only
**Pairs with:** other Tier 5
**Conflicts with:** any professional context
**Avoid when:** professional briefs (always) · long-form content (always)

```js
CustomBounce.create('myBounce', { strength: 0.6, squash: 3 });
gsap.to('.ball', { y: 400, duration: 1.6, ease: 'myBounce' });
gsap.to('.ball', { scaleY: 0.5, scaleX: 1.5, duration: 1.6,
  ease: 'myBounce-squash', transformOrigin: 'center bottom' });
```

## Wiggle on hover (CustomWiggle)

**Tier:** 5
**Plugins:** CustomWiggle
**Triggers:** error states · alerts · "shake to dismiss" interactions
**Pairs with:** other Tier 5
**Conflicts with:** professional contexts
**Avoid when:** the hover doesn't actually communicate state (wiggle for fun = anti-pattern)

```js
CustomWiggle.create('shake-random', { wiggles: 6, type: 'random' });
document.querySelectorAll('.wiggle-target').forEach(t => {
  t.addEventListener('pointerenter', () => {
    gsap.to(t, { rotation: 8, duration: 1, ease: 'shake-random', overwrite: true });
  });
});
```

**Types:** `anticipate` (winds up first), `easeOut` (strongest at
start), `random` (chaotic), `uniform` (even strength throughout).

---

# 08 · Composed timelines

## Card stack reveal (timeline + stagger)

**Tier:** 1-2 (auto-applied to any 3-card row of stats/features)
**Plugins:** ScrollTrigger
**Triggers:** stat panels · feature triads · "what you get" rows
**Pairs with:** Stat counter (apply both to the same row), Reveal on enter
**Conflicts with:** none
**Avoid when:** the cards are part of a larger pattern (e.g. inside a Sticky pin)

```js
ScrollTrigger.create({
  trigger: '.stack-row', start: 'top 85%',
  onEnter: () => gsap.from('.stack-row .stack-card', {
    y: 60, opacity: 0, scale: 0.94,
    duration: 0.7, stagger: 0.14, ease: 'power3.out', overwrite: true
  }),
  onLeaveBack: () => gsap.set('.stack-row .stack-card', { y: 60, opacity: 0, scale: 0.94 })
});
```

## Loading sequence (master timeline)

**Tier:** 2
**Plugins:** core (+ optional ScrollTrigger for in-view trigger)
**Triggers:** multi-step onboarding · "how it works" sequences · process explanations
**Pairs with:** Reveal on enter (in surrounding sections)
**Conflicts with:** none
**Avoid when:** the steps are unrelated (sequence implies cause-and-effect)

```html
<div class="seq-stage">
  <div class="seq-row"><span class="seq-icon">1</span>
       <div class="seq-bar"><div class="seq-fill"></div></div>
       <span class="seq-label">Connect</span></div>
  <!-- repeat per step -->
</div>
```

```js
const rows = document.querySelectorAll('.seq-row');
gsap.set(rows, { opacity: 0, x: -20 });
gsap.set('.seq-fill', { scaleX: 0 });

const tl = gsap.timeline({ scrollTrigger: { trigger: '.seq-stage', start: 'top 85%' } });
rows.forEach((row, i) => {
  const fill = row.querySelector('.seq-fill');
  tl.to(row,  { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, i * 0.7)
    .to(fill, { scaleX: 1,        duration: 0.6, ease: 'power2.inOut' }, i * 0.7 + 0.2);
});
```

**Position parameter `i * 0.7`:** each step starts 0.7s after the
previous. Tighter for snappy, looser for ceremonial.

---

## When the user prompts a name not in this file

1. Check `animations.md` — it has additional patterns (parallax on
   `.diag-parallax`, sidebar nav active state, hamburger nav, etc).
2. Check the deep-dive files — they may cover a variant not surfaced
   in the arsenal.
3. Check `LEARNINGS.md` §16a-c for the diagram timeline pattern.
4. If genuinely new: build it, then **add it to this file with a full
   rule card + a demo to `motion-arsenal.html`** so the arsenal stays
   current. Future Claude Code sessions will pick it up.

The arsenal is a living index — every named pattern in production
should appear here with its rule card. That's what makes the system
reliable.
