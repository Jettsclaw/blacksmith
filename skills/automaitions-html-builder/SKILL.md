---
name: automaitions-html-builder
description: Build polished, animated HTML documents — partner briefs, member playbooks, visual explainers, education docs, retailer guides. Triggers on any branded multi-section HTML document containing diagrams, stat cards, timelines, profiles, or tables. The skill makes taste-level design decisions automatically (palette, motion, layout) so users don't have to know what a scrubbed crossfade is to get one.
version: 1.0
---

## Trigger conditions

Load this skill for ANY request involving:
- Multi-section HTML documents, briefs, playbooks, guides
- Partnership decks, member resources, retailer guides
- Dark or light themed branded documents
- Documents with diagrams, stat cards, timelines, profiles, tables
- Documents viewed on both mobile and desktop
- Any HTML build asking for "polished", "animated", or "premium feel"

Do NOT use for: React/Vue apps, plain landing pages, documents with no
visual design requirement, raw documentation/markdown export.

---

## Quick orient — read the cheat sheet first

**`references/cheat-sheet.md`** — the entire design system compressed
into one file. Locked motion timings, type hierarchy, token block,
coral usage rules, mandatory patterns, top 5 bugs, audit expectations,
and the two template shapes index. Read this FIRST for any build.

For ~90% of builds, the cheat sheet plus the few references it points
at is enough. For deeper / unfamiliar territory (specific motion
patterns, complex diagrams, edge-case responsive behaviour), drop into
the full mandatory-read list below.

The cheat sheet is mirrored at `templates/cheat-sheet.md` and
`templates/marketing-site-template/cheat-sheet.md` so it travels with
the templates.

---

## MANDATORY — Read ALL reference files before writing a single line (deep / first-time builds)

This rule is unconditional for first-time and deep builds. Not "read
the relevant ones." Not "read the ones that seem needed." **Every
reference file. Every build that touches new territory. No exceptions.**

For repeat / templated builds where you've internalised the rules,
the cheat sheet above is sufficient. Use judgement — if you're not
sure, read everything.

Read in this order:

1. `references/ZERA-RULEBOOK-motion-and-hierarchy.md` — **locked timings + type hierarchy + tier discipline. Source of truth for every other reference file. Read first; everything else implements it.**
2. `references/colour-psychology.md` — palette derivation, OKLCH engine, surface freedom, intent mapping
3. `references/tokens.md` — token system, brand swaps, surface rules
4. `references/components.md` — full CSS/HTML component library
5. `references/typography.md` — clamp values, text-wrap rules, line-height table
6. `references/responsive.md` — breakpoints, fluid spacing, hamburger nav, mobile-first rules
7. `references/logos.md` — SVG-first pipeline, inline vs base64, surface-aware selection
8. `references/diagrams.md` — HTML vs SVG decision tree
9. `references/animations.md` — GSAP 3.15.0 arsenal + tiering. Implementation reference; defers to ZERA on numbers.
10. `references/designers-eye.md` — **content → motion auto-selection protocol.** How Claude picks techniques without asking the user. Read before scanning the brief's content.
11. `references/accessibility.md` — keyboard nav, screen readers, focus, contrast, reduced motion
12. `references/performance.md` — plugin loadout budgets, deferred loading, file size discipline
13. `references/checklist.md` — run as a script before every delivery
14. `references/lessons.md` — **compounding bug catalogue. Every gotcha previous builds have hit, with fix. Read this and you skip 80% of repeat mistakes. ADD AN ENTRY when you find a new bug — that's how the skill compounds.**

`references/motion-arsenal.md` is **lookup-only** — load it on demand
when the user names a technique from the arsenal showroom
(`automaitions-skill.vercel.app/motion-arsenal.html`). Do NOT read it on
every build; it's too long to justify the context cost when most builds
only use Tier 1-2 motion already covered in `animations.md`.

`references/motion-deep-dives/{sticky-pin-pattern,splittext-patterns,flip-patterns}.md`
also lookup-only — load when proposing or building one of those
specific patterns.

**Why unconditional:** Skipping files is how animation bugs get missed,
how wrong colours get applied, how logos get missed, how checklist items
get forgotten. The cost of reading an unnecessary file is 30 seconds.
The cost of skipping a necessary one is a broken delivery.

---

## Claude Code build workflow (primary path)

When building via Claude Code with this skill installed:

```
1. Read CLAUDE.md at repo root — repo orientation
2. Read all 13 mandatory skill reference files (above)
3. **CHECK brand/brand-config.json — if `"name"` is still `"Your Brand"`,
   STOP and prompt the user to configure brand/ before proceeding.**
   Shipping a brief with placeholder branding is a hard fail.
4. Read brand/colours.txt for the team-facing palette reference
5. Research target audience if specified in brief
6. PROPOSE colour direction with reasoning — await confirmation
7. RUN designers-eye.md content scan:
   - Auto-apply Tier 1-2 motions (no proposal needed)
   - Propose Tier 3 candidate(s) — max one per page — with reasoning
   - Defer Tier 4-5 unless user asks for a named technique
8. Build full HTML on confirmation
9. Run audit.py against the file
10. Report the file path + audit summary
11. **If you debugged a new bug along the way (not catalogued in `lessons.md`), ADD AN ENTRY before committing.** This is non-negotiable — the skill only compounds if every fix is recorded.
```

---

## Continuously learning — `lessons.md` update rule

The skill gets better with every build IF every previously-unseen bug
gets a `lessons.md` entry. This is the compounding mechanism.

**Add an entry if:**
- You spent more than 10 minutes debugging something whose root cause
  wasn't obvious from the existing references.
- You found a CSS specificity / cascade / browser-rendering quirk.
- A documented pattern produced unexpected behaviour.
- You discovered a previous fix doesn't fully resolve a problem
  (regression / partial fix).
- You hit a platform / device / browser quirk (iOS Safari especially).

**Don't add an entry for:** "I forgot the rule from ZERA / tokens /
components." That's a skim-the-references failure, not a discovery.

**Entry template + full protocol live at the top of `lessons.md`.**

### Announce-and-calibrate protocol — MANDATORY

You do NOT silently add entries. Every learning is announced in your
reply BEFORE you write it, so the user can correct / expand / veto in
real time. The protocol calibrates with them, not for them.

**Format — include this line in the same reply as the fix:**

```
📒 Logging this in lessons.md §<N> — <one-line summary of bug + fix>.
   So it doesn't recur on future builds.
```

Then write the entry, then continue with whatever the user asked.

**The user can respond:**
- *"Actually call that '...' instead"* → rename / rewrite the entry.
- *"Also note ..."* → append to the entry.
- *"Don't bother, one-off"* → remove the entry.
- *No response* → entry stays as written.

**See `lessons.md` for the worked example and the full when-to /
when-not-to criteria.**

The 30-second cost of writing an entry — multiplied across every
install of the skill — saves the next build a 30-minute debug.

Never build without confirming colour and motion plan first. The motion
plan presented at step 7 is a 3-line summary (baseline + Tier 3
candidate + reasoning), not an open-ended design discussion.

---

## Template shapes — pick the right starting point

The skill ships **two output shapes**. Pick by what the deliverable
needs to be, not by industry or content.

### Shape 1: Single-document HTML brief

Use one of these when the deliverable is a single long-scroll document
at one URL:

- `templates/partner-brief-template.html` — partnership pitches,
  member playbooks, retailer guides, education docs. Copy-heavy with
  stat cards, timelines, profiles, comparison tables.
- `templates/visual-explainer-template.html` — concept explainers
  with diagram archetypes. 8 SVG diagram patterns with auto-detected
  entrance animations. Use for investor explainers, technical
  walkthroughs, market analyses.

### Shape 2: Multi-page marketing site

Use `templates/marketing-site-template/` when the deliverable is a
real connected website — shared nav, modal CTAs, cross-page linking,
forms. Marketing sites, productised consultancy launches, founder
brand sites, client microsites.

The template ships as a directory with 4 pages (`index.html`,
`services.html`, `company.html`, `contact.html`), shared assets
(styles.css, scripts.js, ornament + blob SVGs, animated showreel),
and its own README + cheat-sheet mirror. Pattern library copies
Vertus.ai's structural beats — see the README inside the template
directory for the full list.

### Choosing between them

```
Does the deliverable live at one URL?
  → Shape 1 (single brief). Pick partner-brief or visual-explainer
    by content density.

Does the deliverable have 3+ pages with shared navigation?
  → Shape 2 (marketing site). Always use this for multi-page outputs
    instead of stitching together multiple briefs.

Borderline (2-page deliverable)?
  → Usually shape 1 with anchored sections instead of separate pages —
    one long-scroll feels more polished than two siblings.
```

