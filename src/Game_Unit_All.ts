
"use strict";

import { CONSTRUCTION_TYPE } from "./Game_Units/Construction/Construction_Unit_Type";
import { MAP_CONSTRUCTION_UNIT_TYPE } from "./Game_Units/Construction/Map_Construction_Unit";
import { PLANE_UNIT_TYPE } from "./Game_Units/MoviableUnit/Flyable_Unit";
import { SOLIDER_TYPE } from "./Game_Units/MoviableUnit/Solider_Unit/Solider_Unit_Type";
import { VEHICLE_TYPE } from "./Game_Units/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type";


export const INDEX_TYPE = new (function () {
    var arr = {};
    var id = 1234;
    var object;
    this.get = function (string) {
        return arr[string] || (arr[string] = ++id);
    }
    this.init = function () {
        var object = {};
        Object.assign(object, CONSTRUCTION_TYPE, VEHICLE_TYPE, SOLIDER_TYPE, MAP_CONSTRUCTION_UNIT_TYPE, PLANE_UNIT_TYPE);
        for (var i in object) {
            this.get(i);
            this.get(object[i].type);
        }
        object = null;
    }
    this.map = function () {
        var index = {}
        Object.keys(arr).forEach(e => index[[arr[e]]] = e);
        return index;
    }
    this.info = function () {
        if (object)
            return object;
        object = {};
        Object.assign(object, CONSTRUCTION_TYPE, VEHICLE_TYPE, SOLIDER_TYPE, MAP_CONSTRUCTION_UNIT_TYPE, PLANE_UNIT_TYPE);
        for (var i in object) {
            var tmp = {};
            tmp.name = object[i].name;
            tmp.type = object[i].type;
            tmp.property = object[i].property;
            tmp.require = object[i].require;
            tmp.has_workpoint = object[i].workpoint && true;
            object[i] = tmp;
        }
        return object;
    }
})();
