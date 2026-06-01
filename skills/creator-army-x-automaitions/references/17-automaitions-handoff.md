# automaitions Handoff — Briefing the HTML Builder Skill

The `automaitions-html-builder` is the production skill for animated HTML landing pages, brand briefs, and marketing sites. It lives as a sibling skill in the same repo (`skill/SKILL.md`) and ships separately from CA.

CA's job: produce the strategic brief.
automaitions' job: produce the animated HTML page.

This file is the briefing protocol between them, so CA can hand off cleanly without loading all 17 of automaitions' own reference files.

---

## What automaitions does

A Claude Code skill that builds polished, animated HTML documents — partner briefs, member playbooks, visual explainers, landing pages, marketing sites. Powered by GSAP 3.15.0, Lenis smooth scroll, SplitText, and a comprehensive rules engine that makes taste-level design decisions automatically.

Key features:
- **40+ named animation patterns** with rule cards (when to use, what to pair with, what to avoid)
- **Auto-selection protocol** — picks the right motion patterns based on content
- **Mobile-first responsive** with desktop polish
- **ZERA motion rulebook** — locked timings + tier discipline
- **Hamburger nav mandatory** on every output
- **Audit script** runs before delivery to catch regressions

---

## Pre-brief discipline — the 6 decisions + 3-bucket reference library

Generic AI output is usually a downstream symptom of an upstream brief failure. Before writing the automaitions briefing template (below), force the operator through **six sharp decisions** and **three concrete reference buckets**. If any answer hedges, push back — don't proceed.

### The 6 decisions (one sentence each, no hedging)

| # | Decision | Failure mode (vague answer) | Sharp answer (concrete) |
|---|---|---|---|
| 1 | **Feeling** — what should the page make you feel in the first 3 seconds? | "Premium and trustworthy" | "Like opening a Patek Philippe box — heavy, deliberate, hush" |
| 2 | **Audience + anti-audience** — who is this FOR and who is this NOT for? | "DTC founders" | "DTC founders past $1M ARR who already run Meta ads — NOT first-timers, NOT bootstrappers, NOT agencies looking to white-label" |
| 3 | **Hero object** — what one visual element carries the page? | "Some kind of diagram" | "The 25-skill chain assembling itself frame-by-frame as you scroll" |
| 4 | **Job verb** — what does the page DO to the reader? | "Convert them" | "Convince them to apply for the Q1 pilot — fill the form, hit submit" |
| 5 | **Sectional cuts** — what are the 5-7 sections, in order? | "Hero, features, pricing, FAQ" | "Hero → trust band → mechanism explainer → comparison table → guarantee → application → P.S." |
| 6 | **Three-second memory** — what one thing should they remember 24 hours later? | "Our brand" | "Five brands. $5K flat. 14-day refund." |

### The pushback protocol

When an answer hedges — *"premium and clean"*, *"feels modern"*, *"trustworthy professional"* — that's a failure state, not an answer. Respond with:

> *"That's a failure state. 'Premium' describes every brand in your category, so it produces every brand in your category. The three-second answer has to be a specific image, a specific phrase, a specific feeling. One sentence. Pick one."*

Don't accept the second hedge either. Iterate until the answer is concrete.

### The 3-bucket reference library

Before any hero composition gets briefed, the operator submits **3–5 references per bucket**. References are visual PROOF that the decisions above are achievable — they pre-empt the "make it look premium" failure by anchoring to specific extant work.

| Bucket | What it captures | Where to source | Examples for automaitions |
|---|---|---|---|
| **Feeling bucket** | The mood / energy / emotional register | Awwwards, Behance, Dribbble, /spy outputs | Kong's pilot LP, Linear's homepage, Vercel's deploy page |
| **Structural bucket** | Layout patterns — section order, density, white space, hero composition | Awwwards LP collections, Mobbin, competitor LP captures | Kong's `getkong.ai`, ramp.com hero, replit.com pricing |
| **Detail bucket** | Type treatment, micro-interactions, transitions, button states | Pinterest motion clips, OpenProcessing, individual Dribbble shots | DM Serif italic emphasis, button hover translate-Y, char-by-char SplitText reveal |

