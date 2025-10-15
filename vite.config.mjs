import path from "node:path";
import { defineConfig } from "vite";
import serveStatic from "serve-static";
import { viteStaticCopy } from "vite-plugin-static-copy";

const legacyJsDir = path.resolve(__dirname, "src/JS");

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "src/JS/**/*",
          dest: "JS"
        }
      ]
    }),
    {
      name: "legacy-js-dev-server",
      configureServer(server) {
        const staticMiddleware = serveStatic(legacyJsDir);
        server.middlewares.use("/JS", (req, res, next) => {
          staticMiddleware(req, res, next);
        });
        server.watcher.add(legacyJsDir);
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    host: true,
    port: 5173
  }
});
