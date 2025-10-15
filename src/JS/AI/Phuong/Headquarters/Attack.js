/// <reference path="Headquarters.js" />
"use strict";

class ATTACK extends HEADQUARTER {
    constructor() {
        super();
        completed: false;
        var list_T2;
        this.lllllllll = {};
        this.init = 100;

        var func_protect_home = function (This) {
            console.log(" this is AI_protected");
            var list_filter = unit_list_mine.filter(e =>
                !This.lllllllll[e.ID] && (
                    (e.type == "vehicle" && e.name != UNIT_TYPE.vehicle.veh_ore_allied)
                    //(e.type == "solider" && e.name != unit_type.solider.sol_eng && e.name != unit_type.solider.sol_eng)
                ));
            console.log("protect home run ========================================================================> ");
            //var home_possition = unit_list_mine.find(e => e.name == unit_type.constrution.con_contruction_allied);
            if (list_filter.length >= 5)
                CONTROL.send_command(list_filter, { com: "protect_area", pos: { x: 53, y: 68 }, radius: 40 });
        }
        setInterval(func_protect_home, 5000,this);

    }


    autoattack() {
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");
        var T = new AI_Task_Grouph();
        //T.wait_for_new_task = true;

        var list_T2;


        T.add_common_task(COMMON_TASK.wait_task, [function () {
            //Filter List vehicle 
            var list_filter = unit_list_mine.filter(e =>
               e.type == "vehicle" 
               && 
                    e.name != UNIT_TYPE.vehicle.veh_ore_allied
                    && !this.lllllllll[e.ID] );

            //Position of Home
            //var home_possition = unit_list_mine.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);

            //Set list for other Task
            list_T2 = AI_helper.get_list_around(list_filter, { x: 66, y: 62 }, 60);
            console.log("COMMON_TASK.wait_task", list_T2.length);
            if (list_T2.length >= 50) {
                list_T2.forEach(e => this.lllllllll[e.ID] = true);
                this.init == 100 ? this.init = 50 : this.init = 100;
                return true;
            }
            //Condiction to run next Task;
        }, this], { timeout: 10000000, try: 1 });

        T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, { x: 70, y: 70 }, 35], null, e => this.autoattack());

        T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, { x: 100, y: 100 }, 35]);

        T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, { x: 136, y: 132 }, 35]);

    }



}
var attack = new ATTACK();
attack.autoattack();