The references stay attached to the brief for the entire build — automaitions sees them, the polish-pass references them, Attention AI QA compares against them.

### The dual-reference attachment pattern (per Textura pipeline §04)

When briefing automaitions to recreate or model a specific competitor layout, attach BOTH:

1. **The stripped reference** — competitor page processed via GPT Image 4o or OpenArt with the prompt: *"A high-fidelity mockup based on [screenshot]. Only UI elements on solid black background. All background imagery removed. Text and buttons in strict black and white. Stark, minimal, high-contrast monochrome."*
2. **The original reference** — untouched screenshot

automaitions uses the stripped version for layout / proportion / spacing intent, and the original for mood / colour / typographic feel. Methodology lives in `21-png-to-svg.md` § Reverse direction.

---

## The 2 template shapes

automaitions ships two output shapes. CA must pick which one before briefing.

### Shape 1: Single-document HTML brief
One URL. Long-scroll. Use for:
- **Partner briefs** — partnership pitches, member playbooks, retailer guides
- **Visual explainers** — concept walkthroughs with diagrams (8 SVG archetypes available)
- **Single-page landing pages** — opt-in pages OR sales pages (the 17-Step Selling System from `15-landing-page-copy.md` fits cleanly here)

Templates: `templates/partner-brief-template.html`, `templates/visual-explainer-template.html`

### Shape 2: Multi-page marketing site
3+ connected pages with shared nav, modal CTAs, cross-page linking, Formspree forms. Use for:
- Founder brand sites
- Productised consultancy launches
- Client microsites
- Anything with home / services / company / contact structure

Template: `templates/marketing-site-template/` (ships as a directory with 4 pages + shared assets)

### Picking between them

```
Does the deliverable live at one URL?
  → Shape 1 (single brief). Pick partner-brief or visual-explainer by content density.

Does the deliverable have 3+ pages with shared navigation?
  → Shape 2 (marketing site). Don't stitch multiple single-doc briefs.

Borderline (2-page deliverable)?
  → Usually Shape 1 with anchored sections instead of separate pages. One long-scroll feels more polished than two siblings.
```

### Hamburger nav per shape (per `20-lessons.md §8`)

The sibling `automaitions-html-builder` skill's mandate "hamburger nav on every brief" is **shape-dependent, not universal**:

| Shape / sub-shape | Hamburger nav | Reason |
|---|---|---|
| Partner brief | ✅ Mandatory | Reader navigates between sections — orientation aid |
| Visual explainer | ✅ Mandatory | Same — multi-section orientation |
| Marketing site (Shape 2) | ✅ Mandatory | Cross-page navigation requirement |
| **Sales landing page** | ❌ **OMIT** | Single CTA, single job. Nav links = funnel leakage. Sabri Suby's 17-Step forbids decision paralysis. |
| Opt-in page (single-screen) | ❌ **OMIT** | Single email-capture job. No nav needed. |

When briefing automaitions for a sales LP or opt-in page, explicitly state: **NO HAMBURGER NAV.** Otherwise the skill applies its mandatory default and you ship a leaking funnel.

---

## The motion arsenal (high level)

automaitions has 40+ named animation techniques, organised into 5 tiers. CA doesn't need to know every technique by name — but CA should know which tier to specify.

| Tier | Use when | Examples (CA can name these by tier, not by technique) |
|---|---|---|
| **Tier 1** — baseline | Always | Section fade-in, stagger reveal, smooth scroll |
| **Tier 2** — enhanced | Default for any polished page | Cascade reveal, batch reveals, stat counters, parallax depth |
| **Tier 3** — feature | One per page max — adds wow | Sticky pin + scrubbed crossfade, SplitText hero karaoke, DrawSVG diagrams |
| **Tier 4** — specialty | Specific use case only | Flip layout transitions, scroll-triggered scene morphs |
| **Tier 5** — experimental | Almost never | Custom shader integrations, WebGL scenes |

