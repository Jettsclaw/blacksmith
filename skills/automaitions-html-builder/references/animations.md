# Animations — Full GSAP 3.15.0 Arsenal

> **Source of truth for timing + hierarchy:**
> [`ZERA-RULEBOOK-motion-and-hierarchy.md`](./ZERA-RULEBOOK-motion-and-hierarchy.md)
> in this folder. When ZERA's locked values (Section 1) differ from any number
> in this file, **ZERA wins**. This file is the API reference; ZERA is the
> aesthetic spec.

## The rule before anything else

**Motion is felt, not noticed.** (ZERA §0 — restated here so it's the first
thing every build sees.) If an animation only exists to look cool, cut it.
When unsure, do less.

Seven concurrent animation systems on one page crosses from premium into showy.
The tiering system below prevents that. Apply by tier, not by availability.

**Version lock: GSAP 3.15.0** (released April 2026). Always use 3.15.0 or higher.

## Current ZERA-aligned defaults (cheat sheet)

| Move | Duration | Easing | Notes |
|---|---|---|---|
| Section reveal (fade + 20px rise) | **0.55s** | `power3.out` (≈ ZERA's `cubic-bezier(0.22,1,0.36,1)`) | The workhorse |
| Stagger child (fade + 12px rise) | **0.40s** | `power3.out` | +0.06s delay per child |
| Hero line reveal (SplitText) | 0.85s | `power3.out` | stagger 0.12s |
| Stat counter | 1.8s | `power2.out` | fire once, on enter |
| Progress bar (scrub) | n/a | `none` | tied to page scroll |
| Nav drawer slide (CSS) | **0.35s** | `cubic-bezier(0.22,1,0.36,1)` | open + close use same easing |
| Drawer link fade-in (GSAP) | **0.30s** | `power2.out` | delay 0.15s, stagger 0.045s |
| Overlay removal (after drawer close) | 350ms | timeout | matches drawer transition |
| Topbar smart-sticky hide/show | 0.35s | `cubic-bezier(0.22,1,0.36,1)` | translateY ±100% |
| Hover state (desktop only) | 0.15s | `ease` | snappy |

These are the values currently shipping across every production brief and both
templates. If you change one, update ZERA and this table together.
jsDelivr CDN. Never cdnjs — lags on plugin files.

---

## Platform context — decide this first

```
Hosted on Vercel / served via URL?
  → Full GSAP stack applies (this file in full)

Local file (iOS Quick Look, file://)?
  → JavaScript is BLOCKED. Nothing runs. No workaround exists.
  → Use CSS @keyframes load-time animations only (see bottom of file)
  → Strongly recommend hosting — Vercel deploy is 30 seconds
```

---

## CDN links — all plugins, jsDelivr

Load only the plugins you use. Core + ScrollTrigger + SplitText are always loaded.
Add additional plugins as needed per brief.

```html
<!-- ── ALWAYS LOAD ── -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>

<!-- ── LOAD AS NEEDED ── -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/DrawSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrambleTextPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/MorphSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/MotionPathPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Observer.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/InertiaPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollToPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/TextPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomEase.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollSmoother.min.js"></script>
```

---

## Complete plugin arsenal

### Tier 1 — Always. Every brief.

#### Lenis smooth scroll
Replaces native browser scroll with momentum. Single biggest perceived quality upgrade.

```javascript
const lenis = new Lenis({
  lerp: 0.1,              // 10% interpolation per frame — handles high-res wheels
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
```

#### ScrollTrigger section reveals — classList toggle (CRITICAL: not gsap.from)

**The bug to avoid:** `gsap.from()` reads the current CSS state as its target.
If CSS sets `opacity: 0` via `.js .reveal`, `gsap.from({opacity:0})` targets opacity:0
and animates from invisible to invisible — nothing appears.

**The fix:** Use `classList.add('in')` to trigger the CSS transition:

```javascript
// CORRECT — class toggle approach
gsap.utils.toArray('.reveal').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 88%',
    onEnter:     () => el.classList.add('in'),
    onLeaveBack: () => el.classList.remove('in'),
  });
});

gsap.utils.toArray('.stagger').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 86%',
    onEnter:     () => el.classList.add('in'),
    onLeaveBack: () => el.classList.remove('in'),
  });
});

// WRONG — do not use this:
// gsap.from(el, { opacity: 0, y: 28, scrollTrigger: {...} });
```

#### Progress bar

```javascript
gsap.to('#js-bar', {
  scaleX: 1, ease: 'none',
  scrollTrigger: {
    trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0
  }
});
```

**scrub vs toggleActions:** Never combine on the same ScrollTrigger.
- `scrub` → progress bar, parallax (position-linked)
- `toggleActions` → not used with class-toggle approach (ScrollTrigger fires callbacks directly)

---

### Tier 2 — Hero only. One showpiece, then restraint.

#### SplitText line-mask — hero title only

```javascript
const heroTitle = document.querySelector('.hero-title');
if (heroTitle && !heroTitle.dataset.noSplit) {
  const split = SplitText.create(heroTitle, { type: 'lines', mask: 'lines' });
  gsap.from(split.lines, {
    yPercent: 100, opacity: 0, duration: 0.85,
    stagger: 0.12, ease: 'power3.out', delay: 0.2
  });
}
```

**CRITICAL — Descender fix:** SplitText masks clip descenders (g, y, p, j, q).
Add this CSS alongside any SplitText hero:

```css
/* Descender fix — always include with SplitText hero */
.hero-title .split-line-mask,
.hero-title [style*="overflow: hidden"] {
  padding-bottom: 0.15em !important;
  margin-bottom: -0.15em !important;
}
```

**text-wrap: balance conflict:** SplitText and `text-wrap: balance` cannot coexist.
Strip `text-wrap: balance` from `.hero-title` in CSS — use it only on elements NOT split.

---

### Tier 3 — Selective. High value, specific use cases.

#### Stat counters — max 2–3 per brief

Only on `.sn` elements with `data-target`. Ranges and labels never get counters.

```javascript
gsap.utils.toArray('.sn[data-target]').forEach(el => {
  const target   = parseFloat(el.dataset.target);
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

  gsap.from({ val: 0 }, {
    val: target, duration: 1.8, ease: 'power2.out',
    onUpdate: function() {
      const v = this.targets()[0].val;
      el.textContent = prefix + (decimals ? v.toFixed(decimals) : Math.round(v)) + suffix;
    },
    scrollTrigger: { trigger: el, start: 'top 85%', once: true }
  });
});
```

#### Scroll Pinning — CSS sticky, NOT `pin: true`

The classic GSAP `pin: true` pattern fights Lenis smooth scroll and
visibly jitters. Use **native CSS `position: sticky`** for the lock and
let GSAP only drive what happens *inside* the pinned area.

```html
<section class="pin-outer">
  <div class="pin-sticky">
    <div class="pin-inner">
      <div class="pin-eyebrow"><span class="swap-wrap">
        <span class="swap-a">Stage one</span>
        <span class="swap-b">Stage two</span>
        <span class="swap-c">Stage three</span>
      </span></div>
      <h2 class="pin-headline"><span class="swap-wrap">
        <span class="swap-a">First claim</span>
        <span class="swap-b">Second claim</span>
        <span class="swap-c">Third claim</span>
      </span></h2>
    </div>
  </div>
</section>
```

```css
.pin-outer  { height: 300vh; position: relative; }   /* scroll runway */
.pin-sticky { position: sticky; top: 0; height: 100vh;
              display: flex; align-items: center; justify-content: center;
              overflow: hidden; }
.swap-wrap  { position: relative; display: block; }
.swap-wrap > * { display: block; }
.swap-wrap > *:not(:first-child) { position: absolute; left: 0; right: 0; top: 0; }
.pin-headline { min-height: 2.4em; }  /* reserve space for longest 2-line wrap */
```

```javascript
gsap.set('.pin-outer .swap-b, .pin-outer .swap-c', { opacity: 0 });
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.pin-outer',
    start:   'top top',
    end:     'bottom bottom',
    scrub:   1,           // NO pin: true — sticky handles the lock
  }
});
tl.to('.pin-outer .swap-a', { opacity: 0, duration: 0.3 }, 0.6)
  .to('.pin-outer .swap-b', { opacity: 1, duration: 0.3 }, 0.6)
  .to('.pin-outer .swap-b', { opacity: 0, duration: 0.3 }, 1.3)
  .to('.pin-outer .swap-c', { opacity: 1, duration: 0.3 }, 1.3);
```

**When to use:** ONE high-stakes moment per page — a category-defining
claim, a stat reveal, a 3-stage comparison. Reserved for the brand
moment, not a generic section.

**Why this pattern (not `pin: true`):** browser-native sticky runs on
the compositor at actual scroll position. Lenis cannot fight it because
no other system is writing transform to the same element. The browser
locks the section; GSAP only drives the crossfade. Bulletproof.

See `LEARNINGS.md` §16b for the diagnostic story.

#### Parallax on depth diagrams

Only on `.diag-parallax` elements — only where the diagram has genuine visual depth.
Flat cards with parallax look amateur.

```javascript
gsap.utils.toArray('.diag-parallax').forEach(el => {
  gsap.to(el, {
    yPercent: -6, ease: 'none',
    scrollTrigger: { trigger: el, scrub: 1.5 }
  });
});
```

#### ScrambleText — one impactful stat, alternative to counter

Better than a counter when the stat is a word or short phrase, not just a number.
Use once per brief maximum.

```javascript
// Requires: ScrambleTextPlugin loaded and registered
gsap.registerPlugin(ScrambleTextPlugin);

ScrollTrigger.create({
  trigger: '#scramble-target',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    gsap.to('#scramble-target', {
      duration: 1.8,
      scrambleText: {
        text: 'FINAL TEXT HERE',
        chars: '!@#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        revealDelay: 0.5,
        speed: 0.4,
      }
    });
  }
});
```

#### DrawSVG — SVG paths that draw themselves on scroll

Use on any SVG timeline, flow diagram, or connecting line.

```javascript
gsap.registerPlugin(DrawSVGPlugin);

// Draw a path from 0% to 100% as it scrolls into view
gsap.from('.flow-path', {
  drawSVG: '0%',
  duration: 1.5,
  ease: 'power2.inOut',
  scrollTrigger: {
    trigger: '.flow-diagram',
    start: 'top 75%',
    toggleActions: 'play none none reverse',
  }
});

// Stagger multiple paths
gsap.from('.timeline-line', {
  drawSVG: '0%',
  duration: 1.2,
  stagger: 0.2,
  ease: 'power2.out',
  scrollTrigger: { trigger: '.timeline', start: 'top 80%' }
});
```

#### ScrollToPlugin — smooth nav link scrolling

Use for sidebar nav link clicks so they scroll smoothly instead of jumping.

```javascript
gsap.registerPlugin(ScrollToPlugin);

document.querySelectorAll('.brief-nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    lenis.scrollTo(target, { offset: -48, duration: 1.2 });
  });
});
```

#### CustomEase — non-stock easing on hero reveals

One custom ease per brief, used on the hero only. Makes the reveal feel distinctly
designed rather than "picked from a dropdown."

```javascript
gsap.registerPlugin(CustomEase);

// Springy, organic feel — good for product/health briefs
CustomEase.create('brand-ease', 'M0,0 C0.126,0.382 0.282,0.674 0.44,0.822 0.632,1.002 0.818,1.001 1,1');

// Then use it:
gsap.from(split.lines, {
  yPercent: 100, opacity: 0,
  duration: 0.9, stagger: 0.1,
  ease: 'brand-ease',
  delay: 0.15,
});
```

---

### Tier 4 — Deliberate. Significant design decision. Await approval.

**Propose before implementing.** These change the document's experience fundamentally.

#### Flip — card expand/collapse or layout transitions

Use when a card needs to expand to reveal more detail on click.
Not a scroll animation — an interaction animation.

```javascript
gsap.registerPlugin(Flip);

const card = document.querySelector('.expandable-card');
card.addEventListener('click', () => {
  const state = Flip.getState(card);
  card.classList.toggle('expanded');
  Flip.from(state, {
    duration: 0.5,
    ease: 'power2.inOut',
    nested: true,
  });
});
```

#### Observer — custom swipe / gesture interactions

Use for custom mobile swipe navigation or section-locking scroll.

```javascript
gsap.registerPlugin(Observer);

Observer.create({
  target: window,
  type: 'wheel,touch,pointer',
  onDown: () => { /* go to previous section */ },
  onUp:   () => { /* go to next section */ },
  tolerance: 10,
  preventDefault: true,
});
```

#### MotionPath — elements that travel a path in a diagram

Use when a diagram needs to show something moving through a system
(peptide travelling to PEPT1, molecule moving through absorption pathway).

```javascript
gsap.registerPlugin(MotionPathPlugin);

gsap.to('.molecule-dot', {
  motionPath: {
    path: '#absorption-path',
    align: '#absorption-path',
    autoRotate: true,
    alignOrigin: [0.5, 0.5],
  },
  duration: 3,
  ease: 'power1.inOut',
  scrollTrigger: {
    trigger: '.absorption-diagram',
    start: 'top 70%',
    toggleActions: 'play none none reverse',
  }
});
```

#### Draggable + Inertia — comparison slider

Use for a before/after or product comparison drag slider.

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);

