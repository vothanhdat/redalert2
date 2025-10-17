import { Solider_unit } from "./Solider_Unit";

var SOLIDER_AUDIO_TYPE = {
    die0: "Audio/igidia.wav",
    die1: "Audio/igidib.wav",
    die2: "Audio/igidic.wav",
    die3: "Audio/igidid.wav",
    mov: "Audio/igimoa.wav",
}

export const SOLIDER_TYPE = {};


SOLIDER_TYPE.sol_gi_allied = {
    name: "sol_gi_allied",
    type: "solider",
    img: {
        main_path: "IMG/Unit/Solider/GI/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        attack: { path: "shot1/img", from: 1, to: 48, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 4 },
        change: { path: "change/img", from: 1, to: 15, step: 1 / 2 },
        attack_fix: { path: "shot2/img", from: 1, to: 48, step: 1 / 3 },
        fix: { path: "normal2/img", from: 1, to: 8, step: 1 / 3 },
        drop: { path: "drop/img", from: 1, to: 1, step: 1 / 3 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [
                { start: 1, end: 15, direct: 4 },
                { start: 16, end: 30, direct: 5 }
            ]
        },
        die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
        margin: { x: 26, y: 31 }
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE,
        sel: "Audio/igisea.wav",
        tofix: "Audio/igidepa.wav",
        unfix: "Audio/igidepb.wav",

    },
    property: {
        size: { w: 1, h: 1, h_: 1 },
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        has_fix: true,
        life: 100,
        cost: 200,
        speed: 2,
        attack_type: "attack_piff",
        attack_type_fix: "attack_submachine",
        attack_time: 30,
        attack_dam: 6,
        attack_time_fix: 30,
        attack_dam_fix: 10,
        range: 6,
        sight: 8,
        range_fix: 8
    },
    require: ["con_barracks_allied"],
    can_change: true,
    can_go_into_building: true,
    class: class extends Solider_unit {
        init() {
            super.init();
            this.frame_change = 0;
        }


        fire() {
            if (this.state == STATE.FIX || this.state == STATE.ATTACK_FIX) {
                this.firing = true;
                this.frameidx = 0;
                this.property.img.attack_fix && this.sprite.changesprite(this.property.img.attack_fix.sprites[this.team]);
                this.enemy && GAME_OBJECT.add_instance(new Weapon(this, this.enemy, ATTACK_TYPE[this.property.property.attack_type_fix]));
            } else {
                super.fire();
            }
        }

        process(time) {
            super.process(time);
            switch (this.state) {
                case STATE.FIX:
                    if (checkcircle(this.timelife, time, 30)) {
                        var enemy = this.scan_enemy(null,this.property.property.range_fix);
                        if (enemy) {
                            this.changetostate(STATE.ATTACK_FIX);
                            this.attack(enemy);
                        }
                    }
                    break;
                case STATE.ATTACK_FIX:
                    this.attackload += time;
                    if (this._auto_command_) {
                        this._auto_command_ = false;
                        this.changetostate(STATE.FIX);
                        break;
                    }
                    if (this.enemy.state == STATE.DELETE) {
                        this.changetostate(STATE.FIX);
                        break;
                    }
                    if (this.enemy && calcfar2(this, this.enemy) > Math.pow(this.property.property.range_fix, 2)) {
                        this.changetostate(STATE.FIX);
                    } else if (this.attackload >= this.attackdone) {
                        this.attackdone = this.property.property.attack_time_fix * (0.7 + 0.6 * Math.random());
                        this.attackload = 0;
                        this.fire();
                    }
                    if (this.firing && this.attackload > this.fireframenumber || 0) {
                        this.firing = false;
                        this.sprite && this.sprite.changesprite(this.property.img.fix.sprites[this.team]);
                    }
                    break;
                case STATE.CHANGE2FIX:
                    this.frame_change += time * this.property.img.change.step;
                    if (this.frame_change >= this.sprite.sprites.length)
                        this.changetostate(STATE.FIX);
                    this.frame_change = Math.min(this.sprite.sprites.length - 0.01, this.frame_change);
                    break;
                case STATE.CHANGE2NORMAL:
                    this.frame_change -= time * this.property.img.change.step;
                    if (this.frame_change <= 0) {
                        if (this._move_command_) {
                            this.command(this._move_command_);
                            this._move_command_ = false;
                        } else
                            this.changetostate(STATE.IDLE);
                    }
                    this.frame_change = Math.max(0, this.frame_change);
                    break;
                case STATE.MOVE:
                case STATE.MOVE2ATTACK:
                    if (this._change2fix_command_ && this.check_netxpoint()) {
                        this._change2fix_command_ = false;
                        this.changetostate(STATE.CHANGE2FIX);
                    }
                    break;
            }
        }

        changetostate(state) {
            
            if (this.state == STATE.DELETE)
                return;
            super.changetostate(state);
            
            switch (this.state) {
                case STATE.MOVE:
                case STATE.MOVE2ATTACK:
                case STATE.MOVEBACK:
                case STATE.IDLE:
                    break;
                case STATE.DEFENSE:
                case STATE.ATTACK:
                    this.fireframenumber = this.property.img.attack.sprites[this.team].length / 8;
                    this.wating = null;
                    break;
                case STATE.FIX:
                    this.enemy = null;
                case STATE.ATTACK_FIX:
                    this.fireframenumber = this.property.img.attack_fix.sprites[this.team].length / 8;
                    this.sprite.changesprite(this.property.img.fix.sprites[this.team]);
                    this.frameidx = 0;
                    break;
                case STATE.CHANGE2FIX:
                    this.sprite.changesprite(this.property.img.change.sprites[this.team]);
                    AUDIO.createsound(this.property.audio.tofix,this,0.15,3);
                    break;
                case STATE.CHANGE2NORMAL:
                    this.sprite.changesprite(this.property.img.change.sprites[this.team]);
                    AUDIO.createsound(this.property.audio.unfix,this,0.15,3);
                    break;
            }
        }

        draw() {
            super.draw();
            if (!check_available_screen(this.pos, 20, 20) || !GRID.check_availble_user_fogmap(this))
                return;
            var direction = Math.floor(MOVEABLE_UNIT.getangeldraw(this.angel, 8));
            switch (this.state) {
                case STATE.FIX:
                    this.sprite.changeframe(direction);
                    break;
                case STATE.ATTACK_FIX:
                    if (this.firing)
                        this.sprite.changeframe(direction * this.fireframenumber + Math.floor(this.attackload % this.fireframenumber));
                    else
                        this.sprite.changeframe(direction);
                    break;
                case STATE.CHANGE2FIX:
                case STATE.CHANGE2NORMAL:
                    this.sprite.changeframe(Math.floor(this.frame_change));
                    break;
            }
        }

        command(command) {
            switch (command.com) {
                case "change":
                    if (this.state == STATE.FIX || this.state == STATE.ATTACK_FIX || this.state == STATE.CHANGE2FIX) {
                        this.changetostate(STATE.CHANGE2NORMAL);
                    } else if (this.state == STATE.MOVE || this.state == STATE.MOVE2ATTACK) {
                        this._change2fix_command_ = true;
                    } else {
                        this._move_command_ = null;
                        this.changetostate(STATE.CHANGE2FIX);
                    }
                    break;
                case "move":
                    if (this.state == STATE.FIX || this.state == STATE.ATTACK_FIX || this.state == STATE.CHANGE2FIX) {
                        this._move_command_ = command;
                        this.changetostate(STATE.CHANGE2NORMAL);
                    } else {
                        super.command(command);
                    }
                    break;
                case "attack":
                    if (this.state == STATE.FIX || this.state == STATE.ATTACK_FIX || this.state == STATE.CHANGE2FIX) {
                        let range = this.property.property.range_fix;
                        if (calcfar2(this, command.enemy) <= range * range) {
                            this.changetostate(STATE.ATTACK_FIX);
                            this.attack(command.enemy);
                        }
                    } else {
                        super.command(command);
                    }
                    break;
                default:
                    super.command(command);
            }
        }

    }
};


