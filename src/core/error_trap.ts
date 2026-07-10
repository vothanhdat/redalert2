// Records uncaught exceptions and unhandled rejections from the moment the module graph
// starts evaluating, i.e. before any texture-load timer can fire.
//
// This exists because uncaught exceptions do NOT show up as `console.error` entries. Two
// PIXI v7 regressions shipped behind that gap: `RenderTexture.getBase64()` (the minimap
// image) and `RenderTexture.getCanvas()` (the per-pixel hit mask that makes buildings
// clickable). Both threw inside a `setTimeout`, silently, leaving a feature dead.
//
// Read `window.__uncaught` when verifying a change. Zero console.error output proves
// nothing on its own.

export interface TrappedError {
  kind: "error" | "rejection";
  message: string;
  at?: string;
  stack?: string;
}

const trapped: TrappedError[] = [];

window.addEventListener(
  "error",
  (event) => {
    trapped.push({
      kind: "error",
      message: event.message,
      at: `${event.filename ?? "?"}:${event.lineno}:${event.colno}`,
      stack: event.error?.stack,
    });
  },
  true,
);

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  trapped.push({
    kind: "rejection",
    message: String(reason?.message ?? reason),
    stack: reason?.stack,
  });
});

/** Exposed for the browser-driven checks; also handy from devtools. */
(window as unknown as { __uncaught: TrappedError[] }).__uncaught = trapped;

export { trapped as uncaught_errors };
