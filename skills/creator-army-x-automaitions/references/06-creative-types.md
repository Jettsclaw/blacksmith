# 12 Types of Creative

Every ad falls into one of these 12 formats. When building creative volume,
cycle through ALL 12 types rather than making 12 versions of the same type.
Diversity of format matters as much as diversity of message.

Meta's Andromeda system groups similar creatives together. If all your ads
look the same, Meta treats them as one ad. You need genuine visual and
structural diversity.

## The 12 Types

### 1. UGC (User-Generated Content)
Customer or creator talking directly to camera about the product.
Raw, unpolished, shot on phone. The gold standard for social ads.
**When to use:** Always. This should be 40-50% of your creative mix.

### 2. Founder Story
The founder explains why they built the product. Personal, authentic,
shows the real human behind the brand.
**When to use:** Trust-building, early-stage brands, premium products.

### 3. Problem/Solution
Opens with the problem, transitions to the solution. Classic direct
response structure compressed into short-form.
**When to use:** When the audience is problem-aware but solution-unaware.

### 4. Before/After
Visual transformation. The most powerful proof format when used
honestly with real results.
**When to use:** Any product with visible results (skincare, fitness, home).

### 5. Comparison / VS
Side-by-side comparison with a competitor or alternative. Shows
superiority through direct contrast.
**When to use:** Crowded markets where differentiation matters.

### 6. Unboxing
First-time product experience. The anticipation, reveal, and reaction.
Works because it mirrors the buyer's future experience.
**When to use:** Premium packaging, gifting seasons, new product launches.

### 7. Tutorial / How-To
Shows how to use the product. Educational content that doubles as an ad.
**When to use:** Complex products, new categories, products with non-obvious uses.

### 8. Testimonial Compilation
Multiple customers sharing their experience in quick cuts. Volume of
social proof in compressed time.
**When to use:** When you have 10+ genuine customer testimonials.

### 9. Expert Endorsement
Doctor, specialist, or industry expert validates the product.
Borrows credibility from a trusted authority.
**When to use:** Health, wellness, technical products. Any regulated category.

### 10. Behind the Scenes
Factory tour, ingredient sourcing, team at work. Shows the craft
and care behind the product.
**When to use:** Premium brands, handmade products, transparency plays.

### 11. Reaction / Review
Genuine first-time reaction to trying the product. Must be REAL —
audiences detect faked reactions instantly.
**When to use:** Products with a strong sensory or surprise element.

### 12. Lifestyle / Aspirational
Product integrated into a desirable lifestyle. Not a product demo —
an identity statement. "This is the kind of person who uses this."
**When to use:** Fashion, luxury, lifestyle brands. Identity-driven purchase.

### 13. Two-Frame Product Reveal (start → end)
Two product photos — a start frame and an end frame of the SAME
product with the SAME camera angle, lighting, and background.
Kling 3.0 (or Seedance with start/end frame preset) generates the
7-second motion between them: suitcase packs itself, perfume
assembles, components snap into place, bottle fills, label
applies. Either runs as a paid social video OR — more powerfully —
embeds as a **scroll-scrubbed hero** on the landing page where
the user's scroll wheel drives `video.currentTime` and the
product visibly transforms as they scroll.
**When to use:** Products with a clean visual BEFORE → AFTER
transformation (DTC physical goods, packaging-led brands, premium
e-commerce, hero landing-page moments). NOT for services, SaaS,
or anything abstract — the transformation must be visually crisp.

### 13a. Abstract Motion Decoration (purpose-built loop / companion asset)

A **sub-variant of the two-frame technique** for when the asset
isn't a product reveal but a piece of motion DECORATION — a floating
blob companion, an atmospheric background loop, a scroll-tied parallax
element, ambient texture. Same technique (start frame → end frame
→ 7s video) but the subject is abstract energy / shape / form
rather than a product. (Lesson §10: brand-identity videos and
motion-decoration assets are different jobs — never re-use the
former as the latter.)

**Worked example — the automaitions floating-blob companion:**

Start frame prompt (Nano Banana Pro 1024×1024, square 1:1):
```text
Abstract glowing organic blob floating in a deep black void, soft
fluid amorphous form, indigo-violet-purple gradient at the core
(#5B5BD6), warm coral orange highlights at the outer edges
(#E07856), ethereal volumetric smoke-and-light texture, painterly
soft edges fading into the black background, no hard outline,
cinematic depth. Completely abstract — no logo, no text, no
characters, no objects, no recognisable shapes. Pure abstract
energy form, symmetrical composition centred in frame, 4K, soft
volumetric lighting from within the blob, photorealistic with a
painterly quality, square 1:1 aspect.
```

