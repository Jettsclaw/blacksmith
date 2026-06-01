# SplitText patterns — deep dive

SplitText breaks any text element into per-line, per-word, or per-char
spans you can animate independently. Six named patterns, all sharing
the same gotchas.

> **Read this when:** building a hero, a manifesto reveal, scrubbed
> word colouring, or anything where text needs to animate per-unit.

---

## The four non-negotiables (apply to ALL variants)

### 1. Wait for fonts before splitting

SplitText measures line breaks at split-time. If the web font hasn't
loaded yet, it splits using fallback-font metrics, then the layout
re-flows when the real font arrives → broken line wraps.

```js
document.fonts.ready.then(() => {
  // SplitText work goes here
  ScrollTrigger.refresh();
});
```

OR use `autoSplit: true` and return your animation from `onSplit`:
```js
SplitText.create('.hero-title', {
  type: 'lines', mask: 'lines', autoSplit: true,
  onSplit: self => gsap.from(self.lines, { yPercent: 110, ... })
});
```

### 2. Descender fix on masked lines

`mask: 'lines'` wraps each line in an `overflow: hidden` parent. Letters
with descenders (g, y, p, j, q) clip at the bottom.

Required CSS alongside any SplitText hero with `mask: 'lines'`:
```css
.hero-title .split-line-mask,
.hero-title [style*="overflow: hidden"],
.hero-title [style*="overflow:hidden"],
.hero-title [style*="overflow: clip"],
.hero-title [style*="overflow:clip"] {
  padding-bottom: 0.15em !important;
  margin-bottom: -0.15em !important;
}
```

`!important` because GSAP sets inline styles. Negative margin keeps line
spacing unchanged.

See `LEARNINGS.md` §4.

### 3. `text-wrap: balance` conflict

`text-wrap: balance` recalculates after layout. SplitText measures at
split-time. Different moments → wrappers misalign.

- `.hero-title` (gets SplitText) → **remove** `text-wrap: balance`
- `.h2` (no SplitText) → **keep** `text-wrap: balance`
- Any `.h2` that needs SplitText → remove balance, add `data-no-split`

See `LEARNINGS.md` §5.

### 4. Call `ScrollTrigger.refresh()` after splitting

SplitText inserts DOM nodes, which shifts every element below it.
ScrollTrigger caches positions at startup → triggers fire at wrong
scroll positions after splitting if you don't refresh.

```js
document.fonts.ready.then(() => {
  // ... SplitText work ...
  ScrollTrigger.refresh();
});
```

See `LEARNINGS.md` §7.

---

## The six patterns

### Pattern 1 — Cascade reveal (lines)

**Tier 1 · auto-applied to every `<h1>` in a hero**

The single most premium text reveal. Lines rise behind a clipping mask.

```js
document.fonts.ready.then(() => {
  const s = SplitText.create('.hero-title', { type: 'lines', mask: 'lines' });
  gsap.from(s.lines, {
    yPercent: 110, opacity: 0,
    duration: 0.85, stagger: 0.12,
    ease: 'power3.out', delay: 0.15
  });
  ScrollTrigger.refresh();
});
```

**Conflicts with:** every other text-reveal pattern in this file (one
hero text pattern per page).

### Pattern 2 — Char shuffle reveal

**Tier 2 · for branded headers**

Each character flies in from a random offset and rotation. "Snapping
into focus" feel.

```js
document.fonts.ready.then(() => {
  const s = SplitText.create('.shuffle-title', { type: 'chars' });
  gsap.from(s.chars, {
    x: () => gsap.utils.random(-60, 60),
    y: () => gsap.utils.random(-40, 40),
    rotation: () => gsap.utils.random(-90, 90),
    opacity: 0, duration: 0.7,
    stagger: { each: 0.025, from: 'random' },
    ease: 'power3.out'
  });
});
```

**When:** when the hero copy is a single short brand statement (3-5
words) that deserves extra theatrics.

### Pattern 3 — Gradient sweep across chars

**Tier 2 · for thesis lines**

Characters change colour left-to-right scrubbed to scroll.

