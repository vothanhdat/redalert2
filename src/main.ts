import "./_import";
import { GLOBAL } from "./GLOBAL"
import { } from "./jsHelper"
import { Circular_Queue, PriorityQueue, Queue } from "./priorityqueue"
import { LOADER_SCREEN } from "./LOADER_PROGESS"
import { AUDIO } from "./Audio"
import { GameMap } from "./Map"
import * as Controller from "./CONTROLLER"
import * as ImageProcess from "./Image_process"
import { GRID } from "./GRID";
import * as Game_object from "./Game_object";
import * as Game_Unit from "./Game_Unit";
import * as Construction_Unit_Type from "./Game_Units/Construction/Construction_Unit_Type"
import * as Map_Construction_Unit from "./Game_Units/Construction/Map_Construction_Unit"
import * as Effect from "./Game_Units/Effect/Effect"
import * as Map_object from "./Game_Units/Map_Object/Map_object"

import * as Solider_Unit_Type from "./Game_Units/MoviableUnit/Solider_Unit/Solider_Unit_Type"
import * as Vehicle_Unit_Type from "./Game_Units/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type"

import * as AI_worker_comunication from "./AI_worker_comunication"

import { graphics, graphics2, mainstage, mouse_stage } from "./Game_Container"
// import PIXI from "pixi.js";
import { CONSTRUCTION_UNIT } from "./Game_Units/Construction/Construction_Unit";
import { SOLIDER_UNIT } from "./Game_Units/MoviableUnit/Solider_Unit/Solider_Unit";
import { VEHICLE_UNIT } from "./Game_Units/MoviableUnit/Vihicle_Unit/Vihicle_Unit";
import { PLANE_UNIT } from "./Game_Units/MoviableUnit/Flyable_Unit";
import * as Weapon_Type from "./Game_Units/Weapon/Weapon_Type";
import { FOG_GRAPGICH, MINIMAP } from "./Minimap";

console.log("RUN")
console.log({ GLOBAL })
console.log({ Circular_Queue, PriorityQueue, Queue })
console.log({ LOADER_SCREEN })
console.log({ AUDIO })
console.log({ GameMap })
console.log({ Controller })
console.log({ ImageProcess })
console.log({ GRID })
console.log({ Game_object })
console.log({ Game_Unit })
console.log({
    Construction_Unit_Type,
    Map_Construction_Unit,
    Effect,
    Map_object,
})

console.log({ Weapon_Type })
console.log({ Solider_Unit_Type })
console.log({ Vehicle_Unit_Type })
console.log({ AI_worker_comunication })





window.onmousemove = function (event) {
    Controller.USER_CONTROLER.onmousemove(event);
    //event.preventDefault();
    //return true;
}

window.ondblclick = function (event) {
    Controller.USER_CONTROLER.ondblclick(event);
    // event.preventDefault();
    return true;
}

window.onmousedown = function (event) {
    Controller.USER_CONTROLER.onmousedown(event);

    //event.preventDefault();
    //return true;
}

window.onmouseup = function (event) {
    Controller.USER_CONTROLER.onmouseup(event);
    //event.preventDefault();
    //return true;
}

//window.onmouseout = function (event) {
//    USER_CONTROLER.onmouseout(event);
//    //event.preventDefault();
//    return true;
//}

window.onmouseleave = function (event) {
    Controller.USER_CONTROLER.onmouseleave(event);
    //event.preventDefault();
    return true;
}

window.onkeyup = function (event) {
    Controller.USER_CONTROLER.onkeyup(event);
    //event.preventDefault();
    return true;
}

window.onkeydown = function (event) {
    Controller.USER_CONTROLER.onkeydown(event);
    //event.preventDefault();
    return true;
}

