/// <autosync enabled="true" />
/// <reference path="../../AI_Task.js" />
/// <reference path="../../Common_Task.js" />
/// <reference path="../../../AI_Worker.js" />
/// <reference path="../../State_Graph.js" />
/// <reference path="../../Resource_manager.js" />
/// <reference path="../AI.js" />

"use strict";
var REBUILDTODEFENSE = new Connector(
    //Condition
    function () {
    },
    //Action when change state
    function () {
        console.log("change REBUILDTODEFENSE");
    },
    //Init local variable
    function () {
    }
);