SOLIDER_TYPE.sol_flakt_allied = {
    name: "sol_flakt_allied",
    type: "solider",
    img: {
        main_path: "IMG/Unit/Solider/FLAKT/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        attack: { path: "shot/img", from: 1, to: 48, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 4 },
        margin: { x: 50, y: 47 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        },
        die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE,
        sel: "Audio/iflasea.wav",
        mov: "Audio/iflamoc.wav",

    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 100,
        cost: 200,
        speed: 2,
        attack_type: "attack_rpg",
        attack_time: 60,
        attack_dam: 8,
        range: 7,
        sight: 8,
    },
    require: ["con_barracks_allied"],
    class: class extends Solider_unit {
        filter_enemy(ob) {
            if (ob instanceof VEHICLE_TYPE.veh_ore_allied.class)
                ob.__calc_tmp__ += 10000;
            else if (ob instanceof Construction_unit && !(ob instanceof Defender_Construction_unit))
                ob.__calc_tmp__ += 5000;
            return (ob instanceof Movealbe_unit || ob instanceof Construction_unit);
        }
    }
}


SOLIDER_TYPE.sol_cons_soviet = {
    name: "sol_cons_soviet",
    type: "solider",
    img: {
        main_path: "IMG/Unit/Solider/CONS/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        attack: { path: "shot/img", from: 1, to: 48, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 4 },
        margin: { x: 38, y: 47 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        }, die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE,//itessed.wav
        sel: "Audio/itessed.wav"
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 100,
        cost: 200,
        speed: 2,
        attack_type: "attack_submachine",
        attack_dam: 7,
        attack_time: 60,
        range: 6,
        sight: 7,

    },
    can_go_into_building: true,
}


