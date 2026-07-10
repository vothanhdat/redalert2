/// <autosync enabled="true" />
/// <reference path="../../AI_Task.js" />
/// <reference path="../../Common_Task.js" />
/// <reference path="../../../AI_Worker.js" />
/// <reference path="../../State_Graph.js" />
/// <reference path="../../Resource_manager.js" />
/// <reference path="../AI.js" />

"use strict";
var attack_flag;
var ATTACK = new State(
    //init
    function () {
        attack_flag = 1;
    },
    //process
    function () {
        if (attack_flag) {
            attack_flag = 0;
            console.log("ATTACK STATE PROCESS");
            /*var mylist = unit_list_mine.filter(e => e.type == "solider" || e.type == "vehicle");
            send_command(mylist, { com: "move", goal: { x: 50, y: 80 } });
            AI_helper.register_event(EVENT.on_attacked,
                function (data, This) {
                    send_command([ data ], { com: "auto" });
            }, this)
            //send_command(mylist, { com: "auto"});*/

            var list_T2;

            function autoattack() {
                var T = new AI_Task_Grouph();
                //T.wait_for_new_task = true;

                var list_T2;


                T.add_common_task(COMMON_TASK.wait_task, [function () {
                    //Filter List vehicle 
                    var list_filter = unit_list_mine.filter(e =>  e.type == "vehicle" && e.name != UNIT_TYPE.vehicle.veh_ore_allied);

                    //Position of Home
                    var home_possition = unit_list_mine.find(e => e.name == UNIT_TYPE.constrution.con_contruction_allied);

                    //Set list for other Task
                    list_T2 = AI_helper.get_list_around(list_filter, home_possition, 30);
                    //console.log("COMMON_TASK.wait_task", list_T2.length);

                    //Condiction to run next Task;
                    return list_T2.length >= 30;
                }, this]);

                T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, { x: 100, y: 100 }, 25], null, autoattack);

                T.add_common_task(COMMON_TASK.clean_area, [() => list_T2, { x: 64, y: 60 }, 25]);

            }
            autoattack();
        }
    }
);



