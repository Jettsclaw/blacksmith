# PNG → SVG Render Methodology

Reference for converting rendered Nano Banana 2 (or any raster) statics into
native animated SVGs for landing-page embed. This is the bridge between
the production layer (NB Pro static images) and the production layer
(`automaitions-html-builder` animated landing pages).

---

## Why this exists

The visual layer of the chain produces TWO kinds of assets:

1. **Static raster images** — output of `/create-static-ads`, `/multiplier`,
   `/rebuild`. These go to Meta Ads Manager as ad creative. Bitmap format
   is correct for that delivery surface — Meta accepts JPG/PNG/MP4.

2. **Native animated SVGs** — what lands on the landing page in place of
   raster embeds. Vector + JS-animatable, infinitely scalable, no image
   fetch latency, accessible to screen readers, and most importantly:
   they can have native CSS/JS motion baked in.

The conversion methodology bridges them: NB Pro renders a static composition,
and CA converts that composition into a native SVG with the same visual
intent but with motion built into the elements.

---

## When to convert raster → SVG (and when NOT to)

### Convert (use raster as design reference, build native SVG)

- **Diagrams** — chain visualisations, system architectures, flow diagrams,
  comparison tables, stat-callout layouts. Anything with discrete geometric
  elements + text + lines/arrows.
- **Data visualisations** — anything with numbers + visual relationships.
  Counters that animate up, bars that fill, comparison grids that highlight.
- **Mechanism explainers** — when the visual IS the explanation of how
  something works, SVG with build-in/draw-in animation makes the explanation
  active rather than passive.
- **Hero brand moments** — when the page's flagship visual benefits from
  motion (chain assembling, particles flowing, breathing pulses).
- **Logos** — always use native SVG, never raster.
- **Iconography** — UI icons, benefit-row checkmarks, badge graphics.

### KEEP as raster (don't try to convert)

- **Photographic compositions** — lifestyle shots, product photography,
  human faces, complex naturalistic scenes. Even for service brands (where
  Brand DNA forbids photography), if NB Pro produces a complex composition
  with photographic feel, recreating in SVG loses fidelity.
- **AI-generated artistic textures** — gradient meshes, organic blobs with
  complex shading, atmospheric scenes. CSS can do simplified versions but
  losing the AI-generated nuance often degrades quality.
- **Text-heavy ads with brand-specific typography rendered in-image** —
  if the NB Pro output uses creative type composition that's hard to
  recreate semantically, keep raster.
- **Anything that will run as a Meta ad** — Meta is the delivery surface
  for raster; only convert for landing-page embed.

---

## The conversion process

### Step 1 — Identify which raster to convert

Look at the rendered batch. Mark each image with a tag:
- `LP-HERO` — single most important visual; gets premium SVG conversion
- `LP-SECONDARY` — supporting diagrams; gets standard SVG conversion
- `META-ONLY` — meant for ad placements; stays raster

A typical landing page has 1 `LP-HERO` (the mechanism explainer) and
2-4 `LP-SECONDARY` (data, comparison, benefit visualisations). The rest
stay raster.

### Step 2 — Deconstruct the raster into visual primitives

Take the NB Pro output and identify its component parts:
- Geometric shapes (circles, rectangles, paths)
- Lines/connectors
- Text labels (what they say, what colour, what hierarchy)
- Gradients (where they live, what direction)
- Glow effects
- Icons / symbols
- Particle / decorative elements

Sketch the structure as a list. Example (chain visualisation):
- 4 phase node circles in corners
- Central pilot node
- 8 connection lines (4 corner-to-corner + 4 corner-to-center)
- 4 phase labels (above/below circles)
- Central pilot label
- 25 satellite skill dots distributed around nodes
- Connection lines between satellites and their parent nodes
- Radial gradient backdrop

### Step 3 — Lay out the SVG coordinate space

Choose a viewBox that fits the composition cleanly. Standard sizes:
- 720 × 480 — landscape diagram (most chains, comparison tables)
- 480 × 720 — portrait diagram (rare, mobile-led layouts)
- 720 × 720 — square (badges, icons, hero composition pieces)
- 1080 × 720 — widescreen feature (full-bleed hero centerpiece)

