/// <autosync enabled="true" />
/// <reference path="../AI_Task.js" />
/// <reference path="../Common_Task.js" />
/// <reference path="../../AI_Worker.js" />
/// <reference path="../State_Graph.js" />
/// <reference path="../Resource_manager.js" />
/// <reference path="Headquarters/Headquarters.js" />


"use strict";



class AI_controler_static extends AI_controler {
    constructor() {
        super();

        importScripts("AI/Phuong/State_and_Connect.js?r=" + Math.random());
        importScripts("AI/Phuong/Headquarters/Headquarters.js?r=" + Math.random());
        importScripts("AI/Phuong/Headquarters/Attack.js?r=" + Math.random());
        importScripts("AI/Phuong/Headquarters/Construction.js?r=" + Math.random());
        importScripts("AI/Phuong/Headquarters/Defense.js?r=" + Math.random());
        importScripts("AI/Phuong/Headquarters/Ministryofdefense.js?r=" + Math.random());

        //this.resource_manager = new Resource_manager();
        this.now_power = 0;



        this.graph1 = new State_Graph();



        this.a = 1000;




        AI_helper.register_event(EVENT.on_new_unit_ready, function (data, This) {
            this.a + 10;

        }, this);

    }
    process() {

       // Head_Quarters.check_enemy_buy();

    }

    on_game_start() {




        this.T1 = new AI_Task_Grouph();
        this.T2 = new AI_Task_Grouph();
        this.T3 = new AI_Task_Grouph();
        this.T4 = new AI_Task_Grouph();
        this.T5 = new AI_Task_Grouph();
        this.T6 = new AI_Task_Grouph();

        this.T1.wait_for_new_task = false;
        this.T2.wait_for_new_task = true;
        this.T3.wait_for_new_task = true;
        this.T4.wait_for_new_task = true;
        this.T5.wait_for_new_task = true;
        this.T6.wait_for_new_task = true;


        this.T1.add_common_task(COMMON_TASK.build_main_construction, [{ x: 36, y: 79 }], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_power_allied", null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_refinery_allied", null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
        //this.T1.add_common_task(COMMON_TASK.building_construction, ["con_airplan_allied", null], null);
        //this.T1.add_common_task(COMMON_TASK.building_construction, ["con_tech_allied", null], null);

        //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_super_cannon", { x: 133, y: 129 }], null);
        //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_super_cannon", { x: 133, y: 129 }], null);
        //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_super_cannon", { x: 133, y: 129 }], null);
        //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_super_cannon", { x: 133, y: 129 }], null);
        //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_super_cannon", { x: 133, y: 129 }], null);
       

        this.T1.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ore_allied, 5], null);

        this.T1.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ifv_allied, 10], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_refinery_allied", null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution.con_airplan_allied, null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution.con_tech_allied, null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution.con_garage_allied, null], null);
        

        //this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 72, y: 67 }, null, 8]);
        //this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 72, y: 67 }, null, 8]);
        

        this.T1.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ore_allied, 5], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
        
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);

        this.T1.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ore_allied, 15], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
        this.T1.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
        //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, null], null);
        //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_air_missle, null], null);
        //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, null], null);
        //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, null], null);
        //AI_helper.set_default_point_vehivle({ x: 108, y: 105 });
    }

    on_unit_move_done() {

    }

    on_notify(flag, data) {

        super.on_notify(flag, data);
        switch (flag) {
            case "on_game_start":

                this.on_game_start();
                //Head_Quarters.information();
                break;
            case "on_unit_move_done":
                
               /// this.on_unit_move_done();
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





