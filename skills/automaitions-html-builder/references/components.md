# Component Library

Complete CSS and HTML for every UI pattern. Copy from here — never rewrite from memory.

---

## 1. Topbar (with hamburger)

```css
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 0 20px;
  border-bottom: 1px solid var(--line);
  position: relative;
}
.topbar::before {
  content: ''; position: absolute;
  top: 0; left: -48px; right: -48px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent) 30%, var(--accent) 70%, transparent);
  opacity: .45;
}
.topbar-left { display: flex; align-items: center; gap: 14px; }
.topbar-right { text-align: right; }
.logo-svg { height: 22px; width: auto; display: block; }
.topbar-meta {
  font-size: 9px; color: var(--tx-3);
  letter-spacing: .18em; text-transform: uppercase;
}
.topbar-badge {
  display: inline-block; font-size: 8px; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase;
  padding: 4px 12px; color: var(--accent);
  border: 1px solid var(--line-acc);
}
```

```html
<div class="topbar">
  <div class="topbar-left">
    <button class="hamburger-btn" id="hamburger-btn" aria-label="Open navigation">
      <span></span><span></span><span></span>
    </button>
    <!-- SVG logo inline here -->
  </div>
  <div class="topbar-right">
    <div class="topbar-meta">Education Brief · May 2026</div>
  </div>
</div>
```

---

## 2. Hero section

```css
.hero { padding: 72px 0 60px; border-bottom: 1px solid var(--line); }
.hero-eyebrow {
  font-size: 9px; font-weight: 700; letter-spacing: .26em;
  text-transform: uppercase; color: var(--accent-lo); margin-bottom: 22px;
}
.hero-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(34px, 7vw, 56px);
  color: var(--white); line-height: 1.06;
  letter-spacing: -.02em; margin-bottom: 28px;
  /* NO text-wrap:balance — conflicts with SplitText */
}
.hero-title em { color: var(--accent); font-style: italic; }

/* REQUIRED with SplitText — descender fix */
.hero-title .split-line-mask,
.hero-title [style*="overflow: hidden"] {
  padding-bottom: 0.15em !important;
  margin-bottom: -0.15em !important;
}

.hero-sub {
  font-size: 17px; color: var(--tx-2); line-height: 1.85;
  padding-left: 18px; border-left: 2px solid var(--line-acc);
  max-width: 540px;
}
.hero-sub strong { color: var(--tx-1); font-weight: 500; }
```

---

## 3. Section with eyebrow rule

```css
.sec { padding: var(--space-section) 0; border-bottom: 1px solid var(--line); }
.sec:last-of-type { border-bottom: none; }
.sec-num {
  font-size: 9px; font-weight: 700; letter-spacing: .22em;
  text-transform: uppercase; color: var(--accent-lo);
  margin-bottom: 18px; display: flex; align-items: center; gap: 12px;
}
.sec-num::after { content: ''; flex: 1; height: 1px; background: var(--line-hi); }
.h2 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(26px, 4.5vw, 38px); color: var(--white);
  line-height: 1.1; letter-spacing: -.015em; margin-bottom: 24px;
  text-wrap: balance;
}
.h2 em { color: var(--accent); font-style: italic; }
.copy { font-size: 16px; color: var(--tx-1); line-height: 1.85; }
.copy p { margin-bottom: 18px; }
.copy p:last-child { margin-bottom: 0; }
.copy strong { color: var(--white); font-weight: 600; }
```

---

## 4. Pull quote

```css
.pull {
  margin: 36px 0; padding: 24px 26px;
  background: rgba(91,91,214,.04);
  border-left: 2px solid var(--accent);
  position: relative; overflow: hidden;
}
.pull::before {
  content: '\201C'; font-family: 'DM Serif Display', serif;
  font-size: 80px; color: var(--accent); opacity: .08;
  position: absolute; top: -12px; left: 14px; line-height: 1;
}
.pull p {
  font-family: 'DM Serif Display', serif;
  font-size: 18px; color: var(--accent-hi);
  line-height: 1.65; font-style: italic; position: relative;
}
```

---

## 5. Info box (neutral accent)

```css
.ib {
  margin: 28px 0; padding: 18px 20px;
  border-left: 2px solid var(--line-acc);
  background: rgba(91,91,214,.04);
}
.ib p { font-size: 15px; color: var(--tx-2); line-height: 1.75; margin: 0; }
.ib strong { color: var(--tx-1); }
```

---

## 6. Caveat / warning box (new)

