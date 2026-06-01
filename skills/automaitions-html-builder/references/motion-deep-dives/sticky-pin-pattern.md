# Sticky pin pattern — deep dive

The brand-moment mechanic. A section locks in place while scroll progress
drives content transformations inside it, then releases. The single
highest-impact motion technique in the arsenal.

> **Read this when:** building a sticky pin section, debugging a pinned
> section that jitters, or deciding between the variants below.

---

## The non-negotiable rule

**Never use GSAP's `pin: true`.** Use native CSS `position: sticky`.

Background: GSAP's `pin: true` mutates the parent's offset every frame
while pinning. Lenis smooth scroll *also* writes transforms every frame.
The two systems fight in different RAF callbacks → visible tear.
`pinType: 'transform'` reduces but doesn't eliminate it.

Native `position: sticky` runs on the browser compositor at actual scroll
position. Lenis can't fight it — no shared mutation target. The browser
handles the lock; GSAP only drives the content inside.

See `LEARNINGS.md` §16b for the diagnostic story.

---

## The three variants (pick ONE per page)

### Variant A — 3-stage crossfade

A category-defining claim that morphs through three stages as you scroll.
Used in `motion-lab.html` v3 and `motion-arsenal.html` §04.

**HTML:**
```html
<section class="pin-outer">
  <div class="pin-sticky">
    <div class="pin-inner">
      <div class="pin-eyebrow"><span class="swap-wrap">
        <span class="swap-a">Stage one</span>
        <span class="swap-b">Stage two</span>
        <span class="swap-c">Stage three</span>
      </span></div>
      <h2 class="pin-headline"><span class="swap-wrap">
        <span class="swap-a">First claim</span>
        <span class="swap-b">Second claim</span>
        <span class="swap-c">Third claim</span>
      </span></h2>
    </div>
  </div>
</section>
```

**CSS:**
```css
.pin-outer  { height: 300vh; position: relative; }         /* runway */
.pin-sticky { position: sticky; top: 0; height: 100vh;
              display: flex; align-items: center; justify-content: center;
              overflow: hidden; }
.swap-wrap  { position: relative; display: block; }
.swap-wrap > * { display: block; }
.swap-wrap > *:not(:first-child) { position: absolute; left: 0; right: 0; top: 0; }
.pin-headline { min-height: 2.4em; }                       /* fits longest 2-line wrap */
```

**JS:**
```js
gsap.set('.pin-outer .swap-b, .pin-outer .swap-c', { opacity: 0 });
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.pin-outer', start: 'top top', end: 'bottom bottom', scrub: 1 }
});
tl.to('.pin-outer .swap-a', { opacity: 0, duration: 0.3 }, 0.6)
  .to('.pin-outer .swap-b', { opacity: 1, duration: 0.3 }, 0.6)
  .to('.pin-outer .swap-b', { opacity: 0, duration: 0.3 }, 1.3)
  .to('.pin-outer .swap-c', { opacity: 1, duration: 0.3 }, 1.3);
```

**When to use:** 3-stage comparisons, before/middle/after reveals,
escalating claims. Each stage needs to be roughly equal weight — if
one stage carries the punchline, use Variant B instead.

### Variant B — Combined pin + karaoke

A single sentence that locks AND lights up word-by-word. The two
techniques compound for maximum impact. Used as motion-arsenal Demo
"Combined sticky + scrub."

**HTML:**
```html
<section class="combo-outer">
  <div class="combo-sticky">
    <div class="combo-inner">
      <p class="combo-text">You don't need more X. <em>You need it to Y.</em></p>
    </div>
  </div>
</section>
```

**CSS:**
```css
.combo-outer  { height: 250vh; position: relative; }
.combo-sticky { position: sticky; top: 0; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden; }
.combo-text   { color: var(--tx-3); }
.combo-text .word { display: inline-block; color: var(--tx-3); }
.combo-text em { font-style: italic; }
```

**JS:**
```js
document.fonts.ready.then(() => {
  const el = document.querySelector('.combo-text');
  const s = SplitText.create(el, { type: 'words', wordsClass: 'word' });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.combo-outer', start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
  tl.to(s.words, { color: 'var(--accent-hi)', stagger: 1, ease: 'none' }, 0);
  const emWords = s.words.filter(w => w.querySelector('em'));
  if (emWords.length) tl.to(emWords, { color: 'var(--gold)', stagger: 0.4, ease: 'none' }, 1);
  ScrollTrigger.refresh();
});
```

