# Responsive Design

## Core principle: mobile-first

**Design at 390px. Scale up.** Add complexity upward with `@media (min-width: X)`.
Never `@media (max-width: X)` to fix mobile problems — that's desktop-first patching.

---

## Breakpoint system

| Width | Trigger |
|---|---|
| 390px | Base — iPhone 14, the design canvas |
| 480px | Stats: 2-col → 4-col |
| 540px | System diagrams: stack → side-by-side |
| 640px | Primary switch — member cards, partner grids |
| 900px | Desktop layout growing |
| 1100px | Full desktop — sticky sidebar appears |

---

## Hamburger nav — MANDATORY on every document

Both mobile overlay and desktop sidebar collapse are required on every brief.

### HTML structure

```html
<!-- Progress bar -->
<div class="progress-bar" id="js-bar"></div>

<!-- Mobile overlay backdrop -->
<div class="mobile-overlay" id="mobile-overlay"></div>

<!-- Mobile nav drawer -->
<nav class="mobile-nav" id="mobile-nav" aria-label="Site navigation">
  <div class="mobile-nav-header">
    <span class="mobile-nav-title">Contents</span>
    <button class="mobile-nav-close" id="mobile-nav-close" aria-label="Close navigation">
      <span></span><span></span>
    </button>
  </div>
  <div class="mobile-nav-links">
    <a href="#section-1">01 · Section One</a>
    <a href="#section-2">02 · Section Two</a>
    <!-- etc -->
  </div>
</nav>

<!-- Page wrapper -->
<div class="page">

  <!-- Topbar with hamburger -->
  <div class="topbar">
    <div class="topbar-left">
      <button class="hamburger-btn" id="hamburger-btn" aria-label="Open navigation">
        <span></span><span></span><span></span>
      </button>
      <!-- Logo here -->
    </div>
    <div class="topbar-right">
      <div class="topbar-meta">Brief Type · Month Year</div>
    </div>
  </div>

  <!-- Desktop layout -->
  <div class="brief-layout">

    <!-- Desktop sidebar (hidden on mobile) -->
    <nav class="brief-nav" id="brief-nav">
      <button class="nav-collapse-btn" id="nav-collapse-btn" aria-label="Collapse navigation">←</button>
      <span class="brief-nav-label">Contents</span>
      <a href="#section-1">01 · Section One</a>
      <a href="#section-2">02 · Section Two</a>
      <!-- etc -->
    </nav>

    <!-- Main content -->
    <div class="brief-content">
      <!-- Hero, sections, close go here -->
    </div>

  </div><!-- /brief-layout -->

  <footer><!-- footer content --></footer>

</div><!-- /page -->
```

### CSS — hamburger + mobile nav

```css
/* ── MOBILE OVERLAY ── */
.mobile-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,.6);
  z-index: 90;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.mobile-overlay.open { display: block; }

/* ── MOBILE NAV DRAWER ── */
.mobile-nav {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: min(300px, 85vw);
  background: var(--s1);
  border-right: 1px solid var(--line-hi);
  z-index: 100;
  transform: translateX(-100%);
  display: flex; flex-direction: column;
  padding: 0;
}
.mobile-nav.open { transform: translateX(0); }

.mobile-nav-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--line);
}
.mobile-nav-title {
  font-size: 8px; font-weight: 700; letter-spacing: .2em;
  text-transform: uppercase; color: var(--tx-3);
}
.mobile-nav-close {
  background: none; border: none; cursor: pointer;
  width: 32px; height: 32px; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.mobile-nav-close span {
  position: absolute; width: 16px; height: 1.5px;
  background: var(--tx-2); display: block;
}
.mobile-nav-close span:first-child { transform: rotate(45deg); }
.mobile-nav-close span:last-child  { transform: rotate(-45deg); }

.mobile-nav-links {
  padding: 12px 0; overflow-y: auto; flex: 1;
}
.mobile-nav-links a {
  display: block;
  font-size: 13px; color: var(--tx-2);
  text-decoration: none;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
  transition: color .15s ease, background .15s ease;
  letter-spacing: .01em;
}
.mobile-nav-links a:last-child { border-bottom: none; }
.mobile-nav-links a:hover,
.mobile-nav-links a.active { color: var(--accent); background: var(--s2); }

/* ── HAMBURGER BUTTON ── */
.hamburger-btn {
  background: none; border: none; cursor: pointer;
  width: 36px; height: 36px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 5px;
  padding: 4px;
}
.hamburger-btn span {
  display: block; width: 22px; height: 1.5px;
  background: var(--tx-1);
  transition: transform .25s ease, opacity .25s ease;
}
.hamburger-btn.active span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.hamburger-btn.active span:nth-child(2) { opacity: 0; }
.hamburger-btn.active span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* ── DESKTOP SIDEBAR ── */
.brief-nav { display: none; } /* hidden on mobile */

/* ── BRIEF LAYOUT ── */
.brief-layout {
  /* Mobile: no grid, just stacked */
}

/* ── TOPBAR LEFT ── */
.topbar-left { display: flex; align-items: center; gap: 14px; }
```

### CSS — desktop layout (1100px+)

