# Skill Orchestration — The AI Ad Lab Chain

How to operate the full 25-skill portfolio as one coherent demand engine instead of
24 disconnected tools. Read this BEFORE picking which skill to run. Every other
reference file in this skill assumes you know which step of the chain you're on.

---

## The full chain

```
RESEARCH                  STRATEGY                  PRODUCTION                    DISTRIBUTION
────────────────          ────────────────          ──────────────────────────    ────────────────
/brand-dna ─────┐                                   ┌─ /create-static-ads ─┐
                ├─→  CREATOR ARMY  ─→  brief ─→     │                       ├─→  /bulk-import
/voc ───────────┤    (strategy                      ├─ /multiplier ────────┤
                │     brain)                        │                       │
/spy ───────────┘                                   ├─ /rebuild ───────────┤
                                                    │                       │
                                                    ├─ /copy ──────────────┤
                                                    │                       │
                                                    ├─ /ugc ─→ /ugc-video ─┤
                                                    │                       │
                                                    ├─ /seedance-* (×15) ──┤
                                                    │                       │
                                                    └─ automaitions ───────┘
                                                       (landing pages)
```

Three things to internalise:

1. **Research feeds strategy. Strategy feeds production. Production feeds distribution.** Skipping the strategy layer (jumping straight from `/voc` to `/create-static-ads`) is the #1 failure mode — production skills produce templates, not creative decisions. Strategy decides which template, which angle, which offer.

2. **Brand DNA + VOC are the only two reusable assets across the entire portfolio.** Every production skill consumes them. Keep them fresh — re-run `/voc` whenever performance shifts or new customer language appears.

3. **The selling sequence (CA §03) governs every production skill.** Whether `/create-static-ads` is filling template #7, `/ugc` is writing a 5-part DR script, or `/seedance-social-hook` is generating a 9-second Reel — every output should map to a Rapport→Open Loop→Stack Value→Wow→CTA structure.

---

## Common workflows — decision trees

### Workflow A: New brand, first batch from scratch

```
1. /brand-dna           → Brand DNA HTML doc (9 sections)
2. /voc                 → VOC research HTML doc (16 sections, 40+ quotes)
3. /spy                 → Swipe file: what's already working in the niche
4. CREATOR ARMY         → Read all three. Produce strategic brief:
                          - Customer types (from §02 + 11-voc-interpretation)
                          - Top 3 angles per type (from §05 building blocks)
                          - Hero mechanism (from 13-hero-mechanism)
                          - Godfather Offer (from 14-offer-architecture)
                          - Selling sequence per angle (from §03)
5. Production fork (pick by goal):
   Static:  /create-static-ads → /multiplier → /bulk-import
   Video:   /ugc → /ugc-video         (talking-head UGC)
            /seedance-{format}        (formats per CA §06)
   Landing: automaitions + 15-landing-page-copy (Magic Lantern)
6. Wait 7-14 days
7. CREATOR ARMY §09     → Learning loop. What did Meta spend on? Why?
8. Loop back to step 5 with insights informing the next batch
```

### Workflow B: Existing brand, new creative batch

```
1. CREATOR ARMY §01     → Context scan. What's already in memory / past briefs?
2. CREATOR ARMY §09     → Read last batch's performance data
3. Refresh /spy         → New winners in the niche since last batch
4. CREATOR ARMY         → New brief, building on proven patterns
5. Production:
   - /multiplier on the winning concept (5-8 Andromeda-diverse variations)
   - PLUS /create-static-ads with NEW angles informed by step 3 winners
6. /bulk-import → ship
```

### Workflow C: Modelling a specific competitor winner

```
1. /spy                 → Find the ad you want to model
2. /brand-dna + /voc    → If not already done for this brand
3. /rebuild             → Single rebuild + 5 persona variations
4. /multiplier          → Optional: 5-8 more variations of the rebuilt prompt
5. /bulk-import
```

### Workflow D: Static-only batch (no video, no landing page)

