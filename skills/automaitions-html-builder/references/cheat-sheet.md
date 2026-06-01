# Design system cheat sheet

The whole skill in one file. Read this FIRST for orientation. Use the
full references in this folder for depth on specific topics. The
numbers and patterns below are **locked** — don't tune by feel,
don't paraphrase, don't substitute. They're load-bearing.

This sheet is mirrored at `templates/*/cheat-sheet.md` so every
template shape carries its own copy.

---

## 1. Locked motion timings (from ZERA-RULEBOOK §1)

Source of truth. Never improvise.

| Motion | Duration | Easing | Notes |
|--------|----------|--------|-------|
| Section reveal (fade + rise) | **0.55s** | `cubic-bezier(0.22, 1, 0.36, 1)` | y: 20px |
| Stagger child | **0.40s** | same | y: 12px, +0.06s delay per child |
| Hero SplitText lines | **0.85s** | `power3.out` | stagger 0.12s, delay 0.2s |
| Stat counter | **1.8s** | `power2.out` | fire once on enter |
| Progress bar | scrub `0` | `none` | tied to page scroll |
| Parallax | scrub `1.5` | `none` | position-linked only |
| Nav drawer open | **0.35s** | `power2.out` | close 0.30s `power2.in` |
| Modal open | **0.35s** | `var(--ease)` | scrim opacity + modal y translate |
| Hover state | **0.15s** | `ease` | desktop pointer only |

---

## 2. Type hierarchy

Body is **16px fixed** — NEVER shrink below. Everything else `clamp()`.

```css
body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
.serif { font-family: 'DM Serif Display', serif; }

/* H1 hero      */ font-size: clamp(40px, 7vw, 84px);   line-height: 1.04; letter-spacing: -0.02em;
/* H2 section   */ font-size: clamp(28px, 4.5vw, 52px); line-height: 1.08; letter-spacing: -0.018em;
/* H3 sub       */ font-size: clamp(20px, 2.6vw, 28px); line-height: 1.25; letter-spacing: -0.01em;
/* H4 card      */ font-size: clamp(17px, 1.9vw, 21px); line-height: 1.3;
/* Stat number  */ font-size: clamp(28px, 4vw, 36px);   line-height: 1; (DM Serif, gradient text)
/* Body         */ font-size: 16px;                     line-height: 1.65; color: var(--tx-2)
/* Body lg      */ font-size: clamp(17px, 1.5vw, 19px); line-height: 1.55;
/* Eyebrow      */ font-size: 11px;                     letter-spacing: 0.24em; text-transform: uppercase
```

**Rules:**
- `text-wrap: balance` on every H1/H2/H3 — eliminates widow words
- **STRIP** `text-wrap: balance` from `.hero-title` IF SplitText is applied — they conflict and masks misalign
- Google Fonts import: `DM+Sans` (300-700) + `DM+Serif+Display`

---

## 3. Token block (paste into `:root`)

```css
:root {
  /* ACCENT (primary identity — ~85% of weight) */
  --accent:      #5B5BD6;       /* configurable per brand-config.json */
  --accent-hi:   #7B7BE8;
  --accent-lo:   #4A4ABC;
  --accent-dim:  #2C2C7A;
  --accent-line: rgba(91,91,214,.22);
  --accent-glow: rgba(91,91,214,.32);

  /* WARM (sparing complement — ~15% of weight) */
  --warm:        #E07856;       /* nullable per brand-config */
  --warm-hi:     #ED9276;
  --warm-lo:     #C8624A;
  --warm-line:   rgba(224,120,86,.22);

  /* SURFACES (4-depth layers, dark theme default) */
  --bg:   #0A0A0A;
  --s1:   #111111;
  --s2:   #161616;
  --s3:   #1D1D1D;

  /* BORDERS */
  --line:    #1F1F1F;
  --line-hi: #2A2A2A;
  --line-2:  #353535;

  /* TEXT (4-step scale) */
  --tx-1: #FAFAFA;
  --tx-2: #A0A0A0;
  --tx-3: #6A6A6A;
  --tx-4: #4A4A4A;

  /* SPACING */
  --space-page:    clamp(20px, 5vw, 56px);
  --space-section: clamp(64px, 9vw, 128px);
  --space-block:   clamp(32px, 5vw, 64px);
  --gutter:        clamp(16px, 2.5vw, 32px);

  /* MOTION */
  --ease:      cubic-bezier(0.22, 1, 0.36, 1);
  --t-reveal:  0.55s;
  --t-stagger: 0.40s;
  --t-hover:   0.15s;
  --t-drawer:  0.35s;
}
```

