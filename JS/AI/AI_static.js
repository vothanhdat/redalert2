/// <autosync enabled="true" />
/// <reference path="AI_Task.js" />
/// <reference path="Common_Task.js" />
/// <reference path="../AI_Worker.js" />
/// <reference path="State_Graph.js" />
/// <reference path="Dat/AI_VARIABLE_1.js" />

"use strict";

console.log("%c\t\t" + PARAM.name, "color: blue;  font-size:xx-large;margin:auto;");

//Need for load STATIC VARIABLE

importScripts(PARAM.custom_path + random());


class AI_controler_static extends AI_controler {
    constructor() {
        super();
        this.build_manager = new Build_Manager(this);
        this.resource_manager = new Resource_Manager(this);
        this.loop_task = new Loop_Task(this);
    }
    process() {
        try {
            if (unit_list_mine.find(e => e.name == UNIT_TYPE.constrution.con_factory_allied)) {
                if (unit_list_mine.filter(e => e.name == UNIT_TYPE.vehicle.veh_ore_allied).length > Math.min(PARAM.NUM_VEH_ORE,5))
                    this.build_manager && this.build_manager.process();
            } else
                this.build_manager && this.build_manager.process();
        } catch (e) {
            console.log(e);
            debugger;
        }

        try {
            this.resource_manager && this.resource_manager.process();
        } catch (e) {
            console.log(e);
            debugger;
        }
    }



    on_game_start() {
        console.log(map_info);

        this.build_manager && this.build_manager.init();
        this.resource_manager && this.resource_manager.init();

        if (true) {

            this.loop_task.init();

            //Auto Attack GROUND
            if (true) {
                var list_id = {};
                var func_protect_home = function () {
                    var list_filter = unit_list_mine.filter(e =>
                        !list_id[e.ID] && (
                            (e.name != UNIT_TYPE.vehicle.veh_ore_allied)
                            && (e.name != UNIT_TYPE.vehicle.veh_mcv_allied)
                            //(e.type == "solider" && e.name != UNIT_TYPE.solider.sol_eng && e.name != UNIT_TYPE.solider.sol_eng)
                        ));

                    if (list_filter.length >= 5)
                        CONTROL.send_command(list_filter, { com: "protect_area", pos: STATIC_WAYPOINT_HOME, radius: STATIC_WAYPOINT_HOME.r });

                }

                setInterval(func_protect_home, 1000);


                function check_condition_attack(list) {
                    return list.length >= check_condition_attack.value;
                }

                var attack_count = 0;

                function autoattack() {
                    //console.log("autoattack RUN");
                    attack_count++;
                    var T = new AI_Task_Grouph();
                    //T.wait_for_new_task = true;

                    var list_T2;


                    T.add_common_task(COMMON_TASK.wait_task, [function () {
                        //Filter List vehicle 
                        var list_filter = unit_list_mine.filter(e =>
                            e.type == "vehicle"
                                && e.name != UNIT_TYPE.vehicle.veh_ore_allied
                                && e.name != UNIT_TYPE.vehicle.veh_mcv_allied
                                && !list_id[e.ID]);

                        //Position of Home
                        //var home_possition = unit_list_mine.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);

                        //Set list for other Task
                        list_T2 = AI_helper.get_list_around(list_filter, STATIC_WAYPOINT_HOME, 30);
                        if (check_condition_attack(list_T2)) {
                            check_condition_attack.value = Math.min(150, check_condition_attack.value + 5);
                            list_T2.forEach(e => list_id[e.ID] = true);
                            return true;
                        }
                        //Condiction to run next Task;
                    }, this], { timeout: 10000000, try: 1 });

                    T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, STATIC_WAYPOINT[0], 25], null, autoattack);

                    T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, STATIC_WAYPOINT[1], 25]);

