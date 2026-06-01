# Polish Pass — Pre-Ship QA Checklist

The mandatory gate before any deliverable goes live. Runs on every output of
every production skill — static ads, UGC scripts, videos, landing pages, copy.

The polish pass is the difference between "produced" and "ready to spend money
behind." If the polish pass fails, nothing ships.

---

## When to run polish pass

**MANDATORY before:**
- Pushing any landing page to main (Vercel auto-deploys live)
- Uploading any creative batch to Meta Ads Manager
- Shipping any client-facing deliverable
- Marking any cohort artefact as "delivered"

**Recommended before:**
- Internal reviews / strategic brief approval
- Sharing any preview links externally
- Demo-ing the work in a discovery call

---

## The 9 audits

Polish pass is composed of 9 audits run in order. The first failure stops the
ship — fix and re-run from that audit, don't continue past it.

### Audit 1 — Alignment

**What you're checking:** Pixel-level layout integrity. Eye-tracks that scan
the page should never trip on misalignments.

- [ ] Text elements share consistent left-edge alignment within each section
- [ ] Buttons / CTAs are vertically aligned with their context (centered in
      hero, left-aligned in body, centered in card layouts)
- [ ] Grid items share consistent gaps (use `gap:` not margin combinations)
- [ ] Card content has uniform padding (top/bottom, left/right)
- [ ] Icon + text pairs share baseline alignment
- [ ] Form fields share consistent height + border + padding
- [ ] Headings + body text use consistent vertical rhythm
- [ ] No orphan elements floating in whitespace without anchor

**Common failures:**
- Stat-card numbers wrap onto two lines on mobile (need `white-space: nowrap`
  or smaller font-size)
- Form labels + inputs not vertically stacked correctly
- Hero CTA button drift when wrapped onto its own row
- Comparison-table cells not vertically aligned to top

### Audit 2 — Motion sync

**What you're checking:** Every animation belongs to something, fires when
expected, and doesn't compete with other motion.

- [ ] No animations starting before the user can see them (always tied to
      scroll-into-view via IntersectionObserver)
- [ ] No animations starting on page load that compete with hero readability
      (give the user 1-2s to absorb the hero before triggering further motion)
- [ ] Reveal cascades stagger meaningfully (0.05-0.10s between children, not
      simultaneous)
- [ ] Number count-ups complete BEFORE the user finishes reading the section
      they're in (1.3-1.8s typical, never over 3s)
- [ ] SVG draw-in animations complete BEFORE secondary effects start (e.g.
      chain lines draw → THEN breathing begins, not both at once)
- [ ] Hover state transitions feel instant (0.15-0.25s max)
- [ ] No jarring scroll-jumps from anchor clicks (smooth scroll either via
      `scroll-behavior: smooth` OR via Lenis, never both)
- [ ] `prefers-reduced-motion: reduce` strips ALL motion (count-ups become
      static, reveals become instant, sticky scroll is disabled)

**Common failures:**
- Hero h1 starts char-revealing BEFORE the page has settled, looks janky
- Multiple sections trigger reveals simultaneously when user scrolls fast
- Breathing animation continues during user interaction with that section
- SVG particle loop continues at full intensity even when section is off-screen

### Audit 3 — SVG audit (CRITICAL — per `20-lessons.md §1`)

**What you're checking:** Every SVG diagram is readable, motion-correct,
brand-aligned, AND mobile-legible.

- [ ] **Mobile readability at 375px viewport** — every label, every number,
      every visual element is readable WITHOUT zoom. Take a screenshot at
      375px width and verify.
- [ ] Words/labels are aligned to their visual element (not floating
      arbitrarily in whitespace)
- [ ] Arrows point in the correct direction relative to the flow they represent
- [ ] No "decorative noise" — every visible element MEANS something. If a
      decorative element has no meaning, it must be either removed OR have
      its meaning communicated in surrounding copy.
