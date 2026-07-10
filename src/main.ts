// Entry point. This is the inline bootstrap <script> that used to live in index.html.
//
// The side-effect imports below are listed in the exact order the old <script> tags
// loaded. Every module imports only files that appear earlier in this list, so the
// import graph is acyclic and ES module evaluation order reproduces the original
// script order. Do not reorder without re-checking src/core/late.js.

import "./lib/JavaScript_helper";
import "./lib/priorityqueue";
import "./Game_Container";
import "./LOADER_PROGESS";
import "./Audio";
import "./Map";
import "./Controler";
import "./Image_process";
import "./Game_object/GRID";
import "./Game_object/Game_object";
import "./Game_object/Game_Unit";
import "./Game_object/Construction/Construction_Unit";
import "./Game_object/Construction/Construction_Unit_Type";
import "./Game_object/MoviableUnit/MoviableUnit";
import "./Game_object/MoviableUnit/Solider_Unit/Solider_Unit";
import "./Game_object/MoviableUnit/Solider_Unit/Solider_Unit_Type";
import "./Game_object/MoviableUnit/Vihicle_Unit/Vihicle_Unit";
import "./Game_object/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type";
import "./Game_object/MoviableUnit/Flyable_Unit";
import "./Game_object/Weapon/Weapon";
import "./Game_object/Weapon/Weapon_Type";
import "./Game_object/Map_Object/Map_object";
import "./Game_object/Construction/Map_Construction_Unit";
import "./Game_object/Effect/Effect";
import "./AI_worker_comunication";
import "./UI/Playing_layout";
import "./UI/Minimap";
import "./Done";

import { renderer, mouserenderer } from "./core/renderer";
import { SPEED, map, set_map, resize_screen, screen_width, screen_height } from "./core/state";

import { graphics, graphics2, mainstage, mouse_stage } from "./Game_Container";
import { LOADER_SCREEN } from "./LOADER_PROGESS";
import { AUDIO } from "./Audio";
import { Map as GameMap } from "./Map";
import { CONTROLER, USER_CONTROLER } from "./Controler";
import { GAME_OBJECT } from "./Game_object/Game_object";
import { CONSTRUCTION_UNIT } from "./Game_object/Construction/Construction_Unit";
import { SOLIDER_UNIT } from "./Game_object/MoviableUnit/Solider_Unit/Solider_Unit";
import { VEHICLE_UNIT } from "./Game_object/MoviableUnit/Vihicle_Unit/Vihicle_Unit";
import { PLANE_UNIT } from "./Game_object/MoviableUnit/Flyable_Unit";
import { EFFECT } from "./Game_object/Effect/Effect";
import { MAP_OBJECT } from "./Game_object/Map_Object/Map_object";
import { MAP_CONSTRUCTION_UNIT } from "./Game_object/Construction/Map_Construction_Unit";
import { FOG_GRAPGICH, MINIMAP } from "./UI/Minimap";
import { LOADER } from "./core/pixi_loader";

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
                // v7 types `renderer.view` as ICanvas, which also covers OffscreenCanvas.
                // autoDetectRenderer without a `view` option always makes a real canvas.
                document.body.appendChild(renderer.view as HTMLCanvasElement);
                $("body").append(data);
                $("body")[0].style.cursor = "none";
                document.body.appendChild(mouserenderer.view as HTMLCanvasElement);
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
        LOADER.on('progress', function (loader, loadedResource) {
            LOADER_SCREEN.on_progess(loader.progress / 100);
        });
        LOADER.load(function (loader, resources) {
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