                    T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, STATIC_WAYPOINT[2], 25]);

                    T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, STATIC_WAYPOINT[3], 25]);

                    if (attack_count++ < 6) {
                        T.add_common_task(COMMON_TASK.attack_enemy, [
                              () => list_T2,
                              () => (unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied || e.name == UNIT_TYPE.vehicle.veh_mcv_allied) || STATIC_WAYPOINT[4])
                        ]);
                    }
                    T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, STATIC_WAYPOINT[4], 140]);

                }

                check_condition_attack.value = 5;
                autoattack();


            }


            //Auto Attack AIR
            if (true) {

                function find_air_enemy() {
                    var unit_type = {};
                    unit_list_enemy.forEach(e => (unit_type[e.name] = 1 + (unit_type[e.name] || 0)));
                    var con1 = unit_type[UNIT_TYPE.constrution.con_contruction_allied];
                    var con2 = unit_type[UNIT_TYPE.constrution.con_garage_allied];
                    var con3 = unit_type[UNIT_TYPE.constrution.con_refinery_allied];
                    var con4 = unit_type[UNIT_TYPE.constrution.con_factory_allied];

                    unit_type = null;

                    if (con1 == 1 && con2 == 0)
                        return unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);
                    else if (con3 == 1)
                        return unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_refinery_allied);
                    else if (con1 == 0 && con2 == 1)
                        return unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_garage_allied);
                    else if (con1 == 0 && con2 == 0 && con4 == 1)
                        return unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_factory_allied);
                    else if (con3 == 2 || con3 == 3)
                        return unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_refinery_allied);
                    else if (con1 == 2)
                        return unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);

                    return unit_list_enemy.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);

                    //if(unit_list_enemy.find(e =>  e.name == UNIT_TYPE.constrution.con_contruction_allied))
                }


                function attack_air() {
                    var ATTACK_AIR = new AI_Task_Grouph();

                    var list_tmp = [];

                    // Check Number of plane and Bomm container
                    ATTACK_AIR.add_common_task(
                        COMMON_TASK.wait_task,
                        [() => (list_tmp = unit_list_mine.filter(e =>
                            e.name == UNIT_TYPE.plane.beag
                                && e.container >= 7
                                && e.state == UNIT_STATE.IDLE
                            )).length >= 10],
                        { timeout: 10000000, try: 1 },
                        () => setTimeout(attack_air, 20000)
                    );

                    //Attack Main Construction
                    ATTACK_AIR.add_common_task(
                       COMMON_TASK.attack_enemy,
                       [
                           () => list_tmp,
                           () => find_air_enemy()
                       ]
                    );




                }

                attack_air();

            }

        }

    }


    on_notify(flag, data) {

        super.on_notify(flag, data);
        switch (flag) {
            case "on_game_start":
                this.on_game_start();
                break;
        }
    }


}



class Loop_Task {
    /**
     * @param {AI_controler_static} ai_controller 
     */
    constructor(ai_controller) {
        this.ai_controller = ai_controller;

        this.list_buy_vehicle_first = [];
        this.list_buy_vehicle_first.push([UNIT_TYPE.vehicle.veh_ore_allied, 2]);
        this.list_buy_vehicle_first.push([UNIT_TYPE.vehicle.veh_rhi_soviet, 2]);
        PARAM.NUM_VEH_ORE > 3 && this.list_buy_vehicle_first.push([UNIT_TYPE.vehicle.veh_ore_allied, 2]);
        this.list_buy_vehicle_first.push([UNIT_TYPE.vehicle.veh_rhi_soviet, 2]);
        PARAM.NUM_VEH_ORE > 5 && this.list_buy_vehicle_first.push([UNIT_TYPE.vehicle.veh_ore_allied, 2]);
        this.list_buy_vehicle_first.push([UNIT_TYPE.vehicle.veh_rhi_soviet, 10]);
        this.list_buy_vehicle_first.push([UNIT_TYPE.vehicle.veh_rhi_soviet, 10]);

        this.TaskBuyUnit = new AI_Task_Grouph();
        this.TaskBuyUnit.wait_for_new_task = true;

        this.TaskBuild_Denfense = new AI_Task_Grouph();
        this.TaskBuild_Denfense.wait_for_new_task = true;

        this.TaskBuyPlane = new AI_Task_Grouph();
        this.TaskBuyPlane.wait_for_new_task = true;
    }

