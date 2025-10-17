import { GAME_OBJECT } from "../../Game_object_All";
import { Game_unit } from "../../Game_Unit";
import { GRID } from "../../GRID";
import { STATE } from "../../jsHelper";
import { UnitRegistryClass } from "../../UnitRegistry";
import { calcfar2, calcfar2_full, checkcircle } from "../../utils";
import { Weapon } from "../Weapon/Weapon";
import { ATTACK_TYPE } from "../Weapon/Weapon_Type";


export const MOVEABLE_UNIT = {
    getangelmove: function (obsrc, obdis) {
        return Math.atan2(obdis.y - obsrc.y, obdis.x - obsrc.x);
    },
    getangeldraw: function (angel, max) {
        return Math.round((1.125 - angel / Math.PI / 2) * max) % max;
    },
    get_direction_idx: function (x, y) {
        var radian = Math.atan(x / y);
        if (y > 0)
            return Math.round(4 + (radian / Math.PI * 4))
        else if (y < 0)
            return Math.round(7 + (radian / Math.PI * 4)) % 8 + 1;
        else
            return (x > 0) ? 6 : 2;
    },
    idx_xy_map: {
        1: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
        2: { x: -1, y: 0 },
        3: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
        4: { x: 0, y: 1 },
        5: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
        6: { x: 1, y: 0 },
        7: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
        8: { x: 0, y: -1 }
    },
    idx_xy_map_round: {
        1: { x: -1, y: -1 },
        2: { x: -1, y: 0 },
        3: { x: -1, y: 1 },
        4: { x: 0, y: 1 },
        5: { x: 1, y: 1 },
        6: { x: 1, y: 0 },
        7: { x: 1, y: -1 },
        8: { x: 0, y: -1 }
    },
    incell_map: [
        { x: -0.25, y: -0.25 },
        { x: 0.25, y: -0.25 },
        { x: -0.25, y: 0.25 },
        { x: 0.25, y: 0.25 }
    ]
}

export class Movealbe_unit extends Game_unit {

};


export class Ground_moveable_unit extends Movealbe_unit {

    constructor(x, y, z, team, property) {
        super(Math.round(x), Math.round(y), z, team, property);
        this.nx = this.x;
        this.ny = this.y;
        this.angel = 0;
        this.group = null;
        this.enemy = null;
        this.v = property.property.speed;
        this.attackdone = property.property.attack_time;
        this.attackload = this.attackdone;
        this.height = property.property.attack_height || 2;
        this.ismoving = false;
        this.message_distination = null;
        this.fartogoal = 999999;
    }


    init() {
        super.init();
        this.changetostate(STATE.IDLE);
    }


