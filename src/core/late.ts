// Late-bound cross-module references.
//
// The game's reference graph is genuinely circular: Game_object calls into
// Construction_unit, which extends Game_unit, which calls back into Game_object.
// Under classic <script> tags this worked because every reference was resolved off
// `window` at *call* time, long after all scripts had parsed.
//
// ES modules resolve imports at *load* time, so a module that imports a file which
// loads later would invert evaluation order and break `class X extends Y`. To keep
// the import graph acyclic we allow modules to import only files that load earlier
// (see the import list in src/main.ts). References that point forward stay late-bound
// and go through this registry instead.
//
// A module that owns a forward-referenced symbol publishes it here once, at the end
// of its own evaluation; consumers read `LATE.Foo` at call time. This is what
// `window.Foo` was doing before, except it is now explicit, greppable, and typed.
//
// Every entry is `any` for now. As each owning module gets real types, replace the
// matching entry here with the concrete type; that is what makes the registry pay for
// itself over the old `window` lookups.
//
// Shrinking this registry means reordering modules so more references point backward.

export interface LateBindings {
  ADDITIONAL_TYPE: any;
  AI_WORKER: any;
  ATTACK_TYPE: any;
  CONSTRUCTION_TYPE: any;
  Construction_unit: any;
  Defender_Construction_unit: any;
  EFFECT_FIRE_TYPE: any;
  EFFECT_TYPE: any;
  Effect: any;
  FOG_GRAPGICH: any;
  FireEffect: any;
  Flyable_Unit: any;
  GAME_OBJECT: any;
  GAME_UNIT_INFO_GLOBAL: any;
  GRID: any;
  Game_Effect: any;
  Game_unit: any;
  Game_weapon: any;
  Ground_moveable_unit: any;
  Grouph_mine: any;
  Heap_mine: any;
  Light_Effect: any;
  Light_Effect_Autoscale: any;
  MAP_CONSTRUCTION_UNIT_TYPE: any;
  MAP_OBJECT_TYPE: any;
  MINIMAP: any;
  Map_Building_Construction_unit: any;
  Map_Construction_unit: any;
  Map_object: any;
  Map_scrap: any;
  Mine: any;
  Movealbe_unit: any;
  PLANE_UNIT_TYPE: any;
  PLAYING_LAYOUT: any;
  Parachutist: any;
  Parachutist_Sprite: any;
  Repair_Effect: any;
  SOLIDER_TYPE: any;
  SmokeEffect: any;
  SmokeEffect2: any;
  SmokeEffect2_supersort: any;
  Solider_unit: any;
  Tree: any;
  USER_CONTROLER: any;
  VEHICLE_TYPE: any;
  VEHICLE_UNIT: any;
  WEAPON: any;
  Weapon: any;
  calcfar: any;
  calcfar2: any;
  convert2codinate: any;
  convert2screen: any;
  convert2screenwithoutsrcpos: any;
  createline2: any;
  get_frame_idx: any;
  on_texture_load_done: any;
  sort_unique: any;
}

/** Populated by each owning module via `Object.assign(LATE, { ... })`. */
export const LATE = {} as LateBindings;
