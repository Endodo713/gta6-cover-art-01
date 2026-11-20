# Neon Vice — gta6-cover-art-01

Offline GTA 6-style cover art maker. Turn your photo and a caption into a multi-panel Vice City poster, exported as PNG in the common post sizes: 1080×1080, 1080×1350, and 1920×1080.

No Rockstar logo, artwork, or font. Every font, gradient, and panel treatment is original code. Photos never leave your machine — everything renders locally in the browser.

[![make.fun badge](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun rank](https://make.fun/badge/gta6-cover-art-01/Endodo713/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun reward](https://make.fun/badge/gta6-cover-art-01/Endodo713/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

## What it does

- Load any photo from your machine (PNG/JPG)
- Type a caption (bold capitals, one line)
- Live multi-panel preview with sunset/neon Vice City grade
- Export three PNG sizes at once: 1080×1080, 1080×1350, 1920×1080

## How to run

```bash
node serve.ts
# open http://localhost:8080
```

Or build the entry:

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html` — editor + preview page (offline, no network)
- `app/style.css` — dark Vice City UI
- `app/src/cover.js` — multi-panel renderer (panels, grade, caption, masthead)
- `app/src/main.js` — photo load, controls, live preview, 3-size export
- `app/src/shots.js` — `?shot=cover` / `?shot=editor` screenshot scenes
- `app/fonts/` — OFL-licensed display and text fonts
- `app/samples/` — free-to-use sample photos
- `main.ts` — Node 22 entry: copies `app/` + `screenshots/` to `/output`, writes `dossier.json` via `vendor/makefun-app.ts`
- `vendor/makefun-app.ts` — kit's dossier library (unchanged)
- `screenshots/` — 3 renders of the app for judging

## License

MIT — see LICENSE.