    process(time) {
        super.process(time);
        if (this.group_protect && this._is_protect_area_ && this.state != STATE.DELETE) {
            this.process_clean_arear(time);
        }

        switch (this.state) {
            case STATE.IDLE:
                this.attackload += time;
                if (checkcircle(this.timelife, time, 30)) {
                    var enemy = this.scan_enemy();
                    if (enemy) {
                        this.changetostate(STATE.DEFENSE);
                        this.attack(enemy);
                    }
                }

                if (this.nx && this.ny && !this.check_netxpoint())
                    this.process_move(time);

                break;
            case STATE.MOVE2ATTACK:
                var range2 = Math.pow(this.property.property.range, 2);
                if (this._auto_command_ && this.check_netxpoint()) {
                    this._auto_command_ = false;
                    this.changetostate(STATE.IDLE);
                    break;
                }
                if (this.group && this.goal && this.check_netxpoint()) {
                    if (this.enemy.state == STATE.DELETE) {
                        this.changetostate(STATE.IDLE);
                        break;
                    }
                    if (calcfar2(this, this.enemy) <= range2) {
                        this.changetostate(STATE.ATTACK);
                        break;
                    }
                    if (this.enemy.state == STATE.MOVE || this.enemy.state == STATE.MOVE2ATTACK || this.enemy.state == STATE.MOVE2DEFENSE) {
                        var far = Math.sqrt(calcfar2(this, this.enemy)) + 3;
                        if (!this._is_protect_area_ && performance.now() - this.group.__last_time__ > 500 / GLOBAL.SPEED) {
                            GRID.get_grid_move_async(this.group, this.enemy, this.group.farest);
                            this.group.__last_time__ = performance.now();
                        }
                    }
                }
                // continue process STATE.MOVE
                // DO NOT PUT --->> break <<--- STATEMENT HERE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            case STATE.MOVE:
                this.attackload += time;
                this.ismoving = false;
                if (this._auto_command_ && this.check_netxpoint()) {
                    this._auto_command_ = false;
                    this.changetostate(STATE.IDLE);
                    break;
                }
                if (this.group && this.goal) {
                    var r = Math.round;
                    if (this._go_into_ && this.check_netxpoint() && !this._go_into_ob_.check_can_going_to(this)) {
                        this.changetostate(STATE.IDLE);
                    } else if (this._go_into_ && this.check_netxpoint() && GRID.get_around_tile(this).some(e => e == this._go_into_ob_)) {
                        this.go_into(this._go_into_ob_);
                    } else if (this.check_netxpoint() && this.check_goal()) {
                        this.goal.count ? (this.goal.count++) : (this.goal.count = 1);
                        this.on_command_done();
                    } else if ((!this.nx || !this.ny) || this.check_netxpoint()) {
                        this.set_nextpoint();
                    }
                } else if (this.move_message) {
                    if (this.check_netxpoint()) {
                        this.changetostate(STATE.IDLE);
                        this.move_message = false;
                    }
                }

                if (this.nx && this.ny)
                    this.process_move(time);
                break;
            case STATE.ATTACK:
                this.attackload += time;
                if (this._auto_command_) {
                    this._auto_command_ = false;
                    this.changetostate(STATE.IDLE);
                    break;
                }
                if (this.enemy.state == STATE.DELETE) {
                    this.on_command_done();
                    break;
                }
                if (this.enemy && calcfar2(this, this.enemy) > Math.pow(this.property.property.range, 2)) {
                    this.changetostate(STATE.MOVE2ATTACK);
                } else if (this.attackload >= this.attackdone) {
                    this.attackdone = this.property.property.attack_time * (0.7 + 0.6 * Math.random());
                    this.attackload = 0;
                    this.fire();
                }
                break;
            case STATE.DEFENSE:
                this.attackload += time;
                if (this.enemy.state == STATE.DELETE) {
                    this.changetostate(STATE.IDLE);
                    break;
                }
                if (this.enemy && calcfar2(this, this.enemy) > Math.pow(this.property.property.range, 2)) {
                    this.changetostate(STATE.IDLE);
                } else if (this.attackload >= this.attackdone) {
                    this.attackdone = this.property.property.attack_time * (0.8 + 0.4 * Math.random());
                    this.attackload = 0;
                    this.fire();
                }
                break;

        }

        if (this.message) {
            this.process_message(this.message);
            this.message = null;
        }

    }


