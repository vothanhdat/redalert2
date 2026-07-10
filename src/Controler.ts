// @ts-nocheck
//
// Stage 3 of the Vite/TypeScript migration: this file is renamed to .ts but not yet typed.
// It is 2015-era JavaScript whose classes assign undeclared properties in their
// constructors, which TypeScript reports as TS2339 several hundred times per file.
//
// Remove this directive one file at a time, declare the class fields, and let
// `npx tsc --noEmit` gate the result. Files already checked: src/core/*, src/lib/*,
// src/Game_Container.ts, src/UI/Playing_layout.ts, src/main.ts.
import { LATE } from "./core/late";
import { AUDIO } from "./Audio";
import { graphics, mouse_stage } from "./Game_Container";
import { mouserenderer } from "./core/renderer";
import { display_height, display_width, max_x, max_y, screen_h, screen_height, screen_w, screen_width, screen_x, screen_y, set_screen_x, set_screen_y } from "./core/state";
import { KEYBOARD, STATE } from "./lib/JavaScript_helper";
import * as PIXI from "pixi.js";

/// <reference path="Audio.js" />
//User constroler
"use strict";

var CONTROLER = new (function () {
    this.list_control = [];
    this.update = function (time) {
        this.list_control.forEach(e => e.update(time));
    }
    this.add = function (ob) {
        this.list_control.push(ob);
    }
})();


/**
 * 
 * @param {Number} team
 * @returns {type} 
 */