SOLIDER_TYPE.sol_shk_soviet = {
    name: "sol_shk_soviet",
    type: "solider",
    img: {
        width: 66, height: 76,
        main_path: "IMG/Unit/Solider/shk/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        attack: { path: "shot/img", from: 1, to: 48, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 5 },
        margin: { x: 33, y: 38 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        }, die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 150,
        cost: 500,
        speed: 1,
        attack_type: "attack_tesla",
        attack_dam: 10,
        attack_time: 60,
        range: 7,
        sight: 8,
    },
}


SOLIDER_TYPE.sol_ivan_soviet = {
    name: "sol_ivan_soviet",
    type: "solider",
    img: {
        width: 66, height: 76,
        main_path: "IMG/Unit/Solider/ivan/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 3 },
        margin: { x: 48, y: 44 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        }, die: {
            path: "die/img", from: 1, to: 15, step: 1 / 3,
            type: [{ count: 15 }],
        },
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 150,
        cost: 300,
        speed: 2.5,
        attack_dam: 30,
        attack_time: 60,
        range: 1,
        attack_type_1: "attack_ivan_explorer",
        attack_type_2: "attack_ivan_explorer",
        sight: 8,
    },
    class: class extends Solider_unit {
        fire() {
            if (this.enemy) {
                GAME_OBJECT.add_instance(new Weapon(this, this.enemy, ATTACK_TYPE[this.property.property.attack_type_1]));
                this.delete();
            }
        }
        on_destroy(attackobject) {
            GAME_OBJECT.add_instance(new Weapon(this, this, ATTACK_TYPE[this.property.property.attack_type_1]));
            TEAM[this.team].team.on_unit_destroyed(this);
            this.delete();
        }
        process(time) {
            switch (this.state) {
                case STATE.MOVE2ATTACK:
                case STATE.ATTACK:
                    if(GRID.get_around_tile(this).some(e => e == this.enemy && calcfar2_full(this,e) < 1)){
                        this.fire();
                    }
                    break;
            }
            super.process(time);
        }
    }
}


SOLIDER_TYPE.sol_snipe_soviet = {
    name: "sol_snipe_soviet",
    type: "solider",
    img: {
        width: 66, height: 76,
        main_path: "IMG/Unit/Solider/snipe/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        attack: { path: "shot/img", from: 1, to: 48, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 3 },
        margin: { x: 53, y: 40 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        }, die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE,
        sel: "Audio/isnisea.wav"
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 100,
        cost: 1000,
        speed: 1.5,
        attack_dam: 5,
        attack_type: "attack_snipe",
        attack_time: 180,
        range: 15,
        sight: 15,
    },
    class: class extends Solider_unit {
        scan_enemy() {
            var range2 = Math.pow(this.property.property.sight, 2),
                max = 1000000, far, enemy,
                listob = GAME_OBJECT.listgameunit[1 - this.team].filter(e => e instanceof Solider_unit && e.team != this.team),
                length = listob.length;
            for(var ob of listob) {
                if ((far = calcfar2(ob, this)) <= range2 && far < max) {
                    max = far;
                    enemy = ob;
                }
            }
            return enemy;
        }
    }
}