```
1. /brand-dna + /voc
2. CREATOR ARMY         → Brief
3. /create-static-ads   → 40 NB2 prompts
4. /multiplier on top 3-5 → 15-40 more variations
5. /copy                → Meta headlines + descriptions + primary text per ad
6. /bulk-import         → Spreadsheet + images.zip
```

### Workflow E: Video-only batch (UGC + AI video)

```
1. /brand-dna + /voc
2. CREATOR ARMY         → Brief (focus on hook + selling sequence beats)
3. Pick path by format:
   Talking-head UGC:    /ugc → /ugc-video
   Cinematic / B-roll:  /seedance-cinematic
   Product showcase:    /seedance-product-360 or /seedance-ecommerce-ad
   Social hook:         /seedance-social-hook
   Brand story:         /seedance-brand-story
   (See CA §06 for full format → seedance mapping)
4. /bulk-import (with videos.zip)
```

### Workflow F: Landing page + ads pair

```
1. /brand-dna + /voc
2. CREATOR ARMY + 15-landing-page-copy → Magic Lantern structure + sales letter copy
3. automaitions                        → HTML landing page production
4. Workflow A or D for the ads that drive to it
5. Make sure the ad's Wow moment and the landing page's hero promise match
```

### Workflow G: Test a new offer (offer is the unlock, not the creative)

```
1. CREATOR ARMY + 14-offer-architecture → Construct Godfather Offer (7 components)
2. Apply the offer across:
   - /create-static-ads (templates #2 Offer/Promotion, #6 Social Proof, #9)
   - /ugc Format 1 (DR — CTA section carries the offer)
   - /rebuild (Section 4b campaign/offer layer)
   - automaitions landing page (offer block + risk reversal)
3. Run for 7-14 days
4. Compare offer-A vs offer-B at the AOV / CPA / GP-per-transaction level
   (not creative-level — see CA §08 Three Variables)
```

---

## The 25 skills, by phase

### Research / Discovery (3 skills + 1 planned)

| Skill | Trigger | Input | Output | When to use |
|---|---|---|---|---|
| `/brand-dna` | `/brand dna`, "research brand X" | Brand name + URL | HTML Brand DNA doc (9 sections + 50-75 word prompt modifier) | First time touching a brand. Re-run on rebrand. |
| `/voc` | `/voc`, "voice of customer for X" | Product URL + product name | HTML VOC doc (16 sections, 40+ verbatim quotes, awareness/force/intensity tags) | First time, then whenever customer language shifts (new pain emerges, new competitor lands, performance drops) |
| `/spy` | `/spy`, "find winning ads" | Brand or keyword + country + count | HTML swipe file (scored: PROVEN / HOT / ACTIVE / RETIRED) | Start of every batch — find what's working before deciding what to build |
| **`/lp-spy`** (PLANNED — not yet built) | `/lp-spy`, "find winning landing pages" | Competitor URL(s) or niche keyword | HTML swipe file: scraped pages + screenshots + 17-Step structural scoring | Start of any landing page build — find what's converting in the niche right now. **Until built, use the WebFetch workflow + public swipefile sites listed in `15-landing-page-copy.md`.** |

### Strategy (1 skill — Creator Army)