Draggable.create('.slider-handle', {
  type: 'x',
  bounds: '.slider-container',
  inertia: true,
  onDrag: function() {
    const pct = (this.x / this.maxX) * 100;
    document.querySelector('.slider-reveal').style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  }
});
```

#### MorphSVG — icon state transitions

Use when an SVG icon needs to morph between states (e.g. play → pause, open → close).
Rarely needed in document briefs — more relevant in interactive tools.

```javascript
gsap.registerPlugin(MorphSVGPlugin);

document.querySelector('.toggle-btn').addEventListener('click', () => {
  gsap.to('#icon-path', {
    duration: 0.4,
    morphSVG: { shape: '#icon-path-alt', type: 'rotational' },
    ease: 'power2.inOut',
  });
});
```

---

### Tier 5 — Cut by default. Require explicit brief request.

- **H2 word-reveals on every heading** — the single most overused SplitText tell. Cut entirely.
- **Physics2D / PhysicsProps** — too playful for professional briefs
- **TextPlugin typewriter** — use ScrambleText instead (more distinctive)
- **Background colour fades on sections** — triggers reflow, wrong tool
- **Counters on ranges or labels** — never. 15–25, TGA, WADA — display only
- **Parallax on flat cards** — amateur tell. Only on elements with real visual depth

---

## Hamburger nav animation

Both mobile overlay and desktop sidebar use GSAP for open/close:

```javascript
// ── Mobile hamburger ──
const mobileNav    = document.querySelector('.mobile-nav');
const mobileOverlay = document.querySelector('.mobile-overlay');
const hamburgerBtn = document.querySelector('.hamburger-btn');
let mobileOpen = false;

