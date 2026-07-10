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
import { healthcontainer, stage } from "../../Game_Container";
import { GRID } from "../GRID";
import { Game_unit } from "../Game_Unit";
import { GAME_OBJECT, calcfar2, calcfar2_full, check_available_screen, checkcircle, convert2screen, convert2screenwithoutsrcpos, get_frame_idx, normal_angel } from "../Game_object";
import { IMAGE_PROCESS } from "../../Image_process";
import { renderer } from "../../core/renderer";
import { screen_x, screen_y } from "../../core/state";
import { STATE, check_point_inside, myAtan, reverseArray } from "../../lib/JavaScript_helper";
import * as PIXI from "pixi.js";
import { LOADER } from "../../core/pixi_loader";

/// <reference path="../Game_Unit.js" />
"use strict";
LOADER.add({ name: "con", url: "IMG/Unit/Construction/construction.json" });

var CONSTRUCTION_UNIT = {
    state_image: ["build", "run", "active", "normal", "impaired", "active_impaired", "run_impaired"],
    init_plus: function (property, listresource) {
        for (var i in property.img) {
            if (CONSTRUCTION_UNIT.state_image.indexOf(i) > -1) {
                IMAGE_PROCESS.process_gl(property.img[i], property.img.main_path, property.img.margin, listresource);
            }
        };
        var sprite = property.img.normal.sprite[0];
        var z = PIXI.RenderTexture.create({ width: sprite.width, height: sprite.height });
        var zstage = new PIXI.Container();
        zstage.addChild(new PIXI.Sprite(sprite));
        renderer.render(zstage, { renderTexture: z, clear: true });

        window.setTimeout(function (z, property) {
            property.img.normal.check_interactive = new IMAGE_PROCESS.processcheckinteractive(z.getCanvas());
        }, 300, z, property);
    },
    load_texture_done: function (loader, resources) {
        var listresource = [];
        listresource[0] = resources.con.textures;
        console.log(resources);

        IMAGE_PROCESS.processcolor_gl(
            resources.con_image.texture,
            TEAM,
            CONSTRUCTION_UNIT.process_color_gl_done,
            listresource
        );
    },
    process_color_gl_done: function (textures, listresource) {
        var baseresource = listresource[0];
        for (var i = 1 ; i < textures.length; i++) {
            var processresource = {};
            var baseTexture = textures[i].baseTexture;
            for (var j in baseresource) {
                processresource[j] = new PIXI.Texture(baseTexture, baseresource[j].frame, baseresource[j].crop, baseresource[j].trim);
            }
            listresource[i] = processresource;
        }

        for (var i in LATE.CONSTRUCTION_TYPE)
            CONSTRUCTION_UNIT.init_plus(LATE.CONSTRUCTION_TYPE[i], listresource);
        console.log(listresource);
        LATE.on_texture_load_done("construction");
        CONSTRUCTION_UNIT = null;
    }
}



class Construction_unit extends Game_unit {

    /**
      Constructor for a new Construction_unit
      @class Construction_unit
      @param {Number} x Position x
      @param {Number} y Position y
      @param {Number} z Position z
      @param {Number} team - Team
      @param {Construction_Property} property - Options to initialize the component with
    */
    constructor(x, y, z, team, property) {

        super(x, y, z, team, property);
        this.size = property.property.size;
        if (this.size.w && this.size.w % 2 == 0)
            this.x = 0.5 + Math.round(this.x - 0.499);
        if (this.size.h && this.size.h % 2 == 0)
            this.y = 0.5 + Math.round(this.y - 0.499);

        this.sprite = IMAGE_PROCESS.getsprite(property.img.normal.sprite[team], property.img.margin);

        this.sprites = IMAGE_PROCESS.getmovieclip(
            (property.img.build || property.img.active).sprites[team],
            (property.img.build || property.img.active).step,
            property.img.margin
        );


        if (property.img.run)
            this.sprites_run = IMAGE_PROCESS.getmovieclip(property.img.run.sprites[team], property.img.run.step, property.img.margin);

        this.healthsprite = IMAGE_PROCESS.gethealthsprite(this);
        this.point_choose = [];
        this.isdamage = false;
        this.isrepair = false;
        this.isrepair_pause = false;
        this.list_impaire_fire = [];

    }