Calculate positions in pixels relative to the viewBox. Use round numbers
where possible (180, 360, 540) — easier to debug and remember.

### Step 4 — Add the `<defs>` block

Standard tokens to define upfront:

```xml
<defs>
  <!-- Radial gradient for primary nodes -->
  <radialGradient id="nodeGrad" cx="35%" cy="30%" r="80%">
    <stop offset="0%" stop-color="#8585F0"/>
    <stop offset="60%" stop-color="#5B5BD6"/>
    <stop offset="100%" stop-color="#3838A8"/>
  </radialGradient>

  <!-- Linear gradient for flow-direction lines -->
  <linearGradient id="chainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#5B5BD6" stop-opacity="0.8"/>
    <stop offset="100%" stop-color="#E07856" stop-opacity="0.5"/>
  </linearGradient>

  <!-- Glow filter for accent elements -->
  <filter id="coralGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- Subtle glow for primary nodes -->
  <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
```

Adapt the colour stops to match the brand palette from `brand-config.json`.

### Step 5 — Layer the SVG content (back-to-front)

Build elements in z-order, back to front:
1. Background atmospheric layers (radial gradient washes)
2. Decorative / structural elements (skill-dot satellites, particle paths)
3. Connection lines / arrows
4. Particle flow group (empty container; populated by JS)
5. Primary visual elements (phase node circles)
6. Text labels
7. Foreground accents (highlight badges)

### Step 6 — Add motion layer via JS

Common animation patterns (each tied to a specific intent):

**Draw-in lines** (chain assembling)
```javascript
const lines = document.querySelectorAll('.chain-line');
lines.forEach(line => {
  const length = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  line.style.strokeDasharray = length;
  line.style.strokeDashoffset = length;
  line.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.65, 0, 0.35, 1)';
});
// On reveal:
lines.forEach(l => l.style.strokeDashoffset = 0);
```

**Scale-in + drop-shadow glow** (phase nodes appearing)
```css
.chain-node circle {
  opacity: 0; transform: scale(0.3);
  transition: opacity 0.55s cubic-bezier(.2,.7,.3,1),
              transform 0.55s cubic-bezier(.2,.7,.3,1);
  filter: drop-shadow(0 0 0 rgba(91,91,214,0));
}
.chain-svg.in .chain-node circle {
  opacity: 1; transform: scale(1);
  filter: drop-shadow(0 0 12px rgba(91,91,214,0.4));
}
```

**Particle flow** (data moving through the system)
```javascript
function spawn(flow, delay) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  p.setAttribute('r', 3);
  p.setAttribute('cx', flow.from.x);
  p.setAttribute('cy', flow.from.y);
  particleGroup.appendChild(p);

  const start = performance.now() + delay;
  const duration = 2200;
  function step(now) {
    if (now < start) { requestAnimationFrame(step); return; }
    const t = Math.min((now - start) / duration, 1);
    const eased = t * t * (3 - 2 * t);
    p.setAttribute('cx', flow.from.x + (flow.to.x - flow.from.x) * eased);
    p.setAttribute('cy', flow.from.y + (flow.to.y - flow.from.y) * eased);
    if (t < 1) requestAnimationFrame(step);
    else p.remove();
  }
  requestAnimationFrame(step);
}
```

**Breathing glow** (living system feel post-draw-in)
```css
@keyframes node-breathe {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(91,91,214,0.4)); }
  50% { filter: drop-shadow(0 0 18px rgba(91,91,214,0.6)); }
}
.chain-svg.breathing .chain-node circle { animation: node-breathe 4s ease-in-out infinite; }
```

### Step 7 — Mobile readability check (MANDATORY before shipping)

Per `20-lessons.md §1`, this is non-negotiable. Test at 375px viewport:
- Are all text labels legible without zoom?
- Are interactive / informational elements at least 11px tall?
- Do small decorative elements still read at their compressed size, OR
  are they noise (hide them via `display: none` below threshold)?
- Are colour contrasts maintained (WCAG AA minimum)?

If any element fails: either scale it up via media query, OR hide it on
mobile and recover the meaning through copy/stat callouts.

---

## Mobile considerations (CRITICAL)

This is the gap that bit us in `20-lessons.md §1`. SVGs scale uniformly
by default; that's WRONG for diagrams meant to be read on a phone.

