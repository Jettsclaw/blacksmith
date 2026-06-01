# Particle Narrative Archetype — Awwwards-Tier Without Paid Assets

The most ambitious motion pattern this skill ships: a 6–8 chapter scroll-pinned particle narrative in the **textura.us / NEGENTROPY register**. WebGL-grade visual quality. No licensed assets, no paid templates, no external services beyond free CDN-hosted GSAP and Three.js.

This file is the durable synthesis of a research pass across the open-source web (Codrops, Three.js Journey, Maxime Heckel, Suboor Khan, brunoimbrizi/interactive-particles, tsparticles, three-nebula, DevDreaming). No code was downloaded — patterns were read, understood, and re-authored in distilled form below.

The deal: read this once, build any NEGENTROPY-tier page in a day.

---

## 1. When to use this archetype (and when NOT to)

**Use it when:**
- The deliverable is a **brand-defining moment** (manifesto, launch site, portfolio piece, agency self-promo). Awwwards-target.
- The brand has earned the ambition — "we make AI agents for small business" warrants it; "we sell socks" doesn't.
- You have 6–8 distinct *scenes* (story beats), each of which can be visualised as a different particle formation.
- The page is meant to be *experienced* once, deeply — not bookmarked + revisited daily.
- Mobile execution is non-negotiable (we never ship desktop-only craft; see lessons §7).

**Do NOT use it when:**
- The deliverable is conversion-first (use the classic vertical-scroll pattern from `06-creative-types.md` instead).
- The content is dense/data-heavy (terminal-industries register from earlier cinema iteration suits better).
- The brand register is "approachable / friendly" — particle theatre reads as cold and arty.
- The audience is novice (small-business owners trained on documents, not film) — see `automaitions-business.html` classic for the right pattern there.

**Hard cost reality:** building at this tier takes 2–4× the time of a conventional landing page. Plan accordingly.

---

## 2. The three implementation tiers

| Tier | Engine | Bundle | Particle count | Use when |
|---|---|---|---|---|
| **T1 · Canvas-2D** | Vanilla canvas + pre-rendered sprite atlas | ~6KB code, 0 deps | 1.5K mobile / 3K desktop | Brand mood / atmospheric / first-cut |
| **T2 · Three.js Points + ShaderMaterial** | Three.js + custom GLSL vertex/fragment | ~150KB (Three.js CDN) | 100K mobile / 500K desktop | Production awwwards-target sites |
| **T3 · GPGPU FBO ping-pong** | Three.js + `GPUComputationRenderer` + simulation shader | ~180KB (Three.js CDN + addons) | 200K mobile / 2M+ desktop | Signature competition entries only |

**Rule of thumb:** start at T2 unless you have a specific reason. T1 is for first-pass prototyping or atmospheric backgrounds. T3 is for showstopper signature moments (one per agency portfolio) — and even then, only after T2 has been exhausted.

We'll cover all three. The most reusable is **T2 — Three.js Points with a positionA/positionB morph shader** — and we ship that as the default.

---

## 3. The complete architecture

Every page in this archetype has the same five-layer composition. Once you internalise it, every variation is a substitution at one of these layers.

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5 · CHROME (z 4)                                     │
│  ├ top-left brand tag · (BRAND) [TAGLINE]                   │
│  ├ top-right chapter ladder · click-jumpable                │
│  ├ bottom-left chapter label · (II) — SEC.002 — TITLE       │
│  └ stage frame · 1px rgba(255,255,255,0.04) inset border    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4 · SCENE TEXT (z 2)                                 │
│  ├ per-scene hero (.scene > .scene-grid > .hero-text)       │
│  ├ per-scene body block (.body-block, right column)         │
│  └ SplitText-style per-line reveal on scene .active         │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3 · PARTICLE FIELD (z 1, sometimes z 3 for wipes)    │
│  └ canvas OR Three.js renderer; full stage cover            │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2 · STAGE (position: sticky, top: 0, 100dvh)         │
│  └ holds everything above, releases at end of trigger zone  │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1 · TRIGGER ZONE (.story = N × 100vh)                │
│  └ scroll progress 0→1 maps to scene index 0→N-1            │
└─────────────────────────────────────────────────────────────┘
```

Implementation note: **never `position: fixed` for the stage** — it breaks the natural release at end of story. Always `position: sticky` per skill rule §4.1.

---

## 4. The morph shader (T2 — default tier)

The signature mechanic. Each particle has two target positions (`positionA`, `positionB`). A single uniform `uMorphProgress` (0→1) interpolates between them every frame. Scene transitions become "swap positionA = current; positionB = next scene target; tween uMorphProgress 0→1 over 1.2s."

### Vertex shader

```glsl
uniform float uTime;
uniform float uMorphProgress;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3  uMouse;            // world-space mouse for repulsion

