/// <autosync enabled="true" />
/// <reference path="../AI_Task.js" />
/// <reference path="../Common_Task.js" />
/// <reference path="../../AI_Worker.js" />
/// <reference path="../State_Graph.js" />
/// <reference path="../Resource_manager.js" />


"use strict";

var TaskAttack = new AI_Task_Grouph();
var TaskDefense = new AI_Task_Grouph();
var TaskBuyUnit = new AI_Task_Grouph();
var TaskBuild = new AI_Task_Grouph();
TaskBuild.wait_for_new_task = true;
TaskBuyUnit.wait_for_new_task = true;
var g_debug = 1;

var build_construction = {
    build_con_contruction_allied: 0,
    build_con_barracks_allied: 0,
    build_con_factory_allied: 0,
    build_con_refinery_allied: 0,
    build_con_power_allied: 0,
    build_con_airplan_allied: 0,
    build_con_tech_allied: 0,
    build_con_garage_allied: 0,
    // defense
    build_con_primtower_allied: 0,
    build_con_teslatower_soviet: 0,
    build_pillbox: 0,
    build_con_super_cannon: 0,
    build_con_air_missle: 0
}
var buy_unit = {
    buy_sol_cons_soviet: 0,
    buy_sol_dog: 0,
    buy_sol_eng: 0,
    buy_sol_flakt_allied: 0,
    buy_sol_gi_allied: 0,
    buy_sol_ivan_soviet: 0,
    buy_sol_shk_soviet: 0,
    buy_sol_snipe_soviet: 0,
    buy_sol_spy_allied: 0,
    
    buy_veh_firetank: 0,
    buy_veh_ifv_allied: 0,
    buy_veh_mcv_allied: 0,
    buy_veh_ore_allied: 0,
    buy_veh_prism_allied: 0,
    buy_veh_rhi_soviet: 0,
    buy_veh_tesla_soviet: 0,
}

var roof_power;

function get_all_unit_power()
{
    //todo
}

class AI_controler_static extends AI_controler {
    constructor() {
        super();

        //import state
        importScripts("AI/Khoan/State/Peace.js?r=" + Math.random());
        importScripts("AI/Khoan/State/Attack.js?r=" + Math.random());
        importScripts("AI/Khoan/State/Defense.js?r=" + Math.random());
        importScripts("AI/Khoan/State/Rebuild.js?r=" + Math.random());
        importScripts("AI/Khoan/State/Danger.js?r=" + Math.random());

        //import connector
        importScripts("AI/Khoan/Connector/PeaceToAttack.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/PeaceToDanger.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/DangerToAttack.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/DangerToDefense.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/AttackToRebuild.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/AttackToDefense.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/RebuildToAttack.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/RebuildToDefense.js?r=" + Math.random());
        importScripts("AI/Khoan/Connector/DefenseToRebuild.js?r=" + Math.random());

        this.graph1 = new State_Graph();
        this.graph1.add_state("PEACE", PEACE);
        this.graph1.add_state("ATTACK", ATTACK);
        this.graph1.add_state("DANGER", DANGER);
        this.graph1.add_state("DEFENSE", DEFENSE);
        this.graph1.add_state("REBUILD", REBUILD);
        this.graph1.add_connect("PEACE", "ATTACK", PEACETOATTACK);
        this.graph1.add_connect("PEACE", "DANGER", PEACETODANGER);
        this.graph1.add_connect("DANGER", "ATTACK", DANGERTOATTACK);
        this.graph1.add_connect("DANGER", "DEFENSE", DANGERTODEFENSE);
        this.graph1.add_connect("ATTACK", "REBUILD", ATTACKTOREBUILD);
        this.graph1.add_connect("ATTACK", "DEFENSE", ATTACKTODEFENSE);
        this.graph1.add_connect("REBUILD", "ATTACK", REBUILDTOATTACK);
        this.graph1.add_connect("DEFENSE", "REBUILD", DEFENSETOREBUILD);

        this.graph1.set_init_state("PEACE");

    }
    process() {

    }

    on_game_start() {
        // quick attack
        /*
        {

            function autoattack() {
                var T = new AI_Task_Grouph();
                //T.wait_for_new_task = true;

                var list_T2;


                T.add_common_task(COMMON_TASK.wait_task, [function () {
                    //Filter List vehicle 
                    var list_filter = unit_list_mine.filter(e =>
                        e.type == "solider");

                    //Position of Home
                    var home_possition = unit_list_mine.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);

                    //Set list for other Task
                    list_T2 = AI_helper.get_list_around(list_filter, home_possition, 30);
                    //console.log("COMMON_TASK.wait_task", list_T2.length);
                    // if (AI_CONTROL.money < 200) {
                    if (list_T2.length > 10) {

                        console.log("COMMON_TASK.wait_task DONE", list_T2.length);
                        console.log(list_T2);
                        return true;
                    }
                    //Condiction to run next Task;
                }, this], { timeout: 10000000, try: 1 });

                T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, { x: 100, y: 100 }, 25], null, autoattack);

                T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, { x: 140, y: 140 }, 50]);

            }

            autoattack();
        }
        */
    }


    on_notify(flag, data) {

        super.on_notify(flag, data);
        switch (flag) {
            case "on_game_start":
                this.on_game_start();
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
        }
    }


}





