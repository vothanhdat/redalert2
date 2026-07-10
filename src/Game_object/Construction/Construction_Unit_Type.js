import { LATE } from "../../core/late.js";
import { TEAM } from "../../Controler.js";
import { Buy_Construction_unit, Construction_unit, Rotate_Construction_unit } from "./Construction_Unit.js";
import { GRID } from "../GRID.js";
import { GAME_OBJECT, calcfar2 } from "../Game_object.js";
import { IMAGE_PROCESS } from "../../Image_process.js";
import { SPEED } from "../../core/state.js";
import { STATE } from "../../lib/JavaScript_helper.js";

/// <reference path="Construction_Unit.js" />
"use strict";
var CONSTRUCTION_TYPE = {};

var CONSTRUCTION_AUDIO = {
    build: "Audio/uplace.wav",
    destroy: "Audio/vgendiee.wav",
    unbuild: "Audio/uselbuil.wav",
    prepair_attack: null,
    run: null,
    select: null,
};


CONSTRUCTION_TYPE.con_contruction_allied = {
    name: "con_contruction_allied",
    type: "contruction",
    img: {
        main_path: "IMG/Unit/Construction/constructor/",
        build: { path: "build/img", from: 1, to: 29, step: 1 / 3 },
        run: { path: "run/img", from: 1, to: 20, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 6, step: 1 / 3 },
        normal: { path: "build/img (29)" },
        impaired: { path: "destroy/img (1)" },
        impaired_fire: [[1, -2, 1, 'fire1'], [1, -1, 1, 'fire3']],
        margin: { x: 139, y: 171 }
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 4, h: 4, h_: 10 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        life: 1000,
        cost: 0,
        sight: 17
    },
    class: class extends Construction_unit {
        command(command) {
            switch (command.com) {
                case "change":
                    this.changetostate(STATE.SELLING);
                    this.sprites._object_ = this;
                    this.sprites.onComplete = function () {
                        let This = this._object_;
                        let newunit = new LATE.VEHICLE_TYPE.veh_mcv_allied.class(
                            This.x - 1, This.y - 1, This.z, This.team,
                            LATE.VEHICLE_TYPE.veh_mcv_allied
                        );
                        This.change_type(LATE.VEHICLE_TYPE.veh_mcv_allied.class, newunit);
                        command.goal && This.command({ com: "move", group: { list: [This], goal: command.goal }, goal: command.goal });
                        This = null;
                    };
                    break;
                default:
                    super.command(command);
                    break;
            }
        }
        process_functional_done(data) {
            super.process_functional_done(data);
            this.changetostate(STATE.RUN);
            TEAM[this.team].team.on_buy_construction_done(data);
        }
    },
    functional: {
        get construction() {
            return Object.keys(CONSTRUCTION_TYPE).filter(e=>CONSTRUCTION_TYPE[e].type == "contruction");
        },
        get contruction_denfense() {
            return Object.keys(CONSTRUCTION_TYPE).filter(e=>CONSTRUCTION_TYPE[e].type == "contruction_denfense");
        }
    },
    require: ["Not_found"],
    can_change: true,
};



CONSTRUCTION_TYPE.con_power_allied = {
    name: "con_power_allied",
    type: "contruction",
    img: {
        width: 250, height: 148,
        main_path: "IMG/Unit/Construction/power_allied/",
        build: { path: "build/img", from: 1, to: 25, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 8, step: 1 / 9 },
        normal: { path: "build/img (25)" },
        impaired: { path: "destroy/img (1)" },
        impaired_fire: [[0, 0.5, 1, 'fire3']],
        margin: { x: 68, y: 84 },
        effexp: "pow_exp",
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 2, h: 2, h_: 8 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        life: 400,
        cost: 800,
        power: 800,
        sight: 8

    },
    require: ["con_contruction_allied"]
}



