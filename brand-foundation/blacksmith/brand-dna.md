## ✅ FONTS — LOCKED (Jett approved 2026-06-02) — USE VERBATIM, DO NOT GUESS
- **Wordmark / logo only:** Scotland (blackletter, @font-face) — never body text.
- **Headlines / display:** **Oswald** (Google Fonts; weights 500/700; uppercase for big headlines, letter-spacing ~0.01em).
- **Body / paragraphs / UI:** **Inter** (Google Fonts; 400/600).
- Palette (locked): bg #0b0b0d / #121214, gold #c8a44d (accent), warm gold #e6c879, body grey #c9c9d0.
- This supersedes any earlier "TBD/blocker" note below. The headline serif question is RESOLVED → Oswald.

---

# BLACKSMITH BARBERS — Brand DNA (Locked Foundation)

**Status:** Partial lock — colours, display font, voice, and rules confirmed from real brand assets. Web companion fonts (headline serif + body sans) NOT YET LOCKED by Jett.
**Source:** ~/Desktop/BLACKSMITH BARBERS - Airdrop/ (scotland.otf, SVG logos, merch mockups, Circle promo suite), ~/Documents/brain/02-projects/blacksmith-brand.md, blacksmith-circle-identity-tiers.md, Circle launch copy.
**Last updated:** 2026-06-02

---

## Typography

### Display / Logo Font — LOCKED
- **Scotland** (Regular) — custom blackletter/gothic typeface
- Source file: `~/Desktop/BLACKSMITH BARBERS - Airdrop/scotland.otf` (Fontself Maker 3.0.2, v1.004)
- Usage: logo wordmark ("black smith" stacked), merch prints (Heavy Tees line), brand marks
- Characteristics: angular blackletter, distressed texture, aggressive stacked layout
- On web: load as @font-face for logo/wordmark ONLY — not body text (illegible at small sizes)

### Headline Serif — NOT LOCKED
- **Jett has not signed off on a headline serif.** Brand doc says "TBD by Jett."
- Previous builds guessed Playfair Display (FINAL.html) and Cormorant Garamond (v5.html) — neither approved
- Circle promo suite (blacksmith-circle-promos/) uses a Didone-style serif for headlines ("The Cut. The Club. The Empire.") but this was AI-generated, not Jett-specified
- **BLOCKER: Jett must pick the headline serif before the site build proceeds.** Recommendation: show him 3 options (e.g. Playfair Display, Cormorant Garamond, EB Garamond) against the Scotland wordmark and gold palette, let him pick.

### Body Sans — NOT LOCKED
- **Jett has not signed off on a body sans.** Brand doc says "TBD by Jett."
- All builds have used Inter — it works well and is a safe default, but it is not confirmed
- **BLOCKER: Jett should confirm or change the body sans alongside the serif decision.**

---

## Colour Palette — LOCKED

Confirmed consistent across all builds (CSS, HTML v1-v5, FINAL, Circle promo suite):

| Token       | Hex       | Usage                                    |
|-------------|-----------|------------------------------------------|
| `--ink`     | `#0b0b0d` | Primary background (near-black)          |
| `--panel`   | `#121214` | Card/section background                  |
| `--line`    | `#23232a` | Borders, dividers                        |
| `--paper`   | `#f5f3ee` | Primary text (warm off-white)            |
| `--muted`   | `#9a9aa2` | Secondary text, captions                 |
| `--gold`    | `#c8a44d` | Primary accent — CTAs, eyebrows, highlights |
| `--gold-2`  | `#e6c879` | Hover/secondary gold                     |

**Dark-mode only.** No light mode. The brand is built on a dark, moody barbershop-interior aesthetic. Gold on black is the signature look.

Additional context colours from builds:
- CTA button text on gold: `#1a1407` (dark warm brown, not pure black)
- Body text secondary: `#c9c9d0` / `#d2d2d8` (cool greys for paragraphs)
- Ghost button border: `rgba(255,255,255,.35)` with gold hover

---

## Voice — LOCKED (from brand doc + Circle identity doc)

**Tone:** Confident, no-bullshit, masculine-without-being-bro. Slightly old-school craft-trade. The shop talks like a place you belong to, not a brand trying to sell you something.

**Reading level:** Plain English. Audience = working men, GC locals, professional clients. Don't over-write.

**Signature phrases / lines (from Circle identity doc):**
- "The club, not the coupon."
- "Your chair. Your barber. Every time."
- "Your chair. Your room. Your number."
- "You're not a ticket number. You're a member."
- Tier names always with "The" prefix: The Cut, The Club, The Empire

**Voice characteristics:**
- Short sentences. Lead with the statement, not the qualifier.
- Second person direct ("You've done the walk-in thing.")
- Physical language — chair, room, wall, number, name. Tangible, not abstract.
- Contrast framing — walk-in vs member, coupon vs club, stranger vs your barber
- No exclamation marks. No hype. Confidence is quiet.

---

## Always / Never Rules

### ALWAYS
- Lead with belonging, access, and identity — never with savings or discounts
- Use tier names with "The" prefix (The Cut, The Club, The Empire)
- Reference the physical space: the chair, the room, the wall, the lounge
- Dark mode, gold accents — the brand lives in this palette
- Scotland font for logo/wordmark treatments
- Speak to the customer as someone who already comes here and deserves better
- Maintain the "craft-trade" register — barber, chair, cut, not "hair services" or "grooming solutions"

### NEVER
- Gym-tier language ("tier 1 / tier 2 / premium tier")
- Discount/coupon framing ("save $X", "deal", "value pack", "get X cuts for only $Y")
- "Unlimited" — nothing is unlimited, specificity = trust
- "Cheap cuts" or anything that undercuts premium positioning
- Light/white backgrounds (dark mode only)
- Imply staff are employees (they're chair-rental contractors)
- "Best haircut in GC" or outcome guarantees (AU consumer law)
- Generic serif fonts without Jett's approval — Scotland is the brand font, the rest must be confirmed
- Badmouth competitors by name — contrast the MODEL (walk-in vs membership), never a specific shop

---

## Brand Architecture

| Arm            | What it is                                    | CTA destination        |
|----------------|-----------------------------------------------|------------------------|
| Blacksmith Barbers | Chair-rental premium barbershop, 14 operators | SLIKR app (book a cut) |
| Blacksmith Circle  | 3-tier paid membership (The Cut/Club/Empire)  | Circle signup page     |
| Blackrose Salon    | Partner salon (Sammi), precision colour        | SLIKR / booking        |
| Blacksmith Academy | Barber training, real chairs + real clients    | Enquiry form           |

**Location:** Biggera Waters, Gold Coast. Est. 2015. One minute from Harbour Town.

---

## Asset Inventory

- **Logo SVGs:** ~/Desktop/BLACKSMITH BARBERS - Airdrop/Svg Designs Final/ (Black-smith.svg, Black-smith-barbers.svg, Black-smith-barbers-club.svg, Black-smith-barbers-cross.svg, Black-smith-circle.svg)
- **Scotland font:** ~/Desktop/BLACKSMITH BARBERS - Airdrop/scotland.otf
- **Merch mockups:** ~/Desktop/BLACKSMITH BARBERS - Airdrop/Mock-ups/Blacksmith (HEAVY TEES)/ (108 mockup renders)
- **Circle promo suite:** ~/Desktop/blacksmith-circle-promos/ (6 images: wall, chair, coupon, tuesday, three-ways, founding)
- **Shop photography:** Referenced in HTML builds as TLB_*.jpg series (professional shoot)
