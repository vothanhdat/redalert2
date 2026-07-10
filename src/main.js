// Entry point. This is the inline bootstrap <script> that used to live in index.html.
//
// The side-effect imports below are listed in the exact order the old <script> tags
// loaded. Every module imports only files that appear earlier in this list, so the
// import graph is acyclic and ES module evaluation order reproduces the original
// script order. Do not reorder without re-checking src/core/late.js.

import "./lib/JavaScript_helper.js";
import "./lib/priorityqueue.js";
import "./Game_Container.js";
import "./LOADER_PROGESS.js";
import "./Audio.js";
import "./Map.js";
import "./Controler.js";
import "./Image_process.js";
import "./Game_object/GRID.js";
import "./Game_object/Game_object.js";
import "./Game_object/Game_Unit.js";
import "./Game_object/Construction/Construction_Unit.js";
import "./Game_object/Construction/Construction_Unit_Type.js";
import "./Game_object/MoviableUnit/MoviableUnit.js";
import "./Game_object/MoviableUnit/Solider_Unit/Solider_Unit.js";
import "./Game_object/MoviableUnit/Solider_Unit/Solider_Unit_Type.js";
import "./Game_object/MoviableUnit/Vihicle_Unit/Vihicle_Unit.js";
import "./Game_object/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type.js";
import "./Game_object/MoviableUnit/Flyable_Unit.js";
import "./Game_object/Weapon/Weapon.js";
import "./Game_object/Weapon/Weapon_Type.js";
import "./Game_object/Map_Object/Map_object.js";
import "./Game_object/Construction/Map_Construction_Unit.js";
import "./Game_object/Effect/Effect.js";
import "./AI_worker_comunication.js";
import "./UI/Playing_layout.js";
import "./UI/Minimap.js";
import "./Done.js";

import { renderer, mouserenderer } from "./core/renderer.js";
import { SPEED, map, set_map, resize_screen, screen_width, screen_height } from "./core/state.js";

import { graphics, graphics2, mainstage, mouse_stage } from "./Game_Container.js";
import { LOADER_SCREEN } from "./LOADER_PROGESS.js";
import { AUDIO } from "./Audio.js";
import { Map as GameMap } from "./Map.js";
import { CONTROLER, USER_CONTROLER } from "./Controler.js";
import { GAME_OBJECT } from "./Game_object/Game_object.js";
import { CONSTRUCTION_UNIT } from "./Game_object/Construction/Construction_Unit.js";
import { SOLIDER_UNIT } from "./Game_object/MoviableUnit/Solider_Unit/Solider_Unit.js";
import { VEHICLE_UNIT } from "./Game_object/MoviableUnit/Vihicle_Unit/Vihicle_Unit.js";
import { PLANE_UNIT } from "./Game_object/MoviableUnit/Flyable_Unit.js";
import { EFFECT } from "./Game_object/Effect/Effect.js";
import { MAP_OBJECT } from "./Game_object/Map_Object/Map_object.js";
import { MAP_CONSTRUCTION_UNIT } from "./Game_object/Construction/Map_Construction_Unit.js";
import { FOG_GRAPGICH, MINIMAP } from "./UI/Minimap.js";

let drawtime = performance.now();

window.onmousemove = function (event) {
    USER_CONTROLER.onmousemove(event);
}

window.ondblclick = function (event) {
    USER_CONTROLER.ondblclick(event);
    return true;
}

window.onmousedown = function (event) {
    USER_CONTROLER.onmousedown(event);
}

window.onmouseup = function (event) {
    USER_CONTROLER.onmouseup(event);
}

window.onmouseleave = function (event) {
    USER_CONTROLER.onmouseleave(event);
    return true;
}

window.onkeyup = function (event) {
    USER_CONTROLER.onkeyup(event);
    return true;
}

window.onkeydown = function (event) {
    USER_CONTROLER.onkeydown(event);
    return true;
}

