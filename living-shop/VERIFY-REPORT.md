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

**GATE STATUS: Phase 0 artifacts complete. Awaiting Jett's style pick — hard
gate before any Phase 2 engine work. Phase 1 data spine is style-independent.**
