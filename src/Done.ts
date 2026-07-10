import { LATE } from "./core/late";
import { AI_WORKER } from "./AI_worker_comunication";
import { AUDIO } from "./Audio";
import { USER_CONTROLER } from "./Controler";
import { CLOUND } from "./Game_object/Effect/Effect";
import { GAME_OBJECT } from "./Game_object/Game_object";
import { MAP_OBJECT_TYPE, Mine, Tree } from "./Game_object/Map_Object/Map_object";
import { SOLIDER_TYPE } from "./Game_object/MoviableUnit/Solider_Unit/Solider_Unit_Type";
import { VEHICLE_TYPE } from "./Game_object/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type";
import { LOADER_SCREEN } from "./LOADER_PROGESS";
import { map } from "./core/state";
import { TYPE_REGISTRY } from "./core/type_registry";


var list_wait_done = {
    "vehicle": false,
    "solider": false,
    "map": false,
    "construction": false,
    "effect": false,
    "map_ob": false,
    "mapconstruction": false,
    "plane": false
}

function load_list_object(data) {
    function load_object(ob) {
        console.log(ob);
        switch (ob[0]) {
            case "TEAM":
                load_team(parseInt(ob[1]), parseInt(ob[2]), 0, parseInt(ob[4]));
                break;
            case "MapOb":
                GAME_OBJECT.add_unit(parseInt(ob[1]), parseInt(ob[2]), 0, parseInt(ob[4]), TYPE_REGISTRY[ob[5]][ob[6]]);
                break;
            case "Tree":
                GAME_OBJECT.add_instance(new Tree(parseInt(ob[1]), parseInt(ob[2]), 0, MAP_OBJECT_TYPE.tree, parseInt(ob[4])));
                break;
            case "Mine":
                GAME_OBJECT.add_instance(new Mine(parseInt(ob[1]), parseInt(ob[2]), 0, TYPE_REGISTRY[ob[4]][ob[5]]));
                break;
            case "Unit":
                GAME_OBJECT.add_unit(parseInt(ob[1]), parseInt(ob[2]), 0, parseInt(ob[4]), TYPE_REGISTRY[ob[5]][ob[6]]);
                break;
            // DATA FOR STATIC AI
            case "STATIC_DEFENSE_POINT":
            case "STATIC_DEFENSE_POINT_CENTER":
            case "STATIC_WAYPOINT":
            case "STATIC_WAYPOINT_HOME":
                
                AI_WORKER.add_ai_static_info(ob);
                break;
        }
    }
    var list = data
        //.replace(/ +/g, ' ').trim()                         // remove unexpected space
        .split("\n")                                        // Split line by line
        .map(e => e.split(" ")                              // Split data in line
        .filter(e => e.length > 0).map(e => e.trim()));     // filter and remove all space

    for(var e of list) {
        if (e[0] == "#")
            break;
        load_object(e);
    }
}




var load_team = function (x, y, z, team) {
    GAME_OBJECT.add_unit(x, y, 0, team, VEHICLE_TYPE.veh_mcv_allied);
    var array = [
        { x: 0, y: 1, i: 1, j: 0 },
        { x:0, y: 0, i: 0, j: 1 },
        { x: 1, y: 1, i: 0, j: -1 },
        { x: 1, y: 0, i: -1, j: 0 },
    ];
    for (var i = 0 ; i < 4; i++) {
        var startx = x + 6 * array[i].x - 3;
        var starty = y + 6 * array[i].y - 3;
        for (var j = 0 ; j < 6; j++) {
            var posx = startx + array[i].i * j;
            var posy = starty + array[i].j * j;
            if (j == 0) {
                GAME_OBJECT.add_unit(posx, posy, 0, team, VEHICLE_TYPE.veh_rhi_soviet);
            } else {
                GAME_OBJECT.add_unit(posx, posy, 0, team, SOLIDER_TYPE.sol_gi_allied);
            }
        }
    }
}



var on_texture_load_done = function (info) {
    list_wait_done[info] = true;

    console.log(` =================>>> LOAD ${info.toUpperCase()} DONE <<<=================`);
    for (var i in list_wait_done)
        if (!list_wait_done[i])
            return;
    console.log('LOAD ALL TEXTURES DONE');



    load_list_object(map.list_object_data);
    LOADER_SCREEN.on_done();

    window.setTimeout(function () { AI_WORKER.on_game_start(); }, 2000);
    window.animate();
    AUDIO.music.play_game_music();

    USER_CONTROLER.on_game_start();
    AI_WORKER.on_game_load_done();


    CLOUND.init();

}



// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { on_texture_load_done });

export { list_wait_done, load_list_object, load_team, on_texture_load_done };
