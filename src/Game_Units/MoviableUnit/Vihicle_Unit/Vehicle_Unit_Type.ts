import { GAME_OBJECT } from "../../../Game_object_All";
import { GRID } from "../../../GRID";
import { STATE, STATE_PLUS } from "../../../jsHelper";
import { UnitRegistryClass } from "../../../UnitRegistry";
import { calcfar, sort_unique } from "../../../utils";
import { Vehicle_unit } from "./Vihicle_Unit"


export const VEHICLE_TYPE = {};

window.VEHICLE_TYPE = VEHICLE_TYPE

VEHICLE_TYPE.veh_ore_allied = {
    name: "veh_ore_allied",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/OREREFINERY/",
        normal: { path: "img", from: 1, to: 8 },
        margin: { x: 45, y: 35 },
    },
    property: {
        shield: { _1: Infinity, _2: 350, _3: 350, _4: 350 },
        life: 200,
        cost: 1150,
        speed: 4,
        sight: 6,
    },
    class: class extends Vehicle_unit {
        constructor(x, y, z, team, property) {
            super(x, y, z, team, property);
            this.stateplus = STATE_PLUS.WAIT2WORK;
            this.workpoint = null;
            this.homepoint = null;
            this.heapmine = null;
            this.total_quatity = 0;
            this.force_workpoint = false;
            this.force_homepoint = false;
        }

        init() {
            super.init();
            this.changetostateplus(STATE_PLUS.WAIT2WORK);
        }

        process(time) {
            switch (this.stateplus) {
                case STATE_PLUS.WAIT2WORK:
                    if (TEAM[this.team].team.list_refinery.length > 0) {
                        if (this.total_quatity > 20)
                            this.changetostateplus(STATE_PLUS.MOVE2HOMEPOINT);
                        else
                            this.changetostateplus(STATE_PLUS.MOVE2WORKPOINT);
                        return;
                    }
                    break;
                case STATE_PLUS.MOVE2WORKPOINT:
                    if (this.check_netxpoint() && this.fartogoal < 1.5 && this.group && this.group.grid) {
                        this.changetostateplus(STATE_PLUS.FINDHEAPMINE);
                        return;
                    } else if (this.check_netxpoint() && this.homepoint && this.homepoint.state == STATE.DELETE) {
                        this.changetostateplus(STATE_PLUS.WAIT2WORK);
                        return;
                    }
                    break;
                case STATE_PLUS.FINDHEAPMINE:
                    if (this.check_netxpoint() && this.heapmine) {
                        if (Math.abs(this.nx - this.heapmine.x) <= 1 && Math.abs(this.ny - this.heapmine.y) <= 1) {
                            this.changetostateplus(STATE_PLUS.WORKPENDING);
                            return;
                        }
                    } else if (this.check_netxpoint() && this.homepoint && this.homepoint.state == STATE.DELETE) {
                        this.changetostateplus(STATE_PLUS.WAIT2WORK);
                        return;
                    }
                    if (this.state == STATE.IDLE)
                        this.changetostate(STATE.MOVE);
                    break;
                case STATE_PLUS.WORKPENDING:
                    this.total_quatity += this.heapmine.on_mine(time);
                    if (this.total_quatity > 20) {
                        this.changetostateplus(STATE_PLUS.MOVE2HOMEPOINT);
                        return;
                    } else if (this.heapmine.quatity < 0.05) {
                        this.changetostateplus(STATE_PLUS.FINDHEAPMINE);
                        return;
                    }
                    break;
                case STATE_PLUS.MOVE2HOMEPOINT:
                    if (this.check_netxpoint() && this.homepoint) {
                        if (this.check_netxpoint() && this.homepoint.state == STATE.DELETE) {
                            this.changetostateplus(STATE_PLUS.WAIT2WORK);
                            return;
                        } else if (this.nx == this.homepoint.work_point.x && this.ny == this.homepoint.work_point.y) {
                            this.changetostateplus(STATE_PLUS.HOMEPENDING);
                            return;
                        }
                    }
                    break;
                case STATE_PLUS.HOMEPENDING:
                    this.total_quatity -= (50 * time / 60);
                    TEAM[this.team].team.money += (50 * time / 60) * 50;

                    if (this.total_quatity <= 0) {
                        this.changetostateplus(STATE_PLUS.MOVE2WORKPOINT);
                        this.total_quatity = 0;
                        //console.log("GOOOOOLD RECIVE !!!!!!!!!!!!!!!!!!!!");
                        return;
                    }
                    break;
                case STATE_PLUS.IDLE:


                    break;
            }
            super.process(time);
        }

        find_next_point() {
            switch (this.stateplus) {
                case STATE_PLUS.FINDHEAPMINE:
                    var heapmine = this.find_heapmine();
                    this.heapmine = heapmine;
                    if (!heapmine) {
                        this.changetostateplus(STATE_PLUS.MOVE2WORKPOINT);
                        break;
                    }

                    var height = GRID.heightmap[this.nx * GRID.dim + this.ny] || -10;
                    var direct = MOVEABLE_UNIT.get_direction_idx(heapmine.x - this.x, heapmine.y - this.y);
                    var list_direct = [0, 1, -1, 2, -2];
                    for (var i of list_direct) {
                        var direct_ = (direct + i + 7) % 8 + 1;
                        var directtmp = window.MOVEABLE_UNIT.idx_xy_map_round[direct_];
                        if (GRID.check_moveable(this.nx + directtmp.x, this.ny + directtmp.y, height))
                            return { x: this.nx + directtmp.x, y: this.ny + directtmp.y };
                    }
                    return null;
                    break;
            }
            return super.find_next_point();
        }

        find_heapmine() {
            if (this.workpoint) {
                var point, far = 10000;
                for (var e of this.workpoint.grouph.list_ceil) {
                    var distance = calcfar(e, this);
                    if (distance < far && e.quatity > 0.5) {
                        far = distance;
                        point = e;
                    }
                }
                return point;
            }
        }

        find_work_point() {
            var max = 100000, result = null;
            /*
            for(var e of GAME_OBJECT.list_mine) {
                if (e.get_remain_heamine() < 20)
                    continue;
                var grid = e.get_grid();
                if (!grid)
                    continue;
                var ceil = grid[Math.round(this.x) * GRID.dim + Math.round(this.y)];
                if (ceil && ceil.l < max) {
                    result = e;
                    max = ceil.l;
                }
            }     */
            for (var e of sort_unique(GAME_OBJECT.list_mine.map(e => e.grouph))) {
                if (e.get_quatity() * 4 <= e.get_total_quatity())
                    continue;
                var grid = e.list_mine[0].get_grid();
                if (!grid)
                    continue;
                var ceil = grid.get(Math.round(this.x) * GRID.dim + Math.round(this.y));
                if (ceil && ceil.l < max) {
                    result = e.list_mine[0];
                    max = ceil.l;
                }
            }
            return result;
        }

        find_home_point() {
            var list = GAME_OBJECT.listgameunit[this.team].filter(e => e instanceof window.CONSTRUCTION_TYPE.con_refinery_allied.class);
            var max = 100000, result = null;
            for (var e of list) {
                var grid = e.get_grid(), ceil = grid.get(Math.round(this.x) * GRID.dim + Math.round(this.y));
                if (ceil && ceil.l < max) {
                    result = e;
                    max = ceil.l;
                }
            }
            return result;
        }

        on_con_refinery_allied_build_done() {

        }

        changetostateplus(stateplus) {
            this.stateplus = stateplus;
            switch (stateplus) {
                case STATE_PLUS.WAIT2WORK:
                    this.workpoint = null;
                    this.homepoint = null;
                    this.force_workpoint = false;
                    this.force_homepoint = false;
                    break;
                case STATE_PLUS.MOVE2WORKPOINT:
                    if (!this.force_workpoint)
                        this.workpoint = this.find_work_point();
                    if (this.workpoint) {
                        this.group = this.workpoint.get_grouph_move();
                        this.goal = this.workpoint;
                        this.fartogoal = 999999;
                        this.changetostate(STATE.MOVE);
                    } else {
                        this.changetostateplus(STATE_PLUS.WAIT2WORK);
                    }
                    break;
                case STATE_PLUS.MOVE2HOMEPOINT:
                    //if (!this.homepoint)
                    if (!this.force_homepoint)
                        this.homepoint = this.find_home_point();
                    if (this.homepoint) {
                        this.group = this.homepoint.get_grouph_move();
                        this.goal = this.homepoint;
                        this.fartogoal = 999999;
                        this.changetostate(STATE.MOVE);
                    } else {
                        this.changetostateplus(STATE_PLUS.WAIT2WORK);
                    }
                    break;
                case STATE_PLUS.FINDHEAPMINE:
                    this._last_time_active_ = performance.now();
                    this.heapmine = null;
                    break;
                case STATE_PLUS.WORKPENDING:
                    this.state = STATE.IDLE;
                    this.headangel = window.MOVEABLE_UNIT.getangelmove(this.heapmine, this);
                    break;
                case STATE_PLUS.HOMEPENDING:
                    //this.changetostate(STATE.IDLE);
                    this.state = STATE.IDLE;
                    this.headangel = window.MOVEABLE_UNIT.getangelmove(this, this.homepoint);
                    break;
                case STATE_PLUS.IDLE:
                    this.changetostate(STATE.IDLE);
                    //this.state = STATE.IDLE;
                    break;
            }
        }


        check_goal() {
            switch (this.stateplus) {
                case STATE_PLUS.FINDHEAPMINE:
                    return false;
                default:
                    return super.check_goal();
            }
        }

        command(command) {
            switch (command.com) {
                case "set":
                    if (!command.ob)
                        return;
                    if (command.ob instanceof Heap_mine) {
                        this.workpoint = command.ob.mine;
                        this.force_workpoint = true;
                        this.changetostateplus(STATE_PLUS.MOVE2WORKPOINT);
                    } else if (command.ob instanceof Mine) {
                        this.workpoint = command.ob;
                        this.force_workpoint = true;
                        this.changetostateplus(STATE_PLUS.MOVE2WORKPOINT);
                    } else if (command.ob.property == CONSTRUCTION_TYPE.con_refinery_allied && command.ob.team == this.team) {
                        this.homepoint = command.ob;
                        this.force_homepoint = true;
                        this.changetostateplus(STATE_PLUS.MOVE2HOMEPOINT);
                    }
                    break;
                case "auto":
                    this.changetostateplus(STATE_PLUS.WAIT2WORK);
                    break;
                case "move":
                    this.changetostateplus(STATE_PLUS.IDLE);
                    super.command(command);
                    break;
                default:
                    super.command(command);
                    break;
            }
        }

    },
    require: ["con_refinery_allied"]
}


