# Winston's UNBREAKABLE Briefing Flow (Creator Army × Automaitions)

> Run this IN FULL before briefing any worker on content/ad/landing/funnel work. Each step has a GATE — do not proceed until it passes. Source: full read of the 21 CA×A reference docs, 2026-06-01.

## STEP 0 — THE PERSISTED FOUNDATION (build once per brand, reuse forever)

Steps 1-5 below produce six artefacts. Those artefacts are NOT throwaway — they are written to disk per brand and become the locked source of truth every future build inherits:

`~/scripts/portfolio-dashboard/data/brand-foundations/<business>/` → `voc.md`, `brand-dna.md` (REAL fonts + hex + voice), `competitor-spy.md`, `mechanism.md`, `offer.md`, `customer-matrix.md`. Mirror the same folder into the brand's git repo as `brand-foundation/` so it ships with the site.

**The hard gate (enforced in `winston_runner.py` WINSTON_SYSTEM — the FOUNDATION GATE):** before ANY brand build, the worker must READ that folder and use the exact fonts/colours/offer/mechanism verbatim. If the folder is missing/empty, the worker STOPS and says so — it does NOT guess generic defaults. **No foundation = no build.** This is what makes "skip a step" mechanically impossible, and makes the research compound instead of getting re-guessed each time.

If a brand has no foundation yet, run the `brand-foundation-<business>` workflow (parallel agents: VOC + brand-DNA + spy → mechanism + offer + matrix) ONCE, write the six files, commit them. Then every build is fast and on-brand.

## The Flow

### 1. CONTEXT SCAN (read before you ask)
**Do:** Before asking the worker or Jett a single question, open and read the brand's existing assets in this order: /voc (esp. Section 1 Exec Summary, Section 9 Awareness Level, Section 13 Language Goldmine, Section 14 Social Proof, Section 4 ICP, Section 5/6 pain+objections), /brand-dna (Section 8 50-75 word prompt modifier, Section 9 Always/Never, Section 7 what-NOT-to-look-like), /spy competitor scan, and all prior /create-static-ads, /multiplier, /rebuild outputs. Use what exists; do NOT re-research what is already documented.

**GATE:** Either a current /voc + /brand-dna are loaded and quoted, OR a documented note exists saying they are absent and a manual excavation pass is required. Cannot proceed on memory or assumption — the actual docs must be open.

### 2. STRATEGY LAYER — never skip (run Creator Army)
**Do:** Run the Creator Army strategy pass between research and production. Decide everything ABOVE the production line: deliverable type, customer types, barriers/motivators, awareness level, selling sequence. This is the #1 failure mode if skipped — production skills produce templates, not creative decisions. If the request is a bare 'just write me an ad' with no barriers/motivators/customer types, STOP and run the 4 excavation questions: (1) #1 reason someone sees it and doesn't buy, (2) the 2-3 types who buy, (3) what they tried before that failed, (4) exact words best reviews use.

**GATE:** A written strategy pass exists. No production skill (/create-static-ads, /ugc, automaitions, etc.) may be named or invoked until the strategy layer is complete. If excavation answers are missing, no copy is produced.

### 3. CUSTOMER MATRIX + BARRIER/MOTIVATOR MAP
**Do:** Name 3-5 customer types, each as: Name (e.g. 'Tried Everything Tina'), Core belief (about the category now), Core barrier (#1 thing stopping them), Core motivator (#1 thing pulling them in, flagged emotional/rational/social), Proof they need, Content angle. Build the Creative Matrix: customer types (rows) x 3 angles each = 9+ distinct angles. Every named barrier maps to at least one distinct ad angle ('tried it before' is a different ad from 'never heard of this brand').

**GATE:** Matrix yields 9+ genuinely distinct angles (NOT N versions of one ad). Every barrier has at least one ad answering it. Motivator set spans emotional + rational + social. Fails if angles are paraphrases of each other.

### 4. LOCK THE BRAND-LEVEL CONSTANTS
**Do:** Confirm the brand's Hero/Unique Mechanism (one specific, concrete, falsifiable sentence in the customer's language, ideally a proprietary branded name, pressure-tested against the top 3 /voc objections — must answer 2-3). Confirm the Godfather Offer paragraph (4-6 lines, all 7 components: Rationale, Build Value, Pricing, Payment, Premiums, Power Guarantee, Scarcity). These are decided ONCE per brand/batch and inherited by every downstream worker verbatim. Lift Brand DNA Section 9 Always/Never into a 'Brand Constraints (LOCKED)' block (e.g. automaitions no-founder-face, no stock photo, wordmark lowercase, 85/15 indigo/coral).