SOLIDER_TYPE.sol_dog = {
    name: "sol_dog",
    type: "solider",
    class: class extends Solider_unit {
        init() {
            super.init();
            this.set_idle_point();
        }
        command(command) {
            switch (command.com) {
                case "move":
                    super.command(command);
                    this.set_idle_point();
                    break;
                case "attack":
                case "defense":
                    if (command.group && command.enemy instanceof Solider_unit) {
                        this.group = command.group;
                        this.group.enemy = command.enemy;
                        this.enemy = command.enemy;

                        if (!command.group.has_run) {
                            command.group.has_run = true;
                            GRID.get_grid_move_async(command.group, command.enemy, command.group.farest);
                        }

                        this.changetostate(command.com == "attack" ? STATE.MOVE2ATTACK : STATE.MOVE2DEFENSE);
                    }
                    break;
            }
        }
        scan_enemy() {
            var range2 = Math.pow(this.property.property.sight, 2),
                max = 1000000, far, enemy,
                listob = GAME_OBJECT.listobject.filter(e => e instanceof Solider_unit && e.team != this.team),
                length = listob.length;
            for(var ob of listob) {
                if ((far = calcfar2(ob, this)) <= range2 && far < max) {
                    max = far;
                    enemy = ob;
                }
            }
            return enemy;
        }
        process(time) {
            switch (this.state) {
                case STATE.MOVEBACK:
                    this.state = STATE.MOVE;
                    super.process(time);
                    if (!(this.state == STATE.IDLE))
                        this.state = STATE.MOVEBACK;
                    if (this.check_netxpoint()) {
                        var enemy = this.scan_enemy();
                        if (enemy)
                            this.command({
                                com: "defense",
                                group: { list: [this], goal: enemy, farest: this.property.property.sight + 3 },
                                enemy: enemy
                            });
                    }
                    break;
                case STATE.IDLE:
                    this.timelife += time;
                    this.process_idle_relax(time);
                    if (checkcircle(this.timelife, time, 30)) {
                        var enemy = this.scan_enemy();
                        if (enemy) {
                            this.command({
                                com: "defense",
                                group: { list: [this], goal: enemy, farest: this.property.property.sight + 3 },
                                enemy: enemy
                            });
                        } else if (Math.abs(this.x - this.idle_goal.x) > 2 || Math.abs(this.y - this.idle_goal.y) > 2) {
                            // go back to idle point if do not detect enemy affter amount of time;
                            this.time_count_to_back_idle += time;
                            if (this.time_count_to_back_idle > 10) {
                                this.time_count_to_back_idle = 0;
                                this.move_to_idle_point();
                            }
                        }
                    }

                    break;
                case STATE.MOVE2DEFENSE:
                    if (this.group && this.goal && this.check_netxpoint()) {
                        if (this.enemy.state == STATE.DELETE)
                            return this.changetostate(STATE.MOVEBACK);
                        else if (calcfar(this, this.enemy) <= this.property.property.range)
                            return this.changetostate(STATE.DEFENSE);
                        else if (this.enemy.state == STATE.MOVE || this.enemy.state == STATE.MOVE2ATTACK || this.enemy.state == STATE.MOVE2DEFENSE)
                            this.group = this.enemy.group;
                    }

                    this.state = STATE.MOVE;
                    super.process(time);
                    this.state = STATE.MOVE2DEFENSE;

                    break;
                case STATE.ATTACK:
                case STATE.DEFENSE:
                    this.attackload += time;
                    if (this.check_netxpoint()) {
                        super.process(time);
                    } else if (this.firing) {
                        if (this.attackload >= this.attackdone) {
                            this.sprite.changesprite(this.property.img.move.sprites[this.team]);
                            //this.sprite.changeframe(5);
                        }
                        if (this.nx && this.ny)
                            this.process_move(time);
                    }
                    break;
                default:
                    super.process(time);
                    break;
            }

            if (this.message) {
                this.process_message(this.message);
                this.message = null;
            }
        }
        fire() {
            super.fire();
            this.move_to_point({
                x: Math.round(this.enemy.nx || this.enemy.x),
                y: Math.round(this.enemy.ny || this.enemy.y)
            });
        }
        changetostate(state) {
            this.state = state;
            //console.log("changetostate : " + STATE.tostring(state));
            switch (this.state) {
                case STATE.MOVE2DEFENSE:
                    this.goal = this.enemy;
                    this.sprite.changesprite(this.property.img.move.sprites[this.team]);
                    this.frameidx = 0;
                    this.wating = null;
                    break;
                    // continue process STATE.MOVE
                    // DO NOT PUT --->> break <<--- STATEMENT HERE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                case STATE.MOVEBACK:
                    this.sprite.changesprite(this.property.img.move.sprites[this.team]);
                    this.frameidx = 0;
                    this.wating = null;
                    break;
                default:
                    super.changetostate(state);
                    break;
            }
        }
        set_idle_point() {
            this.idle_group = this.group;
            this.idle_goal = this.goal || { x: Math.round(this.x), y: Math.round(this.y) };
            this.time_count_to_back_idle = 0;
        }
        move_to_idle_point() {
            this.group = this.idle_group;
            this.goal = this.idle_goal;
            if (this.goal && !this.group)
                this.group = { goal: this.goal, list: [this], grid: GRID.get_grid_move(this.goal, 1) };




            this.changetostate(STATE.MOVEBACK);
            this.time_count_to_back_idle = 0;
        }
    },
    img: {
        width: 66, height: 76,
        main_path: "IMG/Unit/Solider/DOG2/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        attack: { path: "attack/img", from: 1, to: 48, step: 1 / 5 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 3 },
        margin: { x: 37, y: 40 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        }, die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
    },
    audio: {
        die0: "Audio/idogdiea.wav",
        die1: "Audio/idogdiea.wav",
        die2: "Audio/idogdiea.wav",
        die3: "Audio/idogdiea.wav",
        sel: "Audio/idogsela.wav"
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 150,
        cost: 300,
        speed: 4,
        attack_dam: 10,
        attack_type: "attack_dog",
        attack_time: 60,
        range: Math.SQRT2 + 0.01,
        sight: 8,
        activities_range: 8,
    },
}