    init() {
        this.buy_vehicle();

        this.TaskBuild_Denfense.add_common_task(COMMON_TASK.wait_task, [function () {
            return unit_list_mine.filter(e => e.name == UNIT_TYPE.vehicle.veh_ore_allied).length >= PARAM.NUM_VEH_ORE + 1;
        }], null, () => this.buy_defense_construction());

        //this.buy_plane();

    }
    reset_buy_vehicle() {
        console.log("reset_buy_vehicle");
        this.TaskBuyUnit = new AI_Task_Grouph();
        this.TaskBuyUnit.wait_for_new_task = true;
        this.buy_vehicle();
    }
    buy_vehicle() {
        var ob = this.list_buy_vehicle_first.shift();
        if (ob)
            this.TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, ob, null, () => this.buy_vehicle(), () => this.reset_buy_vehicle());
        else {
            this.TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_rhi_soviet, 5], null, null, () =>  this.reset_buy_vehicle());
            this.TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_firetank, 5], null, null, () =>  this.reset_buy_vehicle());
            this.TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ifv_allied, 5], null, null, () =>  this.reset_buy_vehicle());
            this.TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_prism_allied, 5], null, null, () =>  this.reset_buy_vehicle());
            this.TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_tesla_soviet, 5], null, () => this.buy_vehicle(), () =>  this.reset_buy_vehicle());
        }
    }
    reset_buy_defense_construction() {
        console.log("reset_buy_defense_construction");
        this.TaskBuild_Denfense = new AI_Task_Grouph();
        this.TaskBuild_Denfense.wait_for_new_task = true;
        this.buy_defense_construction();
    }
    buy_defense_construction() {
        this.TaskBuild_Denfense.add_common_task(
            COMMON_TASK.wait_task,
            [function () {
                var count = unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution_defense.con_super_cannon).length;
                var count2 = unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution.con_contruction_allied).length;
                return count2 * 2 > count;
            }],
            null
        );

        this.TaskBuild_Denfense.add_common_task(
            COMMON_TASK.building_construction,
            [
                UNIT_TYPE.constrution_defense.con_super_cannon,
                STATIC_DEFENSE_POINT_CENTER,
                null, 10, STATIC_DEFENSE_POINT
            ],
            null,
            () => this.buy_defense_construction(),
            () => this.reset_buy_defense_construction()
        );
    }
    buy_plane() {

        this.TaskBuyPlane.add_common_task(
            COMMON_TASK.wait_task,
            [() => unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution.con_airplan_allied).length >= 3],
            null
        );

        this.TaskBuyPlane.add_common_task(
            COMMON_TASK.wait_task,
            [() => unit_list_mine.filter(e => e.name == UNIT_TYPE.plane.beag).length <
                unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution.con_airplan_allied).length * 4],
            null
        );


        this.TaskBuyPlane.add_common_task(COMMON_TASK.buy_unit,
            [
                UNIT_TYPE.plane.beag,
                () => unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution.con_airplan_allied).length * 4
                    - unit_list_mine.filter(e => e.name == UNIT_TYPE.plane.beag).length
            ],
            null,
            () => this.buy_plane(),
            () => this.reset_buy_plane()
        );

    }
    reset_buy_plane() {
        console.log("reset_buy_defense_construction");
        this.TaskBuyPlane = new AI_Task_Grouph();
        this.TaskBuyPlane.wait_for_new_task = true;
        this.buy_plane();
    }
}


const BUILD_STATE = {
    BUILD_INIT: -1,
    BUILD_BASIC: 0,
    BUILD_EXTENDS: 1,
    BUILD_EXTENDS_MINE: 2,
    BUILD_MAINTAIN: 3
}

class Build_Manager {
    /**
     * 
     * @param {AI_controler_static} parent
     * */
    constructor(parent) {
        this.parent = parent;
        this.list_order_constructor = [
            UNIT_TYPE.constrution.con_power_allied,
            UNIT_TYPE.constrution.con_refinery_allied,
            UNIT_TYPE.constrution.con_barracks_allied,   //4
            UNIT_TYPE.constrution.con_factory_allied,    //4
            UNIT_TYPE.constrution.con_airplan_allied,
            UNIT_TYPE.constrution.con_tech_allied,
            UNIT_TYPE.constrution.con_garage_allied
        ];


        this.list_extends_constructor = {
            [UNIT_TYPE.constrution.con_factory_allied]: 5,
            [UNIT_TYPE.constrution.con_refinery_allied]: 2,
        };

        //this.list_extends_constructor[UNIT_TYPE.constrution.con_refinery_allied] = 2;


        this.buying_count = 0;
        this.buying_name = "";
        this.buyinng_map = {};
        this.build_state = BUILD_STATE.BUILD_INIT;

    }

    init() {
        this.change_to_state(BUILD_STATE.BUILD_INIT);
    }

    process() {

        var list_constructor = unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);