For compliance notes, research caveats, "do not use" warnings:

```css
.caveat {
  margin: 28px 0; padding: 16px 20px;
  border-left: 2px solid var(--warn-tx);
  background: rgba(240,160,40,.06);
  border-radius: 0 2px 2px 0;
}
.caveat-label {
  font-size: 8px; font-weight: 700; letter-spacing: .18em;
  text-transform: uppercase; color: var(--warn-tx);
  margin-bottom: 8px; display: block;
}
.caveat p { font-size: 13px; color: var(--tx-2); line-height: 1.7; margin: 0; }
.caveat strong { color: var(--tx-1); }

/* Critical/danger variant */
.caveat.danger {
  border-color: var(--red-tx);
  background: rgba(220,80,80,.06);
}
.caveat.danger .caveat-label { color: var(--red-tx); }
```

```html
<div class="caveat">
  <span class="caveat-label">Caveat</span>
  <p>This study did not have an isocaloric control group. <strong>"Better than whole protein" is not proven by this data.</strong></p>
</div>
```

---

## 7. Stat grids

```css
.sg  { display: grid; grid-template-columns: repeat(2,1fr); gap: 1px; margin: 32px 0; background: var(--line-hi); }
.sg3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; margin: 32px 0; background: var(--line-hi); }
@media (min-width: 480px) { .sg { grid-template-columns: repeat(4,1fr); } }

.sc { background: var(--s1); padding: 22px 18px; }
.sn {
  font-family: 'DM Serif Display', serif; font-size: clamp(26px,4vw,32px);
  line-height: 1; margin-bottom: 10px;
  background: linear-gradient(145deg, var(--accent-hi), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.sl { font-size: 11px; color: var(--tx-2); line-height: 1.55; }
```

---

## 8. Score / rating cards (new)

For audit scores, ratings, assessments (e.g. 3/10, 8/10):

```css
.score-grid {
  display: grid; grid-template-columns: repeat(2,1fr);
  gap: 1px; background: var(--line-hi); margin: 32px 0;
}
@media (min-width: 480px) { .score-grid { grid-template-columns: repeat(4,1fr); } }

.score-card { background: var(--s1); padding: 22px 18px; }
.score-number {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(28px,4.5vw,36px);
  line-height: 1; margin-bottom: 4px; color: var(--white);
}
.score-number .score-denom {
  font-size: 0.45em; color: var(--tx-3);
  -webkit-text-fill-color: var(--tx-3);
}
.score-number.score-low  { color: var(--red-tx); -webkit-text-fill-color: var(--red-tx); }
.score-number.score-mid  { color: var(--warn-tx); -webkit-text-fill-color: var(--warn-tx); }
.score-number.score-high { color: var(--green-tx); -webkit-text-fill-color: var(--green-tx); }
.score-label { font-size: 11px; color: var(--tx-2); line-height: 1.5; margin-top: 8px; }
```

```html
<div class="score-grid stagger">
  <div class="score-card">
    <div class="score-number score-low" data-target="3">3<span class="score-denom">/10</span></div>
    <div class="score-label">Legal Compliance</div>
  </div>
  <div class="score-card">
    <div class="score-number score-mid" data-target="5">5<span class="score-denom">/10</span></div>
    <div class="score-label">Brand Personality</div>
  </div>
</div>
```

---

## 9. Priority badges (new)

For audit tables, finding lists — CRITICAL / HIGH / MEDIUM / LOW:

```css
.badge {
  display: inline-block; font-size: 7px; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 2px;
}
.badge-critical { background: var(--badge-critical-bg); color: var(--status-critical); }
.badge-high     { background: var(--badge-high-bg);     color: var(--status-high); }
.badge-medium   { background: var(--badge-medium-bg);   color: var(--status-medium); }
.badge-low      { color: var(--status-low); border: 1px solid var(--line-acc); }
.badge-pass     { color: var(--status-pass); border: 1px solid rgba(74,200,140,.25); }
```

```html
<span class="badge badge-critical">Critical</span>
<span class="badge badge-high">High</span>
<span class="badge badge-medium">Medium</span>
<span class="badge badge-pass">Pass</span>
```

---

## 10. Percentage progress bars (new)

For ranked lists, purchase psychology, influence scores:

```css
.pct-list { margin: 28px 0; }
.pct-item { margin-bottom: 16px; }
.pct-header {
  display: flex; justify-content: space-between;
  margin-bottom: 6px;
}
.pct-label { font-size: 13px; color: var(--tx-1); font-weight: 500; }
.pct-value { font-size: 12px; color: var(--accent); font-weight: 600; }
.pct-track {
  height: 3px; background: var(--s3); border-radius: 2px; overflow: hidden;
}
.pct-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, var(--accent-lo), var(--accent));
  transform-origin: left;
  transform: scaleX(0); /* Animated by GSAP on scroll */
  transition: transform .8s cubic-bezier(0.22,1,0.36,1);
}
.js .pct-fill.in { transform: scaleX(1); }
```

```html
<div class="pct-list stagger">
  <div class="pct-item">
    <div class="pct-header">
      <span class="pct-label">Ingredient Quality</span>
      <span class="pct-value">98%</span>
    </div>
    <div class="pct-track">
      <div class="pct-fill" style="transform: scaleX(0.98)" data-pct="0.98"></div>
    </div>
  </div>
  <div class="pct-item">
    <div class="pct-header">
      <span class="pct-label">Peer / Practitioner Recommendation</span>
      <span class="pct-value">90%</span>
    </div>
    <div class="pct-track">
      <div class="pct-fill" style="transform: scaleX(0.90)" data-pct="0.90"></div>
    </div>
  </div>
</div>
```

---

## 11. Four filters / checklist cards (new)

For competitive moats, qualification criteria, checklist sequences:

```css
.filter-grid {
  display: grid; grid-template-columns: 1fr;
  gap: 1px; background: var(--line-hi); margin: 32px 0;
}
@media (min-width: 480px) { .filter-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 640px) { .filter-grid { grid-template-columns: repeat(4,1fr); } }

.filter-card { background: var(--s1); padding: 22px 18px; }
.filter-num {
  font-family: 'DM Serif Display', serif;
  font-size: 11px; color: var(--accent-lo); margin-bottom: 12px;
}
.filter-title { font-size: 13px; font-weight: 600; color: var(--white); line-height: 1.4; }
.filter-card.pass { border-top: 2px solid var(--green-tx); }
.filter-card.fail { border-top: 2px solid var(--red-tx); opacity: .7; }
.filter-status {
  font-size: 8px; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; margin-top: 10px;
}
.filter-card.pass .filter-status { color: var(--green-tx); }
.filter-card.fail .filter-status { color: var(--red-tx); }
```

```html
<div class="filter-grid stagger">
  <div class="filter-card pass">
    <div class="filter-num">Filter 1</div>
    <div class="filter-title">Complete 20-AA profile</div>
    <div class="filter-status">✓ Pass</div>
  </div>
  <div class="filter-card pass">
    <div class="filter-num">Filter 2</div>
    <div class="filter-title">TGA Listed</div>
    <div class="filter-status">✓ Pass</div>
  </div>
  <div class="filter-card fail">
    <div class="filter-num">Filter 3</div>
    <div class="filter-title">WADA Approved</div>
    <div class="filter-status">✗ Fail</div>
  </div>
</div>
```

---

## 12. Comparison diagram (sys-grid)

```css
.diag { background: var(--s1); border: 1px solid var(--line-hi); padding: 26px 22px; margin: 32px 0; position: relative; }
.diag::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--line-acc), transparent); }
.dl { font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: var(--tx-3); margin-bottom: 22px; }
.sys-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
@media (min-width: 540px) { .sys-grid { grid-template-columns: 1fr 48px 1fr; align-items: stretch; } }
.sys-col { overflow: hidden; }
.sys-left  { border: 1px solid var(--line-hi); }
.sys-right { border: 1px solid var(--line-acc); }
.sys-col-hd { font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; padding: 10px 14px; border-bottom: 1px solid var(--line); }
.sys-left  .sys-col-hd { color: rgba(255,255,255,.3); }
.sys-right .sys-col-hd { color: var(--accent-lo); }
.sys-row { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-bottom: 1px solid var(--line); }
.sys-row-last { border-bottom: none; }
.sys-icon { font-size: 18px; flex-shrink: 0; line-height: 1.3; margin-top: 2px; }
.sys-name { font-size: 12px; font-weight: 600; color: var(--tx-1); margin-bottom: 2px; }
.sys-desc { font-size: 10px; color: var(--tx-2); line-height: 1.5; }
.sys-vs { display: flex; align-items: center; justify-content: center; font-family: 'DM Serif Display', serif; font-size: 13px; color: var(--tx-3); background: var(--bg); padding: 12px; }
.sys-footer { margin-top: 14px; padding: 11px 16px; border: 1px solid var(--line-acc); text-align: center; font-size: 11px; font-weight: 600; color: var(--accent); }
```