End frame prompt (Nano Banana Pro, with start frame as reference):
```text
Same abstract glowing organic blob from the reference image,
same deep black void, same indigo-coral palette, same painterly
ethereal texture, same composition centred — but the blob has
slowly breathed and morphed into a slightly more diffuse,
expanded form. Internal swirl rotated ~30° clockwise. Coral
highlights distributed slightly differently around the perimeter.
Outer halo extends marginally wider. Everything else identical.
Still no logo, no text, no characters, no objects.
```

Video prompt (Seedance 2.0 or Kling 3.0 between the two frames):
```text
Locked-off camera, deep black void background, completely
unchanged. The abstract glowing organic blob in the centre slowly
and gently breathes — a fluid, ethereal morph from its starting
form to its expanded ending form. The indigo-violet core swirls
slowly clockwise. Warm coral highlights at the edges drift and
pulse softly. The outer halo expands and contracts in a calm
rhythm. No camera shake, no zoom, no parallax, no panning.
Lighting, colour temperature, and shadow direction remain
constant. Pure abstract energy form throughout — no logos, no
text, no characters, no objects appear at any point. Cinematic,
painterly, soft volumetric lighting from within. Slow, meditative,
atmospheric. Hold the final composition for the last 0.5 seconds.
```

**Asset prep rules (the discipline):**

1. **Negative-prompt the brand mark explicitly.** "No logo, no
   text, no infinity symbol, no characters, no objects." Without
   these, the model often drifts toward recognisable forms.
2. **Same palette as the brand identity assets** — indigo +
   coral here — so the decoration reads as part of the system
   without competing with logo moments.
3. **End frame must be CLOSE to start frame** for seamless
   looping. The smaller the delta, the cleaner the loop.
4. **Locked-off camera, no zoom, no parallax** — the asset will
   be CSS-transformed by the page (translated / scaled / rotated /
   masked) and any camera motion in the source fights that.
5. **Black void background** if the asset will composite over a
   dark page; **transparent or specific colour** if it needs a
   defined surround.
6. **Square 1:1 aspect** unless the asset has a specific orientation
   need — square clips cleanly to any mask shape (circle, blob,
   organic path).

**Implementation pairings** (where the asset is used):

