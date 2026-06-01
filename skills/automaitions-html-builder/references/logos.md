# Logos — SVG-first, surface-aware

> **Why SVG-first:** infinitely sharp at any zoom, smaller file size,
> animatable per path, recolourable via CSS variables, no resolution
> concerns. PNG/JPG logos are forbidden in this skill.

---

## Brand logo slots — placeholder by default

The `brand/` folder ships with 12 placeholder SVG slots. The
installing team replaces each with their own brand's variant before
generating any briefs. Filenames are fixed — the skill references
them by slot.

| File | Slot purpose |
|---|---|
| `primary.svg` | Full mark in branded container (rounded card with glyph). Hero placements, formal docs. |
| `secondary.svg` | Alt variant of primary |
| `mono-dark.svg` | Wordmark in single dark ink — for **light surfaces** (body text colour) |
| `mono-light.svg` | Wordmark in single white/paper — for **dark surfaces** |
| `knockout.svg` | Wordmark cut out of a coloured background |
| `all-indigo.svg` | Wordmark entirely in the brand's accent colour — for hero/feature placements |
| `glyph-only-indigo.svg` | Just the glyph in accent — favicon, social, accent |
| `glyph-only-ink.svg` | Glyph in ink — for light surfaces |
| `glyph-only-white.svg` | Glyph in white — for dark surfaces |
| `primary-dark.svg` / `primary-light.svg` | Surface-specific variants of primary |
| `favicon.svg` | Browser tab — pre-cropped at favicon dimensions |

See `brand/README.md` for the full slot guide, and
`examples/automaitions-brand-assets/` for a worked example of a real
configured kit (the Automaitions team's own brand).

## Configure-first hard fail

If `brand/brand-config.json` still has `"name": "Your Brand"`, the
skill must refuse to build a brief. `audit.py`'s
`no_placeholder_brand` check is the safety net — it fails any HTML
that still contains placeholder markers (`YOUR WORDMARK`,
`Placeholder X`, `replace brand/`, `>Your Brand<`).

---

## Surface-aware selection rule

```python
# Convert hex bg to perceived luminance
def is_dark_surface(bg_hex):
    h = bg_hex.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    L = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return L < 0.5

# Dark surface → mono-light variant (paper/white wordmark)
# Light surface → mono-dark variant (ink wordmark)
```

For the placeholder default palette (and most light themes):
- Dark theme (`--bg: #0A0A0A`) → `mono-light.svg` + `glyph-only-white.svg`
- Light theme (`--bg: #FAFAFA`) → `mono-dark.svg` + `glyph-only-ink.svg`

---

## Embed pipeline (Python)

For any file with inlined logos, USE PYTHON. Shell heredocs silently
truncate around 128KB.

### Pattern 1 — inline as `<svg>` (preferred)

Sharper, smaller, recolourable:

```python
import re
from pathlib import Path

def strip_outer(svg: str) -> str:
    """Extract the inner content from an SVG (remove XML decl + outer svg)."""
    svg = re.sub(r'<\?xml[^>]*\?>\s*', '', svg)
    m = re.search(r'<svg[^>]*>(.*)</svg>\s*$', svg, re.DOTALL)
    return m.group(1) if m else svg

WORDMARK_INNER = strip_outer(
    Path('brand/mono-light.svg').read_text()
)

def wordmark(h, cls=''):
    """Render the wordmark inline at a target pixel height.

    NOTE: use the SOURCE SVG's own viewBox — `mono-light.svg` /
    `mono-dark.svg` use viewBox `-200 -236.562 1589.941 373.799`,
    not `0 0 2048 2048` (that's primary.svg's square viewBox). Mixing
    them clips the wordmark out of view. See lessons.md §7.1.
    """
    import json
    config = json.loads(Path('brand/brand-config.json').read_text())
    brand_name = config.get('name', 'Brand')
    cls_attr = f' class="{cls}"' if cls else ''
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="-200 -236.562 1589.941 373.799"{cls_attr} '
        f'role="img" aria-label="{brand_name}" '
        f'style="height:{h}px;width:auto;display:block">'
        f'{WORDMARK_INNER}</svg>'
    )
```

Then use `wordmark(20)` in the HTML topbar, `wordmark(16)` in the footer.

### Pattern 2 — base64 in `<link rel="icon">`

For the favicon (browser tab):

```python
import base64
FAVICON_B64 = base64.b64encode(
    Path('brand/favicon.svg').read_bytes()
).decode()

# In <head>:
# <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,{FAVICON_B64}"/>
```

### Pattern 3 — recolour an inline logo

When you have a pre-coloured logo but need it in a different colour
for a specific context (e.g., a section with custom palette):

```python
WORDMARK_INK = strip_outer(
    Path('brand/mono-dark.svg').read_text()
)
# Or recolour from indigo source:
WORDMARK_DARK_NAVY = strip_outer(
    Path('brand/all-indigo.svg').read_text().replace('#5B5BD6', '#152033')
)
```

Cleaner than wrapping in a `<g>` with CSS fill — most exported SVGs
don't have `fill="currentColor"` or no-fill paths.

---

## Logo placement rules

| Where | Variant | Size |
|---|---|---|
| Topbar (left) | mono-light (dark theme) / mono-dark (light) | 20-24px height |
| Topbar (small/mobile) | glyph-only (matching surface) | 24-28px |
| Hero section | None (don't repeat — wordmark is in topbar) | — |
| Footer | mono-light/dark (matching surface), reduced opacity | 14-18px |
| Brand-moment placement | primary or all-indigo (full presence) | 32-48px |
| Favicon | favicon.svg | 16x16 effective |

**Never:**
- Place logo without sufficient clearspace (min: 0.5× cap height around)
- Apply CSS filters (grayscale, blur, opacity) to wordmark in primary placements
- Stretch — always preserve aspect ratio via `height: Npx; width: auto`
- Recolour the brand's accent fill to match a section accent — the brand's primary colour is a fixed asset configured in `brand-config.json`. If you need a section to use a different accent, use a different surface treatment instead.

---

## Validation checklist

Before delivery, every brief must pass:

- [ ] Logo present in topbar
- [ ] Logo variant matches surface (dark surface → light variant, vice versa)
- [ ] Logo has `aria-label` for screen readers
- [ ] Favicon present in `<head>`
- [ ] Logo doesn't stretch or distort on resize
- [ ] Clearspace preserved (no other elements within 0.5× cap height)
- [ ] Logo isn't clipped by overflow rules on parent