function Team_Controler(team) {
    this.team = team;
    this.construction_type = [];

    this.controler_inferface = null;

    this.list_construction_functional = {};



    this.money = 1000000;
    this.money_delay = 0;
    this.total_power = 0;
    this.power_usage = 0;
    this.rada_state = false;

    this.unit_type_can_buy = {
        construction: [],
        contruction_denfense: [],
        solider: [],
        vehicle: [],
        plane: [],
        ship: [],
        technology: [],
        additional: [],
    };

    this.unit_type_data = {
        construction: [],
        contruction_denfense: [],
        solider: [],
        vehicle: [],
        plane: [],
        ship: [],
        technology: [],
        additional: [],
    };

    this.stack_command = [];

    this.list_refinery = [];



    /** @description Apply command for list game unit.
     * @param {Array.<Game_unit>} list The list of game unit.
     * @param {Object} command The list of game unit.
     */

    this.send_command = function (list, command) {
        //console.log(command);
        var team = this.team;

        list = list.filter(e => (e && e instanceof LATE.Game_unit && e.team == team));
        //list = list.filter(e => (e && e instanceof Game_unit));

        switch (command.com) {
            case "gointo":

                command.goal = { x: Math.round(command.ob.x), y: Math.round(command.ob.y) };

            case "attack":
            case "repair":
            case "move":

                if (command.goal) {
                    command.goal.x = Math.round(command.goal.x);
                    command.goal.y = Math.round(command.goal.y);
                }

                if (!command.goal && !command.enemy)
                    debugger;


                var groupunit = {
                    goal: command.goal || { x: command.enemy.x, y: command.enemy.y },
                    list: list
                };

                var far2 = Math.max.apply(Math, list.map(e => LATE.calcfar2(e, groupunit.goal)));
                groupunit.farest = Math.sqrt(far2) + 3;

                command.group = groupunit;

                break;
            case "setworkpoint":
                var x = Math.round(command.workpoint.x);
                var y = Math.round(command.workpoint.y);
                var tmp = LATE.GAME_OBJECT.listgameunit[this.team]
                    .find(e => e.workpoint && (e.workpoint.x == x && e.workpoint.y == y) && e._grouph_);
                if (tmp) {
                    //console.log("PERFECT ::::::::::::::::::::::");
                    command.group_move = tmp._grouph_;
                } else
                    command.group_move = { list: [], goal: command.workpoint };
                break;
            case "protect_area":
                var pos = command.pos;
                var radius = command.radius;
                var list_tmp = LATE.sort_unique(
                        LATE.GAME_OBJECT.listobject.filter(e => e instanceof LATE.Movealbe_unit && e.team == this.team)
                        .map(e => e.group)).filter(e => e && e.pos);
                var find = list_tmp.find(e => e.pos.x == pos.x && e.pos.y == pos.y && e.radius == radius);
                var groupunit;
                if (find) {
                    groupunit = find;
                    Array.prototype.push.apply(groupunit.list, list);
                    groupunit.list = LATE.sort_unique(groupunit.list);
                } else {
                    groupunit = {
                        pos: command.pos,
                        goal: command.pos,
                        radius: command.radius,
                        list: list
                    };
                }
                command.group = groupunit;
                break;
        }

        for(var e of list)
            e.command(command);
    }



    /** @description Get all list Unit of this team.
     * @returns {Array.<Game_unit>} list The list of game unit.
     */
    this.get_listobject = function () {
        return LATE.GAME_OBJECT.listgameunit[this.team];
    }



    /** @description Register Construction Unit
     * @param {Construction_unit} ob The Construction Unit.
     */
    this.register = function (ob) {
        if (ob instanceof LATE.Construction_unit) {
            this.construction_type[ob.property.name] = 1 + (this.construction_type[ob.property.name] || 0);

            if (ob.property.functional) {
                ob.process_functional_queue = [];
                for (var i in ob.property.functional) {
                    ob.process_functional_queue[i] = [];
                    for(var e of ob.property.functional[i]) {
                        if (!this.unit_type_can_buy[i][e])
                            this.unit_type_can_buy[i][e] = [];
                        this.unit_type_can_buy[i][e].push(ob);
                        if (!this.unit_type_data[i][e])
                            this.unit_type_data[i][e] = {
                                type: i,
                                name: e,
                                progess: map_type[i][e].property.cost
                                    || map_type[i][e].property.time,
                                remain: 0,
                            };
                        if (ob.auto_run_funtional) {
                            ob.process_functional_queue[i].push(this.unit_type_data[i][e]);
                            this.unit_type_data[i][e].progess_load = (this.unit_type_data[i][e].progess_load || 0) + this.unit_type_data[i][e].progess;
                        }
                    }
                }
                if (!this.list_construction_functional[ob.property.name])
                    this.list_construction_functional[ob.property.name] = [];
                this.list_construction_functional[ob.property.name].push(ob);
                
            }

            if (ob instanceof LATE.CONSTRUCTION_TYPE.con_refinery_allied.class) {
                this.list_refinery.push(ob);
            }
            this.update_unit_can_buy();
            if (ob.property.property.power > 0)
                this.total_power += ob.property.property.power;
            else
                this.power_usage += Math.abs(ob.property.property.power) || 0;
        }
    }



    /** @description Unregister Construction Unit
     * @param {Construction_unit} ob The Construction Unit.
     */
    this.unregister = function (ob) {
        if (ob instanceof LATE.Construction_unit) {
            if (this.construction_type[ob.property.name] > 0)
                this.construction_type[ob.property.name]--;
            if (ob.property.functional) {
                for (var i in ob.property.functional) {
                    for(var e of ob.property.functional[i]) {
                        var idx = this.unit_type_can_buy[i][e].indexOf(ob);
                        (idx > -1) && this.unit_type_can_buy[i][e].splice(idx, 1);
                        (this.unit_type_can_buy[i][e].length == 0) && (delete this.unit_type_data[i][e]);
                    }
                }

                var idx = this.list_construction_functional[ob.property.name].indexOf(ob);
                (idx > -1) && this.list_construction_functional[ob.property.name].splice(idx, 1);
                                        
            }

            if (ob instanceof LATE.CONSTRUCTION_TYPE.con_refinery_allied.class) {
                var idx = this.list_refinery.indexOf(ob);
                (idx > -1) && this.list_refinery.splice(idx, 1);
            }
            this.update_unit_can_buy();
            if (ob.property.property.power > 0)
                this.total_power -= ob.property.property.power;
            else
                this.power_usage -= Math.abs(ob.property.property.power) || 0;
        }
    }


    this.on_addtional_done = function (data) {
        this.controler_inferface && this.controler_inferface.on_addtional_done(data);
        this.stack_command.push(data);
    }

    this.set_addtional_pos = function (data, position) {
        var tmp = this.stack_command.indexOf(data);
        //TODO check conditional  here
        if (tmp > -1) {
            LATE.ADDITIONAL_TYPE[data.name].run(this.team, position);
            data.progess_load += data.progess;
            this.stack_command.splice(tmp, 1);
            return true;
        }
        return false;
    }


    this.on_buy_construction_done = function (data) {
        this.controler_inferface && this.controler_inferface.on_buy_construction_done(data);
        this.stack_command.push(data);
    }

    /** @description Set position for building construction
     * @param {Point} postition The postion .
     * @return {Boolean} 
     */

    this.set_position_construction = function (data, postition) {
        //console.log(arguments);
        if (!data)
            throw new Error("ERRPdddddddddddddd");
        var tmp = this.stack_command.indexOf(data);
        var type = LATE.CONSTRUCTION_TYPE[data.name];
        if (tmp > -1 && type) {
            var size = type.property.size;
            var check = LATE.GRID.check_area_for_construct(postition.x, postition.y, size.w, size.h);
            //console.log("GRID.check_area_for_construct", check);
            if (check) {
                LATE.GAME_OBJECT.add_unit(postition.x, postition.y, 0, this.team, type);
                this.stack_command.splice(tmp, 1);
                return true;
            }
        }
        return false;
    }


    this.on_buy = function (data) {
        var arr = this.unit_type_can_buy[data.type][data.name];
        if (arr.length > 0) {
            var min_remain = arr[0].get_progess_progess_remaind(data.type), tmp;
            var min_ob = arr[0];
            for (var i = 1; i < arr.length; i++) {
                tmp = arr[i].get_progess_progess_remaind(data.type);
                if (tmp < min_remain) {
                    min_remain = tmp;
                    min_ob = arr[i];
                }
            }
            min_ob.functional_command({ com: "buy", type: data.type, data });
        }

    }


    this.on_cancel_buy = function (data) {
        var arr = this.unit_type_can_buy[data.type][data.name];
        if (arr.length > 0)
            arr[0].functional_command({ com: "cancel", type: data.type, data })
    }


    this.update_unit_can_buy = function () {
        var data = [];
        for (var i in this.unit_type_data) {
            for (var j in this.unit_type_data[i]) {
                this.check_dependence(this.unit_type_data[i][j]) && data.push(this.unit_type_data[i][j]);
            }
        }
        this.controler_inferface.update_unit_can_buy(data);
    }


    var map_type = {
        get construction() { return LATE.CONSTRUCTION_TYPE },
        get contruction_denfense() { return LATE.CONSTRUCTION_TYPE },
        get solider() { return LATE.SOLIDER_TYPE },
        get vehicle() { return LATE.VEHICLE_TYPE },
        get plane() { return LATE.PLANE_UNIT_TYPE },
        get ship() { return SHIP_TYPE },
        get additional() { return LATE.ADDITIONAL_TYPE }
    }


    this.check_dependence = function (data) {
        try {
            var type = map_type[data.type][data.name];
            var listconstruct = this.construction_type;
            if (type && type.require)
                return type.require.every(e=>listconstruct[e]);
        } catch (e) {
            return false;
        }
        return true;
    }




    var time_check = performance.now();
    var count_check = 0;
    //Max size : 3
    this.list_attaked_point = [];
    this.list_detect_point = [];


    this.update = function (time) {
        var m = (1 - Math.pow(0.95, 1)) * this.money_delay;
        this.money_delay -= m || 0;
        this.money += m || 0;
        this.money = Math.max(0, this.money);

        if (this.construction_type["con_airplan_allied"] && this.power_usage < this.total_power) {
            if (!this.rada_state) {
                this.controler_inferface.minimap_on();
                this.rada_state = true;
            }
        } else if (this.rada_state) {
            this.controler_inferface.minimap_off();
            this.rada_state = false;
        }


        if (performance.now() - time_check > 250) {

            time_check = performance.now();

            switch (count_check++ % 2) {
                case 0:
                    {
                        var list_attaked_point = this.list_attaked_point;
                        var team_controler = this;

                        LATE.GAME_OBJECT.listgameunit[this.team].filter(function (e) {
                            var r = e.back_health && e.back_health > e.health;
                            e.back_health = e.health;
                            return r;
                        }).forEach(function (e) {
                            var find_near = list_attaked_point.find(f=> LATE.calcfar(e, f) * 5 < LATE.GRID.dim);
                            if (find_near)
                                find_near.time = performance.now();
                            else if (list_attaked_point.length < 3) {
                                list_attaked_point.push({ x: e.x, y: e.y, time: performance.now() });
                                team_controler.controler_inferface.on_attacked(e);
                            }
                        });

                        for (var i = 0; i < list_attaked_point.length; i++) {
                            if (performance.now() - list_attaked_point[i].time > 20000) {
                                list_attaked_point.splice(i, 1);
                                i--;
                            }
                        }

                    }
                    break;
                case 1:
                    {
                        var list_detect_point = this.list_detect_point;
                        var team_controler = this;

                        LATE.GAME_OBJECT.listgameunit[1 - this.team].filter(function (e) {
                            var c = LATE.GRID.check_availble_user_fogmap(e),
                                r = !e.__avalble__fogmap && c;
                            e.__avalble__fogmap = r;
                            return r;
                        }).forEach(function (e) {
                            var find_near = list_detect_point.find(f => LATE.calcfar(e, f) * 5 < LATE.GRID.dim);
                            if (find_near)
                                find_near.time = performance.now();
                            else if (list_detect_point.length < 3) {
                                list_detect_point.push({ x: e.x, y: e.y, time: performance.now() });
                                team_controler.controler_inferface.on_detect_enemy(e);
                            }
                        });

                        for (var i = 0; i < list_detect_point.length; i++) {
                            if (performance.now() - list_detect_point[i].time > 20000) {
                                list_detect_point.splice(i, 1);
                                i--;
                            }
                        }
                    }
                    break;
            }


        }
    }


    /**
     @param {Game_unit}ob
    */
    this.on_unit_destroyed = function (ob) {
        this.controler_inferface.on_unit_destroyed(ob);
    }

    /**
     @param {Game_unit} ob
    */
    this.on_new_unit_ready = function (ob) {
        this.controler_inferface.on_new_unit_ready(ob);

    }


    /**
     @param {Game_unit} ob
    */
    this.on_move_done = function (ob) {
        //console.log("this.controler_inferface.on_move_done(ob);");
        this.controler_inferface.on_move_done(ob);
    }

}



