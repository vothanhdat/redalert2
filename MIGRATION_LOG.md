# Migration Log

Target: modern Vite + TypeScript. Reference behavior is captured in
[MIGRATION_BASELINE.md](MIGRATION_BASELINE.md).

Plan, in order. Each stage must reproduce the baseline before the next begins.

| Stage | Goal | Status |
| --- | --- | --- |
| 0 | Capture baseline of the legacy app | Done |
| 1 | Vite dev + prod build, game logic untouched | Done |
| 2 | Convert the main-thread scripts to ES modules; kill the 146 globals | Done |
| 3 | Rename to `.ts`, type the core, `tsc --noEmit` gate | Done |
| 4a | PIXI v3.0.9 → v7.4.3 (npm, GLSL filters preserved) | Done |
| 4b | PIXI v7 → v8 | **Deliberately not done** — see below |

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

- The `AI/PHUONG` / `AI/KHOAN` casing bug is **still present** after Stage 1. Fixed in Stage 2.
- `Scripts/pixi.js` is still the vendored 2015 build, loaded as a global. It stays that way
  until Stage 4.

---

## Stage 2 — ES modules (done)

The 26 main-thread game scripts plus two helper libraries became ES modules under `src/`,
joined by four new `src/core/` modules and `src/main.js`. The old inline bootstrap in
`index.html` is gone; `index.html` now loads three vendor globals and one module entry.

**Window globals: 146 → 10.** The ten that remain are deliberate:

| Global | Why it stays |
| --- | --- |
| `PIXI`, `$`, `jQuery`, `createjs` | vendor classic scripts (Stage 4 replaces these) |
| `GAME_MANAGER` | `Menu.html` has inline `onclick="MENU.choose_skrimming()"` → `GAME_MANAGER` |
| `PLAYING_LAYOUT` | `Playing_layout.html` has inline `onclick="PLAYING_LAYOUT.set_type_display(0)"` |
| `MENU` | defined by the `<script>` inside `Menu.html`, injected at runtime by jQuery |
| `animate` | `Done.js` starts the render loop via `window.animate()` |
| `FILECACHE` | map texture cache, genuinely a window property |

### Why the import graph is acyclic by construction

The reference graph has **104 cycles** — `Game_object` calls into `Construction_unit`, which
extends `Game_unit`, which calls back into `Game_object`. Classic scripts tolerated this
because every reference resolved off `window` at *call* time. ES modules resolve at *load*
time, so a naive conversion inverts evaluation order and breaks `class X extends Y`.

Static analysis showed only **18 references happen at module-evaluation time**, and all 18
point *backward* in the original `<script>` order. So the rule is:

> A module may import only files that loaded earlier. References that point forward stay
> late-bound, through `src/core/late.js`.

That makes the import graph acyclic (edges strictly decrease in load order), which means ESM
evaluation order provably equals the old script order and every eval-time dependency is
satisfied. 133 edges became real imports; 57 symbols (332 references) stayed late-bound.

`Game_Container.js` was hoisted from last to third in the order — it depends only on the
helper filters, and moving it turned 14 container symbols (`stage`, `mainstage`, `graphics`,
…) from late-bound into ordinary imports. Reordering more modules would shrink `LATE` further.

### Shared mutable state

`screen_x`, `SPEED`, `map`, and friends live in `src/core/state.js`, exported with `let` so
importers get ES module **live bindings** — a bare read always sees the current value, exactly
as a global read did. Imported bindings are read-only, so the twelve write sites go through
setters (`set_screen_x`, `set_max_x`, `set_map`, …).

### Bugs found and fixed

1. **`AI/PHUONG` / `AI/KHOAN` casing.** Directories are `Phuong` / `Khoan`. Worked on
   case-insensitive macOS, 404s on Linux.
2. **`if (window.AI_CONTROLER2)`** — a truthiness guard reading the variable off `window`.
   As a module binding it is not on `window`, so this would have silently disabled AI
   opponent 2 while the game kept running. Now guards the imported binding.
3. **Undeclared loop variable `i`** in `Image_process.js` (2 sites). It only resolved because
   a top-level `for (var i …)` in `Effect.js` leaked a global. Module strict mode would have
   thrown `ReferenceError` at texture-load time.
4. **`PLAYING_LAYOUT` was an implicit global** (assigned with no `var`), which strict mode rejects.
5. **`window[ob[5]][ob[6]]`** in `Done.js` — map data names its type tables by string. Module
   bindings are not on `window`; replaced by `src/core/type_registry.js`.
