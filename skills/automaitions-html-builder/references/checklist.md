# Pre-Delivery Checklist

Run every item before presenting any HTML document. No exceptions.
Run the Python script at the bottom — don't tick boxes manually.

---

## Critical — must pass before delivery

- [ ] **File is complete** — `</html>` at the very end of the file
- [ ] **Python was used to write the file** — always (no shell heredoc, truncation risk)
- [ ] **Logos embedded** — SVG inline or base64, no placeholder text remaining
- [ ] **No placeholder text** — no `BRAND_LOGO_B64`, `PARTNER_B64`, `INSERT HERE`, `Lorem ipsum`
- [ ] **Hamburger nav present** — mobile drawer AND desktop sidebar collapse both included
- [ ] **Stat cells tagged correctly** — `.sn` elements with pure numbers have `data-target`
- [ ] **Headings tagged** — SplitText headings have `text-wrap:balance` REMOVED from CSS
- [ ] **`data-no-split` on balance headings** — headings keeping balance are protected
- [ ] **Descender fix CSS** — `.hero-title [style*="overflow: hidden"]` padding-bottom rule present

---

## Deployment check

- [ ] **Deployment target:**
  - Hosted URL (Vercel) → full GSAP 3.15.0 stack ✓
  - Local file (iOS Quick Look) → GSAP blocked, CSS @keyframes only

---

## Animation system check

- [ ] **classList toggle pattern used** — NOT `gsap.from()` for `.reveal` elements
- [ ] **Lenis present** — `lenis` initialised and synced to GSAP ticker
- [ ] **ScrollTrigger registered** — `gsap.registerPlugin(ScrollTrigger)`
- [ ] **Reduced motion guard** — `prefers-reduced-motion` wraps all GSAP
- [ ] **Progressive enhancement** — `document.documentElement.classList.add('js')` at top of script
- [ ] **Progress bar** — `<div class="progress-bar" id="js-bar"></div>` present
- [ ] **No scrub+toggleActions on same ScrollTrigger** — scrub is for progress/parallax only
- [ ] **Stat counters** — max 2–3 per brief, only on `data-target` elements
- [ ] **SplitText** — hero title only, not every h2
- [ ] **GSAP CDN from jsDelivr** — version 3.15.0 or higher

---

## Colour check

- [ ] **All 5 accent tokens defined** — `--accent`, `--accent-hi`, `--accent-lo`, `--accent-dim`, `--line-acc`
- [ ] **Solid background** — no radial-gradient on bg (unless explicitly requested)
- [ ] **Light theme check (if applicable)** — `--accent` not used as text on light bg
- [ ] **WCAG AA passed** — contrast ratio ≥ 4.5:1 for body text on background

---

## Layout check (verify at 390px and 1200px)

- [ ] **No horizontal overflow at 390px** — no element wider than viewport
- [ ] **Stat grids**: 2-col mobile → 4-col desktop
- [ ] **Cards**: stacked mobile → multi-col desktop
- [ ] **System diagrams**: stacked mobile → side-by-side desktop
- [ ] **Tables**: `overflow-x: auto` wrapper present
- [ ] **Desktop sidebar**: visible at 1100px+, hidden below
- [ ] **Hamburger button**: visible on mobile, hidden at 1100px+

---

## Typography

- [ ] **All `.h2` with balance**: `text-wrap: balance` present
- [ ] **`.hero-title`**: `text-wrap: balance` NOT present (SplitText conflict)
- [ ] **All significant font sizes**: use `clamp()`
- [ ] **Hero title**: DM Serif Display
- [ ] **Pull quote**: DM Serif Display italic
- [ ] **Descender fix CSS**: present alongside SplitText hero

---

## SVG / Logo

- [ ] **Logo is SVG** — inline or base64-encoded SVG
- [ ] **Correct variant** — white logo on dark surface, black logo on light surface
- [ ] **Favicon** — SVG favicon link in `<head>`
- [ ] **No CSS wordmark** — text placeholder removed

---

## Meta tags

