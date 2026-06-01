# Flip patterns — deep dive

GSAP's Flip plugin animates between layout states. You capture state →
mutate the DOM → Flip from the captured state. Layout shifts, list
reorders, modal openings, accordion expansions all become animatable.

> **Read this when:** building any interaction that changes layout
> (size, position, grid → stack, list reorder, expand/collapse).

---

## The FLIP three-step (always)

The mechanic is always the same. Memorise the three steps:

```js
// 1. CAPTURE — snapshot the current layout
const state = Flip.getState(targets, options);

// 2. CHANGE — mutate the DOM however you want
container.classList.toggle('grid-2-col');
// or: container.appendChild(card);
// or: card.classList.toggle('expanded');

// 3. FLIP — animate from captured state to new state
Flip.from(state, { duration: 0.6, ease: 'power2.inOut' /* options */ });
```

The DOM has already changed by step 3. Flip handles the transition.

---

## The four named patterns

### Pattern 1 — Card swap (layout reorder)

Click any card to send it to the end of the list. The remaining cards
slide to fill the gap, the clicked card moves to its new position.

```js
const stage = document.querySelector('.flip-stage');
stage.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    const state = Flip.getState(stage.children);
    stage.appendChild(card);                  // mutation
    Flip.from(state, {
      duration: 0.6, ease: 'power3.inOut',
      absolute: true                          // escape flex/grid during animation
    });
  });
});
```

**Required CSS:**
```css
.flip-stage { display: flex; flex-wrap: wrap; gap: 10px;
              min-height: 170px;             /* RESERVE SPACE — see gotcha 1 */
              align-content: flex-start; }
```

**When:** reorderable card grids, filtered galleries, list shuffles.

### Pattern 2 — Card expand (accordion)

Click a card to expand it. Click again to collapse. Layout shifts
smoothly between the two states.

```js
document.querySelectorAll('.expand-card').forEach(card => {
  card.addEventListener('click', () => {
    const state = Flip.getState(card, { props: 'background-color' });
    card.classList.toggle('open');            // CSS controls expanded layout
    Flip.from(state, {
      duration: 0.5, ease: 'power2.inOut',
      nested: true                            // capture nested transforms too
    });
  });
});
```

**Required CSS:**
```css
.expand-card .body { display: none; }
.expand-card.open .body { display: block; }
```

**When:** FAQ accordions, "read more" cards, expandable feature lists,
inline modals.

### Pattern 3 — Fit (move element to another element's space)

Make element A take element B's exact layout slot — smoothly.

```js
Flip.fit('.small-image', '.big-image-slot', {
  duration: 1, ease: 'power2.inOut',
  scale: true                                 // animate via transform scale
});
```

**When:** image-grow on click, "open in detail" patterns, gallery
lightboxes (more elegant than absolute-positioning + animation).

### Pattern 4 — Layout-shift-on-resize

Re-layouts triggered by window resize get animated automatically instead
of jumping.

```js
let state;
ScrollTrigger.addEventListener('refreshInit', () => {
  state = Flip.getState('.reflow');
});
ScrollTrigger.addEventListener('refresh', () => {
  if (state) Flip.from(state, { duration: 0.5 });
});
```

**When:** responsive grids that re-flow at breakpoints, dynamic columns
that change count based on viewport.

---

## Gotchas

### Gotcha 1 — `absolute: true` causes parent collapse

When `absolute: true` is on, Flip positions every child as `position:
absolute` during the animation. Absolutely positioned children
contribute zero size to the parent → parent collapses if it has no
intrinsic height.

**Symptom:** during the animation, the cards visually pile up inside
a shrunken container.

**Fix:** set `min-height` on the parent that fits the rest layout:
```css
.flip-stage {
  min-height: 170px;       /* mobile (2 rows) */
}
@media (min-width: 560px) {
  .flip-stage { min-height: 80px; }   /* desktop (1 row) */
}
```

### Gotcha 2 — `props` only captures explicit properties

Flip captures position/size by default. If you want to animate
`background-color`, `color`, `opacity`, etc., you must list them:

```js
const state = Flip.getState(card, { props: 'background-color,color,opacity' });
```

Comma-separated string. Hyphenated CSS names.

### Gotcha 3 — Nested transforms need `nested: true`

If the element you're animating has children that ALSO have transforms
(like child elements using GSAP-set rotations), Flip won't capture them
unless you pass `nested: true`. Without it, children "jump" while the
parent flips.

```js
Flip.from(state, { duration: 0.5, nested: true });
```

### Gotcha 4 — `fade: true` for entering/leaving elements

When the DOM mutation adds OR removes elements (not just rearranges),
Flip can crossfade them in/out:

```js
Flip.from(state, {
  duration: 0.6,
  fade: true,
  onEnter: els => gsap.from(els, { opacity: 0, scale: 0.8 }),
  onLeave: els => gsap.to(els, { opacity: 0, scale: 0.8 })
});
```

### Gotcha 5 — `scale: true` vs default width/height

By default Flip animates `width` and `height` directly. This is
expensive and can cause text reflow during the animation.

`scale: true` uses transform scale instead — smoother, no reflow, but
the element's children also scale (which may not be what you want for
text).

Use `scale: true` for image cards / icon transitions. Use default for
text-heavy cards where you want the text to reflow naturally.

---

## Anti-patterns

| Pattern | Why bad | Fix |
|---|---|---|
| `Flip.from` without capturing first | Throws — needs a state object | Always `getState` BEFORE the DOM mutation |
| Mutation in the same tick as `Flip.from` (e.g. classList toggle right before) | Flip's measurement is wrong | Order matters: getState → mutate → from |
| Parent has no `min-height` + `absolute: true` | Parent collapses (Gotcha 1) | Reserve space with `min-height` |
| Flip on text wrap changes | Each char's layout shifts → Flip captures each char individually if you `getState('.text')` → laggy | Capture only the parent, not the children |
| Two Flips running on overlapping elements | Second one captures the in-flight state of the first → weird | Wait for first to complete, OR use `onComplete: () => secondFlip()` |

---

## Pairs / conflicts

**Pairs with:**
- Hover micro-interactions (Flip handles click, hover stays)
- Stagger children (use Flip's `stagger: 0.04` option for cascade reorders)
- Reveal on enter (in sibling sections, not the same)

**Conflicts with:**
- ScrollTrigger pin on the same element (pin freezes layout, Flip wants to change it)
- Multiple Flips running on overlapping targets at the same time

---

## Triggers (when designers-eye should propose)

Content triggers for Flip:
- "FAQ section" → Pattern 2 (card expand)
- "Filterable gallery" → Pattern 1 (card swap)
- "Image grow on click" / "open in detail" → Pattern 3 (fit)
- "Responsive grid that reflows at breakpoints" → Pattern 4 (resize)
- "Reorderable list" → Pattern 1 (card swap)

Tier: Pattern 2 (expand) is **Tier 2** — every brief with FAQ-style
content should get it. Patterns 1, 3, 4 are **Tier 4** — interactive,
selective use.

---

## ZERA + LEARNINGS cross-refs

- **ZERA §1.3** — Tier 2 motion budget (Pattern 2 falls here)
- **ZERA §1.4** — Tier 4 motion budget (Patterns 1, 3, 4)
- **ZERA §2** — duration discipline (0.5-0.6s for layout transitions)
- **LEARNINGS §14, §15** — class-toggle conflict pattern (Flip avoids this entirely by managing transforms itself)