6. **`window.max_x = …`** writes in `Map.js` would not have been visible to importers.
7. **`window.renderer` inside `Minimap.js` / `Image_process.js`** — both declare a *local*
   `renderer` and used `window.` to escape the shadow. Rewriting naively made it
   self-referential. They now import `renderer as global_renderer`.
8. Dead `if (window.AI_CONTROLER1)` block removed (`Controler.js` has it commented out).

### Known latent bug, not fixed

`Controler.js:329` — `get ship() { return SHIP_TYPE }`. `SHIP_TYPE` is defined nowhere, so the
getter throws if ever read. Behavior is unchanged from before the migration.

### Verification

Dev (`:5173`) and production build (`:4173`), against
[MIGRATION_BASELINE.md](MIGRATION_BASELINE.md):

| Signal | Baseline | Vite dev | Vite build |
| --- | --- | --- | --- |
| Console errors | 0 | 0 | 0 |
| Failed requests | 0 | 0 | 0 |
| Base textures | 48 | 48 | 48 |
| Cached textures | 4248 | 4248 | 4248 |
| `mainstage` children | 15 | 15 | 15 |
| Teams / AI opponents | 3 / 4 | 3 / 4 | 3 / 4 |
| Game objects after load | 2104 | 2104 | 2104 |
| Pathfinding worker | running | running | running |
| AI worker | running | running | running |
| Sidebar buttons | 5 | 5 | 5 |
| Window globals | 146 | 10 | 10 |

`AI_WORKER2` is now a live object, confirming fix #2. Build: 37 modules → one 227 kB chunk
(54 kB gzip). `dist/JS/AI_Worker.js`, `dist/JS/Path_finding_worker.js`, and
`dist/Scripts/pixi.js` remain byte-identical to source.

To A/B against the pre-migration app:

```
git worktree add /tmp/ra2-baseline a7c53b7      # the `legacy-baseline` launch config serves this
```

Note: the browser pauses `requestAnimationFrame` in a hidden tab, which freezes the render
loop and makes a screenshot look stale. Drive frames with `window.animate()` when comparing.

### Still classic, on purpose

`public/JS/AI_Worker.js`, `public/JS/Path_finding_worker.js`, and all of `public/JS/AI/**`
remain unbundled classic scripts, because the AI workers call `importScripts()` with paths
computed at runtime. `public/JS/UI/*.html` are fetched by `$.ajax` at runtime.

---

## Stage 3 — TypeScript (done)

All 33 modules under `src/` are now `.ts`. Vite strips types with esbuild and never
type-checks, so **`npm run typecheck` (`tsc --noEmit`) is the gate**, and `npm run build`
runs it first.

**The build output is byte-identical to Stage 2** — same content hash,
`index-B7vGFFBn.js`. Nothing but types changed.

### Type-checked vs. deferred

`tsc` reported **3430 errors** on the freshly renamed tree. 95% were `TS2339`
("property does not exist"): 2015-era classes assign undeclared properties in their
constructors. That is a per-file typing job, not a migration job.

So 24 game modules carry `// @ts-nocheck` with a header explaining how to remove it.
Eleven files are fully checked today:

```
src/core/state.ts        src/core/renderer.ts     src/core/late.ts
src/core/type_registry.ts src/lib/JavaScript_helper.ts src/lib/priorityqueue.ts
src/Game_Container.ts    src/UI/Playing_layout.ts src/main.ts
src/types/pixi.d.ts      src/types/globals.d.ts
```

Removing one `@ts-nocheck` at a time, declaring that file's class fields, and keeping
`npm run typecheck` green is the intended path forward.

### Typings

- `src/types/pixi.d.ts` — hand-written declarations for the ~19 PIXI v3 APIs the game
  uses. Deliberately incomplete; **Stage 4 deletes this file** in favor of the typings
  that ship with PIXI v8. Do not invest in widening it.
- `src/types/globals.d.ts` — `$`, `jQuery`, `createjs`, and a `Window` augmentation for
  the six deliberate window bridges.
- `src/core/late.ts` — the registry is now a typed `LateBindings` interface naming all 57
  late-bound symbols. Each is `any` for now; replace an entry with a concrete type as its
  owning module gets typed.

`tsconfig.json` is loose on purpose: `strict: false`, `noImplicitAny: false`,
`useDefineForClassFields: false` (the legacy classes assign in constructors and would break
under ES2022 field semantics). `lib` is ES2021 for `String.prototype.replaceAll`.

### Latent bugs surfaced by the type-checker (reported, not fixed)

Type-checking found three pre-existing bugs. All behave identically to before the migration,
so none was changed:

1. **`Effect.ts:598`** — `CONTROLLER_ANIMATION.mouse_repair`'s constructor calls
   `constructor(...)` where it means `super(...)`. Throws on instantiation, and `super()` is
   never called. Currently unreachable: nothing references `CONTROLLER_ANIMATION`.
2. **`JavaScript_helper.ts:222`** — overwrites the native `String.prototype.replaceAll` with
   an incompatible `(search, replace, ignoreCase)` signature. No call sites anywhere.
3. **`Controler.ts:329`** — `get ship() { return SHIP_TYPE }`; `SHIP_TYPE` is defined nowhere.

`TS2554` on `postMessage(...)` in `AI_worker_comunication.ts` is *not* a bug: a local
three-parameter helper is called with two arguments, which JavaScript allows.

### Verification

| Signal | Baseline | Vite dev | Vite build |
| --- | --- | --- | --- |
| `tsc --noEmit` | n/a | 0 errors | 0 errors |
| Console errors | 0 | 0 | 0 |
| Failed requests | 0 | 0 | 0 |
| Base textures | 48 | 48 | 48 |
| Cached textures | 4248 | 4248 | 4248 |
| `mainstage` children | 15 | 15 | 15 |
| Teams / AI opponents | 3 / 4 | 3 / 4 | 3 / 4 |
| `AI_WORKER2` live | — | yes | yes |
| Both workers running | yes | yes | yes |
| Sidebar buttons | 5 | 5 | 5 |
| Window globals | 146 | 10 | 10 |

Bundle: 37 modules → 226.86 kB (54.11 kB gzip), unchanged from Stage 2.
`dist/JS/AI_Worker.js` and `dist/JS/Path_finding_worker.js` remain byte-identical passthrough.

---

## Stage 4a — PIXI v3.0.9 → v7.4.3 (done)

PIXI now comes from npm. `public/Scripts/pixi*.js` is deleted, `PIXI` is no longer a
window global (10 → 9), and `src/types/pixi.d.ts` is gone because v7 ships typings.

### The vendored pixi.js was patched

This is the discovery that shaped the stage. `public/Scripts/pixi.js` was **not** stock
v3.0.9. Its spritesheet middleware carried a local modification:

```js
if (window.FILECACHE && window.FILECACHE[texture_url]) {
    texture_url = window.FILECACHE[texture_url];
```

`Map.ts` pre-fetches the map image over XHR (to drive a progress bar), converts it to a
data URI, and stashes it in `window.FILECACHE`. The patched loader then used the cached
copy instead of refetching. From the game's side `FILECACHE` looked write-only, which is
why it survived Stages 1–3 unexplained. Swapping in the npm build without reproducing this
would have silently refetched every map texture.

That behaviour now lives in `src/core/pixi_loader.ts` — in our code, not in a vendored file.

### The loader shim

v7 removed the loader outright. Seven modules call `LOADER.add({name, url})` at module
evaluation and read `resources.<name>.textures` / `resources.<name>_image.texture` inside
`load_texture_done(loader, resources)`. Rewriting all seven onto the async `Assets` API
would have changed the texture pipeline and the PIXI version in the same commit, so
`src/core/pixi_loader.ts` reproduces the v3 contract instead, including:

- the implicit `<name>_image` child resource that v3 created for every spritesheet;
- the `FILECACHE` data-URI substitution;
- rethrowing instead of swallowing rejections — v3 called back synchronously, so a throw
  inside `load_texture_done` used to surface as an ordinary uncaught error.

### Filters

v5 removed the `aTextureCoord` attribute from filter vertex shaders (texture coords are
derived from `aVertexPosition` by the default vertex shader). `GlowFilter` and
`GlowFilter2` therefore compute their eight blur offsets **per-fragment** from
`vTextureCoord` instead of per-vertex — identical math and weights, one extra add per
sample. `NoiseFilter` loses `this.passes`, which v5+ has no concept of.
`TeamColorFilter`, `InverseAlpha`, and `Lighter4x` are fragment-only and port unchanged.
Uniforms lose the v3 `{ type, value }` wrapper.

### Other API drift

| v3 | v7 |
| --- | --- |
| `autoDetectRenderer(w, h, {transparent:true})` | `autoDetectRenderer({width, height, backgroundAlpha: 0})` |
| `new RenderTexture(renderer, w, h)` | `RenderTexture.create({width, height})` |
| `renderTexture.render(obj, null, clear)` | `renderer.render(obj, {renderTexture, clear})` |
| `Texture.fromImage` / `fromCanvas` (22 sites) | `Texture.from` |
| `extras.TilingSprite` / `extras.MovieClip` | `TilingSprite` / `AnimatedSprite` |
| `filters.BlurXFilter` | `BlurFilterPass(true)` |