    process_clean_arear(time) {
        var pos = this.group_protect.pos;
        var radius2 = this.group_protect.radius * this.group_protect.radius;

        //Process for Grouph
        if (performance.now() - this.group_protect._time_ > 700 / GLOBAL.SPEED) {
            this.group_protect._time_ = performance.now();
            this.group_protect.list = this.group_protect.list.filter(e => e.state != STATE.DELETE);
            var far2 = Math.max.apply(Math, this.group_protect.list.map(e => calcfar2(e, pos)));
            this.group_protect.farest = Math.sqrt(Math.max(radius2, far2));
            var list = GAME_OBJECT.listgameunit[1 - this.team].filter(function (e) {
                return e && (e instanceof Game_unit) && calcfar2(e, pos) <= radius2;
            });
            this.group_protect.goal = this.group_protect.pos;
            if (list.length > 0) {
                this.group_protect.listgoal = list.filter(e => (e.property.name != "veh_ore_allied") && !(e instanceof Flyable_Unit));
                if (this.group_protect.listgoal.length == 0)
                    this.group_protect.listgoal = list;
                GRID.get_grid_move_async(this.group_protect, this.group_protect.listgoal, this.group_protect.farest);
            } else {
                if (this.group_protect.listgoal)
                    GRID.get_grid_move_async(this.group_protect, this.group_protect.pos, this.group_protect.farest);
                this.group_protect.listgoal = null;
            }

        }

        //Process for self
        this.group = this.group_protect;
        this.goal = { x: 0, y: 0 };
        if (checkcircle(this.timelife, time, 15)) {

            if (this.group.listgoal) {
                var enemy = this.scan_enemy(this.group.listgoal);
                if (enemy) {
                    this.enemy = enemy;
                    this.goal = { x: 0, y: 0 };
                    if (this.state != STATE.ATTACK && this.state != STATE.MOVE2ATTACK)
                        this.changetostate(STATE.MOVE2ATTACK);
                } else {
                    this.goal = { x: 0, y: 0 };
                    this.changetostate(STATE.MOVE);
                }
            } else {
                if (this.state != STATE.MOVE) {
                    this.goal = { x: 0, y: 0 };
                    this.changetostate(STATE.MOVE);
                }
            }
        }
    }

    /**
     * @param {Game_unit} ob
     * */
    go_into(ob) {
        if (ob.on_going_to && ob.check_can_going_to(this)) {
            ob.on_going_to(this);
            this.back_up = {};
            for (var i in this.__proto__)
                this.back_up[i] = this[i];
            this.delete();
        }
    }

    /**
     * @param {Game_unit} ob
     * 
     * */
    go_back(ob) {
        this.state = STATE.IDLE;
        for (var i in this.back_up)
            this[i] = this.back_up[i];
        delete this.back_up;
        GAME_OBJECT.add_instance(this);
    }


    on_command_done() {
        var next_command = null;
        if (this.group && this.group.next_command)
            next_command = this.group.next_command;
        if (this.state == STATE.MOVE)
            TEAM[this.team].team.on_move_done(this);
        this.changetostate(STATE.IDLE);
        if (next_command) {
            this.command(next_command);
        }
    }


    process_move(time, ax, ay) {
        ax = ax || 0;
        ay = ay || 0;
        var v = time * this.v / 60,
             dx = ax + this.nx - this.x,
             dy = ay + this.ny - this.y;
        var direct_idx = window.MOVEABLE_UNIT.get_direction_idx(dx, dy);
        var posp = window.MOVEABLE_UNIT.idx_xy_map[direct_idx];
        if (Math.abs(posp.x * v) > Math.abs(dx) || Math.abs(posp.y * v) > Math.abs(dy)) {
            this.x = this.nx + ax;
            this.y = this.ny + ay;
            this.z = GRID.heightmap[this.nx * GRID.dim + this.ny];
        } else {
            if (this.bx && this.by) {
                var z1 = GRID.heightmap[this.bx * GRID.dim + this.by];
                var z2 = GRID.heightmap[this.nx * GRID.dim + this.ny];
                var r = Math.min(1, Math.abs(dx || dy || 0));
                if ((z2 - z1) > 0)
                    v *= 0.5;
                this.z = z1 * r + z2 * (1 - r);
            }
            this.x += posp.x * v;
            this.y += posp.y * v;

        }
        if (dx || dy)
            this.ismoving = true;

    }


    filter_enemy(ob) {
        if (ob instanceof window.VEHICLE_TYPE.veh_ore_allied.class)
            ob.__calc_tmp__ += 10000;
        else if (ob instanceof UnitRegistryClass['Construction_unit'] && !(ob instanceof UnitRegistryClass['Defender_Construction_unit']))
            ob.__calc_tmp__ += 5000;
        return (ob instanceof UnitRegistryClass['Ground_moveable_unit'] || ob instanceof UnitRegistryClass['Construction_unit']);
    }