**CA briefing rule:** specify tier, not technique. Let automaitions' `designers-eye.md` protocol pick the specific technique from the brief content.

**Default:** Tier 1-2 auto-apply. Tier 3 should be proposed (max one per page) with reasoning. Tier 4-5 only on explicit user request.

---

## Tier 3 archetype: scroll-scrubbed video hero

A specific Tier 3 motion pattern worth canonising — high-impact, low-effort, and exactly the kind of cinematic-but-feasible motion that earns above-the-fold real estate. Source: Notion guide on "scroll-based hero animation" (the two-photo → Kling video → scroll-scrub pipeline).

**When to use:** the product or concept has a clean BEFORE → AFTER physical transformation that a viewer should EXPERIENCE rather than be told about. Suitcase packing itself. Perfume bottle assembling. Chain links snapping into place. A document folding into an envelope.

**When NOT to use:** abstract / conceptual products (SaaS, services), anything where the transformation isn't visually crisp, anything that requires the user to read while watching (the scroll-scrub IS the read).

**Inputs (briefed to `/seedance-*` or `/ugc-video` before automaitions sees the page):**

1. Start frame photo (PNG/JPG, locked-off camera angle)
2. End frame photo (same angle, same lighting, same background)
3. The two-frame prompt template (per `06-creative-types.md` § Two-frame product video)
4. Output: 7-second MP4, no audio needed

**Implementation pattern automaitions ships:**

```html
<section class="scrub-section">          <!-- 300vh tall trigger zone -->
  <div class="scrub-pin">                 <!-- 100vh, position: sticky -->
    <video class="scrub-video" muted playsinline preload="auto"
           poster="hero-final-frame.webp">
      <source src="hero-scrub.webm" type="video/webm">
      <source src="hero-scrub.mp4" type="video/mp4">
    </video>
    <div class="scrub-overlay">
      <span class="brand-wordmark">[logo]</span>
      <h1 class="scrub-headline">[headline]</h1>
      <a class="scrub-cta" href="#apply">[CTA]</a>
    </div>
  </div>
</section>
```

```css
.scrub-section { height: 300vh; }
.scrub-pin {
  position: sticky;     /* sticky, NEVER GSAP pin: true */
  top: 0;
  height: 100vh;
  overflow: hidden;
}
.scrub-video {
  width: 100%; height: 100%;
  object-fit: cover;
}
@media (prefers-reduced-motion: reduce) {
  /* serve poster as static hero, no scroll-scrubbing */
  .scrub-video { display: none; }
  .scrub-pin { background-image: var(--poster); background-size: cover; }
}
```

```js
const video = document.querySelector('.scrub-video');
const section = document.querySelector('.scrub-section');
let videoDuration = 0;
video.addEventListener('loadedmetadata', () => { videoDuration = video.duration; });

ScrollTrigger.create({
  trigger: section,
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: self => {
    if (!videoDuration) return;
    const t = self.progress * videoDuration;
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      video.currentTime = t;
    } else {
      requestAnimationFrame(() => { video.currentTime = t; });
    }
  }
});
```

**Hard rules (reconciled with skill-stack constraints):**

- ✅ **`position: sticky` for the pin** — never `ScrollTrigger { pin: true }`. The sibling automaitions skill's `lessons.md §4.1` documents that GSAP's `pin: true` fights Lenis on Chrome. ScrollTrigger is used ONLY for the scroll→currentTime mapping.
- ✅ **`scrub: true`** on the ScrollTrigger — natural, follows wheel velocity
- ✅ **Same implementation on desktop AND mobile.** Per `20-lessons.md §7` — if desktop hard-cuts between two static images while mobile scrubs smoothly, REMOVE the desktop fallback. Both viewports use the actual video element. Static-image fallback is ONLY for `prefers-reduced-motion`.
- ✅ **MP4 + WebM dual format**, WebM listed first. Each file < 2MB (Squoosh / FFmpeg for encoding).
- ✅ **Poster image** is the FINAL frame (not the first) — so reduced-motion users see the resolved state, not the starting state.
- ❌ **Don't autoplay.** `autoplay` is DISABLED, no controls, no loop. Scroll IS the play control.
- ❌ **Don't lazy-load the video.** Above the fold, must be ready when ScrollTrigger fires.