CONSTRUCTION_TYPE.con_refinery_allied = {
    name: "con_refinery_allied",
    type: "contruction",
    img: {
        main_path: "IMG/Unit/Construction/refinery_allied/",
        build: { path: "build/img", from: 1, to: 25, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 6, step: 1 / 3 },
        normal: { path: "build/img (25)" },
        impaired: { path: "destroy/img (1)" },
        impaired_fire: [[-1.5, 1, 1, "fire3"], [0, -1, 3, "fire3"]],
        margin: { x: 122, y: 149 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 4, h: 3, h_: 8 },
        shield: { _1: Infinity, _2: 70, _3: 70, _4: 70 },
        life: 500,
        cost: 2000,
        power: -250,
        sight: 8

    },
    require: ["con_contruction_allied", "con_power_allied"],
    class: class extends Construction_unit {
        init() {
            super.init();
            this.work_point = { x: Math.round(this.x + 2), y: Math.round(this.y) };
            GAME_OBJECT.add_unit(this.work_point.x, this.work_point.y, 0, this.team, LATE.VEHICLE_TYPE.veh_ore_allied);
        }
        get_grouph_move() {
            if (!this._grouph_move_)
                this._grouph_move_ = { goal: this, grid: this.get_grid(), list: [] };
            return this._grouph_move_;
        }

        get_grid() {
            if (!this.grid_move)
                this.grid_move = GRID.get_grid_move(this);
            return this.grid_move;
        }
        get_element_ceil() {
            var tmp = super.get_element_ceil();
            for (var e of tmp)
                e.l = 10;
            tmp.push({ x: Math.round(this.x + 2), y: Math.round(this.y), l: 0 });
            return tmp;
        }

        process(time) {
            super.process(time);
            (Math.random() > 0.95) && GAME_OBJECT.add_instance(new LATE.SmokeEffect(this.x - 1.5, this.y + 0.1, this.z + 8));
            (Math.random() > 0.95) && GAME_OBJECT.add_instance(new LATE.SmokeEffect(this.x - 1.5, this.y - 1.3, this.z + 8));
        }
    }
}