- **Floating companion** with section-anchored IntersectionObserver
  waypoints (see `17-automaitions-handoff.md` § "Floating companion
  archetype" — to be written)
- **Scroll-scrubbed background** (see `17-automaitions-handoff.md`
  § Tier 3 archetype: scroll-scrubbed video hero — same technique,
  abstract subject)
- **Atmospheric loop** as a fixed-position background layer with
  no scroll interaction, just `<video autoplay muted loop>`

**Never use this for:** brand identity moments (use the identity
video instead), product reveal (use type 13), or anywhere the
asset's recognisability matters.

## The Frankenstein Method

When you have performance data, combine winning ELEMENTS across ad types:

1. Find the ad with the best hook (highest 3-second view rate)
2. Find the ad with the best body (highest hold rate)
3. Find the ad with the best CTA (highest click-through rate)
4. Combine: Best hook + best body + best CTA = new variant

**Critical rule:** Each Frankenstein variant must be VISUALLY DISTINCT.
Meta penalizes near-duplicate creatives. The combined ad needs to look
and feel like its own piece of content, not a splice job.

## Creative Volume Requirements

- **Minimum viable:** 8 creatives per ad set
- **Recommended:** 15-20 creatives per ad set
- **Refresh rate:** Add 3-5 new creatives per week
- **Kill rate:** Remove bottom performers weekly
- **Diversity check:** No more than 3 ads of the same TYPE in one ad set

## Naming Convention for Organization

Use a consistent naming system so you can analyze what works:
```
[Brand]_[CreativeType]_[Hook]_[Date]_[Version]
```
Example: `PureU_UGC_FailedSolution_260401_v1`

This lets you filter by creative type and hook type to find patterns.

---

## Creative type → production skill mapping

Each of the 12 creative types maps to one or more production skills in the
AI Ad Lab suite. Use this table to route the strategic brief to the right
tool.

| # | Creative Type | Best production skill(s) | Notes |
|---|---|---|---|
| 1 | UGC | `/ugc` → `/ugc-video` | Talking-head AI UGC. 3 scripts per run, 3 hooks each. |
| 2 | Founder Story | `/seedance-brand-story` or `/ugc` Format 4 | Cinematic for premium brand; UGC for accessible/authentic |
| 3 | Problem/Solution | `/create-static-ads` (template #15-style) or `/ugc` Format 1 (DR) | DR script is the default for short-form video |
| 4 | Before/After | `/create-static-ads` template #8 (UGC native) or `/seedance-ecommerce-ad` | Beauty/fitness/home transformation |
| 5 | Comparison / VS | `/create-static-ads` template #7 (Us vs Them) | Side-by-side static is the canonical form |
| 6 | Unboxing | `/seedance-ecommerce-ad` or live-shot via `07-lo-fi-production.md` | Premium packaging brands |
| 7 | Tutorial / How-To | `/ugc` Format 1 or `/seedance-motion-design-ad` | Educational content |
| 8 | Testimonial Compilation | `/create-static-ads` template #11 (Pull-Quote Review Card) for static; manually edited UGC for video | Volume of social proof |
| 9 | Expert Endorsement | `/ugc` Format 3 (Expert Commentary) | Health/wellness/technical |
| 10 | Behind the Scenes | `/seedance-brand-story` or `07-lo-fi-production.md` | Factory tour, sourcing, team |
| 11 | Reaction / Review | `/ugc` Format 5 (Review) | Must be genuine — audiences detect faked reactions |
| 12 | Lifestyle / Aspirational | `/seedance-fashion-lookbook` or `/seedance-cinematic` | Identity-driven purchase |
| 13 | Two-Frame Product Reveal | `/seedance-ecommerce-ad` or `/seedance-product-360` (whichever supports start+end frame), OR Kling 3.0 via Higgsfield MCP | Paired with `automaitions-html-builder` scroll-scrubbed video archetype (see `17-automaitions-handoff.md` § Tier 3 archetype) for landing-page hero |

### Two-frame video — the prompt template

For type 13 specifically. Hand to Claude with the two product photos attached; it returns a finished prompt ready for Kling 3.0 / Seedance / Higgsfield:

```text
I'm attaching two photos of a product — a start frame and an end
frame of the exact same product — that I want to animate into a
short video. Below is a prompt template with bracketed placeholders.
Fill in the placeholders based on what you see in the two images.
Keep the structure exactly as written. Return only the finished
prompt, ready to paste into a video tool.

Product Link: [URL]

TEMPLATE:
Locked-off camera, clean [BACKGROUND] background throughout. The
[PRODUCT] is [STARTING STATE]. [CONTENTS] drop in from above with
natural weight and settle into place. As the items come to rest,
[FINAL MOTION]. The background remains [BACKGROUND] and unchanged
for the entire shot. Lighting, color temperature, and shadow
direction remain constant. No camera shake, zoom, or parallax.
Hold the final composition for the last 0.5 seconds.
```

**Photo prep rules (before generation):**

1. **Same camera angle in both** — same distance, same lens, same tripod position
2. **Same lighting** — same time of day, same softbox / window, no shadow shift between frames
3. **Same background** — solid colour OR identical environment; no parallax change
4. **Match the photos to the desired motion** — if you want things to drop in, the start frame should be empty and the end frame full; if you want assembly, start with components scattered and end with the assembled state

**Output settings (Higgsfield/Kling 3.0 — fallback Kling 2.5 Turbo):**

- **Model:** Kling 3.0 (or 2.5 Turbo if 3.0 unavailable)
- **Preset:** General (the preset that exposes start + end frame inputs)
- **Duration:** 7s
- **Output:** download MP4, then encode WebM via Squoosh / FFmpeg for the dual-format landing-page embed

**Plus the specialist seedance variants** (when the brand calls for them):
- `/seedance-3d-cgi` — high-budget CGI feel
- `/seedance-anime-action` — stylised action
- `/seedance-cartoon` — cartoon aesthetic
- `/seedance-comic-to-video` — comic book style
- `/seedance-fight-scenes` — action choreography
- `/seedance-food-beverage` — F&B sensory video
- `/seedance-music-video` — editorial / artist-driven
- `/seedance-product-360` — rotating product reveal
- `/seedance-real-estate` — RE walkthroughs
- `/seedance-social-hook` — 27 hook patterns for TikTok/Reels/Shorts

**Operational rule:** pick the creative type FIRST (this file), then route
to the production skill SECOND. Don't let production-skill availability
drive the creative choice — that's the tail wagging the dog.