    init() {
        super.init();

        stage.addChild(this.sprite);
        this.sprites && stage.addChild(this.sprites);
        this.sprites_run && this.sprite.addChild(this.sprites_run);

        this.changetostate(this.property.img.build ? STATE.BUILDING : STATE.IDLE);
        /*
        if (this.property.img.build)
            this.changetostate(STATE.BUILDING);
        else
            this.changetostate(STATE.IDLE);
        */
        this.set_point_choose();
        for(var impaire_fire of this.property.img.impaired_fire) {
            let fire = new LATE.FireEffect(this, impaire_fire[0], impaire_fire[1], impaire_fire[2], LATE.EFFECT_FIRE_TYPE[impaire_fire[3]]);
            GAME_OBJECT.add_instance(fire);
            this.list_impaire_fire.push(fire);
        }

        TEAM[this.team].team && TEAM[this.team].team.register(this);



        this.healthsprite.sethealth(this.health / this.totalhealth);
    }

    process(time) {
        super.process(time);
        var isdamage = (this.health / this.totalhealth < 0.3);
        if (this.isdamage != isdamage) {
            this.isdamage = isdamage;
            this.update_sprite();
        }
        if (this.isrepair) {
            if (this.health == this.totalhealth) {
                this.isrepair = false;
            } else if (TEAM[this.team].team.money < time) {
                this.isrepair_pause = true;
            } else {
                this.isrepair_pause = false;
                TEAM[this.team].team.money -= time;
                this.health = Math.min(this.totalhealth, this.health + time * 0.2);
                this.healthsprite.sethealth(this.health / this.totalhealth);
            }
        }
        switch (this.state) {
            case STATE.IDLE:
            case STATE.RUN:
                this.process_functional(time);
                break;
        }
    }

