# Copilot Instructions
**Overview**
- Single-page RTS prototype launched via index.html; scripts load sequentially and share globals, so preserve tag order when adding new dependencies.
- Rendering is PixiJS overlaid on fixed containers from JS/Game_Container.js; customize layer placement by adjusting container order instead of creating new renderers.
- The main loop lives on window.animate (set up in index.html) and calls CONTROLER, map, MINIMAP, FOG_GRAPGICH, GAME_OBJECT, AUDIO, renderer in that order—respect this when adding new per-frame work.
**Runtime Workflow**
- Serve via HTTP (e.g. npx http-server .) so XHR map loading, Web Workers, and sound assets work; file:// will break Data/map and worker fetches.
- window.onload triggers GAME_MANAGER.load_texture, which pipelines PIXI.loader progress → *_Type.load_texture_done → on_texture_load_done in JS/Done.js; keep new loaders registered before GO manager.
- JS/Done.js waits for list_wait_done flags; if you introduce new asset buckets extend list_wait_done and call on_texture_load_done(name) from the loader.
- When testing AI or pathfinding tweaks, reload the page because workers cache scripts with random() cache busting from Scripts/JavaScript_helper.js.
**Map & Grid**
- JS/Map.js fetches Data/map/map.json to resolve offsets and Data/map/<name>.txt for object spawns, then builds PIXI RenderTextures; map.update only trims view rectangles, so keep draw resizing cheap.
- GRID.init(map) seeds height/material/object buffers and posts init_map_data to both Path_finding_worker.js and AI_Worker.js; if you change buffer schemas adjust the corresponding worker handlers.
- GRID manages occupancy arrays and fog; game units must call GRID.set_object / unset_object / setfogmap inside their life-cycle (see Game_object/Game_Unit.js init/delete).
**Game Objects**
- GAME_OBJECT (JS/Game_object/Game_object.js) owns update lists for units, weapons, and effects; add instances through GAME_OBJECT.add_unit/add_effect so they get sorted and z-indexed before drawing.
- Unit definitions live under JS/Game_object/... with *_Type tables providing metadata; creation flows through GAME_OBJECT.add_unit(x,y,z,team,typeDescriptor).
- Each Game_unit subclass should manage z_idx, health sprites, and command handling; reuse convert2screen helpers and call MINIMAP.add/remove where needed.
- IMAGE_PROCESS (JS/Image_process.js) handles team recoloring and sprite slicing; prefer process_gl/process_vehicle instead of manual PIXI.Texture construction to keep TEAM colors in sync.
**UI & Input**
- USER_CONTROLER in JS/Controler.js wires to window event handlers set in index.html; new interactions typically attach via USER_CONTROLER methods rather than binding DOM listeners directly.
- PLAYING_LAYOUT (JS/UI/Playing_layout.js) renders the sidebar; it expects BuyData objects supplied by Team_Controler.update_unit_can_buy and uses CSS classes buttonsplash/buttonon, so keep those properties filled when altering unit purchase flows.
- Minimap and fog sprites are appended in index.html before the UI loads; ensure size changes call MINIMAP.resize() and FOG_GRAPGICH.update(true) (see window.onresize).
**AI & Workers**
- AI_Worker.js runs inside a Web Worker started by JS/AI_worker_comunication.js; it importScripts AI/AI_Task.js, AI/State_Graph.js, and the implementation under AI/Phuong or AI/Khoan—update both sides when altering message payloads.
- Worker telemetry encodes unit state via Game_unit.set_data into a shared Uint32Array; keep field order stable with INDEX_TYPE (Game_object/Game_Unit.js) or adjust AI decoding tables accordingly.
- Path_finding_worker.js responds to GRID.postMessage('find_path'); GRID.groupg_idx links responses back to Movealbe_unit instances, so retain request ids when changing worker APIs.
- AI static map hints are emitted from map object text files as STATIC_* entries and forwarded through AI_WORKER.add_ai_static_info; mirror any new directives on both map parsing and worker logic.
**Assets & Data**
- Textures live under IMG/... with map atlases in IMG/MAP/<type>; map.json defines tile offsets so update it if you add frames to the atlas.
- Unit art uses directory-specific json atlases under IMG/Unit and must match property.path strings in the *_TYPE definitions.
- Audio assets load through JS/Audio.js using SoundJS; keep manifest entries aligned with Audio/Music/ filenames to avoid runtime 404s.
- Data files rely on camelCase keys but content is mostly numeric; preserve ASCII encoding and trailing newline-less text for parsing stability.
**Conventions**
- Code mixes ES5 constructors and ES6 classes but keeps everything on the global namespace; avoid module systems and maintain strict script ordering in index.html.
- Most globals are referenced without window., so name collisions are easy; prefer long descriptive identifiers to avoid shadowing.
- Use existing helper math functions (mySin/myCos/myAtan) for performance-sensitive loops instead of Math.* calls.
- Maintain GLOBAL.SPEED as the single time scale multiplier (index.html); if you add timed logic multiply by GLOBAL.SPEED so pause/fast-forward features stay consistent.