function toggleMobileNav() {
  mobileOpen = !mobileOpen;
  if (mobileOpen) {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('open');
    gsap.from(mobileNav, { x: '-100%', duration: 0.35, ease: 'power2.out' });
    gsap.from('.mobile-nav a', {
      x: -20, opacity: 0, stagger: 0.05, duration: 0.3,
      ease: 'power2.out', delay: 0.1
    });
  } else {
    gsap.to(mobileNav, {
      x: '-100%', duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        mobileNav.classList.remove('open');
        mobileOverlay.classList.remove('open');
      }
    });
  }
  hamburgerBtn.classList.toggle('active', mobileOpen);
}

hamburgerBtn.addEventListener('click', toggleMobileNav);
mobileOverlay.addEventListener('click', toggleMobileNav);

// Close on link click
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => { if (mobileOpen) toggleMobileNav(); });
});

// ── Desktop sidebar collapse ──
const sidebar     = document.querySelector('.brief-nav');
const collapseBtn = document.querySelector('.nav-collapse-btn');
const content     = document.querySelector('.brief-content');
let sidebarOpen = true;

collapseBtn?.addEventListener('click', () => {
  sidebarOpen = !sidebarOpen;
  if (sidebarOpen) {
    gsap.to(sidebar, { width: 176, opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(content, { paddingLeft: 0, duration: 0.3, ease: 'power2.out' });
  } else {
    gsap.to(sidebar, { width: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
  }
  collapseBtn.classList.toggle('collapsed', !sidebarOpen);
});
```

---

## Desktop nav active state

```javascript
const navLinks = document.querySelectorAll('.brief-nav a');
if (navLinks.length) {
  function setActive(id) {
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  }
  document.querySelectorAll('.sec[id]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top center', end: 'bottom center',
      onEnter:     () => setActive(sec.id),
      onEnterBack: () => setActive(sec.id),
    });
  });
}
```

---

## Progressive enhancement CSS

```css
/* Base: content visible without JS */
.js .reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .55s cubic-bezier(0.22,1,0.36,1),
              transform .55s cubic-bezier(0.22,1,0.36,1);
}
.js .reveal.in { opacity: 1; transform: translateY(0); }

