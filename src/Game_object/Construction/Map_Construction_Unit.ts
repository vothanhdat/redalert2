// @ts-nocheck
//
// Stage 3 of the Vite/TypeScript migration: this file is renamed to .ts but not yet typed.
// It is 2015-era JavaScript whose classes assign undeclared properties in their
// constructors, which TypeScript reports as TS2339 several hundred times per file.
//
// Remove this directive one file at a time, declare the class fields, and let
// `npx tsc --noEmit` gate the result. Files already checked: src/core/*, src/lib/*,
// src/Game_Container.ts, src/UI/Playing_layout.ts, src/main.ts.
import { LATE } from "../../core/late";
import { AUDIO } from "../../Audio";
import { TEAM } from "../../Controler";
import { stage } from "../../Game_Container";
import { Construction_unit, Defender_Construction_unit } from "./Construction_Unit";
import { GRID } from "../GRID";
import { GAME_OBJECT, Game_object, calcfar2, check_available_screen, checkcircle, convert2screen } from "../Game_object";
import { Parachutist } from "../MoviableUnit/Flyable_Unit";
import { Ground_moveable_unit } from "../MoviableUnit/MoviableUnit";
import { Weapon } from "../Weapon/Weapon";
import { ATTACK_TYPE } from "../Weapon/Weapon_Type";
import { IMAGE_PROCESS } from "../../Image_process";
import { renderer } from "../../core/renderer";
import { STATE } from "../../lib/JavaScript_helper";

/// <reference path="Construction_Unit.js" />
"use strict";
PIXI.loader.add({ name: "mapcon", url: "IMG/Unit/MapConstruction/img.json" });

var MAP_CONSTRUCTION_UNIT = {
    state_image: ["active", "normal", "impaired", "active_impaired", "scrap"],
    init_plus: function (property, listresource) {
        for (var i in property.img)
            if (MAP_CONSTRUCTION_UNIT.state_image.indexOf(i) > -1)
                IMAGE_PROCESS.process_gl(property.img[i], property.img.main_path, property.img.margin, listresource, true);

        var sprite = property.img.normal.sprite[0];
        var z = new PIXI.RenderTexture(renderer, sprite.width, sprite.height);
        var zstage = new PIXI.Container();
        zstage.addChild(new PIXI.Sprite(sprite));
        z.render(zstage, null, true);

        window.setTimeout(function (z, property) {
            property.img.normal.check_interactive = new IMAGE_PROCESS.processcheckinteractive(z.getCanvas());
        }, 300, z, property);
    },
    load_texture_done: function (loader, resources) {
        var listresource = [];
        listresource[0] = resources.mapcon.textures;
        console.log(resources);
        IMAGE_PROCESS.processcolor_gl(
            resources.mapcon_image.texture,
            TEAM,
            MAP_CONSTRUCTION_UNIT.process_color_gl_done,
            listresource,
            true
        );
    },
    process_color_gl_done: function (textures, listresource) {
        var baseresource = listresource[0];
        for (var i = -1 ; i < textures.length; i++) {
            if (i == 0)
                continue;
            //console.log(i);
            var processresource = {};
            var baseTexture = textures[i].baseTexture;
            for (var j in baseresource)
                processresource[j] = new PIXI.Texture(
                    baseTexture,
                    baseresource[j].frame,
                    baseresource[j].crop,
                    baseresource[j].trim
                    );
            listresource[i] = processresource;
        }

        for (var i in MAP_CONSTRUCTION_UNIT_TYPE)
            MAP_CONSTRUCTION_UNIT.init_plus(MAP_CONSTRUCTION_UNIT_TYPE[i], listresource, true);
        //console.log(listresource);
        LATE.on_texture_load_done("mapconstruction");
        //MAP_CONSTRUCTION_UNIT = null;
    }
}

class Map_Construction_unit extends Construction_unit {
    constructor(x, y, z, team, property) {
        super(x, y, z, -1, property);

    }
    delete () {
        super.delete();
        GAME_OBJECT.add_instance(new Map_scrap(this.x, this.y, this.z, this.property));
    }
    change_team(team) {
        if (team != this.team)
            this.sprites.resume();
        super.change_team(team);
    }
    process(time) {
        if (this.team == -1)
            this.sprites.pause();
        super.process(time);
    }
}

GAME_OBJECT.add_class(Map_Construction_unit, "mapcontruction");

class Map_Building_Construction_unit extends Map_Construction_unit {

    constructor(x, y, z, team, property) {
        super(x, y, z, team, property);
        this.attackdone = property.property.attack_time;
        this.attackload = this.attackdone;
        this.height = property.property.attack_height;
        this.enemy = null;
        this.list_ob = [];
        this.damage = property.property.attack_dam;
        this.attackdam = 0;
    }

