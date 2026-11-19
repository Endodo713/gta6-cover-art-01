# Neon Vice — GTA-style Cover Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Endodo713/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Endodo713/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns your photo and a caption into a
sunset-neon poster cover: multi-panel layouts, bold condensed
lettering, and a magenta–orange–cyan Vice City grade, exported as a
PNG in 1080×1080, 1080×1350, or 1920×1080.

## How it works (3 steps)

1. **Photos** — add up to 3 of your own photos (or load the free
   samples). Photos are read in the browser and never leave the
   device. Tap a photo on the cover to pick it, drag it to move it,
   scroll or use the slider to zoom it.
2. **Layout** — pick Sunset Stack, Vice Grid, or Boulevard Strip.
   One photo fills several panels with different framings; several
   photos fill one panel each.
3. **Caption** — type the caption, kicker, size, font, colour, and
   position, then export a PNG in the size you need.

## Originality

All art, lettering, and fonts are original: the sunset grade, panel
geometry, and caption treatment are drawn in code; the fonts are
Big Shoulders, Outfit, and Instrument Sans under the SIL Open Font
License 1.1 (see `app/fonts/`). No Rockstar logo, artwork, or font
is used anywhere.

## Run it offline

`node serve.ts` → open the printed address. No network is used:
every file lives under `app/`.

## Design

See `DESIGN.md` (movement: "Neon Vice") and `CONCEPTS.md` (the
3-concept A/B that picked the Sunset Stack layout).

<sub>Entered on [make.fun](https://make.fun/?ref=tnhwa041&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