    scan_enemy(list, range) {
        var range2 = Math.pow(range || this.property.property.range, 2),
            max = Infinity,
            enemy = null,
            listob = list || GAME_OBJECT.listgameunit[1 - this.team];

        var list_check = listob
            .filter(e => e.team != this.team && (e.__calc_tmp__ = calcfar2_full(e, this)) < range2)
            .filter(this.filter_enemy);
        for (var e of list_check) {
            if (e.__calc_tmp__ < max) {
                max = e.__calc_tmp__;
                enemy = e;
            }
        }
        return enemy;
    }


    find_next_point() {
        var grid = this.group.grid;
        if (!grid)
            return null;
        var tmpgrid = grid.get(this.nx * GRID.dim + this.ny);
        var min_l = Math.min(tmpgrid ? tmpgrid.l : 6000, 6000),
            min_l_2 = 6000,
            temp = null;

        var height = GRID.heightmap[this.nx * GRID.dim + this.ny] || -10;
        for (var i = -1; i < 2; i++) for (var j = -1; j < 2; j++) if (i || j) {
            var x = this.nx + i, y = this.ny + j;
            var ceil = grid.get(x * GRID.dim + y);
            var l = ceil ? ceil.l : 9999999;
            if (l <= min_l
                && GRID.check_moveable(x, y, height, this)
                && this.check_cross_move(i, j)) {
                min_l = l;
                temp = { x, y };
            } else if (l < min_l_2
                && GRID.checkcanmove(x, y, height)
                && GRID.get_tile_count(x, y) > 0) {
                min_l_2 = l;
                this.message_distination = { x, y };
            }
        }
        return temp;
    }


    set_nextpoint() {
        if ((!this.nx || !this.ny)) {
            this.nx = Math.round(this.x);
            this.ny = Math.round(this.y);
        } else if (this.nx && this.ny) {
            this.message_distination = null;
            var next = this.find_next_point();
            if (next) {
                this.move_to_point(next);
            } else if (this.message_distination) {
                var direct = MOVEABLE_UNIT.get_direction_idx(
                    this.message_distination.x - this.nx,
                    this.message_distination.y - this.ny
                    );
                this.send_message({ type: "outway", direct: direct }, this.message_distination.x, this.message_distination.y);
            }
        }
    }


    move_to_point(p) {
        this.angel = MOVEABLE_UNIT.getangelmove(p, this);
        GRID.move_object(this, this.nx, this.ny, p.x, p.y);
        GRID.setmovefogmap(this, this.nx, this.ny, p.x, p.y);
        // Save Move History
        this.bx = this.nx;
        this.by = this.ny;
        // Set new point
        this.nx = p.x;
        this.ny = p.y;

        this.fartogoal = (this.group
            && this.group.grid
            && this.group.grid.get(this.nx * GRID.dim + this.ny)
            && this.group.grid.get(this.nx * GRID.dim + this.ny).l) || 0;
    }


    // Fix unit cross over
    check_cross_move(i, j) {
        return true;
        if (!i || !j)
            return true;
        var pos1_axis = { x: this.nx, y: this.ny + j };
        var pos2_axis = { x: this.nx + i, y: this.ny };

        var pos1 = GRID.objectmap[pos1_axis.x * GRID.dim + pos1_axis.y];
        var pos2 = GRID.objectmap[pos2_axis.x * GRID.dim + pos2_axis.y];
        if (pos1.length && pos2.length)
            return false;
        else if (!pos1.length && !pos2.length)
            return true;
        var pos_end = pos1.length ? pos1[0] : pos2[0];
        var pos_start = pos1.length ? pos2_axis : pos1_axis;
        if (pos_end.bx == pos_start.x && pos_end.by == pos_start.y) {
            //console.log("CROSSSSSSSSSSSSSSSSSs");
            return false;
        }
        return true;
    }