VEHICLE_TYPE.veh_rhi_soviet = {
    name: "veh_rhi_soviet",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/RHINOTANK/",
        normal: { path: "img1", from: 1, to: 8 },
        direct: { path: "img2", from: 1, to: 8 },
        margin: { x: 37, y: 35 },
    },
    audio: {
        build: "Audio/uplace.wav",
        run: null,
        select: null,
        attack: null,
        destroy: null,
    },
    property: {
        shield: { _1: Infinity, _2: 100, _3: 100, _4: 100 },
        life: 100,
        cost: 900,
        speed: 5,
        attack_type: "attack_cannon",
        attack_time: 90,
        attack_dam: 7.5,
        range: 8,
        sight: 8,
    },
}


VEHICLE_TYPE.veh_ifv_allied = {
    name: "veh_ifv_allied",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/IFV/",
        normal: { path: "aaa", from: 1, to: 8 },
        direct: { path: "ccc", from: 1, to: 8 },
        margin: { x: 11 + 30, y: 36 },
    },
    audio: {

    },
    property: {
        shield: { _1: 10000000, _2: 100, _3: 100, _4: 100 },
        life: 100,
        cost: 600,
        speed: 5,
        attack_type: "attack_rpg_fast",
        attack_time: 60,
        attack_dam: 3,
        range: 12,
        sight: 13,
        attack_air: true,
    },
    class: class extends Vehicle_unit {
        filter_enemy(ob) {
            if (ob instanceof VEHICLE_TYPE.veh_ore_allied.class)
                ob.__calc_tmp__ += 10000;
            else if (ob instanceof Construction_unit && !(ob instanceof Defender_Construction_unit))
                ob.__calc_tmp__ += 5000;
            return (ob instanceof Movealbe_unit || ob instanceof Construction_unit);
        }
    }
}