    process(time) {
        this.sprites._renderable = (this.team > -1);
        this.sprite._renderable = (this.team < 0);
        super.process(time);

        if (this.team > -1) {
            if (this.health / this.totalhealth > 0.3) {
                switch (this.state) {
                    case STATE.IDLE:
                        if (checkcircle(this.timelife, time, 20)) {
                            var enemy = this.scan_enemy();
                            if (enemy) {
                                this.changetostate(STATE.DEFENSE);
                                this.enemy = enemy;
                            }
                        }
                        break;
                    case STATE.DEFENSE:
                        this.attackload += time;
                        var range2 = Math.pow(this.property.property.range, 2);
                        if (this.enemy.state == STATE.DELETE || calcfar2(this.enemy, this) > range2) {
                            this.enemy = null;
                            this.changetostate(STATE.IDLE);
                        } else if (this.attackload >= this.attackdone && this.sprites.currentFrame == 0) {
                            this.attackdone = this.property.property.attack_time * (0.7 + 0.6 * Math.random());
                            this.attackload -= this.attackdone;
                            this.fire();
                        } else if (this.attackload >= this.attackdone && !(this.property.img.active_impaired || this.property.img.active)) {
                            this.attackdone = this.property.property.attack_time * (0.7 + 0.6 * Math.random());
                            this.attackload -= this.attackdone;
                            this.fire();
                        }
                        break;
                }
            } else {
                this.on_go_back();
            }

        }
    }

    fire() {
        this.enemy && GAME_OBJECT.add_instance(new Weapon(this, this.enemy, ATTACK_TYPE[this.property.property.attack_type]));
    }

    scan_enemy() {
        return Defender_Construction_unit.prototype.scan_enemy.call(this);
    }

    filter_enemy(ob) {
        return (ob instanceof Ground_moveable_unit || ob instanceof Construction_unit);
    }


    /**
     * @param {Game_unit} object
     * */
    on_going_to(object) {
        if (this.team == -1 && object.team > -1) {
            this.change_team(object.team);
        }
        this.list_ob.push(object);
        this.attackdam += (object.attackdam * this.damage) || 0;
        this.healthsprite.setcontain(this.list_ob.length);
        AUDIO.createsound(this.property.audio.go_into, this, 0.2);
    }

    check_can_going_to(object) {
        return (object instanceof Ground_moveable_unit || object instanceof Parachutist)
            && (this.team == -1 || object.team == this.team)
            && (this.list_ob.length < this.property.property.capacity)
            && (this.health > this.totalhealth * 0.3);
    }

    on_go_back() {
        this.change_team(-1);
        for (var e of this.list_ob) {
            console.log(e);
            e.go_back();
        }
        this.attackdam = 0;
        this.list_ob = [];
    }

    change_team(team) {
        super.change_team(team);
        this.healthsprite.setcontainstate(team > -1);
    }

    command(command) {
        switch (command.com) {
            case "change":
                this.on_go_back();

                break;
        }
    }

    /*
    get team() {
        return this._team_;
    }

    set team(value) {
        if (value === true)
            debugger;
        this._team_ = value;
    }

      */
}


class Map_scrap extends Game_object {
    constructor(x, y, z, property) {
        super(x, y, z);
        this.property = property;
        this.sprite = IMAGE_PROCESS.getsprite(property.img.scrap.sprite[0], property.img.margin);
    }
    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        this.pos = pos;
        if (check_available_screen(this.pos, this.sprite.width / 2, this.sprite.height / 2)) {
            this.sprite.renderable = true;
            this.sprite.position.set(pos.x, pos.y);
            this.sprite.z_idx = this.x + this.y;
        } else {
            this.sprite.renderable = false;
            this.sprite.z_idx = 0;
        }

    }
    init() {
        super.init();
        GRID.set_object(this);
        stage.addChild(this.sprite);
    }
    delete () {
        GRID.unset_object(this);
        super.delete();
    }
}


var MAP_CONSTRUCTION_UNIT_TYPE = {};

MAP_CONSTRUCTION_UNIT_TYPE.cuairp = {
    name: "cuairp",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/cuairp/",
        normal: { path: "img (13)" },
        active: { path: "img", from: 3, to: 12, step: 1 / 7 },
        impaired: { path: "img (1)" },
        scrap: { path: "img (2)" },
        impaired_fire: [],
        margin: { x: 87, y: 130 },
    },
    audio: {},
    property: {
        size: { w: 3, h: 3, h_: 13 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        life: 500,
        sight : 8
    },
    functional: {
        additional: ["parachutist_plane"]
    },
    class: class extends Map_Construction_unit {
        constructor(x, y, z, team, property) {
            super(x, y, z, team, property);
            this.process_funtional_progess = 1;
            this.auto_run_funtional = true;
            this.pause = false;
        }
        change_team(team) {
            super.change_team(team);
            if (team > -1) {
                this.process_funtional_progess = 1;
            }
        }
        process_functional(time) {
            if (this.pause)
                return;
            for (var i in this.process_functional_queue) {
                var e = this.process_functional_queue[i];
                if (e.length > 0) {
                    var e_0 = e[0];
                    if (e_0.progess_load > 0 && TEAM[this.team].team.check_dependence(e_0)) {
                        if (((e_0.progess_load + e_0.progess - 0.001) % e_0.progess)
                        < ((e_0.progess_load + e_0.progess - time / 60) % e_0.progess))
                            this.process_functional_done(e_0);
                        e_0.progess_load -= time / 60;
                    }
                }
            }
        }
        functional_command(command) {

        }
        process_functional_done(data) {
            TEAM[this.team].team.on_addtional_done(data)
        }
    }
}