---

## Decision tree — what to build

### 1. Colour and surface

```
Brand configured in brand/brand-config.json?
  → Use the configured palette
  → Derive accent ramp via colour-psychology.md OKLCH engine if only primary given

Brand still on placeholder defaults (`"name": "Your Brand"`)?
  → STOP. Refuse to build. Prompt the user to:
    1. Replace brand/*.svg with their own logos (keep filenames)
    2. Edit brand/brand-config.json with real values
    3. See examples/automaitions-brand-assets/ for a worked example
  → Resume only once brand-config.json `"name"` is no longer "Your Brand"

User requests a specific intent ("pink", "warm", "for women")?
  → Read colour-psychology.md intent engine
  → Derive full OKLCH palette from intent
  → Present 2-3 options with reasoning
  → Await confirmation before building

Surface type:
  → Any background is valid — dark, light, pastel, rich, warm, cool
  → Surface choice drives everything else: typography, borders, nav, scroll indicator
  → All token derivation happens in colour-psychology.md
```

### 2. Logo selection

```
Document surface is dark (bg lightness < 50%)?
  → Use brand/{name}-white.svg or brand/mono-light.svg

Document surface is light (bg lightness ≥ 50%)?
  → Use brand/{name}-black.svg or brand/mono-dark.svg

Mark needed as design element (not full wordmark)?
  → brand/glyph-only-white.svg (dark surfaces)
  → brand/glyph-only-ink.svg (light surfaces)
  → brand/glyph-only-indigo.svg (when accent treatment desired)

Favicon:
  → Use SVG favicon <link rel="icon" type="image/svg+xml">
  → Inline as base64 if file <2KB (recommended for any small brand mark)
  → Otherwise reference brand/favicon.svg
```

### 3. Diagram type

```
Photographic / lifestyle / product visual?
  → REQUEST external image generation (Midjourney, DALL-E, etc.)
  → Skill does NOT include image generation

Process / timeline / sequence?
  → HTML timeline rows (.tl-row pattern)

Two things compared side by side?
  → HTML two-column sys-grid with connector

Numbers / metrics / stats?
  → HTML stat grid (.sg / .sg3)
  → Tag each cell: data-target, data-prefix, data-suffix

Score / rating (X out of Y)?
  → HTML score cards (.score-card pattern)

Priority items / audit findings?
  → Table with .badge-critical / .badge-high / .badge-medium

Percentage / fill bars?
  → HTML progress bars (.pct-bar pattern)

Member profiles / personas?
  → HTML card grid (.member-grid)

Four filters / checklist cards?
  → HTML filter cards (.filter-grid)

Market quadrant / axis?
  → SVG — see diagrams.md

Simple flow with arrows (≤8 nodes)?
  → SVG with DrawSVG animation

Complex flow (>8 nodes)?
  → HTML grid with connectors
```

**Default: HTML/CSS over SVG.** HTML diagrams reflow on mobile.

### 4. File write method

```
Any file with logos embedded?  → Python open().write() — always
Estimated < 50KB with no logos? → Direct Write tool acceptable
> 300KB?                        → Split into template + asset injection
```

SVG logos are small (10-30KB) but Python is still safer and avoids truncation.

### 5. Navigation pattern

```
All documents get BOTH:
  → Mobile hamburger: hidden overlay drawer, slides in from left
  → Desktop sidebar: visible by default, collapsible via ← toggle button

This is MANDATORY on every document. Not optional.
See responsive.md for full hamburger + sidebar pattern.
```

### 6. Deployment context

```
Hosted (Vercel, Netlify, Cloudflare Pages)?
  → Full GSAP 3.15.0 animation stack
  → Lenis smooth scroll
  → ScrollTrigger class-toggle reveals (NOT gsap.from — see animations.md)
  → SplitText hero reveals
  → Propose additional plugins based on content type per designers-eye.md

Local file (iOS Files app, file://)?
  → JavaScript blocked in iOS Quick Look
  → CSS @keyframes load-time animations only
  → Recommend hosting instead
```

---

## Build sequence — follow this order every time