attribute vec3  positionA;       // current scene target
attribute vec3  positionB;       // next scene target
attribute float aRandom;         // per-particle 0..1 jitter seed
attribute float aScale;          // per-particle size multiplier
attribute vec3  aColor;          // per-particle color (rgb 0..1)

varying float vAlpha;
varying vec3  vColor;

// Curl-noise-style drift — adds organic motion on top of the morph
vec3 drift(vec3 p, float t) {
  return vec3(
    sin(t * 0.7 + p.y * 1.3 + aRandom * 6.28) * 0.04,
    cos(t * 0.6 + p.x * 1.1 + aRandom * 6.28) * 0.04,
    sin(t * 0.5 + p.z * 1.7 + aRandom * 6.28) * 0.04
  );
}

void main() {
  // Eased interpolation per particle — small per-particle delay so the
  // morph doesn't all happen at once (gives the textura "swarm" feel)
  float delay = aRandom * 0.25;
  float t = clamp((uMorphProgress - delay) / (1.0 - delay), 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);   // smoothstep

  vec3 pos = mix(positionA, positionB, t);
  pos += drift(pos, uTime);

  // Mouse repulsion (subtle)
  float mouseDist = distance(pos.xy, uMouse.xy);
  if (mouseDist < 0.4) {
    vec3 push = normalize(pos - uMouse) * (0.4 - mouseDist) * 0.3;
    pos += push;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aScale * uPixelRatio / -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;

  vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + aRandom * 6.28);   // gentle twinkle
  vColor = aColor;
}
```

### Fragment shader

```glsl
varying float vAlpha;
varying vec3  vColor;

void main() {
  // Soft circular particle via gl_PointCoord
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  // Radial alpha falloff = the glow
  float alpha = (1.0 - smoothstep(0.0, 0.5, d)) * vAlpha;

  // Additive-blend output (set THREE.AdditiveBlending on the material)
  gl_FragColor = vec4(vColor, alpha);
}
```

### The buffer geometry setup

```javascript
const N = 30000;                                    // particle count
const geometry = new THREE.BufferGeometry();

// We only ever upload these once; the GPU owns them after that
const positionsA = new Float32Array(N * 3);
const positionsB = new Float32Array(N * 3);
const randoms    = new Float32Array(N);
const scales     = new Float32Array(N);
const colors     = new Float32Array(N * 3);

// `position` attribute is a dummy required by Three.js. The vertex shader
// ignores it and uses positionA/positionB instead.
geometry.setAttribute('position',  new THREE.BufferAttribute(new Float32Array(N * 3), 3));
geometry.setAttribute('positionA', new THREE.BufferAttribute(positionsA, 3));
geometry.setAttribute('positionB', new THREE.BufferAttribute(positionsB, 3));
geometry.setAttribute('aRandom',   new THREE.BufferAttribute(randoms,    1));
geometry.setAttribute('aScale',    new THREE.BufferAttribute(scales,     1));
geometry.setAttribute('aColor',    new THREE.BufferAttribute(colors,     3));

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime:          { value: 0 },
    uMorphProgress: { value: 0 },
    uSize:          { value: 18 },
    uPixelRatio:    { value: Math.min(window.devicePixelRatio, 2) },
    uMouse:         { value: new THREE.Vector3() },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite:  false,
  blending:    THREE.AdditiveBlending,
});

