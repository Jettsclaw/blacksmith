---
name: creator-army-x-automaitions
description: "The strategic decision brain for the AI Ad Lab portfolio — Creator Army × Automaitions edition. Use this skill BEFORE invoking any production skill (/voc, /brand-dna, /spy, /create-static-ads, /multiplier, /rebuild, /copy, /ugc, /ugc-video, /seedance-*, /bulk-import, automaitions-html-builder) when the user mentions a brand, product, campaign, ad, landing page, video, headline, offer, mechanism, funnel, conversion, or any creative strategy question. Synthesises Simon Beard's Creator Army (Culture Kings — $600M exit, $100M+ Meta spend, short-form video bible), Sabri Suby's Sell Like Crazy (Dream Buyer, Godfather Offer, Magic Lantern, 17-Step Selling System, HVCO), Grant Cardone's value-ladder ascension architecture, Eugene Schwartz's 5 Awareness Levels and Unique Mechanism, and the classic direct-response canon (Caples, Halbert, Collier, Ogilvy, Hopkins). Includes native integration with the sibling automaitions-html-builder skill for animated landing pages + Attention AI QA gating. Output is a strategic brief that routes work to the right production skill in the suite with the right inputs, instead of letting production skills produce templates with no strategic context. Works for any DTC, ecommerce, service, SaaS, info-product, coaching, or B2B business. Core belief: creative IS the targeting. Best ads don't look like ads. Strategy compounds — every brief gets smarter from the last one's performance data."
version: 2.3
---

# Creator Army × Automaitions

> *Previously: creator-army-demand-engine. Renamed to reflect native integration with the sibling automaitions HTML-builder skill (animated landing pages) + the Attention AI QA layer.*

The strategic decision layer that sits between research and production in the AI Ad Lab portfolio. Without this skill, the 24 production skills produce templates; with it, they produce strategic creative that converts.

**The core belief:** You don't create demand through targeting settings. You create demand through content that makes people feel, think, and act. Creative IS the targeting. The best ads don't look like ads.

**The compounding advantage:** This skill gets smarter every time you use it. It scans past work, learns from what Meta chose to spend on, and generates each new batch informed by real performance data.

---

## Where this skill sits

```
RESEARCH                STRATEGY (this skill)              PRODUCTION                    DISTRIBUTION
────────────────        ────────────────────────           ──────────────────────────    ────────────────
/brand-dna ─────┐                                          ┌─ /create-static-ads ─┐
                ├──→  CREATOR ARMY  ─→  strategic brief ─→ │                       ├─→  /bulk-import
/voc ───────────┤     (decisions)                          ├─ /multiplier ────────┤
                │                                          │                       │
/spy ───────────┘                                          ├─ /rebuild ───────────┤
                                                           ├─ /copy ──────────────┤
                                                           ├─ /ugc ─→ /ugc-video ─┤
                                                           ├─ /seedance-* (×15) ──┤
                                                           └─ automaitions ───────┘
                                                              (landing pages)
```

Full chain documentation, decision trees, and per-skill handoff rules: `references/16-skill-orchestration.md`.

---

## When to invoke this skill

ALWAYS invoke when the user:
- Mentions a brand, product, campaign, ad, landing page, video, headline, offer, mechanism, or funnel
- Is about to run any production skill in the AI Ad Lab suite
- Asks "what should I do for [brand]?" / "how do I scale this?" / "what's wrong with my creative?"
- Reviews past performance data and is planning the next batch
- Writes ad scripts, creative briefs, landing page copy, email sequences, offers, or VSLs

DO NOT invoke when:
- The user is doing pure mechanical execution (e.g. "run `/bulk-import` with these files")
- The user explicitly says "skip the strategy, just produce X" — they've done the strategy elsewhere

---

## How this skill works

The flow is **research → strategy → production → distribution → learning**. Strategy is this skill. Without it, production runs blind.

### Step 0 — Context Scan + Skill Inventory (ALWAYS first)
Before asking a single question, check what already exists for this brand.

