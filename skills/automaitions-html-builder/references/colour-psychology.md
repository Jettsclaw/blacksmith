# Colour Psychology & Palette Engine

## The core principle

**The surface is a design decision — not a constant.**

Every previous brief used a dark navy background. That's the Your Brand base palette.
But a document can be light, warm, pastel, rich, cool, moody — anything.
The full token system derives correctly from any anchor colour on any surface type.

Read this file before tokens.md on every build.

---

## Step 1 — Interpret the colour intent

When a brief specifies a colour intent, map it here before touching any code.

### Intent → Hue family mapping

| Intent phrase | Hue range (OKLCH H°) | Psychological associations |
|---|---|---|
| "blue", "trust", "clinical", "tech" | 220–260° | Trust, reliability, calm, professional |
| "electric blue", "Your Brand base" | 200–220° | Energy + trust, performance, precision |
| "green", "health", "natural", "growth" | 130–160° | Vitality, nature, wellness, safety |
| "teal", "balance", "modern" | 175–200° | Clarity, calm, sophistication |
| "pink", "feminine", "warm soft" | 340–360° / 0–20° | Warmth, softness, care, premium feminine |
| "rose", "dusty pink", "premium feminine" | 345–15° low chroma | Sophisticated, luxury, mature feminine |
| "hot pink", "bold feminine", "energetic" | 330–345° high chroma | Youthful, bold, energetic |
| "mauve", "muted purple-pink" | 320–340° low chroma | Calm, elegant, introspective |
| "red", "urgency", "bold", "power" | 15–30° | Urgency, power, appetite, attention |
| "orange", "energy", "warmth" | 40–60° | Warmth, friendliness, energy |
| "gold", "premium", "luxury" | 70–90° | Premium, achievement, warmth, status |
| "yellow", "optimism", "bright" | 90–105° | Optimism, clarity, attention |
| "purple", "premium", "mystery" | 280–310° | Premium, creativity, sophistication |
| "neutral", "editorial", "clean" | any, 0 chroma | No hue bias — typography-forward |

### Audience modifier rules

| Audience | Modifier |
|---|---|
| Women, professional | Lower chroma (0.08–0.14), higher lightness, warmer surface |
| Women, young/energetic | Higher chroma (0.16–0.22), saturated accents |
| Men, performance | Higher chroma, cooler hue, darker surface |
| 40+, health-conscious | Lower chroma, warm neutrals, high legibility |
| Clinical / medical | Very low chroma, cool grey surface, accent only on key elements |
| Biohackers / tech | High contrast, cool surface, electric accent |
| Luxury / premium | Low chroma surface, gold or muted jewel tone accent, generous whitespace |

### The 3 surface families

```
DARK SURFACE  — bg lightness L < 0.30
  → Use for: performance, tech, clinical, default brand docs
  → Text: near-white primary, grey secondary
  → Example: Your Brand base (#0A0A0A)

LIGHT SURFACE — bg lightness L > 0.80
  → Use for: feminine, editorial, premium, warm health
  → Text: near-black primary, grey secondary
  → Accent CANNOT be used as text (fails contrast) — derive accent-dim

RICH/MID SURFACE — bg lightness L 0.30–0.80
  → Use for: moody, jewel-tone, deep mauve, forest green
  → Text: near-white or near-black depending on lightness
  → Carefully check contrast at every level
```

---

## Step 2 — OKLCH derivation engine

Given one anchor hex (the accent/brand colour), derive the full 5-token accent ramp
and the full surface system.

### Python: Convert hex → OKLCH