---

## 4. Coral usage — the 85/15 rule

The brand wins on **restraint**. Indigo dominates (~85% of visual
weight). Coral is the spice (~15%). Never co-primary.

**Where coral SHOULD appear** (premium accent moments):
- Gradient endings on two-clause headlines: `<span class="grad-text">Spend it wisely.</span>`
- Italic emphasis in body copy: `<em>collapse the handoffs</em>` (italics in coral)
- "Warm" eyebrow on emotional/human sections: `<p class="eyebrow warm">BUILT FOR EVERY SCALE</p>`
- Dashed-border accents on use-case differentiator callouts
- Accent moments in gradient blob art (alongside indigo, never replacing)
- The "Time is the only currency" closing CTA

**Where coral SHOULD NOT appear**:
- Primary CTAs (those are indigo)
- Body text colour (those are `--tx-2`)
- Card borders or surfaces
- Headings (only the gradient END of two-clause headlines, never the whole heading)
- Navigation
- More than one element per visible viewport at a time

**Rule of thumb:** if a section is more than 25% coral by area or
attention, pull it back. The premium feel comes from indigo carrying
the weight and coral landing once per section as a moment.

For light-theme brands (`"theme": "light"` in brand-config), coral
still follows 85/15 — even more restrained because warm tones read
hotter on light surfaces.

---

## 5. Mandatory patterns

### classList toggle for reveals — NEVER `gsap.from()`

```js
gsap.utils.toArray('.reveal').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 88%',
    onEnter:     () => el.classList.add('in'),
    onLeaveBack: () => el.classList.remove('in'),
  });
});
// WRONG: gsap.from(el, { opacity: 0, ... }); ← fights CSS opacity:0, elements stay invisible
```

### Lenis smooth scroll setup