**Polish-pass cross-references:**

- `22-polish-pass.md` Audit 9 → scroll-scrubbed video parity check
- `22-polish-pass.md` Audit 6 → `prefers-reduced-motion` honoured
- `20-lessons.md §7` → cross-device parity gotcha

---

## Tier 3 archetype: floating brand-blob companion

A second Tier 3 motion pattern — quieter than the scroll-scrubbed hero, lives across the entire page rather than dominating one section. A fixed-position abstract motion asset (the "blob") moves between section-anchored waypoints as the reader scrolls, arriving at each section as you reach it. The asset rests at each waypoint, then moves to the next when the next section enters view. Feels like a brand character drifting through the page — not a watermark, not a takeover.

**When to use:** the brand benefits from a sustained atmospheric presence across the page; the page is content-dense and would feel cold without companion energy; the brand has an abstract identity hook (a blob, a glyph, an orb, a particle field) worth amortising across every section.

**When NOT to use:** product-focused pages where the product needs the visual oxygen; high-conversion-density landing pages where any non-CTA element steals click intent; pages where the asset would compete with critical content (forms, comparison tables, charts).

**Asset requirements** (per `06-creative-types.md §13a`):

- **Purpose-built motion-decoration asset.** Never repurpose a brand-identity video for this — they're different jobs (lesson §10). Generate a dedicated abstract motion asset using the two-frame technique: start image → end image → 7s video, all with explicit negative-prompting for logos / text / characters / objects.
- **Square 1:1 aspect** so it clips cleanly to any mask shape.
- **Locked-off camera, no zoom/parallax** in the source — the page transforms it; camera motion fights the transform.
- **WebM primary + MP4 fallback + WebP poster** (v2.3 dual-format requirement).
- **Loop-friendly:** end frame close to start frame so `loop` attribute on the `<video>` cycles seamlessly.

**Implementation pattern** (vanilla JS, ~70 lines, no GSAP):

```html
<!-- Element lives at body level, OUTSIDE <main>, with position: fixed -->
<div class="brand-blob" id="brandBlob" aria-hidden="true">
  <video muted playsinline autoplay loop preload="auto"
         poster="blob-poster.webp">
    <source src="blob-loop.webm" type="video/webm">
    <source src="blob-loop.mp4"  type="video/mp4">
  </video>
</div>

<!-- Every section declares its blob target via data-* attrs -->
<section id="hero"
         data-blob-x="70" data-blob-y="34"
         data-blob-scale="1.0" data-blob-opacity="0.75">
  ...
</section>
<section id="features"
         data-blob-x="22" data-blob-y="48"
         data-blob-scale="0.75" data-blob-opacity="0.6">
  ...
</section>
```

```css
.brand-blob {
  position: fixed; top: 0; left: 0;
  width: clamp(280px, 42vmin, 520px);
  height: clamp(280px, 42vmin, 520px);
  z-index: 0;  /* sits behind all content; body > * lifts content to z-index: 1 */
  pointer-events: none;
  --blob-x: 70vw;
  --blob-y: 30vh;
  --blob-scale: 1;
  --blob-opacity: 0;
  transform: translate3d(calc(var(--blob-x) - 50%), calc(var(--blob-y) - 50%), 0)
             scale(var(--blob-scale));
  opacity: var(--blob-opacity);
  /* ZERA section-reveal timing: 0.55s, ease-out cubic */
  transition:
    transform 0.55s cubic-bezier(.2, .7, .3, 1),
    opacity   0.55s ease;
  will-change: transform, opacity;
}
.brand-blob video {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 50%;
  /* Radial mask → organic blob silhouette */
  mask-image: radial-gradient(ellipse at center,
              black 38%, rgba(0,0,0,0.55) 58%, transparent 78%);
  filter: blur(12px) saturate(1.15);
  mix-blend-mode: lighten;  /* dark text reads clean over it */
}
body > * { position: relative; z-index: 1; }
.brand-blob   { z-index: 0; }
@media (prefers-reduced-motion: reduce) {
  .brand-blob {
    --blob-x: 75vw;
    --blob-y: 22vh;
    --blob-scale: 0.85;
    --blob-opacity: 0.35;
    transition: opacity 0.3s ease;
  }
}
```