const points = new THREE.Points(geometry, material);
scene.add(points);
```

### Scene morph trigger

```javascript
let activeScene = 0;
const goToScene = (newSceneIdx) => {
  if (newSceneIdx === activeScene) return;

  // Copy current B → A (the current scene becomes the starting positions)
  const pA = geometry.attributes.positionA.array;
  const pB = geometry.attributes.positionB.array;
  pA.set(pB);
  geometry.attributes.positionA.needsUpdate = true;

  // Compute new B for the target scene
  const newPositions = LAYOUTS[scenes[newSceneIdx].layout](N);
  for (let i = 0; i < N; i++) {
    pB[i*3]   = newPositions[i].x;
    pB[i*3+1] = newPositions[i].y;
    pB[i*3+2] = newPositions[i].z;

    // Recolour for the new scene's tint
    const c = newPositions[i].color;
    colors[i*3]   = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
  }
  geometry.attributes.positionB.needsUpdate = true;
  geometry.attributes.aColor.needsUpdate = true;

  // Reset morph progress and tween to 1 over 1.2s
  material.uniforms.uMorphProgress.value = 0;
  gsap.to(material.uniforms.uMorphProgress, {
    value: 1,
    duration: 1.2,
    ease: 'power2.inOut',
  });

  activeScene = newSceneIdx;
};
```

This is the entire morph engine. ~30 lines of JS + 2 shaders = the signature.

---

## 5. Particle layouts library

Each layout is a function `(N) => Array<{x, y, z, color}>`. Below are the seven canonical patterns. Mix and match per page.

### Layout: `wispy` — two arcing plumes (drift / loss)
```javascript
wispy: (N) => Array.from({length: N}, (_, i) => {
  const side = i % 2;
  const t = (i * 17 % N) / N;
  const cx = side === 0 ? -1.0 : 1.0;
  const cy = side === 0 ? 0.6  : -0.6;
  const ang = side === 0 ? -Math.PI * 0.7 + t * Math.PI * 1.4
                         :  Math.PI * 0.3 + t * Math.PI * 1.4;
  return {
    x: cx + Math.cos(ang) * 0.7 + (Math.random() - 0.5) * 0.3,
    y: cy + Math.sin(ang) * 0.9 + (Math.random() - 0.5) * 0.2,
    z: (Math.random() - 0.5) * 0.4,
    color: CORAL,
  };
})
```

### Layout: `burst` — supernova from centre (loss / leak)
```javascript
burst: (N) => Array.from({length: N}, () => {
  const a1 = Math.random() * Math.PI * 2;
  const a2 = Math.acos(2 * Math.random() - 1);     // uniform sphere distribution
  const r  = Math.pow(Math.random(), 0.45) * 2.4;
  return {
    x: Math.cos(a1) * Math.sin(a2) * r,
    y: Math.sin(a1) * Math.sin(a2) * r,
    z: Math.cos(a2) * r * 0.5,
    color: r < 0.4 ? WARM : INDIGO,
  };
})
```

### Layout: `constellation` — N clusters around viewport (pattern / system)
```javascript
constellation: (N) => {
  const NODES = 10;
  const nodes = Array.from({length: NODES}, (_, i) => {
    const ang = (i / NODES) * Math.PI * 2 + Math.PI / 7;
    const r   = 1.6 * (0.55 + (i % 3) * 0.18);
    return { x: Math.cos(ang) * r, y: Math.sin(ang) * r };
  });
  return Array.from({length: N}, (_, i) => {
    const node = nodes[i % NODES];
    const a    = Math.random() * Math.PI * 2;
    const r    = Math.pow(Math.random(), 0.4) * 0.22;
    return {
      x: node.x + Math.cos(a) * r,
      y: node.y + Math.sin(a) * r,
      z: (Math.random() - 0.5) * 0.3,
      color: i % 23 === 0 ? CORAL : INDIGO,
    };
  });
}
```

### Layout: `galaxy` — two-arm spiral (system / order)
```javascript
galaxy: (N) => Array.from({length: N}, (_, i) => {
  const t        = Math.pow(i / N, 0.55);
  const arm      = i % 2;
  const armAngle = t * Math.PI * 5 + arm * Math.PI;
  const r        = t * 2.4;
  const jitter   = (Math.random() - 0.5) * 0.4;
  return {
    x: Math.cos(armAngle + jitter) * r,
    y: Math.sin(armAngle + jitter) * r,
    z: (Math.random() - 0.5) * 0.4,
    color: i % 14 === 0 ? CORAL : INDIGO,
  };
})
```

### Layout: `starfield` — uniform random (proof / accumulation)
```javascript
starfield: (N) => Array.from({length: N}, () => ({
  x: (Math.random() - 0.5) * 5.4,
  y: (Math.random() - 0.5) * 3.0,
  z: (Math.random() - 0.5) * 0.6,
  color: Math.random() > 0.94 ? CORAL : INDIGO,
}))
```

### Layout: `portal` — hourglass / pinched centre (invitation / threshold)
```javascript
portal: (N) => Array.from({length: N}, (_, i) => {
  const yT = Math.random();
  const y  = (yT - 0.5) * 3.4;
  const distFromCenter = Math.abs(yT - 0.5) * 2;
  const radius = distFromCenter * 1.2 + 0.08 + Math.random() * 0.16;
  const ang    = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(ang) * radius,
    y: y,
    z: Math.sin(ang) * radius * 0.5,
    color: i % 18 === 0 ? CORAL : INDIGO,
  };
})
```

### Layout: `grid` — orderly 3D lattice (system / control)
```javascript
grid: (N) => {
  const side = Math.ceil(Math.pow(N, 1/3));
  return Array.from({length: N}, (_, i) => {
    const x = (i % side);
    const y = Math.floor((i / side) % side);
    const z = Math.floor(i / (side * side));
    return {
      x: (x / side - 0.5) * 4.0,
      y: (y / side - 0.5) * 2.5,
      z: (z / side - 0.5) * 1.0,
      color: INDIGO,
    };
  });
}
```

**Color constants:**
```javascript
const INDIGO = { r: 0.482, g: 0.482, b: 0.910 };   // #7B7BE8
const CORAL  = { r: 0.878, g: 0.471, b: 0.337 };   // #E07856
const WARM   = { r: 0.690, g: 0.510, b: 0.737 };   // indigo+coral blend
```

---

## 6. Lenis + GSAP integration recipe (the critical wiring)

The most common silent-failure mode: Lenis intercepts scroll, ScrollTrigger reads stale `window.scrollY`, pin sections flash. The fix below is the canonical Darkroom Engineering pattern (post-Studio Freight rename, 2026):

```javascript
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  lerp: 0.1,
  duration: 1.5,
  syncTouch: true,         // (NOT smoothTouch — removed in Lenis 1.0+)
  autoRaf: false,          // critical — we drive RAF from GSAP's ticker
});

