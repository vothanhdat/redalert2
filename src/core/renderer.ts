// PIXI renderers, created by the inline bootstrap <script> in the pre-Vite index.html.
//
// v7's autoDetectRenderer takes a single options object instead of (width, height, options),
// and `transparent: true` became `backgroundAlpha: 0`. It is still synchronous; v8 makes it
// async, which is why that upgrade is a separate stage.

import { autoDetectRenderer, type IRenderer } from "pixi.js";

import { screen_width, screen_height } from "./state";

export const renderer: IRenderer = autoDetectRenderer({
  width: screen_width,
  height: screen_height,
  backgroundAlpha: 0,
  antialias: false,
});
(renderer.view as HTMLCanvasElement).style.position = "absolute";
(renderer.view as HTMLCanvasElement).style.top = "0px";
(renderer.view as HTMLCanvasElement).style.left = "0px";

export const mouserenderer: IRenderer = autoDetectRenderer({
  width: 55,
  height: 43,
  backgroundAlpha: 0,
  antialias: false,
});
(mouserenderer.view as HTMLCanvasElement).style.position = "absolute";
(mouserenderer.view as HTMLCanvasElement).style.pointerEvents = "none";
(mouserenderer.view as HTMLCanvasElement).style.cursor = "none";
