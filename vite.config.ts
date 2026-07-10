import { defineConfig } from "vite";

// Stage 1 of the Vite/TypeScript migration.
//
// The game is still 100% legacy: `index.html` loads ~30 ordered classic <script> tags,
// and the whole codebase communicates through 146 window globals. Nothing is a module yet.
//
// Everything under public/ is served and copied byte-for-byte, never transformed. That is
// deliberate and load-bearing: the AI web workers call importScripts() with paths computed
// at runtime (e.g. `importScripts(PARAM.custom_path + random())`), which no bundler can
// statically analyze. Rewriting or hashing those files would break the AI opponents.
//
// See MIGRATION_BASELINE.md for the behavior this build must reproduce.
export default defineConfig({
  root: ".",
  publicDir: "public",
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // The legacy inline bootstrap in index.html reads `PIXI` off the window before any
    // game script parses. Keep output as close to the source ordering as possible.
    target: "es2020",
  },
});