```js
const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.5 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

**Never** use `duration:` in Lenis init or `scroll-behavior: smooth` in CSS — both fight Lenis.

### SplitText descender clip fix

```css
.hero-title .split-line-mask,
.hero-title [style*="overflow: hidden"] {
  padding-bottom: 0.15em !important;
  margin-bottom: -0.15em !important;
}
```

Without this, descenders on g/y/p/j/q clip. Required whenever SplitText runs on the hero.

### Sticky pin — use CSS `position: sticky`, NEVER GSAP `pin: true`

`pin: true` fights Lenis on Chrome — visible tear and jitter. Use
native `position: sticky; top: 0` on the pin container, give the outer
container `height: 300vh` (3-viewport runway for 3-stage reveal), let
GSAP drive only the *content inside* the pinned area (opacity, scale,
crossfade).

### Hamburger nav — mandatory on EVERY document

Mobile drawer (slides in from left) + visible-by-default desktop
sidebar. Not optional. See `responsive.md` for the full pattern; the
two existing templates and the new marketing-site template both ship
with it correctly wired.

### Lenis + forms — prevent scroll lock on input focus

Tall forms with Lenis active can feel "stuck" when the user's cursor
lands on a form input — Lenis intercepts wheel/touch events. Two-line fix:

```html
<input data-lenis-prevent>
<textarea data-lenis-prevent></textarea>
<select data-lenis-prevent></select>
```

Plus add `overscroll-behavior: contain` on the form container.

---

## 6. Top 5 bugs to skip on every build

From `lessons.md`. These bite hardest on multi-page sites.

1. **`gsap.from()` on `.reveal`** → animates 0→0 when CSS sets `opacity: 0`. Use `classList.add('in')` instead.
2. **SplitText descenders clipped** → g, y, p, j, q cut off. Add the padding-bottom/margin-bottom fix above.
3. **`pin: true` jitters with Lenis** → use CSS `position: sticky`, drive inner content only.
4. **`text-wrap: balance` on SplitText headers** → masks misalign after layout recalc. Strip from `.hero-title`, keep on `.h2`.
5. **`overflow: hidden` ANYWHERE up the tree from `position: sticky`** → silently breaks sticky. Audit ancestors.

Bonus (multi-page sites): **modal scroll lock** — when you set
`overflow: hidden` on body during modal open, defensively *clear* it
on page load too. Otherwise a stale class can lock the next page's
scroll.

---

## 7. Mandatory inline HTML head block (passes the audit)

The audit script greps the HTML file directly. External CSS/JS doesn't
satisfy it. Put this in every page's `<head>` after the external
stylesheet link:

```html
<meta name="theme-color" content="#5B5BD6">
<style>
  :focus-visible { outline: 2px solid #5B5BD6; outline-offset: 3px; border-radius: 4px; }
  .skip-link { position: fixed; top: -80px; left: 12px; padding: 10px 16px; background: #5B5BD6; color: #fff; border-radius: 8px; z-index: 999; font-weight: 500; transition: top 0.2s; }
  .skip-link:focus { top: 12px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  }
</style>
```

And as the first element of `<body>`:

```html
<a href="#main" class="skip-link">Skip to content</a>
```

And before `assets/scripts.js` loads:

```html
<script>
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  window.__prm = matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>
```

And `id="main"` on the `<main>` element.

---

## 8. Plugin loadout (GSAP 3.15.0, jsDelivr only)

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
```

Add SplitText only when the hero needs it. Add DrawSVG only for
SVG line-draw reveals. Don't load plugins you won't use — each is
~10KB.

---

## 9. Two template shapes

The skill ships two starting points:

| Template | Use it when | Pattern library |
|---|---|---|
| `templates/partner-brief-template.html` | Single long-scroll document — partner pitch, member playbook, retailer guide, education doc | Stat cards, timelines, member grids, comparison tables, hero with SplitText, sticky-pin stacking sections |
| `templates/visual-explainer-template.html` | Concept explainer with 8 SVG diagram archetypes | All of the above + auto-detected SVG entrance animations per archetype |
| `templates/marketing-site-template/` | Multi-page website — marketing site, product launch, client microsite. Shared nav/footer/modals, cross-page linking, forms | All of the above + ornament dividers, 3-card grids, gradient blob art, 6-card vertical use-case stacks, numbered carousel, FAQ accordion, 3-tab modal CTAs, Formspree forms, multi-column footer |

Pick by output shape, not by industry. A single-page partner pitch
uses the brief template even if it's selling a website. A four-page
microsite uses the marketing-site template even if it's a one-product
launch.

---

## 10. Audit script (`audit.py`)

Run `python3 audit.py <filename>` on every page before commit.

Checks the HTML file directly for: reduced-motion CSS, reduced-motion
JS guard, focus-visible style, skip link, `<main>` element, single
`<h1>`, OG/title/viewport meta tags, theme-color meta, no
scroll-behavior:smooth, no GSAP pin:true, Lenis uses lerp not
duration, GSAP plugins registered, SVG logos have aria-label, hero
descender fix, counter uses gsap.to, hamburger nav present, no dev
URLs.

Exit code 0 = pass, 1 = error. Warn-level items don't block.

**Works on both single-brief AND multi-page-site shapes.** Run it on
every page of a marketing site individually.