    update_sprite() {
        if (this.isdamage) {
            this.property.img.impaired
                && this.sprite.changesprite(this.property.img.impaired.sprite[this.team]);
            this.property.img.active_impaired
                && this.sprites.changemovieclip(this.property.img.active_impaired.sprites[this.team], this.property.img.active_impaired.step);
            this.property.img.run_impaired
                && this.sprites_run.changemovieclip(this.property.img.run_impaired.sprites[this.team], this.property.img.run_impaired.step);
        } else {
            if (this.property.img.normal)
                this.sprite.changesprite(this.property.img.normal.sprite[this.team]);
            if (this.property.img.active)
                this.sprites.changemovieclip(this.property.img.active.sprites[this.team], this.property.img.active.step);
            if (this.property.img.run)
                this.sprites_run.changemovieclip(this.property.img.run.sprites[this.team], this.property.img.run.step);
        }
    }

    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        this.pos = pos;
        if (check_available_screen(this.pos, this.sprite.width / 2, this.sprite.height / 2)
            && (this.team == -2 || GRID.check_availble_user_fogmap(this))) {
            this.sprite.position.set(pos.x, pos.y);
            this.sprites.position.set(pos.x, pos.y);
            var pos_2 = convert2screen(this.x - this.size.w / 2, this.y + this.size.h / 2, this.z + this.size.h_);
            this.healthsprite.position.set(pos_2.x, pos_2.y);
            this.sprite.z_idx = this.x + this.y;
            this.sprites.z_idx = this.x + this.y + 0.0001;
            this.sprite.renderable = this.sprite._renderable;
            this.sprites.renderable = this.sprites._renderable;
            this.healthsprite.renderable = true;
        } else {
            this.sprite.renderable = false;
            this.sprites.renderable = false;
            this.healthsprite.renderable = false;
            this.sprite.z_idx = 0;
            this.sprites.z_idx = 0;
        }
    }

    changetostate(state) {
        var This = this;
        super.changetostate(state);
        switch (state) {
            case STATE.BUILDING:
                this.sprite._renderable = false;
                this.sprites_run && (this.sprites_run.renderable = false);
                this.sprites._renderable = true;
                this.sprites.loop = false;
                this.sprites.play();
                this.sprites.onComplete = function () { This.changetostate(STATE.IDLE); };
                AUDIO.createsound(this.property.audio.build, this);
                break;
            case STATE.IDLE:
                if (this.isdamage && this.property.img.active_impaired)
                    this.sprites.changemovieclip(this.property.img.active_impaired.sprites[this.team], this.property.img.active_impaired.step);
                else if (this.property.img.active)
                    this.sprites.changemovieclip(this.property.img.active.sprites[this.team], this.property.img.active.step);
                if (this.property.img.active_impaired || this.property.img.active) {
                    this.sprites.gotoAndPlay(0);
                    this.sprites.loop = true;
                    this.sprite._renderable = true;
                    this.sprites._renderable = true;
                    this.sprites.onComplete = null;
                    this.sprites_run && (this.sprites_run.renderable = false);
                } else {
                    this.sprites._renderable = false;
                    this.sprite._renderable = true;
                }

                break;
            case STATE.RUN:
                if (this.sprites_run) {
                    this.sprites_run.renderable = true;
                    this.sprites_run.loop = false;
                    this.sprites_run.gotoAndPlay(0);
                    this.sprites_run.onComplete = function () { This.changetostate(STATE.IDLE); };
                } else {
                    this.changetostate(STATE.IDLE);
                }
                break;
            case STATE.SELLING:
                this.sprite._renderable = false;
                this.sprites_run && (this.sprites_run.renderable = false);
                this.changetostate = function () { };
                AUDIO.createsound(this.property.audio.unbuild, this);

                //unbuild
                if (this.property.img.build) {
                    this.sprites.changemovieclip(reverseArray(this.property.img.build.sprites[this.team]), this.property.img.build.step);
                    this.sprites._renderable = true;
                    this.sprites.loop = false;
                    this.sprites.gotoAndPlay(0);
                    this.sprites.onComplete = function () { This.delete() };
                } else {
                    this.delete();
                }
                break;
        }
    }

    on_destroy(attackobject) {
        super.on_destroy(attackobject);
        var size = this.property.property.size;
        if (size && size.w * size.h > 1) {
            for(var ob of this.get_element_ceil()) {
                (Math.random() > 0.4) && GAME_OBJECT.add_effect(ob.x, ob.y, this.z, LATE.EFFECT_TYPE.exploit2, false, true);
            }
        } else {
            GAME_OBJECT.add_effect(this.x, this.y, this.z, LATE.EFFECT_TYPE.exploit2, false, true);
        }
        this.property.audio.destroy && AUDIO.createsound(this.property.audio.destroy, { x: this.x, y: this.y, z: this.z }, 0.4);
    }

    check_choose(x, y) {
        var X = x + screen_x * 60;
        var Y = y + screen_y * 30;
        //return check_point_inside([X, Y], this.point_choose);

        if (check_point_inside([X, Y], this.point_choose) && this.property.img.normal.check_interactive && this.pos) {
            var margin = this.property.img.margin;
            return this.property.img.normal.check_interactive.check(x - this.pos.x + margin.x, y - this.pos.y + margin.y);
        }

        return false;
    }

    on_attacked(attackobject) {
        super.on_attacked(attackobject);
        this.healthsprite.sethealth(this.health / this.totalhealth);
    }

    set_point_choose() {
        var toarray = function (ob) {
            return [ob.x, ob.y];
        }
        var dx = this.size.w / 2;
        var dy = this.size.h / 2;
        var dz = this.size.h_;
        this.point_choose[0] = toarray(convert2screenwithoutsrcpos(this.x + dx, this.y + dy, this.z));
        this.point_choose[1] = toarray(convert2screenwithoutsrcpos(this.x - dx, this.y + dy, this.z));
        this.point_choose[2] = toarray(convert2screenwithoutsrcpos(this.x - dx, this.y + dy, this.z + dz));
        this.point_choose[3] = toarray(convert2screenwithoutsrcpos(this.x - dx, this.y - dy, this.z + dz));
        this.point_choose[4] = toarray(convert2screenwithoutsrcpos(this.x + dx, this.y - dy, this.z + dz));
        this.point_choose[5] = toarray(convert2screenwithoutsrcpos(this.x + dx, this.y - dy, this.z));
    }

    command(command) {
        switch (command.com) {
            case "sell":
                this.changetostate(STATE.SELLING);
                break;
            case "repaircon":
                this.isrepair = true;
                break;
            default:
                super.command(command);
                break;
        }
    }

    process_functional(time) {
        for (var i in this.process_functional_queue) {
            var e = this.process_functional_queue[i];
            if (e.length > 0) {
                var e_0 = e[0];
                if (e_0.progess_load > 0 && TEAM[this.team].team.check_dependence(e_0)) {
                    var money = Math.min(TEAM[this.team].team.money, time * 5);

                    if (TEAM[this.team].team.money  > money) {
                        if (((e_0.progess_load + e_0.progess - 0.001) % e_0.progess)
                        < ((e_0.progess_load + e_0.progess - money) % e_0.progess))
                            this.process_functional_done(e_0);
                        e_0.progess_load -= money;
                        TEAM[this.team].team.money -= money;
                        continue;
                    }
                } else {
                    e.splice(0, 1);
                    e_0.progess_load = 0;
                }
            } else {
                var share_function = TEAM[this.team].team.list_construction_functional[this.property.name]
                    .find(e => e.process_functional_queue[i].length > 0);
                if (share_function) {
                    this.process_functional_queue[i].push(share_function.process_functional_queue[i][0]);
                }
            }
        }
    }

    process_functional_done(data) {
        
    }

    functional_command(command) {
        switch (command.com) {
            case "buy":
                if (this.process_functional_queue[command.type]) {
                    var tmp = this.process_functional_queue[command.type].indexOf(command.data);
                    if (tmp > -1) {
                        this.process_functional_queue[command.type][tmp].progess_load += command.data.progess;
                    } else {
                        if (command.data.progess_load)
                            command.data.progess_load += command.data.progess;
                        else
                            command.data.progess_load = command.data.progess;
                        this.process_functional_queue[command.type].push(command.data);
                    }
                }
                break;
            case "cancel":
                if (this.process_functional_queue[command.type]) {
                    var tmp = this.process_functional_queue[command.type].indexOf(command.data);
                    if (tmp > -1) {
                        var e = this.process_functional_queue[command.type][tmp];
                        var back_progess_load = e.progess_load;
                        e.progess_load = Math.max(e.progess_load - command.data.progess, 0);
                        if (e.progess_load == 0)
                            TEAM[this.team].team.money += (e.progess - back_progess_load) * 0.7;
                    }
                }
                break;
                break;
        }
    }

    get_progess_progess_remaind(type) {
        return this.process_functional_queue && this.process_functional_queue[type] && this.process_functional_queue[type]
            .reduce((a, b) => a + (b.progess_load || 0), 0);
    }

    change_team(team) {
        if (team == this.team)
            return;
        TEAM[this.team].team && TEAM[this.team].team.unregister(this);
        super.change_team(team);
        TEAM[this.team].team && TEAM[this.team].team.register(this);
        this.update_sprite();
    }

    delete () {
        stage.removeChild(this.sprite);
        stage.removeChild(this.sprites);
        healthcontainer.removeChild(this.healthsprite);
        TEAM[this.team].team && TEAM[this.team].team.unregister(this);
        this.list_impaire_fire.forEach(e => e.delete());
        super.delete();
    }

}