```css
@media (min-width: 1100px) {
  .page { max-width: 1200px; padding: 0 48px 100px; }

  .hamburger-btn { display: none; } /* hide mobile hamburger at desktop */

  .brief-layout {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 88px;
    align-items: start;
  }

  .brief-nav {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 48px;
    align-self: start;
    overflow: hidden;
    transition: width .3s ease, opacity .3s ease;
  }

  .nav-collapse-btn {
    display: block;
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: var(--tx-3);
    padding: 0 0 14px 0;
    text-align: left;
    letter-spacing: .08em;
    transition: color .15s ease;
    align-self: flex-start;
  }
  .nav-collapse-btn:hover { color: var(--accent); }
  .nav-collapse-btn.collapsed { content: '→'; }

  .brief-nav-label {
    display: block;
    font-size: 8px; font-weight: 700;
    letter-spacing: .2em; text-transform: uppercase;
    color: var(--tx-3);
    padding-bottom: 14px; margin-bottom: 2px;
    border-bottom: 1px solid var(--line);
  }

  .brief-nav a {
    display: block;
    font-size: 11px; color: var(--tx-3);
    text-decoration: none;
    padding: 7px 0 7px 14px;
    border-left: 1px solid var(--line-hi);
    line-height: 1.4; letter-spacing: .01em;
    transition: color .18s ease, border-color .18s ease;
  }
  .brief-nav a:hover { color: var(--tx-2); border-color: var(--tx-3); }
  .brief-nav a.active { color: var(--accent); border-color: var(--accent); }

  .brief-content { min-width: 0; }
}
```

### JS — hamburger (add to GSAP block, see animations.md)

```javascript
// ── Hamburger setup ──
const hamburgerBtn  = document.getElementById('hamburger-btn');
const mobileNav     = document.getElementById('mobile-nav');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileClose   = document.getElementById('mobile-nav-close');
let mobileOpen = false;

function openMobileNav() {
  mobileOpen = true;
  mobileNav.classList.add('open');
  mobileOverlay.classList.add('open');
  hamburgerBtn.classList.add('active');
  document.body.style.overflow = 'hidden';
  gsap.from(mobileNav, { x: '-100%', duration: 0.35, ease: 'power2.out' });
  gsap.from('.mobile-nav-links a', {
    x: -16, opacity: 0, stagger: 0.04,
    duration: 0.3, ease: 'power2.out', delay: 0.1
  });
}

function closeMobileNav() {
  mobileOpen = false;
  hamburgerBtn.classList.remove('active');
  document.body.style.overflow = '';
  gsap.to(mobileNav, {
    x: '-100%', duration: 0.28, ease: 'power2.in',
    onComplete: () => {
      mobileNav.classList.remove('open');
      mobileOverlay.classList.remove('open');
    }
  });
}

hamburgerBtn?.addEventListener('click', () => mobileOpen ? closeMobileNav() : openMobileNav());
mobileClose?.addEventListener('click', closeMobileNav);
mobileOverlay?.addEventListener('click', closeMobileNav);
document.querySelectorAll('.mobile-nav-links a').forEach(a => {
  a.addEventListener('click', closeMobileNav);
});

// ── Desktop sidebar collapse ──
const collapseBtn = document.getElementById('nav-collapse-btn');
const briefNav    = document.getElementById('brief-nav');
let sidebarOpen = true;

collapseBtn?.addEventListener('click', () => {
  sidebarOpen = !sidebarOpen;
  if (sidebarOpen) {
    briefNav.style.overflow = 'hidden';
    gsap.to(briefNav, { width: 180, opacity: 1, duration: 0.3, ease: 'power2.out',
      onComplete: () => { briefNav.style.overflow = ''; }
    });
    collapseBtn.textContent = '←';
  } else {
    gsap.to(briefNav, { width: 20, opacity: 0.4, duration: 0.3, ease: 'power2.in' });
    collapseBtn.textContent = '→';
  }
});
```

---

## Fluid spacing with clamp()

```css
:root {
  --space-page:    clamp(18px, 5vw, 48px);
  --space-section: clamp(48px, 7vw, 72px);
  --space-card:    clamp(16px, 3vw, 24px);
  --space-gap:     clamp(8px,  2vw, 12px);
}
```

---

## Grid patterns

```css
/* Stats: 2-col → 4-col */
.sg { display: grid; grid-template-columns: repeat(2,1fr); gap: 1px; background: var(--line-hi); }
@media (min-width: 480px) { .sg { grid-template-columns: repeat(4,1fr); } }

/* 3-col always */
.sg3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--line-hi); }

/* Member cards: 1-col → 3-col */
.member-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 640px) { .member-grid { grid-template-columns: repeat(3,1fr); gap: 12px; } }

/* Partner cards: 1-col → 2-col */
.pg { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--line-hi); }
@media (min-width: 480px) { .pg { grid-template-columns: 1fr 1fr; } }

/* System diagram: stack → side-by-side */
.sys-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 540px) { .sys-grid { grid-template-columns: 1fr 38px 1fr; align-items: stretch; } }

/* OS pillars: 2-col → 3-col */
.os-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1px; background: var(--line-hi); }
@media (min-width: 500px) { .os-grid { grid-template-columns: repeat(3,1fr); } }

/* Loss/filter cards: 1-col → 3-col */
.loss-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--line-hi); }
@media (min-width: 540px) { .loss-grid { grid-template-columns: repeat(3,1fr); } }
```

---

## Overflow prevention

```css
img { max-width: 100%; height: auto; }
.table-wrap { overflow-x: auto; }
.copy, .mc-items li { word-break: break-word; }
svg { max-width: 100%; }
```