CONSTRUCTION_TYPE.con_barracks_allied = {
    name: "con_barracks_allied",
    type: "contruction",
    img: {
        width: 250, height: 148,
        main_path: "IMG/Unit/Construction/barracks/",
        build: { path: "build/img", from: 1, to: 25, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 16, step: 1 / 3 },
        normal: { path: "build/img (25)" },
        impaired: { path: "destroy/img (1)" },
        impaired_fire: [],
        margin: { x: 139, y: 110 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 3, h: 2, h_: 6 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        life: 500,
        cost: 800,
        power: -200,
        sight: 7

    },
    require: ["con_contruction_allied", "con_power_allied", "con_refinery_allied"],
    workpoint: { x: 2, y: 2 },
    gopoint: { x: 0, y: 0 },
    class: Buy_Construction_unit,
    functional: {
        get solider() {
            return Object.keys(LATE.SOLIDER_TYPE);
        },
    },
    get functional_type() {
        return LATE.SOLIDER_TYPE;
    }
}




CONSTRUCTION_TYPE.con_factory_allied = {
    name: "con_factory_allied",
    type: "contruction",
    img: {
        width: 284, height: 226,
        main_path: "IMG/Unit/Construction/factory/",
        build: { path: "build/img", from: 1, to: 25, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 15, step: 1 / 3 },
        normal: { path: "build/img (25)" },
        impaired: { path: "destroy/img (12)" },
        impaired_fire: [],
        margin: { x: 159, y: 170 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 5, h: 3, h_: 8 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        life: 500,
        cost: 2000,
        power: -400,
        sight: 10

    },
    require: ["con_contruction_allied", "con_power_allied", "con_refinery_allied", "con_barracks_allied"],
    workpoint: { x: 4, y: 0 },
    gopoint: { x: 2, y: 0 },
    class: class extends Buy_Construction_unit {
        process_functional_done(data) {
            var unit = super.process_functional_done(data);
            if (data.name == "veh_ore_allied")
                window.setTimeout(function (e) {
                    e.command({ com: "auto", });
                }, 1000 / SPEED, unit);
            unit = null;
        }
    },
    functional: {
        get vehicle() {
            return Object.keys(LATE.VEHICLE_TYPE);
        },
        plane: ["zeg"]
    },
    get functional_type() {
        return this._functional_type_ || (this._functional_type_ = Object.assign({}, LATE.VEHICLE_TYPE, LATE.PLANE_UNIT_TYPE));
    }
}











CONSTRUCTION_TYPE.con_airplan_allied = {
    name: "con_airplan_allied",
    type: "contruction",
    img: {
        width: 210, height: 196,
        main_path: "IMG/Unit/Construction/airplant/",
        build: { path: "build/img", from: 1, to: 25, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 8, step: 1 / 10 },
        active_impaired: { path: "active/img", from: 9, to: 16, step: 1 / 10 },
        normal: { path: "build/img (25)" },
        impaired: { path: "destroy/img" },
        impaired_fire: [[1, 1, 0, "fire1"], [-2, 1, 2, 'fire1']],
        margin: { x: 106, y: 116 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 3, h: 2, h_: 10 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        life: 400,
        cost: 1500,
        power: -300,
        sight: 8

    },
    require: ["con_contruction_allied", "con_power_allied", "con_refinery_allied", "con_barracks_allied"],
    functional: {
        plane: ["beag"],
    },
    get functional_type() {
        return LATE.PLANE_UNIT_TYPE;
    },
    class: class extends Construction_unit {
        constructor(...Args) {
            super(...Args);
            this.list_plane = [];
        }
        process_functional_done(data) {
            for (var i = 0; i < 4; i++) {
                if (!this.list_plane[i]) {
                    this.list_plane[i] = GAME_OBJECT.add_unit(
                        this.x + i % 2,
                        this.y - 1 + Math.floor(i / 2),
                        0, this.team,
                        this.property.functional_type[data.name]
                    );
                    this.list_plane[i].home = this;
                    return;
                }
            }
        }
        process_functional(time) {
            if (this.list_plane.filter(e => e).length < 4)
                super.process_functional(time);
        }
        process(time) {
            super.process(time);
            for (var i = 0; i < 4; i++) {
                if (this.list_plane[i] && this.list_plane[i].state == STATE.DELETE)
                    this.list_plane[i] = null;
            }
        }

        /**
        * @param {Game_unit}
        */
        register_home(ob) {
            //debugger;
            for (var i = 0; i < 4; i++) {
                if (!this.list_plane[i]) {
                    this.list_plane[i] = ob;
                    return {
                        x: Math.round(this.x + i % 2),
                        y: Math.round(this.y - 1 + Math.floor(i / 2))
                    }
                }
            }
            return false;
        }

        unregister_home(ob) {
            //debugger;
            for (var i = 0; i < 4; i++) {
                if (this.list_plane[i] == ob)
                    this.list_plane[i] = null;
            }
        }
    }
}




CONSTRUCTION_TYPE.con_garage_allied = {
    name: "con_garage_allied",
    type: "contruction",
    img: {
        main_path: "IMG/Unit/Construction/garage/",
        build: { path: "img", from: 1, to: 25, step: 1 / 3 },
        normal: { path: "img (25)" },
        impaired_fire: [],
        margin: { x: 91, y: 118 },
        sight: 8

    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 3, h: 3, h_: 5 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        life: 500,
        cost: 2000,
        power: -200,
    },
    require: ["con_power_allied", "con_contruction_allied", "con_refinery_allied", "con_factory_allied"],
}



CONSTRUCTION_TYPE.con_tech_allied = {
    name: "con_tech_allied",
    type: "contruction",
    img: {
        main_path: "IMG/Unit/Construction/technology/",
        build: { path: "build/img", from: 1, to: 25, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 12, step: 1 / 6 },
        active_impaired: { path: "active/img", from: 13, to: 24, step: 1 / 6 },
        normal: { path: "build/img (25)" },
        impaired: { path: "destroy/img" },
        impaired_fire: [],
        margin: { x: 186, y: 187 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 3, h: 2, h_: 20 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        life: 500,
        cost: 2000,
        power: -500,
        sight: 8

    },
    require: ["con_power_allied", "con_contruction_allied", "con_airplan_allied", "con_refinery_allied", "con_factory_allied"],
}



CONSTRUCTION_TYPE.pillbox = {
    name: "pillbox",
    type: "contruction_denfense",
    img: {
        main_path: "IMG/Unit/Construction/pillbox/",
        build: { path: "build/img", from: 1, to: 8, step: 1 / 3 },
        normal: { path: "build/img (8)" },
        impaired_fire: [],
        margin: { x: 32, y: 45 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 1, h: 1, h_: 2 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        attack_dam: 12,
        attack_type: "attack_submachine",
        range: 8,
        life: 200,
        cost: 600,
        attack_time: 15,
        power: 0,
        sight: 8

    },
    require: ["con_refinery_allied", "con_barracks_allied"]
}





CONSTRUCTION_TYPE.con_air_missle = {
    name: "con_air_missle",
    type: "contruction_denfense",
    img: {
        main_path: "IMG/Unit/Construction/air_missle_defender/",
        build: { path: "build/img", from: 1, to: 9, step: 1 / 3 },
        normal: { path: "build/base" },
        rotate: (function () {
            var property = {
                normal: { margin: { x: 28, y: 42 } },
            };
            IMAGE_PROCESS.process_vehicle(property, "IMG/Unit/Construction/air_missle_defender/", {}, 45, 9);
            return property;
        })(),
        margin: { x: 48, y: 48 },
        impaired_fire: [],
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 1, h: 1, h_: 6 },
        shield: { _1: Infinity, _2: 30, _3: 30, _4: 30 },
        attack_dam: 8,
        attack_type: "attack_rpg_fast",
        attack_height: 5,
        attack_distance: 0,
        range: 15,
        life: 200,
        cost: 1500,
        attack_time: 55,
        power: -300,
        sight: 15,
        rotate_v: 3,
        minimun_angel: 1,
        sight: 8,
        attack_air: true,
    },
    class: class extends Rotate_Construction_unit {
        filter_enemy(ob) {
            return (ob instanceof LATE.Flyable_Unit);
        }
    },
    require: []
}




CONSTRUCTION_TYPE.con_primtower_allied = {
    name: "con_primtower_allied",
    type: "contruction_denfense",
    img: {
        width: 284, height: 226,
        main_path: "IMG/Unit/Construction/primtower/",
        build: { path: "build/img", from: 1, to: 8, step: 1 / 3 },
        run: { path: "run/img", from: 1, to: 10, step: 1 / 3 },
        run_impaired: { path: "run/img", from: 11, to: 20, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 9, step: 1 / 3 },
        active_impaired: { path: "active/img", from: 10, to: 18, step: 1 / 6 },
        normal: { path: "build/img" },
        impaired: { path: "destroy/img_" },
        impaired_fire: [[0, 0, 1, 'fire1']],
        margin: { x: 86, y: 93 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO,
        prepair_attack: "Audio/bpripow.wav"
    },
    property: {
        size: { w: 1, h: 1, h_: 14 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        attack_dam: 15,
        attack_type: "attack_heavy_prims",
        attack_height: 12,
        range: 11,
        life: 150,
        cost: 1500,
        attack_time: 90,
        sight: 12,
        power: -400,
    },
    require: ["con_contruction_allied", "con_power_allied", "con_factory_allied", "con_tech_allied"]

}




CONSTRUCTION_TYPE.con_teslatower_soviet = {
    name: "con_teslatower_soviet",
    type: "contruction_denfense",
    img: {
        main_path: "IMG/Unit/Construction/teslatower/",
        build: { path: "build/img", from: 1, to: 25, step: 1 / 3 },
        run: { path: "run/img", from: 1, to: 10, step: 1 / 3 },
        run_impaired: { path: "run/img", from: 11, to: 20, step: 1 / 3 },
        active: { path: "active/img", from: 1, to: 10, step: 1 / 3 },
        active_impaired: { path: "active/img", from: 11, to: 20, step: 1 / 3 },
        normal: { path: "build/img (25)" },
        impaired: { path: "destroy/img (1)" },
        impaired_fire: [[0, 0, 1, 'fire1']],
        margin: { x: 79, y: 79 },
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO,
        prepair_attack: "Audio/btespow.wav"
    },
    property: {
        size: { w: 1, h: 1, h_: 14 },
        shield: { _1: Infinity, _2: 50, _3: 50, _4: 50 },
        attack_dam: 15,
        attack_type: "attack_super_tesla",
        attack_height: 12,
        range: 11,
        life: 150,
        cost: 1500,
        attack_time: 90,
        sight: 12,
        power: -400,
    },
    require: ["con_contruction_allied", "con_power_allied", "con_factory_allied", "con_tech_allied"]
}




CONSTRUCTION_TYPE.con_super_cannon = {
    name: "con_super_cannon",
    type: "contruction_denfense",
    img: {
        main_path: "IMG/Unit/Construction/cannon/",
        build: { path: "build/img", from: 1, to: 13, step: 1 / 3 },
        normal: { path: "build/ground" },
        rotate: (function () {
            var property = {
                normal: { margin: { x: 60, y: 51 } },
                direct: { margin: { x: 60, y: 53 }, length: 60 }
            };
            IMAGE_PROCESS.process_vehicle(property, "IMG/Unit/Construction/cannon/", {}, 73, 17);
            return property;
        })(),
        margin: { x: 114, y: 110 },
        impaired_fire: [],
    },
    audio: {
        __proto__: CONSTRUCTION_AUDIO
    },
    property: {
        size: { w: 2, h: 2, h_: 6 },
        shield: { _1: Infinity, _2: 40, _3: 40, _4: 40 },
        attack_dam: 25,
        attack_type: "attack_super_cannon",
        attack_height: 5,
        attack_distance: 1.8,
        range: 13,
        life: 200,
        cost: 1500,
        attack_time: 200,
        power: -600,
        sight: 13,
        rotate_v: 1,
    },
    class: class extends Rotate_Construction_unit {
        scan_enemy() {
            var range2 = Math.pow(this.property.property.range, 2),
                max = 0, count,
                enemy = null,
                listob = GAME_OBJECT.listgameunit[1 - this.team],
                team = this.team,
                length = listob.length;
            for (var i = 0 ; i < length; i++) {
                var ob = listob[i];
                if (this.filter_enemy(ob) && calcfar2(ob, this) <= range2) {
                    if ((count = GRID.get_around_tile(ob).filter(e => e.team != team).length) > max) {
                        max = count;
                        enemy = ob;
                    }
                }
            }
            return enemy;
        }
    },
    require: ["con_contruction_allied", "con_power_allied", "con_factory_allied", "con_tech_allied"]
}





// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { CONSTRUCTION_TYPE });

export { CONSTRUCTION_AUDIO, CONSTRUCTION_TYPE };