.js .stagger > * {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .4s cubic-bezier(0.22,1,0.36,1),
              transform .4s cubic-bezier(0.22,1,0.36,1);
}
.js .stagger.in > *      { opacity: 1; transform: translateY(0); }
.js .stagger.in > *:nth-child(1) { transition-delay: .04s }
.js .stagger.in > *:nth-child(2) { transition-delay: .10s }
.js .stagger.in > *:nth-child(3) { transition-delay: .16s }
.js .stagger.in > *:nth-child(4) { transition-delay: .22s }
.js .stagger.in > *:nth-child(5) { transition-delay: .28s }
.js .stagger.in > *:nth-child(6) { transition-delay: .34s }

/* Hover — desktop pointer only */
@media(hover:hover) {
  .sc  { transition: background .15s ease; }
  .sc:hover { background: var(--s2); }
}

/* Reduced motion — collapse all */
@media(prefers-reduced-motion:reduce) {
  .js .reveal,
  .js .stagger > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

---

## Full GSAP JS block — base template

```javascript
(function() {
  document.documentElement.classList.add('js');

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 1.5,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Add additional plugins here as needed:
  // gsap.registerPlugin(DrawSVGPlugin, ScrambleTextPlugin, CustomEase, ScrollToPlugin);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .stagger').forEach(el => el.classList.add('in'));
    return;
  }

  // ── Progress bar (scrub) ──
  gsap.to('#js-bar', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0 }
  });

  // ── Section reveals — Tier 1 (classList toggle — NOT gsap.from) ──
  gsap.utils.toArray('.reveal').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%',
      onEnter:     () => el.classList.add('in'),
      onLeaveBack: () => el.classList.remove('in'),
    });
  });

  // ── Stagger children — Tier 1 ──
  gsap.utils.toArray('.stagger').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 86%',
      onEnter:     () => el.classList.add('in'),
      onLeaveBack: () => el.classList.remove('in'),
    });
  });

  // ── Hero SplitText — Tier 2 ──
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && !heroTitle.dataset.noSplit) {
    const split = SplitText.create(heroTitle, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, opacity: 0, duration: 0.85,
      stagger: 0.12, ease: 'power3.out', delay: 0.2
    });
  }

  // ── Stat counters — Tier 3 ──
  gsap.utils.toArray('.sn[data-target]').forEach(el => {
    const target   = parseFloat(el.dataset.target);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    gsap.from({ val: 0 }, {
      val: target, duration: 1.8, ease: 'power2.out',
      onUpdate: function() {
        const v = this.targets()[0].val;
        el.textContent = prefix + (decimals ? v.toFixed(decimals) : Math.round(v)) + suffix;
      },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  // ── Parallax on depth diagrams — Tier 3 ──
  gsap.utils.toArray('.diag-parallax').forEach(el => {
    gsap.to(el, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: el, scrub: 1.5 }
    });
  });

  // ── Desktop nav active states ──
  const navLinks = document.querySelectorAll('.brief-nav a');
  if (navLinks.length) {
    function setActive(id) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    }
    document.querySelectorAll('.sec[id]').forEach(sec => {
      ScrollTrigger.create({
        trigger: sec, start: 'top center', end: 'bottom center',
        onEnter:     () => setActive(sec.id),
        onEnterBack: () => setActive(sec.id),
      });
    });
  }

  // ── ScrollToPlugin for nav links ──
  // gsap.registerPlugin(ScrollToPlugin);
  // document.querySelectorAll('.brief-nav a[href^="#"]').forEach(link => {
  //   link.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     lenis.scrollTo(document.querySelector(link.getAttribute('href')), { offset: -48 });
  //   });
  // });

  // ── Hamburger nav (see responsive.md for HTML/CSS) ──
  // Hamburger JS goes here — see responsive.md

}());
```

---

## Claude Code animation audit prompt

After building the base HTML, Claude Code should audit it with this internal checklist
before proposing any additional animations:

```
For each element/section in the document:
1. Does it have visual depth that would benefit from parallax? (not flat cards)
2. Does it have numbers that are truly impactful? (counter candidate)
3. Is there SVG line-work that could draw itself? (DrawSVG candidate)
4. Is there one stat that would land harder with scramble vs counter?
5. Are there cards that expand/collapse? (Flip candidate)
6. Is there a diagram showing movement through a system? (MotionPath candidate)

For each YES: propose the animation with one-sentence reasoning.
For each NO: do not suggest.
Present as a numbered list. Await approval before implementing.
Quality bar: would this animation make the content clearer or more impactful?
If the answer is "it would just look cool", cut it.
```

---

## CSS @keyframes fallback — local files only

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero    { animation: fadeUp .55s ease .1s  both; }
.sec-1   { animation: fadeUp .5s  ease .2s  both; }
.sec-2   { animation: fadeUp .5s  ease .32s both; }
.sec-3   { animation: fadeUp .5s  ease .44s both; }

@media(prefers-reduced-motion:reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

---

## Stat cell markup rules

```html
<!-- Pure number → counter -->
<div class="sn" data-target="20">20</div>

<!-- With prefix/suffix → counter -->
<div class="sn" data-target="80" data-prefix="~" data-suffix="g">~80g</div>

<!-- Decimal → counter -->
<div class="sn" data-target="4.5" data-suffix="×" data-decimals="1">4.5×</div>

<!-- Range → NO counter (display only) -->
<div class="sn">15–25<span style="font-size:12px">min</span></div>

<!-- Label/credential → NO counter -->
<div class="sn">TGA</div>
<div class="sn">WADA</div>
```

---

## Diagram timeline pattern (replayable, auto-wired)

For pages that contain hand-crafted SVG diagrams (the visual-explainer
template is built on this), the right pattern is a **paused timeline
per figure, driven by ScrollTrigger.batch** — so each diagram replays
on scroll-up-then-down, matching the text-reveal behaviour.

### The wrapper

Every diagram goes inside `<figure class="fig">`:
```html
<figure class="fig reveal">
  <svg viewBox="0 0 600 380" class="diag-svg" ...>
    <!-- diagram contents — each animatable group has a CSS class
         that buildFigTimeline() looks for -->
  </svg>
  <figcaption class="fig-cap">Figure N · Caption</figcaption>
</figure>
```

### The JS

```js
function buildFigTimeline(fig) {
  if (fig._tl) return fig._tl;            // cache per fig
  const svg = fig.querySelector('svg');
  const tl  = gsap.timeline({ paused: true });

  // Detect archetype by class on SVG children and add the matching
  // entrance to the timeline. Examples:
  const bars = svg.querySelectorAll('.diag-bar');
  if (bars.length) {
    tl.from(bars, { scaleY: 0, transformOrigin: 'bottom',
                    duration: 0.9, ease: 'power3.out' }, 0);
  }
  const circles = svg.querySelectorAll('.diag-circle');
  if (circles.length) {
    circles.forEach((c, i) => {
      tl.from(c, { opacity: 0, y: 12, duration: 0.5 }, i * 0.15);
      tl.from(c.querySelectorAll('circle:not(:first-child)'),
        { opacity: 0, scale: 0.4, transformOrigin: 'center',
          stagger: 0.02, duration: 0.35, ease: 'back.out(2)' },
        0.2 + i * 0.15);
    });
  }
  // ... etc per archetype

  fig._tl = tl;
  return tl;
}

ScrollTrigger.batch('.fig', {
  start: 'top 82%',
  onEnter: batch => batch.forEach(fig => {
    const tl = buildFigTimeline(fig);
    if (tl) tl.restart();
  }),
  onLeaveBack: batch => batch.forEach(fig => {
    const tl = buildFigTimeline(fig);
    if (tl) tl.progress(0).pause();
  }),
});
```

`tl.restart()` plays from frame 0 every time the figure enters view.
`tl.progress(0).pause()` snaps it back to the initial state when scrolled
past going up (invisible to user — they're moving away). Next scroll
down, it replays fresh.

---

## Diagram archetypes (visual-explainer template)

Eight reusable SVG patterns, each paired with a specific animation in
`buildFigTimeline()`. When designing a new diagram, pick the archetype
whose *shape* matches your message — don't invent new shapes per topic.

| Archetype | CSS class hook | Use for | Animation |
|---|---|---|---|
| **Side-by-side bar gap** | `.diag-bar` | Comparing two related quantities ("what you had vs what arrives") | Bars grow from bottom; arrows fade in left-to-right |
| **Completeness dot rings** | `.diag-circle` | Showing degrees of completeness across 3 options (e.g. 3/20, 8/20, 20/20) | Each circle fades in; dots pop with back.out ease |
| **Two-column pathway compare** | `.path-step`, `.path-arrow`, `.path-bloodstream` | Mechanism comparison with matching Y positions on both sides | Steps appear in sequence on each side; bloodstreams fill at end |
| **Side-by-side cards** | `.cmp-card` | 4 cards in a row, one featured (highlighted) | Cards stagger up; featured card has gold border |
| **Connected icon row** | `.who-connector`, `.who-icon` | 5 icons linked by a line ("applies across many situations") | Connector draws left-to-right; icons pop with back.out |
| **Time axis with flag callouts** | `.diag-flag`, `.diag-axis`, `.diag-window` | Two events placed along a timeline with anchored ranges | Axis draws; flags drop in; range bands scale in |
| **Milestone progression** | `.expect-line`, `.expect-dot` | 4 dots growing along a timeline with milestone labels | Line draws; dots pop progressively (final has glow) |
| **Foundation / layered base** | `.fnd-block`, `.fnd-base` | Small blocks sitting on a large base ("this is the foundation") | Base slides up; blocks drop in from above |

All eight live in working form in `templates/visual-explainer-template.html`
with `DIAGRAM ARCHETYPE` comment blocks above each one explaining how to
swap the content. Copy from there rather than rewriting from memory.