window.onresize = function (e) {
    GLOBAL.SCREEN_WIDTH = window.innerWidth;
    GLOBAL.SCREEN_HEIGHT = window.innerHeight;
    GLOBAL.DISPLAY_WIDTH = GLOBAL.SCREEN_WIDTH - GLOBAL.UI_WIDTH;
    GLOBAL.DISPLAY_HEIGHT = GLOBAL.SCREEN_HEIGHT - GLOBAL.UI_HEIGTH;
    GLOBAL.screen_w = GLOBAL.DISPLAY_WIDTH / 60;
    GLOBAL.screen_h = GLOBAL.DISPLAY_HEIGHT / 30;
    // map_layer.width = GLOBAL.DISPLAY_WIDTH;
    //map_layer.height = GLOBAL.DISPLAY_HEIGHT;
    GLOBAL.renderer.resize(GLOBAL.SCREEN_WIDTH, GLOBAL.SCREEN_HEIGHT);
    GLOBAL.map && GLOBAL.map.update(true);
    FOG_GRAPGICH && FOG_GRAPGICH.update(true);
    MINIMAP && MINIMAP.resize();
}

window.onload = function () {
    // console.log("window.GAME_MANAGER.load_texture")
    window.GAME_MANAGER.load_texture();
}

window.oncontextmenu = function () {
    return false;
}

window.animate = function () {
    var deltatime = (performance.now() - GLOBAL.drawtime) / 16.67;
    if (deltatime > 15)
        deltatime = 1;
    GLOBAL.drawtime = performance.now();

    graphics.clear();
    graphics2.clear();


    // 1.5ms
    Controller.CONTROLER.update(deltatime * GLOBAL.SPEED);

    GLOBAL.map.update(deltatime * GLOBAL.SPEED);

    //1.5ms

    MINIMAP.update(deltatime * GLOBAL.SPEED);


    // 0.5ms
    FOG_GRAPGICH.update(deltatime * GLOBAL.SPEED);

    // 2 - 6ms
    Game_object.GAME_OBJECT.main_loop(deltatime * GLOBAL.SPEED);

    AUDIO.process();

    //0.5 - 2ms
    GLOBAL.renderer.render(mainstage);

    requestAnimationFrame(window.animate);
}

FOG_GRAPGICH.init();

mainstage.addChild(FOG_GRAPGICH.get_fog_sprite_area());
mainstage.addChild(MINIMAP.get_minimap_sprite());

mouse_stage.addChild(Controller.USER_CONTROLER.get_mouse_sprite());

AUDIO.load_sound();


window.GAME_MANAGER = {
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
        GLOBAL.map = new GameMap("map3");

        window.MENU && window.MENU.display_progess(true);

        GLOBAL.map.promise.then(() => {
            $.ajax({
                url: "JS/UI/Playing_layout.html",
                async: false
            }).done(function (data) {
                console.log(data)
                document.body.appendChild(GLOBAL.renderer.view);
                $("body").append(data);
                $("body")[0].style.cursor = "none";
                document.body.appendChild(GLOBAL.mouserenderer.view);
                MENU && MENU.display_progess(false);
                GAME_MANAGER.on_unloadmenu();
            }).fail(function (xhr) {

            });
        })

        GLOBAL.map && (GLOBAL.map.on_load_progess = function (progess) {
            MENU && MENU.set_progess(progess);
        });
    },
    on_unload_game() {

    },
    load_texture() {
        console.log("Load Texture", LOADER_SCREEN)
        LOADER_SCREEN.on_start();
        PIXI.loader.on('progress', function (loader, loadedResource) {
            // console.log("on Progress")
            LOADER_SCREEN.on_progess(loader.progress / 100);
        });
        PIXI.loader.load(function (loader, resources) {
            CONSTRUCTION_UNIT.load_texture_done(loader, resources);
            SOLIDER_UNIT.load_texture_done(loader, resources);
            VEHICLE_UNIT.load_texture_done(loader, resources);
            Effect.EFFECT.load_texture_done(loader, resources);
            Map_object.MAP_OBJECT.load_texture_done(loader, resources);
            Map_Construction_Unit.MAP_CONSTRUCTION_UNIT.load_texture_done(loader, resources);
            PLANE_UNIT.load_texture_done(loader, resources);
            LOADER_SCREEN.on_done_texture();
            window.GAME_MANAGER.on_start_game();
            // window.GAME_MANAGER.on_menu();
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
}
