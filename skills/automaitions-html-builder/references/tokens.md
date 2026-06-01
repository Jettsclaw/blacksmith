# Design Tokens

## Important: Read colour-psychology.md FIRST

All palette derivation logic, OKLCH engine, surface rules, and intent
mapping live in `colour-psychology.md`. This file covers the CSS token
system only.

---

## Placeholder default palette (replace via brand-config.json)

The skill ships with placeholder palette tokens — light-paper surface,
slate accent. The installing team's `brand/brand-config.json`
overrides them on every build. The example below shows the indigo
palette used by the worked-example brand kit at
`examples/automaitions-brand-assets/`.

```css
/* Example: indigo palette (see examples/automaitions-brand-assets/) */
:root {
  /* ── ACCENT (5-token ramp derived from one anchor) ── */
  --accent:      #5B5BD6;       /* primary accent */
  --accent-hi:   #8585F0;       /* lighter — hover, gradient top */
  --accent-lo:   #4242AC;       /* darker — gradient bottom */
  --accent-dim:  #2C2C7A;       /* USE FOR TEXT on light bg — passes contrast */

  /* ── SOFT INDIGO TINTS (emphasis backgrounds, atmospheric glow) ── */
  --accent-tint-1: rgba(91,91,214,0.04);   /* faintest wash */
  --accent-tint-2: rgba(91,91,214,0.08);   /* card emphasis bg */
  --accent-tint-3: rgba(91,91,214,0.15);   /* tinted border */
  --accent-glow:   rgba(91,91,214,0.20);   /* radial glow */

  /* ── SURFACES (paper-based, 4 depth layers) ── */
  --bg:   #FFFFFF;              /* paper */
  --s1:   #F4F4F7;              /* cards, containers */
  --s2:   #E8E8EE;              /* lifted state */
  --s3:   #D8D8E0;              /* highest */

  /* ── BORDERS ── */
  --line:     #E8E8EE;
  --line-hi:  #C5C5D0;

  /* ── TYPE ── */
  --tx-1:  #0A0A0A;             /* Ink — primary text */
  --tx-2:  #4A4A4A;             /* secondary */
  --tx-3:  #7A7A7A;             /* tertiary, captions */
  --white: #FFFFFF;

  /* ── SUPPORTING ACCENTS (darker variants for light-bg contrast) ── */
  --gold:  #B8941F;
  --coral: #C44A3F;
  --green: #2D7A4A;

  /* ── SEMANTIC ── */
  --green-tx:  rgba(45,122,74,.9);
  --red-tx:    rgba(196,74,63,.9);
  --warn-tx:   rgba(184,148,31,.9);

  /* ── SPACING ── */
  --space-page:    clamp(20px, 5vw, 56px);
  --space-section: clamp(48px, 7vw, 80px);
}
```

**Light theme rule:** never use `var(--accent)` as text colour on
light bg — fails WCAG AA contrast. Use `var(--accent-dim)` for body
text; `var(--accent)` is for backgrounds, borders, icons, button
fills, and large display type (24px+) only.

## Dark theme variant (use when explicitly requested)

For dark-surface briefs, swap the surfaces + text tokens. Indigo ramp
stays the same; supporting accents brighten:

```css
:root {
  /* ── ACCENT (same indigo ramp) ── */
  --accent:      #5B5BD6;
  --accent-hi:   #7B7BE8;
  --accent-lo:   #4A4ABC;
  --accent-dim:  #2C2C7A;
  --line-acc:    rgba(91,91,214,.22);

  /* ── SURFACES (dark, 4 depth layers) ── */
  --bg:   #0A0A0A;              /* Near-Black (ink) */
  --s1:   #141414;
  --s2:   #1C1C1C;
  --s3:   #262626;

  /* ── BORDERS ── */
  --line:     #1F1F1F;
  --line-hi:  #2F2F2F;

  /* ── TYPE ── */
  --tx-1:  #FAFAFA;             /* Off-White (paper) — primary text */
  --tx-2:  #9A9A9A;
  --tx-3:  #5A5A5A;
  --white: #FFFFFF;

  /* ── SUPPORTING ACCENTS (brighter for dark bg) ── */
  --gold:  #F4D03F;
  --coral: #E67E73;
  --green: #5AC785;
}
```