Read `references/01-context-scan.md` for the full protocol.

**Quick version:** search memory, conversation history, workspace files, and the repo for existing `/voc`, `/brand-dna`, `/spy` outputs for this brand. If they exist, READ them rather than starting from scratch. If they don't exist, propose running them before any production work.

### Step 1 — Customer Excavation (via `/voc` if not done)
The full strategic understanding of the customer.

If the brand has a recent `/voc` HTML doc, use it. Read it strategically per `references/16-skill-orchestration.md` (VOC/DNA Reading Appendix). For interpretation gaps, fill from `references/02-customer-excavation.md`.

If no `/voc` doc exists, propose running it before going further: *"I need to run `/voc` first to ground this in real customer language. Want me to brief that, or do you have existing customer research?"*

### Step 2 — Brand Constraints (via `/brand-dna` if not done)
The visual and verbal identity guardrails the creative must respect.

If the brand has a `/brand-dna` HTML doc, use it. Read it strategically per `references/16-skill-orchestration.md`.

If no doc exists, propose running `/brand-dna` first.

### Step 3 — Competitor Intelligence (via `/spy` if useful)
Run `/spy` whenever you want to model what's already converting in the niche before constructing new creative. Optional but high-leverage at the start of any batch.

### Step 4 — Apply the Selling Sequence
The strategic heart of CA. Every piece of content — static, video, landing page, email — follows this sequence (face-to-face selling mapped to digital). Full sequence below; deep guide in `references/03-selling-sequence.md`.

