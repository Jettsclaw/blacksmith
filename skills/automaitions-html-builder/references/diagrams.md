# Diagrams

## Decision tree (repeat from SKILL.md for quick reference)

```
Photographic / lifestyle?        → Higgsfield generation (references/images.md)
Process / timeline / sequence?   → HTML .proto or .tl-row
Two-way comparison?              → HTML sys-grid with + connector
Numbers / metrics?               → HTML .sg stat grid
Profiles / personas / pillars?   → HTML .os-grid or .member-grid
Quadrant / axis / market map?    → SVG
Simple flow with arrows (≤8)?    → SVG
Complex flow (>8 nodes)?         → HTML grid with connectors
```

---

## HTML diagram patterns

### Two-column comparison (the default comparison diagram)
See `components.md` — "Two-column system diagram"
- Left column: external / competitor / problem
- Right column: internal / Your Brand / solution
- + connector between columns
- Footer banner spanning full width
- Stacks to single column below 540px ← critical

### Timeline / protocol rows
See `components.md` — "Protocol / timeline rows"
- Time label on left (80px column)
- Content on right
- Full-width on mobile (grid collapses)

### Operating system grid
See `components.md` — "Operating system / pillar grid"
- 2-col mobile → 3-col desktop
- Active card highlighted with accent border and tint
- Badge label on active card

---

## SVG rules — non-negotiable

Every inline SVG must have:

```html
<svg
  viewBox="0 0 640 300"
  xmlns="http://www.w3.org/2000/svg"
  style="width:100%;display:block;overflow:visible"
  font-family="DM Sans,sans-serif"
>
```

1. **Always `viewBox`** — without it, the SVG won't scale with its container
2. **Always `width:100%`** — fills container on both mobile and desktop
3. **Always `overflow:visible`** — prevents text/shape clipping at edges
4. **Always `display:block`** — removes inline whitespace below SVG
5. **Never fixed `width` or `height` attributes** — except when inside a container with `overflow:auto`

### SVG text label length limits

At `font-size="10"`: max ~48 chars before overflow at 640px viewBox width
At `font-size="11"`: max ~40 chars
At `font-size="12"`: max ~34 chars

**Count characters before coding.** If a label is too long, shorten it. Never count on the viewBox hiding the overflow.

### Cross-browser overflow pattern

```html
<!-- Wrapper prevents layout shift on mobile -->
<div style="overflow:hidden;border-radius:2px">
  <svg viewBox="0 0 640 300" style="width:100%;display:block;overflow:visible" ...>
    <!-- content -->
  </svg>
</div>
```

### Accessible SVG

For any SVG that conveys meaning (not purely decorative):
```html
<svg viewBox="..." role="img" aria-labelledby="svg-title-1">
  <title id="svg-title-1">Description of what this diagram shows</title>
  <!-- content -->
</svg>
```

---

## SVG coordinate system for common layouts

### 2-column comparison at 640px wide
```
Left column:   x=0   to x=295  (width=295)
Center gap:    x=295 to x=345  (width=50)
Right column:  x=345 to x=640  (width=295)
```

### 3-column layout at 640px wide
```
Col 1: x=0   to x=196  (width=196)
Gap 1: x=196 to x=222  (width=26)
Col 2: x=222 to x=418  (width=196)
Gap 2: x=418 to x=444  (width=26)
Col 3: x=444 to x=640  (width=196)
```

### Timeline at 640px wide
```
Y-axis line: x=60
Label area:  x=70 to x=200
Content:     x=220 to x=620
```

---

## When to use Higgsfield-generated images as diagrams

Use Higgsfield when the diagram needs:
- Real-world product imagery (supplement bottles, pills, tablets)
- Photorealistic scientific/anatomical illustrations
- Lifestyle context (gym, recovery, sport, performance environments)
- Brand imagery that HTML/CSS cannot convey

Do NOT use Higgsfield for:
- Data comparisons (stats, filters, grids)
- Process flows or timelines
- Text-heavy comparative tables
- Anything that needs to be responsive/reflow on mobile

See `references/images.md` for embedding received Higgsfield images.

---

## Common diagram mistakes to avoid

| Mistake | Fix |
|---|---|
| SVG with fixed `width="640"` attribute | Remove — use `style="width:100%"` only |
| Text labels longer than ~40 chars | Shorten before coding |
| `overflow:hidden` on diagram container | Change to `overflow:visible` |
| Placing SVG text at `y=0` | Start text at `y=14` minimum (text baseline) |
| Building a comparison as an SVG | Use the HTML sys-grid instead |
| No `viewBox` on SVG | Always required |
| SVG diagram for data that should be a stat card | Use `.sg` HTML grid instead |
