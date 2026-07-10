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
// (see the ORDER list in src/main.js). References that point forward stay late-bound
// and go through this registry instead.
//
// A module that owns a forward-referenced symbol publishes it here once, at the end
// of its own evaluation; consumers read `LATE.Foo` at call time. This is what
// `window.Foo` was doing before, except it is now explicit, greppable, and typeable.
//
// Shrinking this registry means reordering modules so more references point backward.

export const LATE = {};