On dark bg, `var(--accent)` is fine for text (large or small). The
contrast goes the other way.

---

## Surface depth logic

```
--bg   → page background — content sits on surfaces, not directly on bg
--s1   → cards, containers, table rows, diagram backgrounds
--s2   → lifted card, featured item, active state, hover
--s3   → highest — badge bg, tooltip, active tab indicator
```

**Gap-as-border pattern** (cleaner than individual borders):
```css
.grid { display: grid; gap: 1px; background: var(--line-hi); }
.grid > * { background: var(--s1); }
```

---

## Gradient text — large display type only

The signature Vertus-style indigo gradient. Apply to hero h1 em,
stat counter numbers, section h2 em (large only).

```css
.gradient-accent {
  background: linear-gradient(135deg, var(--accent-hi), var(--accent), var(--accent-lo));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 100%;
}
```

On dark themes — use the brighter end of the ramp:
```css
background: linear-gradient(145deg, var(--accent-hi), var(--accent));
```

Never apply gradient text to body copy, subheadings, or anything
smaller than 24px.

## Emphasis card — soft indigo tint

For cards that need to feel "active" or "special". The Vertus
"Monitoring billions" treatment.

```css
.emphasis-card {
  background: linear-gradient(135deg, var(--accent-tint-1), var(--accent-tint-2));
  border: 1px solid var(--accent-tint-3);
  border-radius: 12px;
}
```

## Atmospheric glow — radial backdrop

For hero, sticky pin, brand-moment sections. Subtle indigo wash that
makes the centre of attention feel luminous.

```css
.glow-bg { position: relative; }
.glow-bg::before {
  content: '';
  position: absolute;
  inset: -10%;
  background: radial-gradient(ellipse at center, var(--accent-glow), transparent 60%);
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
}
```

---

## Topbar accent line — required on every document

```css
.topbar { position: relative; }
.topbar::before {
  content: '';
  position: absolute;
  top: 0; left: -48px; right: -48px; height: 1px;
  background: linear-gradient(
    90deg, transparent, var(--accent) 30%, var(--accent) 70%, transparent
  );
  opacity: .45;
}
```

---

## Semantic status colours

For priority badges, alert states, validation:

```css
:root {
  --status-critical: rgba(220,60,60,.9);
  --status-high:     rgba(220,120,40,.9);
  --status-medium:   rgba(200,160,40,.9);
  --status-low:      rgba(91,91,214,.9);     /* Indigo accent */
  --status-pass:     rgba(74,200,140,.9);

  --badge-critical-bg: rgba(220,60,60,.12);
  --badge-high-bg:     rgba(220,120,40,.12);
  --badge-medium-bg:   rgba(200,160,40,.12);
}
```

---

## brand/brand-config.json schema

`brand-config.json` is the only source-of-truth for the brand's
palette tokens, voice, and logo slot mapping. The skill reads it on
every build.

```json
{
  "name": "Your Brand",
  "wordmark": "yourbrand",

  "palette": {
    "accent":      "#5B5BD6",
    "accentLight": "#7B7BE8",
    "accentDark":  "#4A4ABC",
    "accentDim":   "#2C2C7A",

    "ink":   "#0A0A0A",
    "paper": "#FAFAFA"
  },

  "theme": "light",

  "typography": {
    "serif": "DM Serif Display",
    "sans": "DM Sans"
  },

  "logos": {
    "wordmarkDark":  "brand/mono-light.svg",
    "wordmarkLight": "brand/mono-dark.svg",
    "markDark":      "brand/glyph-only-white.svg",
    "markLight":     "brand/glyph-only-ink.svg",
    "markAccent":    "brand/glyph-only-indigo.svg",
    "favicon":       "brand/favicon.svg"
  },

  "voice": {
    "tone": "configure-this",
    "references": ["replace with brands whose voice yours respects"],
    "avoid": ["replace with words your brand never uses"]
  }
}
```

If `name` is still `"Your Brand"`, the skill refuses to ship. See
`brand/README.md` for the slot guide and
`examples/automaitions-brand-assets/brand-config.json` for a worked
example of a real configured brand.

Only `palette.accent` is required — the skill derives the ramp via
`colour-psychology.md` OKLCH engine if `accentLight`/`accentDark`/
`accentDim` aren't provided.
