// Mutable runtime state that used to live on `window`, declared by the inline
// bootstrap <script> in the old index.html.
//
// These are exported with `let` so importers get ES module *live bindings*: a bare
// read of `screen_x` in any module always observes the current value, exactly as a
// global read did. Imported bindings are read-only, though, so every write goes
// through a setter here.

export const SPEED = 1.5;
export const GRAVITY = 20;
export const UI_WIDTH = 250;
export const UI_HEIGTH = 30;

export let screen_width = window.innerWidth;
export let screen_height = window.innerHeight;
export let display_width = screen_width - UI_WIDTH;
export let display_height = screen_height - UI_HEIGTH;
export let screen_x = 0;
export let screen_y = 0;
export let screen_w = display_width / 60;
export let screen_h = display_height / 30;
export let max_x = 0;
export let max_y = 0;

/** The active Map instance. Undefined until GAME_MANAGER.on_start_game(). */
export let map;

export function set_screen_x(value) {
  screen_x = value;
}
export function set_screen_y(value) {
  screen_y = value;
}
export function set_max_x(value) {
  max_x = value;
}
export function set_max_y(value) {
  max_y = value;
}
export function set_map(value) {
  map = value;
}

export function resize_screen() {
  screen_width = window.innerWidth;
  screen_height = window.innerHeight;
  display_width = screen_width - UI_WIDTH;
  display_height = screen_height - UI_HEIGTH;
  screen_w = display_width / 60;
  screen_h = display_height / 30;
}
