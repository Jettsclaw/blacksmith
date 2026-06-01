# Attention AI — Visual Attention QA Layer

Cross-cutting QA tool that sits above the entire production layer of the AI Ad Lab suite. Built by Jay Stockwell (One Life Club / OLC). Validates that the visual output of any production skill (`/create-static-ads`, `/rebuild`, `/multiplier`, `/ugc-video`, `/seedance-*`, `automaitions`) actually captures attention where it needs to — before you ship the creative to ad spend.

## Current scope (staged rollout)

**MANDATORY for: landing pages only** (output of `automaitions`).

OPTIONAL for everything else. Operator is learning the tool + workflow first, then expanding asset-by-asset.

When ready to expand:
1. After 5+ landing page heatmaps interpreted comfortably → switch static ads (NB2 outputs) from OPTIONAL to MANDATORY in `SKILL.md` Step 7.5
2. Then video first-frames
3. Watch the 100/month free quota — full mandate across all visual outputs will exceed it; request quota from Jay OR move to Path C (native API integration) before expanding

The full playbook below covers ALL asset types so the methodology is documented and ready when each scope expansion happens. No further skill changes needed beyond toggling the mandate in `SKILL.md`.

## What it is

A specialised vision model (NOT an LLM) that predicts where humans will look on any UI, ad creative, or web page. Based on the research paper *"Reducing the Semantic Gap in Saliency Prediction by Adapting Deep Neural Networks"*. Trained on massive datasets of real human eye-tracking data, adapted specifically for UI + ad creative.

**Accuracy:** ~96% vs. real eye-tracking studies. Closes the gap between "I think this design is clear" and "actual humans look at the thing I want them to look at."

## Why it matters strategically

CA is built on the belief that creative IS targeting. Attention AI validates whether your creative is actually doing the job — before Meta tells you (expensively, in 7-14 days of spend) that it isn't.

Jay's CRO frame (from the source teaching): *"Conversion rates are the linchpin to all growth. When you increase your conversion rates, it not only allows you to increase revenue immediately but also unlocks marketing channels that were previously unprofitable."*

That's the lever this tool gives you. Every creative goes through this gate before it ships.

---

## Access

- **URL:** `https://attention-ai.jay.com.au/register`
- **Referral code:** `onelifeclub`
- **Quota:** 100 images/month free; ask Jay for more if needed
- **API:** Available on request (Jay: *"We also have an API you could use if you needed it"*)
- **Do NOT share externally** — inference costs are real

## The 4 capture modes

| Mode | When to use |
|---|---|
| **Desktop** | Standard desktop above-the-fold capture (~1920x1080) |
| **Desktop Long** | Full long-scroll page (max 1920×3000) — for landing pages, sales pages, multi-section sites |
| **Mobile** | Standard mobile above-the-fold — critical for Meta traffic (95%+ mobile) |
| **Mobile Long** | Full long-scroll mobile capture — for mobile sales pages and Magic Lantern landing pages |

**Default for AI Ad Lab work:** Always run BOTH Desktop AND Mobile (and Long versions for landing pages). Attention shifts dramatically between viewports.

### Advanced settings worth using

- **Scroll depth (1-3 screens):** for landing pages, analyse hero + mid-page + CTA-area as separate captures so you see attention at each scroll depth
- **Wait time (0-5s):** essential for JS-heavy React/Vue/Next sites — without this the tool captures a half-rendered page
- **Cookie banner hiding:** removes EU GDPR modal noise that would otherwise dominate the heatmap
- **Forced refresh:** when you've just updated the page and want to re-test
- **JPEG quality (40-95):** higher for sharing, lower for speed

---

## The 5 audit workflows

### Workflow A — Your own landing page audit (pre-launch QA)

**When:** After `automaitions` ships a landing page, BEFORE driving paid traffic to it.

1. Run the page URL through Attention AI at all 4 viewport modes
2. Validate the heatmap concentrates on:
   - The hero headline (Step 2 of 17-Step Selling System per `15-landing-page-copy.md`)
   - The Hero Mechanism statement (per `14-offer-architecture.md`)
   - The primary CTA (and ONLY the primary CTA)
