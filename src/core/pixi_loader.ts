// A small compatibility layer that reproduces the PIXI v3 `PIXI.loader` surface on top
// of PIXI v7, which removed the loader entirely in favour of the async `Assets` API.
//
// Seven modules call `LOADER.add({ name, url })` at evaluation time and then read
// `resources.<name>.textures` / `resources.<name>_image.texture` in their
// `load_texture_done(loader, resources)` callback. Rewriting all seven to `Assets` would
// have meant changing the texture pipeline and the migration at the same time, so instead
// the old contract is honoured here and the call sites stay as they are.
//
// Two v3 behaviours this must reproduce exactly:
//
//   1. Adding a spritesheet JSON implicitly creates a SECOND resource named
//      `<name>_image`, holding the sheet's source image as a Texture.
//
//   2. The vendored public/Scripts/pixi.js was *patched* by the original authors: its
//      spritesheet middleware checked `window.FILECACHE[texture_url]` and, when present,
//      loaded the sheet image from that cached data URI instead of refetching it. Map.ts
//      pre-fetches the map image over XHR to drive a progress bar, then stashes it there.
//      That patch is why the vendored file could not simply be replaced by the npm build.
//      The behaviour now lives here, in our own code.
//
// `load()` may be called more than once: Map.ts adds the "tex" sheet after the initial
// batch has already finished, exactly as it did against v3's singleton loader.

import { BaseTexture, Spritesheet, Texture } from "pixi.js";

export interface LoaderResource {
  name: string;
  url: string;
  /** Present for the implicit `<name>_image` resource. */
  texture?: Texture;
  /** Present for spritesheet resources: frame name -> Texture. */
  textures?: Record<string, Texture>;
}

interface QueueEntry {
  name: string;
  url: string;
  crossOrigin?: boolean;
}

type ProgressHandler = (loader: CompatLoader, resource: LoaderResource) => void;
type CompleteHandler = (loader: CompatLoader, resources: Record<string, LoaderResource>) => void;

/** Resolve `meta.image` against the spritesheet JSON's directory, honouring absolute URLs. */
function resolveImageUrl(jsonUrl: string, image: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const dir = jsonUrl.slice(0, jsonUrl.lastIndexOf("/"));
  return dir ? `${dir}/${image}` : image;
}

function loadBaseTexture(url: string, crossOrigin?: boolean): Promise<BaseTexture> {
  const base = BaseTexture.from(url, crossOrigin ? { resourceOptions: { crossorigin: "anonymous" } } : undefined);
  if (base.valid) return Promise.resolve(base);
  return new Promise((resolve, reject) => {
    base.once("loaded", () => resolve(base));
    base.once("error", () => reject(new Error(`failed to load ${url}`)));
  });
}

class CompatLoader {
  /** 0..100, matching v3. Callers divide by 100. */
  progress = 0;
  resources: Record<string, LoaderResource> = {};

  private queue: QueueEntry[] = [];
  private progressHandlers: ProgressHandler[] = [];
  private completeHandlers: CompleteHandler[] = [];
  private running = false;

  add(options: QueueEntry): this {
    if (!this.resources[options.name] && !this.queue.some((q) => q.name === options.name)) {
      this.queue.push(options);
    }
    return this;
  }

  on(event: "progress" | "complete", handler: ProgressHandler | CompleteHandler): this {
    if (event === "progress") this.progressHandlers.push(handler as ProgressHandler);
    else this.completeHandlers.push(handler as CompleteHandler);
    return this;
  }

  load(callback?: CompleteHandler): this {
    // v3's loader invoked its callback synchronously, so a throw inside `load_texture_done`
    // surfaced as an ordinary uncaught error. Here the callback runs inside a promise, so
    // rethrow asynchronously rather than letting it become a silent unhandled rejection.
    this.run(callback).catch((error) => {
      setTimeout(() => {
        throw error;
      });
    });
    return this;
  }

  private async run(callback?: CompleteHandler): Promise<void> {
    if (this.running) throw new Error("CompatLoader.load() called while a batch was already in flight");
    this.running = true;

    const batch = this.queue;
    this.queue = [];
    this.progress = 0;

    // Each spritesheet counts as two units of work (its JSON, then its image), which is
    // how v3 accounted for the implicit `<name>_image` child resource.
    const total = Math.max(1, batch.length * 2);
    let done = 0;
    const step = (resource: LoaderResource) => {
      done += 1;
      this.progress = (done / total) * 100;
      for (const h of this.progressHandlers) h(this, resource);
    };

    for (const entry of batch) {
      const data = await fetch(entry.url).then((r) => r.json());
      const sheetResource: LoaderResource = { name: entry.name, url: entry.url };
      this.resources[entry.name] = sheetResource;
      step(sheetResource);

      let imageUrl = resolveImageUrl(entry.url, data.meta.image);
      const cacheKey = imageUrl;
      const cached = window.FILECACHE && window.FILECACHE[cacheKey];
      if (cached) {
        imageUrl = cached;
        // The patched vendor build deleted `FILECACHE[texture_url]` *after* reassigning
        // texture_url, so it evicted the data URI's own key and leaked the original entry.
        delete window.FILECACHE[cacheKey];
      }

      const baseTexture = await loadBaseTexture(imageUrl, entry.crossOrigin);
      const texture = new Texture(baseTexture);

      const sheet = new Spritesheet(baseTexture, data);
      sheetResource.textures = await sheet.parse();

      const imageResource: LoaderResource = { name: `${entry.name}_image`, url: imageUrl, texture };
      this.resources[imageResource.name] = imageResource;
      step(imageResource);
    }

    this.progress = 100;
    this.running = false;

    for (const h of this.completeHandlers) h(this, this.resources);
    callback?.(this, this.resources);
  }
}

/** Drop-in replacement for the old `PIXI.loader` singleton. */
export const LOADER = new CompatLoader();
