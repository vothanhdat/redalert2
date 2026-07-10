// Minimal ambient declarations for the vendored pixi.js v3.0.9 (public/Scripts/pixi.js),
// which predates bundled typings. This covers only the surface the game actually uses.
//
// Deliberately incomplete and deliberately lenient: v3's API differs sharply from modern
// PIXI, and Stage 4 replaces this whole file with the typings that ship with PIXI v8.
// Do not invest in widening it.

declare namespace PIXI {
  const VERSION: string;

  interface RendererOptions {
    transparent?: boolean;
    antialias?: boolean;
    resolution?: number;
    backgroundColor?: number;
    clearBeforeRender?: boolean;
    preserveDrawingBuffer?: boolean;
  }

  /** 0 = UNKNOWN, 1 = WEBGL, 2 = CANVAS */
  interface SystemRenderer {
    type: number;
    width: number;
    height: number;
    view: HTMLCanvasElement;
    resize(width: number, height: number): void;
    render(target: DisplayObject, renderTexture?: RenderTexture, clear?: boolean): void;
    destroy(removeView?: boolean): void;
  }

  function autoDetectRenderer(width: number, height: number, options?: RendererOptions): SystemRenderer;

  class Point {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x?: number, y?: number): void;
  }

  class Rectangle {
    constructor(x?: number, y?: number, width?: number, height?: number);
    x: number;
    y: number;
    width: number;
    height: number;
  }

  class DisplayObject {
    x: number;
    y: number;
    position: Point;
    scale: Point;
    pivot: Point;
    anchor: Point;
    rotation: number;
    alpha: number;
    visible: boolean;
    renderable: boolean;
    parent: Container;
    worldTransform: any;
    filters: AbstractFilter[] | null;
    blendMode: number;
    tint: number;
    width: number;
    height: number;
    getBounds(): Rectangle;
    updateTransform(): void;
    [key: string]: any;
  }

  class Container extends DisplayObject {
    children: DisplayObject[];
    addChild<T extends DisplayObject>(child: T): T;
    addChildAt<T extends DisplayObject>(child: T, index: number): T;
    removeChild(child: DisplayObject): DisplayObject;
    removeChildAt(index: number): DisplayObject;
    removeChildren(begin?: number, end?: number): DisplayObject[];
    getChildAt(index: number): DisplayObject;
    destroy(destroyChildren?: boolean): void;
  }

  class ParticleContainer extends Container {
    constructor(size?: number, properties?: any, batchSize?: number);
  }

  class BaseTexture {
    width: number;
    height: number;
    source: any;
    scaleMode: number;
  }

  class Texture {
    constructor(baseTexture: BaseTexture, frame?: Rectangle, crop?: Rectangle, trim?: Rectangle, rotate?: number);
    baseTexture: BaseTexture;
    frame: Rectangle;
    width: number;
    height: number;
    static fromImage(imageUrl: string, crossorigin?: boolean, scaleMode?: number): Texture;
    static fromCanvas(canvas: HTMLCanvasElement, scaleMode?: number): Texture;
    static fromFrame(frameId: string): Texture;
    static EMPTY: Texture;
  }

  class RenderTexture extends Texture {
    constructor(renderer: SystemRenderer, width?: number, height?: number, scaleMode?: number, resolution?: number);
    render(displayObject: DisplayObject, matrix?: any, clear?: boolean, updateTransform?: boolean): void;
    resize(width: number, height: number, updateBase?: boolean): void;
    clear(): void;
  }

  class Sprite extends Container {
    constructor(texture?: Texture);
    texture: Texture;
    static fromImage(imageId: string, crossorigin?: boolean, scaleMode?: number): Sprite;
  }

  class Graphics extends Container {
    lineStyle(lineWidth?: number, color?: number, alpha?: number): Graphics;
    beginFill(color?: number, alpha?: number): Graphics;
    endFill(): Graphics;
    moveTo(x: number, y: number): Graphics;
    lineTo(x: number, y: number): Graphics;
    drawRect(x: number, y: number, width: number, height: number): Graphics;
    drawCircle(x: number, y: number, radius: number): Graphics;
    drawPolygon(path: number[]): Graphics;
    clear(): Graphics;
  }

  class AbstractFilter {
    constructor(vertexSrc?: string | string[], fragmentSrc?: string | string[], uniforms?: any);
    uniforms: any;
    padding: number;
    /** Multi-pass filters (e.g. blur) expose their sub-filters here. */
    passes: AbstractFilter[];
    applyFilter(renderer: SystemRenderer, input: any, output: any, clear?: boolean): void;
  }

  namespace filters {
    class BlurXFilter extends AbstractFilter {
      blur: number;
    }
    class BlurYFilter extends AbstractFilter {
      blur: number;
    }
  }

  namespace extras {
    class TilingSprite extends Sprite {
      constructor(texture: Texture, width?: number, height?: number);
      tilePosition: Point;
      tileScale: Point;
    }
    class MovieClip extends Sprite {
      constructor(textures: Texture[]);
      animationSpeed: number;
      loop: boolean;
      play(): void;
      stop(): void;
      gotoAndPlay(frameNumber: number): void;
      gotoAndStop(frameNumber: number): void;
    }
  }

  const BLEND_MODES: {
    NORMAL: number;
    ADD: number;
    MULTIPLY: number;
    SCREEN: number;
    LIGHTEN: number;
    [key: string]: number;
  };

  const SCALE_MODES: { LINEAR: number; NEAREST: number };

  interface LoaderResource {
    name: string;
    url: string;
    texture?: Texture;
    textures?: { [key: string]: Texture };
    data?: any;
    [key: string]: any;
  }

  interface Loader {
    progress: number;
    resources: { [key: string]: LoaderResource };
    add(options: { name: string; url: string; crossOrigin?: boolean }): Loader;
    add(name: string, url: string): Loader;
    on(event: "progress" | "complete" | "error", fn: (loader: Loader, resource: LoaderResource) => void): Loader;
    load(cb?: (loader: Loader, resources: { [key: string]: LoaderResource }) => void): Loader;
    once(event: string, fn: (...args: any[]) => void): Loader;
  }

  const loader: Loader;

  namespace utils {
    const TextureCache: { [key: string]: Texture };
    const BaseTextureCache: { [key: string]: BaseTexture };
  }
}
