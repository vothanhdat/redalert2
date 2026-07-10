/// <reference path="Headquarters.js" />
/// <reference path="../../AI_Worker.js" />

"use strict";

class CONSTRUCTION extends HEADQUARTER  {
    constructor() {
        super();
        var completed = false;
        this.data_1 = 10;
        this.data_2 = 2;
        this.data_3 = 1;
        this.data_4 = 1;
        this.T1 = new AI_Task_Grouph();
        this.T2 = new AI_Task_Grouph();
        this.T3 = new AI_Task_Grouph();
        this.T4 = new AI_Task_Grouph();
        this.T5 = new AI_Task_Grouph();
        this.T6 = new AI_Task_Grouph();

        this.T1.wait_for_new_task = true;
        this.T2.wait_for_new_task = false;
        this.T3.wait_for_new_task = true;
        this.T4.wait_for_new_task = true;
        this.T5.wait_for_new_task = true;
        this.T6.wait_for_new_task = true;
        {
            var TaskBuild_Denfense = new AI_Task_Grouph();
            var list_point = [{ x: 125, y: 129 }, { x: 127, y: 128 }, { x: 129, y: 126 }, { x: 131, y: 124 }, { x: 133, y: 121 }];
            TaskBuild_Denfense.wait_for_new_task = true;

            //TaskBuild_Denfense.add_common_task(COMMON_TASK.wait_task, [function () {
            //    return unit_list_mine.filter(e => e.name == UNIT_TYPE.vehicle.veh_ore_allied).length > 7;
            //}]);

            var build_defense = function () {
                console.log("TASK build_defense run =================================== ");
                TaskBuild_Denfense.add_common_task(
                    COMMON_TASK.building_construction,
                    [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 76, y: 72 }, null, 15],
                    null,
                    build_defense
                );
            }

            build_defense();

        }
    }
    //get my_unit() {
    //    return unit_list_mine.filter( e => e.type) unit_list_mine.filter(e => e.type == "contruction").length >= 1
    //}
    build_construction_1() {
        console.log(" buon qua troi qua dat_1");
        
        if (unit_list_mine.filter(e => e.type == "contruction").length >= 5) {
            console.log(" buon qua troi qua dat_1"+ AI_CONTROL.money);
            // add condition to buy vihicle ore_allied
            
                
            // check speed of buy solider and vehicle
            // if lose vehicle ore and lose money, main_build, power
            //if (AI_CONTROL.money > 1000) {
            //    this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 76, y: 72 }, null, 8]);
            //    this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 76, y: 72 }, null, 8]);
            //    this.data_2 += 1;
            //}
            if (AI_CONTROL.money > 7000) {
               // this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ore_allied, 1], null);
                this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_firetank, 2, true], null);
                //this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ifv_allied, 3, true], null);
               // this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_tesla_soviet, 2, true], null);
                this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_tesla_soviet, 3, true], null);
                //this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_prism_allied, 3, true], null);
                //this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_tesla_soviet, 3, true], null);
               // this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_eng, 1, true], null);
                this.data_2 += 1;
            }
            //if (AI_CONTROL.money > 5000) {
            //    this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_firetank, 1, true], null);
            //    this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ifv_allied, 1, true], null);
            //    this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_rhi_soviet, 1, true], null);
            //    this.data_2 += 1;
            //}
            
            //if (unit_list_mine.filter(e => e.type == "contruction").length >= 5 && AI_CONTROL.money > 2000 && unit_list_mine.filter(e => e.name == UNIT_TYPE.constrution.con_tech_allied).length>0) {
            //   //if (unit_list_mine.filter(e => e.name == "con_barracks_allied").length < 4)
            //       //this.T3.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
            //   if (unit_list_mine.filter(e => e.name == "con_factory_allied").length < 6)
            //    this.T3.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
            //    this.data_2 += 1;
            //}
            ////this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, null], null);
            ////this.T1.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, null], null);



            //if (unit_list_mine.filter(e => e.type == "contruction").length >= 10 && AI_CONTROL.money > 1000) {
            //    this.T4.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_mcv_allied, 1], null);
            //    this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution.con_garage_allied, null], null);
            //    this.T4.add_common_task(COMMON_TASK.build_main_construction, [null, 2], null);
            //    this.T4.add_common_task(COMMON_TASK.building_construction, ["con_airplan_allied", null], null);
            //    this.T4.add_common_task(COMMON_TASK.building_construction, ["con_tech_allied", null], null);
            //    this.data_2 += 1;
            //    this.data_1 += 10;
            //}
            ////this.T6.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ore_allied, 1], null);
            //if (AI_CONTROL.money > 1000) {
            //    this.data_2 += 1;
            //    this.T5.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 76, y: 72 }, null, 8]);
            //    this.T5.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, { x: 76, y: 72 }, null, 8]);
            //    this.T5.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, { x: 76, y: 72 }, null, 8]);
            //    this.T5.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 76, y: 72 }, null, 8]);
            //    //TaskBuild_Denfense.add_common_task(
            //    //        COMMON_TASK.building_construction,
            //    //        [UNIT_TYPE.constrution_defense.con_super_cannon, { x: 128, y: 125 }, null, 9],
            //    //        null,
            //    //        build_defense);
            //}
            

           // this.build_construction_2();
        }
    }
    build_construction_2() {
        console.log(  unit_list_mine.filter(e => e.type=="vehicle"));
        if (unit_list_mine.filter(e => e.type == "contruction").length > 7) {
            console.log(" buon qua troi qua dat_2");
            
            //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
            //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
            //this.T2.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_air_missle, null], null);
            //this.T2.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, null], null);
            //this.T2.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, null], null);
            //this.T2.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ore_allied, 2], null);
            //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
            //this.T2.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);

            this.build_construction_3();
        }
    }
    build_construction_3() {
        console.log(" buon qua troi qua dat_3");
        if (unit_list_mine.filter(e => e.type == "contruction").length > 1) {
          
            console.log(" buon qua troi qua dat");
            
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_air_missle, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, null], null);

            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_air_missle, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, null], null);

            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_air_missle, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, null], null);
            //this.T3.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, null], null);
            //this.build_construction_4();
        }
    }
    build_construction_4() {
        console.log(" buon qua troi qua dat_4");
        if (unit_list_mine.filter(e => e.type == "contruction_denfense").length > 1) {
           
            console.log(" buon chet mei");
            //this.T4.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_mcv_allied, 1], null);
            //this.T4.add_common_task(COMMON_TASK.build_main_construction, [null, 2], null);
            //this.T4.add_common_task(COMMON_TASK.building_construction, ["con_airplan_allied", null], null);
            //this.T4.add_common_task(COMMON_TASK.building_construction, ["con_tech_allied", null], null);
            //this.T4.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
            //this.T4.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);

            //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_super_cannon, null], null);
            //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_air_missle, null], null);
            //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_teslatower_soviet, null], null);
            //this.T4.add_common_task(COMMON_TASK.building_construction, [UNIT_TYPE.constrution_defense.con_primtower_allied, null], null);
        }
    }


}
var construction = new CONSTRUCTION();
AI_helper.register_event(EVENT.on_new_unit, construction.build_construction_1, construction);