```js
const s = SplitText.create('.sweep-title', { type: 'chars' });
gsap.fromTo(s.chars,
  { color: 'rgba(90,106,122,0.4)' },
  {
    color: 'var(--accent)',
    stagger: { each: 0.04, from: 'start' },
    ease: 'none',
    scrollTrigger: { trigger: '.sweep-title', start: 'top 80%', end: 'top 30%', scrub: true }
  }
);
```

**When:** sub-thesis statements where the line should "light up" but
the brand moment is reserved for a sticky pin somewhere else on the page.

### Pattern 4 — Scrambled decode (ScrambleText)

**Tier 3 · for tech-voice word reveals**

Not strictly SplitText, but lives with these patterns. ScrambleText
plugin scrambles random characters then resolves to the target string.

```js
gsap.to('#decode', {
  duration: 1.4,
  scrambleText: {
    text: 'ACCESS GRANTED',
    chars: 'upperCase',
    revealDelay: 0.4,
    speed: 0.6,
    tweenLength: true
  },
  scrollTrigger: { trigger: '#decode', start: 'top 80%' }
});
```

**When:** brand voice is technical (security, dev tools, AI, healthcare-
tech). The value being revealed is a phrase, not a number.

**Anti-trigger:** professional services, healthcare-consumer, hospitality
— scramble reads as gimmick in those contexts.

### Pattern 5 — Typewriter (TextPlugin)

**Tier 2 · for conversational openings**

Not SplitText either — TextPlugin types out a string char-by-char.

```js
gsap.to('#tw', { duration: 1.6, text: 'Hello, motion.', ease: 'none' });
```

**HTML required:**
```html
<p><span id="tw"></span><span class="caret"></span></p>
<style>
.caret { display: inline-block; width: 2px; height: .9em;
         background: var(--accent); vertical-align: middle;
         animation: blink 1s infinite step-end; margin-left: 2px; }
@keyframes blink { 50% { opacity: 0; } }
</style>
```

**When:** terminal output, conversational openings, deliberate-feeling
reveals.

### Pattern 6 — Word-by-word fade

**Tier 1 · for sub-headlines**

The lightest reveal. Each word fades up independently. Doesn't compete
with a hero cascade above it.

```js
document.fonts.ready.then(() => {
  const s = SplitText.create('.manifesto', { type: 'words' });
  gsap.from(s.words, {
    opacity: 0, y: 24, duration: 0.6,
    stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.manifesto', start: 'top 80%' }
  });
});
```

**When:** manifesto lines, section openers, any sub-headline that
deserves more than a plain reveal but less than a hero cascade.

---

## Scrubbed word karaoke (the related pattern)

Not a "text reveal" per se — uses SplitText words but ties the colour
animation to scroll position via scrub. Lives in `motion-arsenal.md` §04.

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

CSS: `.karaoke .word { color: var(--tx-3); }` (dim base).

**Tier 3.** Once per page. Hard on the eye if overused.

---

## Pattern conflict matrix

Only one hero text pattern per page. Pick by content:

| Hero content | Best pattern |
|---|---|
| Long statement (2-3 lines) | Cascade reveal (lines) — Pattern 1 |
| Short bold statement (3-5 words) | Char shuffle — Pattern 2 |
| Thesis sub-line under hero | Gradient sweep — Pattern 3 |
| Single phrase (tech voice) | Scrambled decode — Pattern 4 |
| Conversational opener | Typewriter — Pattern 5 |
| Sub-headline / manifesto under hero | Word-by-word fade — Pattern 6 |

Multiple compatible patterns on one page: hero cascade (Pattern 1) +
manifesto fade (Pattern 6) in a later section is FINE — different
sections, different roles. Three patterns is too many.

---

## ZERA + LEARNINGS cross-refs

- **ZERA §1.2** — hero motion (Pattern 1 = the spec)
- **ZERA §2** — duration discipline (each pattern's duration listed above)
- **LEARNINGS §2** — hero text jolts after font load
- **LEARNINGS §4** — descender clipping in masked lines
- **LEARNINGS §5** — text-wrap balance conflict
- **LEARNINGS §7** — ScrollTrigger.refresh after SplitText