    check_netxpoint() {
        //console.log(this.nx == this.x && this.ny == this.y, this.nx, this.x, this.ny, this.y);
        return (this.nx == this.x && this.ny == this.y)
    }


    changetostate(state) {
        super.changetostate(state);
        switch (this.state) {
            case STATE.MOVE2ATTACK:
                this.goal = this.enemy;
                break;
            case STATE.ATTACK:

                break;
            case STATE.MOVE:
                this.enemy = null;
                break;
            case STATE.IDLE:
                this.enemy = null;
                this.group = null;
                this.goal = null;
                this.fartogoal = 999999;
            case STATE.DEFENSE:
                this.attackload = this.property.property.attack_time;
                break;

        }
    }


    /** @description Attack an enemy
     * @param {Game_unit} enemy Enemy.
     */
    attack(enemy) {
        this.enemy = enemy;
    }


    /** @description Shoot enemy
     */
    fire() {
        this.enemy && GAME_OBJECT.add_instance(new Weapon(this, this.enemy, ATTACK_TYPE[this.property.property.attack_type]));
    }


    /** @description Apply command for list game unit.
     * @override
     * @param {Command} command The list of game unit.
     */
    command(command) {
        super.command(command);
        this.next_command = command.next_command;

        this._is_protect_area_ = false;
        this.group_protect = null;
        this._go_into_ = false;
        this._go_into_ob_ = null;

        switch (command.com) {

            case "protect_area":
                if (command.group) {
                    this._is_protect_area_ = true;
                    this.group_protect = command.group;
                    if (!this.group_protect._time_) {
                        this.group_protect._time_ = performance.now();
                        this.group_protect.listgoal = [];
                    }
                }
                break;
            case "auto":
                this._auto_command_ = true;
                break;
            case "gointo":
                if (command.ob.check_can_going_to && command.ob.check_can_going_to(this)) {
                    this._go_into_ = true;
                    this._go_into_ob_ = command.ob;
                } else
                    break;
            case "move":
                if (command.group) {
                    this.group = command.group;
                    this.goal = command.goal;

                    if (!command.group.has_run) {
                        command.group.has_run = true;
                        GRID.get_grid_move_async(command.group, command.goal, command.group.farest);
                    }
                    this.changetostate(STATE.MOVE);
                }

                break;
            case "attack":
                if (command.group) {
                    this.group = command.group;
                    this.group.enemy = command.enemy;
                    this.enemy = command.enemy;

                    if (!command.group.has_run) {
                        command.group.has_run = true;
                        GRID.get_grid_move_async(command.group, command.enemy, command.group.farest);
                        command.group.__last_time__ = performance.now();
                    }

                    this.changetostate(STATE.MOVE2ATTACK);

                }
                break;
        }

    }


    find_next_point_with_message(message, esc) {
        var direct = message.direct;
        var sender = message.parent;
        var height = GRID.heightmap[this.nx * GRID.dim + this.ny] || -10;
        var arr = esc ? [1, -1, 2, -2, 3, -3] : [0, 1, -1, 2, -2, 3, -3];
        var team = this.team;
        var This = this;
        for (var i = 0; i < arr.length; i++) {
            var direct_ = (direct + arr[i] + 7) % 8 + 1;
            var directtmp = window.MOVEABLE_UNIT.idx_xy_map_round[direct_];
            var x = Math.round(this.x + directtmp.x),
                y = Math.round(this.y + directtmp.y);
            if (GRID.check_moveable(x, y, height, this))
                return { stat: "move", x, y };
        }

        for (var i = 0; i < arr.length; i++) {
            var direct_ = (direct + arr[i] + 7) % 8 + 1;
            var directtmp = window.MOVEABLE_UNIT.idx_xy_map_round[direct_];

            var x = Math.round(this.x + directtmp.x),
                y = Math.round(this.y + directtmp.y);
            if (GRID.checkcanmove(x, y, height)
                 && GRID.objectmap[x * GRID.dim + y].some(e => (e.team == team && e != sender)))
                return { stat: "send", x, y };
        }
    }


