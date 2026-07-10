///// <reference path="Headquarters.js" />
//"use strict";

//console.log("MINISTRYOFDEFENSE");
//class MINISTRYOFDEFENSE extends HEADQUARTER {
//    constructor() {
//        super();
//    this.number = 20;
//    }

//    check_enemy_buy(data) {
    
//        if (data.team == 0) {
//            if (!this._check_enemy_buy_back_[data.name]) {
         
//                this._check_enemy_buy_back_[data.name] = true;
//                 if (data.type == "vehicle" || data.type == "solider") {
//                 console.log("NEW ENEMY UNIT TYPE : ", data.name);
//                 this.buy_vehicle.add_common_task(COMMON_TASK.buy_unit, [UNIT_TYPE.vehicle.veh_firetank, 1, true], null); //data.name
//            }
//         }
//        }
//    }
//    attack() {

//    }
//    defense() {

//    }
//}
//var Ministryofdefense = new MINISTRYOFDEFENSE();
//AI_helper.register_event(EVENT.on_new_unit, Ministryofdefense._check_enemy_buy_async_function_, Ministryofdefense);