### The mobile-SVG playbook

**For node-based diagrams (chains, system architectures):**
1. Increase node radii on mobile (e.g. 40 → 56)
2. Move labels INSIDE nodes on mobile, NOT outside floating in whitespace
3. Increase text font-size attribute (e.g. 11 → 18)
4. Hide decorative satellites on mobile if their meaning depends on visible quantity
5. Consider a separate viewBox for mobile (different aspect ratio)

**For comparison tables embedded as SVG:**
- Don't. Use native HTML `<table>` instead. SVG tables can't reflow.

**For data visualisations:**
1. If the data has more than 4-5 categories, mobile reduces to top 3 + "other"
2. Numbers should always be larger than labels on mobile
3. Highlight the winning column/bar — mobile glances need an instant takeaway

**For hero brand visualisations:**
- Often safe to keep at full complexity since hero gets dedicated screen time
- But test at 375px anyway — if it feels cramped, reduce ornamental layers

### Detection: "is my SVG mobile-ready?"

Quick test: take a screenshot of the SVG at 375px viewport width and try to
read each text element WITHOUT zooming. If you struggle, mobile users will fail.

---

## Worked example: chain SVG

Real example from `automaitions-pilot.html`. The NB Pro renders that fed
this conversion:
- `generated-visuals/13-stat-surround-4x5.png` (mechanism explainer)
- `generated-visuals/18-system-architecture-4x5.png` (system architecture variant)

The native SVG composition:

```xml
<svg class="chain-svg" viewBox="0 0 720 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="nodeGrad">...</radialGradient>
    <linearGradient id="chainGrad">...</linearGradient>
    <filter id="coralGlow">...</filter>
    <filter id="nodeGlow">...</filter>
  </defs>

  <!-- z-order: back to front -->
  <g id="skill-dots"></g>                  <!-- decorative satellites -->
  <g class="chain-lines">                  <!-- connection lines -->
    <line class="chain-line" x1="180" y1="120" x2="360" y2="240" />
    <!-- ... 7 more lines ... -->
  </g>
  <g id="chain-particles"></g>             <!-- empty container for flow particles -->

  <g class="chain-node">                   <!-- 4 phase nodes -->
    <circle cx="180" cy="120" r="40" fill="url(#nodeGrad)" filter="url(#nodeGlow)" />
    <text x="180" y="120">R</text>
    <text class="nlabel" x="180" y="78">RESEARCH</text>
  </g>
  <!-- ... 3 more phase nodes ... -->

  <circle cx="360" cy="240" r="48" class="chain-center"      <!-- central pilot node -->
          fill="url(#centerGrad)" filter="url(#coralGlow)" />
  <text x="360" y="232" class="chain-center-label">$5K</text>
  <text x="360" y="252" class="chain-center-label">PILOT</text>
</svg>
```

Motion layer:
- Phase nodes scale-in cascade (delay 0.1-0.4s)
- Connection lines draw-in via `stroke-dashoffset` (1.1s, stagger 0.07s)
- Center node bounces in at 1.4s with overshoot easing
- After draw-in: breathing animation + particle flow starts

---

## Anti-patterns

### ❌ Trying to convert a photo-realistic NB Pro output to SVG
SVG can't reproduce photo-realism. Don't try. Keep raster.

### ❌ Hand-writing complex curved paths
SVG `<path>` with bezier curves is brutal to author by hand. If you need
complex curves, either:
- Use a graphics editor (Figma, Illustrator) to export the SVG, OR
- Use CSS `border-radius` and transforms on simpler shapes, OR
- Accept raster for that element

### ❌ Forgetting `viewBox` attribute
Without `viewBox` the SVG doesn't scale. Always include it.

### ❌ Hardcoded colours instead of CSS variables / brand tokens
Every fill/stroke should reference `--indigo`, `--coral`, `--paper`,
`--ink`, `--bg` from the brand palette. Hardcoded hex values break
when the brand re-skins.

### ❌ Inline `<style>` blocks inside the SVG
The SVG should inherit page styles. Put SVG-specific CSS in the
page-level `<style>` block, scoped via `.chain-svg` (or whatever class
the SVG gets).

