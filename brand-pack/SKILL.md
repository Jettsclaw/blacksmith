---
name: blacksmith-brand-pack
description: The gated flow for generating ANY Blacksmith Barbers asset (site page, Circle membership page/PDF, in-shop poster, booking-bot copy, social, email). Use whenever building anything customer-facing for Blacksmith. Enforces pre-plan → build → verify; no pre-plan file = no build.
---

# Blacksmith Brand Pack — the gated flow

Three steps, in order, no skipping. This pack ROUTES — it never duplicates content.

## Layer map (read in this order)
1. `00-HARD-RULES.md` + `brand.yaml` — non-negotiables, machine tokens.
2. `../brand-foundation/blacksmith/` — the strategy layer, inherited **verbatim, never
   paraphrased**: `voc.md` (real customer language, 202 Google + 258 FB reviews) ·
   `brand-dna.md` (locked fonts/palette/voice/ALWAYS-NEVER) · `mechanism.md` ("your
   chair, not a queue number") · `offer.md` (Circle ladder + founding rates) ·
   `competitor-spy.md` (the open lane) · `customer-matrix.md` (5 types × angles — the grid) ·
   `site-strategy.md` (the locked 8-section selling sequence for site pages).
   Also honour the repo root `BRAND-CONTEXT.md` and `CLAUDE.md` build contract.
3. `20-references/` — structural directions + vetted components. Anti-generic layer.
4. `30-imagegen/recipes.md` — image generation, real assets only.
5. `40-gates/` — pre-plan template + verify gate.

## Step 1 — PRE-PLAN (mandatory, written artifact)

Copy `40-gates/preplan-template.md` → `40-gates/preplans/preplan-<asset>-<YYYY-MM-DD>.md`
and fill every field. **The build step refuses to start without this file.** Key fields:
customer-matrix cell + awareness level, hook in VOC language, offer path (Book a Cut /
Join the Circle / Enquire) + tier if Circle, structural direction chosen from
`20-references/directions.md` **with `build-log.md` cited proving it differs from the
last build**, image plan (which real photos), and the 3 hard rules most at risk.

For ads: the pre-plan's metadata block (`brand / matrix_cell / awareness / hook /
search_intent`) is saved as a sidecar JSON next to the creative and encoded in the ad
name (e.g. `blacksmith_vip-empire_most-aware_name-on-the-wall_v1`).

## Step 2 — BUILD

- Foundation language verbatim (VOC phrases, mechanism lines, tier names with "The").
- Site pages follow the section jobs in `site-strategy.md`; components from
  `20-references/components.md` first, hand-rolled last, reskinned to `brand.yaml` tokens.
- Images via `30-imagegen/recipes.md`; real shop photos + `assets/logo-*.png` only.
- Circle sales pages additionally run the global `/landing-page` anatomy stack
  (headline = identity outcome, qualify don't self-serve-close Empire, exactly one CTA)
  — remember the Circle close is HUMAN (the call), the page pre-qualifies.
- Bot copy runs direction D4's conversational rules — same voice gate as pages.
- Design craft: refero direction → taste-skill anti-slop pre-flight; brand wins on
  conflict (the standing design pipeline).

## Step 3 — VERIFY (both halves required, then log)

1. **Machine gate:** `bash 40-gates/verify.sh <file.html> [<file2> ...]` — banned
   strings (incl. em-dash in copy), hex whitelist, font whitelist, gold discipline,
   logo-as-file. Any FAIL = loop back to build; never ship on a failing gate.
   (Bot copy / poster text: run the gate on the text file — string checks still apply.)
2. **Blind judge:** a separate agent gets ONLY the artifact + `00-HARD-RULES.md` +
   the pre-plan, instructed to find where it breaks brand or won't convert. Never
   grade your own homework.
3. Append one line to `20-references/build-log.md`: date · asset · direction used · URL.