// Drive Lenis from GSAP's ticker so both share one frame loop
function update(time) {
  lenis.raf(time * 1000);
}
gsap.ticker.add(update);
gsap.ticker.lagSmoothing(0);

// Tell ScrollTrigger to read the Lenis-driven scroll position
lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.refresh();
```

**Hard rules** (from lessons §4.1 cross-skill rules):
- `pinType: 'fixed'` for pinned sections when Lenis is active (default is `transform`, which lags)
- `anticipatePin: 1` to monitor scroll velocity and apply pinning slightly early
- `pinSpacing: false` if you DON'T want ScrollTrigger to insert filler — typically you DO want it, so leave default
- NEVER use `position: sticky` AND `ScrollTrigger pin: true` on the same element — they fight
- Default to `position: sticky` for scene stages, use `ScrollTrigger pin: true` only for the morph-orchestration timeline above the stage

### Scroll progress → scene index (vanilla, no GSAP pin needed)

For the particle archetype specifically, we use **`position: sticky` for the stage** and read scroll progress manually — no GSAP pin necessary. The pattern:

```javascript
const story = document.querySelector('.story');
const N_SCENES = 6;

const computeScene = () => {
  const rect = story.getBoundingClientRect();
  const total = story.offsetHeight - window.innerHeight;
  const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
  return Math.max(0, Math.min(N_SCENES - 1, Math.floor(p * N_SCENES + 0.001)));
};

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const idx = computeScene();
    if (idx !== activeScene) goToScene(idx);
    ticking = false;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
