// @ts-nocheck
//
// Stage 3 of the Vite/TypeScript migration: this file is renamed to .ts but not yet typed.
// It is 2015-era JavaScript whose classes assign undeclared properties in their
// constructors, which TypeScript reports as TS2339 several hundred times per file.
//
// Remove this directive one file at a time, declare the class fields, and let
// `npx tsc --noEmit` gate the result. Files already checked: src/core/*, src/lib/*,
// src/Game_Container.ts, src/UI/Playing_layout.ts, src/main.ts.
import { LATE } from "./core/late";
import { AI_CONTROLER2, Ai_Controlder, CONTROLER1 } from "./Controler";
import { CONSTRUCTION_TYPE } from "./Game_object/Construction/Construction_Unit_Type";
import { GRID } from "./Game_object/GRID";
import { INDEX_TYPE } from "./Game_object/Game_Unit";
import { GAME_OBJECT, sort_unique } from "./Game_object/Game_object";
import { Mine } from "./Game_object/Map_Object/Map_object";
import { SPEED } from "./core/state";

/// <reference path="Controler.js" />
"use strict";
var TEST_TIME = false;

var GAME_UNIT_INFO_GLOBAL = new (function () {
    this.list = [];
    this.on_new_unit = function (ID) {
        this.list.forEach(e => e.on_new_unit(ID));
    }

    this.on_delete_unit = function (ID) {
        this.list.forEach(e => e.on_delete_unit(ID));
    }


    this.add = function (ob) {
        this.list.push(ob);
    }

})();


var AI_WORKER = new (function () {

    var list_worker = [];
    this.postMessage = function (flag, data) {
        list_worker.forEach(e => e.postMessage(flag, data));
    }
    this.on_game_load_done = function () {
        list_worker.forEach(e => e.on_game_load_done());
    }
    this.on_game_start = function () {
        list_worker.forEach(e => e.on_game_start());
    }
    this.add = function (ob) {
        list_worker.push(ob);
    }
    this.add_ai_static_info = function (data) {
        list_worker.forEach(e => e.add_static_info(data));
    }
    this.clearall = function () {
        list_worker = [];
    }
})();


/**
 * 
 * @param {Ai_Controlder} Controler
 * @param {Object} AI_PARAM
 * @param {String} AI_PARAM.path 
 * @param {Object} AI_PARAM.param
 */
