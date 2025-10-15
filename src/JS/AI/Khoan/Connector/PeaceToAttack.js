/// <autosync enabled="true" />
/// <reference path="../../AI_Task.js" />
/// <reference path="../../Common_Task.js" />
/// <reference path="../../../AI_Worker.js" />
/// <reference path="../../State_Graph.js" />
/// <reference path="../../Resource_manager.js" />
/// <reference path="../AI.js" />

"use strict";
var PEACETOATTACK = new Connector(
    //Condition
    function () {
        if (unit_list_mine.filter(e => e.type == "solider" || e.type == "vehicle").length > 50)
            return true;
        if (g_debug == 113)
            return true;
    },
    //Action when change state
    function () {
        console.log("change PEACETOATTACK");
    },
    //Init local variable
    function () {
    }
);
