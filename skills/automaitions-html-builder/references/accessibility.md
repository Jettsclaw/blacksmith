# Accessibility — non-negotiables for every brief

Every brief must pass this audit before delivery. Run mentally during
build; verify with the audit script before shipping.

> **The principle:** the brief should be usable by a keyboard-only
> user, a screen reader user, someone with reduced-motion enabled, and
> someone with low vision — without us having to rebuild anything.
> All of this is baseline polish, not an afterthought.

---

## 1. Reduced motion — must collapse all animation

Every CSS block with motion must include:

```css
@media (prefers-reduced-motion: reduce) {
  .js .reveal,
  .js .stagger > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

Every GSAP JS block must check at the top:

```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.reveal, .stagger').forEach(el => el.classList.add('in'));
  return;
}
```

**Test:** macOS System Settings → Accessibility → Display →
Reduce motion. Site should render fully visible, no animations.

---

## 2. Keyboard navigation — Tab order must work

- **Topbar logo:** focusable, focus-visible ring
- **Hamburger button:** focusable, opens drawer with Enter/Space
- **Drawer links:** focusable in sequence, Escape closes drawer
- **Section anchor links** (desktop sidebar): focusable, smooth-scroll on Enter
- **In-content CTAs:** focusable
- **Focus trap inside open drawer:** Tab cycles within drawer, Escape closes

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}
/* Remove only the :focus (mouse click) outline, NOT :focus-visible (keyboard) */
:focus:not(:focus-visible) { outline: none; }
```

Hamburger drawer JS must handle:
```js
function trapFocus(drawer) {
  const focusable = drawer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  drawer.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
}
```

**Test:** Tab through the entire brief from URL bar with no mouse.
Every interactive element should be reachable in logical order.

---

## 3. Screen reader landmarks

Required HTML structure:

```html
<header>                          <!-- topbar -->
  <nav aria-label="Site">         <!-- hamburger nav target -->
    <button aria-expanded="false" aria-controls="mobile-drawer" ...>
      ☰
    </button>
  </nav>
</header>

<nav id="mobile-drawer" aria-label="Sections" hidden>
  <ul>
    <li><a href="#section-1">Section 1</a></li>
    ...
  </ul>
</nav>

<main>                            <!-- ALL brief content -->
  <section id="hero" aria-labelledby="hero-title">
    <h1 id="hero-title">...</h1>
  </section>
  <section id="section-1" aria-labelledby="sec-1-title">
    <h2 id="sec-1-title">...</h2>
  </section>
  ...
</main>

<footer>                          <!-- footer -->
  ...
</footer>
```

**Rules:**
- One `<main>` per page
- `<h1>` exactly once (hero title)
- `<h2>` for section titles, never skip levels
- Every `<section>` has an `aria-labelledby` pointing to its heading
- SVG logos have `role="img"` and `aria-label="Brand Name"`
- Decorative SVGs (diagrams without explicit labels) have `role="presentation"` or `aria-hidden="true"`

**Test:** macOS VoiceOver (Cmd+F5) → Rotor (Ctrl+Option+U) → Headings.
Hierarchy should make sense top-to-bottom.

---

## 4. Colour contrast (WCAG AA minimum)

Every text/bg combo must pass:
- **Body text** (16-18px normal weight): **4.5:1**
- **Large text** (24px+ or 19px+ bold): **3:1**
- **Non-text** (icons, borders, focus rings): **3:1**

Common failures in this skill:
- `var(--accent)` (indigo `#5B5BD6`) as text on `var(--bg)` light backgrounds → FAILS (~3.8:1 on `#FAFAFA`)
  - Fix: use `var(--accent-dim)` (`#2C2C7A`) for text on light bgs
- `var(--tx-3)` (`#5A5A5A`) for body copy on light bgs → may fail
  - Fix: limit `--tx-3` to captions, labels, decorative text

Test contrast in DevTools (Lighthouse → Accessibility) before shipping.

---

## 5. Touch targets — 44×44px minimum

Every clickable element must be at least 44×44px (Apple HIG / WCAG
2.5.5). Common violations:
- Hamburger button at 36×36 → bump to 44×44 with `padding: 4px`
- Inline links in body copy at default size → wrap in larger hit area
  OR increase line-height (1.7+) so they don't feel cramped

```css
.hamburger-btn {
  width: 44px;
  height: 44px;
  padding: 8px;
}
```

---

## 6. Skip link — first focusable element

Add a "Skip to content" link as the very first focusable element so
keyboard users don't have to tab through the nav every time:

```html
<a href="#main-content" class="skip-link">Skip to content</a>

<style>
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--accent);
  color: var(--white);
  padding: 12px 20px;
  text-decoration: none;
  font-weight: 600;
  z-index: 999;
}
.skip-link:focus {
  left: 12px;
  top: 12px;
}
</style>
```

Then `<main id="main-content">` to receive the target.

---

## 7. Page title + meta

Every brief's `<head>` must include:

```html
<title>{Brief title} — {Brand}</title>
<meta name="description" content="One-sentence description ≤155 chars.">
<meta name="theme-color" content="#5B5BD6">   <!-- Brand accent for browser chrome -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- OG / Twitter -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://..."/>
<meta name="twitter:card" content="summary_large_image">
```

`viewport-fit=cover` is critical for iOS notch handling.

---

## 8. Image alt text

Every `<img>` must have:
- `alt="meaningful description"` if conveying information
- `alt=""` if purely decorative (still required, just empty)

`<picture>` and `<source>` don't change this — the `<img>` inside
still needs alt.

---

## Audit script — what to run

```bash
python3 audit.py sample-education-brief.html
```

The script checks:
- [ ] `prefers-reduced-motion` CSS present
- [ ] GSAP reduced-motion JS guard present
- [ ] `:focus-visible` rule present
- [ ] `<main>` element present
- [ ] Single `<h1>` in document
- [ ] Section heading hierarchy unbroken
- [ ] SVG logos have `role="img"` + `aria-label`
- [ ] Skip link present
- [ ] Page `<title>` set
- [ ] OG meta tags present
- [ ] No raw `color: #...` outside `:root` (means tokens skipped)

Failures BLOCK delivery. Audit must pass before reporting "done."