var AI_Worker = function (Controler, AI_PARAM) {

    var worker = new Worker("JS/AI_Worker.js");
    worker.postMessage({ flag: "parse_argument", data: AI_PARAM });

    var time_update = performance.now();
    var tick_update = 0;
    var BuyData_Array = [];
    var temp_data = null;


    var This = this;

    var GAME_UNIT_INFO = new (function () {
        this.array;
        this.idx = 0;

        this.clear = function (length) {
            this.array = new Uint32Array(length * 20);
            this.idx = 0;
        }

        this.add = function (ob, team) {
            ob.set_data(this.array, this.idx, team);
            this.idx += 20;
        }

        this.get_data = function () {
            return this.array.buffer;
        }

        this.on_new_unit = function (ID) {
            This.postMessage("on_new_unit", ID);
        }

        this.on_delete_unit = function (ID) {
            This.postMessage("on_delete_unit", ID);
        }

        GAME_UNIT_INFO_GLOBAL.add(this);

    })();



    /**
    * @param {BuyData} data 
    */
    var Process_BuyData = function (data) {
        if (!data._data_)
            data._data_ = {};
        data._data_.name = data.name;
        data._data_.type = data.type;
        data._data_.progess = data.progess;
        data._data_.wait_for_building = data.wait_for_building;
        data._data_.progess_load = data.progess_load;
        data._data_._id_ = data._id_;
        return data._data_;
    }


    /**
    * @param {Game_unit} data 
    */


    var postMessage = function (flag, data, option) {
        worker.postMessage({ flag, data }, option);
    }




    worker.onmessage = function (e) {
        if (!e.data.flag || !e.data.data)
            return;
        var flag = e.data.flag;
        var recive_data = e.data.data;
        switch (flag) {
            case "on_buy_unit":
                This.on_buy_unit(recive_data);
                break;
            case "on_buy_unit_cancel":
                This.on_buy_unit_cancel(recive_data);
                break;
            case "set_position_construction":
                This.set_position_construction(recive_data);
                break;
            case "send_command":
                This.send_command(recive_data);
                break;
            case "require_info":
                This.require_info(recive_data);
                break;
        }
    }


    this.process = function () {
        if (performance.now() - time_update > 80 / SPEED) {
            time_update = performance.now();
            var team = Controler.team_controler.team;
            switch (tick_update % 5) {
                case 0:
                    TEST_TIME && console.time("update_unit_list_mine");
                    GAME_UNIT_INFO.clear(GAME_OBJECT.listgameunit[team].length);
                    temp_data = GAME_OBJECT.listgameunit[team]
                        //.filter(e => GRID.fast_check_availble_user_fogmap(e, team))
                        .forEach(e => GAME_UNIT_INFO.add(e, team));
                    TEST_TIME && console.timeEnd("update_unit_list_mine");
                    break;
                case 1:
                    TEST_TIME && console.time("update_unit_list_mine_send");
                    var data = GAME_UNIT_INFO.get_data();
                    //console.log("update_unit_list_mine_send", data);
                    postMessage("update_unit_list_mine", data, [data]);
                    TEST_TIME && console.timeEnd("update_unit_list_mine_send");
                    break;
                case 2:
                    TEST_TIME && console.time("update_unit_list_enemy");
                    GAME_UNIT_INFO.clear(GAME_OBJECT.listgameunit[1 - team].length);
                    temp_data = GAME_OBJECT.listgameunit[1 - team]
                        //.filter(e => GRID.fast_check_availble_user_fogmap(e, team))
                        .forEach(e => GAME_UNIT_INFO.add(e, team));
                    TEST_TIME && console.timeEnd("update_unit_list_enemy");
                    break;
                case 3:
                    TEST_TIME && console.time("update_unit_list_enemy_send");
                    var data = GAME_UNIT_INFO.get_data();
                    //console.log("update_unit_list_enemy_send", data);
                    postMessage("update_unit_list_enemy", data, [data]);
                    TEST_TIME && console.timeEnd("update_unit_list_enemy_send");
                    break;
                case 4:
                    TEST_TIME && console.time("update_object_count");
                    postMessage("team_info", { money: 0 | Controler.team_controler.money, power: 0 | Controler.team_controler.power });
                    postMessage("update_object_count", GRID.buffer_object_count);
                    postMessage("update_object_count2", GRID.buffer__object_count_);
                    TEST_TIME && console.timeEnd("update_object_count");
                    break;
            }
            tick_update++;

        }

    }




    this.on_game_load_done = function () {
        INDEX_TYPE.init();
        postMessage("sendinfo", {
            index_type: INDEX_TYPE.map(),
            info_type: INDEX_TYPE.info(),
            map_info: {
                dim: GRID.dim,
                heightmap: GRID.heightmap,
                materialmap: GRID.materialmap,
                listmine_grouph: sort_unique(GAME_OBJECT.list_mine.map(e => e.grouph)).map(e => ({
                    center: e.get_center(),
                    list_mine: e.list_mine.map(e => ({ x: e.x, y: e.y, z: e.z, type: e.property.name })),
                    grid: new Uint16Array(e.list_mine[0].get_grid().raw_grid.filter((e, i) => (i % 4 == 2)))
                }))
            }
        });
    }


    //TODO METHOD  ======================================================================

    /**
    * Call this method when buy a unit
    * @param {BuyData} data 
    */
    this.on_buy_unit = function (data) {
        Controler.on_buy(BuyData_Array[data._id_]);
    }

    /**
    * Call this method when buy a unit is cancel
    * @param {BuyData} data
    */
    this.on_buy_unit_cancel = function (data) {
        Controler.on_cancel_buy(BuyData_Array[data._id_]);
    }



    this.set_position_construction = function (data) {
        var buydata = BuyData_Array[data.data._id_];
        if (buydata) {
            var size = CONSTRUCTION_TYPE[data.data.name].property.size;
            data.result = Controler.set_position_construction(BuyData_Array[data.data._id_], data.pos);
        }
        postMessage("set_position_construction_result", data);
    }

    /** 
    * @param {Array.<Game_unit>} list 
    * @param {Command} command 
    */
    this.send_command = function (recive_data) {
        switch (recive_data.command.com) {
            case "attack":
                console.log("ENEMY : ", recive_data.command.enemy);
                var ID = recive_data.command.enemy.ID;
                if (!GAME_OBJECT.map_id_unit[ID])
                    throw new Error("UnitID : " + ID + " undifine");
                recive_data.command.enemy = GAME_OBJECT.map_id_unit[ID];
                break;
            case "set":
                var pos = recive_data.command.ob;
                var pos_idx = pos.x * GRID.dim + pos.y;
                var ore_con_class = CONSTRUCTION_TYPE.con_refinery_allied.class;
                recive_data.command.ob =
                    GRID.heapmine[pos_idx] ||
                    GRID.objectmap[pos_idx].find(e => e instanceof Mine || e instanceof ore_con_class);
                console.log(recive_data.command.ob);
            default:

                break;


        }
        Controler.on_send_command(recive_data.list.map(e => GAME_OBJECT.map_id_unit[e]), recive_data.command);
    }




    //TODO CALLBACK  ======================================================================

    /** @description Call when buy construction complete
    * @param {BuyData} data 
    * @todo 
    */
    this.on_buy_construction_done = function (data) {
        postMessage("on_buy_construction_done", Process_BuyData(data));
    }



    /** @description Update unit can buy;
    * @param {Array.<BuyData>} data 
    */

    this.update_unit_can_buy = function (data) {
        BuyData_Array = [];
        var result = [];
        for(var e of data) {
            if (!e._id_)
                e._id_ = Math.random();
            BuyData_Array[e._id_] = e;
            result.push(e);
        }
        postMessage("update_unit_can_buy", result.map(e => Process_BuyData(e)));
    }

    /** 
    * @param {Game_unit} data 
    */
    this.on_attacked = function (data) {
        postMessage("on_attacked", data);
    }


    /** 
    * @param {Game_unit} data 
    */
    this.on_detect_enemy = function (data) {
        postMessage("on_detect_enemy", data);
    }


    /** 
    * @param {Game_unit} data 
    */
    this.on_unit_destroyed = function (data) {
        postMessage("on_unit_destroyed", data);
    }

    /**
     @param {Game_unit} ob
    */
    this.on_new_unit_ready = function (data) {
        postMessage("on_new_unit_ready", data);
    }

    this.on_move_done = function (data) {
        postMessage("on_unit_move_done", data);
    }


    this.on_game_start = function () {
        postMessage("on_game_start", STATIC_INFO);
    }


    /** 
    * @param {Number} data 
    */
    this.on_new_unit = function (ID) {
        postMessage("on_new_unit", ID);
    }

    /**
     @param {Game_unit} ob
    */
    this.on_delete_unit = function (ID) {
        postMessage("on_delete_unit", ID);
    }

    var STATIC_INFO = {};

    this.add_static_info = function (e) {
        //console.log(e[0]);
        switch (e[0]) {
            case "STATIC_DEFENSE_POINT":
            case "STATIC_WAYPOINT":
                if (parseInt(e[4]) == Controler.team_controler.team) {
                    if (!STATIC_INFO[e[0]])
                        STATIC_INFO[e[0]] = [];
                    STATIC_INFO[e[0]].push({
                        x: parseInt(e[1]),
                        y: parseInt(e[2]),
                        z: parseInt(e[3]),
                        t: parseInt(e[4]),
                        r: parseInt(e[5])
                    });

                }
                break;
            case "STATIC_DEFENSE_POINT_CENTER":
            case "STATIC_WAYPOINT_HOME":
                if (parseInt(e[4]) == Controler.team_controler.team) {
                    STATIC_INFO[e[0]] = {
                        x: parseInt(e[1]),
                        y: parseInt(e[2]),
                        z: parseInt(e[3]),
                        t: parseInt(e[4]),
                        r: parseInt(e[5])
                    };
                }
                break;
        }
    }


    //==========================================================================================

    this.require_info = function (data) {
        switch (data.req) {

        }
    }



    this.postMessage = function (flag, data) {
        postMessage(flag, data);
    }





    Controler.register_worker(this);
    AI_WORKER.add(this);
}