    send_message(message, x, y) {
        message.parent = this;
        for(var e of GRID.objectmap[x * GRID.dim + y]) {
            if (e.team == this.team && e instanceof Movealbe_unit)
                e.message = message;
        }
    }


    process_message(message) {
        switch (this.state) {
            case STATE.IDLE:
            case STATE.DEFENSE:
                switch (message.type) {
                    case "goahead":
                    case "outway":
                        var option = {
                            "outway": [true, message.direct % 8 + 1],
                            "goahead": [false, message.direct]
                        }
                        var next = this.find_next_point_with_message(message, option[message.type][0]);
                        if (!next) {
                            //console.log("Can't find path or send message");
                        } else if (next.stat == "move") {
                            this.move_message = true;
                            this.move_to_point(next);
                            this.changetostate(STATE.MOVE);
                        } else if (next.stat == "send") {
                            this.send_message({ type: "goahead", direct: option[message.type][1] }, next.x, next.y);
                        }
                        break;
                }
                break;
            case STATE.ATTACK:
                switch (message.type) {
                    case "goahead":
                    case "outway":
                        var option = {
                            "outway": [false, message.direct],
                            "goahead": [false, message.direct]
                        }
                        var next = this.find_next_point_with_message(message, option[message.type][0]);
                        if (!next) {
                            //console.log("Can't find path or send message");
                        } else if (next.stat == "move") {
                            this.move_message = true;
                            this.move_to_point(next);
                            this.changetostate(STATE.MOVE2ATTACK);
                        } else if (next.stat == "send") {
                            this.send_message({ type: "goahead", direct: option[message.type][1] }, next.x, next.y);
                        }
                        break;

                }
                break;
            case STATE.MOVE:
            case STATE.MOVE2ATTACK:
                break;
        }

    }


    check_choose(x, y) {
        return this.pos && Math.abs(this.pos.x - x) <= 30 && Math.abs(this.pos.y - y - 3) <= 15;
    }


    check_goal(delta) {
        var dx = Math.abs(this.x - this.goal.x),
            dy = Math.abs(this.y - this.goal.y);
        if (dx + dy < 0.9)
            return true;
        else if (GRID.get_tile_count(this.goal.x, this.goal.y) > 0 && dx < 2 && dy < 2) {
            if (dx + dy == 1)
                return true;
            if (GRID.get_tile_count(this.goal.x + 1, this.goal.y) > 0
                && GRID.get_tile_count(this.goal.x - 1, this.goal.y) > 0
                && GRID.get_tile_count(this.goal.x, this.goal.y + 1) > 0
                && GRID.get_tile_count(this.goal.x, this.goal.y - 1) > 0) {
                if (dx == 1 && dy == 1)
                    return true;
            }
        }
        return (this.goal.x == this.x && this.goal.y == this.y)
            || (calcfar2(this.goal, this) < this.goal.count * (delta || 1.3));
    }


    set_data(array, idx, team) {
        var add = (team == this.team);
        super.set_data(array, idx, team)
        array[idx + 10] = add && this.goal && this.goal.x;
        array[idx + 11] = add && this.goal && this.goal.y;
        array[idx + 12] = add && this.enemy && this.enemy.x;
        array[idx + 13] = add && this.enemy && this.enemy.y;
        array[idx + 14] = add && this.enemy && this.enemy.ID;
    }


    get_data(team) {
        super.get_data(team);
        if (this.team == team) {
            this._data_.goal = this.goal && { x: this.goal.x, y: this.goal.y };
            this._data_.enemyID = this.enemy && (this.enemy.ID || { x: this.enemy.x, y: this.enemy.y });
        }
        return this._data_;
    }

}

UnitRegistryClass["Movealbe_unit"] = Movealbe_unit
UnitRegistryClass["Ground_moveable_unit"] = Ground_moveable_unit
window.MOVEABLE_UNIT = MOVEABLE_UNIT