MAP_CONSTRUCTION_UNIT_TYPE.cuoild = {
    name: "cuoild",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/cuoild/",
        normal: { path: "img (1)" },
        active: { path: "img", from: 5, to: 36, step: 1 / 5 },
        impaired: { path: "img (2)" },
        scrap: { path: "img (4)" },
        active_impaired: { path: "img", from: 37, to: 68, step: 1 / 5 },
        impaired_fire: [],
        margin: { x: 82, y: 89 },
    },
    audio: {},
    property: {
        size: { w: 2, h: 2, h_: 10 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        life: 200,
        sight: 8

    },
    class: class extends Map_Construction_unit {

    }
}

MAP_CONSTRUCTION_UNIT_TYPE.building1 = {
    name: "building1",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b1",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 183, y: 148 },

    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 3, h: 2, h_: 20 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 200,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 5,
        sight: 8
    },
    can_change: true,
    class: Map_Building_Construction_unit
}

MAP_CONSTRUCTION_UNIT_TYPE.building2 = {
    name: "building2",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b2",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 142, y: 148 },
    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 2, h: 3, h_: 20 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 200,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 5,
        sight: 8

    },
    can_change: true,
    class: Map_Building_Construction_unit
}

MAP_CONSTRUCTION_UNIT_TYPE.building3 = {
    name: "building3",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b3",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 221, y: 188 },

    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 3, h: 2, h_: 27 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 250,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 5,
        sight: 8

    },
    can_change: true,
    class: Map_Building_Construction_unit
}

MAP_CONSTRUCTION_UNIT_TYPE.building4 = {
    name: "building4",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b4",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 230, y: 199 },

    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 3, h: 2, h_: 27 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 250,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 5,
        sight: 8

    },
    can_change: true,
    class: Map_Building_Construction_unit
}

MAP_CONSTRUCTION_UNIT_TYPE.building5 = {
    name: "building5",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b5",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 230, y: 199 },

    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 3, h: 2, h_: 27 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 250,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 5,
        sight: 8

    },
    can_change: true,
    class: Map_Building_Construction_unit
}

MAP_CONSTRUCTION_UNIT_TYPE.building6 = {
    name: "building6",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b6",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 215, y: 190 },

    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 3, h: 4, h_: 23 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 400,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 10,
        sight: 10

    },
    can_change: true,
    class: Map_Building_Construction_unit
}

MAP_CONSTRUCTION_UNIT_TYPE.building7 = {
    name: "building7",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b7",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 255, y: 267 },

    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 3, h: 3, h_: 30 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 250,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 5,
        sight: 8
    },
    can_change: true,
    class: Map_Building_Construction_unit
}


MAP_CONSTRUCTION_UNIT_TYPE.building8 = {
    name: "building8",
    type: "mapcontruction",
    img: {
        main_path: "IMG/Unit/MapConstruction/building/b8",
        normal: { path: " (1)" },
        active: { path: "", from: 3, to: 3, step: 1 / 2 },
        impaired: { path: " (2)" },
        scrap: { path: " (4)" },
        impaired_fire: [],
        margin: { x: 204, y: 230 },
    },
    audio: {
        go_into: "Audio/genter1a.wav",
    },
    property: {
        size: { w: 3, h: 3, h_: 20 },
        shield: { _1: 10000000, _2: 50, _3: 50, _4: 50 },
        attack_dam: 1.5,
        attack_type: "attack_submachine",
        life: 250,
        attack_time: 15,
        range: 9,
        power: 0,
        can_go_into: true,
        capacity: 5,
        sight: 8
    },
    can_change: true,
    class: Map_Building_Construction_unit
}



// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { MAP_CONSTRUCTION_UNIT_TYPE, Map_Building_Construction_unit, Map_Construction_unit, Map_scrap });

export { MAP_CONSTRUCTION_UNIT, MAP_CONSTRUCTION_UNIT_TYPE, Map_Building_Construction_unit, Map_Construction_unit, Map_scrap };