        for (var i in this.buyinng_map) {
            if (this.buyinng_map[i] > 0 && !AI_helper.check_unit_can_buy(i))
                this.build_construction_fail(i);
        }
        var maplistmine = {};

        for (var e of unit_list_mine) {
            if (e.type == UNIT_TYPE.s.constrution)
                maplistmine[e.name] = (maplistmine[e.name] || 0) + 1;
        }

        switch (this.build_state) {
            case BUILD_STATE.BUILD_INIT:

                break;
            case BUILD_STATE.BUILD_BASIC:
                if (this.list_order_constructor.every(e => maplistmine[e])) {
                    this.change_to_state(BUILD_STATE.BUILD_EXTENDS);
                } else if (this.buying_count < list_constructor.length) {
                    for (var e of this.list_order_constructor) {
                        if (!maplistmine[e] && AI_helper.check_unit_can_buy(e)) {
                            this.build_construction(e);
                            break;
                        }
                    }
                }
                break;
            case BUILD_STATE.BUILD_EXTENDS:
                if (!this.list_order_constructor.every(e => maplistmine[e])) {
                    this.change_to_state(BUILD_STATE.BUILD_BASIC);
                } else if (this.buying_count < list_constructor.length) {
                    var check_1 = true;
                    for (var i in this.list_extends_constructor) {
                        if (maplistmine[i] < this.list_extends_constructor[i]) {
                            this.build_construction(i);
                            check_1 = false;
                            break;
                        }
                    }
                    if (check_1)
                        this.change_to_state(BUILD_STATE.BUILD_EXTENDS_MINE);

                }
                break;
            case BUILD_STATE.BUILD_EXTENDS_MINE:
                if (!this.list_order_constructor.every(e => maplistmine[e])) {
                    this.change_to_state(BUILD_STATE.BUILD_BASIC);
                } else if (this.buying_count < 1) {
                    var check_1 = true;
                    for (var i in this.list_extends_constructor) {
                        if (maplistmine[i] < this.list_extends_constructor[i]) {
                            this.change_to_state(BUILD_STATE.BUILD_EXTENDS);
                            return;
                        }
                    }

                    var list_constructor = unit_list_mine.filter(e => e.name == "con_contruction_allied");
                    var list_renfenery = unit_list_mine.filter(e => e.name == "con_refinery_allied");
                    if (list_renfenery.length < list_constructor.length * 2) {
                        console.log("BUILD con_refinery_allied");
                        this.build_construction("con_refinery_allied");
                    } else if (this.buy_veh_done == true && unit_list_mine.filter(e => e.name == UNIT_TYPE.vehicle.veh_mcv_allied).length == 0) {
                        this.buy_veh_done = false;
                        this.change_to_state(BUILD_STATE.BUILD_EXTENDS_MINE);
                    }
                }
                break;
            case BUILD_STATE.BUILD_MAINTAIN:

                break;
        }

    }

    change_to_state(state) {
        this.build_state = state;

        switch (state) {
            case BUILD_STATE.BUILD_INIT:
                var tmp;
                (new AI_Task_Grouph()).add_common_task(
                    COMMON_TASK.build_main_construction,
                    [tmp = this.get_point_to_build("con_contruction_allied")],
                    null,
                    e => this.change_to_state(BUILD_STATE.BUILD_BASIC)
                        || this.parent.resource_manager.on_build_construction_done("con_contruction_allied", tmp),
                    null
                );
                break;
            case BUILD_STATE.BUILD_EXTENDS_MINE:
                var tmp2;
                var grouph_task = new AI_Task_Grouph();
                var main_vehicle = null;
                grouph_task.wait_for_new_task = true;


                var __event__ = AI_helper.register_event(EVENT.on_unit_destroyed, function (e) {
                    if (main_vehicle && main_vehicle.ID == e.ID)
                        grouph_task.task_fail();
                }, this);

                grouph_task.on_listtask_done = grouph_task.on_listtask_fail = function () {
                    AI_helper.remove_event(EVENT.on_unit_destroyed, __event__);
                }


                //Buy veh_mcv_allied
                if (!AI_helper.find_unit_by_name(UNIT_TYPE.vehicle.veh_mcv_allied))
                    grouph_task.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_mcv_allied, 1, false]);

                grouph_task.add_common_task(COMMON_TASK.wait_task, [
                    () => (main_vehicle = unit_list_mine.find(e => e.name == UNIT_TYPE.vehicle.veh_mcv_allied)),
                    this
                ], null, e => (this.buy_veh_done = true));

                grouph_task.add_common_task(COMMON_TASK.wait_task, [
                    e => (tmp2 = this.get_point_to_build("con_contruction_allied")) != null,
                    this
                ], null, e => console.log("BUILD_STATE.BUILD_EXTENDS_MINE DONE"));

                //build new constructor
                grouph_task.add_common_task(
                    COMMON_TASK.build_main_construction,
                    [() => tmp2],
                    null,
                    e => this.parent.resource_manager.on_build_construction_done("con_contruction_allied", tmp2),
                    null
                );


                break;
        }
    }

    build_construction(name, point) {
        point = point || this.get_point_to_build(name);
        (new AI_Task_Grouph()).add_common_task(
            COMMON_TASK.building_construction, [name, point],
            null,
            e => setTimeout(() => this.build_construction_done(name, point), 250),
            e => setTimeout(() =>  this.build_construction_fail(name, point), 250)
        );
        this.buying_count++;
        this.buyinng_map[name] = (this.buyinng_map[name] || 0) + 1;
    }

    get_point_to_build(name) {
        switch (name) {
            //"con_contruction_allied"
            case UNIT_TYPE.constrution.con_contruction_allied:
                var near_mine_pos = this.parent.resource_manager
                    .get_nearest_mine(AI_helper.find_unit_by_name(UNIT_TYPE.vehicle.veh_mcv_allied), name);
                var near_position_can_build = AI_helper
                    .find_nearpoint_to_build(near_mine_pos.center, "con_contruction_allied", true, 40, 3);
                var result = near_position_can_build[0];
                if (result)
                    result._near_mine_pos_ = near_mine_pos;
                return result;
            case UNIT_TYPE.constrution.con_refinery_allied:
                var list_construction = unit_list_mine.filter(e => e.type == UNIT_TYPE.s.constrution);
                var list_renfenery = unit_list_mine.filter(e => e.name == "con_refinery_allied");
                var Mathhyp2 = (dx, dy) => dx * dx + dy * dy;
                var farmax = -Infinity;
                var con = null;
                for(var e of list_construction) {
                    var far = Math.min.apply(Math, list_renfenery.map(f => Mathhyp2(e.x - f.x, e.y - f.y)));
                    if (far > farmax) { con = e; farmax = far; }
                }

                var near_mine_pos = this.parent.resource_manager.get_nearest_mine(con, name);
                var dim = AI_helper._GRID_.dim;
                var poss = AI_helper.find_nearpoint_to_build(con, "con_refinery_allied", true, 10, 1);
                //debugger;
                poss.forEach(function (e) { e.l = near_mine_pos.grid[Math.round(e.x) * dim + Math.round(e.y)]; });
                result = poss.sort((e, f) => e.l - f.l)[0];
                if (result)
                    result._near_mine_pos_ = near_mine_pos;
                return result;
            default:
                return null;
        }
    }

    build_construction_done(name, pos) {
        this.buyinng_map[name]--;
        this.buying_count--;
        this.parent.resource_manager.on_build_construction_done(name, pos);
    }

    build_construction_fail(name, pos) {
        if (this.buyinng_map[name] > 0) {
            this.buyinng_map[name]--;
            this.buying_count--;
        }
    }

}