| File | Purpose |
|---|---|
| `SKILL.md` | Selling sequence + creative-is-targeting belief + three variables |
| `01-context-scan.md` | What do we already know about this brand? Don't start cold. |
| `02-customer-excavation.md` | 3-5 customer types per brand, each with barriers/motivators |
| `03-selling-sequence.md` | Rapport → Open Loop → Stack Value → Wow → CTA — every ad, every format |
| `04-hook-science.md` | Feel/Look/Think framework (strategy layer above /ugc's 155 hook patterns) |
| `05-building-blocks.md` | 10 persuasion blocks — what to stack in the body |
| `06-creative-types.md` | 12 ad formats — maps to /seedance-* by format |
| `07-lo-fi-production.md` | Phone-first production for non-AI shoots |
| `08-campaign-architecture.md` | One campaign, broad targeting, 8-20 creatives — the Meta setup |
| `09-learning-loop.md` | LOAD → LISTEN → LEARN → CREATE → LOAD — replaces kill/scale testing |
| `10-case-studies.md` | Real numbers from Culture Kings, Comfrt, Strike Anywhere, Hudson, PureU |
| `11-voc-interpretation.md` | How to READ a /voc HTML doc to drive creative decisions |
| `12-brand-dna-interpretation.md` | How to READ a /brand-dna HTML doc and translate into ad constraints |
| `13-hero-mechanism.md` | Schwartz unique mechanism CREATION methodology |
| `14-offer-architecture.md` | Godfather Offer 7 components (Sabri Suby) |
| `15-landing-page-copy.md` | Magic Lantern + sales letter structure (Sabri Suby) |
| `16-skill-orchestration.md` | This file. |
| `17-automaitions-handoff.md` | How to brief the sibling automaitions-html-builder skill |
| `18-high-ticket-sales.md` | Cardone boiler-room call structure + objection handling (load on demand) |
| `19-attention-ai.md` | Jay Stockwell's Attention AI tool — eye-path QA gate |
| `20-lessons.md` | **The compounding mechanism.** Running learning doc, announce-and-calibrate protocol |
| `21-png-to-svg.md` | Convert NB Pro rasters to native animated SVGs for landing-page embed |
| `22-polish-pass.md` | **9-audit pre-ship checklist.** First failure stops the ship |
| `23-brand-logo-usage.md` | 12-slot logo system, surface-aware decision tree, naming gotcha |

### Production — Static images (3 skills)

| Skill | Trigger | Input | Output | When to use |
|---|---|---|---|---|
| `/create-static-ads` | `/40 static ads`, `/create static ads` | Brand DNA doc + product name + (VOC + product images optional) | 40 fully written NB2 prompts | First batch of static ads for a brand |
| `/multiplier` | `/multiply`, `/ad variations` | 1 NB2 prompt + VOC doc + Brand DNA doc | 5-8 Andromeda-diverse NB2 prompts | Scale a winner without near-duplicate penalty |
| `/rebuild` | `/rebuild`, `/reverse engineer ad` | Competitor ad image + Brand DNA + VOC + (optional offer + persona-variations flag) | 1 rebuild prompt + optional 5 persona variations | Modelling a `/spy` winner for your own brand |

### Production — Video (16 skills)

| Skill | Trigger | When to use |
|---|---|---|
| `/ugc` | `/ugc`, `/ugc scripts` | Talking-head UGC scripts (AI voice). 3 scripts per run, each with 3 hooks. |
| `/ugc-video` | `/ugc-video`, `/kling video` | Turn a UGC script into actual Kling 3.0 Omni video output |
| `/seedance-cinematic` | "cinematic", "film-look" | Hollywood-feel hero pieces. Brand story, premium product reveal. |
| `/seedance-social-hook` | "scroll-stopper", "viral hook" | TikTok / Reels / Shorts — 27 hook patterns across 5 categories |
| `/seedance-ecommerce-ad` | "product ad", "ecom video" | Add-to-cart-driving DTC video (4-15s, 9:16/1:1) |
| `/seedance-product-360` | "product showcase" | Rotating product reveal |
| `/seedance-fashion-lookbook` | "fashion ad" | Apparel / accessories |
| `/seedance-food-beverage` | "food ad", "sizzle reel" | F&B sensory video |
| `/seedance-brand-story` | "founder story", "brand video" | Long-form brand storytelling |
| `/seedance-music-video` | "music video style" | Editorial / artist-driven |
| `/seedance-real-estate` | "property video" | RE walkthroughs |
| `/seedance-motion-design-ad` | "motion graphics" | Animated text + graphics |
| `/seedance-comic-to-video` | "comic book style" | Stylised storytelling |
| `/seedance-anime-action` | "anime style" | Stylised action |
| `/seedance-fight-scenes` | "action choreography" | Dynamic action |
| `/seedance-3d-cgi` | "3D CGI" | High-budget CGI feel |
| `/seedance-cartoon` | "cartoon style" | Cartoon aesthetic |

### Production — Copy (1 skill)

| Skill | Trigger | Input | Output |
|---|---|---|---|
| `/copy` | `/copy`, "write headlines" | Brand DNA + VOC + creative (image/video description) | 5 headlines + 5 descriptions + 2 primary text options, platform-spec compliant |

### Production — Landing pages (1 skill — automaitions)

| Skill | Trigger | Use for |
|---|---|---|
| `automaitions-html-builder` | "build me a brief / landing page" | HTML landing pages, brand briefs, visual explainers — paired with `15-landing-page-copy.md` for Magic Lantern structure |

### Distribution (1 skill)

| Skill | Trigger | Input | Output |
|---|---|---|---|
| `/bulk-import` | `/bulk`, `/launch ads` | Images and/or videos + minimal inputs | Meta Ads Manager bulk import spreadsheet + flat zips ready to upload |

---

## Handoffs — what each skill needs from the previous step

The chain breaks at handoffs. Common failure modes:

| Skill | Expects from upstream | If missing | Fix |
|---|---|---|---|
| `/create-static-ads` | Brand DNA doc | Refuses to run | Run `/brand-dna` first |
| `/create-static-ads` | VOC doc (optional but recommended) | Generic copy with no customer language | Run `/voc` and re-run |
| `/multiplier` | Brand DNA + VOC + ONE existing NB2 prompt | Can't multiply nothing | Pick a winner from `/create-static-ads` or `/rebuild` first |
| `/rebuild` | Competitor ad image + Brand DNA + VOC | Generic substitution | Run `/spy` to source the ad, `/brand-dna` + `/voc` for context |
| `/ugc` | Brand DNA + VOC + product image | Scripts sound like ad copy not human speech | Pull more emotional-intensity quotes via `/voc` re-run |
| `/ugc-video` | Finished UGC script | Mismatched character/voice | Provide character image + voice sample |
| `/copy` | Brand DNA + VOC + creative description | Sounds generic | All three are mandatory inputs |
| `/bulk-import` | Images and/or videos + ad copy | Wrong dimensions | Re-export at correct aspect ratios (4:5, 9:16, 1:1) |
| `/seedance-*` | Strategic brief from CA | Random aesthetic outputs | Decide format + hook + selling-sequence beats first |

---

## When to involve Creator Army

CA is the strategy brain. It should be in the loop for:

- **Every new brand** (workflows A, F)
- **Every learning-loop iteration** (workflow B step 1-2)
- **Any offer test** (workflow G)
- **Any landing page build** (workflow F)
- **Any competitor rebuild where the persona variations need strategic logic** (workflow C between `/spy` and `/rebuild`)

CA can be skipped (run production skills directly) when:

- You're regenerating variations of a proven winner (`/multiplier` on a winning NB2 prompt)
- You're shipping a tactical batch with the same offer + same angles + same brief as last time
- You're producing a quick test where you'll learn from the spend data rather than the strategy

When in doubt, run CA. The 5-minute strategy pass saves a 5-day learning cycle on bad creative.

---

## The cross-cutting QA layer — Attention AI

Independent of the 25 production skills, **Attention AI** (`19-attention-ai.md`) sits above the production layer as a QA gate that any output can be run through.

Use cases across the chain:

```
PRODUCTION SKILL OUTPUT  →  ATTENTION AI QA  →  SHIP / FIX
```

- `/spy` competitor ads → validate which are genuinely attention-grabbing (heatmap strength)
- `/create-static-ads` / `/multiplier` / `/rebuild` NB2 images → pre-ship audit (hook in eye-path? CTA visible?)
- `/ugc-video` / `/seedance-*` first frames → validate hook placement
- `automaitions` landing pages → 5-min pre-launch QA at all 4 viewport modes
- **Batch selection** → combine 3-5 creatives into one composite image; Attention AI shows which pulls the eye first (Jay's multi-ad comparison trick)

Access: `attention-ai.jay.com.au` + code `onelifeclub`. 100 images/month free. API available on request for future native integration.

**Operational rule:** if a creative or page is about to consume real ad spend, it goes through Attention AI first. The 5-minute QA saves 7-14 days of bad spend.

---

## The compounding quality layer (20 / 21 / 22 / 23)

Four files turn the skill from "ships templates" into "ships polished, brand-honest, mobile-readable, learning-from-itself work." They plug into the chain at specific points:

```
                                            ┌── 23-brand-logo-usage ──┐
                                            │   (logo embed correct?) │
RESEARCH → STRATEGY → PRODUCTION ──→──┤── 21-png-to-svg ────────┼──→ 22-polish-pass ──→ 19-attention-ai ──→ SHIP
                                            │   (raster → native SVG) │      (9 audits)         (eye-path QA)
                                            └─────────────────────────┘                                          │
                                                                                                                 ▼
                                                                                                          20-lessons.md
                                                                                              (any new bug → entry, with announce)
```

### When each file enters the chain

| File | Enters when… | Mandate |
|---|---|---|
| `20-lessons.md` | **Anytime you debug something not already catalogued.** Same day. Announce-before-logging via the 📒 line in your reply. | MANDATORY for any previously-unseen bug, edge case, brand-rule edge, platform quirk, or counter-intuitive insight. Skipping breaks the compounding mechanism — the next operator hits the same bug and burns the same time. |
| `21-png-to-svg.md` | After `/create-static-ads` produces a render you plan to embed on a landing page (LP-HERO geometric concept, mechanism diagram, data viz). | MANDATORY when the deliverable is a landing page and the visual is geometric/diagrammatic. SKIP when the asset is photographic, AI-textured, or destined for Meta delivery (keep raster). |
| `22-polish-pass.md` | After production output exists, BEFORE Attention AI, BEFORE commit. | MANDATORY for landing pages. Specialised variant passes documented in-file for static ads, UGC scripts, bulk import spreadsheets. **First audit failure stops the ship.** |
| `23-brand-logo-usage.md` | Anywhere the logo appears (landing page topbar/footer, static ad, UGC end-card, social avatar, favicon). | MANDATORY whenever the logo is rendered. Surface-aware decision tree resolves which of the 12 slots to use. **Counterintuitive naming gotcha:** `mono-light.svg` = for LIGHT surfaces (dark ink fill), NOT a light-coloured logo. Misreading this ships the wrong logo on the wrong background. |

### Operational rule (compounding layer)

Before any landing page or production output goes live, run this sequence:

1. **23 (logo)** — Right variant for the surface? Inline SVG? aria-label intact?
2. **21 (PNG→SVG)** — Any hero/diagram that's still a raster needs converting if it's geometric.
3. **22 (polish pass)** — Run all 9 audits. First failure stops the ship.
4. **19 (Attention AI)** — Eye-path validation at all 4 viewports.
5. **20 (lessons)** — Anything you debugged that wasn't already there? Announce and log.

The cycle compounds. After 50 brand-runs, the lessons doc IS the skill — references become reference cards, lessons becomes the operating manual.

### Why each file is non-negotiable

- **Skip 20** and the same bug recurs on the next brand-run. Operator-time burns instead of compounding.
- **Skip 21** and landing-page hero renders ship as PNG — no scale-up sharpness, no native motion, locked to one composition.
- **Skip 22** and "alignment off by 4px", "stale character in heading", "SVG arrow points to wrong node", or "form input has 16px font on mobile causing iOS zoom" all ship live.
- **Skip 23** and the wordmark renders dark-on-dark, or a low-DPR raster appears at logo scale, or a competitor's screenshot tool picks up alt-text that says "Logo".

---

## Appendix A — Reading the VOC document strategically

`/voc` produces a 16-section HTML research document with 40+ verbatim customer quotes tagged with intensity, awareness level, and JTBD Force. The doc is dense by design — every section answers a different strategic question. Here's how to read it WITHOUT reading every word.

### 2-minute scan (when you just need the headline strategy)

Read in this order, stop when you have enough:

1. **Section 1 — Executive Summary.** 6-8 sentences with #1 pain, #1 desired outcome, dominant purchase emotion, dominant awareness level, biggest objection, oversaturated competitor angle, clearest unoccupied positioning. This alone is often enough for a quick strategic call.
2. **Section 9 — Awareness Level Deep Dive.** Tells you which awareness level to target with ad budget (Cardone calls this "where the money is"). Look at the % distribution and the "Primary Awareness Level" close.
3. **Section 13 — Language & Messaging Goldmine.** Raw customer phrases ready to drop into headlines. The 8 sub-categories cover problem language, solution language, intensity peaks, "I wish" statements, before/after pairs, anti-ad language, identity language, problem-space language.

### 10-minute strategic read (when planning a new batch)

Add to the above:

4. **Section 4 — ICP.** The Ideal Customer Profile paragraph. Defines who you're talking to.
5. **Section 5 — Pain Points (6-10 entries).** Each entry has a Copywriting Application note at the end — that's the strategic translation already done.
6. **Section 6 — Desires (6-10 entries).** Same structure.
7. **Section 10 — Visual & Sensory Language.** Critical for briefing `/seedance-*` and `/rebuild` — gives you the before/after scene descriptions in customer language.
8. **Section 15 — Value Equation Analysis.** Tells you which Hormozi lever (Time Delay / Dream Outcome / Perceived Likelihood / Effort & Sacrifice) is strongest and weakest. Lever you lead with vs. lever you reinforce with proof.

### Full-deep read (when constructing the strategic brief from scratch)

Read everything. Pay extra attention to:

9. **Section 7 — Objections.** Each entry includes counter-evidence quotes — these go straight into the FAQ section of the landing page or the objection-handling beat of a UGC script.
10. **Section 11 — Competitive Landscape.** Sea of Sameness = angles to avoid. Unoccupied Positioning Territory = your gap.
11. **Section 14 — Social Proof Arsenal.** Top 10 quotable testimonial patterns. Use as templates for what to elicit from your own customers post-launch.

### Reading the quote tags

Every quote in `/voc` has metadata. Use it:

| Tag | What it tells you |
|---|---|
| **Intensity:** Low / Medium / High / Extreme | How emotionally charged the quote is. Extreme quotes go in the hook. |
| **Awareness:** Unaware / Problem-Aware / Solution-Aware / Product-Aware / Most-Aware | Which awareness-level ad this quote belongs in. |
| **JTBD Force:** Push / Pull / Anxiety / Habit | Push = pain driving change (use in problem sections). Pull = desire pulling toward solution (use in transformation sections). Anxiety = fear blocking purchase (use in objection-handling). Habit = resistance to switching (use in competitor-switching content). |
| **Source tag:** Direct Brand / Competitor: [Name] / Problem-Space | Where the quote came from. Direct Brand quotes are strongest social proof; Competitor quotes are gold for switching narratives; Problem-Space quotes are best for cold/unaware audiences. |

### What to ignore in a VOC doc

- The Data Richness flag in Section 1 — useful once, then move on
- Section 16 Source Index — only matters if you're verifying a claim
- Anything in Section 3 (Visual & Sensory Language) if you're NOT producing video/image (skip if writing copy-only)

---

## Appendix B — Reading the Brand DNA document strategically

`/brand-dna` produces a 9-section HTML doc with a 50-75 word "prompt modifier" at the end. The doc is shorter than VOC but every section is a hard constraint on creative.

### How to read it

Read in this order:

1. **Section 8 — Image Generation Prompt Modifier (the 50-75 word block).** This is the most copy-paste-useful artefact in the entire doc. Prepend it to every image prompt for any production skill (`/create-static-ads`, `/rebuild`, `/multiplier`, `/seedance-*`). It locks the brand's visual identity in one reusable block.
2. **Section 1 — Brand Overview.** Voice adjectives + positioning statement + competitive differentiation. These constrain copy tone across `/copy`, `/ugc`, and landing page work.
3. **Section 9 — Usage Rules (Always / Never).** Hard constraints. Violating these breaks brand integrity. Read every line.
4. **Section 7 — Competitive Visual Context.** What NOT to look like. Forces visual differentiation in static ad concepts.

Reference the rest when you need it (palette hex codes for `/create-static-ads`, photo direction for `/seedance-*` briefs, product details for accurate rendering).

### How brand constraints flow into each production skill

| Skill | What it consumes from Brand DNA |
|---|---|
| `/create-static-ads` | Whole doc + the 50-75 word modifier prepended to every prompt |
| `/multiplier` | Voice adjectives + palette + photo direction (Section 4) |
| `/rebuild` | Whole doc — feeds Section 2 (Brand Identity Swaps) of every rebuild prompt |
| `/copy` | Section 1 (voice + tone) + Section 6 (CTA discipline) |
| `/ugc` | Section 1 (voice) + Section 9 (always/never — what creators can/can't say) |
| `/ugc-video` | Section 4 (photo direction) for character/setting consistency |
| `/seedance-*` | Section 4 (photo direction) + Section 8 (prompt modifier) |
| `automaitions` | Whole doc — drives palette, typography, photo direction, motion tone |

---

## Appendix C — Pending Kong paywall integrations (revisit when access granted)

Outstanding gap list moved from main body to make it a cleaner inventory. Update protocol unchanged from original:

| Kong feature | Status | What to capture when access is granted |
|---|---|---|
| **24 Direct Response Headlines** sets | Locked | Set names + 3-5 examples per set. Compare against `/ugc`'s 155-pattern library to see if any sets are genuinely novel buckets. |
| **HVCO Titles** generator | Locked | Input form fields + 5-10 example outputs. Compare against the 17-Step Selling System's bullet section in `15-landing-page-copy.md`. |
| **Hero Mechanism** generator | Locked | Input form + 5-10 sample mechanisms. Compare against the 5-step methodology in `14-offer-architecture.md` (Hero Mechanism section). |
| **Landing Pages** generator | Locked | Output section structure. Compare against the 17-Step Selling System and `automaitions` template shapes. |
| **Offer** generator | Locked | Input form + 2-3 outputs. Compare against the 7-component Godfather Offer in `14-offer-architecture.md`. |
| **Dream Buyer Avatar** schema | Locked | The 7-dimension form fields + a sample avatar. Compare against `/voc` Section 4 (ICP). |

**When granted access:**
1. Screenshot every input form
2. Generate 3-5 examples per tool against a brand you know (so you can compare to your own intuition)
3. Add `references/kong-integration-notes.md` documenting: what Kong does that we don't, what we do that Kong doesn't, novel patterns worth absorbing
4. Amend `14-offer-architecture.md` and `15-landing-page-copy.md` with anything genuinely novel
5. Update this orchestration map if Kong tools warrant being added as steps in the chain

**Permanently inaccessible (Kong's actual moat):**
- $200M-spend pattern library (proprietary training data)
- $7.8B-ROAS dataset

Our equivalent is the AI Ad Lab suite's own pattern accumulation through `/spy` (live winning ads in any niche), `/voc` (live customer language), and the learning loop (`09-learning-loop.md`) which compounds across brands you actually run.

---

## One-line summary

**Research → Strategy → Production → Distribution.** Don't skip strategy. Run Creator Army between research and production on every brand, every batch.
