// Ambient globals that survive the module conversion. See MIGRATION_LOG.md, Stage 2:
// ten window globals remain, and each is here for a reason.

/** jQuery 2.1.4, loaded as a classic <script>. Only $.ajax and the DOM wrapper are used. */
declare const $: any;
declare const jQuery: any;

/** SoundJS 0.6.2, loaded as a classic <script>. Only createjs.Sound is used. */
declare const createjs: {
  Sound: {
    registerSound(src: string, id?: string, data?: any): boolean;
    registerSounds(sounds: any[], basePath?: string): void;
    play(id: string, props?: any): any;
    stop(): void;
    /** SoundJS passes `scope` as the third argument, unlike the DOM's addEventListener. */
    on(type: string, listener: (...args: any[]) => void, scope?: any, once?: boolean, data?: any, useCapture?: boolean): any;
    volume: number;
    muted: boolean;
    [key: string]: any;
  };
  [key: string]: any;
};

interface Window {
  /** Called from inline onclick= handlers in the runtime-injected JS/UI/Menu.html. */
  GAME_MANAGER: {
    on_menu(): void;
    on_unloadmenu(): void;
    on_start_game(): void;
    on_unload_game(): void;
    load_texture(): void;
    load_map(): void;
    choose_campain(): void;
    choose_skrimming(): void;
    choose_multiplayer(): void;
    choose_setting(): void;
    choose_about(): void;
  };

  /** Called from inline onclick= handlers in the runtime-injected JS/UI/Playing_layout.html. */
  PLAYING_LAYOUT: any;

  /**
   * Defined by the <script> inside JS/UI/Menu.html, which jQuery evaluates in global
   * scope when the fragment is appended. Undefined until GAME_MANAGER.on_menu() runs,
   * which is why every call site guards it.
   */
  MENU?: {
    display_progess(value: boolean): void;
    set_progess(value: number): void;
    choose_campain(): void;
    choose_skrimming(): void;
    choose_multiplayer(): void;
    choose_setting(): void;
    choose_about(): void;
  };

  /** Done.js starts the render loop once every texture has loaded. */
  animate: () => void;

  /** Map texture cache, keyed by image URL, populated in Map.ts. */
  FILECACHE: Record<string, string>;
}

/**
 * A unit/object definition table, keyed by unit name (e.g. VEHICLE_TYPE.veh_mcv_allied).
 * Map files reference these by string, so they are open-ended by design — see
 * src/core/type_registry.ts.
 */
type UnitTypeTable = Record<string, any>;

/** One entry of the TEAM table in src/Controler.ts. */
interface Team {
  /** RGB triple used for team colouring and the minimap marker. */
  color: number[];
  /** The Team_Controler / Ai_Controlder driving this team. */
  team: any;
  _id_: number;
  /** Auto-incrementing unit id; reading it consumes the next value. */
  readonly ID: number;
  /** Set by Game_unit.on_attacked, read by the AI to trigger a defensive response. */
  is_attack?: boolean;
}