class Defender_Construction_unit extends Construction_unit {
    constructor(x, y, z, team, property) {
        super(x, y, z, team, property);
        this.attackdone = property.property.attack_time;
        this.attackload = this.attackdone;
        this.height = property.property.attack_height;
        this.attackdam = property.property.attack_dam;
        this.enemy = null;
    }

    scan_enemy() {
        var range2 = Math.pow(this.property.property.range, 2),
            max = 1000000, far,
            enemy = null,
            listob = GAME_OBJECT.listgameunit[1 - this.team].filter(this.filter_enemy),
            length = listob.length;


        for (var i = 0 ; i < length; i++) {
            var ob = listob[i];
            if ((far = calcfar2_full(ob, this)) <= range2
                && far < max) {
                max = far;
                enemy = ob;
            }
        }
        return enemy;
    }

    filter_enemy(ob) {
        return (ob instanceof LATE.Ground_moveable_unit || ob instanceof Construction_unit);
    }

    process(time) {
        super.process(time);

        switch (this.state) {
            case STATE.IDLE:
                if (checkcircle(this.timelife, time, 20)) {
                    var enemy = this.scan_enemy();
                    if (enemy) {
                        this.changetostate(STATE.DEFENSE);
                        this.attack(enemy);
                    }
                }
                break;
            case STATE.DEFENSE:
                this.attackload += time;
                var range2 = Math.pow(this.property.property.range, 2);
                if (this.enemy.state == STATE.DELETE ||  calcfar2(this.enemy, this) > range2) {
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

    }

    attack(enemy) {
        this.enemy = enemy;
    }

    fire() {
        console.log("fire");

        if (this.sprites_run) {
            var This = this;
            this.sprites.pause();
            this.sprites_run.renderable = true;
            this.sprites_run.loop = false;
            this.sprites_run.gotoAndPlay(0);
            this.sprites_run.onComplete = function () {
                This.sprites_run.renderable = false;
                This.sprites.resume();
                This.enemy && GAME_OBJECT.add_instance(new LATE.Weapon(This, This.enemy, LATE.ATTACK_TYPE[This.property.property.attack_type]));
            };

            if (this.property.audio.prepair_attack)
                AUDIO.createsound(this.property.audio.prepair_attack, this, 0.1);

        } else {
            this.enemy && GAME_OBJECT.add_instance(new LATE.Weapon(this, this.enemy, LATE.ATTACK_TYPE[this.property.property.attack_type]));
        }

    }


}


class Buy_Construction_unit extends Construction_unit {

    constructor(x, y, z, team, property) {
        super(x, y, z, team, property);
        this.work_point_sprite = IMAGE_PROCESS.getdashsprite();
        this.workpoint = {
            x: Math.round(property.workpoint.x + this.x),
            y: Math.round(property.workpoint.y + this.y)
        };
        this.gopoint = {
            x: Math.round(property.gopoint.x + this.x),
            y: Math.round(property.gopoint.y + this.y)
        };
        this._grouph_ = {
            list: [],
            goal: this.workpoint
        };
    }

    draw() {
        super.draw();
        var x = this.workpoint.x,
            y = this.workpoint.y,
            z = GRID.heightmap[GRID.dim * x + y];
        this.work_point_sprite.setpossition(this.pos, convert2screen(x, y, z));
    }
    command(command) {
        switch (command.com) {
            case "setworkpoint":
                if (command.workpoint && command.group_move) {
                    this.workpoint = {
                        x: Math.round(command.workpoint.x),
                        y: Math.round(command.workpoint.y)
                    };
                    this._grouph_ = command.group_move;
                }
                break;
            default:
                super.command(command);
                break;
        }
    }
    /** @description Call when buy item complete
    * @param {BuyData} data 
    * @todo create solider unit when buy item complete
    */
    process_functional_done(data) {
        super.process_functional_done(data);
        var unit = GAME_OBJECT.add_unit(this.gopoint.x, this.gopoint.y, 0, this.team, this.property.functional_type[data.name]);
        unit.command({ com: "move", group: this._grouph_, goal: { x: this.workpoint.x, y: this.workpoint.y } });
        return unit;
    }
    display_health_point(onoff) {
        super.display_health_point(onoff);
        if (this.state == STATE.DELETE)
            return;
        if (onoff)
            healthcontainer.addChild(this.work_point_sprite);
        else
            healthcontainer.removeChild(this.work_point_sprite);
    }
    delete () {
        super.delete();
        healthcontainer.removeChild(this.work_point_sprite);
    }


    set_data(array, idx, team) {
        var add = (team == this.team);
        super.set_data(array, idx, team);
        array[idx + 15] = add && this.workpoint && this.workpoint.x;
        array[idx + 16] = add && this.workpoint && this.workpoint.y;
    }
    get_data(team) {
        super.get_data(team);
        if (this.team == team) {
            this._data_.workpoint = {
                x: this.workpoint.x,
                y: this.workpoint.y
            };
        }
        return this._data_;
    }
}


class Rotate_Construction_unit extends Defender_Construction_unit {

    constructor(x, y, z, team, property) {
        super(x, y, z, team, property);
        this.angel_tur = -Math.PI / 2;
        this.rotate_v = property.property.rotate_v;
        this.turbase_sprite = IMAGE_PROCESS.getsprite_rotate(this.property.img.rotate.normal.sprites[this.team], this.property.img.rotate.normal.margin);
        this.turbase_sprite.change_rotation(this.angel_tur);
        this.minimun_angel = property.property.minimun_angel || 0.05;
        stage.addChild(this.turbase_sprite);
        if (this.property.img.rotate.direct) {
            this.barrel_length_original = this.property.img.rotate.direct.length;
            this.barrel_length = this.barrel_length_original;
            this.barrel_sprite = IMAGE_PROCESS.getsprite_rotate(this.property.img.rotate.direct.sprites[this.team], this.property.img.rotate.direct.margin);
            this.barrel_sprite.change_rotation(this.angel_tur);
            stage.addChild(this.barrel_sprite);
        }
    }


    process(time) {
        let max_amplitude = time * this.rotate_v * 0.01667;

        switch (this.state) {
            case "WAITFORSELL":
                var delta = normal_angel(-Math.PI / 2 - this.angel_tur);
                this.angel_tur += Math.max(-max_amplitude, Math.min(max_amplitude, delta));
                this.angel_tur = normal_angel(this.angel_tur);
                if (Math.abs(delta) < 0.05)
                    this.changetostate("SELL");
                break;
            case STATE.DEFENSE:
            case STATE.ATTACK:
                this.attackload += time;
                var angle = myAtan(this.enemy.y - this.y, this.enemy.x - this.x);
                var delta = normal_angel(angle - this.angel_tur);
                this.angel_tur = normal_angel(this.angel_tur + Math.max(-max_amplitude, Math.min(max_amplitude, delta)));

                var range2 = Math.pow(this.property.property.range, 2);

                if (this.enemy.state == STATE.DELETE || calcfar2(this.enemy, this) > range2) {
                    this.enemy = null;
                    this.changetostate(STATE.IDLE);
                } else if (this.attackload >= this.attackdone && Math.abs(delta) < this.minimun_angel) {
                    this.attackdone = this.property.property.attack_time * (0.8 + 0.4 * Math.random());
                    this.attackload -= this.attackdone;
                    this.fire();
                }
                break;
            default:
                super.process(time);
        }
        if (this.barrel_length_original)
            this.barrel_length += (this.barrel_length_original - this.barrel_length) * (1 - Math.pow(0.9, time));
    }

    draw() {
        super.draw();
        if (check_available_screen(this.pos, this.sprite.width / 2, this.sprite.height / 2) && GRID.check_availble_user_fogmap(this)) {
            this.angel_tur_idx = get_frame_idx(this.angel_tur, this.turbase_sprite.sprites.length - 1);
            this.sprite.z_idx = 0;

            this.turbase_sprite.change_rotation(this.angel_tur);
            this.turbase_sprite.position.set(this.pos.x - this.angel_tur_idx / 45 + 1, this.pos.y - 5);
            this.turbase_sprite.z_idx = this.x + this.y;
            this.turbase_sprite.renderable = this.turbase_sprite._renderable;

            if (this.barrel_sprite) {
                var tmp = this.angel_tur + Math.PI / 4;
                this.barrel_sprite.change_rotation(this.angel_tur);
                this.barrel_sprite.position.x = this.turbase_sprite.position.x + this.barrel_length * Math.cos(tmp);
                this.barrel_sprite.position.y = this.turbase_sprite.position.y + this.barrel_length * 0.5 * Math.sin(tmp);
                this.barrel_sprite.z_idx = this.turbase_sprite.z_idx + (Math.abs(this.angel_tur_idx) <= 36 ? 0.2 : -0.2);
                this.barrel_sprite.renderable = this.barrel_sprite._renderable;
            }
        } else {
            this.turbase_sprite.renderable = false;
            this.barrel_sprite && (this.barrel_sprite.renderable = false);
        }
    }

    fire() {
        if (this.enemy) {
            var distance = this.property.property.attack_distance || 0;
            var This = { __proto__: this };
            This.x += distance * Math.cos(this.angel_tur);
            This.y += distance * Math.sin(this.angel_tur);
            GAME_OBJECT.add_instance(new LATE.Weapon(This, this.enemy, LATE.ATTACK_TYPE[this.property.property.attack_type]));
            this.barrel_length = this.barrel_length_original * 0.9;
        }

    }

    changetostate(state) {
        switch (state) {
            case STATE.BUILDING:
                super.changetostate(state);
                this.turbase_sprite._renderable = false;
                this.barrel_sprite && (this.barrel_sprite._renderable = false);
                break;
            case STATE.IDLE:
                super.changetostate(state);
                this.turbase_sprite._renderable = true;
                this.barrel_sprite && (this.barrel_sprite._renderable = true);
                break;
            case "SELL":
                super.changetostate(STATE.SELLING);
                this.turbase_sprite._renderable = false;
                this.barrel_sprite && (this.barrel_sprite._renderable = false);
                break;
            case STATE.SELLING:
                this.state = "WAITFORSELL";
                break;
            default:
                super.changetostate(state);
                break;
        }
    }

    delete () {
        stage.removeChild(this.turbase_sprite);
        this.barrel_sprite && stage.removeChild(this.barrel_sprite);
        super.delete();
    }

}



GAME_OBJECT.add_class(Construction_unit, "contruction");


GAME_OBJECT.add_class(Defender_Construction_unit, "contruction_denfense");




/**/

// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { Construction_unit, Defender_Construction_unit });

export { Buy_Construction_unit, CONSTRUCTION_UNIT, Construction_unit, Defender_Construction_unit, Rotate_Construction_unit };
