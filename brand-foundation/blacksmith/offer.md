# BLACKSMITH BARBERS — Offer Architecture

**Business type:** Service (barbershop — chair-rental model, 14 operators)
**Last updated:** 2026-06-02

---

## Primary Offer: Blacksmith Circle (Membership)

This is a SERVICE business. The offer architecture is application/qualification → high-touch close (Jett calls top candidates personally), NOT self-serve purchase.

### Value Ladder

```
FREE: Walk-in / app booking (standard experience)
  ↓
THE CUT — $59/mo: 1 locked slot, priority booking, lounge access
  ↓
THE CLUB — $129/mo: 2 locked slots, members-only hours, store credit engine, Blackrose discount
  ↓
THE EMPIRE — $249/mo: 3 locked slots, Members Wall, monthly merch, events, gifting, partner network
```

### Founding Rates (scarcity-locked)

| Tier | Founding Price | Founding Slots | Annual Lock |
|------|---------------|----------------|-------------|
| The Cut | $69/mo (12mo lock) | First 100 | — |
| The Club | $129/mo (12mo lock) | First 75 | $1,499/yr (saves $289) |
| The Empire | $229/mo (24mo lifetime lock) | First 30 | $2,490/yr (saves $498) |

### Bolt-On Modifiers (not identity tiers)

- **Traveler Add-On** — $199/mo (Founding: $150/12mo, first 30): No included cuts. 30-40% member discount pay-per-visit, concierge booking, 25% off airport transfers, quarterly events.
- **Mobile Add-On** — $29/mo (Phase 7+): For mobile-only service clients.

---

## Secondary Offer: Standard Booking (non-member)

Walk-in or app booking via SLIKR. Standard pricing, no locked slot, no priority. This is the baseline experience that Circle improves upon.

Services: Men's Haircut, Razor Fades, Beard Trim, Face Shave, Hot Towel Shave, Head Shave, Hair Art, Student/Pensioner cuts.

---

## Tertiary Offers

| Arm | Offer | CTA |
|-----|-------|-----|
| Blackrose Salon | Precision colour + styling (Sammi) | Book via SLIKR |
| Blacksmith Academy | Real-chair barber training (Cam + Justin, 30yr combined) | Enquiry form |

---

## Offer Stack (what makes Circle a no-brainer)

The Circle offer is NOT "discounted haircuts." It's an identity + access stack:

1. **Locked recurring slot** — your barber, your time, guaranteed
2. **Priority booking** — 21-day window (non-members get less)
3. **Back room lounge** — physical space that's yours, not the waiting area
4. **First cut by new barber = free** — zero risk trying someone new
5. **Founding number + badge** — status, scarcity, permanence
6. **Members Wall** (Empire) — name displayed permanently in-shop
7. **Monthly merch drop** (Empire) — new tee every month
8. **Cut gifting** (Empire) — share unused cuts with mates
9. **Members-only events** — dinners, golf days, UFC watch parties
10. **Partner network** — Recov, Schnitz, Oporto, Stick It

**The reframe:** "You're not paying for haircuts. You're locking in your chair."

---

## Closing Mechanism

**Phase 0 (current):** Jett personally calls top 47 Empire-prime candidates.
- Goal: 8+ verbal commits → proceed to Phase 1 technical build
- 4-7 commits = redesign offer
- <4 commits = kill program

**Phase 1+:** Stripe + Supabase + Next.js + Klaviyo + SLIKR integration

This is human-closed, not page-closed. The call is the conversion event. The site/landing page builds desire and pre-qualifies; the call closes.

---

## Churn Prevention (baked into offer design)

| Dimension | Walk-in model | Circle model |
|-----------|--------------|--------------|
| Switching cost | Zero | Lose founding number, wall placement, locked rate, lounge |
| Churn trigger | "Found a closer shop" | "Am I willing to lose my slot?" |
| Identity | Customer | Member / Founder |
| Physical proof | Receipt | Name on wall, founding badge, monthly tee |