SOLIDER_TYPE.sol_spy_allied = {
    name: "sol_spy_allied",
    type: "solider",
    img: {
        main_path: "IMG/Unit/Solider/SPY/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 6 },
        margin: { x: 43, y: 43 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        }, die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE,
        sel: "Audio/ispysec.wav",
        mov: "Audio/ispymod.wav",
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 100,
        cost: 1000,
        speed: 1.5,
        sight: 9,
        unit_can_spy: ["con_power_allied", "con_refinery_allied", "con_factory_allied", "con_ariplan_allied", "con_tech_allied"],
    },
    class: class extends Solider_unit {
        init() {
            super.init();
            this.enemy_property = null;
            this.enemy_team = null;
            this.enemy_sprite = IMAGE_PROCESS.getsprites(this.property.img.normal.sprites[this.team], this.property.img.margin);
            this.enemy_sprite.renderable = false;
            this.team_spy = this.team;
            stage.addChild(this.enemy_sprite);


        }
        command(command) {
            switch (command.com) {
                case "move":
                    super.command(command);
                    break;
                case "attack":
                    if (command.enemy instanceof Solider_unit) {
                        this.enemy_spy = command.enemy;
                        this.enemy_team = command.enemy.team;
                        this.enemy_property = command.enemy.property;
                        this.enemy_sprite.changesprite(this.enemy_property.img.normal.sprites[this.enemy_team]);
                        this.enemy_sprite.renderable = true;

                        var margin = this.enemy_property.img.margin;
                        this.enemy_sprite.anchor.set(margin.x / this.enemy_sprite.width, margin.y / this.enemy_sprite.height);

                        this.changetostate(STATE.IDLE);
                        var idx = GAME_OBJECT.listgameunit[this.team_spy].indexOf(this);
                        (idx > -1) && GAME_OBJECT.listgameunit[this.team_spy].splice(idx, 1);
                        this.team_spy = this.enemy_team;
                        GAME_OBJECT.listgameunit[this.team_spy].push(this);

                    } else if (command.enemy instanceof Construction_unit
                        && this.property.property.unit_can_spy.indexOf(command.enemy.property.name) > -1) {
                        super.command(command);
                    }
                    break;
            }
        }
        delete () {
            super.delete();
            var idx = GAME_OBJECT.listgameunit[1 - this.team].indexOf(this);
            (idx > -1) && GAME_OBJECT.listgameunit[1 - this.team].splice(idx, 1);
            stage.removeChild(this.enemy_sprite);
        }
        draw() {
            if (this.enemy_property && this.enemy_sprite) {
                var alpha = Math.max(Math.min(1, (Math.abs(this.timelife % 360 - 180) - 60) / 60), 0);
                if (this.team != USER_CONTROLER.team_controler.team)
                    alpha = 0;
                this.sprite.alpha = alpha;
                this.enemy_sprite.alpha = 1 - alpha;
                var temp = this.sprite;
                this.sprite = this.enemy_sprite;
                super.draw();
                this.sprite = temp;
            } else {
                this.sprite.alpha = 1;
            }
            this.sprite.alpha && super.draw();
        }
        changetostate(state) {
            super.changetostate(state);
            if (this.enemy_property) switch (this.state) {
                case STATE.MOVE: case STATE.MOVE2ATTACK: case STATE.MOVEBACK:
                    this.enemy_sprite.changesprite(this.enemy_property.img.move.sprites[this.enemy_team]);
                    break;
                case STATE.IDLE:
                    this.enemy_sprite.changesprite(this.enemy_property.img.normal.sprites[this.enemy_team]);
                    break;
            }
        }
        process_idle_relax(time) {
            this.frameidx += this.property.img.wait.step * time;
            if (this.wating) {
                if (this.frameidx > this.wating.end + 1) {
                    this.sprite.changesprite(this.property.img.normal.sprites[this.team]);
                    this.enemy_property && this.enemy_sprite.changesprite(this.enemy_property.img.normal.sprites[this.enemy_team]);
                    this.frameidx = 0;
                    this.wating = null;
                }
            } else if (this.frameidx > 10) {
                this.frameidx = 0;
                if (Math.random() < 0.1) {
                    this.wating = this.property.img.wait.random();
                    this.frameidx = this.wating.start;
                    this.sprite.changesprite(this.property.img.wait.sprites[this.team]);
                    this.enemy_property && this.enemy_sprite.changesprite(this.enemy_property.img.wait.sprites[this.enemy_team]);
                }
            }
        }
        find_next_point() {
            var enemy = this.enemy;
            for (var i = -1; i < 2; i++) for (var j = -1; j < 2; j++) if (i || j) {
                var x = this.nx + i, y = this.ny + j;
                var ceil = GRID.objectmap[x * GRID.dim + y];
                if (ceil && ceil.some(function (e) { return e == enemy }))
                    return { x: x, y: y };
            }
            return super.find_next_point();
        }
        process(time) {
            super.process(time);
            if (this.enemy && this.check_netxpoint()) {
                var enemy = this.enemy;
                if (this.enemy.state == STATE.DELETE) {
                    this.changetostate(STATE.IDLE);
                } else if (GRID.get_tile_object(this).some(function (e) { return e == enemy; })) {
                    this.spy();
                    this.delete();
                }
            }
        }
        spy() {
            switch (this.enemy.property.name) {
                case "con_refinery_allied":
                    var money = TEAM[this.enemy.team].team.money;
                    var theft_money = Math.min(20000, money * 0.4);
                    TEAM[this.enemy.team].team.money -= theft_money;
                    TEAM[this.team].team.money_delay += theft_money;
                    break;
                case "":
                    break;
            }
        }
    },
};