const RESOURCE_STATE = {
    RESOURCE_NONE: 0,
    RESOURCE_ENHANCE: 1,
    RESOURCE_SATURATE: 2,
    RESOURCE_EXTENDING_MINE: 3
}

class Resource_Manager {
    /**
     * 
     * @param {AI_controler_static} parent
     * */
    constructor(parent) {
        this.parent = parent;
        this.list_mine = [];
        this.state = RESOURCE_STATE.RESOURCE_NONE;
        this.list_con = [];
        this.list_ren = [];
        this.buying_ore_count = 0;
    }

    init() {
        AI_helper.register_event(EVENT.on_unit_destroyed, e => this.on_destroy_unit(e), null);

    }

    set_mine(e) {
        if (this.list_mine.indexOf(e) == -1)
            this.list_mine.push(e);
    }

    get_nearest_mine(pos, name) {
        var total = 0, x = 0, y = 0;
        for(var e of unit_list_enemy) { total++; x += e.x; y += e.y; }

        var idx = Math.round(pos.x) * AI_helper._GRID_.dim + Math.round(pos.y);
        var idx2 = Math.round(x / total) * AI_helper._GRID_.dim + Math.round(y / total);
        var list_same = unit_list_mine.filter(e => e.name == name);


        switch (name) {
            case UNIT_TYPE.constrution.con_contruction_allied:
                var list_tmp = map_info.listmine_grouph
                    .filter(e => !e.my_constructor)
                    .sort((e, f) => e.grid[idx] - f.grid[idx] - e.grid[idx2] + f.grid[idx2]);
                return list_tmp[0];
            default:
                var list_tmp = map_info.listmine_grouph
                    .sort((e, f) => e.grid[idx] - f.grid[idx] - e.grid[idx2] + f.grid[idx2]);
                return list_tmp[0];
        }


    }