3. Red flags to fix before launch:
   - **Scattered attention** ("shotgun" pattern) → cognitive load is too high; reduce competing elements
   - **Attention on decoration not action** → decorative product photography pulling eye away from CTA
   - **Two CTAs getting equal attention** → create visual hierarchy (one solid button, one outlined)
   - **Hero text getting NO attention** → it's not visually salient enough (size, contrast, position wrong)
   - **CTA missed entirely** → the page is failing its primary job

### Workflow B — Competitor landing page audit (pre-build research)

**When:** Before building a new landing page in a category — use to understand what's already working visually.

1. From `/spy` or manual research, pick 3-5 high-performing competitor pages in the niche
2. Run each through Attention AI (both Desktop + Mobile)
3. Look for the patterns:
   - Where does attention concentrate consistently across competitors?
   - What does NONE of them get right (your differentiation gap)?
4. Brief CA + `automaitions` with the patterns + gaps as input

### Workflow C — Single ad creative audit (pre-ship)

**When:** After `/create-static-ads` / `/rebuild` / `/multiplier` produces NB2 images, BEFORE bulk-importing into Meta.

1. Run each NB2 output through Attention AI (Upload Image mode)
2. Validate:
   - **Hook gets attention in the first 2 seconds** (proxy: hook element has the strongest heatmap signal)
   - **CTA / offer is in the eye-path** (not buried in the corner)
   - **Hero mechanism callout gets noticed** (the differentiation reason)
3. Red flag: **weak heatmap overall** = low attention = weak creative. Per Jay: *"The heatmap is not that strong, which signals overall low attention. It's weak."* Kill it or re-prompt.

### Workflow D — Multi-ad comparison (creative selection)

**When:** You have a batch of 5-20 creatives and need to pick the top 5 to launch with.

This is **Jay's most novel use case** — a workaround for not being able to run pre-flight A/B tests:

1. Create ONE composite image with 3-5 of your ads laid out side by side (any layout)
2. Run the composite through Attention AI
3. See which ad pulls the eye first / strongest — that's your "eye candy" winner
4. **Cross-reference by re-ordering:** rearrange the ads in a NEW composite image (e.g. swap position 1 and position 5), re-run
5. If the same ad wins regardless of position → that's a true winner, not a positional artifact
6. Launch the top 2-3 cross-reference-validated winners; hold the rest for `/multiplier` variations later

This trick is genuinely valuable for cold-launch creative selection. Pre-flight winner detection without ad spend.

### Workflow E — Hero composition / product layout audit

**When:** Designing any multi-product hero image (e-commerce home, collection page, multi-SKU landing page).

1. Run the hero image through Attention AI
2. See which products / elements get attention vs. which are invisible
3. Either rearrange the layout to make the strategic SKUs more salient, OR swap out the invisible products entirely

Real example from Jay's teaching: Culture Kings hero — Lucky38 shirt + Lakers hat + character shirt got attention; jumper got nothing. Lesson: that jumper either needs better positioning or shouldn't be in the hero.

---

## The Visual Salience framework

Jay's underlying methodology. Frame every output against these principles:

### Visual salience = the perceptual quality that makes something stand out

It's a concept from psychology/neuroscience. In practice: visual salience is created by **contrast** — a thing stands out because its neighbours don't. Apply to:

- **Color contrast** — bright element on muted background (Canva's "Start designing for free" button)
- **Size contrast** — big element next to small elements
- **Isolation** — single element with whitespace around it
- **Motion** — animated element against static (where appropriate; carousels DON'T work here, see below)
- **Faces with strong emotion** — humans are wired to look at faces, especially eyes
- **Color saturation** — saturated against desaturated (Scratch dog face — bright red collar in muted scene)
- **Directional cues** — arrows, lines of sight, gestures pointing toward the CTA

**The rule:** make it super obvious what someone should be doing. ONE thing with high salience. Everything else recedes.

### The Slippery Slope vs Shotgun model

Two failure modes, two success modes:

| Pattern | Description | Example |
|---|---|---|
| **Slippery Slope (good)** | Attention flows naturally toward ONE next action. Momentum on first click. | Canva homepage — eye lands on "Start designing for free" |
| **Focused mechanism (good)** | Attention on the hero mechanism / promise. Builds belief before action. | PPC landing pages with single benefit + single CTA |
| **Shotgun (bad)** | Attention scattered across many elements with no clear priority. High cognitive load → bounce. | Mailchimp homepage — eye jumps everywhere, brand "hopes something hits" |
| **Decorative (bad)** | Attention captured by decoration that doesn't drive action. Wasted eye time. | Glossier Earbuds Beauty Bag — eye on product photography, no path to action |

**Operational rule:** before shipping any creative or page, classify which pattern the heatmap shows. If it's Shotgun or Decorative — fix it. If it's Slippery Slope or Focused Mechanism — ship.

### Specific patterns Jay teaches

- **Hero carousels = dead.** Manual carousels get clicked <1% of the time. Moving carousels create cognitive load. Static hero with ONE focused message wins.
- **Two equal CTAs = decision paralysis.** If you need two buttons (e.g. "For Investors / For Borrowers" on PSA Capital), give them visual hierarchy — one solid, one outlined. Don't compete.
- **Faces with strong emotion grab attention** — but they can overpower the CTA. Use them strategically (Scratch's puppy face works because emotional connection to pets reinforces the offer; same trick on a financial services page would steal the CTA's eye time).
- **Phone numbers in header get attention** — useful if you want calls (PSA Capital), wasteful if you want CTAs clicked.
- **Tool works for square/rectangular** but **NOT skyscraper banners** — long thin formats don't work well in the model.

---

## Where Attention AI slots into the AI Ad Lab chain

Cross-cutting QA tool. Used at multiple stages, not just one.

| Stage | Use Attention AI to... |
|---|---|
| `/spy` outputs | Validate which competitor ads actually grab attention (not just "is it running"). Strong heatmap = real winner; weak heatmap = active but underperforming. |
| **CA strategic brief** | Reference competitor heatmaps when constructing the strategic brief — know visually what works before deciding what to build |
| `/create-static-ads` outputs | Pre-ship audit (Workflow C) on every NB2 output. Kill weak heatmaps before bulk-import. |
| `/multiplier` outputs | Run each variation through Workflow C. Keep variations where the offer/mechanism gets eye time; kill the ones where attention scatters. |
| `/rebuild` outputs | Validate the rebuild captures attention in the same zones as the competitor original (the rebuild's job is to preserve the winning structural attention pattern). |
| `/ugc-video` / `/seedance-*` first frames | Capture the first frame of any video output as an image; run through Attention AI to validate hook is in the eye-path. |
| `/copy` outputs | When the copy is applied as text overlay on creative, validate the text actually gets noticed. Long primary text rarely gets read. |
| `automaitions` outputs | Workflow A on every landing page before going live. The single biggest gap in `automaitions`' current process — it has no objective visual QA. |
| **Pre-launch batch selection** | Workflow D on the entire batch — pre-flight winner selection before spending. |
| **Post-launch diagnosis** | When a creative underperforms in spend data, run it through Attention AI to confirm whether it was an attention problem (heatmap was weak) or a different lever (offer, audience, etc.) |

---

## Future API integration

Jay confirms an API exists. Two paths for deeper integration when ready:

### Path A — Manual workflow (current state)

Operator runs Attention AI manually as a QA step per the workflows above. Cost: 100 images/month free quota.

### Path B — Native API integration in production skills

When ready, integrate the Attention AI API into the AI Ad Lab production skills directly:

- `/create-static-ads` auto-runs every NB2 output through Attention AI; scores in the output report
- `/multiplier` auto-filters variations by attention quality before delivering
- `/rebuild` validates rebuild matches original's attention pattern
- `automaitions` runs Workflow A automatically after build; includes heatmaps in the audit report
- `/copy` validates text overlay placement

Requires: Jay's API spec + auth credentials + per-skill integration code. Quota management becomes important (each production batch = 40+ heatmaps).

When ready to build this, ping Jay for the API spec and add a `references/kong-integration-notes.md`-style file (`references/attention-ai-api-notes.md`) documenting the integration points.

---

## What it doesn't do

- **Won't measure actual conversion rate.** Attention is the proxy — it predicts where eyes go, not what people click. Use as a leading indicator, validate with real spend data.
- **Won't work on skyscraper banners** or extreme long-thin formats. Square/rectangular only.
- **Won't catch JavaScript-rendering edge cases** without the wait-time setting configured properly.
- **Won't replace strategic judgment.** A page can have perfect attention flow to a weak offer — and still lose. Attention AI validates execution; CA validates strategy.

---

## The one-liner

**Strong heatmap on the right thing = ship it. Weak heatmap or shotgun attention = fix it. Run every production skill's output through this gate before spending money on it.**