var CONTROLER1 = new Team_Controler(0);

var CONTROLER2 = new Team_Controler(1);



/**
 * 
 * @param {Team_Controler} Team_controler
 */
var User_Controler = function (Team_controler) {

    var is_building = false;
    var is_choose_postion = false;
    var addtional_functional = null;

    var sell_mode = false;
    var building_construction = null;
    var repair_mode = false;

    this.stack_construction_done = [];
    this.stack_addtional_done = [];
    this.team_controler = Team_controler;
    Team_controler.controler_inferface = this;

    this.audio = {
        constructioncomplete: "Audio/constructioncomplete.wav",
        cannotdeployhere: "Audio/cannotdeployhere.wav",
        building: "Audio/building.wav",
        canceled: "Audio/canceled.wav",
        minimap_on: "Audio/uradaron.wav",
        minimap_off: "Audio/uradarof.wav"
    }


    this.on_buy_construction_done = function (data) {
        this.stack_construction_done.push(data);
        LATE.PLAYING_LAYOUT.on_buy_construction_done(data);
        AUDIO.create_controlsound(this.audio.constructioncomplete, null, 0.5);
    }





    /**
     * Wait user set position to build
     * @param {type} data
     */
    this.on_building_construction = function (data) {
        if (this.stack_construction_done.indexOf(data) > -1) {
            is_building = true;
            building_construction = data;
        }
        follow_mode = false;
    }


    this.set_position_construction = function (data, postition) {
        var tmp = this.stack_construction_done.indexOf(data);
        if (tmp > -1 && LATE.CONSTRUCTION_TYPE[data.name]) {
            if (this.team_controler.set_position_construction(data, postition)) {
                this.stack_construction_done.splice(tmp, 1);
                is_building = false;
                building_construction = null;
                LATE.PLAYING_LAYOUT.on_building_construction_done(data);
                return true;
            }
        }
        return false;
    }


    this.cancel_set_position_construction = function () {
        is_building = false;
        building_construction = null;
    }




    this.on_addtional_done = function (data) {
        this.stack_addtional_done.push(data);
        LATE.PLAYING_LAYOUT.on_addtional_done(data);
    }



    this.set_addtional_pos = function (data, position) {
        var tmp = this.stack_addtional_done.indexOf(data);
        if (tmp > -1) {
            if (this.team_controler.set_addtional_pos(data, position)) {
                this.stack_addtional_done.splice(tmp, 1);
                is_choose_postion = false;
                addtional_functional = null;
                LATE.PLAYING_LAYOUT.on_addtional_set_pos_done(data);
                return true;
            }
        }
        return false;
    }


    this.on_set_addtional_pos = function (data) {
        if (this.stack_addtional_done.indexOf(data) > -1) {
            is_choose_postion = true;
            addtional_functional = data;
        }
        follow_mode = false;
    }


    this.cancel_set_position_addtional = function () {
        is_choose_postion = false;
        addtional_functional = null;
    }


    this.on_buy = function (data) {
        this.team_controler.on_buy(data);
        console.log(data.type);
        if (data.type == "construction" || data.type == "defense_construction") {
            AUDIO.create_controlsound(this.audio.building, null, 0.5);
        }
    }



    this.on_cancel_buy = function (data) {
        if (data.progess_load)
            AUDIO.create_controlsound(this.audio.canceled, null, 0.5);
        this.team_controler.on_cancel_buy(data);
    }

    this.update_unit_can_buy = function (data) {
        LATE.PLAYING_LAYOUT.update_display_unit(data);
    }

    this.on_attacked = function (data) {
        LATE.MINIMAP.on_notify("on_attacked", data);
    }

    this.on_detect_enemy = function (data) {
        LATE.MINIMAP.on_notify("on_detect_enemy", data);
    }

    this.minimap_on = function (data) {
        AUDIO.create_controlsound(this.audio.minimap_on, null, 0.5);
        LATE.MINIMAP.on_notify("minimap_on");
    }

    this.minimap_off = function (data) {
        AUDIO.create_controlsound(this.audio.minimap_off, null, 0.5);
        LATE.MINIMAP.on_notify("minimap_off");
    }

    this.on_game_start = function () {
        var main_constrution = LATE.GAME_OBJECT.listgameunit[this.team_controler.team].find(e => e.property.name == "veh_mcv_allied");

        if (main_constrution) {
            var pos = LATE.convert2screenwithoutsrcpos(main_constrution.x, main_constrution.y, main_constrution.z);
            set_screen_x((pos.x - display_width / 2) / 60);
            set_screen_y((pos.y - display_height / 2) / 30);
        }
    }



    /**
     @param {Game_unit}ob
    */
    this.on_unit_destroyed = function (ob) {
    }

    /**
     @param {Game_unit} ob
    */
    this.on_new_unit_ready = function (ob) {

    }


    /**
     @param {Game_unit} ob
    */
    this.on_move_done = function (ob) {

    }




    var conner = 10;
    var display_conner = 45;
    var moveleftright = 0;
    var moveupdown = 0;
    var mousex = 0;
    var mousey = 0;
    var mousehold = false;
    var mousehold_right = false;
    var mouseholdx, mouseholdy;
    var follow_mode = false;
    var mouse_texture = new (function () {

        var basetexture = PIXI.Texture.from("../IMG/icon/mouse/mouse.png");
        var textures = [];
        for (var j = 0; j < 25; j++) for (var i = 0; i < 18; i++) {
            textures.push(new PIXI.Texture(basetexture.baseTexture, new PIXI.Rectangle(55 * i, 43 * j, 55, 43)));
        }
        this.sprite = new PIXI.Sprite(textures[0]);
        var sprite = this.sprite;


        function simple(frame, x, y) {
            this.set_direct = function () { };
            this.process = function () {
                sprite.texture = textures[frame];
                sprite.anchor.set(x || 0.5, y || 0.5);
            };
        }


        function animation(start, end, speed, x, y) {
            var total = end - start + 1;
            this.set_direct = function () { };
            this.process = function (time) {
                sprite.texture = textures[start + Math.floor((speed * time) % total)];
                sprite.anchor.set(x || 0.5, y || 0.5);
            };
            this.getsprite = function () {
                return this._sprite_ || (this._sprite_ = {
                    sprites: textures.slice(start, end),
                    speed: speed,
                    x: x, y: y
                });
            }
        }


        function direct(frame, x, y) {
            this.direct = 0;
            this.set_direct = function (d) { this.direct = d; }
            this.process = function (time) {
                sprite.texture = textures[frame + this.direct];
                sprite.anchor.set(x || 0.5, y || 0.5);
            };
        }




        this.map = {
            mouse: new simple(0, 0.01, 0.01),
            mouse_minimap: new simple(1),
            slide_coner: new direct(2),
            slide_coner_none: new direct(10),
            choose_animation: new animation(18, 30, 0.1),
            move_animation: new animation(31, 40, 0.1),
            move_none: new simple(41),
            attack_animation: new animation(53, 57, 0.1),
            go_into_animation: new animation(89, 98, 0.1),
            go_into_none: new simple(99),
            sell_animation: new animation(129, 138, 0.1),
            sell_none: new simple(149),
            repair_animation: new animation(150, 169, 0.1),
            repair_action_animation: new animation(170, 189, 0.1),
            repair_action_none: new simple(190),
            drop_animation: new animation(259, 268, 0.1),
            change_animation: new animation(110, 118, 0.1),
            change_none: new simple(119)
        }
        this.time = 0;
        this.state = this.map.mouse;

        this.process = function (time) {
            this.time += time * 4;
            this.sprite.position.set(27, 21);
            this.state.process(this.time);
            mouserenderer.render(mouse_stage);
        }
        this.set_direct = function (x, y) {
            var d = 0;
            if (!x)
                d = (y < 0) ? 0 : 4;
            else if (!y)
                d = (x < 0) ? 6 : 2;
            else if (x > 0)
                d = (y < 0) ? 1 : 3;
            else if (x < 0)
                d = (y < 0) ? 7 : 5;
            this.state.set_direct(d);
        }

    })();

    this.get_mouse_sprite = function () {
        return mouse_texture.sprite;
    }
    this.get_control_sprites = function (key) {
        return mouse_texture.map[key].getsprite();
    }
    //var mouse_sprite = new PIXI.Sprite(mouse_texture[0]);


    this.chooselist = [];
    this.keystate = [];


    /** @description Update list when user choose game units.
     * @param {Array.<Game_unit>} list The list of game unit.
     */

    this.setchooselist = function (list) {
        if (this.keystate[KEYBOARD.SHIFT]) {
            var list_tmp = [];
            for(var e of this.chooselist)
                e.check_choose_1 = true;
            for(var e of list) if (!e.check_choose_1) {
                e.display_health_point(true);
                list_tmp.push(e);
            }
            for(var e of this.chooselist)
                e.check_choose_1 = false;
            Array.prototype.push.apply(this.chooselist, list_tmp);
        } else {
            for(var e of this.chooselist)
                e.check_choose_1 = true;
            for(var e of list)
                e.check_choose_2 = true;
            for(var e of this.chooselist)
                if (!e.check_choose_2)
                e.display_health_point(false);
            for(var e of list)
                if (!e.check_choose_1)
                e.display_health_point(true);
            for(var e of this.chooselist)
                e.check_choose_1 = false;
            for(var e of list)
                e.check_choose_2 = false;
            this.chooselist = list;

            if (list[0] && list[0].property && list[0].property.audio && list[0].property.audio.sel)
                AUDIO.create_controlsound(list[0].property.audio.sel, list[0], 0.15);
        }
        follow_mode = false;

    }


    this.update = function (time) {

        LATE.PLAYING_LAYOUT.process(time);
        this.team_controler.update(time);
        mouse_texture.process(time);

        this.chooselist = this.chooselist.filter(e => e.state != STATE.DELETE);


        var back_screen_x = screen_x,
            back_screen_y = screen_y;

        if (follow_mode) {

            if (this.chooselist.length > 0) {
                var total = this.chooselist.map(e => LATE.convert2screenwithoutsrcpos(e.x, e.y, e.z))
                    .reduce((a, b) => (a.x += b.x) && (a.y += b.y) && a, { x: 0, y: 0 });
                var avg_x = (total.x / this.chooselist.length - display_width / 2) / 60;
                var avg_y = (total.y / this.chooselist.length - display_height / 2) / 30;
                set_screen_x(screen_x + (avg_x - screen_x) * 0.1);
                set_screen_y(screen_y + (avg_y - screen_y) * 0.1);

            }

        } else if (!mousehold) {
            if (mousex < conner && screen_x >= 0)
                moveleftright -= 0.015;
            else if (mousex + conner > screen_width && screen_x < (max_x - screen_w))
                moveleftright += 0.015;
            else
                moveleftright = 0;
            moveleftright = Math.min(0.3, Math.max(-0.3, moveleftright));
            moveupdown = Math.min(0.3, Math.max(-0.3, moveupdown));


            if (mousey < conner && screen_y >= 0)
                moveupdown -= 0.015 * time;
            else if (mousey + conner > screen_height && screen_y < (max_y - screen_h))
                moveupdown += 0.015 * time;
            else
                moveupdown = 0;

            set_screen_x(screen_x + moveleftright * time);
            set_screen_y(screen_y + moveupdown * time);
        }


        set_screen_x(Math.max(0, Math.min(max_x - screen_w, screen_x)));
        set_screen_y(Math.max(0, Math.min(max_y - screen_h, screen_y)));


        if (is_building && building_construction && LATE.convert2codinate(mousex, mousey)) {
            var type = LATE.CONSTRUCTION_TYPE[building_construction.name];
            var p = LATE.convert2codinate(mousex, mousey);
            var point = { x: p.x, y: p.y };
            var size = type.property.size;
            if (size.w % 2 == 0) point.x += 0.5;
            if (size.h % 2 == 0) point.y += 0.5;
            var can_building = LATE.GRID.check_area_for_construct(point.x, point.y, size.w, size.h);
            var starx = Math.max(0, Math.round(point.x - size.w / 2));
            var stary = Math.max(0, Math.round(point.y - size.h / 2));
            var endx = Math.min(LATE.GRID.dim - 1, point.x + size.w / 2);
            var endy = Math.min(LATE.GRID.dim - 1, point.y + size.h / 2);
            graphics.lineStyle(0, 0, 0);
            for (var i = starx; i <= endx; i++) {
                for (var j = stary; j <= endy; j++) {
                    var scr = LATE.convert2screen(i, j, LATE.GRID.heightmap[i * LATE.GRID.dim + j]);
                    var color2 = can_building ? 0x00ff00 : (LATE.GRID.get_tile_count(i, j) == 0 ? 0xffff00 : 0xff0000);
                    graphics.beginFill(color2, 1);
                    graphics.moveTo(scr.x - 29, scr.y);
                    graphics.lineTo(scr.x, scr.y - 14);
                    graphics.lineTo(scr.x + 29, scr.y);
                    graphics.lineTo(scr.x, scr.y + 14);
                    graphics.endFill();
                }
            }
            if (type.type == "contruction_denfense") {
                var r = type.property.range;
                graphics.lineStyle(2, 0x33FFFF, 1);
                scr = LATE.convert2screen(p.x, p.y, LATE.GRID.heightmap[p.x * LATE.GRID.dim + p.y]);
                graphics.drawEllipse(scr.x, scr.y, r * 42.5, r * 21.21);
            }
        } else if (is_choose_postion && addtional_functional) {

            //            is_choose_postion = true;
            //addtional_functional = data;
        } else if (sell_mode) {

        } else if (mousehold && mouseholdx && mouseholdy) {
            // draw a rectangle
            graphics.lineStyle(2, 0x33FFFF, 1);
            graphics.drawRect(mouseholdx, mouseholdy, mousex - mouseholdx, mousey - mouseholdy);
        }


        //Mouse curso 
        {
            var dx = (mousex < conner) ? -1 : ((mousex + conner > screen_width) ? 1 : 0);
            var dy = (mousey < conner) ? -1 : ((mousey + conner > screen_height) ? 1 : 0);

            var choose_ob = LATE.GAME_OBJECT.listobject.filter(e => e instanceof LATE.Game_unit)
                .find(e => e.check_choose(mousex, mousey) && LATE.GRID.check_availble_user_fogmap(e));
            if (dx || dy) {
                if ((back_screen_x == screen_x) && (back_screen_y == screen_y)) {
                    mouse_texture.state = mouse_texture.map.slide_coner_none;
                } else {
                    mouse_texture.state = mouse_texture.map.slide_coner;
                }
                mouse_texture.set_direct(dx, dy);
            } else if (mousex + 250 > window.innerWidth) {
                mouse_texture.state = mouse_texture.map.mouse;
            } else if (is_choose_postion && addtional_functional) {
                mouse_texture.state = mouse_texture.map.drop_animation;
                /*addtional_functional*/
            } else if (sell_mode) {
                if (choose_ob && choose_ob instanceof LATE.Construction_unit
                    && choose_ob.team == this.team_controler.team) {
                    mouse_texture.state = mouse_texture.map.sell_animation;
                } else {
                    mouse_texture.state = mouse_texture.map.sell_none;
                }
            } else if (repair_mode) {
                if (choose_ob && choose_ob instanceof LATE.Construction_unit
                    && choose_ob.team == this.team_controler.team
                    && choose_ob.health < choose_ob.totalhealth) {
                    mouse_texture.state = mouse_texture.map.repair_action_animation;
                } else {
                    mouse_texture.state = mouse_texture.map.repair_action_none;
                }
            } else {
                mouse_texture.state = mouse_texture.map.mouse;
                var choose_0 = this.chooselist[0];
                if (choose_0 && choose_0 instanceof LATE.Movealbe_unit) {
                    mouse_texture.state = mouse_texture.map.move_animation;
                    var type = choose_0.property.name;
                    if (choose_ob) {
                        if (choose_ob.team != this.team_controler.team)
                            mouse_texture.state = mouse_texture.map.attack_animation;

                        if (type == "sol_eng" && choose_ob instanceof LATE.Construction_unit) {
                            if (choose_ob.team != this.team_controler.team) {
                                if (LATE.SOLIDER_TYPE.sol_eng.property.unit_can_recruit.indexOf(choose_ob.property.name) > -1) {
                                    mouse_texture.state = mouse_texture.map.go_into_animation;
                                } else if (choose_ob.team == -1 && choose_ob.health < choose_ob.totalhealth) {
                                    mouse_texture.state = mouse_texture.map.repair_animation;
                                } else {
                                    mouse_texture.state = mouse_texture.map.go_into_none;
                                }
                            } else if (choose_ob.team == -1 && choose_ob.health < choose_ob.totalhealth) {
                                mouse_texture.state = mouse_texture.map.repair_animation;
                            }
                        }

                        if (type == "sol_spy_allied") {
                            if (choose_ob instanceof LATE.Construction_unit && choose_ob.team != this.team_controler.team) {
                                if (LATE.SOLIDER_TYPE.sol_spy_allied.property.unit_can_spy.indexOf(choose_ob.property.name) > -1) {
                                    mouse_texture.state = mouse_texture.map.go_into_animation;
                                } else {
                                    mouse_texture.state = mouse_texture.map.go_into_none;
                                }
                            }
                        }

                        if (choose_ob instanceof LATE.Map_Building_Construction_unit && choose_0.property.can_go_into_building) {
                            if (choose_ob.check_can_going_to(choose_0)) {
                                mouse_texture.state = mouse_texture.map.go_into_animation;
                            } else {
                                mouse_texture.state = mouse_texture.map.go_into_none;
                            }
                        }

                        if (choose_ob == choose_0 && this.chooselist.length == 1
                            && choose_ob.property.can_change && choose_ob.team == this.team_controler.team) {
                            if (choose_ob.property.name == "veh_mcv_allied" && choose_ob.check_area_for_construct())
                                mouse_texture.state = mouse_texture.map.change_animation;
                            else
                                mouse_texture.state = mouse_texture.map.change_none;
                        }


                    } else {

                    }
                } else if (choose_0 && choose_0 instanceof LATE.Construction_unit) {
                    if (choose_0 instanceof LATE.Defender_Construction_unit) {
                        if (choose_ob && choose_ob.team != this.team_controler.team)
                            mouse_texture.state = mouse_texture.map.attack_animation;
                    } else if (choose_0.property.name == "con_contruction_allied") {
                        mouse_texture.state = mouse_texture.map.move_animation;
                    }

                    if (choose_ob == choose_0 && this.chooselist.length == 1
                        && choose_ob.property.can_change && choose_ob.team == this.team_controler.team) {
                        mouse_texture.state = mouse_texture.map.change_animation;
                    }
                } else if (!choose_0) {
                    if (choose_ob) {
                        mouse_texture.state = mouse_texture.map.choose_animation;
                    }
                }
            }
        }

    }


    this.choosepoint = function (x, y, x1, y1) {
        if (x1 && y1) {
            var t;
            if (x > x1) { t = x; x = x1; x1 = t; };
            if (y > y1) { t = y; y = y1; y1 = t; };
            let filter = function (e) {
                if (e instanceof LATE.Movealbe_unit) {
                    if (e.pos && e.pos.x > x && e.pos.x < x1 && e.pos.y > y && e.pos.y < y1)
                        return true;
                } else if (e instanceof LATE.Construction_unit) {

                }
                return false;
            };
            return LATE.GAME_OBJECT.listobject.filter(filter);
        } else {
            let length = LATE.GAME_OBJECT.listobject.length;
            for (var i = 0; i < length; i++) {
                var e = LATE.GAME_OBJECT.listobject[i];
                if (e instanceof LATE.Game_unit) {
                    if (e.check_choose(x, y))
                        return [e];
                }
            }
            return [];
        }

    }


    this.choose_same_unit = function (unit, chooseall) {
        if (!unit || !unit.property)
            return [];

        var filter = function (e) {
            if (e instanceof LATE.Movealbe_unit && unit.property == e.property && unit.team == e.team) {
                if (chooseall || (e.pos && e.pos.x > 0 && e.pos.x < display_width && e.pos.y > 0 && e.pos.y < display_height))
                    return true;
            } else if (e instanceof LATE.Construction_unit && unit.property == e.property && unit.team == e.team) {
                if (chooseall || (e.pos && e.pos.x > 0 && e.pos.x < display_width && e.pos.y > 0 && e.pos.y < display_height))
                    return true;
            }
            return false;
        };
        return LATE.GAME_OBJECT.listobject.filter(filter);
    }


    this.ondblclick = function (event) {
        switch (event.which) {
            case 1:
                var choose_ob = LATE.GAME_OBJECT.listobject
                   .filter(e => e instanceof LATE.Game_unit || e instanceof LATE.Tree)
                   .find(e => e.check_choose(event.x, event.y));

                choose_ob && this.setchooselist(this.choose_same_unit(choose_ob));
                this.__last__dblclick__time__ = performance.now();
                break;
            case 2:

                break;
        }
    }


    this.onmousemove = function (event) {


        mousex = event.x;
        mousey = event.y;

        var X = Math.max(display_conner / 2, Math.min(innerWidth - display_conner / 2, mousex));
        var Y = Math.max(display_conner / 2, Math.min(innerHeight - display_conner / 2, mousey));

        mouserenderer.view.style.left = (X - 27) + "px";
        mouserenderer.view.style.top = (Y - 21) + "px";
        //mouserenderer.render(mouse_stage);
    }


    this.onmousedown = function (event) {
        this.__add_tree_mode__ && this.__add_tree_mode__.onmousedown(event);
        if (event.x > display_width || event.y > display_height)
            return;
        switch (event.which) {
            case 1:
                //debugger;
                var choose_ob = LATE.GAME_OBJECT.listobject
                    .filter(e => e instanceof LATE.Game_unit || e instanceof LATE.Tree)
                    .find(e => e.check_choose(event.x, event.y));
                if (performance.now() - this.__last__dblclick__time__ < 200) {
                    choose_ob && this.setchooselist(this.choose_same_unit(choose_ob, true));
                } else if (is_building && building_construction) {
                    var p = LATE.convert2codinate(event.x, event.y);
                    var point = { x: p.x, y: p.y };
                    var size = LATE.CONSTRUCTION_TYPE[building_construction.name].property.size;
                    if (size.w % 2 == 0) point.x += 0.5;
                    if (size.h % 2 == 0) point.y += 0.5;
                    if (LATE.GRID.check_area_for_construct(point.x, point.y, size.w, size.h)) {
                        this.set_position_construction(building_construction, point);
                    } else {
                        AUDIO.create_controlsound(this.audio.cannotdeployhere, null, 0.5);
                    }
                } else if (is_choose_postion && addtional_functional) {
                    var p = LATE.convert2codinate(event.x, event.y);
                    var point = { x: p.x, y: p.y };
                    this.set_addtional_pos(addtional_functional, point)
                } else if (sell_mode) {
                    var object = this.team_controler.get_listobject().filter(e => e instanceof LATE.Construction_unit).find(e => e.check_choose(event.x, event.y));
                    if (object)
                        this.team_controler.send_command([object], { com: "sell" });
                } else if (repair_mode) {
                    var object = this.team_controler.get_listobject().filter(e => e instanceof LATE.Construction_unit).find(e => e.check_choose(event.x, event.y));
                    if (object) {
                        this.team_controler.send_command([object], { com: "repaircon" });
                        LATE.GAME_OBJECT.add_instance(new LATE.Repair_Effect(object));
                    }
                } else {
                    mousehold = true;
                    mouseholdx = event.x;
                    mouseholdy = event.y;
                }

                break;
            case 2:

                break;
            case 3:
                var goalpoint = LATE.convert2codinate(event.x, event.y);
                var commandstack = this.keystate[KEYBOARD.KEY_Z];

                if (repair_mode || sell_mode) {
                    repair_mode = false;
                    sell_mode = false;
                } else if (is_building && building_construction) {
                    this.cancel_set_position_construction();
                } else if (is_choose_postion && addtional_functional) {
                    this.cancel_set_position_addtional();
                } else {
                    if (this.chooselist.length == 0)
                        break;

                    var heapmine = LATE.GRID.heapmine[goalpoint.x * LATE.GRID.dim + goalpoint.y];

                    var choose_ob = LATE.GAME_OBJECT.listobject
                        .filter(e => e instanceof LATE.Game_unit || e instanceof LATE.Tree)
                        .find(e => e.check_choose(event.x, event.y) && LATE.GRID.check_availble_user_fogmap(e));

                    var tmp;
                    var e = [];

                    if (choose_ob && choose_ob.team == this.team_controler.team && choose_ob.property.can_change
                        && this.chooselist.length == 1 && this.chooselist[0] == choose_ob) {
                        this.team_controler.send_command([choose_ob], { com: "change" });
                    } else if (choose_ob && (choose_ob.team != this.team_controler.team)) {

                        e.length || choose_ob instanceof LATE.Construction_unit
                            && choose_ob.team == -1
                            && choose_ob.health < choose_ob.totalhealth
                            && this.team_controler.send_command(
                                e = this.chooselist.filter(e => e instanceof LATE.SOLIDER_TYPE.sol_eng.class),
                                { com: "repair", enemy: choose_ob }
                            );

                        e.length || choose_ob instanceof LATE.Map_Building_Construction_unit
                            && choose_ob.team == -1
                            && this.team_controler.send_command(
                                e = this.chooselist.filter(e =>(e instanceof LATE.Solider_unit || e instanceof LATE.Parachutist) && e.property.can_go_into_building),
                                { com: "gointo", ob: choose_ob, commandstack }
                            );



                        e.length || this.team_controler.send_command(
                            e = this.chooselist.filter(e => e instanceof LATE.Movealbe_unit || e instanceof LATE.Defender_Construction_unit),
                            { com: "attack", enemy: choose_ob, commandstack }
                        );

                    } else if (choose_ob && (choose_ob.team == this.team_controler.team)) {
                        e.length || (choose_ob instanceof LATE.Construction_unit && choose_ob.health < choose_ob.totalhealth)
                            && this.team_controler.send_command(
                               e = this.chooselist.filter(e => e instanceof LATE.SOLIDER_TYPE.sol_eng.class),
                               { com: "repair", enemy: choose_ob, commandstack }
                            );
                        console.log()
                        e.length || (choose_ob instanceof LATE.Map_Building_Construction_unit && choose_ob.check_can_going_to(this.chooselist[0])) &&
                            this.team_controler.send_command(
                               e = this.chooselist.filter(e => e instanceof LATE.Solider_unit && e.property.can_go_into_building),
                               { com: "gointo", ob: choose_ob, commandstack }
                            );

                    } else {

                        var list = this.chooselist.filter(e => e.property == LATE.VEHICLE_TYPE.veh_ore_allied),
                            workpoint;
                        e.length || list.length && heapmine
                            && this.team_controler.send_command(e = list, { com: "set", ob: heapmine });

                        e.length || list.length && (workpoint = this.team_controler.list_refinery.find(e => e.check_choose(event.x, event.y)))
                            && this.team_controler.send_command(e = list, { com: "set", ob: workpoint });

                        e.length || this.team_controler.send_command(
                            e = this.chooselist.filter(e => e instanceof LATE.Movealbe_unit),
                             { com: "move", goal: goalpoint, commandstack }
                        ) || (
                            LATE.GAME_OBJECT.add_effect(goalpoint.x, goalpoint.y, 0, LATE.EFFECT_TYPE.mouse_move)
                             && ((e[0] && e[0].property && e[0].property.audio && e[0].property.audio.mov)
                             && AUDIO.create_controlsound(e[0].property.audio.mov, e[0], 0.15))
                        );


                        e.length || this.team_controler.send_command(
                             e = this.chooselist.filter(e => e instanceof LATE.Construction_unit && e.property.workpoint),
                            { com: "setworkpoint", workpoint: goalpoint }
                        );
                        e.length || this.team_controler.send_command(
                             e = this.chooselist.filter(e => e instanceof LATE.Construction_unit && e.property.can_change && !(e instanceof LATE.Map_Building_Construction_unit)),
                            { com: "change", goal: goalpoint }
                        );

                    }

                }
                break;
        }
    }


    this.onmouseup = function (event) {

        switch (event.which) {
            case 1:
                //console.log("onmouseup");
                if (mousehold && Math.abs(mouseholdx - event.x) < 5 && Math.abs(mouseholdy - event.y) < 5) {
                    this.setchooselist(this.choosepoint(event.x, event.y));
                } else if (mousehold) {
                    this.setchooselist(this.choosepoint(event.x, event.y, mouseholdx, mouseholdy))
                }

                break;
            case 2:
                break;
            case 3:
                break;
            default:
        }

        mousehold = false;
        mouseholdx = mouseholdy = undefined;

    }


    this.onmouseleave = function (event) {
        mousehold = false;
        mouseholdx = mouseholdy = undefined;
        moveleftright = 0;
        moveupdown = 0;
        mousey = mousex = undefined;
    }


    this.onkeyup = function (event) {
        this.keystate[event.keyCode] = false;
        if (event.keyCode == KEYBOARD.KEY_Z) {



        }
    }


    this.onkeydown = function (event) {
        this.keystate[event.keyCode] = true;
        if (event.keyCode == KEYBOARD.KEY_B && this.stack_construction_done.length > 0) {
            is_building = true;
            sell_mode = false;
            repair_mode = false;
            building_construction = this.stack_construction_done[0];
        } else if (event.keyCode == KEYBOARD.KEY_F
            && this.chooselist.length
            && this.chooselist.every(e => e instanceof LATE.Movealbe_unit)) {
            follow_mode = !follow_mode;
        } else if (event.keyCode == KEYBOARD.KEY_D
            && this.chooselist.some(e => (e instanceof LATE.Movealbe_unit && e.property.can_change) || e.property.property.can_go_into)) {
            this.team_controler.send_command(
                this.chooselist.filter(e => (e instanceof LATE.Movealbe_unit && e.property.can_change) || e.property.property.can_go_into),
                { com: "change" }
            );
        } else if (event.keyCode == KEYBOARD.KEY_G) {
            this.team_controler.send_command(
                this.chooselist.filter(e => e instanceof LATE.Movealbe_unit),
                { com: "auto" }
            );
        } else if (event.keyCode == KEYBOARD.KEY_S) {
            is_building = false;
            repair_mode = false;
            sell_mode = !sell_mode;
        } else if (event.keyCode == KEYBOARD.KEY_R) {
            is_building = false;
            sell_mode = false;
            repair_mode = !repair_mode;

        } else if (event.keyCode == KEYBOARD.KEY_X) {
            console.log(LATE.convert2codinate(mousex, mousey));
        } else if (event.keyCode == KEYBOARD.KEY_T) {
            if (this.chooselist.length) {
                var list_choose = [];
                var index_type_name = {};
                this.chooselist.map(e => e.property.name).forEach(e => index_type_name[e] = true);

                console.log(index_type_name);

                if (this.__last__key__T__ && performance.now() - this.__last__key__T__ < 200) {
                    for(var e of LATE.GAME_OBJECT.listobject) {
                        if (e instanceof LATE.Game_unit
                            && index_type_name[e.property.name]
                            && e.team == this.team_controler.team) {
                            list_choose.push(e);
                        }
                    }
                } else {
                    for(var e of LATE.GAME_OBJECT.listobject) {
                        if (e instanceof LATE.Game_unit
                            && index_type_name[e.property.name]
                            && e.team == this.team_controler.team
                            && e.pos && e.pos.x > 0 && e.pos.x < display_width && e.pos.y > 0 && e.pos.y < display_height) {
                            list_choose.push(e);
                        }
                    }
                }
                this.setchooselist(list_choose);
                this.__last__key__T__ = performance.now();

            }

            //if (this.__add_tree_mode__) {
            //    this.__add_tree_mode__ = null;
            //} else {
            //    this.__add_tree_mode__ = new (function () {
            //        this.now_type = 0;
            //        this.input_circle = 0;
            //        this.on_key = function (keycode) {
            //            console.log("on_key");
            //            if (keycode >= 48 && keycode <= 57) {
            //                this.input_circle += 1;
            //                if (this.input_circle >= 2) {
            //                    this.input_circle = 0;
            //                    this.now_type = 0;
            //                }
            //                this.now_type = this.now_type * 10 + (keycode - 48);
            //            } else if (keycode == KEYBOARD.KEY_S) {
            //                var string = GAME_OBJECT.listobject
            //                   .filter(e => e instanceof Tree).map(e => `Tree ${e.x} ${e.y} 0 ${e.indextype}`).join("\r\n");
            //                console.log("\r\n" + string + "\r\n");
            //            }
            //        }
            //        this.onmousedown = function (event) {
            //            console.log("onmousedown");
            //            var point = convert2codinate(event.x, event.y);
            //            if (point) {
            //                var tr = GRID.objectmap[point.x * GRID.dim + point.y].find(e => e instanceof Tree);
            //                if (tr) {
            //                    tr.delete();
            //                } else {
            //                    GAME_OBJECT.add_instance(new Tree(point.x, point.y, 0, MAP_OBJECT_TYPE.tree, this.now_type));
            //                }
            //            }
            //        }
            //    })();
            //    console.log(this.__add_tree_mode__);
            //}
        } else if (event.keyCode == KEYBOARD.KEY_P) {
            var list_choose = [];

            if (this.__last__key__P__ && performance.now() - this.__last__key__P__ < 200) {
                for(var e of LATE.GAME_OBJECT.listobject) {
                    if (e instanceof LATE.Game_unit
                        && e.property.property.attack_dam
                        && e.team == this.team_controler.team) {
                        list_choose.push(e);
                    }
                }
            } else {
                for(var e of LATE.GAME_OBJECT.listobject) {
                    if (e instanceof LATE.Game_unit
                        && e.team == this.team_controler.team
                        && e.property.property.attack_dam
                        && e.pos && e.pos.x > 0 && e.pos.x < display_width && e.pos.y > 0 && e.pos.y < display_height) {
                        list_choose.push(e);
                    }
                }
            }
            this.setchooselist(list_choose);
            this.__last__key__P__ = performance.now();

        } else if (event.keyCode == KEYBOARD.KEY_N) {
            var pos = LATE.convert2codinate(mousex, mousey);
            LATE.GAME_OBJECT.add_instance(new LATE.Parachutist(pos.x, pos.y, LATE.GRID.heightmap[pos.x * LATE.GRID.dim + pos.y] + 35, 0, LATE.SOLIDER_TYPE.sol_gi_allied));
        } else if (event.keyCode == KEYBOARD.KEY_H) {
            this.nav_to_home_point();
        } else if (event.keyCode >= KEYBOARD.KEY_0 && event.keyCode <= KEYBOARD.KEY_9) {

        } else if (event.keyCode == KEYBOARD.KEY_L) {
            LATE.FOG_GRAPGICH.get_fog_sprite_area().renderable ^= true;

            if (LATE.FOG_GRAPGICH.get_fog_sprite_area().renderable) {
                LATE.GRID.check_availble_user_fogmap = LATE.GRID.check_availble_user_fogmap_func;
                LATE.GRID.fast_check_availble_user_fogmap = LATE.GRID.fast_check_availble_user_fogmap_func;
            } else {
                LATE.GRID.check_availble_user_fogmap = () => true;
                LATE.GRID.fast_check_availble_user_fogmap = () => true;
            }
        } else {

        }


        this.__add_tree_mode__ && this.__add_tree_mode__.on_key(event.keyCode);



    }


    this.nav_to_home_point = function () {

        var ob = LATE.GAME_OBJECT.listgameunit[this.team_controler.team].find(e => e.property.name == "con_contruction_allied")
            || LATE.GAME_OBJECT.listgameunit[this.team_controler.team].find(e => e.property.type == "contruction")
            || LATE.GAME_OBJECT.listgameunit[this.team_controler.team].find(e => e.property.name == "veh_mcv_allied");
        if (ob) {
            var pos = LATE.convert2screenwithoutsrcpos(ob.x, ob.y, ob.z);
            set_screen_x((pos.x - display_width / 2) / 60);
            set_screen_y((pos.y - display_height / 2) / 30);
        }

    }




    CONTROLER.add(this);
}


