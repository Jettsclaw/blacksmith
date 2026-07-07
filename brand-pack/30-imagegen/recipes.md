# Blacksmith — image generation recipes

## The rule above all rules
Real assets FIRST: this brand owns a professional shop shoot (the TLB_*.jpg series in
`site/assets/photos/`), real barbers, a real room. **Prefer a real photo over any
generation, every time.** Logos are composited AFTER generation from `assets/
logo-white.png` / `logo-black.png` — never generated, never typeset. If an image needs
an asset that isn't on disk, the answer is "get the asset" (shoot it in the shop),
not "generate a stand-in". Never generate fake barbers, fake customers, or a fake room
that could be mistaken for the real shop.

## When generation IS appropriate
Abstract/texture supporting art only: macro steel + leather textures, gold-on-black
graphic backgrounds, poster texture beds, motion-page atmosphere. Not people, not
the shop, not "a barbershop".

## Mandatory prompt modifier (prepend to EVERY Blacksmith image gen)
> Premium old-school barbershop brand, dark editorial. Near-black #0b0b0d field, warm
> gold #c8a44d single accent, warm off-white #f5f3ee sparingly. Moody low-key cinematic
> light, deep shadow, film grain restraint, tactile materials: worn leather, brushed
> steel, dark timber, straight-razor steel. Editorial, masculine-without-bro,
> craft-trade. Oswald-style condensed uppercase only if type appears. No people unless
> compositing real photography.

## Negative prompt (always append)
barber pole cliché, stock barbershop, hipster beard oil flat-lay, tattooed stock model,
neon signage, cartoon scissors, AI-plastic skin, extra fingers, warped text, fake logo,
fake reviews UI, countdown timer, discount starburst, light airy salon look (that's
Blackrose only, and Blackrose uses its own real photos), garish gradients, watermark.

## Structure: JSON spec-sheet prompting
Use the 4 patterns in `~/Documents/brain/04-resources/image-prompt-templates/json-spec-sheet-prompting.md`
(full-scene+UI-text · photo-analysis breakdown · extreme-macro · UGC storyboard), each
with its `negative_prompts` and `quality_checkpoints` blocks. Route via jettsclaw
`generate_image` (use `models_explore recommend` if unsure of model).

## Post-gen QA (before any image ships)
1. Could this pass for the real shop or a real barber? If yes and it isn't = kill it (honesty rule).
2. Colours within brand.yaml palette (no drifted teal/purple/neon).
3. Composite the real logo where the mark is needed; check legibility at final size.
4. Runs through the asset's verify gate + blind judge like any other element.