VEHICLE_TYPE.veh_prism_allied = {
    name: "veh_prism_allied",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/PRISM/",
        normal: { path: "aaa", from: 1, to: 8 },
        direct: { path: "ccc", from: 1, to: 8 },
    },
    audio: {
        build: "Audio/uplace.wav",
        run: null,
        select: null,
        attack: null,
        destroy: null,
    },
    property: {
        shield: { _1: Infinity, _2: 100, _3: 100, _4: 100 },
        life: 100,
        cost: 2000,
        speed: 4,
        attack_type: "attack_super_prims",
        //attack_type: "attack_prims",
        attack_time: 90,
        attack_height: 3.7,
        attack_dam: 10,
        range: 12,
        sight: 13
    },
    require: ["con_power_allied", "con_tech_allied"]
}


VEHICLE_TYPE.veh_tesla_soviet = {
    name: "veh_tesla_soviet",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/TESLATANK/",
        normal: { path: "img", from: 1, to: 8 },
        direct: { path: "imgur", from: 1, to: 8 },
        //margin: { x: 25, y: 21 },
    },
    audio: {
        build: "Audio/uplace.wav",
        run: null,
        select: null,
        attack: null,
        destroy: null,
    },
    property: {
        shield: { _1: Infinity, _2: 100, _3: 100, _4: 100 },
        life: 100,
        cost: 2000,
        speed: 4,
        attack_type: "attack_tesla",
        attack_time: 70,
        attack_dam: 10,
        range: 13,
        sight: 14,
    },
    require: ["con_power_allied", "con_tech_allied"]
}