**GATE:** Mechanism is one falsifiable sentence answering 2-3 objections (not a benefit list or feature). Offer has all 7 components written verbatim. Banned hedge words (premium/clean/modern/professional/trustworthy/sleek/etc.) are absent. Brand DNA Always/Never copied in. Fails if any of the 7 offer components missing or mechanism is generic.

### 5. SERVICE-VS-PRODUCT FORK
**Do:** Classify the brief as PRODUCT/DTC or SERVICE/SaaS/info/coaching/B2B and apply the matching defaults (see service_vs_product_rules). This decides page type (sales vs opt-in+nurture+call), default stacking sequence (impulse vs skeptical/unaware), CTA register (Direct/Urgency vs Soft/Engagement), Wow type (Live Demo vs Metaphor/Data Bomb), proof shape (physical change vs case-study numbers), creative-type menu, and whether the High-Ticket Sales file loads.

**GATE:** The fork is declared in writing and every later default in the brief matches it. A service brief must NOT carry product-only defaults (two-frame reveal, unboxing, impulse stack, instant-cart CTA) and vice versa.

### 6. SELLING SEQUENCE + STACK + HOOK SCIENCE
**Do:** Map the piece to the 5-stage selling sequence with hard timestamps: Rapport 0-3s -> Open Loop 3-10s -> Stack Value + Overcome Objections 10-40s -> Wow/Aha 30-45s -> Clear Next Step final 3-5s. Pick the named stacking sequence matched to the viewer (Skeptical / Unaware / Price-sensitive / Impulse). Pick the open-loop structure (Promise/Tease/Contradiction/Story Entry/Challenge) with the exact tease line. Pick the Wow type (Metaphor/Live Demo/Customer Reaction/Data Bomb) with the specific number/metaphor/demo. Decide hook TYPE (Feel/Look/Think) + one of the 7 hook formulas + the actual first-frame text-overlay line (<=8 words). Choose 3-5 persuasion building blocks ordered by belief state, leading the SOLUTION block with the mechanism. Cross-check all 5 persuasion pillars (Ethos/Logos/Pathos/Metaphor/Brevity).

**GATE:** Open loop is both opened AND closed. Each value block is 5-8s, alternating emotional/rational, claim immediately followed by proof. Hook triggers >=1 of Feel/Look/Think and has a <=8-word sound-off text overlay. SOLUTION block leads with mechanism, not features. All 5 persuasion pillars present, 30% cut attempted. Fails if any pillar missing or hook has no sound-off overlay.

### 7. CREATIVE TYPE + DIVERSITY (3-of-5) BEFORE TOOL
**Do:** Pick the creative TYPE first (one of the 12/13), then route to the production skill via the type->skill mapping — never let tool availability drive the choice. For each new creative, fill the 3-of-5 diversity table (Talent / Setting / Format / Visual Style / Hook Mechanism) and confirm it differs from existing ads on at least 3. Apply the naming string [Brand]_[CreativeType]_[Hook]_[Date]_[Version]. Hold to: min 8 creatives per set (15-20 recommended), no more than 3 of the same type, body stays constant while hooks vary for testing.

**GATE:** Creative type chosen before the skill is named. Every new ad scores 3/5+ on the diversity table (Andromeda will group near-dupes otherwise). No more than 3 of one type. Naming string filled. Fails if any ad is <3/5 distinct or the tool was chosen before the type.