```

This is simpler than wrapping in ScrollTrigger and avoids the pin-vs-sticky conflict entirely.

---

## 7. Typography for the register

The textura.us register depends on a specific typographic vocabulary: condensed bold ALL CAPS for hero statements, monospace for scientific notation labels, restrained serif italic for intimate moments. All achievable with free Google Fonts.

| Use | Free font | Premium equivalent |
|---|---|---|
| **Condensed bold hero ALL CAPS** | **Anton** (single weight, condensed, free) | GT America Compressed Bold |
| Alternative condensed | **Bebas Neue**, **Oswald**, **League Gothic** | Aktiv Grotesk Condensed XBold |
| Body / sub copy | **DM Sans** 400/500 | Söhne Buch / Inter |
| Scientific notation / monospace | **JetBrains Mono** 400/500 | Berkeley Mono / GT Pressura Mono |
| Intimate serif italic (occasional) | **DM Serif Display** italic, **Instrument Serif** italic | GT Sectra Italic |
| Variable-weight bold (multi-weight families) | **Barlow Condensed** (18 styles) | — |

**Google Fonts URL (one request, all needed weights):**
```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### The scientific notation device

Every textura-style site uses the same 4 typographic moves to create the "lab paper" feel. Apply at least 3 of these per page:

| Device | Where | Example |
|---|---|---|
| **Parenthetical brand stack** | Top-left, always visible | `(BRAND)` newline `[TAGLINE]` |
| **Chapter ladder** | Top-right, click-jumpable | `COST › / LEAK › / PATTERN ›` |
| **Roman + section number + title** | Bottom-left, updates per scene | `(II) — SEC.002 — THE LEAK` |
| **Bracketed metric tag** | Above each hero statement | `[ ENTROPY × 1% / YR ]` `[ ADMIN × 6.4 HRS / WK ]` |

All in **JetBrains Mono 10–11px, letter-spacing 0.18–0.22em, uppercase**. The visual register is unmistakable.

---

## 8. Performance budgets per tier

| Metric | T1 Canvas-2D | T2 Three.js Points | T3 GPGPU |
|---|---|---|---|
| Particles desktop | 2K-3K | 30K-100K | 200K-2M |
| Particles mobile | 1K-1.5K | 8K-30K | 50K-200K |
| Bundle weight | ~6KB | ~150KB | ~180KB |
| 60fps requires | Modern phone | Mid-tier phone with WebGL2 | Recent iPhone / Pixel 7+ |
| Battery cost | Low | Medium | High |
| Build time (first scene) | 30 min | 2 hrs | 4-6 hrs |
| First-paint penalty | <50ms | ~200ms (Three.js parse) | ~400ms (compute init) |

**Mobile scaling formula:**
```javascript
const isMobile = matchMedia('(max-width: 720px)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const TARGET_DENSITY = isMobile ? 0.0021 : 0.0028;   // particles per px
const N = Math.min(
  isMobile ? 30000 : 100000,
  Math.max(2000, Math.floor(W * H * TARGET_DENSITY))
);
```

**Performance discipline:**
- Pre-render particle sprites (radial gradient) to an offscreen canvas / single texture. Never compute gradients per-frame.
- Use `THREE.AdditiveBlending` + `depthWrite: false` to skip sorting overhead.
- One `THREE.Points` per scene, not N meshes.
- Reuse the same BufferGeometry across all scenes — only swap attributes, never recreate.
- `gsap.quickTo` / `gsap.quickSetter` for any per-frame value updates (avoids tween-creation overhead).
- `will-change: transform` on the stage container ONLY (never on every element — wastes compositor layers).

