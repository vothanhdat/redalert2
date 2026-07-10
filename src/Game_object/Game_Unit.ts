import { LATE } from "../core/late";
import { TEAM } from "../Controler";
import { healthcontainer } from "../Game_Container";
import { GRID } from "./GRID";
import { GAME_OBJECT, Game_object, null_func } from "./Game_object";
import { STATE } from "../lib/JavaScript_helper";

/// <reference path="Game_object.js" />
"use strict";

var INDEX_TYPE = new (function () {
    var arr = {};
    var id = 1234;
    var object;
    this.get = function (string) {
        return arr[string] || (arr[string] = ++id);
    }
    this.init = function () {
        var object = {};
        Object.assign(object, LATE.CONSTRUCTION_TYPE, LATE.VEHICLE_TYPE, LATE.SOLIDER_TYPE, LATE.MAP_CONSTRUCTION_UNIT_TYPE, LATE.PLANE_UNIT_TYPE);
        for (var i in object) {
            this.get(i);
            this.get(object[i].type);
        }
        object = null;
    }
    this.map = function () {
        const index: Record<string, any> = {};
        Object.keys(arr).forEach(e => index[arr[e]] = e);
        return index;
    }
    this.info = function () {
        if (object)
            return object;
        object = {};
        Object.assign(object, LATE.CONSTRUCTION_TYPE, LATE.VEHICLE_TYPE, LATE.SOLIDER_TYPE, LATE.MAP_CONSTRUCTION_UNIT_TYPE, LATE.PLANE_UNIT_TYPE);
        for (var i in object) {
            const tmp: Record<string, any> = {};
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

class Game_unit extends Game_object {
    /** Marker sprite in the minimap's ParticleContainer; created by MINIMAP.set(). */
    minimap_sprite: any;
    /** Vision circle in the fog-of-war ParticleContainer; created by FOG_GRAPGICH.set(). */
    __hidesprite__: any;
    team: number;
    /** Unique id, drawn from the owning team's auto-incrementing counter. */
    ID: number;
    /** The unit-type definition from VEHICLE_TYPE / SOLIDER_TYPE / CONSTRUCTION_TYPE / ... */
    property: any;
    /** Snapshot handed to the AI worker; nulled when the unit changes type. */
    _data_: any;
    health: number;
    totalhealth: number;
    healthsprite: any;
    shield: any;
    /** Frames remaining before the unit expires; used by temporary units. */
    timelife: number;
    /** Current attack target. */
    enemy: any;
    /** Current move/attack destination. */
    goal: any;
    /** Selection group this unit belongs to, if any. */
    group: any;
    attackload: number;
    attackdam: number;
    /**
      Constructor for a new Game_unit
      @class Game_unit
      @param {Number} x - Options to initialize the component with
      @param {Number} y - Options to initialize the component with
      @param {Number} z - Options to initialize the component with
      @param {Number} team - Options to initialize the component with
      @param {Gameunit_Property} property - Options to initialize the component with
    */
    constructor(x, y, z, team, property) {
        super(x, y, z);
        this.totalhealth = property.property.life || 100000;
        this.health = this.totalhealth;
        this.shield = property.property.shield;
        this.attackdam = property.property.attack_dam;
        this.property = property;
        this.timelife = 0;
        this.attackload = 0;
        this.enemy = null;
        this.team = team;
        this.ID = TEAM[team].ID;
        this.minimap_sprite = null;
        this.__hidesprite__ = null;
        this.group = null;
        this.enemy = null;
        this.goal = null;
    }

    init() {
        super.init();
        GAME_OBJECT.map_id_unit[this.ID] = this;
        GRID.set_object(this);
        GRID.setfogmap(this);
        LATE.MINIMAP.add(this);
        GAME_OBJECT.listgameunit[this.team] && GAME_OBJECT.listgameunit[this.team].push(this);
        TEAM[this.team].team && TEAM[this.team].team.on_new_unit_ready(this);
        LATE.GAME_UNIT_INFO_GLOBAL.on_new_unit(this.ID);
    }

    delete () {


        GRID.unset_object(this);
        GRID.unsetfogmap(this);
        LATE.MINIMAP.remove(this);

        if (GAME_OBJECT.listgameunit[this.team]) {
            var idx = GAME_OBJECT.listgameunit[this.team].indexOf(this);
            (idx > -1) && GAME_OBJECT.listgameunit[this.team].splice(idx, 1);
        }
        LATE.GAME_UNIT_INFO_GLOBAL.on_delete_unit(this.ID);
        delete GAME_OBJECT.map_id_unit[this.ID];
        super.delete();

        var proto = Object.getPrototypeOf(this);
        do{
            for (var i in proto)
                this[i] = null_func;
        } while ((proto = Object.getPrototypeOf(proto)));

    }

    process(time) {
        super.process(time);
        this.timelife += time;
    }

    /** @description Call this method when this Unit be destroyed by attackobject
     * @param {Game_weapon} attackobject The Attack object cause destroy this Unit
     */
    on_attacked(attackobject) {
        TEAM[this.team].is_attack = true;
        if (this.health <= 0)
            this.on_destroy(attackobject);
    }

    /** @description Call this method when this Unit be destroyed by attackobject
     * @param {Game_weapon} attackobject The Attack object cause destroy this Unit
     */
    on_destroy(attackobject) {
        TEAM[this.team].team && (TEAM[this.team].team.on_unit_destroyed(this));
        this.delete();
        this.on_destroy = () => null;
    }

    /** @description Apply command for list game unit.
     * @param {Command} command The list of game unit.
     */
    command(command) {

    }

    changetostate(state) {
        this.state = state;
    }

    /** @description Attack an enemy
     * @param {Game_unit} enemy Enemy.
     */
    attack(enemy) {

    }

    display_health_point(onoff) {
        if (this.state == STATE.DELETE || !this.healthsprite)
            return;
        if (onoff)
            healthcontainer.addChild(this.healthsprite);
        else
            healthcontainer.removeChild(this.healthsprite);
    }



    check_choose(x, y) {

    }


    change_team(team) {
        if (team == this.team)
            return;

        GRID.unset_object(this);
        LATE.MINIMAP.remove(this);
        if (this.team != -1) {
            var idx = GAME_OBJECT.listgameunit[this.team].indexOf(this);
            (idx > -1) && GAME_OBJECT.listgameunit[this.team].splice(idx, 1);
            GRID.unsetfogmap(this);
        }

        this.team = team;

        if (this.team > -1)
            GAME_OBJECT.listgameunit[this.team].push(this);
        GRID.set_object(this);
        GRID.setfogmap(this);
        LATE.MINIMAP.add(this);
    }


    get_element_ceil() {
        var sizeproperty = this.property.property.size || { w: 1, h: 1 };
        var starx = Math.round(Math.max(0, this.x - sizeproperty.w / 2));
        var stary = Math.round(Math.max(0, this.y - sizeproperty.h / 2));
        var endx = Math.min(GRID.dim, this.x + sizeproperty.w / 2);
        var endy = Math.min(GRID.dim, this.y + sizeproperty.h / 2);
        var result = [];

        for (var i = starx; i <= endx; i++)
            for (var j = stary; j <= endy; j++) {
                result.push({ x: i, y: j });
            }
        return result;
    }


    scan_enemy() {
        return null;
    }


    filter_enemy() {
        return false;
    }


    /**
     * @param {Function} type
     * @param {Game_unit} newinstance
     * */
    change_type(type, newinstance) {
        newinstance.ID = this.ID;
        newinstance.health = this.health / this.totalhealth * newinstance.totalhealth;
        var is_display_health = (this.healthsprite && this.healthsprite.parent != null);
        this.delete();
        for (var i in this)
            delete this[i];
        Object.assign(this, newinstance);
        Object.setPrototypeOf(this, type.prototype);
        this._data_ = null;
        this.init();
        this.display_health_point(is_display_health);

    }


    set_data(array, idx, team) {
        var add = (team == this.team);
        array[idx + 0] = INDEX_TYPE.get(this.property.type);
        array[idx + 1] = INDEX_TYPE.get(this.property.name);
        array[idx + 2] = this.ID;
        array[idx + 3] = this.x;
        array[idx + 4] = this.y;
        array[idx + 5] = this.z;
        array[idx + 6] = this.team;
        array[idx + 7] = this.totalhealth;
        array[idx + 8] = this.health;
        array[idx + 9] = add && this.state;
    }


    get_data(team) {
        if (!this._data_) {
            this._data_ = {};
            this._data_.ID = this.ID;
            this._data_.totalhealth = this.totalhealth;
            this._data_.type = this.property.type;
            this._data_.name = this.property.name;
        }

        this._data_.x = this.x;
        this._data_.y = this.y;
        this._data_.z = this.z;
        this._data_.health = this.health;
        this._data_.team = this.team;
        if (this.team == team)
            this._data_.state = this.state;
        return this._data_;
    }


}


// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { Game_unit });

export { Game_unit, INDEX_TYPE };
