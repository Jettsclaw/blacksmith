# VERIFY-REPORT — Living Shop Phase 0 style bake-off (2026-06-11)

Independent adversarial verifier (separate agent, instructed to REFUTE "Phase 0
complete") reviewed the build prompt requirements, BRAND-CONTEXT.md, all four
generated frames, and a real shop photo (TLB_3394.jpg) for mood comparison.

## Round 1 verdict: FAIL
1. **BLOCKER — Style A (styleA-pixel-2) had only TWO barbers mid-cut.** The
   apparent third was a mirror reflection, not a standing figure. Spec requires
   three barber+client pairs in both frames.
2. **BLOCKER (same root) — frames not the SAME scene.** A had 3 stations + an
   L-sectional; B had 4 stations + a single 3-seat chesterfield. Phase 0 needs
   apples-to-apples so the pick is decided on STYLE, not content.
3. Minor — ghost reflection in A's leftmost mirror (caped client reflected,
   chair empty).
4. PASS — sign text exact in both: "BLACKSMITH" + "~25 MIN WAIT · 3 WAITING",
   queue count matches sign, no gibberish text elsewhere.
5. PASS — style targets hit (A = premium hi-bit, not arcade; B = soft low-poly,
   no photorealism bleed).
6. PASS — brand mood matches the real shop photos (near-black, warm pools, dark
   timber, oxblood chesterfield; B even has the real roller-shutter door).
7. Nit — A's Hollywood-bulb mirrors are closer to brand voice than B's LED
   halos; both use cone pendants vs the shop's black domes (acceptable for a
   style frame, corrected in the Phase 2 faithful build).

## Fix applied
Regenerated Style A with explicit counts (4 stations, exactly 3 standing
barber+client pairs, 1 empty chair, single 3-seat chesterfield with 3 waiting,
black dome pendants).

## Round 2 re-check (zoom QA on crops): PASS
- `styleA-pixel-3.png` (new A finalist): 4 bulb-lit stations, THREE standing
  barbers actively cutting caped clients, 4th chair empty, 3 waiting on one
  chesterfield — now scene-matched to B. Sign verified pixel-perfect:
  "BLACKSMITH / ~25 MIN WAIT · 3 WAITING".
- Residual: faint figure in A-3's far-left mirror (minor, verifier-classified
  non-blocking; invisible at section display size). Logged for the Phase 2
  hand-built sprite pass, where reflections are ours to control.

## Finalists shipped to Jett
- **A:** `phase0/styleA-pixel-3.png` (hi-bit pixel)
- **B:** `phase0/styleB-3d-2.png` (soft low-poly 3D; in motion this style gets a
  slow camera drift — stated to Jett with the pick)
- Rejected: A-1/A-2 (count blocker), A-4 (only 2 pairs in frame), B-1 (weak
  sign placement, queue hidden behind couch back).

## Verifier's style note (passed to Jett, his call)
B was the stronger spec-correct frame pre-fix; A has more old-school-craft charm
and is closer to brand voice. With counts fixed, both are now fair candidates.

**GATE STATUS Phase 0: complete. Jett picked HI-BIT PIXEL (2026-06-11).**

---

# Phase 1 verify — data spine + live wait card (2026-06-11)

Second independent adversarial pass (separate agent, briefed to refute
"Phase 1 complete, correct, private, safe"). It audited the poller, publisher,
the LIVE public feed, the widget, the launchd job, and the production branch.

## Round 1 verdict: FAIL → all required fixes applied same session

1. **BLOCKER — wrong SLIKR status string.** Poller tested `processing`; SLIKR
   uses `in_progress`. Live feed said Bayli was free while he was mid-fade.
   **FIXED:** match `in_progress/processing/started`; verified live — feed now
   shows `cutting:true` during his actual 11:41–12:11 cut. Late-running queue
   members also now stay counted as "waiting" (start-slipped pendings).
2. **MAJOR — client staleness bypass.** On fetch failure the card froze on the
   last good number forever. **FIXED:** last snapshot is re-rendered on every
   tick so the stale check always fires; dead feed decays to "call for wait
   time". Verified in-browser.
3. **MAJOR — CDN reality.** raw.githubusercontent ignores `?t=` cache-busts
   (verified `x-cache: HIT` with random queries); worst-case payload age ≈
   6 min. **FIXED honestly:** stale cutoff widened to 8 min + spec amended
   (section 6) + documented swap path to Vercel KV (needs a token from Jett)
   to get true 60s freshness.
4. **MAJOR — null wait coerced to 0** ("~0 min wait" = the worst wrong number).
   **FIXED:** poller publishes null, widget renders null as "Call for wait
   time". Verified via test hook.