VEHICLE_TYPE.veh_firetank = {
    name: "veh_firetank",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/FIRETANK/",
        normal: { path: "img", from: 1, to: 8 },
        margin: { x: 37, y: 35 },
    },
    audio: {
        run: null,
        select: null,
        attack: null,
        destroy: null,
    },
    property: {
        shield: { _1: Infinity, _2: 100, _3: 100, _4: 100 },
        life: 100,
        cost: 2000,
        speed: 5,
        attack_type: "attack_fire",
        attack_time: 20,
        attack_dam: 3,
        range: 6,
        sight: 8,
    },
    require: ["con_barracks_allied", "con_power_allied", "con_tech_allied"]
}


VEHICLE_TYPE.veh_mcv_allied = {
    name: "veh_mcv_allied",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/MCV/",
        normal: { path: "img", from: 1, to: 8 },
        margin: { x: 45, y: 35 },
    },
    audio: {
        build: "Audio/uplace.wav",
        run: null,
        select: null,
        attack: null,
        destroy: null,
    },
    property: {
        shield: { _1: Infinity, _2: 200, _3: 200, _4: 200 },
        life: 200,
        cost: 3000,
        speed: 3,
        sight: 7,
    },
    class: class extends Vehicle_unit {
        process(time) {
            super.process(time);
            if (this._change_to_building_ && this.check_netxpoint()) {
                var canbuild = this.check_area_for_construct();
                if (canbuild) {
                    var newunit = new window.CONSTRUCTION_TYPE.con_contruction_allied.class(
                        Math.round(this.x) - 0.5,
                        Math.round(this.y) - 0.5,
                        this.z,
                        this.team,
                        window.CONSTRUCTION_TYPE.con_contruction_allied
                    );
                    this.change_type(window.CONSTRUCTION_TYPE.con_contruction_allied.class, newunit);
                }
            }
        }
        command(command) {
            switch (command.com) {
                case "change":
                    this._change_to_building_ = true;
                    /*
                    var canbuild = this.check_area_for_construct();
                    if (canbuild) {
                        var newunit = new CONSTRUCTION_TYPE.con_contruction_allied.class(
                            Math.round(this.x) - 0.5,
                            Math.round(this.y) - 0.5,
                            this.z,
                            this.team,
                            CONSTRUCTION_TYPE.con_contruction_allied
                        );
                        this.change_type(CONSTRUCTION_TYPE.con_contruction_allied.class, newunit);
                    }  */
                    break;
                default:
                    this._change_to_building_ = false;
                    super.command(command);
                    break;
            }
        }
        check_area_for_construct() {
            //GRID.unset_object(this);
            var canbuild = GRID.check_area_for_construct(Math.round(this.x) - 0.5, Math.round(this.y) - 0.5, 4, 4, true);
            //GRID.set_object(this);
            return canbuild;
        }
    },
    can_change: true,
    require: ["con_garage_allied"]
}


VEHICLE_TYPE.veh_v3rocket = {
    name: "veh_v3rocket",
    type: "vehicle",
    img: {
        main_path: "IMG/Unit/Vehicle/V3ROCKET/",
        normal: { path: "img1", from: 1, to: 8 },
        normal2: { path: "img2", from: 1, to: 8 },
        margin: { x: 50, y: 50 },
    },
    audio: {

    },
    property: {
        shield: { _1: Infinity, _2: 30, _3: 30, _4: 30 },
        life: 200,
        cost: 3000,
        speed: 1.5,
        attack_time: 500,
        range: 20,
        sight: 8,
    },
    require: [],
    class: class extends Vehicle_unit {
        constructor(...args) {
            super(...args);
            this.hasrocket = true;
        }
        scan_enemy(list, range) {
            return null;
        }
        fire() {
            var newinstance = PLANE_UNIT_TYPE.rocket.get_object(this.x, this.y, this.z + 5, this.team, this.enemy);
            GAME_OBJECT.add_instance(newinstance);
            this.basesprite.changesprite(this.property.img.normal2.sprites[this.team]);

            this.hasrocket = false;
        }
        process(time) {
            super.process(time);
            if (!this.hasrocket && this.attackload > this.attackdone * 0.5) {
                this.hasrocket = true;
                this.basesprite.changesprite(this.property.img.normal.sprites[this.team]);
            }
        }
        attack(enemy) {
            super.attack(enemy);
        }
    }
}