window.onresize = function () {
    resize_screen();
    renderer.resize(screen_width, screen_height);
    map && map.update(true);
    FOG_GRAPGICH && FOG_GRAPGICH.update(true);
    MINIMAP && MINIMAP.resize();
}

window.onload = function () {
    GAME_MANAGER.load_texture();
}

window.oncontextmenu = function () {
    return false;
}

function animate() {
    var deltatime = (performance.now() - drawtime) / 16.67;
    if (deltatime > 15)
        deltatime = 1;
    drawtime = performance.now();

    graphics.clear();
    graphics2.clear();

    // 1.5ms
    CONTROLER.update(deltatime * SPEED);

    map.update(deltatime * SPEED);

    //1.5ms
    MINIMAP.update(deltatime * SPEED);

    // 0.5ms
    FOG_GRAPGICH.update(deltatime * SPEED);

    // 2 - 6ms
    GAME_OBJECT.main_loop(deltatime * SPEED);

    AUDIO.process();

    //0.5 - 2ms
    renderer.render(mainstage);

    requestAnimationFrame(animate);
}

// Done.js calls window.animate() once every texture has loaded.
window.animate = animate;

FOG_GRAPGICH.init();

mainstage.addChild(FOG_GRAPGICH.get_fog_sprite_area());
mainstage.addChild(MINIMAP.get_minimap_sprite());

mouse_stage.addChild(USER_CONTROLER.get_mouse_sprite());

AUDIO.load_sound();

// MENU is defined by the inline <script> inside JS/UI/Menu.html, which jQuery evaluates
// in global scope when the fragment is appended. It only exists after on_menu().
const GAME_MANAGER = {
    on_menu() {
        $.ajax({
            url: "JS/UI/Menu.html",
            async: false
        }).done(function (data) {
            $("body").append(data);
        }).fail(function (xhr) {

        });
    },
    on_unloadmenu() {
        $(".MENU")[0].remove();
    },
    on_start_game() {
        const instance = new GameMap("map3");
        set_map(instance);
        window.MENU && window.MENU.display_progess(true);

        instance.on_load_done = function () {
            $.ajax({
                url: "JS/UI/Playing_layout.html",
                async: false
            }).done(function (data) {
                document.body.appendChild(renderer.view);
                $("body").append(data);
                $("body")[0].style.cursor = "none";
                document.body.appendChild(mouserenderer.view);
                window.MENU && window.MENU.display_progess(false);
                GAME_MANAGER.on_unloadmenu();
            }).fail(function (xhr) {

            });
        };
        instance.on_load_progess = function (progess) {
            window.MENU && window.MENU.set_progess(progess);
        };
    },
    on_unload_game() {

    },
    load_texture() {
        LOADER_SCREEN.on_start();
        PIXI.loader.on('progress', function (loader, loadedResource) {
            LOADER_SCREEN.on_progess(loader.progress / 100);
        });
        PIXI.loader.load(function (loader, resources) {
            CONSTRUCTION_UNIT.load_texture_done(loader, resources);
            SOLIDER_UNIT.load_texture_done(loader, resources);
            VEHICLE_UNIT.load_texture_done(loader, resources);
            EFFECT.load_texture_done(loader, resources);
            MAP_OBJECT.load_texture_done(loader, resources);
            MAP_CONSTRUCTION_UNIT.load_texture_done(loader, resources);
            PLANE_UNIT.load_texture_done(loader, resources);
            LOADER_SCREEN.on_done_texture();
            GAME_MANAGER.on_menu();
            GAME_MANAGER.on_start_game();
        });
    },
    load_map() {

    },
    choose_campain() {

    },
    choose_skrimming() {
        this.on_start_game();
    },
    choose_multiplayer() {

    },
    choose_setting() {

    },
    choose_about() {

    }
};

// Inline onclick= handlers in JS/UI/Menu.html call GAME_MANAGER.
window.GAME_MANAGER = GAME_MANAGER;

export { GAME_MANAGER, animate };