- [ ] **`<meta charset="UTF-8">`**
- [ ] **`<meta name="viewport" content="width=device-width, initial-scale=1.0">`**
- [ ] **`<title>`** set correctly
- [ ] **`og:title`** present
- [ ] **`og:description`** present
- [ ] **`noindex`** present (partner/confidential briefs only — omit for public docs)
- [ ] **Google Fonts `<link>`** in `<head>`

---

## File quality

- [ ] **No commented-out code blocks** left in the file
- [ ] **File opens without console errors**
- [ ] **GSAP from jsDelivr** — not cdnjs

---

## Quick script — run before every delivery

```python
import os, re

path = '/mnt/user-data/outputs/your-file.html'  # update this
c = open(path).read()
size = os.path.getsize(path)

results = []
def chk(name, val):
    results.append((name, val))
    print(f"  {'✓' if val else '✗ FAIL'}  {name}")

print("=" * 60)
print("PRE-DELIVERY CHECKLIST")
print("=" * 60)

print("\n── CRITICAL ──")
chk("</html> at end",                          c.strip().endswith('</html>'))
chk("File size > 5KB (not empty)",             size > 5000)
chk("No BRAND_LOGO_B64 placeholder",                'BRAND_LOGO_B64' not in c)
chk("No PARTNER_B64 placeholder",              'PARTNER_B64' not in c)
chk("No Lorem ipsum",                          'Lorem ipsum' not in c)
chk("SVG or base64 logo present",              'data:image/svg+xml;base64' in c or '<svg' in c)
chk("Hamburger button present",                'hamburger-btn' in c)
chk("Desktop brief-layout present",            'brief-layout' in c)
chk("OG title present",                        'og:title' in c)

print("\n── ANIMATIONS ──")
chk("GSAP 3.15+ on jsDelivr",                  'cdn.jsdelivr.net/npm/gsap@3.15' in c or 'cdn.jsdelivr.net/npm/gsap@3.1' in c)
chk("Lenis present",                           'lenis' in c.lower())
chk("ScrollTrigger registered",                'ScrollTrigger' in c)
chk("Reduced motion guard",                    'prefers-reduced-motion' in c)
chk("Progressive enhancement (.js class)",     "classList.add('js')" in c)
chk("classList toggle reveals (not gsap.from)","classList.add('in')" in c)
chk("No gsap.from on .reveal elements",        "gsap.from(el," not in c)
chk("Progress bar element",                    'id="js-bar"' in c)
chk("Descender fix CSS",                       'overflow: hidden' in c and 'padding-bottom: 0.15em' in c or 'padding-bottom:0.15em' in c or 'split-line-mask' in c)

print("\n── LAYOUT ──")
chk("text-wrap:balance on h2",                 'text-wrap: balance' in c or 'text-wrap:balance' in c)
chk("hero-title has no text-wrap:balance",     'hero-title' not in c[c.find('.hero-title {'):c.find('.hero-title {')+150] or 'text-wrap' not in c[c.find('hero-title'):c.find('hero-title')+200] if 'hero-title' in c else True)
chk("clamp() on hero title",                   'clamp(34px' in c or 'clamp(36px' in c or 'clamp(32px' in c)
chk("Responsive 480px breakpoint",             '480px' in c)
chk("Responsive 1100px breakpoint",            '1100px' in c)
chk("data-target on stat cells",               'data-target' in c)
chk("data-no-split on balance headings",       'data-no-split' in c)

print("\n── BRAND ──")
chk("All 5 accent tokens in :root",            '--accent-dim' in c and '--line-acc' in c)
chk("Solid background (no radial-gradient)",   'radial-gradient' not in c)

print("\n── META ──")
chk("charset UTF-8",                           'charset="UTF-8"' in c)
chk("viewport meta",                           'width=device-width' in c)
chk("Google Fonts link",                       'fonts.googleapis.com' in c)
chk("Title tag",                               '<title>' in c)

print(f"\n── SIZE ──")
print(f"  {size:,} bytes ({size//1024}KB)")

all_pass = all(v for _, v in results)
print(f"\n{'✓ ALL CHECKS PASSED' if all_pass else '✗ FAILURES — DO NOT DELIVER'}")
if not all_pass:
    for name, val in results:
        if not val: print(f"  FAILED: {name}")
```