- [ ] Gradients/filters use brand palette tokens (`--indigo`, `--coral`),
      not hardcoded hex
- [ ] Animation runs at correct speed (chain draw-in ~1.1s per line,
      particles ~2.2s travel, breathing 3-4s cycle)
- [ ] `viewBox` is set explicitly; SVG scales correctly at all viewport widths
- [ ] No clipping at edges of the SVG container
- [ ] Text inside SVG uses brand-typography conventions (DM Sans for labels,
      DM Serif Display where applicable)
- [ ] Colour contrast meets WCAG AA (text labels on dark backgrounds ≥4.5:1)

**Mobile-specific (per `20-lessons.md §1`):**
- [ ] Phase node circles are at least 56px diameter on mobile
- [ ] Text labels INSIDE circles, not outside floating
- [ ] Decorative satellites hidden below 600px viewport
- [ ] Central focal element scales appropriately (often larger on mobile)

**Common failures:**
- "Random 25 dots" become unreadable noise at small viewport — see lessons §1
- Phase node single-letters (R/S/P/D) carry no meaning when context labels
  are illegible
- Gradient stops use raw hex codes that break when brand palette updates
- SVG text overflows the visible area on narrow viewports

### Audit 4 — Brand adherence

**What you're checking:** Brand DNA rules are enforced across the asset.

- [ ] Brand wordmark lowercase EVERYWHERE (`automaitions`, never
      `Automaitions` or `AUTOMAITIONS`).
      **Three documented exemptions** (per `20-lessons.md §8`):
      1. **Skill / framework compound names** are title-case by convention
         (`Creator Army × Automaitions`, `Sell Like Crazy`,
         `Breakthrough Advertising`) — same rule as proper-noun book titles.
      2. **Decorative ALL-CAPS monospace metadata bands** (footer
         attribution lines in JetBrains Mono, eyebrow tags like
         `// THE Q1 PILOT`) — a different visual register from the
         wordmark itself.
      3. **Sentence-start auto-capitalisation** of the wordmark — fix
         with CSS `text-transform: lowercase` on body OR hand-edit copy
         so the wordmark never starts a sentence.
- [ ] Palette 85/15 rule respected (indigo dominates, coral sparing)
- [ ] No coral elements exceed ~25% of any single composition area
- [ ] Typography hierarchy correct (DM Serif Display for headings/italic
      emphasis; DM Sans for body, labels, CTAs)
- [ ] Voice rules respected (no exclamation marks, no AI hype, no corporate
      jargon, no founder face leading)
- [ ] Logo usage correct per surface (see `23-brand-logo-usage.md`)
- [ ] **Logo is the REAL asset, not a placeholder** (per `20-lessons.md §6`).
      Open the file — if it contains the text "YOUR WORDMARK" or
      "replace brand/..." you've shipped the skill's placeholder. The real
      asset for the brand lives at `examples/<brand-name>-brand-assets/`.
- [ ] No stock photography
- [ ] Imagery direction follows Brand DNA §04 (or whatever section)
- [ ] CTAs use approved language patterns

**Common failures:**
- Brand name auto-capitalised at sentence start (CSS `text-transform: lowercase`
  on body, or hand-fix in copy)
- Coral used as co-primary alongside indigo (violates 85/15)
- Founder portrait used in hero (counter-positions wrong)
- "Revolutionary AI" or "game-changing" language slipped into copy
- Wrong logo variant for surface (mono-light on dark = invisible)

### Audit 5 — Responsive

**What you're checking:** The asset works across all common viewport sizes.

- [ ] **375px** (iPhone SE / 13 mini) — every element readable, no overflow,
      forms usable
- [ ] **414px** (iPhone Plus / 14 Pro Max) — same as above
- [ ] **768px** (iPad portrait) — transitions to medium layout cleanly
- [ ] **1280px** (laptop) — desktop layout active, max-width container kicks in
- [ ] **1920px** (large desktop) — no awkward whitespace; max-width caps work
- [ ] No horizontal scroll at any viewport width (except intentional
      e.g. comparison tables)