SOLIDER_TYPE.sol_eng = {
    name: "sol_eng",
    type: "solider",
    img: {
        main_path: "IMG/Unit/Solider/ENGINEER/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 5 },
        margin: { x: 40, y: 35 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        },
        die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        }
    },
    audio: {
        __proto__: SOLIDER_AUDIO_TYPE,
        sel: "Audio/ienasea.wav",
        mov: "Audio/ienamob.wav",
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 100,
        cost: 500,
        speed: 2,
        sight: 6,
        unit_can_recruit: [
            "con_power_allied",
            "con_refinery_allied",
            "con_factory_allied",
            "con_airplan_allied",
            "con_tech_allied",
            "con_contruction_allied",
            "con_barracks_allied",
            "cuairp",
            "cuoild"
        ],

    },
    class: class extends Solider_unit {
        command(command) {
            switch (command.com) {
                case "move":
                    super.command(command);
                    break;
                case "attack":
                    if (command.enemy instanceof Construction_unit
                        && this.property.property.unit_can_recruit.indexOf(command.enemy.property.name) > -1) {
                        super.command(command);
                    }
                    break;
                case "repair":
                    if (command.enemy instanceof Construction_unit
                        && command.enemy.health < command.enemy.totalhealth) {
                        command.com = "attack";
                        console.log("REPAIRE : ", command);
                        super.command(command);
                    }
                    break;
            }
        }
        process(time) {
            super.process(time);
            if (this.enemy && this.check_netxpoint()) {
                var enemy = this.enemy;
                if (
                    (this.enemy.team == this.team && this.enemy.health >= this.enemy.totalhealth)
                    || this.enemy.state == STATE.DELETE) {
                    this.changetostate(STATE.IDLE);
                } else if (GRID.get_tile_object(this).some(function (e) { return e == enemy; })) {
                    console.log(this.enemy);
                    if (this.enemy.team == this.team || (this.enemy.team == -1 && this.enemy.health < this.enemy.totalhealth))
                        this.repair();
                    else
                        this.recruit();
                }
            }
        }
        find_next_point() {
            var enemy = this.enemy;
            for (var i = -1; i < 2; i++) for (var j = -1; j < 2; j++) if (i || j) {
                var x = this.nx + i, y = this.ny + j;
                var ceil = GRID.objectmap[x * GRID.dim + y];
                if (ceil && ceil.some(function (e) { return e == enemy }))
                    return { x: x, y: y };
            }
            return super.find_next_point();
        }
        recruit() {
            this.enemy.change_team(this.team);
            this.delete();
        }
        repair() {
            this.enemy.health = this.enemy.totalhealth;
            this.enemy.healthsprite.sethealth(1);
            this.delete();
        }
    },
};


