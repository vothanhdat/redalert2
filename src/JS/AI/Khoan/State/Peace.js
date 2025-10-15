/// <autosync enabled="true" />
/// <reference path="../../AI_Task.js" />
/// <reference path="../../Common_Task.js" />
/// <reference path="../../../AI_Worker.js" />
/// <reference path="../../State_Graph.js" />
/// <reference path="../../Resource_manager.js" />
/// <reference path="../AI.js" />

"use strict";

var PEACE = new State(
    //init
    function () {
        TaskBuild.add_common_task(COMMON_TASK.build_main_construction, [], null);
        TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_power_allied", null], null);
        TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_refinery_allied", null], null);
        TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
    },
    //process
    function () {
        if (false)
        {
            console.log("PEACE STATE PROCESS");
            //Quick attack
            /*
            {
                TaskBuild.add_common_task(COMMON_TASK.build_main_construction, [], null);
                TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_power_allied", null], null);
                //above
                TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_refinery_allied", null], null);
                //below {x: 112, y: 169}
                //{ x: 26, y: 88 }
                TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_airplan_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_tech_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_barracks_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuild.add_common_task(COMMON_TASK.building_construction, ["con_factory_allied", null], null);
                //TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_ore_allied, 6, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_cons_soviet, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_flakt_allied, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 20, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
                TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
            }
            */

        }
        TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_gi_allied, 10, true], null);
        TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_cons_soviet, 10, true], null);
        TaskBuyUnit.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.solider.sol_flakt_allied, 10, true], null);
    }
);