    process() {
        var NUM_VEH_ORE = PARAM.NUM_VEH_ORE;
        var list_ren = unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution.con_refinery_allied);
        var list_ore = unit_list_mine.filter(e => e.name == UNIT_TYPE.vehicle.veh_ore_allied);
        if (list_ren.length > 1 && list_ren.length * NUM_VEH_ORE > list_ore.length + this.buying_ore_count) {
            var num = list_ren.length * NUM_VEH_ORE - list_ore.length - this.buying_ore_count;
            this.buying_ore_count += num;
            var T = new AI_Task_Grouph();
            T.add_common_task(COMMON_TASK.buy_unit, [
                UNIT_TYPE.vehicle.veh_ore_allied,
                num
            ],
            null,
            () => this.buying_ore_count -= num);
        }
    }

    /**
     * 
     * @param {String} name
     * @param {Point} pos
     * */
    on_build_construction_done(name, pos) {

        switch (name) {
            case UNIT_TYPE.constrution.con_contruction_allied:
                var newunit = unit_list_mine.find(e =>
                    e.name == UNIT_TYPE.constrution.con_contruction_allied
                    && this.list_con.indexOf(e) == -1
                )
                this.list_con.push(newunit);
                pos._near_mine_pos_.my_constructor = newunit;
                console.log(newunit);
                break;
            case UNIT_TYPE.constrution.con_refinery_allied:
                var newunit = unit_list_mine.find(e =>
                    e.name == UNIT_TYPE.constrution.con_refinery_allied
                    && this.list_ren.indexOf(e) == -1
                );
                this.list_ren.push(newunit);
                pos._near_mine_pos_.my_refinery = newunit;
                console.log(newunit);

                break;
        }
    }

    on_destroy_unit(unit) {
        switch (unit.name) {
            case UNIT_TYPE.vehicle.veh_mcv_allied:
            case UNIT_TYPE.constrution.con_contruction_allied:
                map_info.listmine_grouph.forEach(function (e) {
                    if (e.my_constructor && e.my_constructor.ID == unit.ID) {
                        e.my_constructor = undefined;
                    }
                });
                break;
            case UNIT_TYPE.constrution.con_refinery_allied:
                map_info.listmine_grouph.forEach(function (e) {
                    if (e.my_refinery && e.my_refinery.ID == unit.ID)
                        e.my_refinery = undefined;
                });
                break;
        }
        map_info.listmine_grouph.forEach(function (e) {


        });
    }
}


// #region NEED FOR DONE


class Build_container {
    /**
     * @param {Build_Manager} build_manager 
     * */
    constructor(build_manager) {
        this.parent = build_manager;
        this.list_contain = [];
        this.id = Math.random();
    }
    init() {
        this._ev1_ = AI_helper.register_event(EVENT.on_unit_destroyed, function (e) {
            e[this.id] = true;
        }, this);
    }
    check_alive() {
        return this.list_contain.length == 0;
    }
    process() {
        this.list_contain = this.list_contain.map(e => !e[this.id]);
    }
    delete () {
        AI_helper.remove_event(EVENT.on_unit_destroyed, this._ev1_);
    }
}

const BUILD_EXTENDS_MINE_STATE = {
    WAIT_CONSTRUCTION: 0,
    WAIT_REFENERY: 1,

}

class Build_Extend_Mine extends Build_container {
    /**
     * @param {Build_Manager} build_manager 
     * */
    constructor(build_manager) {
        super(build_manager);
    }
    check_condition() {

    }
}


// #endregion