SOLIDER_TYPE.sol_tany = {
    name: "sol_tany",
    type: "solider",
    img: {
        width: 66, height: 76,
        main_path: "IMG/Unit/Solider/TANY/",
        normal: { path: "normal/img", from: 1, to: 8, step: 1 / 3 },
        attack: { path: "shot/img", from: 1, to: 48, step: 1 / 3 },
        move: { path: "move/img", from: 1, to: 48, step: 1 / 5 },
        margin: { x: 65, y: 55 },
        wait: {
            path: "wait/img", from: 1, to: 30, step: 1 / 6,
            type: [{ start: 1, end: 15, direct: 4 }, { start: 16, end: 30, direct: 6 }],
        }, die: {
            path: "die/img", from: 1, to: 30, step: 1 / 3,
            type: [{ count: 15 }, { count: 15 }],
        },
    },
    audio: {
        die0: "Audio/itandic.wav",
        die1: "Audio/itandic.wav",
        die2: "Audio/itandic.wav",
        die3: "Audio/itandic.wav",
        sel: "Audio/itansea.wav",
        mov: "Audio/itanmod.wav",
    },
    property: {
        shield: { _1: 30, _2: 30, _3: 30, _4: 30 },
        life: 100,
        cost: 1000,
        speed: 2.5,
        attack_dam: 5,
        attack_type: "attack_shot",
        attack_time: 30,
        range: 13,
    }
}