/**
 * 
 * @param {Team_Controler} Team_controler
 */
var Ai_Controlder = function (Team_controler) {

    this.team_controler = Team_controler;
    this.worker = null;
    Team_controler.controler_inferface = this;



    this.set_position_construction = function (data, postition) {
        return this.team_controler.set_position_construction(data, postition);
    }


    this.on_buy = function (data) {
        this.team_controler.on_buy(data);
    }

    this.on_cancel_buy = function (data) {
        this.team_controler.on_cancel_buy(data);
    }

    this.on_buy_construction_done = function (data) {
        this.worker.on_buy_construction_done(data);
    }

    this.on_send_command = function (list, command) {
        this.team_controler.send_command(list, command);
    }

    this.update_unit_can_buy = function (data) {
        this.worker.update_unit_can_buy(data);
    }

    this.on_attacked = function (data) {
        //console.log("on_attacked", data);
        this.worker.on_attacked(data.get_data(this.team_controler.team));
    }

    this.on_detect_enemy = function (data) {
        //console.log("on_detect_enemy", data);

        this.worker.on_detect_enemy(data.get_data(this.team_controler.team));
    }

    this.minimap_on = function (data) {

    }

    this.minimap_off = function (data) {

    }

    /**
     @param {Game_unit}ob
    */
    this.on_unit_destroyed = function (ob) {
        this.worker.on_unit_destroyed(ob.get_data(this.team_controler.team));
    }

    /**
     @param {Game_unit} ob
    */
    this.on_new_unit_ready = function (ob) {
        this.worker.on_new_unit_ready(ob.get_data(this.team_controler.team));
    }

    /**
     @param {Game_unit} ob
    */
    this.on_move_done = function (ob) {
        //console.log("AI_WORKER.on_move_done(ob.get_data(this.team_controler.team));");
        this.worker.on_move_done(ob.get_data(this.team_controler.team));
    }

    this.update = function (time) {
        this.worker.process(time);
        this.team_controler.update();
    }

    this.on_game_start = function () {
        //var data =  
        this.worker.on_game_start();
    }

    this.register_worker = function (worker) {
        this.worker = worker;
    }

    CONTROLER.add(this);
}



var USER_CONTROLER = new User_Controler(CONTROLER1);


//var AI_CONTROLER1 = new Ai_Controlder(CONTROLER1);
var AI_CONTROLER2 = new Ai_Controlder(CONTROLER2);


var TEAM = [
    {
        color: [255, 0, 0],
        team: CONTROLER1,
        _id_: 0,
        get ID() { return this._id_++ }
    },
    {
        color: [0, 255, 0],
        team: CONTROLER2,
        _id_: 1000000,
        get ID() { return this._id_++ }
    },
];

TEAM[-1] = {
    color: [255, 255, 255],
    _id_: 2000000,
    get ID() { return this._id_++ }
}








// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { USER_CONTROLER });

export { AI_CONTROLER2, Ai_Controlder, CONTROLER, CONTROLER1, CONTROLER2, TEAM, Team_Controler, USER_CONTROLER, User_Controler };