### Step 5 — Pick the Strategic Levers
Once you understand the customer and the brand, decide:
- **Hook + body structure** — pull from `references/04-hook-science.md` (and cross-reference `/ugc`'s 155-pattern hook library for tactical patterns)
- **Building blocks to stack** — `references/05-building-blocks.md` (and `13-hero-mechanism` lives inside `14-offer-architecture.md` now)
- **Creative format** — `references/06-creative-types.md` (maps each format to the appropriate production skill)
- **Offer architecture** — `references/14-offer-architecture.md` (Godfather Offer + Value Ladder + Cardone tactical patterns)
- **Landing page structure** — `references/15-landing-page-copy.md` (Magic Lantern + 17-Step Selling System)

### Step 6 — Route to Production
Now hand the strategic brief to the right production skill in the suite.

| If the deliverable is... | Route to... | Brief includes... |
|---|---|---|
| 40 static ad concepts (NB2) | `/create-static-ads` | Brand DNA + VOC + product + offer + hero mechanism + customer types |
| Variations of one winning static | `/multiplier` | The winning prompt + Brand DNA + VOC + diversity dimensions to vary |
| Static rebuild of a `/spy` winner | `/rebuild` | Competitor ad + Brand DNA + VOC + (optional offer + persona variations) |
| Meta headlines/descriptions/primary text | `/copy` | Brand DNA + VOC + ad creative description + offer |
| UGC talking-head scripts | `/ugc` | Brand DNA + VOC + product image + selling sequence beats |
| Cinematic / B-roll / format video | `/seedance-{format}` | Selling sequence + hook + visual brief (see `06-creative-types.md` for format→skill mapping) |
| UGC script → actual video | `/ugc-video` | The finished script + character image + voice sample |
| Animated landing page (HTML) | `automaitions-html-builder` | See `references/17-automaitions-handoff.md` for full briefing template |
| Spreadsheet for Meta upload | `/bulk-import` | Images and/or videos + ad copy from `/copy` |

Full per-skill handoff rules and failure modes: `references/16-skill-orchestration.md`.

### Step 7 — Production Guidance (if filming live, not AI)
For non-AI shoots (phone-first, on-location), see `references/07-lo-fi-production.md`. Core rule unchanged: best ads don't look like ads. Shoot on phone. Natural light. No studio.

### Step 7.5 — MANDATORY: Attention AI QA on landing pages

Before shipping any landing page to live traffic, run it through Attention AI (`19-attention-ai.md`) for visual attention validation. This is a non-negotiable QA gate for landing pages specifically.

**Current mandate (intentionally narrow while operator learns the tool):**

| Output from... | Run through Attention AI? |
|---|---|
| `automaitions` (landing pages) | **MANDATORY** — Workflow A at all 4 viewport modes |
| `/create-static-ads` / `/multiplier` / `/rebuild` (NB2 statics) | OPTIONAL — playbook in `19-attention-ai.md` Workflow C + D when ready to expand |
| `/ugc-video` / `/seedance-*` (videos) | OPTIONAL — playbook for video first-frame validation in `19-attention-ai.md` |
| Magic Lantern email HTML (rendered) | OPTIONAL |
| Text-only outputs / spreadsheets / audio / long-form videos | NOT APPLICABLE |

**The rule (current phase):** every landing page goes through Attention AI before going live. Other production outputs can be validated when the operator is ready to expand the workflow — the full playbook is documented in `19-attention-ai.md` and ready to switch on per asset type without further skill changes.

**When to expand the mandate:** when the operator has run Attention AI on 5+ landing pages and is comfortable interpreting the heatmaps, switch static ads from OPTIONAL to MANDATORY. Then add video first-frames. Quota management becomes important — running it on every NB2 batch (40+ images) will burn through the 100/month free quota; request a quota increase from Jay or move to Path C (native API integration) before expanding.

### Step 8 — Campaign Architecture
Once creative ships, structure the Meta campaign correctly. `references/08-campaign-architecture.md` — one campaign, broad targeting, 8-20 creatives.

### Step 9 — Learning Loop
After 7-14 days of spend data, run the LOAD → LISTEN → LEARN → CREATE → LOAD cycle in `references/09-learning-loop.md`. Combine with `/multiplier` to scale winners with Andromeda-compliant variation.

---

## The Selling Sequence (Core Framework)

Every piece of content — short-form video, static image, landing page section, email, sales call opening — follows this sequence. It's face-to-face selling instincts mapped to digital media.

### 1. RAPPORT (First 1-3 seconds)

Make them feel SEEN. Not sold to. Seen.

The viewer must think: "this is for me" or "I relate to this" within 3 seconds. If they don't, they scroll. There is no second chance.

**Three ways to build instant rapport:**

**Make them FEEL:** Fear, FOMO, humor, sadness, anger, nostalgia, shock. Pick one emotion and hit it in the first frame.

**Make them LOOK:** Movement, visuals, music, ASMR, colour, pattern interrupts. Something visually unexpected that stops the thumb.

**Make them THINK:** Bold claim, social proof, curiosity gap, relatable question. "Does your boyfriend always steal your skincare?"

**The test:** If you removed the first 3 seconds, would the viewer still stop? If yes, your rapport hook isn't strong enough.

### 2. OPEN LOOP (Seconds 3-10)

Create a question in the viewer's mind that they CANNOT close without watching.

"I took mushrooms for 30 days and here's what happened."
"I finally bought one of those and here's my review."
"Skincare is like painting a dead leaf green. Let me explain."

**The open loop is NOT the product pitch.** It's the curiosity gap between "I'm interested" and "I need to know." The viewer watches the rest of the content to CLOSE the loop. If you close it too early, they leave.

### 3. STACK VALUE + OVERCOME OBJECTIONS (Seconds 10-40)

This is the body. Stack 3-5 persuasion building blocks without repeating yourself or losing pace. Cut anything that drags.

The building blocks:
1. **Problem** — make them feel it emotionally
2. **Failed Solution** — what they tried that didn't work
3. **Desired Results** — paint the picture of the outcome
4. **Solution** — your product/category, why it's different
5. **Social Proof** — reviews, testimonials, numbers
6. **Demo/Visual Proof** — show don't tell
7. **Unique Mechanism** — why THIS works when others didn't *(deep methodology in `14-offer-architecture.md` → Hero Mechanism section)*
8. **Risk Reversal** — guarantee, free trial, money back
9. **Scarcity** — limited stock, limited time, limited offer
10. **Authority** — expert endorsement, awards, press

**Order matters.** Lead with the building blocks that match the viewer's awareness level (Schwartz 5: Unaware → Problem-Aware → Solution-Aware → Product-Aware → Most-Aware). If they don't know they have a problem, start with Problem. If they tried other solutions, start with Failed Solution + Unique Mechanism.

### 4. WOW / AHA MOMENT (Seconds 30-45)

The moment where the viewer's belief shifts. They go from "maybe" to "oh."

This is where metaphors, demonstrations, and unexpected proof live.

**The best wow moments are SHOWN, not told.** A before/after. A live demo. A side-by-side comparison. A customer's genuine reaction.

### 5. CLEAR NEXT STEP (Final 3-5 seconds)

Don't overthink the CTA. Make it obvious and low friction.

- Community framing ("we heard you, here's a special bundle")
- Simple direct action ("link in bio", "tap the link", "comment DEAL")
- Soft entry ("check out the blog", "take the quiz")

**If your hook and body did their job, the CTA is just permission to act.**

---

## The Three Variables

Performance comes from three interlocking variables. Most people only work on one.

```
     CREATIVE ←→ OFFER ←→ BUDGET
```

- **Creative** = the ad AND the landing page (both are creative)
- **Offer** = price, bundle, guarantee, subscription, urgency structure → deep guide in `14-offer-architecture.md`
- **Budget** = how much you spend and how you scale it

When performance drops, work in this order:
1. Creative (90% of the time it's this)
2. Offer (the most underrated lever — changing AOV changes everything)
3. Budget (scaling without creative fuel = wasted spend)

---

## The Persuasion Checklist

Before shipping any ad, cross-reference against these five pillars (Aristotle + Nick Mowbray + Creator Army):

- [ ] **Ethos / Credibility** — Is there a trust signal?
- [ ] **Logos / Proof** — Is there data or demonstration?
- [ ] **Pathos / Emotion** — Does it make you FEEL something?
- [ ] **Metaphor / Clarity** — Is the concept tangible?
- [ ] **Brevity** — Can you cut 30% and lose nothing?

---

## Creative = Targeting

You do NOT target audiences through platform settings. You target audiences through CONTENT. Each piece of content finds its own audience via Meta's AI.

**What this means operationally:**
- Run ONE campaign, ONE ad set, BROAD targeting
- Load 12+ diverse creatives into that ad set
- Each creative speaks to a DIFFERENT customer type or pain point
- Meta's AI matches each creative to the right viewer
- The creative that gets spend = Meta found an audience for it
- The creative that gets no spend = Meta said no. Leave it. It costs nothing.

**What this means for creative production:**
- You need VOLUME (not 3 ads — 20+) — generated efficiently via `/create-static-ads` + `/multiplier` + `/ugc` + `/seedance-*`
- You need genuine DIVERSITY (Andromeda groups similar creatives) — `/multiplier`'s variation engine handles this systematically
- Each ad must differ on 3+ of 5 diversity dimensions
- The barriers/motivators from `/voc` IS your creative brief

---

## Reference Files

### Strategic frameworks (read these first when planning)
- `references/16-skill-orchestration.md` — **the chain map**. Full workflows, all 25 skills indexed, handoff rules, decision trees. Plus VOC/Brand DNA reading appendix.
- `references/03-selling-sequence.md` — face-to-face selling mapped to digital. Heart of the system.
- `references/14-offer-architecture.md` — Godfather Offer (Sabri Suby) + Value Ladder (Cardone) + Hero Mechanism (Schwartz/Sabri) + 5 battle-tested offer angles + ethical guardrails.
- `references/15-landing-page-copy.md` — 17-Step Secret Selling System + Magic Lantern Technique + opt-in vs sales page + fascination bullet formulas.

### Operational workflow
- `references/01-context-scan.md` — never start cold. Scan memory + repo + connected tools first.
- `references/02-customer-excavation.md` — customer research methodology (use when `/voc` isn't viable or for gap-filling).
- `references/09-learning-loop.md` — LOAD/LISTEN/LEARN/CREATE/LOAD. Replaces kill/scale testing.

### Tactical references (load on demand)
- `references/04-hook-science.md` — Feel/Look/Think framework + hook formulas. Strategic layer above `/ugc`'s 155-pattern library.
- `references/05-building-blocks.md` — 10 persuasion blocks. Block #7 (Unique Mechanism) expanded in `14`.
- `references/06-creative-types.md` — 12 ad formats + production-skill mapping table.
- `references/07-lo-fi-production.md` — phone-first live production (for non-AI shoots).
- `references/08-campaign-architecture.md` — one campaign, broad targeting, 8-20 creatives.

### Cross-skill integration
- `references/17-automaitions-handoff.md` — how to brief the sibling `automaitions-html-builder` skill for animated landing pages. Self-contained briefing template + motion-arsenal awareness.

### Load on demand (only when relevant)
- `references/18-high-ticket-sales.md` — Cardone boiler-room call structure + 8 objection-handling rebuttals + 5 closing techniques + application to selling agency/coaching/consulting (incl. selling automaitions services to other DTC brands). **Load only when the deliverable involves human-closed selling on a phone/video call.** Skip for DTC ad batches and self-serve funnels under $1K.

### Cross-cutting QA layer
- `references/19-attention-ai.md` — Jay Stockwell's Attention AI tool (`attention-ai.jay.com.au` + referral code `onelifeclub`). Predicts where humans will look on any UI / ad / landing page with ~96% accuracy vs. eye-tracking. **Visual salience framework + 5 audit workflows** (own page audit, competitor audit, single creative audit, multi-ad comparison for pre-flight winner selection, hero composition audit). Run every production skill's output through this gate BEFORE spending. Future native API integration documented for when we're ready.

### Quality + craft (compounding layer)

These four files are the difference between a skill that ships templates and a skill that ships polished, brand-honest, mobile-readable, learning-from-itself work. Read them BEFORE any production run. The lessons doc gets a new entry every time you debug a previously-uncatalogued issue — that's how the skill compounds.

- `references/20-lessons.md` — **The compounding mechanism.** Running learning doc with the announce-and-calibrate protocol (📒 line in your reply BEFORE writing the entry). Every previously-unseen bug, edge case, or counter-intuitive insight gets a dated entry the same day it surfaces. Seeded with 5 entries covering mobile SVG readability, Brand DNA rule discoverability, Vercel main-branch deploy quirk, sticky CTA visibility logic, cross-skill rule context-dependency. After 50 brand-runs the skill IS the lessons doc — references become reference cards, this becomes the operating manual.
- `references/21-png-to-svg.md` — Methodology for converting rendered Nano Banana Pro statics into native animated SVGs for landing-page embed. Covers WHEN to convert (LP-HERO geometric concepts, mechanism diagrams, data viz) vs WHEN to keep raster (photographic, AI textures, Meta delivery), the 7-step conversion process, defs-block patterns, motion patterns (draw-in, scale-in, particle flow, breathing), and MANDATORY 375px mobile readability check.
- `references/22-polish-pass.md` — **9-audit pre-ship checklist.** Alignment → Motion sync → SVG audit → Brand adherence → Responsive → Accessibility → Copy → Form/interaction → Performance. First failure stops the ship. Specialised passes for landing pages, static ads, UGC scripts, bulk import spreadsheets. This is the gate between "I built it" and "it's ready to spend on."
- `references/23-brand-logo-usage.md` — The 12-slot logo system inherited from the automaitions sibling skill's `brand/` directory. **Surface-aware decision tree** (which variant goes where) + the counterintuitive naming gotcha (`mono-light.svg` = for LIGHT surfaces / dark ink fill, NOT a light-coloured logo). Four embed methods with inline SVG preferred. Hard constraints: never raster, never invent variants, never animate the logo, never strip aria-label.
- `references/24-particle-narrative-archetype.md` — **Tier 4 motion archetype** — the awwwards-tier scroll-pinned particle narrative in the textura.us / NEGENTROPY register. Self-contained synthesis (no downloads — patterns read + re-authored) across Codrops GPGPU/Interactive Particles/Dual-Wave tutorials, Three.js Journey morph patterns, Maxime Heckel data-texture morph, Suboor Khan 200K-particle BufferGeometry, brunoimbrizi/interactive-particles, tsparticles, three-nebula, DevDreaming Lenis+GSAP integration, Typewolf free condensed fonts. **Three implementation tiers** (canvas-2D / Three.js Points / GPGPU FBO) with full vertex+fragment morph shader code, seven canonical particle layouts (wispy/burst/constellation/galaxy/starfield/portal/grid), the Lenis+GSAP wiring recipe, scientific-notation typographic device, performance budgets per tier, reduced-motion fallback, hard rules. Read once, build any NEGENTROPY-tier site in a day. No paid templates, no licensed fonts, no CDN beyond Three.js.

### Case studies
- `references/10-case-studies.md` — Culture Kings, Comfrt, Strike Anywhere, Hudson, PureU. Real numbers, real frameworks in action.

---

## Heritage acknowledgements

This skill stands on the shoulders of:

- **Simon Beard** (Creator Army, Culture Kings) — short-form video bible, Meta-feed creative-is-targeting belief, selling sequence
- **Sabri Suby** (Sell Like Crazy, King Kong agency) — Dream Buyer, Halo Strategy, Godfather Offer (7 components), Magic Lantern Technique, HVCO, 17-Step Selling System
- **Grant Cardone** (Cardone Enterprises) — value-ladder ascension architecture, tactical patterns (Free Plus Shipping, SLO, Velvet Rope application funnels)
- **Eugene Schwartz** (*Breakthrough Advertising*, 1966) — 5 Awareness Levels (foundational across the entire suite), Unique Mechanism concept
- **John Caples** (*Tested Advertising Methods*) — 35 headline formulas (partially absorbed into `/ugc`'s 155-pattern library)
- **Gary Halbert / Bond Halbert** — fascination bullet writing, the email/letter masters
- **Robert Collier** (*The Robert Collier Letter Book*) — "enter the conversation already taking place in the customer's mind"
- **David Ogilvy** — long-copy direct response, brand persistence
- **Claude Hopkins** (*Scientific Advertising*) — "make your offer so great that only a lunatic would refuse"
- **Bob Moesta / Clay Christensen** — Jobs To Be Done + Forces of Progress (Push/Pull/Anxiety/Habit, used as `/voc` extraction tags)
- **Alex Hormozi** (*$100M Offers*) — Value Equation (Time Delay × Dream Outcome ÷ Perceived Likelihood × Effort, used in `/voc` Section 15)

### Production / craft mechanisms absorbed in v2.3

External patterns evaluated and absorbed (not installed as separate skills — extracted to the relevant references):

- **Textura Agency** — *Claude Code Website Pipeline.* Source of the strip-the-background reference extraction (`21-png-to-svg.md` § Reverse direction), the dual-reference attachment pattern (`17-automaitions-handoff.md`), and the numeric performance gates (`22-polish-pass.md` § Audit 9 — Lighthouse 90+, WebP via Squoosh, MP4+WebM <2MB, vercel.json caching rules).
- **Decision Maker skill** *(claude-brief.textura.agency)* — source of the 6-decision forcing function and 3-bucket reference library (`17-automaitions-handoff.md` § Pre-brief discipline), the pushback protocol (`15-landing-page-copy.md` § Pre-flight), and the banned-adjective list (`22-polish-pass.md` § Audit 7 Copy).
- **Notion guide** — *"Turn product photos into a scroll-based hero animation"* — source of the Tier 3 scroll-scrubbed video hero archetype (`17-automaitions-handoff.md` § Tier 3 archetype), the two-frame Kling/Seedance prompt template (`06-creative-types.md` § 13 + § Two-frame video), and the desktop/mobile parity gotcha (`20-lessons.md §7`).

The classical DR canon does the heavy lifting on strategy. The AI Ad Lab suite does the production at scale. CA is the bridge.