### ❌ Animation that runs forever and never pauses
Continuous animation (breathing, particle flow) is fine UNTIL it
interferes with focus or content reading. Pause on `:hover` for
interactive elements; respect `prefers-reduced-motion` always.

---

## Reverse direction: stripping a reference to extract layout intent

Companion technique to PNG→SVG, sourced from the Textura Claude Code Website Pipeline (Step 03). Where the rest of this doc converts your OWN raster into an animated SVG for your OWN page, this section is the inverse: take a COMPETITOR landing page (or any reference site you want to model), strip all visual / mood signal out of it, and hand the model a **layout-only black-and-white reference** that lets it focus on structural intent without being pulled toward visual mimicry.

### Why this works

When you hand the model the raw competitor screenshot, it tries to reproduce everything — typography choices, palette, photographic mood, micro-decorative noise. Most of that signal you DON'T want; you only want the structural skeleton (section order, density, hero composition, white space, hierarchy). Stripping the visual layer cleanly separates two prompts into one input pair: the stripped version carries layout, the original carries mood.

### The strip-the-background process

**Step 1 — Capture the reference.** Full-page screenshot of the competitor landing page (Mobbin, BrowserShots, manual Chrome dev-tools "Capture full-size screenshot").

**Step 2 — Strip via image model.** Hand the screenshot to GPT Image 4o or OpenArt with the prompt:

```text
A high-fidelity mockup based on [attached screenshot]. Only UI
elements on solid black background. All background imagery
removed. Text and buttons in strict black and white. Stark,
minimal, high-contrast monochrome.
```

The model returns a clean B&W version: typography + buttons + nav structure preserved, everything else (photos, gradients, illustrations, video frames, branded decoration) stripped.

**Step 3 — Hand BOTH to your build skill.** When briefing `automaitions-html-builder` (or `/rebuild` for static-ad modelling, or any code-generation tool):

- Attach the **stripped reference** → "use this for layout, proportion, spacing, element positioning"
- Attach the **original reference** → "use this only for mood, palette feel, typographic intent — do NOT clone the structure or imagery"

Methodology cross-ref: `17-automaitions-handoff.md` § Dual-reference attachment pattern.

### When this beats raw competitor-LP attachment

| Scenario | Approach |
|---|---|
| Modelling a structural layout (sections, hierarchy, density) | Strip-the-background, hand BOTH stripped + original |
| Stealing the visual mood / palette only | Original only — no need to strip |
| Pure design inspiration browsing | Awwwards / Mobbin browse, no strip needed |
| Modelling a competitor ad (image, not LP) | `/spy` + `/rebuild` directly — strip technique not applicable |

### Anti-patterns (when NOT to strip)

- ❌ The reference is ALREADY high-contrast or wireframe-y (stripping adds nothing)
- ❌ The reference's value IS in its visual treatment (then stripping destroys the signal you want)
- ❌ You're modelling MOTION not LAYOUT (capture animation refs from Pinterest / OpenProcessing instead)

---

## Integration with the chain

| Step | What the operator does | Where the methodology comes from |
|---|---|---|
| 1. Identify candidate raster | Look at NB Pro outputs, tag each LP-HERO / LP-SECONDARY / META-ONLY | This file § "When to convert" |
| 2. Brief automaitions skill OR direct HTML build | Hand off to `automaitions-html-builder` if using the skill; otherwise build inline | `17-automaitions-handoff.md` |
| 3. Build the SVG | Layer back-to-front, use `<defs>` tokens, embed in landing page | This file § "Conversion process" |
| 4. Add motion | Choose draw-in / scale-in / particle-flow / breathing per intent | This file § "Step 6 motion layer" |
| 5. Mobile QA | Test at 375px, fix per playbook | This file § "Mobile considerations" + `22-polish-pass.md` |
| 6. Attention AI validation | Run page through `attention-ai.jay.com.au` | `19-attention-ai.md` Workflow A |
| 7. Ship | Push to main, Vercel deploys | `16-skill-orchestration.md` |

---

## The one-liner

**NB Pro renders the static composition. CA converts the hero + secondary
diagrams into native animated SVGs with gradients, filters, and motion baked
in. Mobile readability is non-negotiable — test at 375px before shipping.
Raster stays raster for Meta delivery; only landing page embeds get the
SVG treatment.**
