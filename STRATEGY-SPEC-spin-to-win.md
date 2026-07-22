# STRATEGY-SPEC — Blacksmith Barbers · Spin-to-Win (first-visit capture)

**Asset:** `site/spin-to-win.html` → https://blacksmith-site-chi.vercel.app/site/spin-to-win.html
**Date:** 2026-07-16 · **Owner:** Beatrice (for Beau) · **Status:** preview on the STAGING project (not live blacksmithbarbers.com.au)
**Grounded in:** `02-projects/blacksmith-brand.md` + live site palette + brand rule "avoid cheap-cut / discount framing".

## Objective
Turn new / cold traffic into **captured leads (name + mobile)** for the 15K-row client DB, and route them into a first booking. Primary metric: new-client capture rate; secondary: first-visit booking conversion. Feeds the SMS/email reactivation + Circle-membership funnel.

## The brand-critical decision
Blacksmith brand explicitly **avoids discount framing** — it undercuts barber take-home and the membership upgrade path. So the wheel does **not** discount cuts. Prizes are **value-add perks** (free beard trim, hot-towel finish, styling product, neck line-up, priority booking) — low cost, premium feel, gets a client through the door without cheapening the core service. One modest money offer ($15 off first visit) is the only price lever; jackpot is a rare free cut.

## Capture, not just email
DB is 95% phone. Form captures **first name + mobile** (email not required) with an explicit **Spam Act 2003** consent line ("we'll text your perk + booking link… reply STOP anytime"). SMS is their real channel — this is the compliant, on-DB way to capture. One spin per new client, 14-day validity.

## Prize table (weighted)
| Prize | Code | Weight | Cost logic |
|---|---|---|---|
| Free beard trim | BSBEARD | 22 | Low-cost add-on, high perceived value |
| Free hot-towel finish | BSTOWEL | 20 | Near-zero cost, premium feel |
| Free styling product | BSPRODUCT | 14 | Take-home sample → upsell path |
| $15 off first visit | BSWELCOME15 | 16 | Only price lever; capped $ not % |
| Free neck line-up | BSLINEUP | 13 | Trivial cost |
| Priority booking | BSPRIORITY | 8 | Zero cost, real value at peak |
| Free cut | BSFREECUT | 3 | Rare jackpot — reason to spin |
| NEXT TIME | — | 4 | Authenticity; softened with "you're on the list" |

Weighted so the shop rarely gives a cut away, most wins are near-zero-cost perks, and no outcome trains customers to expect a discounted cut.

## Brand execution (from live site)
Black (`#0b0b0d`/`#141417`) + brass (`#c8a44d`/`#e3c578`); Oswald condensed display + Inter body. Blackletter **Blacksmith** wordmark (`logo-topbar.png`) + **B+scissors emblem** (`bs-logo.png`) as the wheel hub. Voice: confident, craft-trade — "Spin the chair", "on the house", "that's yours". No gym-tier or cheap-cut language.

## Scope boundary (NOT live yet)
Codes are display placeholders; no SMS send, no DB write, no one-spin enforcement; deployed to the **staging** project only. Live requires: (1) capture → client DB + compliant SMS perk send, (2) real redeemable codes / POS notes per perk, (3) dedupe by mobile, (4) trigger + embed on the live site, (5) confirm live-deploy target is the `blacksmith` project, NOT staging (see memory [[blacksmith-deploy-target]]).