### 8. WRITE THE WORKER BRIEF (the template)
**Do:** Fill the exact brief template (see brief_template) in full — every field. Strategic inputs (mechanism, offer, awareness level, customer type, selling-sequence-to-section mapping, featured /voc quotes, CTA wording, hook) come from CA; the worker/production skill handles only what is below the line (palette, typography, motion selection, responsive, audit). For landing pages: ONE CTA only; declare hamburger-nav explicitly (NO nav on sales/opt-in, mandatory on partner briefs/explainers/marketing sites); echo the ad headline+hook so the page matches the creative; opt-in form = name+email only; 6-element/5-element/17-step structure per page type. For motion: declare each asset as identity-moment OR motion-decoration (never repurpose a brand-identity video as decoration).

**GATE:** No field left blank or hedged. Every strategic decision is filled by Winston (not left for the worker to invent a generic default). Single CTA confirmed for LPs. Hamburger-nav explicitly stated. Page/ad copy echoes the driving ad. Asset job declared per motion asset. Fails if any strategic gap is left for the production skill to fill.

### 9. PRE-SHIP COMPOUNDING + ATTENTION AI GATE
**Do:** Before anything that will consume real ad spend or ship, run the pre-ship sequence: logo variant check (surface-aware: mono-light = dark ink for LIGHT surfaces) -> PNG->SVG for geometric heroes (keep photographic/AI-texture as raster) -> the 9-audit polish pass IN ORDER (1 Alignment, 2 Motion sync, 3 SVG, 4 Brand adherence, 5 Responsive, 6 Accessibility, 7 Copy, 8 Form, 9 Performance; FIRST failure STOPS the ship, fix and re-run from there) -> Attention AI at all 4 viewports (attention-ai.jay.com.au, code onelifeclub) -> log any new bug to 20-lessons.md, announced via the 📒 line BEFORE writing. Verify performance gates (Lighthouse mobile >=90, LCP<2.5s, CLS<0.1, INP<200ms, <200KB excl images, video <2MB MP4+WebM), 375px mobile legibility, prefers-reduced-motion full degrade, burned-in captions, real brand asset (no placeholder).

**GATE:** Polish pass passed all 9 in order with no stop. Attention heatmap concentrates on hero headline + hero mechanism + primary CTA (strong/focused/slippery-slope = ship; weak/shotgun/decorative = fix or kill). Any new bug logged to 20-lessons.md with the 📒 announce-before-logging line. Nothing ships until this gate is green.

