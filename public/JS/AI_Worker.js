

/**
 @typedef Point
 @type {Object}
 @property {Number} x The Postition X
 @property {Number} y The Postition Y
 */

/**
 @typedef Game_unit
 @type {Object}
 @property {String} type
 @property {String} name
 @property {Number} ID 
 @property {Number} x
 @property {Number} y 
 @property {Number} z 
 @property {Number} team 
 @property {Number} totalhealth 
 @property {Number} health 
 @property {Number} state
 @property {Point} goal
 @property {Point} enemy 
 @property {Number} enemyID 
 @property {Point} workpoint
 */





"use strict";

var AI_CONTROL = null;

var unit_list_mine = [];
var map_unit_list_mine = {};


var unit_list_enemy = [];
var map_unit_list_enemy = {};

var buy_list_data = [];

var index_type;

var info_type,
    map_info,
    map_unit_index = {},
    buy_unit_index = {};

//var list_buy_done = [];
var PARAM = {};



var PROCESS_DATA = new (function () {

    this.update_buy_map_data = function () {
        buy_unit_index = {};
        for(var e of buy_list_data) {
            buy_unit_index[e.name] = e;
        }
    }


    this.on_new_unit = function (ID) {
        map_unit_index[ID] = { ID: ID };
    }


    this.on_delete_unit = function (ID) {
        delete map_unit_index[ID];
    }


    this.process_unit_data = function (array_buffer, list) {
        var array = new Uint32Array(array_buffer);
        var count = 0;

        for (var idx = 0; idx < array.length ; idx += 20, count++) {
            var ID = array[idx + 2];
            var unit = list[count] = map_unit_index[ID] = map_unit_index[ID] || { ID: ID };
            var name = index_type[array[idx + 1]];
            var has_move = info_type[name].property.speed && true;
            var has_workpoint = info_type[name].has_workpoint;

            unit.type = index_type[array[idx]];
            unit.name = index_type[array[idx + 1]];
            unit.ID = array[idx + 2];
            unit.x = array[idx + 3];
            unit.y = array[idx + 4];
            unit.z = array[idx + 5];
            unit.team = array[idx + 6];
            unit.totalhealth = array[idx + 7];
            unit.health = array[idx + 8];
            unit.state = array[idx + 9];
            unit.goal = has_move && array[idx + 10] && array[idx + 11] && { x: array[idx + 10], y: array[idx + 11] };
            unit.enemy = has_move && array[idx + 12] && array[idx + 13] && { x: array[idx + 12], y: array[idx + 13] };
            unit.enemyID = has_move && array[idx + 14];
            unit.workpoint = has_workpoint && array[idx + 15] && array[idx + 16] && { x: array[idx + 15], y: array[idx + 16] };
            unit.container = array[idx + 18];
        }
        list.length = (array.length / 20);
        array = null;
    }

})();

function random() {
    return "";
    return "?r=" + Math.random();
}



var CONTROL = new (function () {

    var send_message = function (flag, data) {
        postMessage({ flag, data });
    }

    this.buy_unit = function (data) {
        send_message("on_buy_unit", data);
    }

    this.buy_unit_cancel = function (data) {
        send_message("on_buy_unit_cancel", data);
    }

    this.set_position_construction = function (data, pos) {
        send_message("set_position_construction", { data, pos });
    }

    this.send_command = function (list, command) {
        list = list.map(e=> e.ID);
        send_message("send_command", { list, command })
    }

});




class AI_controler {
    static init_static_varialbe(data) {
        for (var i in data) {
            console.log(i);
            self[i] = data[i];
        }
    }
    constructor() {
        this.money = 0;
        this.power = 0;
    }
    process() { }
    on_notify(flag, data) {
        switch (flag) {
            case "on_game_start":
                break;
            case "on_buy_construction_done":
                break;
            case "on_unit_move_done":
                break;
            case "update_unit_can_buy":
                break;
            case "on_new_unit_ready":
                break;
            case "on_unit_destroyed":
                break;
            case "on_attacked":
                break;
            case "on_detect_enemy":
                break;
            case "team_info":
                this.money = data.money;
                this.power = data.power;
                break;
        }
    }

}


importScripts("AI/AI_Helper.js" + random());
importScripts("AI/AI_Task.js" + random());
importScripts("AI/State_Graph.js" + random());
importScripts("AI/Common_Task.js" + random());


onmessage = function (e) {
    switch (e.data.flag) {
        case "parse_argument":
            console.log('parse_argument');

            // Set option from UI Thread
            PARAM = e.data.data.param;

            // Load Custom AI
            importScripts(e.data.data.path + random());

            // Create AI Control
            AI_CONTROL = new AI_controler_static();
            break;
        case "sendinfo":
            index_type = e.data.data.index_type;
            info_type = e.data.data.info_type;
            map_info = e.data.data.map_info;
            break;
        case "update_unit_list_mine":
            PROCESS_DATA.process_unit_data(e.data.data, unit_list_mine);
            map_unit_list_mine = {};
            unit_list_mine.forEach(e => map_unit_list_mine[e.ID] = e);
            COMMON_TASK.refresh_list();
            break;
        case "update_unit_list_enemy":
            PROCESS_DATA.process_unit_data(e.data.data, unit_list_enemy);
            map_unit_list_enemy = {};
            unit_list_enemy.forEach(e => map_unit_list_enemy[e.ID] = e);
            //COMMON_TASK.refresh_list();
            break;
        case "on_buy_construction_done":
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "update_unit_can_buy":
            buy_list_data = e.data.data;
            PROCESS_DATA.update_buy_map_data();
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "set_position_construction_result":
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "update_object_count":
            AI_helper._GRID_.update_object_count(e.data.data);
            break;
        case "update_object_count2":
            AI_helper._GRID_.update_object_count2(e.data.data);
            break;
        case "init_map_data":
            AI_helper._GRID_.init_map_data(e.data.data);
            break;
        case "require_info_respond":
            AI_helper._require_info_respond(e.data.data);
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "on_attacked":
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "on_detect_enemy":
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "on_game_start":
            AI_controler.init_static_varialbe(e.data.data);
            AI_CONTROL.on_notify("on_game_start");
            setInterval(function () {
                AI_TASK.process(0.2);
                AI_CONTROL.process();
            }, 200);
            break;
        case "on_new_unit_ready":
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "on_unit_destroyed":
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "on_unit_move_done":
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "on_new_unit":
            PROCESS_DATA.on_new_unit(e.data.data);
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "on_delete_unit":
            PROCESS_DATA.on_delete_unit(e.data.data);
            AI_helper.process_event(e.data.flag, e.data.data);
            break;
        case "team_info":
            AI_CONTROL.on_notify("team_info", e.data.data);
            break;
    }
}






