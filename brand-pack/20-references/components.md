# Blacksmith — vetted component sources (pull FIRST, hand-roll LAST)

> For any non-trivial section, source from here then reskin to `brand.yaml` tokens.
> Brand foundation overrides any component's default styling on conflict.

| Section type | Source | Notes |
|---|---|---|
| Hero (site/arm pages) | our shipped `site/index.html` hero pattern + 21st.dev via `magic` MCP | full-bleed real shop photo (TLB series), Oswald uppercase, gold+ghost CTA pair |
| Services triptych | shipped `site/index.html` three-card grid | Barbering / Blackrose / Academy — photo + eyebrow + headline + link, hover reveal |
| Walk-in vs Member table | hand-roll per `site-strategy.md` §6 | stripped 4-row contrast table; this IS the mechanism visual |
| Circle tier cards | 21st.dev pricing, heavily reskinned | identity-first not price-first: "Your name on the wall." above $249. "The" prefix always |
| Testimonial / proof band | 21st.dev testimonial | ONLY real review phrases from voc.md + real barber names; 4.7/202 · 94%/258 |
| Gallery grid | shipped `site/index.html` gallery | real photos, subtle desaturation, hover full colour — no copy needed |
| Book a Cut CTA | shipped pattern: gold `.btn-gold` → `#book` (in-site chat) | hero + nav on every page; sticky bottom bar REMOVED site-wide (Beau 2026-07-07) — do not re-add |
| In-site chat / live-wait card | shipped `site/assets/shop-chat.js` + `live-wait.js` | the booking path; copy per D4 voice spec, word-for-word parity with the Telegram bot |
| Accordion (FAQ / fine print) | 21st.dev accordion | contractor-model wording, Circle terms, founding-rate lock terms live here |
| Lead/qualify form (D2) | hand-roll per /landing-page skill | pre-qualifies for the CALL (name, mobile, current barber, visits/month); Playwright submit-test required |
| Poster/print layouts (D3) | pdf-composer skill | A-series + in-shop sizes; logo-black.png on light stock |
| Bot reply templates (D4) | hand-roll per directions.md D4 voice spec | every reply: real feed data (SLIKR backend) + next physical action; never say "SLIKR" to a customer |
| Stitch (stitch.withgoogle.com) | section-by-section reference boards | layout ideation when a direction feels stale, not for code |

Logo: `mcp logo_search` is for OTHER brands in comparisons; Blacksmith's own marks are
always the real files in `assets/` (`logo-white.png` dark / `logo-black.png` light,
Blackrose mark for salon surfaces).
