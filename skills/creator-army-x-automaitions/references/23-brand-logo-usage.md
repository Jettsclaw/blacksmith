# Brand Logo Usage

The 12-slot logo system used across the Creator Army × Automaitions chain.
This is the canonical reference for: which logo variant goes on which surface,
how to embed it correctly, and what NEVER to do with brand logos.

The pattern is inherited from the automaitions sibling skill's `brand/`
directory, where the 12 SVG slots are the standard structure for any brand
configured through Creator Army × Automaitions.

---

## The 12-slot system

Every brand configured for the chain has these 12 files in `brand/`. The
filenames are canonical — don't rename them; downstream skills reference
each file by slot.

### Wordmark variants (4 files)

| File | Fill colour | Surface | When to use |
|---|---|---|---|
| `mono-light.svg` | Dark ink (body-text colour, e.g. #0A0A0A) | LIGHT surfaces | Body of pages with paper/white backgrounds, light-theme briefs |
| `mono-dark.svg` | White / paper (#FAFAFA or #FFFFFF) | DARK surfaces | Dark-theme landing pages, dark hero sections, dark-mode footer |
| `all-indigo.svg` | Full accent colour (e.g. #5B5BD6) | Any | Hero/feature placements where accent colour wordmark is the right choice |
| `knockout.svg` | Cut-out of coloured background block | Branded blocks | Branded callout blocks, banner placements where wordmark sits inside a coloured shape |

> **⚠️ Naming gotcha:** "mono-light" means "for LIGHT surfaces" (dark ink fill).
> "mono-dark" means "for DARK surfaces" (white fill). The name describes the
> SURFACE the logo goes on, not the colour of the wordmark itself. This trips
> up everyone the first time.

### Branded-container variants (4 files)

| File | When to use |
|---|---|
| `primary.svg` | Full mark inside a branded container (dark squircle with accent glyph) — for hero placements, formal docs, brand assertions |
| `secondary.svg` | Alt variant of primary — for secondary placements that still need branded container |
| `primary-light.svg` | Primary variant adapted for light surfaces |
| `primary-dark.svg` | Primary variant adapted for dark surfaces |

### Glyph-only variants (3 files)

| File | Fill colour | Surface | When to use |
|---|---|---|---|
| `glyph-only-indigo.svg` | Accent colour | Any | Favicon source, social profile picture, small accent placements |
| `glyph-only-ink.svg` | Dark ink | Light surfaces | Light-theme small marks, light-mode favicon variants |
| `glyph-only-white.svg` | White/paper | Dark surfaces | Dark-theme small marks, dark-mode brand glyph anywhere small |

### Browser tab (1 file)

| File | When to use |
|---|---|
| `favicon.svg` | Browser tab icon — pre-cropped at favicon dimensions, indigo by default |

---

## Surface-aware selection decision tree

```
What surface is the logo going on?
│
├─ DARK background (page bg < 50% lightness)
│   ├─ Need full wordmark? → mono-dark.svg
│   ├─ Need wordmark in accent colour for hero impact? → all-indigo.svg
│   ├─ Need glyph only? → glyph-only-white.svg
│   ├─ Need branded container? → primary-dark.svg
│   └─ Need favicon? → favicon.svg
│
├─ LIGHT background (page bg ≥ 50% lightness)
│   ├─ Need full wordmark? → mono-light.svg
│   ├─ Need wordmark in accent colour for hero impact? → all-indigo.svg
│   ├─ Need glyph only? → glyph-only-ink.svg
│   ├─ Need branded container? → primary-light.svg
│   └─ Need favicon? → favicon.svg
│
└─ COLOURED background (e.g. coral/indigo solid block)
    ├─ Need wordmark? → knockout.svg
    └─ Need glyph? → glyph-only-white.svg (if dark coloured bg)
                  → glyph-only-ink.svg (if light coloured bg)
```

---

## Embed methods

### Method 1: Inline SVG (preferred for landing pages)

```html
<a href="/" class="brand-link" aria-label="automaitions home">
  <!-- Paste the SVG contents directly inline -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="..." aria-hidden="true">
    <path d="..." fill="#FFFFFF" />
  </svg>
</a>
```

**Use when:** the logo is a critical part of the page (topbar, hero, footer).
Inline SVGs render immediately with zero network fetch, are stylable via
CSS, and accessibility tools can read them properly.

**Pros:**
- No layout shift on load (zero fetch latency)
- Stylable with CSS (`fill: currentColor` etc.)
- Visible to screen readers when properly labelled
- Smaller HTML for tiny logos

**Cons:**
- Increases HTML weight for complex SVGs (>5KB)
- Can't be cached separately

### Method 2: External SVG via `<img>`

```html
<img src="brand/mono-dark.svg" alt="automaitions" height="32" />
```

**Use when:** the logo is repeated across many pages (efficient via caching),
OR when the SVG is complex (>5KB) and shouldn't bloat HTML.

**Pros:**
- Browser caches the SVG file across pages
- HTML stays clean
- Easy to swap with `src` change

**Cons:**
- Small layout shift while file loads
- Can't be styled with CSS (`fill: currentColor` doesn't work)
- Requires alt text for accessibility

### Method 3: Base64 data URI (rare)

```html
<img src="data:image/svg+xml;base64,PHN2Z..." alt="automaitions" />
```

**Use when:** SVG is small (<2KB), needs to be self-contained in a single
HTML file with no external dependencies (e.g. emails, exported assets).

**Pros:** No external fetch.
**Cons:** Hard to edit, bloats HTML, breaks CSS styling.

### Method 4: CSS `background-image: url(...)`

```css
.brand-mark {
  background-image: url(brand/glyph-only-indigo.svg);
  background-size: contain;
  background-repeat: no-repeat;
}
```

**Use when:** logo is purely decorative (e.g. a watermark on a stat card).
Never for the main brand placement.

**Pros:** CSS-controlled sizing and positioning.
**Cons:** Decorative only — not visible to screen readers.

---

## Specific placements — the canonical patterns

### Topbar (landing page, dark theme)

```html
<header class="topbar">
  <a href="/" class="topbar-brand" aria-label="automaitions home">
    <!-- Inline mono-dark.svg (white wordmark on dark surface) -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1190 232" aria-hidden="true" height="24">
      <!-- ... wordmark paths ... -->
    </svg>
  </a>
  <a href="#apply" class="topbar-cta">Apply for Q1 pilot →</a>
</header>
```

- Use inline mono-dark.svg
- `aria-hidden="true"` on the SVG (the parent link has `aria-label`)
- Height around 24-32px on desktop, 20-26px on mobile
- Link wraps the SVG with `aria-label` for screen reader

### Footer (landing page, dark theme)

```html
<footer class="footer">
  <div class="footer-brand">
    <svg ... height="20"><!-- glyph-only-white.svg --></svg>
    <span class="footer-wordmark">automaitions</span>
  </div>
  <p>© 2026 · the foundation layer of AI</p>
</footer>
```

- Smaller than topbar (20-24px height)
- Glyph + text wordmark side-by-side is acceptable for footer
- OR just the wordmark, never just the glyph (footer needs full brand assertion)

### Favicon

```html
<link rel="icon" type="image/svg+xml" href="brand/favicon.svg">
```

- SVG favicon scales perfectly across all device sizes
- Browsers cache it aggressively
- Modern browsers (95%+ market share) support SVG favicons

### OG / social share image

```html
<meta property="og:image" content="https://yoursite.com/brand/og-image.png">
```

- Requires a dedicated 1200×630 PNG (OR JPG) — NOT an SVG (most social
  platforms don't render SVG OG images)
- Should feature the wordmark prominently against the brand-DNA palette
- Generate via NB Pro or `automaitions-html-builder` with explicit OG dimensions

### Hero brand moment (landing page)

```html
<div class="hero-brand">
  <!-- all-indigo.svg — wordmark in accent colour for hero impact -->
  <svg xmlns="..." viewBox="..." height="64">
    <!-- ... wordmark in #5B5BD6 ... -->
  </svg>
</div>
```

- Use `all-indigo.svg` for emphasis
- Larger than topbar (48-80px height)
- Centered, with breathing room

### Inside an SVG diagram

When a brand mark needs to appear inside another SVG diagram (e.g. centered
inside a chain visualisation), embed via `<image>` element:

```svg
<svg viewBox="0 0 720 480">
  <!-- ... other diagram elements ... -->
  <image href="brand/glyph-only-white.svg" x="340" y="220" width="40" height="40" />
</svg>
```

OR (better) copy the glyph paths directly into the parent SVG and apply the
appropriate fill:

```svg
<g id="brand-glyph" transform="translate(340, 220)">
  <!-- ... glyph paths with fill="#FFFFFF" ... -->
</g>
```

---

## Hard constraints (NEVER do these)

### ❌ Never use a raster logo
JPG, PNG, GIF, WebP — all forbidden for the logo. SVG only. Logos must
scale perfectly across all device sizes and DPRs.

### ❌ Never invent a logo variant
The 12 slots are canonical. Don't add new variants. Don't alter the wordmark.
Don't recolour outside the brand palette. If you need a new variant for a
new use case, escalate to the brand owner and update the brand/ directory.

### ❌ Never apply CSS filters that distort the logo
- `filter: drop-shadow()` is OK for context
- `filter: blur(), grayscale(), hue-rotate(), saturate(), brightness()` —
  forbidden on logo elements
- Logo always renders in its native fill colour as specified by the slot

### ❌ Never let the logo become illegible
- Minimum size: wordmark 16px height, glyph 12px height
- Below that, swap to the simpler variant or omit entirely
- Always test legibility at the smallest used size

### ❌ Never use the wrong variant for the surface
- mono-light on dark = invisible (dark on dark)
- mono-dark on light = invisible (white on light)
- all-indigo on a yellow background = clashes
- Always use the surface-aware decision tree above

### ❌ Never strip `aria-label` / accessibility
Logos that link to the home page MUST have `aria-label="<brand> home"` on
the wrapping `<a>` tag. Decorative logos must have `aria-hidden="true"` on
the SVG.

### ❌ Never animate the logo itself
Hover scale (1.0 → 1.05) is OK. Anything else — colour shifts, character
animation, particle effects ON the logo — breaks brand integrity.

---

## How this fits the polish pass

`22-polish-pass.md` § Audit 4 (Brand adherence) includes logo checks:

- [ ] Topbar logo uses correct variant for surface
- [ ] Footer logo uses correct variant for surface
- [ ] Favicon present and resolving
- [ ] Hero brand moment uses appropriate variant
- [ ] All logos have proper accessibility attributes
- [ ] No raster logos anywhere
- [ ] No CSS filters distorting any logo
- [ ] Minimum legibility size respected

---

## When the brand owner replaces the placeholder kit

If the operator runs CA against a brand whose `brand/` directory still has
PLACEHOLDER svg files (the slate-colour defaults), the chain MUST refuse to
ship. Per the automaitions sibling skill's CLAUDE.md rule:

> "If `brand-config.json` still has `name: 'Your Brand'`, the skill must
> refuse to ship a brief and prompt the user to configure first."

This logo usage doc applies the same protection at the logo level:
- ANY logo file in `brand/` that still has the placeholder slate (#4A8FB5)
  fill colour means the brand isn't configured
- The polish pass MUST flag this as a hard fail

---

## Worked example — automaitions itself

For automaitions' own landing page (`automaitions-pilot.html`), dark theme:

| Placement | Variant used | Height |
|---|---|---|
| Topbar | mono-dark.svg (inline) | 24px desktop, 20px mobile |
| Footer | mono-dark.svg + glyph-only-white.svg combo | 20px |
| Favicon | favicon.svg | (browser-managed) |
| Sticky mobile CTA | None — text "Apply →" only | n/a |
| Hero | Not applicable — text wordmark used currently (could be upgraded to all-indigo.svg) | — |

If the brand wants the hero to feature a logo moment, replace the text
wordmark in the topbar with the inline `mono-dark.svg`, and add an
`all-indigo.svg` placement near the headline as a hero accent.

---

## The one-liner

**12 slots, never rename. Surface-aware selection: dark → mono-dark, light
→ mono-light, accent moment → all-indigo, container moment → primary, small
→ glyph. Always inline SVG for critical placements. Never raster. Never
animate the logo itself. Always accessible.**