var AI_LIST = {
    DAT_1: {
        path: "AI/AI_static.js",
        param: {
            custom_path: "AI/Dat/AI_VARIABLE_1.js",
            name: "TEAM 1 (Thanh Dat)",
            NUM_VEH_ORE: 7
        }
    },
    DAT_2: {
        path: "AI/AI_static.js",
        param: {
            custom_path: "AI/Dat/AI_VARIABLE_2.js",
            name: "TEAM 2 (Thanh Dat)",
            NUM_VEH_ORE: 7
        }
    },
    /**
     * UNIMPLEMENTED. Loads cleanly, then does nothing: `process()` is empty and the only
     * statement it would run is commented out. Kept because the paths are now correct and
     * the state-graph scaffolding is a starting point.
     */
    PHUONG: {
        path: "AI/Phuong/AI.js",
        param: {

        }
    },
    /**
     * UNIMPLEMENTED. Builds a State_Graph (PEACE/ATTACK/DANGER/DEFENSE/REBUILD) and sets
     * its initial state, but never ticks it: `process()`, `on_game_start()` and every
     * `on_notify` branch are empty.
     */
    KHOAN: {
        path: "AI/Khoan/AI.js",
        param: {

        }
    }
}

/**
 * Which AI drives each team.
 *
 * Team 0 is the human seat: USER_CONTROLER wraps CONTROLER1, so attaching an AI there
 * makes the game play itself. That is opt-in, not the default -- it is why the original
 * `var AI_CONTROLER1 = new Ai_Controlder(CONTROLER1)` was commented out.
 *
 * Team 1 defaults to DAT_2, exactly as before. Override either from the query string:
 *
 *     ?ai1=PHUONG            team 1 is played by the Phuong AI
 *     ?ai0=DAT_1&ai1=KHOAN   AI vs AI, no human
 *     ?ai1=none              no opponent at all
 *
 * The map only defines two teams, so there is nowhere to seat a third AI.
 */