1. **Read all 13 reference files** — no exceptions, in order listed above
2. **Brand config check** — read `brand/brand-config.json`. If `"name"` is still `"Your Brand"`, REFUSE to build and prompt the user to configure brand/ first.
3. **Colour derivation** — from brand config or intent, define full `:root` token block
4. **Logo selection** — surface-aware, SVG embedded inline or as base64
5. **Base CSS** — reset, body, page wrapper, spacing tokens
6. **Component CSS** — copied from components.md (never rewritten from memory)
   Order: progress-bar → topbar → hamburger nav → hero → sections → components → diagrams → close → footer
7. **Animation CSS** — `.js .reveal`, `.js .stagger` progressive enhancement classes
8. **Responsive CSS** — all `@media` queries ascending (480 → 540 → 640 → 1100)
9. **HTML structure** — topbar → hamburger → hero → sections → close → footer
   Apply `.reveal` and `.stagger` classes
   Tag stat cells: `data-target`, `data-prefix`, `data-suffix`
   Mark balance headings: `data-no-split`
10. **Logo injection** — embed SVG inline in topbar and footer
11. **GSAP JS block** — full stack with classList toggle pattern + designers-eye selected motions
12. **Hamburger JS** — overlay nav open/close, desktop sidebar collapse
13. **Audit** — run `python3 audit.py <filename>` before presenting

---

## Non-negotiables — never skip

| Rule | Why |
|---|---|
| Read ALL 13 reference files | Skipping causes broken builds |
| classList toggle for reveals, NOT gsap.from() | gsap.from() conflicts with CSS opacity:0 — elements stay invisible |
| SplitText descender fix on hero-title | g, y, p, j, q clip without it |
| Hamburger nav on EVERY document | Mobile and desktop — mandatory |
| Surface is a design choice — not always dark | Any background is valid |
| SVG logos — inline or base64 | Infinitely sharp, no resolution concerns |
| `text-wrap: balance` on headings NOT SplitText'd | Eliminates widow words |
| Strip `text-wrap: balance` from SplitText headings | They conflict — masks misalign |
| `clamp()` on ALL font sizes | No fixed px on headings |
| `clamp()` on ALL significant padding/gap | Fluid spacing |
| Python for ALL files with logos | Shell heredoc silently truncates |
| `data-target`/`data-prefix`/`data-suffix` on stat cells | Counter animation needs these |
| `data-no-split` on balance headings | SplitText skips correctly |
| OG meta tags on all documents | Rich preview cards when shared |
| Position:sticky for pin sections, NEVER pin:true | Fights Lenis on Chrome |
| NO scroll-behavior:smooth in CSS | Conflicts with Lenis |
| Run designers-eye.md scan before building | Default output should already be designed, not assembled |
| Propose Tier 3+ animations, auto-apply Tier 1-2 | Don't burn user time on baseline decisions |
| Max ONE Tier 3 motion per page | Two compound — feels like a tech demo |
| Audit script before delivery | Catches 80% of regressions automatically |

---

## Reference index

| File | Use it when... |
|---|---|
| `references/ZERA-RULEBOOK-motion-and-hierarchy.md` | Source of truth — locked timings, type, tiering |
| `references/colour-psychology.md` | Deriving any palette — read FIRST |
| `references/tokens.md` | Setting up CSS token block |
| `references/typography.md` | Font sizes, weights, spacing |
| `references/responsive.md` | Breakpoints, hamburger nav, desktop layout |
| `references/components.md` | Building any UI pattern — copy-paste |
| `references/diagrams.md` | Any visual/comparison/flow |
| `references/logos.md` | Any logo handling — SVG first |
| `references/animations.md` | Full GSAP arsenal, motion tiering |
| `references/designers-eye.md` | **Content → motion auto-selection protocol.** Run before every build. |
| `references/accessibility.md` | A11y audit — keyboard, screen reader, focus, contrast |
| `references/performance.md` | Plugin loadout budgets, file size discipline |
| `references/motion-arsenal.md` | **Lookup-only.** Load when user names a technique (e.g. "give me a scrubbed text karaoke") |
| `references/motion-deep-dives/sticky-pin-pattern.md` | Deep-dive on sticky pin variants — load when building one |
| `references/motion-deep-dives/splittext-patterns.md` | Deep-dive on 6 hero text patterns — load when building hero text |
| `references/motion-deep-dives/flip-patterns.md` | Deep-dive on Flip patterns — load when building one |
| `references/checklist.md` | Before every delivery |
| `references/lessons.md` | Platform gotchas, hard-won knowledge |
| `references/claude-code-handoff.md` | Claude Code workflow reference |