- [ ] Hamburger nav / sticky CTA bar appears on mobile, hides on desktop
- [ ] Hero composition adapts (single column on mobile, two-column on desktop)

**Common failures:**
- iOS Safari adds 16px zoom on focus to form inputs <16px — fix with
  `font-size: 16px` on inputs at mobile breakpoints
- Comparison tables overflow horizontally (fix with `overflow-x: auto`)
- Bold-statement headings overflow viewport (use proper `clamp()`)
- Sticky CTA bar covers the form submit button on mobile

### Audit 6 — Accessibility

**What you're checking:** Page works for users with assistive tech, with
reduced motion preferences, with screen readers, with keyboard-only navigation.

- [ ] Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`)
- [ ] Headings hierarchy intact (one `<h1>` per page, descending h2-h6)
- [ ] Images have `alt` text describing intent (or `alt=""` if purely decorative)
- [ ] SVGs marked `aria-hidden="true"` if decorative, OR `<title>` element
      inside if conveying information
- [ ] Form labels properly associated with inputs (`for=` matching `id=`)
- [ ] Submit buttons describe what they submit ("Apply for Q1 pilot" not "Submit")
- [ ] Skip-to-content link present
- [ ] Focus states visible (don't strip outline without replacement)
- [ ] Colour contrast: 4.5:1 text on background, 3:1 large text and UI components
- [ ] `prefers-reduced-motion: reduce` strips motion fully
- [ ] Page navigable with keyboard alone (tab through all interactive elements)
- [ ] No critical info conveyed by colour alone (success/error need icons too)

**Common failures:**
- Decorative SVGs missing `aria-hidden="true"`
- Form fields with placeholder text but no label (placeholder is NOT a label)
- Colour-only error states (red border, no error message)
- Focus rings stripped with `outline: none` and no replacement

### Audit 7 — Copy

**What you're checking:** Every word is intentional, correct, and on-brand.

- [ ] No typos (proper noun spellings, dollar signs in right place, brand
      name correct)
- [ ] Sentence case in body copy, Title Case in headings as Brand DNA dictates
- [ ] No double-spaces (search-replace `"  "` → `" "`)
- [ ] Em-dashes used correctly (`—` not `--` or `-`)
- [ ] Quotes are smart-quotes where applicable
- [ ] Brand voice consistent (operator-direct, no marketing fluff, no exclamation)
- [ ] Numbers consistent (40+ vs 40 plus vs forty — pick one and stick)
- [ ] Character limits respected on Meta ads (≤125 primary text preview,
      ≤40 headline, ≤30 description)
- [ ] CTAs use action verbs (Apply, See, Read — not "Learn More" unless
      brand has approved it)
- [ ] No placeholder text left in (`Lorem ipsum`, `XX`, `TBD`)
- [ ] **No banned adjectives.** The following describe every site, so they
      produce every site — REFUSE them in headlines, subheads, body, OG
      meta, alt text:

      `modern · clean · minimal · professional · sleek · premium · beautiful · elegant · innovative · seamless · cutting-edge · world-class · best-in-class · next-gen · solutions · synergy · empower · unlock · revolutionary · game-changing · leveraging · robust · scalable`

      If a brief uses these, push back: *"That word describes every brand
      in your category. What does it mean SPECIFICALLY for this brand —
      a concrete texture, a phrase, a feeling that wouldn't fit a
      competitor? One sentence."* The replacement is concrete imagery
      and verbs, not adjectives.

      **Two documented exemptions** (per `20-lessons.md §9`):
      1. **Scare-quoted jargon callouts.** A banned word wrapped in
         `"..."` or `'...'` AND surrounded by an explicit rejection
         clause (`no `, `without `, `not `, `zero `) is anti-jargon
         copy — counts as evidence the rule is followed, not broken.
         Example: *"No 'leveraging' or 'synergies'"* — passes.
      2. **Industry-category names in form dropdowns.** A banned word
         used as a literal segment label inside `<option>` / `<select>`
         elements (e.g. "Professional services", "Premium tier") is
         a category name, not a self-descriptive adjective. Passes.

      When a grep flags one of these words, READ THE LINE before
      logging it as a violation. The rule is about the page's voice,
      not about words being totally absent.

**Common failures:**
- `Automaitions` capitalised at the start of a sentence after CSS forces
  lowercase elsewhere (looks like a typo)
- Mixed `$5K` / `$5,000` / `five thousand dollars` (pick one)
- Headline truncated by Meta because it's 42 chars not 40

### Audit 8 — Form / interaction

**What you're checking:** Every interactive element works as expected.

- [ ] Form posts to the correct endpoint (Formspree URL is the live one,
      not a test/dummy)
- [ ] All required fields are marked `required`
- [ ] Validation messages appear correctly (don't override with broken
      pseudo-validation)
- [ ] Success state takes the user somewhere reasonable (thank-you page or
      visible confirmation)
- [ ] Hidden form fields (`_subject`, `source`, UTM tags) are populated
- [ ] CTA buttons all go to the right destinations
- [ ] Anchor links work (clicking `#apply` scrolls to the apply section)
- [ ] External links open in new tab where appropriate (`target="_blank"`
      with `rel="noopener"`)
