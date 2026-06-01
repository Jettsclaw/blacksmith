# Designer's Eye — content → motion auto-selection protocol

How Claude decides which motion techniques a brief gets, **without
asking the user**. Read this before writing any HTML. The point: the
default output is already designed — the user shouldn't have to know
the difference between a stat counter and a scrubbed text reveal.

> **This file is unconditional.** It's how the skill makes design
> decisions when no specific direction is given.
>
> The decision logic comes from the **rule cards** at the top of each
> entry in `motion-arsenal.md` and the deep-dive files. This file is
> the protocol; the cards are the data.

---

## How rule cards work

Every named technique in `motion-arsenal.md` starts with:

```
**Tier:** 1-5
**Plugins:** [list]
**Triggers:** [content patterns that make this technique applicable]
**Pairs with:** [techniques that amplify or co-exist safely]
**Conflicts with:** [techniques that can't share the same page]
**Avoid when:** [conditions where this should be skipped]
**See also:** ZERA §X · LEARNINGS §Y · deep-dive file
```

The protocol below reads these cards. New techniques are picked up
automatically as long as they have complete cards.

---

## The protocol — run before every build

### Step 1 — Scan the brief for content patterns

Read the brief copy. For each technique's `Triggers` line, check
whether the brief contains the described pattern. Build a candidate set.

The patterns to look for fall into a small handful of types:

- **Structural:** `<h1>`, hero block, 3+ sections, stat cells with
  `data-target`, 3-card row of features, FAQ-style content,
  reorderable grid, multi-step sequence, SVG flowchart, image reveal,
  logo strip, single thesis line, category-defining claim,
  presentation deck content.
- **Tonal:** professional vs. consumer, tech voice vs. lifestyle,
  conservative vs. expressive.
- **Audience:** mobile-primary vs. desktop-primary.
- **Length:** <3 sections, long-form, single-section.

Use detection heuristics (last section of this file) for patterns
that aren't obvious from a quick scan.

### Step 2 — Filter candidates by tier

| Tier | Treatment |
|---|---|
| 0 (foundational, e.g. easing) | Always — embedded in every animation choice |
| 1 (auto baseline) | Auto-apply, no proposal |
| 2 (selective auto) | Auto-apply if `Triggers` match, no proposal |
| 3 (one per page) | Propose to user with reasoning, await confirmation |
| 4 (interactive) | Skip unless user asks by name OR brief explicitly says "showcase / portfolio piece" |
| 5 (playful) | Skip unless user explicitly asks |

### Step 3 — Filter by `Conflicts with`

For each candidate technique, check its `Conflicts with` list against
the already-selected set. If a conflict exists, the lower-tier candidate
wins (Tier 3 conflicts almost always drop the other Tier 3).

For Tier 3 specifically: **max ONE per page.** If multiple Tier 3
candidates pass the trigger filter, pick the one that best matches the
brief's single biggest claim. Drop the rest to plain reveals.

### Step 4 — Filter by `Avoid when`

For each surviving candidate, check its `Avoid when` clauses against
the brief context. Common avoid clauses:

- "mobile-primary audience" → drop hover-dependent techniques
- "professional/conservative context" → drop Tier 5 + ScrambleText
- "brief is <3 sections" → drop sticky pin variants, drop progress bar
- "another Tier 3 already selected" → drop new Tier 3 candidates

### Step 5 — Apply restraint guardrails

After filtering, apply the global caps:

| Cap | Why |
|---|---|
| Max ONE Tier 3 per page | Two compound — feels like a tech demo |
| Max TWO Tier 4 interactions per page | Restless beyond that |
| Tier 5 forbidden in professional briefs | Reads as unserious |
| Stat counters max 3 per page | Diminishing returns |
| Sticky pin + horizontal scroll never co-exist | Two heavy mechanics on one page = whiplash |
| Karaoke + sticky pin never share the hero | One brand moment, not two — use Combined sticky+scrub if you want both effects |
| 3D tilt + cursor follow + magnetic — pick ONE | Three on one page = chaos |
| No motion on Tier 5 surfaces (compliance copy, T&Cs) | Wrong context |

### Step 6 — Output the motion plan

Present a 3-line summary to the user:

> *"Motion plan for this brief:*
> *— Tier 1-2 baseline: [auto-applied techniques in plain English]*
> *— Tier 3 candidate: [name] on the '[content X]' moment — [one-sentence reasoning]*
> *— Tier 4-5: none / [whatever user requested]"*

Short, structured, defensible. User confirms or redirects in one
reply. No back-and-forth design discussion required.

---

## Default loadout — every brief gets these unconditionally

Apply automatically, never proposed:

| Motion | Why |
|---|---|
| **Lenis smooth scroll** | Single biggest perceived-quality lift |
| **Smart sticky topbar** (hide on scroll-down, reveal on scroll-up) | Reclaims viewport without losing nav |
| **Hamburger nav** (mobile drawer + desktop sidebar) | Mandatory per CLAUDE.md |
| **Reveal on enter** (ScrollTrigger.batch on `.reveal`) | The workhorse — every section |
| **Stagger children** (ScrollTrigger.batch on `.stagger > *`) | Lists, card rows, stat grids |
| **Hero cascade reveal** (SplitText lines on `.hero-title`) | One per page on the h1 |
| **Page progress bar** | Any brief with >3 sections |
| **Hover micro-interactions** (desktop pointer only) | Cards, links, buttons |
| **Reduced-motion fallback** | All motion collapses to instant under `prefers-reduced-motion` |

Don't propose any of these — they're baseline. The base JS block in
`animations.md` already wires them up.

---

## Detection heuristics — patterns that aren't obvious

Rule cards say things like *"category-defining claim"* or *"layered
visual depth"* — these aren't always obvious from a content scan. Use
these tells:

### "Category-defining claim" tells
- Reads like a thesis statement, not a feature
- Often italicised or set apart visually
- Sentence has the structure "X isn't Y, it's Z"
- The brief comes back to this claim in multiple sections
- The user introduced the brief saying "this is our positioning"

### "Layered visual depth" tells (parallax candidate)
- Hero contains a background image AND foreground text
- Hero has 2+ illustration layers (silhouettes, gradients, particles)
- The brief specifies "depth" or "atmospheric" as a feel word
- Hero copy uses metaphors like "below the surface", "underneath"

### "Visual depth" anti-tells (DON'T apply parallax)
- Card grids · stat panels · text-only sections
- Single flat illustration
- Any section with `display: grid` as the primary layout

### "Movement through a system" tells (MotionPath candidate)
- Diagram has arrows
- Brief explains a process or pathway
- Words "flow", "travels", "moves through", "delivered via" near the diagram
- Diagram has source + destination labels

### "Tech voice / decode aesthetic" tells (ScrambleText candidate)
- Brief targets developers, security, healthcare-tech, AI
- Copy uses terminal-style language
- Visual identity already includes monospace
- The reveal word is a status (ACCESS GRANTED, VERIFIED, ANALYZED)

### "Deck-style content" tells (Snap to section candidate)
- Brief is structured as numbered sections meant to be read one-at-a-time
- Pitch decks, member onboardings, principles documents
- Each section has its own visual identity / colour treatment
- The brief was originally a slide deck before being requested as HTML

### "FAQ-style content" tells (Flip card expand candidate)
- Repeated Q&A structure
- "Click to expand" / "read more" affordances in the source brief
- Concertina pattern in the source design

### "Reorderable / filterable grid" tells (Flip card swap candidate)
- Brief explicitly says "filter by", "sort by"
- Tag-cloud or chip-based navigation
- Gallery with category buttons

---

## When the user IS specific — bypass this protocol

If the user prompts:

| Prompt | Action |
|---|---|
| *"Give me a [named technique]"* | Skip auto-scan, build it from `motion-arsenal.md` recipe |
| *"Animate the X section"* | Propose 2-3 candidates with reasoning, await pick |
| *"Keep it minimal"* | Drop to Tier 1 only |
| *"Make it punchy"* | Tier 1-2 + propose one Tier 3 candidate |
| *"Showcase / portfolio piece"* | Tier 1-3 + propose 1-2 Tier 4 interactions (still apply Tier 5 ban) |
| *"Have fun with this one"* | Open the Tier 5 gate (still propose individual choices) |

The protocol exists for the **silent default** — when the user just
says "build me a brief about X" and expects taste-level decisions to
be made for them.

---

## Integration with the build workflow

From `SKILL.md` step 7:

```
6. PROPOSE colour direction with reasoning — await confirmation
7. RUN designers-eye.md content scan:
   - Iterate rule cards in motion-arsenal.md (and deep-dive files)
   - Auto-apply Tier 1-2 (no proposal)
   - Propose Tier 3 candidate(s) — max one per page — with reasoning
   - Defer Tier 4-5 unless user asks for a named technique
8. Build full HTML on confirmation
```

The motion plan presented at step 7 is short, structured, and
defensible. Three lines, one user reply, done.

---

## Adding new techniques

When you build a new motion pattern that's not in the arsenal:

1. Add it to `motion-arsenal.md` with a complete rule card
2. Add a demo to `motion-arsenal.html`
3. If the rule set is rich (multiple variants, lots of gotchas, complex
   CSS+HTML+JS), promote it to a `motion-deep-dives/[name].md` file
   and link from the arsenal entry
4. Future builds will auto-pick it up via the protocol — no further work

**Rule cards must be complete.** Missing `Triggers` = technique never
gets auto-proposed. Missing `Conflicts with` = stacks with incompatible
techniques. Missing `Avoid when` = applies in wrong contexts. Treat
the card as a contract.

---

*Last updated: 2026-05-23* — refactored to consume rule cards instead
of carrying a central content-pattern table. The cards are now the
source of truth; this file is the protocol.
