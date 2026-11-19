# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/dankurniaone/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/dankurniaone/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice City Cover Maker** — turn your photo and a tagline into GTA 6-style cover art: a grid of slightly off-axis illustrated panels on a deep violet field, with the game's wordmark in the centre panel — the grammar of the official GTA VI cover (nine panels on deep violet, logo in the middle, helicopter top-left, duo top-centre, speedboat top-right, supercar bottom-left, alligator bottom-centre, motorcycle bottom-right) and the GTA V cover (nine panels, one hexagonal wordmark tile, every panel pulled off axis, gutters that are gaps, not strokes). Your photo sits in the top-centre portrait panel, graded warm so it shares the illustrated panels' sunset light; the vignettes around it are original Canvas drawings — a police helicopter, a duo portrait, a speedboat with a flamingo, a bank robber, a producer pointing at the viewer, a yellow supercar, an open-jawed alligator, a wheelie motorcycle, palms, skylines, a police chase. Exports a PNG in 1920×1080, 1080×1080, or 1080×1350. Runs offline in desktop Chrome from static files; photos never leave your machine. All vignettes are original drawings — no Rockstar logo, artwork, or font. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — load a photo (or try a sample), pick a layout and theme, write a tagline, drag the photo to reposition it, and hit **Export PNG**.

## How it works

- `app/index.html` + `app/style.css` — the editor: dark Vice City theme, preview dominant.
- `app/src/cover.js` — the cover renderer: 3 layouts (GTA VI grid, Nine panels, Duo), 3 themes (Sunset, Neon Night, Vice City), centre wordmark panel with the tagline underneath, slightly tilted panels on a deep violet field, warm photo grade.
- `app/src/panels.js` — the illustrated vignettes, drawn from scratch in Canvas with bold outlines, blocked shadows and hard rim light: helicopter, duo portrait, speedboat, bank robber, producer, supercar, alligator, motorcycle, palms, skylines, police chase.
- `app/src/main.js` — editor wiring: photo load (file / drag-and-drop), drag-to-pan, zoom, fit/cover, second photo slot, export at exact size.
- `app/fonts/Anton-Regular.woff2` — Anton, SIL Open Font License (see `app/fonts/OFL.txt`).
- `main.ts` — hands the entry in: copies `app/` + `screenshots/` to `/output` and writes `dossier.json`.

## Screenshots

`1-cover.jpg` is the exported landscape cover; `2-editor.jpg` is the editor with a photo loaded; `3-cover-square.jpg` and `4-cover-portrait.jpg` are the square and portrait exports. Sample photos were made with an image model for make.fun and are free to use.

---

<sub>Entered on [make.fun](https://make.fun/?ref=adyjn11j&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
