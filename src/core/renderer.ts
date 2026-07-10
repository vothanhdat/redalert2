// PIXI renderers, created by the inline bootstrap <script> in the old index.html.
//
// `PIXI` is still a window global supplied by the classic <script> tag for the
// vendored pixi.js v3 build. Bare `PIXI` resolves through the global scope, which
// module code can still see. Stage 4 replaces this with an npm import.

import { screen_width, screen_height } from "./state";

export const renderer = PIXI.autoDetectRenderer(screen_width, screen_height, {
  transparent: true,
  antialias: false,
});
renderer.view.style.position = "absolute";
renderer.view.style.top = "0px";
renderer.view.style.left = "0px";

export const mouserenderer = PIXI.autoDetectRenderer(55, 43, {
  transparent: true,
  antialias: false,
});
mouserenderer.view.style.position = "absolute";
mouserenderer.view.style.pointerEvents = "none";
mouserenderer.view.style.cursor = "none";
