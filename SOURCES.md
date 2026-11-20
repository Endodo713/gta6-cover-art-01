# Sources

- Competition brief and judge criteria: make.fun competition `gta6-cover-art-01` (kit `competition.yaml`, prep doc `~/workspace/makefun/gta6-cover-art-01-prep.md`).
- Kit starter: `~/workspace/makefun/prep-gta6-cover-art-01/gta6-cover-art-01-kit/starter/` — app/index.html, style.css, src/cover.js, src/main.js, src/shots.js, samples/boulevard.jpg, samples/pier.jpg, serve.ts, main.ts, shots.json.
- Sample photos `app/samples/boulevard.jpg` and `app/samples/pier.jpg`: made for make.fun with an image model, free to use (per the starter kit's main.ts comment).
- Fonts `app/fonts/`: Big Shoulders (Big Shoulders Project Authors), Outfit (Outfit Project Authors), Instrument Sans (Instrument Sans Project Authors) — all SIL Open Font License 1.1, license texts in `app/fonts/*-OFL.txt`. No Rockstar font, logo, or artwork is used.
- `vendor/makefun-app.ts`: the kit's make.fun dossier library, unchanged.
- Everything else (layout, sunset/neon grade, caption treatment, masthead, role labels, gold seal, editor logic, screenshots) is original code written for this entry in this session.
- Screenshot rendering: Playwright headless Chromium against the local `node serve.ts` server at http://localhost:8080 with `?shot=cover` and `?shot=editor` queries.
