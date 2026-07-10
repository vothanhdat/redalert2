# Migration Baseline — pre-Vite/TypeScript

Captured on branch `claude/vite-typescript-migration-6798c8` at commit `a7c53b7`, before any
migration change. This is the reference the migrated build must reproduce.

## How this was captured

Served the repo as-is over a plain static server and loaded it in a real browser:

```
python3 -m http.server 8099    # repo root
open http://localhost:8099/
```

No build step exists today. `index.html` loads every file via ordered `<script>` tags.

## Verdict: the legacy app works

The game boots to a playable state — map renders, units spawn, fog of war and minimap
draw, AI and pathfinding workers run, audio loads.

- **Console errors: 0**
- **Console warnings: 0**
- **Failed network requests: 0** (411 requests, all 200)

Screenshot at time of capture: units on map, fog of war, sidebar UI, `$1000000` credits.

## Runtime facts to preserve

| Signal | Baseline value |
| --- | --- |
| PIXI version | 3.0.9 (vendored, `Scripts/pixi.js`) |
| Renderer | WebGL |
| jQuery | 2.1.4 |
| SoundJS | present (`createjs`) |
| Base textures loaded | 48 |
| Textures in cache (after runtime slicing) | 4248 |
| `mainstage` children | 15 |
| Teams | 3 |
| AI opponents registered | `DAT_1`, `DAT_2`, `PHUONG`, `KHOAN` |
| Map | `map3` |

Requests by type: 216 png, 88 wav, 66 js, 18 json, 6 jpg, 4 webp, 4 html.

## Code shape

- 61 files under `JS/` — 17,754 LOC (excludes vendored `Scripts/`).
- 50 of 61 files already declare `"use strict"`.
- ~86 top-level declarations: ES6 `class` for game entities, `var NAME = {}` singletons
  for managers (`GAME_OBJECT`, `AUDIO`, `MINIMAP`, `CONTROLER`, …).
- Largest: `JS/Controler.js` (1598), `Flyable_Unit.js` (1254), `Solider_Unit_Type.js` (978).

## The 146 globals

Nothing is a module. Every file writes to `window`, and load order in `index.html` *is* the
dependency graph. Measured against a clean iframe, the app defines **146 globals**:

- **83 objects** — `GAME_OBJECT`, `CONTROLER`, `USER_CONTROLER`, `AUDIO`, `MINIMAP`,
  `FOG_GRAPGICH`, `GAME_MANAGER`, `GRID`, `TEAM`, `EFFECT`, `WEAPON`, `renderer`,
  `mainstage`, `graphics`, `map`, the `*_TYPE` tables, PIXI containers, …
- **41 functions** — `animate`, `convert2screen`, `calcfar`, `myCos`, `mySin`,
  `HIGH_PERFOMANCE_GET_SPRITE`, `PriorityQueue`, `Queue`, …
- **20 numbers** — `SPEED`, `GRAVITY`, `UI_WIDTH`, `UI_HEIGTH`, `screen_width`,
  `screen_height`, `display_width`, `display_height`, `screen_x/y/w/h`, `max_x`, `max_y`,
  `drawtime`, plus leaked loop counters **`i`** and **`j`**.

This is the migration's central risk: converting to ES modules replaces implicit global
resolution with explicit imports, and the graph is currently undocumented.

## Load-bearing constraints Vite will fight

1. **Inline bootstrap in `index.html`.** `renderer`, `mouserenderer`, `SPEED`, and the
   screen dimensions are created in a `<script>` block *between* vendor and game scripts.
   Later files read them at parse time. `FOG_GRAPGICH.init()` and `AUDIO.load_sound()` also
   run inline, at parse time, not on `load`.

2. **Three Web Workers, loaded by string path.**
   - `new Worker("JS/AI_Worker.js")` — `JS/AI_worker_comunication.js:56`
   - `new Worker("JS/Path_finding_worker.js")` — `JS/Game_object/GRID.js:6` and `:648`

3. **Workers `importScripts()` with *runtime-computed* paths.** This is the hard part —
   Vite cannot statically analyze these, so the AI scripts must stay as classic scripts
   served verbatim, not bundled:
   - `JS/AI_Worker.js:186-189` — static-ish, plus `importScripts(e.data.data.path + random())` at `:201`
   - `JS/AI/AI_static.js:14` — `importScripts(PARAM.custom_path + random())`
   - `JS/AI/Khoan/AI.js:67-70` — four `importScripts(...)` with `?r=` cache-busters

   The paths come from the `AI_LIST` data table at `JS/AI_worker_comunication.js:428-450`.

4. **`random()` is a cache-buster appended to URLs**, defined twice — `JS/AI_Worker.js:111`
   and `Scripts/JavaScript_helper.js:151`.

5. **HTML fragments fetched via `$.ajax`** at runtime: `JS/UI/Menu.html`,
   `JS/UI/Playing_layout.html`. These are assets, not templates.

6. **Map data read via raw `XMLHttpRequest`** — `JS/Map.js:149`.

7. **`XMLHttpRequest.prototype.open` is monkey-patched** at `JS/Audio.js:3-4`.

## Pre-existing bug found while capturing

`AI_LIST` points at `"AI/PHUONG/AI.js"` and `"AI/KHOAN/AI.js"`
(`JS/AI_worker_comunication.js:444,450`), but the directories on disk are `JS/AI/Phuong`
and `JS/AI/Khoan`.

This resolves on case-insensitive macOS/Windows and **breaks on Linux** — consistent with
the earlier `Fix wrongPath inlinux` commit (`240c1b6`). It is latent today because those two
AI opponents load only on a case-insensitive filesystem. Worth fixing during the migration
rather than carrying forward.

## What "the migration didn't break anything" will mean

Re-run the same capture against the Vite dev server and the production build, and confirm:

- 0 console errors, 0 failed requests
- WebGL renderer, 48 base textures, 4248 cached textures
- 15 `mainstage` children, 3 teams, 4 AI opponents registered
- Both worker types spawn and post results (`find_path : <id>` log lines appear)
- Game is visually identical to the baseline screenshot
