# Typography

## Font stack (locked)

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

body {
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.serif { font-family: 'DM Serif Display', serif; }
```

DM Serif Display → hero titles, section headings, pull quotes, stat numbers
DM Sans → all other text

---

## Fluid type scale (clamp — required on all sizes)

Use `clamp(min, preferred, max)`. The preferred value uses `vw` for smooth scaling.

| Role | CSS | Notes |
|---|---|---|
| Hero title | `clamp(34px, 7vw, 58px)` | Never fixed |
| Section heading | `clamp(26px, 4.5vw, 38px)` | Never fixed |
| Sub-heading | `clamp(20px, 3vw, 28px)` | |
| Stat number large | `clamp(28px, 4vw, 36px)` | DM Serif |
| Stat number medium | `clamp(22px, 3vw, 30px)` | |
| Body copy | `16px` | Fixed — accessibility |
| Body secondary | `14px–15px` | Fixed |
| Label / caption | `13px` | Fixed |
| Eyebrow | `9px` | Fixed — all-caps |
| Badge text | `8px` | Fixed — all-caps |

---

## Text roles and styling

### Eyebrow (section number / category label)
```css
.eyebrow {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--accent-lo);    /* never full accent — too loud */
}
```
**Pattern:** `01 · SECTION NAME` with a full-width rule after it:
```css
.sec-num {
  display: flex; align-items: center; gap: 12px;
}
.sec-num::after {
  content: ''; flex: 1; height: 1px; background: var(--line-hi);
}
```

### Hero / Section title
```css
.hero-title, .h2 {
  font-family: 'DM Serif Display', serif;
  color: var(--white);
  line-height: 1.08;
  letter-spacing: -.015em;
  text-wrap: balance;          /* ALWAYS — auto-balances line breaks */
}
.h2 em { color: var(--accent); font-style: italic; }
```

### Pull quote
```css
.pull p {
  font-family: 'DM Serif Display', serif;
  font-size: 18px;
  font-style: italic;
  color: var(--accent-hi);
  line-height: 1.65;
}
```

### Body copy
```css
.copy {
  font-size: 16px;
  line-height: 1.8;
  color: var(--tx-1);
}
.copy strong { color: var(--white); font-weight: 600; }
.copy p { margin-bottom: 18px; }
.copy p:last-child { margin-bottom: 0; }
```

### Label (inside cards, table headers)
```css
.label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--tx-3);          /* tertiary — subtle */
}
```

---

## text-wrap: balance

**Always apply to headings.** Prevents widow words and uneven line lengths without manual `<br>` tags.

```css
h1, h2, h3, .hero-title, .h2 {
  text-wrap: balance;
}
```

Do NOT apply to body copy — it degrades performance on long paragraphs.

---

## Line heights by role

| Role | line-height |
|---|---|
| Hero / section title | 1.05–1.12 |
| Subheading | 1.2–1.3 |
| Body copy | 1.75–1.85 |
| List items | 1.5–1.65 |
| Labels / eyebrows | 1.2 |
| Protocol rows | 1.65 |

---

## Letter spacing by role

| Role | letter-spacing |
|---|---|
| Hero title | -.015em to -.02em (tight) |
| Body copy | 0 (default) |
| Eyebrow | .20–.26em (wide) |
| Badge | .14–.18em (wide) |
| Stat number | 0 |
| Table header | .12–.16em |

---

## Text overflow handling

For single-line truncation:
```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

For multi-line truncation (e.g. card body, 3 lines max):
```css
.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

In SVG: keep labels ≤30 chars at 10px, ≤24 chars at 11px, ≤20 chars at 12px. Test at the viewBox scale.
