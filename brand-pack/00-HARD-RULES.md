# Blacksmith Barbers — HARD RULES (non-negotiable, every asset)

> The human layer of `brand.yaml`. Every rule is tagged **[MACHINE]** (checked by
> `40-gates/verify.sh`) or **[JUDGE]** (blind checker must eyeball it). If a rule here
> conflicts with anything downstream, this file wins. Full strategy context lives in
> `../brand-foundation/blacksmith/` — this file is only the tripwires.

## Logo [MACHINE + JUDGE]
- Use the real files only: `assets/logo-white.png` (dark surfaces — the default),
  `assets/logo-black.png` (light surfaces / print on light stock).
- **Never typeset "Blacksmith" (or Blackrose / Circle / Academy) in a font as a logo
  substitute.** Scotland is the wordmark FONT inside the real mark, not a licence to
  retype the name. [JUDGE]
- Blackrose surfaces use the real Blackrose mark (`site/assets/blackrose-clean-black.png`).

## Colour + type [MACHINE]
- Hex whitelist = `brand.yaml color:` block. Any other hex in CSS tokens = fail.
- **Dark mode is the brand.** Near-black ink (`#0b0b0d` / `#0d0d0f`) canvas, gold
  `#c8a44d` accents. Sole shipped exception: the Blackrose Salon arm's light theme
  (off-white `#f7f2ec` + dusty rose) — Blackrose pages ONLY, never Barbers/Circle. [JUDGE]
- **Gold discipline:** `#c8a44d` / `#e6c879` are ACCENTS — CTAs, eyebrows, keylines,
  highlights. Never a section background, never body-copy colour, never large fills.
  If a section reads "gold page", it failed. [JUDGE; verify.sh warns on heavy use]
- CTA button text on gold = `#1a1407` (dark warm brown), not pure black.
- Fonts: **Oswald** (display, uppercase big headlines) + **Inter** (body/UI) +
  **Scotland** (@font-face, wordmark treatments only — illegible at body sizes).
  Cormorant Garamond / Playfair Display / EB Garamond were unapproved old guesses:
  any serif = fail. (Locked by Jett 2026-06-02, brand-dna.md.)

## Voice — the shop talks like a place you belong to [MACHINE where greppable, else JUDGE]
- **No em-dashes ("—") in new customer-facing copy.** Rewrite the sentence instead.
  Legacy shipped pages will flag; rewrite on next touch, never add new ones. [MACHINE]
- No AI-tells: unlock, elevate your, seamless, game-changer. [MACHINE]
- No discount/coupon framing: "save $X", "deal", "value pack", "cheap cuts",
  "get X cuts for only $Y". Lead with belonging, access, identity — never savings.
  [MACHINE for the greppable strings, JUDGE for framing]
- No "unlimited" — nothing is unlimited; specificity = trust. ("Not unlimited" as a
  contrast line is fine — the gate is negation-aware.) [MACHINE]
- No gym-tier language ("tier 1 / premium tier"). Tiers are **The Cut, The Club,
  The Empire** — always with "The". [MACHINE + JUDGE]
- Craft-trade register: barber, chair, cut — never "hair services" or "grooming
  solutions". [MACHINE]
- Short sentences. Second person. Physical language (chair, room, wall, number, name).
  No exclamation marks. No hype. Confidence is quiet. [JUDGE]
- No fake urgency: countdowns, "only 3 left", scarcity bars. Founding-slot scarcity
  (first 30/75/100) is REAL and allowed — stated plainly, numbers from offer.md. [MACHINE]

## Honest proof only [JUDGE]
- Real reviews only: Google 4.7 (202) · Facebook 94% (258) · App Store 4.5. Real barber
  names only (Locky B, Zayn, Lachlan, Korey, Justin, Cam). **Never invent reviews,
  quotes, barbers, stats, or member counts.**
- Prices: Circle tiers verbatim from `../brand-foundation/blacksmith/offer.md`
  ($59 / $129 / $249, founding $69 / $129 / $229). Service prices pulled live from
  the SLIKR feed (backend) before quoting — never invented, never stale.
- Barber display names as currently shipped: **"Sami"**, never "Sammi" (Beau,
  2026-07-06). Asset filenames (sammi.jpg) are exempt. [MACHINE]
- No outcome guarantees ("best haircut in GC") — AU consumer law.
- Never imply the 14 operators are employees (they're chair-rental contractors).
- Never badmouth a competitor by name — contrast the MODEL (walk-in vs membership).

## Imagery [JUDGE]
- Real shop photography first (the TLB_*.jpg professional shoot, real barbers, the real
  room). Moody dark editorial, gold warmth. Real logo composited after, never generated.
- Banned: stock-barber clichés (spinning pole hero, hipster-beard-oil flat-lays,
  generic tattooed-barber stock models), AI stand-in "shops", fake customers.
  If it could be any barbershop on Shutterstock, it failed.

## Structure [JUDGE]
- Site pages follow the selling sequence in
  `../brand-foundation/blacksmith/site-strategy.md` — every section has a job;
  never a flat brochure.
- **Never reuse the structural skeleton of the previous build** — pre-plan must cite
  `20-references/build-log.md` and pick a different direction.
- Every page keeps the immediate-action path: "Book a Cut" → `#book` (the in-site
  chat booking flow) reachable from hero + nav. Booking is in-chat + Telegram
  wait-bot; **SLIKR is backend-only — never a customer-facing link or name**
  (Beau removed all SLIKR links site-wide, 2026-07-06). [MACHINE for the string]
- The sticky bottom Book-a-Cut bar was **removed site-wide** (Beau 2026-07-07) —
  do not re-add it on any page. [JUDGE]
