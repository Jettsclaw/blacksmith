# Claude Code Handoff & Workflow Reference

## The division of labour

**Alfred (this chat) does:**
- Strategic planning, content decisions, skill updates
- First-pass builds when testing new components
- Answering "what should this document say/do?"

**Claude Code does:**
- End-to-end brief builds from a single prompt (primary build tool)
- GSAP animation pass and audit
- Git commit and push to main
- Vercel deployment confirmation
- Multi-file updates across a repo

---

## Claude Code full build workflow

### Step 1 — Read context
1. Read CLAUDE.md at repo root
2. Read all 9 skill reference files in order from SKILL.md
3. Read brand/brand-config.json + compliance.md
4. If audience specified: web search to research them

### Step 2 — Propose before building
Present two proposals and await confirmation:
- Colour direction: 2-3 options with reasoning + "base" always included
- Animation plan: which GSAP tiers apply and why, any Tier 3/4 suggestions

Do not build until both are confirmed.

### Step 3 — Build
- Derive full token set from confirmed palette
- Select correct logo SVG (white on dark, black on light)
- Build HTML: hamburger nav mandatory, apply all animation classes
- classList toggle pattern for reveals — NOT gsap.from()
- Include descender fix CSS if hero-title gets SplitText

### Step 4 — Checklist
Run checklist.md Python script. All items must pass before pushing.

### Step 5 — Push
```
git add [filename].html
git commit -m "[Brief name] — [audience] brief"
git push origin main
```
Report live URL.

---

## GSAP animation audit

After building, audit internally:
- Does any element have real visual depth → parallax?
- Are there impactful numbers → counter or ScrambleText?
- SVG line-work → DrawSVG?
- Cards that expand → Flip?
- Diagram showing movement → MotionPath?

Propose YES items with one-sentence justification.
Do not suggest anything that is "just cool" without making content clearer.
Await approval before implementing.

---

## CDN versions (always jsDelivr)

- Lenis: 1.1.14
- GSAP core + plugins: 3.15.0
- Never cdnjs, never @latest

---

## Files Claude Code must NOT touch

- Content/copy between HTML tags
- CSS custom properties in :root
- Font-family declarations
- SVG logo data
- Component CSS (topbar, hero, stat grids)
- Responsive @media queries
- Brand-locked colour tokens