function resolve_ai_config() {
    var query = new URLSearchParams(window.location.search);
    var pick = function (key, fallback) {
        var name = query.get(key);
        if (name === null) return fallback;
        if (name === "none") return null;
        if (!AI_LIST[name]) {
            console.warn("Unknown AI '" + name + "' for " + key + "; expected one of " +
                Object.keys(AI_LIST).join(", ") + ". Falling back to " + (fallback || "none") + ".");
            return fallback;
        }
        return name;
    };
    return { team0: pick("ai0", null), team1: pick("ai1", "DAT_2") };
}

var AI_CONFIG = resolve_ai_config();
var AI_CONTROLER1 = null;
var AI_WORKER1, AI_WORKER2;

if (AI_CONFIG.team0) {
    // Created only on demand: Ai_Controlder registers itself with CONTROLER and its
    // update() dereferences this.worker, so an AI controller without a worker would throw.
    AI_CONTROLER1 = new Ai_Controlder(CONTROLER1);
    AI_WORKER1 = new AI_Worker(AI_CONTROLER1, AI_LIST[AI_CONFIG.team0]);
}

if (AI_CONFIG.team1 && AI_CONTROLER2) {
    AI_WORKER2 = new AI_Worker(AI_CONTROLER2, AI_LIST[AI_CONFIG.team1]);
}







// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { AI_WORKER, GAME_UNIT_INFO_GLOBAL });

export { AI_LIST, AI_WORKER, AI_WORKER1, AI_WORKER2, AI_Worker, GAME_UNIT_INFO_GLOBAL, TEST_TIME };