---

## 9. The `prefers-reduced-motion` fallback (non-negotiable)

Every page in this archetype MUST degrade gracefully to a flat document for users with reduced-motion preference. This is BOTH a WCAG requirement AND the experience for ~25% of macOS/iOS users.

The fallback:
- `.story { height: auto }` — collapse the trigger zone
- `.stage { position: relative; height: auto; overflow: visible }` — release sticky
- `.scene { position: relative; min-height: 100dvh; opacity: 1; pointer-events: auto }` — every scene shows in vertical sequence
- Canvas: `display: none` — disable the particle render loop entirely
- All `.reveal` and per-line text animations: instant
- Body / form copy: full opacity, no transition
- Chapter ladder: hidden (no scene to "jump" to in a flat doc)

CSS pattern:
```css
@media (prefers-reduced-motion: reduce) {
  .story { height: auto; }
  .stage { position: relative; height: auto; overflow: visible; }
  .scene {
    position: relative; inset: auto;
    min-height: 100vh; min-height: 100dvh;
    opacity: 1; pointer-events: auto;
    transition: none;
    border-bottom: 1px solid var(--line);
  }
  .canvas { display: none; }
  .chapter-ladder { display: none; }
  .scene .reveal, .scene .h-main .reveal-line span {
    opacity: 1 !important; transform: none !important; transition: none !important;
  }
}
```

JS pattern:
```javascript
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) {
  document.querySelectorAll('.scene').forEach(s => s.classList.add('active'));
  canvas.style.display = 'none';
  return;        // skip the entire scene controller setup
}
```

---

## 10. Hard rules + anti-patterns

✅ **DO**
- Use `position: sticky` for the stage (per skill rule §4.1 — never GSAP `pin: true` for stage)
- Use the SAME particle code path on desktop AND mobile (per lessons §7 — never an image-swap fallback)
- Pre-compute particle layouts once per scene; never per-frame
- Cap DPR at 2 (`Math.min(window.devicePixelRatio, 2)`)
- One `requestAnimationFrame` loop drives both particle render AND scene index check
- Test on a real mid-tier Android phone before declaring the page shipped
- Honour `prefers-reduced-motion` completely (degrade to flat document, NOT just slower animation)

❌ **DON'T**
- Reuse a brand-identity video as decoration (lesson §10) — generate purpose-built motion assets
- Hardcode particle counts without DPR / viewport scaling
- Use mix-blend-mode + filter blur on more than one element per page (compositor thrash)
- Run particle simulation when the tab is hidden (`document.hidden`) — wastes battery
- Forget the WebGL context loss handler (`canvas.addEventListener('webglcontextlost', ...)`) — happens on long mobile sessions
- Use external services / CDN for fonts that can lose hosting (always cite + fallback)
- Ship without testing the reduced-motion fallback (it's a real audience, not theoretical)

---

## 11. The minimal `index.html` scaffold

The smallest viable skeleton for a T2 particle narrative. Drop content into it.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>brand · chapter</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  /* ... (full CSS from worked example below) ... */
</style>
</head>
<body>
  <a href="#book" class="skip-link">Skip to book</a>

  <section class="story" id="story">
    <div class="stage" id="stage">
      <canvas class="canvas" id="canvas" aria-hidden="true"></canvas>
      <div class="stage-frame" aria-hidden="true"></div>

      <div class="brand-tag">
        <span class="row">(BRAND)</span>
        <span class="row dim">[TAGLINE]</span>
      </div>

      <nav class="chapter-ladder" id="ladder">
        <!-- N buttons, one per scene -->
      </nav>

      <div class="chapter-label" id="chapterLabel">
        <span id="cl-roman">(I)</span> — <span id="cl-sec">SEC.001</span> — <span id="cl-title">TITLE</span>
      </div>

      <!-- N <article class="scene" data-scene="0" data-layout="wispy"> blocks -->
    </div>
  </section>

  <!-- post-story section: contact form -->
  <section class="book" id="book"> ... </section>

  <!-- Three.js + GSAP via CDN — no npm, no build step -->
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js"
    }
  }
  </script>
  <script type="module">
    import * as THREE from 'three';
    // ... particle system + scene controller + Lenis wiring
  </script>