**When to use:** the brand-defining moment of a page. Manifesto line.
Positioning claim. Reserved for THE sentence the page is built around.

### Variant C — Pinned horizontal scroll

Vertical scroll input drives horizontal panel movement. Feature
showcases, comparison tracks, "slide through the lineup."

**HTML:**
```html
<section class="horiz-outer">
  <div class="horiz-sticky">
    <div class="horiz-track">
      <div class="horiz-panel">…</div>
      <div class="horiz-panel">…</div>
      <div class="horiz-panel">…</div>
    </div>
  </div>
</section>
```

**CSS:**
```css
.horiz-outer  { height: 300vh; position: relative; }
.horiz-sticky { position: sticky; top: 0; height: 100vh;
                overflow: hidden; display: flex; align-items: center; }
.horiz-track  { display: flex; will-change: transform; }
.horiz-panel  { width: 100vw; height: 100vh; flex-shrink: 0; }
```

**JS:**
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

**When to use:** 3-5 panels that benefit from being swept through.
Product feature showcases. Avoid for content the reader needs to dwell on.

---

## Sizing the runway

The outer container's height determines how long the pin holds. The
choice matters — too short and the content rushes past; too long and
the reader gets impatient.

| Variant | Recommended runway | Why |
|---|---|---|
| 3-stage crossfade | 300vh (3 viewports) | Each stage gets one viewport's scroll |
| Combined pin + karaoke | 250vh | Sentence has enough room to colour-sweep without dragging |
| Horizontal scroll (3 panels) | 300vh | One viewport per panel |
| Horizontal scroll (4 panels) | 400vh | Maintains one-viewport-per-panel feel |
| Horizontal scroll (5+ panels) | Don't. Use snap-to-section instead. | |

---

## Anti-patterns (will break / look amateur)

| Pattern | Why bad | Fix |
|---|---|---|
| `pin: true` in the ScrollTrigger config | Fights Lenis smooth scroll | Use CSS `position: sticky` instead |
| `position: sticky` on an element with a parent that has `overflow: hidden` | Browser ignores sticky inside overflow-hidden | Move the overflow-hidden up or down the tree |
| Two sticky pins on the same page | Cognitive overload — the page feels broken | One brand moment per document, that's the point |
| Sticky pin + karaoke + horizontal scroll on same page | Tech demo | Pick ONE Tier 3 mechanic per document |
| Headline `min-height` too small | Longer stage's text overflows into subtitle | Set `min-height` for the longest 2-line wrap on mobile (~2.4em for clamp-sized hero) |
| Inner content with `position: absolute` but parent missing `position: relative` | Content escapes the sticky container | Always set `.pin-sticky { position: sticky }` — sticky implicitly creates a containing block |

---

## Pairs / conflicts

**Pairs with (safe co-existence):**
- Reveal on enter (in surrounding sections)
- Stagger children (in surrounding sections)
- Hero cascade reveal (above the pin)
- Page progress bar (page-wide, doesn't compete)
- Stat counter (in surrounding sections, NOT inside the pin)

**Conflicts with (one or the other, never both):**
- Any other Tier 3 motion on the same page
- Scrubbed text karaoke as a separate section (use Variant B "combined" if you want both)
- Pinned horizontal scroll (one pinned mechanic per page)

---

## Triggers (when designers-eye should propose this)

Content triggers for sticky pin:
- "Category-defining claim" — a sentence that explicitly defines what
  the brand IS
- "3-stage comparison" — copy structured as X → Y → Z escalation
- "Before/after morph" — explicit transformation language
- "Brand manifesto" — single sentence the rest of the document supports

Anti-triggers (skip if):
- Brief is under 3 sections (no room for a pin to land)
- Mobile-primary audience and the brief is feature-heavy (sticky pins
  feel heavy on small screens)
- Another Tier 3 motion is already chosen
- The "claim" is actually 3+ separate facts (use stat counters instead)

---

## ZERA + LEARNINGS cross-refs

- **ZERA §1.4** — Tier 3 motion budget (one per page)
- **ZERA §2** — duration discipline (the timeline's scrub: 1 puts duration under user scroll control, but the per-tween durations inside still follow §2)
- **LEARNINGS §16b** — Lenis vs `pin: true` conflict story
- **LEARNINGS §16a** — diagram timeline pattern (different use case, different mechanism)
