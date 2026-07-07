#!/bin/bash
# Blacksmith machine gate — usage: bash verify.sh <file.html|file.txt> [more files...]
# Exit 0 = pass, 1 = FAIL(s) found. [MACHINE] rules from 00-HARD-RULES.md / brand.yaml.
# Judge rules (imagery, honesty/proof, structure, gold-as-accent) are NOT here — the blind judge covers those.
# Non-HTML files (bot copy, poster text) get the string checks; hex/font/logo checks are HTML/CSS-only.

FAIL=0
note() { echo "  $1"; }
fail() { echo "  ❌ FAIL: $1"; FAIL=1; }
warn() { echo "  ⚠️  WARN: $1"; }

# banned strings (case-insensitive) — voice + claims (brand-dna NEVER rules + universal AI-tells)
BANNED=("unlock" "elevate your" "seamless" "game-changer" \
        "only 3 left" "limited stock" "save [$]" "value pack" "cheap cuts" \
        "grooming solutions" "hair services" "best haircut" "tier 1" "premium tier" \
        "sammi" "slikr")
# sammi: display spelling is "Sami" (Beau 2026-07-06); filenames exempt (gate reads visible copy only)
# slikr: backend-only since 2026-07-06 — never a customer-facing link/name (customers see "the app" / in-chat booking)
# competitor names — never named on customer surfaces (contrast the MODEL, never a shop)
COMPETITORS=("Blends Barbershop" "Barber Industries" "Connolly" "MVN" "Barber Bar")
# hex whitelist from brand.yaml (locked core + BRAND-CONTEXT as-built + shipped arm extensions)
ALLOWED_HEX="0B0B0D 121214 23232A F5F3EE 9A9AA2 C8A44D E6C879 1A1407 C9C9D0 D2D2D8 \
0D0D0F 141417 26262C F3F1EA A2A2AA E3C578 FFFFFF FFF 000000 000 \
15110B 3A2F1D FFF7E0 15151A 2F4136 \
0E0E11 141416 16161A 1B1B20 CFCFCF \
070608 0A0A0C 101013 1A1A1F 2C2C33 3A3A42 55555F 5DDB7A 777 777777 B9B3A6 C9C3B6 E7E5DE \
F7F2EC FFFDFA FFF8F5 F2E8E2 E6DCD2 D99AA1 A05862 8C8178 6B6258 4D4640 1D1815"
# (0E0E11 + 070608 rows = shipped site.css neutrals — panels, chat widget, live-wait card,
#  badge greys, 5DDB7A live/open green (re-surveyed 2026-07-07 on the current tree);
#  last row = Blackrose Salon sub-palette — Blackrose surfaces only; judge enforces scope)

for f in "$@"; do
  [ -f "$f" ] || { echo "❌ $f: not found"; FAIL=1; continue; }
  echo "── $f"
  case "$f" in *.html|*.htm|*.css) ISHTML=1;; *) ISHTML=0;; esac

  # visible text = strip tags, scripts, styles, comments (rough but effective)
  case "$f" in
    *.css) TEXT=$(perl -0777 -pe 's{/\*.*?\*/}{}gs' "$f");;  # strip /* comments */ (multi-line) — dev notes aren't customer copy
    *.html|*.htm)
      TEXT=$(perl -0777 -pe 's{<script.*?</script>}{}gsi; s{<style.*?</style>}{}gsi; s{<!--.*?-->}{}gs; s{<[^>]*>}{ }g' "$f");;
    *) TEXT=$(cat "$f");;
  esac

  # 1. em-dash in visible copy (banned in NEW customer copy; legacy flags = rewrite on next touch)
  if echo "$TEXT" | grep -q "—"; then
    fail "em-dash in visible copy ($(echo "$TEXT" | grep -c '—') line(s)). Rewrite the sentences."
  else note "✓ no em-dashes in copy"; fi

  # 2. banned strings in visible copy
  BHIT=0
  for b in "${BANNED[@]}"; do
    if echo "$TEXT" | grep -qi "$b"; then fail "banned string \"$b\" in copy"; BHIT=1; fi
  done
  # "unlimited" banned UNLESS negated ("not unlimited" / "nothing is unlimited" is an approved contrast)
  if echo "$TEXT" | grep -oiE '([A-Za-z]+[ ,]+){0,3}unlimited' \
     | grep -qviE "(^|[^A-Za-z])(no|not|nothing|never|isn't|aren't)([ ,]+[A-Za-z]+){0,2}[ ,]+unlimited"; then
    fail "banned string \"unlimited\" (non-negated) in copy. Nothing is unlimited; specificity = trust."; BHIT=1
  fi
  for c in "${COMPETITORS[@]}"; do
    if echo "$TEXT" | grep -qi "$c"; then fail "competitor named in copy (\"$c\"). Contrast the MODEL, never a shop."; BHIT=1; fi
  done
  [ $BHIT -eq 0 ] && note "✓ no banned strings / competitor names"

  if [ $ISHTML -eq 1 ]; then
    # 3. hex whitelist (all #hex in file vs brand.yaml)
    VIOL=$(grep -oiE '#[0-9a-f]{6}|#[0-9a-f]{3}\b' "$f" | tr -d '#' | tr 'a-f' 'A-F' | sort -u \
          | while read -r h; do echo "$ALLOWED_HEX" | grep -qiw "$h" || echo "#$h"; done)
    if [ -n "$VIOL" ]; then
      fail "off-palette hex: $(echo $VIOL | tr '\n' ' ')"
    else note "✓ all hexes on palette"; fi

    # 4. font whitelist — Oswald (display) / Inter (body) / Scotland (wordmark @font-face) + system fallbacks
    if grep -oiE 'font-family[^;}"]*' "$f" | grep -viE 'oswald|inter|scotland|apple-system|blinkmacsystemfont|segoe ui|system-ui|sans-serif|inherit|var\(' | grep -q .; then
      fail "non-whitelisted font-family declared (allowed: Oswald / Inter / Scotland + system fallbacks)"
    else note "✓ fonts on whitelist"; fi
    if grep -qiE 'cormorant|playfair|garamond|dm serif|dm sans' "$f"; then
      fail "unapproved serif referenced (Cormorant/Playfair/Garamond were never signed off — locked fonts are Oswald + Inter)"
    fi

    # 5. gold discipline — accent only (rough proxy; judge confirms no gold fields/body text)
    GOLD=$(grep -oiE 'c8a44d|e6c879|e3c578' "$f" | wc -l | tr -d ' ')
    if [ "$GOLD" -gt 12 ]; then warn "gold referenced ${GOLD}x in source — confirm accent-only (CTAs/eyebrows/keylines), never a background field";
    else note "✓ gold within accent discipline (${GOLD} refs)"; fi

    # 6. logo as file, not typeset
    if grep -qE 'logo-(white|black)\.png|blackrose-clean' "$f"; then note "✓ real logo file referenced"
    else warn "no assets/logo-*.png referenced — confirm the mark isn't typeset"; fi
  fi
done

echo
if [ $FAIL -eq 1 ]; then echo "RESULT: FAIL — loop back to build."; exit 1
else echo "RESULT: PASS (machine gate only — blind judge still required)."; fi
