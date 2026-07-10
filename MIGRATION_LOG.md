# Migration Log

Target: modern Vite + TypeScript. Reference behavior is captured in
[MIGRATION_BASELINE.md](MIGRATION_BASELINE.md).

Plan, in order. Each stage must reproduce the baseline before the next begins.

| Stage | Goal | Status |
| --- | --- | --- |
| 0 | Capture baseline of the legacy app | Done |
| 1 | Vite dev + prod build, game logic untouched | Done |
| 2 | Convert 61 files to ES modules; kill the 146 globals | Not started |
| 3 | Rename to `.ts`, add types, enable `strict` | Not started |
| 4 | PIXI v3.0.9 → v8 (separate pass, after the above lands) | Not started |

---

## Stage 1 — Vite scaffolding (done)

Toolchain: Vite 8.1.4, TypeScript 7.0.2, Node 24.7.0.

**No game code was modified.** Changes were confined to project structure:

- `npm` project created; `dev` / `build` / `preview` scripts added.
- `Audio/`, `IMG/`, `Data/`, `JS/`, `Scripts/` moved into `public/` via `git mv`.
- `index.html` script `src`s and the one CSS `url()` were prefixed with `/` so Vite treats
  them as public assets and passes them through. Runtime path strings inside the game
  (`new Worker("JS/…")`, `$.ajax({url: "JS/UI/Menu.html"})`) were **not** touched — they
  resolve against the document and remain correct.
- `vite.config.ts`, `.gitignore` added.
- Dead .NET deployment files removed: `Web.config`, `Web.Debug.config`,
  `website.publishproj`, `App_Data/`. `dist/` is the deployment artifact now.

### Why `public/`

Vite never transforms `public/`. That matters here because the AI workers call
`importScripts()` with paths computed at runtime — `importScripts(PARAM.custom_path + random())`
— which no bundler can statically analyze. Hashing or rewriting those files would silently
break the AI opponents. Passthrough makes Stage 1 provably behavior-preserving; the built
`dist/JS/AI_Worker.js` and `dist/Scripts/pixi.js` are byte-identical to their sources.

`public/JS/` and `public/Scripts/` are a **temporary** home. Stage 2 lifts `JS/` out into
`src/` as real modules; Stage 4 replaces `Scripts/` vendor files with npm dependencies.
`Audio/`, `IMG/`, and `Data/` stay in `public/` permanently.

### Verification

Same probes as the baseline, run against dev (`:5173`) and the production build (`:4173`):

| Signal | Baseline | Vite dev | Vite build |
| --- | --- | --- | --- |
| Console errors | 0 | 0 | 0 |
| Failed requests | 0 | 0 | 0 |
| Renderer | WebGL | WebGL | WebGL |
| Base textures | 48 | 48 | 48 |
| Cached textures | 4248 | 4248 | 4248 |
| `mainstage` children | 15 | 15 | 15 |
| Teams | 3 | 3 | 3 |
| AI opponents | 4 | 4 | 4 |
| Pathfinding worker | running | running | running |

Game is visually identical and playable in all three. Build: 3 modules, ~560 ms.

### Carried forward

- The `AI/PHUONG` / `AI/KHOAN` casing bug ([JS/AI_worker_comunication.js:444](public/JS/AI_worker_comunication.js:444))
  is **still present**. Per plan it gets fixed in Stage 2, where those paths are touched anyway.
- `Scripts/pixi.js` is still the vendored 2015 build, loaded as a global. It stays that way
  until Stage 4.