## Service vs Product (declare the fork at step 5, apply everywhere)
- PAGE TYPE: Product/DTC under $300 defaults to a SALES page (cold-buy viable, credit card is the win). Service / SaaS / coaching / B2B / any high-ticket >$300 (esp. >$5K) defaults to OPT-IN + Magic Lantern nurture + sales CALL — cold traffic to a high-ticket sales page converts ~0.1% and does NOT work.
- STACKING SEQUENCE: Product can run the Impulse stack (Demo -> Social Proof -> Scarcity -> CTA). Service is a considered purchase, so default to the Skeptical stack (Problem -> Failed Solution -> Unique Mechanism -> Demo -> Social Proof) or Unaware stack — never default a service brief to Impulse.
- CTA REGISTER: Product can use Direct ('Shop now / Link in bio') and Urgency ('only 200 left'). Service skews Soft / Engagement ('take the quiz', 'comment DEAL and I'll DM you', 'apply') because the next step is a lead/consult, not an instant cart add.
- WOW/AHA: Product leans on the no-cuts Live Demo / unboxing (physical transformation). Service leans on Metaphor and Data Bomb ('running ads without creative is like fishing without bait', '$0 to $15K/day in 14 days') and substitutes screen-recordings / client-results dashboards / live transformation reveals for the physical demo.
- PROOF: Product proof = visible physical change (before/after same skin type, ingredient transparency, timeline testimonial). Service proof = case-study numbers, client transformation reactions, before/after of an OUTCOME (revenue, results); the Customer-Reaction type becomes a client reacting to their own results dashboard.
- BARRIER TILT: Product top barriers = 'looks too cheap/expensive', ingredient/website-trust. Service top barriers = 'I don't know if it works for MY situation', 'I can't find reviews from people like me'. Same 4 excavation questions, different top answers — write the answers accordingly.
- HERO MECHANISM SHAPE: Product mechanism is a physical/ingredient/formulation property. Service/agency mechanism is the SYSTEM/CHAIN itself ('25-skill production engine plus the strategic brain', 'our AI analyses 10,000 data points per ad — a human checks 5'), still one sentence, decided once per brand.
- CREATIVE TYPES: Two-frame product reveal (type 13) and Abstract motion decoration (13a) are PHYSICAL-PRODUCT-ONLY with a crisp visual transformation — never for services/SaaS/abstract. Before/After and Unboxing are product-led. Services lean on UGC, Founder Story (where DNA allows), Problem/Solution, Mechanism-explainer diagrams, Expert Endorsement, Testimonial Compilation, education/visual-explainer assets — but still owe the same 8-20 diverse creatives and the 3-of-5 rule.
- MOTION ARCHETYPE: Scroll-scrubbed video hero is for products with a clean BEFORE->AFTER physical transformation (suitcase packing, perfume assembling) — NOT for abstract services. For service brands lacking a crisp transformation, use the floating brand-blob companion for atmosphere; omit it on product-focused pages (product needs visual oxygen) and high-conversion-density LPs (it steals click intent). Particle-narrative is justified only for a brand-defining service/agency moment, never for conversion-first / data-heavy / novice-audience pages.
- HIGH-TICKET SALES FILE: Load ON DEMAND only — when a human closes a >$2K SERVICE offer on a call (managed services $5K-50K+, coaching, B2B SaaS, consultancy). Do NOT load it for product ad batches or self-serve sub-$1K funnels — there the checkout + funnel does the closing.
- OFFER TEST LEVER: Product tests bundles/AOV (Strike Anywhere $70->$120, GP/transaction +$20-30). Service tests OFFER STRUCTURE (pilot price, guarantee, scope). Principle is identical: test the offer, not just creative.
- META OBJECTIVE: Ecom/product = Conversions optimised for PURCHASE, reconcile against Shopify. Service/lead-gen = Conversions optimised for LEAD, reconcile against CRM. Architecture otherwise identical (one campaign, broad Advantage+, 8-20 creatives).
- BRAND-CONSTRAINT DISCIPLINE: Service/agency 'Never' rules are sharper and must be lifted into the LOCKED brief block — e.g. automaitions forbids founder-face and stock photography (counter-positioning vs King Kong). Product brands often lean INTO founder/UGC faces. Attention AI reads faces differently: an emotional face reinforces a product/lifestyle CTA but the same face on a service/financial page STEALS eye time from the CTA.
- HAMBURGER NAV: OMIT on service sales/opt-in pages (any nav link = funnel leakage on a single-CTA page). MANDATORY on partner briefs, visual explainers, and marketing sites regardless of fork. Always state explicitly in the brief — otherwise automaitions applies its mandatory-nav default and ships a leaking funnel.

## Never Do
- NEVER skip the strategy layer (jump from /voc research straight to a production skill). Production skills produce templates, not creative decisions — this is the #1 failure mode.
- NEVER ask the worker or Jett a question before running the Context Scan. Re-researching what /voc, /brand-dna, /spy or past outputs already document is banned.
- NEVER write a generic ad. If the request lacks barriers, motivators, or customer types, STOP and ask the 4 excavation questions first — do not produce copy.
- NEVER target demographics. Creative IS the targeting — make an ad for one specific human with one specific problem and let Meta's AI find them. Targeting stays broad Advantage+ (no interests, lookalikes, custom audiences, or exclusions).
- NEVER ship volume that is N versions of the same ad. Every new creative must differ on at least 3 of the 5 diversity dimensions (Talent / Setting / Format / Visual Style / Hook Mechanism) — Andromeda groups near-dupes into one ad.
- NEVER Frankenstein the ASSETS (splice hook from A + body from B + CTA from C). Andromeda reads it as a near-duplicate and gives it no distribution. Frankenstein the INSIGHTS, not the assets.
- NEVER let tool availability drive the creative choice — pick the creative TYPE first, then route to the production skill (no tail wagging the dog).
- NEVER let a production skill invent its own strategy or fill a strategic gap with a generic default. CA decides everything above the line (page type, shape, awareness level, mechanism, offer, sequence-to-section mapping, quotes, CTA wording); the worker handles only below the line.
- NEVER put the offer in the hero. Hero = call-out + headline + promise + intrigue bullets. The offer lives in steps 10-15, after proof + mechanism + social proof.
- NEVER use more than ONE CTA on a landing page (same wording, same destination, repeated). No menu, no 'learn more', no secondary CTA — two CTAs = decision paralysis = funnel leakage.
- NEVER use fake scarcity, fabricated MSRPs, or resetting countdown timers, or 'only 3 left' when there are 3,000. Real only — AU/US legal exposure (ASIC/FTC).
- NEVER let the page mismatch the ad. The page headline + hero promise must echo the driving ad's hook and Wow moment, or bounce rate spikes.
- NEVER accept a hedged answer to the pre-brief decisions. 'Premium / clean / modern / trustworthy / professional' is a failure state that describes every brand in the category — iterate to a concrete image/phrase/feeling, and do not accept the second hedge either.
- NEVER use the banned adjectives in any copy surface (modern, clean, minimal, professional, sleek, premium, beautiful, elegant, innovative, seamless, cutting-edge, world-class, next-gen, solutions, synergy, empower, unlock, revolutionary, game-changing, leveraging, robust, scalable).
- NEVER ship a hook without a sound-off first-frame text overlay (the hook itself, not a subtitle): bold, high-contrast, <=8 words on screen — 50%+ watch muted.
- NEVER open a loop without closing it (close too early = they leave; never close = they feel cheated), and never assume the worker will close it.
- NEVER lead the SOLUTION block with a feature list or product name — lead with the Hero Mechanism, framed as a discovery, not a sales claim.
- NEVER ship before the mandatory polish pass (9 audits in order). The FIRST failure stops the ship — fix and re-run from that audit. Mobile 375px legibility and full prefers-reduced-motion degrade are non-negotiable.
- NEVER drive paid traffic to a landing page before Attention AI passes at all 4 viewports — a weak/shotgun/decorative heatmap is a kill-or-fix, not a ship.
- NEVER misread the surface-aware logo rule: mono-light = dark ink for LIGHT surfaces (NOT a light-coloured logo). Wrong variant = invisible logo = hard fail. Logos are SVG only, never animated beyond hover 1.0->1.05.
- NEVER ship a placeholder — placeholder wordmark text, placeholder slate fill, or brand-config name 'Your Brand' must make the chain REFUSE to ship.
- NEVER repurpose a brand-identity video (logo visible) as motion decoration — generate a purpose-built abstract loop with explicit negative-prompting for logos/text/characters/objects.
- NEVER judge an ad before spending 3x target CPA on it, and NEVER judge by volume/spend instead of efficiency (CPA, ROAS). Don't manually pause low-spend ads — if Meta won't spend, that IS the kill signal.
- NEVER touch the ad set during the 7-14 day LISTEN phase (no pausing, no budget changes), and NEVER reset the set or remove winners to make room when loading a new batch.
- NEVER fix a non-spending cost-cap campaign with a higher cap — the fix is always more/better creative. When performance drops, diagnose in order: Creative -> Offer -> Budget, never budget first.
- NEVER skip logging a previously-unseen bug, edge case, or counter-intuitive insight to 20-lessons.md the same day, announced via the 📒 line BEFORE writing it — skipping breaks the compounding mechanism and the next operator burns the same time.

## The Worker Brief Template (fill every field)
```
WINSTON WORKER BRIEF — [Brand]_[CreativeType/PageType]_[Hook]_[Date]_[Version]

== 0. ROUTING ==
Deliverable type: [static ad / UGC / Reel / opt-in page / sales page / partner brief / visual explainer / marketing site / magic-lantern-step-N]
Template shape: [Shape 1 single-doc / Shape 2 multi-page]
Production skill this routes to: [/create-static-ads / /ugc -> /ugc-video / /seedance-* / automaitions-html-builder / etc.]  (TYPE chosen BEFORE skill)
PRODUCT or SERVICE fork: [PRODUCT-DTC / SERVICE-SaaS-info-coaching-B2B]  -> defaults applied accordingly
Deploy target: [Vercel / Netlify / Shopify section / standalone HTML / Meta]

== 1. BRAND CONSTANTS (LOCKED — inherited verbatim, do not reinvent) ==
Hero Mechanism (one falsifiable sentence, customer language, proprietary name): [____]
Godfather Offer (4-6 lines, all 7: Rationale / Build Value / Pricing / Payment / Premiums / Power Guarantee / Scarcity): [____]
Brand DNA Section 8 prompt modifier (50-75 words, prepend to every image prompt): [____]
Brand Constraints — ALWAYS: [____]   NEVER: [____]   (incl. logo variant rule, wordmark lowercase, 85/15 palette, no-founder-face if applicable)
Exact logo variant + surface: [mono-light=dark ink on LIGHT / mono-dark=white on DARK / primary / glyph-only / favicon]
Real brand asset path (NO placeholder): [examples/<brand>-brand-assets/...]

== 2. STRATEGY (from Creator Army — Winston fills, worker does not) ==
Primary awareness level: [Unaware -> Most-Aware]
Primary customer type (one-para ICP, from /voc S4): Name=[____] Core belief=[____] Core barrier (named: category/brand/timing)=[____] Core motivator (emotional/rational/social)=[____] Proof they need=[____]
The specific barrier THIS piece answers: [____]
Selling-sequence spine (timestamps): Rapport 0-3s=[____] | Open Loop 3-10s=[____] | Stack+Objections 10-40s=[____] | Wow 30-45s=[____] | CTA final 3-5s=[____]
Named stacking sequence: [Skeptical / Unaware / Price-sensitive / Impulse]  (services default Skeptical/Unaware)
Building blocks (3-5, ordered by belief state, SOLUTION leads with mechanism): [____]

== 3. HOOK + OPEN LOOP + WOW (sound-off first) ==
Hook TYPE: [Feel / Look / Think / combo] | Formula (1 of 7): [____] | Actual first-frame text overlay (<=8 words, bold high-contrast): [____]
Open-loop structure: [Promise / Tease / Contradiction / Story Entry / Challenge] | exact tease line: [____]  (must be opened AND closed)
Wow/Aha type: [Metaphor / Live Demo / Customer Reaction / Data Bomb] | specific content (the number/metaphor/demo): [____]

== 4. COPY + PROOF (verbatim, sensory, no placeholders) ==
Exact headline (MUST echo the driving ad): [____]
Exact subheadline: [____]
Section headers in order (6-8) [if page]: [____]
Full section-by-section copy [17-step if sales page / 5-element if opt-in]: [____]
3-5 verbatim /voc customer quotes (S14): [____]
Proof assets matched to THIS customer type (not generic): [____]

== 5. CONVERSION ARCHITECTURE ==
PRIMARY CTA — exact text, ONE only, repeated: [____]  (Direct/Urgency for product; Soft/Engagement for service)
CTA destination: [____]
Leaked-discount-code trick applies? [Y/N + wording]
Form fields [opt-in: name+email ONLY unless justified]: [____]
Hamburger nav: [NO nav — sales/opt-in / MANDATORY — partner brief/explainer/marketing site]   (state explicitly)
Genuine scarcity (real batches/capacity/expiry — NO fake countdowns): [____]
Power guarantee (specific, measurable): [____]

== 6. DIVERSITY + MOTION + ASSETS ==
3-of-5 diversity check vs existing ads: Talent[ ] Setting[ ] Format[ ] Visual Style[ ] Hook Mechanism[ ]  -> score __/5 (must be >=3)
Asset job per motion asset: [identity-moment / motion-decoration]  (never repurpose brand-identity video as decoration)
Motion tier: [T1-2 baseline / T2 + one T3 candidate / named T3+] | key moment needing motion: [____] | 3-5 vibe words: [____]
Two-frame reveal inputs [product only]: start+end photo, background, product, starting state, contents, final motion; output [Kling 3.0/Seedance, 7s, MP4+WebM]

== 7. POST-BUILD (always) ==
Run polish pass (9 audits in order): YES
Run Attention AI all 4 viewports before paid traffic [LP mandatory]: YES
Log any new bug to 20-lessons.md (📒 announce before logging): YES
Deliver as: [file path / Vercel deploy / Shopify snippet / Meta bulk-import]
```