- [ ] No console errors when navigating the page
- [ ] Sticky elements don't cover critical content (sticky CTA hides when
      form is in view)

**Common failures:**
- Form submits to a Formspree test endpoint that emails nobody
- "Apply Now" button links to `#apply-section` but the section ID is `#apply`
- Mobile sticky CTA covers the submit button when the form is in view

### Audit 9 — Performance

**What you're checking:** The page loads fast and stays responsive.

**Numeric thresholds (objective gates — not vibes):**

- [ ] **Lighthouse Performance ≥ 90** on mobile (run via Chrome DevTools or
      PageSpeed Insights). Below 90 = ship-stop.
- [ ] **LCP < 2.5s · CLS < 0.1 · INP < 200ms** (Core Web Vitals)
- [ ] **Initial page weight < 200KB** (HTML + CSS + JS, excluding images)
- [ ] **All raster images → WebP** via Squoosh quality 80 (or AVIF where
      browser support is sufficient). Original PNG/JPG only as fallback.
- [ ] **Background / hero video < 2MB**, served as MP4 + WebM dual-format
      (`<source type="video/webm">` first, MP4 second)
- [ ] **Above-the-fold renders without blocking image loads**
- [ ] **Hero image dimensions reserved** in HTML (explicit `width` /
      `height` attrs OR `aspect-ratio` CSS) to prevent CLS
- [ ] **Web fonts** — `preconnect` to font vendor + `display: swap` +
      preload critical weight in `<head>`
- [ ] **No render-blocking scripts** in `<head>` without `defer` or `async`
- [ ] **Lazy-loading** (`loading="lazy"`) on every image below the fold
- [ ] **`prefers-reduced-motion` honoured** — sets a media query that
      disables scroll-scrubbed animation, count-ups, reveals
- [ ] **Video element attributes correct for context:**
  - Looping background video: `autoplay muted loop playsinline preload="auto"`
  - **Scroll-scrubbed hero video**: `muted playsInline preload="auto"`
    + autoplay DISABLED + no controls + no loop. Driven by GSAP
    ScrollTrigger mapping scroll progress (0→1) to
    `video.currentTime (0→video.duration)`. Use `requestVideoFrameCallback`
    for frame seeking, `requestAnimationFrame` as fallback.

**Scroll-scrubbed video cross-device parity check (per `20-lessons.md §7`):**

