/// <reference path="../AI.js" />
/// <reference path="Ministryofdefense.js" />
"use strict";
// thong tin tien luc dau
// thong tin xe va linh luc dau
// bao hoan thanh chua
class HEADQUARTER{

    constructor() {
        this.build_constructin = new AI_Task_Grouph();
        this.build_constructin.wait_for_new_task = true;
        this._check_enemy_buy_back_= {};
        this._check_enemy_buy_back_time_ = performance.now();
        this.buy_vehicle = new AI_Task_Grouph();
        this.build_construction = new AI_Task_Grouph();
        this.buy_vehicle.wait_for_new_task = true;
        this.build_constructin.wait_for_new_task = true;

    }        
    _check_enemy_buy_async_function_ (data) {
        if (performance.now() - this._check_enemy_buy_back_time_ < 10000)
            return;
        var __s__ = setInterval(function (data,This) {
            This.check_enemy_buy(map_unit_index[data]);
            clearTimeout(__s__);
        }, 500, data,this);
    }
    get money() {
        return AI_CONTROL.money;
    }
    get unit() {
        return unit_list_enemy.filter(e=>e.type == "solider").length;
    }
    get vehicle() {
        return unit_list_enemy.filter(e=>e.type == "vehicle").length;
    }
    
    rebuild_destroy(data) {
        console.log("rebuild_destroy");
        var T1 = new AI_Task_Grouph();
        T1.wait_for_new_task = true;
        if (data.type != "solider" && data.type != "vehicle")
        T1.add_common_task(COMMON_TASK.building_construction, [data.name, data, 10]);
    }
   
    check_speedbuild() {

    }
    

}

var Head_Quarters = new HEADQUARTER();

AI_helper.register_event(EVENT.on_unit_destroyed, Head_Quarters.rebuild_destroy, Head_Quarters);