```python
import colorsys, math

def hex_to_oklch(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = [int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4)]
    
    # sRGB to linear
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    
    r_lin, g_lin, b_lin = to_linear(r), to_linear(g), to_linear(b)
    
    # Linear sRGB to OKLab (approximate)
    l = 0.4122214708 * r_lin + 0.5363325363 * g_lin + 0.0514459929 * b_lin
    m = 0.2119034982 * r_lin + 0.6806995451 * g_lin + 0.1073969566 * b_lin
    s = 0.0883024619 * r_lin + 0.2817188376 * g_lin + 0.6299787005 * b_lin
    
    l_, m_, s_ = l ** (1/3), m ** (1/3), s ** (1/3)
    
    L =  0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a =  1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b_val = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    
    C = math.sqrt(a**2 + b_val**2)
    H = math.degrees(math.atan2(b_val, a)) % 360
    
    return L, C, H

def oklch_to_hex(L, C, H):
    # OKLCH to OKLab
    H_rad = math.radians(H)
    a = C * math.cos(H_rad)
    b = C * math.sin(H_rad)
    
    # OKLab to linear sRGB
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    
    l, m, s = l_**3, m_**3, s_**3
    
    r =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    b_v = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    
    # Clamp and gamma
    def to_srgb(c):
        c = max(0, min(1, c))
        return c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1/2.4)) - 0.055
    
    r_s, g_s, b_s = to_srgb(r), to_srgb(g), to_srgb(b)
    return f'#{int(r_s*255):02x}{int(g_s*255):02x}{int(b_s*255):02x}'
```

### Deriving the 5-accent ramp from one hex

```python
L, C, H = hex_to_oklch('#5B5BD6')  # e.g. Your Brand blue

accent     = oklch_to_hex(L,        C,      H)       # primary
accent_hi  = oklch_to_hex(L + 0.12, C,      H)       # highlight / grad start
accent_lo  = oklch_to_hex(L - 0.12, C,      H)       # subdued
accent_dim = oklch_to_hex(L - 0.28, C * 0.8, H)      # muted — labels only
line_acc_r, line_acc_g, line_acc_b = [int(accent.lstrip('#')[i:i+2],16) for i in (0,2,4)]
line_acc = f'rgba({line_acc_r},{line_acc_g},{line_acc_b},.2)'  # accent border tint
```

### Deriving the surface system from a surface hex

```python
# Given background hex, derive all 4 surface layers:
bg_L, bg_C, bg_H = hex_to_oklch('#0A0A0A')

# Dark theme: surfaces get progressively lighter
bg   = hex_color                              # page background
s1   = oklch_to_hex(bg_L + 0.03, bg_C, bg_H) # base card
s2   = oklch_to_hex(bg_L + 0.06, bg_C, bg_H) # lifted card
s3   = oklch_to_hex(bg_L + 0.10, bg_C, bg_H) # highest surface

# Light theme: surfaces get progressively darker (subtract)
# bg   = hex_color                              # page background
# s1   = oklch_to_hex(bg_L - 0.03, bg_C, bg_H) # card bg
# s2   = oklch_to_hex(bg_L - 0.06, bg_C, bg_H) # lifted
# s3   = oklch_to_hex(bg_L - 0.09, bg_C, bg_H) # active

# Line and border colours:
line    = oklch_to_hex(bg_L + 0.10, bg_C * 0.5, bg_H)
line_hi = oklch_to_hex(bg_L + 0.16, bg_C * 0.5, bg_H)

# Text colours for dark surface:
tx1 = '#FAFAFA'   # near-white primary
tx2 = '#9A9A9A'   # mid-grey secondary
tx3 = oklch_to_hex(bg_L + 0.30, bg_C * 0.3, bg_H)  # tertiary

# Text colours for light surface:
# tx1 = '#111111'  # near-black primary
# tx2 = '#666660'  # mid-grey secondary
# tx3 = '#AAAAAA'  # light grey labels
```

---

## Step 3 — Complementary colour generation

For multi-accent designs (e.g. a document with a secondary highlight colour, or comparison diagrams):

```python
# Complementary (opposite on wheel) — maximum contrast
complement = oklch_to_hex(L, C, (H + 180) % 360)

# Split-complementary (softer contrast)
split_a = oklch_to_hex(L, C * 0.85, (H + 150) % 360)
split_b = oklch_to_hex(L, C * 0.85, (H + 210) % 360)

# Triadic (three evenly spaced — vibrant)
triad_a = oklch_to_hex(L, C, (H + 120) % 360)
triad_b = oklch_to_hex(L, C, (H + 240) % 360)

# Analogous (adjacent — harmonious, low tension)
analog_a = oklch_to_hex(L, C, (H + 30) % 360)
analog_b = oklch_to_hex(L, C, (H - 30) % 360)
```

**Choosing which relationship:**
- Comparison diagrams (left vs right): complementary or split-complementary
- Card grids with 3 items: triadic
- Subtle accent variation: analogous
- Single strong CTA: complementary at higher chroma

---

## Step 4 — WCAG AA contrast check