---

## 13. Comparison table with featured column (new)

For competitive tables — Your Brand column highlighted:

```css
.tbl-wrap { overflow-x: auto; margin: 24px 0; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead th {
  background: var(--s2); color: var(--tx-3); font-size: 8px;
  font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
  padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--line-hi);
}
thead th.col-featured {
  background: var(--accent-dim); color: var(--accent-hi);
  border-top: 2px solid var(--accent);
}
tbody tr { border-bottom: 1px solid var(--line); }
tbody tr:last-child { border-bottom: none; }
tbody td { padding: 11px 14px; color: var(--tx-1); vertical-align: top; line-height: 1.5; }
tbody td:first-child { font-weight: 600; color: var(--white); }
tbody td.col-featured {
  background: rgba(91,91,214,.05);
  color: var(--accent-hi);
  font-weight: 600;
  border-left: 1px solid var(--line-acc);
  border-right: 1px solid var(--line-acc);
}
tbody td.dim { color: var(--tx-2); font-weight: 400; }
.td-pass { color: var(--green-tx); font-weight: 700; }
.td-fail { color: var(--red-tx); }
```

```html
<div class="tbl-wrap">
  <table>
    <thead>
      <tr>
        <th>Parameter</th>
        <th>Whey</th>
        <th>BCAAs</th>
        <th class="col-featured">Your Brand</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Absorption Time</td>
        <td class="dim">2–3 hours</td>
        <td class="dim">30–60 min</td>
        <td class="col-featured td-pass">15–25 min</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 14. Tab / toggle navigation (new)

For long documents with grouped content sections:

```css
.tab-nav {
  display: flex; gap: 0; margin-bottom: 36px;
  border-bottom: 1px solid var(--line-hi);
  overflow-x: auto;
}
.tab-btn {
  background: none; border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px; font-weight: 600; letter-spacing: .08em;
  color: var(--tx-3); padding: 10px 18px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color .15s ease, border-color .15s ease;
  white-space: nowrap;
}
.tab-btn:hover { color: var(--tx-1); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

.tab-panel { display: none; }
.tab-panel.active { display: block; }
```

```javascript
// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target)?.classList.add('active');
  });
});
```

```html
<div class="tab-nav">
  <button class="tab-btn active" data-tab="tab-strategy">Strategy</button>
  <button class="tab-btn" data-tab="tab-audience">Target Market</button>
  <button class="tab-btn" data-tab="tab-content">Content</button>
</div>
<div class="tab-panel active" id="tab-strategy">
  <!-- Strategy sections -->
</div>
<div class="tab-panel" id="tab-audience">
  <!-- Audience sections -->
</div>
```

---

## 15. Close section

```css
.cb { padding: 72px 0 0; text-align: center; }
.cb::before { content: ''; display: block; width: 40px; height: 1px; background: var(--accent); margin: 0 auto 52px; opacity: .35; }
.ct { font-family: 'DM Serif Display', serif; font-size: clamp(28px,5.5vw,44px); color: var(--white); line-height: 1.1; letter-spacing: -.015em; margin-bottom: 22px; text-wrap: balance; }
.ct em { color: var(--accent); }
.cs { font-size: 15px; color: var(--tx-2); line-height: 1.85; max-width: 480px; margin: 0 auto 28px; }
.cc { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.cp { font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; padding: 7px 14px; border: 1px solid var(--line-hi); color: var(--tx-2); background: var(--s1); }
```

---

## 16. Footer

```css
footer { border-top: 1px solid var(--line); padding: 28px 0; display: flex; justify-content: space-between; align-items: center; }
.fl { display: flex; align-items: center; gap: 12px; opacity: .3; }
.fl svg { height: 16px; width: auto; }
.fb { font-size: 9px; color: var(--tx-3); letter-spacing: .1em; text-transform: uppercase; }
```

```html
<footer>
  <div class="fl">
    <!-- SVG logo inline (opacity applied to parent) -->
  </div>
  <div class="fb">yourbrand.com · May 2026</div>
</footer>
```

---

## 17. Progress bar (page scroll)

```css
.progress-bar {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 3px;
  background: var(--accent);
  transform: scaleX(0); transform-origin: left;
  z-index: 1000; will-change: transform;
}
```

```html
<div class="progress-bar" id="js-bar"></div>
```
