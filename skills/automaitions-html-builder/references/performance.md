# Performance — file size + load discipline

A brief that takes 4 seconds to load on a mid-tier phone is a brief
nobody finishes. Speed IS polish. This file defines the budgets and
the patterns to stay under them.

---

## File size budgets

| Document type | Target | Hard cap | Why |
|---|---|---|---|
| Partner brief (text-heavy) | ≤ 150KB | 250KB | Loads instantly even on 3G |
| Visual explainer (SVG diagrams) | ≤ 250KB | 400KB | SVGs add weight |
| Education doc (long-form + counters) | ≤ 200KB | 350KB | |
| Member playbook | ≤ 200KB | 300KB | |
| Showcase / demo page | ≤ 500KB | 800KB | Full GSAP plugin loadout acceptable |

These are TOTAL file sizes including inlined SVG, base64 favicon, and
embedded JS. The HTML page is the deliverable — measure with
`ls -lh file.html`.

---

## GSAP plugin loadout budget

Each plugin is ~10-30KB minified. Don't load what you don't use.

### Baseline (every brief) — ~85KB

```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>
```

### Add as needed (rule cards in `motion-arsenal.md` say which)

| Plugin | Size | When to load |
|---|---|---|
| ScrambleTextPlugin | ~6KB | Decode reveals only |
| TextPlugin | ~5KB | Typewriter only |
| DrawSVGPlugin | ~9KB | DrawSVG patterns |
| MotionPathPlugin | ~12KB | Path-travel animations |
| MorphSVGPlugin | ~22KB | Shape morphs only |
| Flip | ~16KB | Flip card swap/expand only |
| Observer | ~7KB | Snap-to-section, custom scroll-jack |
| Draggable | ~13KB | Drag interactions |
| InertiaPlugin | ~13KB | Drag + throw |
| Physics2DPlugin | ~8KB | Confetti, gravity FX |
| CustomEase | ~4KB | One-off custom curves |
| CustomBounce | ~3KB | Bounce drop |
| CustomWiggle | ~3KB | Shake/wiggle |

**Loading all 14 = ~210KB.** Demo pages (motion-arsenal) carry this
fine. Production briefs should load only what's actually used.

`designers-eye.md` outputs the technique list; use it to determine
the minimal plugin loadout.

---

## SVG file size

| Pattern | Size |
|---|---|
| Inline icon (1-2 paths, no gradients) | 0.5-2KB |
| Logo wordmark | 3-15KB |
| Multi-element diagram (10-30 paths) | 5-20KB |
| Highly detailed illustration | 20-100KB |

**Hard rules:**
- Never embed PNG (use SVG every time)
- If a "diagram" SVG is > 50KB, you're embedding raster — re-extract
  as proper vectors or rebuild as HTML/CSS diagram
- Strip `<?xml ...?>` declaration when inlining (saves bytes, breaks
  nothing)
- Don't inline gradient definitions that aren't used (cleanup pass)

---

## Image strategy

For partner briefs / education docs that need photos:

- **Hero image:** WebP @ 1600w, 75 quality → typically 80-120KB
- **Inline body images:** WebP @ 900w, 80 quality → 30-80KB each
- **Avatars / small thumbnails:** WebP @ 200w, 80 quality → 5-15KB each

Use `<picture>` with `<source type="image/webp">` + `<img>` fallback
for Safari compatibility (though modern Safari supports WebP since
14.0).

For decorative photos that don't need to look perfect:
- **Base64-embedded JPEG @ 900w, 65 quality → ~50KB**
- Pillow pipeline (see `LEARNINGS.md` §22c for PDF-extracted images)

---

## Font loading

| Font source | Strategy |
|---|---|
| Google Fonts | `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link href="...&display=swap">` |
| Self-hosted | `<link rel="preload" as="font" type="font/woff2" crossorigin>` |
| Variable fonts | One file covers all weights — preferred |

**Always `display=swap`** so text renders in fallback while font loads
(no FOIT — flash of invisible text).

Limit to TWO font families maximum. The skill defaults to:
- **Serif:** DM Serif Display (display headings only)
- **Sans:** DM Sans (everything else, 300-700 weights)

---

## CSS file size

The skill produces inline CSS in the `<style>` block of each HTML
file. Typical sizes:

- Partner brief: 8-15KB CSS
- Visual explainer: 12-20KB CSS (diagram styles add weight)
- Education doc: 10-18KB CSS

If your CSS block is > 25KB, you've duplicated rules or kept unused
component classes. Sweep before delivery.

---

## What slows briefs down (and how to fix)

| Symptom | Cause | Fix |
|---|---|---|
| Slow first paint | Render-blocking JS in `<head>` | Move all GSAP `<script>` tags before `</body>` |
| Cumulative Layout Shift | Web font swap | Use `font-display: swap` + reserve heading heights via `min-height` |
| Long Total Blocking Time | All animations setting up at once | Wrap heavy setup in `requestIdleCallback` or after `document.fonts.ready` |
| Heavy scroll jank | Too many ScrollTriggers (>50) | Use `ScrollTrigger.batch()` for similar elements instead of individual triggers |
| Slow image loads | Uncompressed PNG | Convert to WebP or base64 JPEG |
| Memory leak on long pages | SplitText instances not reverted | Call `split.revert()` when re-splitting |

---

## Measuring

Before delivery, every brief gets:

```bash
# File size check
ls -lh sample-education-brief.html

# Lighthouse audit (in Chrome DevTools)
# Targets:
#   Performance: > 85
#   Accessibility: > 95
#   Best Practices: > 90
#   SEO: > 90
```

If Performance < 80, find the heavy plugin/asset and remove. If
Accessibility < 90, run the `audit.py` checks (see `accessibility.md`).