- [ ] Desktop AND mobile use the SAME `<video>` element with the SAME
      ScrollTrigger mapping. If desktop hard-cuts between two static
      images while mobile scrubs smoothly, you have a separate desktop
      fallback path — REMOVE IT. Both viewports must use the same video
      element. Static-image fallback is ONLY for `prefers-reduced-motion`,
      not for desktop.

**vercel.json (when hosting on Vercel):**

- [ ] `/public/*` cached `immutable` for 1 year
- [ ] `www.` → apex domain redirect configured
- [ ] SPA-style 404 → index.html rewrite if app router applicable

**Common failures:**
- Brand video is uncompressed 4K MP4 (~40MB) instead of compressed 720p
- Multiple Google Fonts loaded with all weights (use only the weights used)
- Image hero loads before above-the-fold text renders
- Scroll-scrubbed video swaps two static images on desktop instead of
  using the actual video element (see lesson §7)
- WebP missing — site ships as PNG/JPG only, killing mobile load

---

## The polish pass workflow

```
1. Run audits 1-9 in order
2. First failure → STOP, fix it, restart from current audit
3. All audits pass → mark deliverable as "POLISH PASSED"
4. Cross-reference: did this surface any new lessons? If yes,
   announce + add entry to 20-lessons.md
5. Cross-reference: did this surface any new polish-pass items
   the audit list was missing? If yes, add them to this doc.
```

---

## Polish pass for specific deliverable types

### Landing page polish pass
Run ALL 9 audits. Plus:
- Attention AI QA at all 4 viewport modes (per `19-attention-ai.md` Workflow A)
- Test the form actually submits to the live Formspree
- Test on real iPhone Safari (not just dev-tools mobile simulation)

### Static ad batch polish pass
Run audits 3 (SVG → image), 4 (brand), 7 (copy). Plus:
- Verify text rendering legible at 200×250 thumbnail size (Meta feed preview)
- Verify brand wordmark is visible but not dominating
- Verify CTA is in the eye-path (Attention AI Workflow C)

### UGC script polish pass
Run audit 7 (copy). Plus:
- Every line reads as natural human speech (per `/ugc` Natural_Speech_Rules)
- No ad-copy phrasing performed as dialogue
- Andromeda diversity check (5 dimensions, 3-of-5 minimum)

### Bulk import file polish pass
Run audits 7 (copy) + 8 (interaction). Plus:
- All UTM parameters formatted consistently
- All ad names follow `[Brand]_[Type]_[Hook]_[Date]_[Version]` pattern
- All destination URLs resolve to the correct landing page
- CTA values match Meta's allowed enum (`APPLY_NOW`, `LEARN_MORE`, etc.)

---

## When polish pass surfaces a recurring issue

If the same audit failure happens across multiple deliverables (e.g.
"phase node labels illegible on mobile" keeps surfacing):
1. Log it in `20-lessons.md`
2. Add a specific check to this doc's audit list
3. Update the upstream skill that produced the issue (e.g.
   `21-png-to-svg.md` § Mobile considerations gets the new rule)

The polish pass document compounds the same way the lessons document does
— each new audit item makes the next polish pass more thorough.

---

## Common audit-failure root causes

| Failure | Root cause | Fix location |
|---|---|---|
| Mobile SVG illegible | Author assumed desktop-first | `21-png-to-svg.md` § Mobile considerations |
| Brand voice slipped | DNA "Avoid" list not surfaced in brief | `12-brand-dna-interpretation.md` extraction step |
| Copy character count over Meta limit | `/copy` skill didn't enforce | `/copy` skill prompt |
| Form not wired | Production skill didn't validate destination | This doc's audit 8 |
| Reveal cascade looks janky | Stagger delay too large/small | This doc's audit 2 + per-pattern guidance |
| Sticky CTA covers content | Single-trigger visibility logic | `20-lessons.md §4` |

---

## The one-liner

**9 audits, in order, first failure stops the ship. Mobile readability is
non-negotiable. Every new failure becomes a future audit item. Polish pass
compounds the same way the lessons doc does — more thorough every time.**
