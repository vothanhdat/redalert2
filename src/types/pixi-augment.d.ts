// The game hangs its own bookkeeping off PIXI display objects. Declaring the fields here
// keeps them visible to the type-checker instead of forcing a cast at every use site.

import "pixi.js";

declare module "pixi.js" {
  interface DisplayObject {
    /**
     * Isometric depth key. `GAME_OBJECT.main_loop` sorts `stage.children` by this every
     * frame — the game's painter's algorithm. Roughly `x + y`, adjusted per unit type.
     */
    z_idx?: number;

    /**
     * Set by effects that have finished, so the next `main_loop` sweep can splice them out
     * of their ParticleContainer without walking the whole scene graph.
     */
    had_remove?: boolean;
  }
}