**Always check before writing CSS.** Light themes especially — bright accents on white fail.

```python
def relative_luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = [int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4)]
    def linearise(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    R, G, B = linearise(r), linearise(g), linearise(b)
    return 0.2126 * R + 0.7152 * G + 0.0722 * B

def contrast_ratio(hex1, hex2):
    L1 = relative_luminance(hex1)
    L2 = relative_luminance(hex2)
    light, dark = max(L1, L2), min(L1, L2)
    return (light + 0.05) / (dark + 0.05)

# Requirements:
# Normal text: 4.5:1 minimum
# Large text (18px+ or 14px+ bold): 3:1 minimum
# Decorative elements: no requirement

ratio = contrast_ratio('#5B5BD6', '#0A0A0A')
print(f"Contrast: {ratio:.1f}:1  {'✓ PASS' if ratio >= 4.5 else '✗ FAIL'}")
```

**Light theme rule:** `--accent` on white background almost always fails AA for normal text.
Always use `--accent-dim` for text — derive it dark enough to pass 4.5:1.

---

## Step 5 — Presenting colour options

When a brief specifies intent but not exact colour, present 2–3 options:

```
Option A — [Name]: "[Accent hex] on [Surface description]"
  → Best for: [what this tone says]
  → Risks: [what it might read wrong]

Option B — [Name]: "[Accent hex] on [Surface description]"  
  → Best for: [what this tone says]
  → Risks: [what it might read wrong]

Option C — Base: "Your Brand default (#5B5BD6 on #0A0A0A)"
  → Always available as a fallback — say "base" to use it
```

Always include "base" as an option. Never surprise the user with only custom options.

---

## Pre-built palette references

### Your Brand default (electric blue, dark navy)
```css
--accent: #5B5BD6; --accent-hi: #7B7BE8; --accent-lo: #4A4ABC; --accent-dim: #2C2C7A;
--line-acc: rgba(91,91,214,.2);
--bg: #0A0A0A; --s1: #141414; --s2: #1C1C1C; --s3: #262626;
--line: #262626; --line-hi: #2F2F2F;
--tx-1: #FAFAFA; --tx-2: #9A9A9A; --tx-3: #5A5A5A;
```

### Your Brand — warm feminine (dusty rose, warm cream)
```css
--accent: #C4787A; --accent-hi: #D99496; --accent-lo: #A05860; --accent-dim: #7A3A40;
--line-acc: rgba(196,120,122,.2);
--bg: #FAF6F3; --s1: #F5EEE9; --s2: #EDE3DC; --s3: #E3D5CC;
--line: #DDD0C8; --line-hi: #CEBFB5;
--tx-1: #1A1210; --tx-2: #6B5850; --tx-3: #9A8880;
```

### Your Brand — deep mauve (sophisticated dark feminine)
```css
--accent: #C47AB8; --accent-hi: #DA9ACD; --accent-lo: #9A5A8C; --accent-dim: #5A3054;
--line-acc: rgba(196,122,184,.2);
--bg: #1E1424; --s1: #261A2E; --s2: #2E2036; --s3: #382840;
--line: #382840; --line-hi: #48385A;
--tx-1: #F2EEF5; --tx-2: #8A7A96; --tx-3: #5A4A66;
```

### Your Brand — premium light (warm white, gold accent)
```css
--accent: #B8942A; --accent-hi: #D4AC3A; --accent-lo: #8C6E1A; --accent-dim: #5A4010;
--line-acc: rgba(184,148,42,.2);
--bg: #FDFAF4; --s1: #F8F3E8; --s2: #F0E9D8; --s3: #E8DEC8;
--line: #E0D5BE; --line-hi: #D4C8A8;
--tx-1: #1A1510; --tx-2: #6B5A40; --tx-3: #9A8870;
```

### Your Brand — performance (charcoal + electric green)
```css
--accent: #4AE7A0; --accent-hi: #72FFB8; --accent-lo: #2AB070; --accent-dim: #1A6A44;
--line-acc: rgba(74,231,160,.2);
--bg: #141C14; --s1: #1A241A; --s2: #202C20; --s3: #283428;
--line: #283428; --line-hi: #384838;
--tx-1: #F0F5F0; --tx-2: #7A8A7A; --tx-3: #4A5A4A;
```