5. Minors fixed: PII guard now if/raise + regex incl. 04xx numbers (survives
   `python -O`); GitHub token moved off the command line (GIT_ASKPASS +
   credential-helper disabled — keychain was hijacking pushes as Jettsclaw);
   manual/holiday closure honoured via SLIKR `suspend` flag; stale docstring
   claim removed.
6. Accepted as-is: `is_open` still trusts weekly timings if SLIKR's suspend
   flag isn't used for ad-hoc closures (real fix = Phase 2 scene reading
   seats-all-closed as shut).

## Verified clean by the adversary (survived attack)
- **Privacy:** public payload = timestamp/open/hours/wait/counts/barber first
  names ONLY; SLIKR's client objects are never read; feed repo history is one
  rolling commit of one file; de-name config flag present. (Noted: SLIKR's own
  API serves client names+phones UNAUTHENTICATED — their hole, reported to
  Jett; our feed publishes none of it.)
- **Crash safety:** any poller exception publishes nothing (never wrong-but-
  fresh), failure counter + ntfy alerts at 10/60 consecutive misses.
- **Feature flag:** `origin/main` untouched, section `hidden` + JS no-op
  without `?livewait`; branch pushed (heartbeat-reset safe).
- **XSS/timezone/as_of parsing:** all hold (regex verified against the real
  published string).

## Post-fix state
Poller re-run end-to-end: snapshot coherent (`wait 22 · Bayli cutting · Jayden
free`), push green, launchd job healthy, JS syntax-checked, all three card
states re-verified in the browser at desktop + 390px.

**GATE STATUS Phase 1: built + adversarially verified. Remaining gate = Jett
confirms the live numbers against the room once, then `LIVE_WAIT_ON = true`.**

---

# Phase 1b verify — production port + deploy (2026-06-11)

The card was rebuilt onto the REAL production page (`site/index.html` on main —
the winston/site-v5 branch turned out to be a stale copy of the site) and
merged to main, feature-flagged off. Third independent adversarial pass
(separate agent, briefed to refute "safely deployed, invisible, nothing broke")
ran against the LIVE deployment.

## Verdict: PASS (6/6 checks, evidence-backed)
1. No-flag page: section `hidden` + JS early-return (two independent layers),
   title/hero/nav intact, nothing visibly changed for normal visitors.
2. Deployed JS confirmed the hardened version (flag off, 8-min stale, dead-feed
   decay, null-wait guard); flag verified purely client-side.
3. CSS block present exactly once (the grep-2 is base + media query).
4. Live feed schema exactly as spec'd, zero extra fields, zero PII, fresh.
5. Merge pushed (HEAD == origin/main), clean tree, diff = 347 insertions /
   0 deletions across exactly the 8 intended files — no production line
   modified or removed.
6. One section, one script tag, asset path resolves on the live deploy.

Live behind the flag: https://blacksmith-ten.vercel.app/site/?livewait=1
**Remaining gate: Jett confirms numbers vs the room → flip `LIVE_WAIT_ON`.**

---

# Phase 2 verify — the Living Shop scene (2026-06-11)

Fourth independent adversarial pass (separate agent; ran the scene in a real
headless browser, attacked the code, audited the deploy).

## Verdict: PASS-WITH-NOTES → blocker fixed same session
1. **BLOCKER — XSS via barber name in the tap-card** (`card.innerHTML` used raw
   feed names; verifier PROVED execution with an injected `<img onerror>` name).
   **FIXED:** names HTML-escaped + wait number coerced numeric; re-tested with
   the exact payload — renders as inert text, no execution.
2. Refuted (correct as built): DPR canvas/hit-area math at all DPRs; walk-in
   couch index edge at waiting 0→1.
3. Polish applied from findings: **~2s ease** for chair re-assignments (no
   teleporting sprites, per the build prompt) + subtle 1px idle bob for free
   barbers and bench clients (never looks frozen).
4. Accepted/minor: 60s feed poll continues when tab hidden (spec only requires
   render pause); pinch/drag peek not in V1; roster joins still re-seat
   remaining barbers (eased now, not teleported).
5. PASS: asset budget 495KB total (<2MB), assets only load behind the flag,
   reduced-motion = static poster frame, render loop pauses offscreen/hidden,
   production flags correct (card public, scene hidden without ?livingshop),
   git clean and pushed.

## Browser-verified behaviours (local + live deploy)
Live data renders the real shop (verified during the Thursday rush: ~93 min
wait, Bayli cutting a caped client, queue on the chesterfield); closed state
dims the room with a "CLOSED — BACK 9AM" sign; stale feed decays the sign to
"CALL FOR WAIT TIME"; tap-barber opens his live status card with a Book CTA
(Phase 3's core interaction, already in); sign glows with live numbers in
Oswald gold; mobile 390px shows the full scaled scene.

**GATE STATUS Phase 2: built + adversarially verified, live behind
`?livingshop` on production. Remaining gate = Jett's reveal approval →
flip `LIVING_SHOP_ON`.**