</body>
</html>
```

The skill ships an automaitions-tinted worked example in `automaitions-business-cinema.html` — fork that for new pages.

---

## 12. Worked sequence — 6 chapters in the automaitions anti-burnout register

| Scene | Particle layout | Hero (Anton ALL CAPS unless noted) | Body block |
|---|---|---|---|
| I · SEC.001 · THE COST | `wispy` (coral plumes) | *"Every evening / is gone."* (DM Sans italic, intimate) | "You're at the laptop at 10pm. Again. Three quotes to write. Two follow-ups overdue…" |
| II · SEC.002 · THE LEAK | `burst` (indigo supernova) | **"SIX HOURS / LOST EVERY / TUESDAY."** | "Across 47 small-business owners we've sat with, the leak is the same shape every time…" |
| III · SEC.003 · THE PATTERN | `constellation` (10 clusters) | **"FIVE TASKS. / REPEATED. / FOREVER."** | "The same five jobs. Different customer. Same shape…" |
| IV · SEC.004 · THE SECOND HAND | `galaxy` (spiral) | *"A second pair / of hands."* (intimate) | "We sit with you for an hour. We find the one job that eats your week…" |
| V · SEC.005 · THE PROOF | `starfield` | **"1,284 TASKS / DONE TODAY. / WITHOUT US."** | "Our own automations. Running right now. Six systems live…" |
| VI · SEC.006 · BEGIN TODAY | `portal` (hourglass) | *"Begin today."* (intimate) → `BOOK THE 20-MIN CALL +` pill | "20 minutes on a video call. No pitch. No quote unless you ask…" |

Post-story (vertical scroll resumes): `(VII) — SEC.007 — THE CALL` form section.

---

## 13. Sources (free / public, all read for pattern extraction)

- **Codrops · Crafting a Dreamy Particle Effect with Three.js and GPGPU** (Dec 2024) — full GPGPU FBO ping-pong shaders
- **Codrops · Interactive Particles with Three.js** (2019, still canonical) — InstancedBufferGeometry + touch texture
- **Codrops · Building a Scroll-Driven Dual-Wave Text Animation with GSAP** (Jan 2026) — full `DualWaveAnimation` class with ScrollSmoother
- **Codrops · Sticky Grid Scroll** (Mar 2026) — pin + grid morph
- **Suboor Khan · Building Particle Systems with Three.js & WebGL Shaders** — 200K particles @ 60fps benchmark
- **Maxime Heckel · The Magical World of Particles with React Three Fiber and Shaders** — data-texture morph technique, 1M+ particles
- **brunoimbrizi/interactive-particles GitHub** (read-only, not forked) — the canonical Codrops 2019 implementation
- **DevDreaming · Smooth Scrolling in Next.js with Lenis & GSAP (2026)** — Darkroom Engineering Lenis pattern + deprecations
- **tsparticles GitHub** (read-only) — config-driven canvas-2D particle architecture
- **three-nebula GitHub** (read-only) — System→Emitter→Behaviour fluent pattern
- **Typewolf · 40 Best Google Fonts** — free condensed display alternatives to GT America Cd / Söhne Breit
- **GSAP docs · ScrollTrigger** — official pin / scrub / anticipatePin reference
- **textura.agency** (case studies referenced) — register / typography / chapter-paged narrative inspiration

---

## 14. The one-line rule

**Read once, build any awwwards-tier scroll-pinned particle narrative in a day. The shader morphs, the scene controller composes, the chrome scientific-notates, the typography earns the ambition. No paid template, no licensed font, no CDN beyond Three.js itself. Every new page in this register makes the next one faster.**