### Verification

Dev and production build, against [MIGRATION_BASELINE.md](MIGRATION_BASELINE.md): `tsc`
clean, 0 console errors, 0 failed requests, WebGL, 15 stage children, 3 teams, 4 AI
opponents, `AI_WORKER2` live, both workers byte-identical, 5 sidebar buttons, 9 window
globals. All 8 spritesheets load — 4205 frames across `con`, `eff`, `map_ob`, `mapcon`,
`plane`, `sol`, `tex`, `veh` — plus their `_image` companions.

Fog of war was checked with `renderer.extract.pixels`: `InverseAlpha` is applied, mean
alpha 250, 97.8% opaque outside vision, and the three-state shroud (bright = visible,
dimmed = remembered, black = never seen) is intact.

With the camera centred, the rendered frame is **62.3% non-black at mean luminance 77.7**,
against **65.2% / 82.5** on PIXI v3. The gap is game progression, not rendering.

Bundle grows to 698 kB (195 kB gzip) because PIXI is bundled rather than served as a
separate 400 kB classic script.

### A measurement trap, recorded so it is not re-learned

Two artifacts made this stage look broken when it was not:

1. **The game edge-scrolls.** The automated browser parks the cursor at (0, 0), so the
   camera slides into the unexplored map corner within seconds and the frame goes black.
   This happens identically on PIXI v3 — Stage 3's production build measures 1.4%
   non-black under the same probe. Centre the cursor *and* re-centre the camera
   (`USER_CONTROLER.on_game_start()`) before judging a frame.

2. **`document.hidden` pauses `requestAnimationFrame`,** which freezes the render loop, so
   a screenshot shows a stale frame and the camera never clamps. Drive frames manually with
   `window.animate()`.

Also: after a Vite HMR reload, the app imports `/src/x.ts?t=<stamp>` while a probe's
`import('/src/x.ts')` resolves to a **different module instance**. Restart the dev server
before probing module state, or you will read an empty, freshly-evaluated module.

---

## Stage 4b — PIXI v7 → v8: deliberately not done

Scoped against pixi.js 8.19.0's actual source, not its changelog. v8 is not a version bump
for this codebase; it is a rewrite of the texture pipeline, the startup sequence, the
particle layer, and the shaders. Four findings:

**1. `Texture.from(url)` no longer loads anything.** It is now `Cache.get(id)`:

```js
function textureFrom(id, skipCache = false) {
  if (typeof id === "string") {
    return Cache.get(id);          // undefined if not already loaded
  }
  ...
}
```

The game calls `PIXI.Texture.from("IMG/…")` **16 times at module-evaluation time**
(`dashtt`, `healthtt`, `smooketexture`, `cloundbasetexture`, `lighttexture`, the minimap's
`hidecircle`, …). Under v8 every one returns `undefined`, because module evaluation happens
before any `await Assets.load(...)` can run. Those constants would have to become lazily
initialized state filled in after an async load — an architectural change to game startup,
touching `Image_process`, `Effect`, `Weapon`, `Map`, `Minimap`, and `Game_Container`.

**2. `autoDetectRenderer` returns `Promise<Renderer>`,** so the bootstrap becomes async.

**3. `ParticleContainer<T extends IParticle>` no longer accepts Sprites.** It exposes
`addParticle` / `particleChildren`. Fog of war and the minimap both push `PIXI.Sprite` into
one, so both get reworked.

**4. The six GLSL filters get rewritten a second time.** v8's `Filter` takes a `GlProgram`,
and its default filter vertex is GLSL ES 3.00 (`in vec2 aPosition; out vec2 vTextureCoord;`,
`uTexture`, `finalColor`) — no `gl_FragColor`, no `uSampler`. Avoiding WGSL means pinning
`preference: 'webgl'`, i.e. paying v8's complexity while forgoing the only reason to want it.

Mechanical by comparison: `BLEND_MODES` → plain strings, `BaseTexture` → `TextureSource`
(30 references). `Graphics` survives — `lineStyle` / `beginFill` / `drawRect` remain as
deprecated shims.

**Decision:** stop at v7. It is current, maintained, npm-published, fully typed, WebGL, and
verified green against the baseline. The payoff for v8 is WebGPU, which a 2D isometric RTS
with hand-written GLSL filters does not benefit from. The remaining `@ts-nocheck` debt is
worth more than v8.

---

## Stage 5 — retiring `@ts-nocheck` (in progress)

24 of 33 modules still carry `// @ts-nocheck`. Remove one directive at a time, declare that
file's class fields, and keep `npm run typecheck` green. Progress is tracked below.