```js
const blob = document.getElementById('brandBlob');
const sections = document.querySelectorAll('[data-blob-x]');
const setTarget = (section) => {
  blob.style.setProperty('--blob-x',       section.dataset.blobX       + 'vw');
  blob.style.setProperty('--blob-y',       section.dataset.blobY       + 'vh');
  blob.style.setProperty('--blob-scale',   section.dataset.blobScale);
  blob.style.setProperty('--blob-opacity', section.dataset.blobOpacity);
};
setTarget(sections[0]);  // initial position = hero target
const io = new IntersectionObserver((entries) => {
  let best = null;
  entries.forEach(e => {
    if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
      best = e;
    }
  });
  if (best) setTarget(best.target);
}, {
  rootMargin: '-30% 0px -50% 0px',  // active zone = upper-middle of viewport
  threshold: [0, 0.25, 0.5, 0.75, 1]
});
sections.forEach(s => io.observe(s));
```

**Hard calibration rules** (per the workflow in this file's "Pre-brief discipline" section + lesson on motion calibration):

- ✅ **Section-anchored IntersectionObserver, not raw scroll-progress %**. Raw `scrollY / docH` percentages don't know what's on screen — the blob arrives early/late relative to your eye.
- ✅ **CSS transitions on CSS custom properties**, not per-frame JS interpolation. The browser handles easing on the compositor; JS just sets the target. No rAF loop needed.
- ✅ **Two scale values max** (e.g., 1.0 for "featured/centred" moments, 0.75 for "off to the side" moments). Sub-perceptual scale deltas waste CPU and don't read.
- ✅ **No rotation.** Sub-10° rotations read as jitter. Either omit entirely or commit to 25°+ rotations (rarely needed for ambient companion motion).
- ✅ **Fixed or very narrow opacity range** (0.5–0.75). Wider ranges = the blob fades in/out repeatedly = feels indecisive.
- ✅ **Four cardinal-ish position anchors max** (top-right / centre / top-left / bottom-right). More = the blob dances around and confuses the eye.
- ✅ **ZERA timing locked**: `transform / opacity transition: 0.55s cubic-bezier(.2,.7,.3,1)`. Don't hand-tune.
- ✅ **`?debug=blob` overlay** during calibration: a fixed-position panel shows current section / target waypoint / opacity / scale. Strip from ship by closing the query param. Calibrating by readout is 10× faster than calibrating by eye.

**Polish-pass cross-references:**

- `22-polish-pass.md` § Audit 2 Motion sync — confirm the blob arrives at each section's reveal moment, not before / after
- `22-polish-pass.md` § Audit 9 Performance — `will-change: transform, opacity` is the only `will-change` declaration; remove `will-change` from any other element to prevent compositor thrashing
- `06-creative-types.md §13a` — the asset-generation recipe
- `20-lessons.md §10` — why purpose-built (and never identity-video-repurposed)

---

## The briefing template

When CA hands off to automaitions, use this template. Paste into the chat where automaitions will pick it up.

```markdown
SKILL: automaitions-html-builder
DELIVERABLE TYPE: [opt-in page / sales page / partner brief / visual explainer / marketing site / Magic Lantern step-N]
TEMPLATE SHAPE: [Shape 1 (single doc) / Shape 2 (multi-page)]

## Brand inputs
BRAND DNA DOC: [paste full brand-dna.html OR reference brand/brand-config.json]
LOGO VARIANT TO USE: [primary / mono-dark / mono-light / knockout / glyph-only-{colour} — see brand/README.md]
TARGET DEPLOY: [Vercel / Netlify / Shopify section / standalone HTML / local file]

## Strategic inputs (from CA)
HERO MECHANISM (one sentence): [from 14-offer-architecture.md → Hero Mechanism section]
GODFATHER OFFER PARAGRAPH (4-6 lines): [from 14-offer-architecture.md → 7 components]
PRIMARY AWARENESS LEVEL: [Unaware / Problem-Aware / Solution-Aware / Product-Aware / Most-Aware]
PRIMARY CUSTOMER TYPE: [from /voc Section 4 ICP — one-paragraph summary]

## Content (already strategically structured)
FULL COPY: [the page's complete copy, section by section, per the 17-Step Selling System in 15-landing-page-copy.md if it's a sales page]
HEADLINE: [exact text — must match the ad creative the page receives traffic from]
SUBHEADLINE: [exact text]
6-8 SECTION HEADERS: [in order]
3-5 KEY CUSTOMER QUOTES: [verbatim from /voc Section 14 Social Proof Arsenal]

## Visual assets
PRODUCT IMAGES: [paths or paste]
HVCO MOCKUP (if opt-in page): [path or description]
HERO IMAGERY: [either real photography OR a /seedance-* output URL OR a /create-static-ads NB2 prompt to render]

## Motion brief
MOTION TIER: [Tier 1-2 baseline ONLY / Tier 2 + ONE Tier 3 candidate / specify Tier 3+ technique by name if you know exactly what you want]
KEY MOMENT NEEDING MOTION: [e.g., "the hero mechanism explainer needs SVG draw-in to make the absorption timeline tangible"]
MOTION VIBE WORDS: [3-5 adjectives, e.g., "clinical, precise, premium, restrained, confident"]

## Conversion architecture
PRIMARY CTA: [exact text — ONE only, never a menu]
CTA DESTINATION: [URL or anchor]
FORM FIELDS (if opt-in): [name + email = default; add fields only with strong justification]
SCARCITY ELEMENT (if any): [genuine constraint only — no fake countdowns]
POWER GUARANTEE TEXT (if sales page): [specific, measurable, attached to performance]

## Post-build
RUN AUDIT.PY: [yes — always]
DELIVER AS: [file path / Vercel deploy / shopify section snippet]
```

---

## What CA needs to decide BEFORE briefing automaitions

automaitions is a production tool, not a strategy tool. If you brief it with strategic gaps, it will fill them with generic defaults. The following must be CA decisions, not automaitions decisions:

| Decision | Where in CA |
|---|---|
| Opt-in vs sales page | `15-landing-page-copy.md` → Two landing page types |
| Single doc vs marketing site | This file → 2 template shapes |
| Primary customer awareness level | `/voc` Section 9 + `16-skill-orchestration.md` Appendix A |
| Hero mechanism statement | `14-offer-architecture.md` → Hero Mechanism (5-step methodology) |
| Godfather Offer construction | `14-offer-architecture.md` → 7 components |
| Selling sequence applied to page sections | `03-selling-sequence.md` + `15-landing-page-copy.md` → 17-Step Selling System |
| Customer quotes to feature | `/voc` Section 14 Social Proof Arsenal |
| CTA wording | `06-creative-types.md` + the offer architecture |

automaitions handles everything BELOW these strategic decisions — visual treatment, responsive behaviour, motion selection, audit, polish.

---

## Post-build QA — run through Attention AI

After `automaitions` ships the page, run the URL through **Attention AI** (see `19-attention-ai.md` → Workflow A) BEFORE driving any paid traffic. This closes the single biggest gap in `automaitions`' current process — it has no objective visual QA.

Quick protocol:
1. Open `https://attention-ai.jay.com.au/` (access code: `onelifeclub`)
2. Run the page URL at all 4 capture modes (Desktop, Desktop Long, Mobile, Mobile Long)
3. Validate the heatmap concentrates on: hero headline + hero mechanism + primary CTA
4. If shotgun pattern or weak heatmap on the CTA → fix before launch (usually means reducing visual competition from secondary elements or increasing the CTA's visual salience)
5. Keep iterating until the heatmap shows a clear slippery slope toward the action you want

Total time: 5 minutes per page. Saves 7-14 days of wasted ad spend on a page that doesn't convert.

---

## What automaitions handles automatically (don't brief)

You don't need to specify these — automaitions has rules:

- Palette derivation (uses brand/brand-config.json)
- Typography hierarchy (clamp() values, line-heights, text-wrap rules)
- Logo placement + favicon embedding
- OG meta tags for social sharing
- Hamburger nav (mandatory on every page)
- Mobile-first responsive breakpoints
- GSAP + Lenis + SplitText loading
- Animation tier auto-selection (will propose Tier 3 if applicable)
- Accessibility (keyboard nav, screen readers, focus states, reduced motion)
- Performance budgets
- Audit script before delivery

---

## What automaitions WON'T do (CA must cover these)

- Brand strategy decisions (positioning, voice, tone) — that's the Brand DNA doc
- Customer research (pain points, desires, language) — that's `/voc`
- Offer construction (Godfather Offer 7 components) — that's `14-offer-architecture.md`
- Page-level copy beyond what you give it — automaitions does NOT write your headline, body, or CTA from scratch
- Selling sequence application — you provide the structured copy; automaitions makes it beautiful
- Animation experimentation beyond the locked ZERA timings — predictable, not novel
- Content fact-checking — claims must be accurate before you brief automaitions

---

## Common automaitions briefing failure modes

| Failure | Cause | Fix |
|---|---|---|
| Generic-feeling output | Underspecified strategic inputs | Add hero mechanism + customer awareness level + verbatim VOC quotes to the brief |
| Motion feels random | Didn't specify tier or vibe words | Always include MOTION TIER and 3-5 MOTION VIBE WORDS |
| Brand palette wrong | brand-config.json still on placeholder defaults | Run `/brand-dna` first; populate `brand/` |
| Hero photo missing brand identity | No 50-75 word prompt modifier provided for image generation | Prepend Brand DNA Section 8 (Image Generation Prompt Modifier) to any image prompt automaitions generates |
| Page copy reads like ad copy when it should read like brand voice | Brand DNA voice adjectives not included in brief | Always paste the 5 voice adjectives from Brand DNA Section 1 |
| Two CTAs (decision paralysis) | Briefer added "primary" + "secondary" CTA | ONE CTA only. Always. |
| Page doesn't match the ad that drove traffic | Briefer wrote page copy without seeing the ad | Always include the ad headline + hook in the brief so automaitions can echo them |

---

## When NOT to use automaitions

automaitions is overkill (and the wrong tool) for:

- Static product pages on Shopify — use Shopify's native theme system
- Simple form-only opt-in pages — use Klaviyo / ConvertKit native forms
- Email templates — use Klaviyo / Mailchimp templates
- React / Vue apps — automaitions outputs vanilla HTML + GSAP, not framework code
- Documents that need to be edited by non-developers — Notion or Webflow are better
- Documents with NO visual design requirement — markdown is fine

Use automaitions when the deliverable is **a polished, animated, branded HTML asset that needs to feel premium and convert** — landing pages, sales pages, partner briefs, visual explainers, marketing sites.

---

## The one-liner

**CA decides the strategy. automaitions produces the page. Brief automaitions with the full strategic context (Brand DNA + VOC excerpts + Hero Mechanism + Godfather Offer + selling-sequence-structured copy + motion tier + vibe words) and it will produce a page that converts. Brief it underspecified and you get generic templates.**
