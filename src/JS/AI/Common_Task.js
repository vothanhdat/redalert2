/// <reference path="AI_Task.js" />
/// <reference path="AI_Helper.js" />
/// <reference path="../AI_Worker.js" />


var COMMON_TASK = new (function () {

    function process_param(ob) {
        return (typeof ob == "function") ? ob() : ob;
    }


    this.build_main_construction = function (pos) {
        this.name = "build_main_construction";
        this.is_done = function () {
            return this.Task && this.Task.is_done;
        }
        this.is_fail = function () {
            return this.Task && this.Task.is_fail;
        }
        this.do = function () {
            this.Task = new AI_Task_Grouph();
            this.Task.add_task(
                //Task name
                "MOVE_TO_BUILDING_POSITION",
                //init
                function () {
                    this.pos = pos;
                    this.veh_mcv_allied = AI_helper.find_unit_by_name("veh_mcv_allied");
                },
                //pre_condition
                function () {
                    this.veh_mcv_allied = AI_helper.find_unit_by_name("veh_mcv_allied");
                    if (!this.veh_mcv_allied)
                        return false;
                    var pos = process_param(this.pos) || this.veh_mcv_allied;
                    this.position_list = AI_helper.find_nearpoint_to_build(pos, "con_contruction_allied", true, 15);

                    return this.position_list.length > 0;
                },
                //work_for_do
                function () {
                    CONTROL.send_command([this.veh_mcv_allied], { com: "move", goal: this.position_list[0] });
                    this.position = this.position_list[0];
                },
                //post_condition
                function () {
                    return Math.abs(this.position.x - this.veh_mcv_allied.x) < 4
                        && Math.abs(this.position.y - this.veh_mcv_allied.y) < 4
                        && AI_helper.check_area_for_construct(this.veh_mcv_allied, "con_contruction_allied", true);
                },
                //on_done
                function () { },
                //option
                { timeout: 5, try: 1000 }
            );

            this.Task.add_task(
                //Task name
                "BUILDING_MAIN_CONSTRUCTION",
                //init
                function () {
                    this.veh_mcv_allied = AI_helper.find_unit_by_name("veh_mcv_allied");
                    this.time = performance.now();
                },
                //pre_condition
                function () {
                    this.f1 = this.f1 || AI_helper.register_event(EVENT.on_new_unit_ready, function (e) {
                        if (e.name == "con_contruction_allied")
                            this.__is__done__ = true;
                    }, this);

                    if ( performance.now() - this.time > 300
                        && AI_helper.check_area_for_construct(this.veh_mcv_allied, "con_contruction_allied", true)) {
                        this.time = performance.now();
                        CONTROL.send_command([this.veh_mcv_allied], { com: "change" });
                    }
                    return this.__is__done__;
                },
                //work_for_do
                function () { },
                //post_condition
                function () {
                    return this.__is__done__;
                },
                //on_done
                function () {
                    AI_helper.remove_event(EVENT.on_new_unit_ready, this.f1);
                },
                //option
                { timeout: 10, try: 1000 }
            );

        }
    }


    this.building_construction = function (name, pos, padding, radius, list_point_near) {
        this.name = "building_construction";

        this.is_done = function () {
            return this.Task && this.Task.is_done;
        }
        this.is_fail = function () {
            return this.Task && this.Task.is_fail;
        }

        this.do = function () {
            this.Task = new AI_Task_Grouph();
            this.Task.add_task(
                //Task name
                "__BUY_CONSTRUCTION__",
                //init
                function () {
                    this.name = process_param(name);
                },
                //pre_condition
                function () {
                    if (AI_helper.check_unit_can_buy(this.name)) {
                        return true;
                    }
                },
                //work_for_do
                function () {
                    CONTROL.buy_unit(buy_unit_index[this.name]);
                },
                //post_condition
                function () {
                    COMMON_TASK.refresh_list();
                    if (COMMON_TASK._wait_buy_construction_[this.name] != undefined) {
                        return true;
                    }
                    if (!AI_helper.check_unit_can_buy(this.name)) {
                        this.on_fail();
                        return;
                    }
                },
                //on_done
                function () { },
                //option
                { timeout: 10000 }
            );

            this.Task.add_task(
                //Task name
                "__BUILD_CONSTRUCTION__",
                //init
                function () {
                    this.name = name;
                    this.pos = process_param(pos);
                    this.padding = padding || 2;
                    this.wait_data = null;
                    this.radius = radius || 30;
                    this.list_point_near = process_param(list_point_near);
                },
                //pre_condition
                function () {
                    this.pos = this.pos || unit_list_mine.find(e => e.name == "con_contruction_allied");
                    if (!AI_helper.check_unit_can_buy(this.name)) {
                        this.on_fail();
                        return;
                    }
                    if ((this.wait_data = COMMON_TASK._wait_buy_construction_[this.name]) != null
                        && AI_helper.find_nearpoint_to_build(this.pos, this.name, false, this.radius, this.padding).length > 0) {
                        return true;
                    }
                },
                //work_for_do
                function () {
                    var position_list = AI_helper.find_nearpoint_to_build(
                        this.pos,
                        this.name,
                        false,
                        this.radius,
                        this.padding,
                        this.list_point_near
                    );
                    if (position_list[0])
                        CONTROL.set_position_construction(COMMON_TASK._wait_buy_construction_[this.name], position_list[0]);
                },
                //post_condition
                function () {
                    COMMON_TASK.refresh_list();
                    var result = COMMON_TASK._notify_build_construction_done_[this.name];
                    if (result && this.wait_data == COMMON_TASK._wait_buy_construction_[this.name])
                        COMMON_TASK._wait_buy_construction_[this.name] = null;
                    COMMON_TASK._notify_build_construction_done_[this.name] = null;
                    return result;
                },
                //on_done
                function () { },
                //option
                { timeout: 10000 }
            );

        }


    }


    this.buy_unit = function (name, number, wait_done) {
        this.name = "buy_unit";

        this.is_done = function () {
            return this.Task && this.Task.is_done;
        }
        this.is_fail = function () {
            return this.Task && this.Task.is_fail;
        }
        this.do = function () {
            //console.log(name, pos);
            this.Task = new AI_Task_Grouph();
            this.Task.add_task(
                //Task name
                "__BUY_UNIT__",
                //init
                function () {
                    this.name = process_param(name);
                    this.wait_done = process_param(wait_done);
                },
                //pre_condition
                function () {
                    return AI_helper.check_unit_can_buy(this.name);
                },
                //work_for_do
                function () {
                    if (!this._flag_) {
                        this._flag_ = true;
                        this.number = process_param(number);
                        for (var i = 0; i < this.number; i++)
                            CONTROL.buy_unit(buy_unit_index[this.name]);
                    }

                },
                //post_condition
                function () {
                    if (this.wait_done && this._flag_)
                        return true;
                    if (!AI_helper.check_unit_can_buy(this.name)) {
                        console.log("TASK BUY FAIL");
                        this.on_fail();
                    }
                    if (COMMON_TASK._new_unit_list_[this.name] >= this.number) {
                        COMMON_TASK._new_unit_list_[this.name] -= this.number;
                        return true;
                    }
                },
                //on_done
                function () { },
                //option
                { timeout: 10000 }
            );
        }





    }


    this.move_unit = function (list, goal, auto_defense) {
        this.name = "move_unit";
        this.is_done = function () {
            return this.Task && this.Task.is_done;
        }
        this.is_fail = function () {
            return this.Task && this.Task.is_fail;
        }
        this.do = function () {
            //console.log(name, pos);
            this.Task = new AI_Task_Grouph();
            this.Task.add_task(
                //Task name
                "__MOVE__UNIT__",
                //init
                function () {
                    this.list = process_param(list);
                    this.goal = process_param(goal);
                    this.list_ID = this.list.map(e => e.ID);
                    this.list_length = this.list_ID.filter(e => map_unit_list_mine[e]).length;
                    this.auto_defense = auto_defense;

                },
                //pre_condition
                function () {
                    return true;
                },

                //work_for_do
                function () {

                    console.log("__MOVE__UNIT__TASK__");
                    CONTROL.send_command(this.list, { com: "move", goal: this.goal });
                    this.f1 = this.f1 || AI_helper.register_event(EVENT.on_unit_move_done, function (data) {
                        var IDX = this.list_ID.indexOf(data.ID);
                        if (IDX > -1)
                            this.list_ID.splice(IDX, 1);
                    }, this);

                    this.f2 = this.f2 || AI_helper.register_event(EVENT.on_unit_destroyed, function (data) {
                        var IDX = this.list_ID.indexOf(data.ID);
                        if (IDX > -1)
                            this.list_ID.splice(IDX, 1);
                    }, this);

                    if (this.auto_defense) {
                        this.f3 = this.f3 || AI_helper.register_event(EVENT.on_attacked, function (data) {
                            var IDX = this.list_ID.indexOf(data.ID);
                            if (IDX > -1) {
                                var enemy = AI_helper.find_nearest_enemy(data);
                                if (enemy && AI_helper.compare_speed(data, enemy) >= 1) {
                                    var task = new AI_Task_Grouph();
                                    var list = this.list, goal = this.goal;
                                    task.add_common_task(COMMON_TASK.attack_enemy, [this.list, enemy]);
                                    task.add_common_task(COMMON_TASK.wait_for_auto_attack, [this.list], null, function () {
                                        CONTROL.send_command(list, { com: "move", goal: goal });
                                    });
                                }
                            }
                        }, this);
                    }

                },
                //post_condition
                function () {
                    this.list_ID = this.list_ID.filter(e => map_unit_list_mine[e]);
                    console.log("__MOVE__UNIT_POSTCONDITION__", this.list_ID.length / this.list_length);
                    if (this.list_ID.length / this.list_length < 0.15)
                        return true;
                },
                //on_done
                function () {
                    AI_helper.remove_event(EVENT.on_unit_move_done, this.f1);
                    AI_helper.remove_event(EVENT.on_unit_destroyed, this.f2);
                    AI_helper.remove_event(EVENT.on_attacked, this.f3);
                    console.log("__MOVE__UNIT__TASK__DONE__");
                },
                //option
                { timeout: 10000 }
            );
        }
    }


    this.attack_enemy = function (list, enemy) {
        this.name = "attack_enemy";
        this.is_done = function () {
            return this.Task && this.Task.is_done;
        }
        this.is_fail = function () {
            return this.Task && this.Task.is_fail;
        }
        this.do = function () {
            //console.log(name, pos);
            this.Task = new AI_Task_Grouph();
            this.Task.add_task(
                //Task name
                "__ATTACK__ENEMY__",
                //init
                function () {
                    this.list_ = list;
                    this.enemy_ = enemy;
                },
                //pre_condition
                function () { return true; },
                //work_for_do
                function () {
                    if (!this._flag_) {
                        this._flag_ = true;
                        this.list = process_param(this.list_);
                        this.enemy = process_param(this.enemy_);
                        this.enemy_ID = this.enemy.ID;
                        CONTROL.send_command(this.list, { com: "attack", enemy: this.enemy });
                    }
                },
                //post_condition
                function () { return !map_unit_list_enemy[this.enemy_ID] },
                //on_done
                function () { console.log("__ATTACK__ENEMY__TASK__DONE__"); },
                //option
                { timeout: 10000 }
            );
        }

    }


    this.wait_for_auto_attack = function (list) {
        this.name = "wait_for_auto_attack";
        this.is_done = function () {
            return this.Task && this.Task.is_done;
        }
        this.is_fail = function () {
            return this.Task && this.Task.is_fail;
        }
        this.do = function () {
            //console.log(name, pos);
            this.Task = new AI_Task_Grouph();
            this.Task.add_task(
                //Task name
                "__WAIT_FOR_AUTO_ATTACK__",
                //init
                function () {
                    this.list = process_param(list);
                },
                //pre_condition
                function () { return true; },
                //work_for_do
                function () {
                    console.log("__WAIT_FOR_AUTO_ATTACK__DOING__")
                    if (!this._flag_) {
                        this._flag_ = true;
                        this.time_run = performance.now();
                        CONTROL.send_command(this.list, { com: "auto" });
                    }
                },
                //post_condition
                function () {
                    for(var e of this.list.filter(e => map_unit_list_mine[e.ID])) {
                        if (e.state == UNIT_STATE.DEFENSE)
                            return false;
                    };
                    return (performance.now() - this.time_run) > 1500;
                },
                //on_done
                function () {
                    console.log("__WAIT_FOR_AUTO_ATTACK__DONE__")
                },
                //option
                { timeout: 10000 }
            );
        }
    }


    this.clean_area = function (list, postion, radius) {
        this.name = "clean_area";
        this.is_done = function () {
            return this.Task && this.Task.is_done;
        }
        this.is_fail = function () {
            return this.Task && this.Task.is_fail;
        }
        this.do = function () {
            //console.log(name, pos);
            this.Task = new AI_Task_Grouph();
            this.Task.add_task(
                //Task name
                "__CLEAN__AREA__",
                //init
                function () {
                    this.list = process_param(list);
                    this.postion = process_param(postion);
                    this.radius = process_param(radius);
                },
                //pre_condition
                function () {
                    return true;
                },
                //work_for_do
                function () {
                    if (!this._flag_) {
                        this._flag_ = true;
                        CONTROL.send_command(this.list, { com: "protect_area", pos: this.postion, radius: this.radius });
                    }
                },
                //post_condition
                function () {
                    this.list = this.list.filter(e => map_unit_list_mine[e.ID]);
                    return !AI_helper.find_nearest_enemy(this.postion, this.radius)
                        && this.list.filter(e => AI_helper.calc_pos(e, this.postion) < this.radius).length > this.list.length * 0.75;
                },
                //on_done
                function () { console.log("__CLEAN_AREAR_DONE__"); },
                //option
                { timeout: 10000 }
            );
        }

    }


    this.wait_task = function (func, object, on_done) {
        if (typeof func != "function")
            throw new Error("first arg is not a function");
        this.name = "wait_task";
        this.is_done = function () {
            if (func.call(object)) {
                on_done && on_done();
                return true;
            };
        }
        this.is_fail = function () { }
        this.do = function () { }
    }








    this._wait_buy_construction_ = {};
    this._notify_build_construction_done_ = {};

    this._wait_buy_construction_stack_ = {};
    this._notify_build_construction_done_stack_ = {};
    this._new_unit_list_ = {};
    this._time_ = performance.now();

    AI_helper.register_event(EVENT.on_new_unit_ready, function (data) {
        if (performance.now() - this._time_ < 7000)
            return;
        if (!this._new_unit_list_[data.name])
            this._new_unit_list_[data.name] = 0;
        this._new_unit_list_[data.name]++;
    }, this);


    AI_helper.register_event(EVENT.on_buy_construction_done, function (data) {
        if (!this._wait_buy_construction_stack_[data.name])
            this._wait_buy_construction_stack_[data.name] = [];
        this._wait_buy_construction_stack_[data.name].push(data);
    }, this);


    AI_helper.register_event(EVENT.set_position_construction_result, function (data) {
        if (data.result) {
            if (!this._notify_build_construction_done_stack_[data.data.name])
                this._notify_build_construction_done_stack_[data.data.name] = [];
            this._notify_build_construction_done_stack_[data.data.name].push(data.data);
        }
    }, this);

    this.refresh_list = function () {
        var S1 = this._wait_buy_construction_stack_;
        for (var i in S1) {
            if (!this._wait_buy_construction_[i]) {
                if (S1[i] && S1[i].length > 0) {
                    this._wait_buy_construction_[i] = S1[i].shift();
                }
            }
        }
        var S2 = this._notify_build_construction_done_stack_;
        for (var i in S2) {
            if (!this._notify_build_construction_done_[i]) {
                if (S2[i] && S2[i].length > 0) {
                    this._notify_build_construction_done_[i] = S2[i].shift();
                }
            }
        }
    }

    //setInterval(() => this.refresh_list(), 100);

    /*
    this.auto_attack = function (list, postion, radius, run_over) {
        var Task;
        this.is_done = function () {
            return Task && Task.is_done;
        }
        this.is_fail = function () {
            return Task && Task.is_fail;
        }
        this.do = function () {
            Task = new AI_Task_Grouph();
            Task.add_task(
                //Task name
                "__AUTO_ATTACK__",
                //init
                function () {
                    this.list = process_param(list);
                    this.postion = process_param(postion);
                    this.radius = process_param(radius);
                    this.done = {};
                },
                //pre_condition
                function () {
                    return true;
                },
                //work_for_do
                function () {
                    if (!this._flag_) {
                        this._flag_ = true;
                        var list = this.list;
                        var postion = this.postion;
                        var radius = this.radius;
                        var done = this.done;
                        var T = new AI_Task_Grouph();
                        T.wait_for_new_task = true;
                        var auto_attack = null;
                        if (run_over) {
                            done.done = true;
                            console.log("__AUTO_ATTACK_run_over__");
                            auto_attack = function () {
                                var enemy = null;
                                T.add_common_task(COMMON_TASK.wait_task, [() => enemy = AI_helper.find_nearest_enemy(postion, radius), {}]);
                                T.add_common_task(COMMON_TASK._attack_enemy_,
                                    [list, () => enemy,() => postion,radius], null,
                                    function () {
                                        if(!AI_helper.find_nearest_enemy(postion, radius))
                                            send_command(list, { com: "move", goal: postion });
                                        auto_attack();
                                    }
                                );
                            };
                        } else {
                            auto_attack = function () {
                                T.add_common_task(
                                    COMMON_TASK._attack_enemy_,
                                    [list, AI_helper.find_nearest_enemy(postion, radius), () =>postion, radius], null,
                                    function () {
                                        send_command(list, { com: "move", goal: postion });
                                        if (AI_helper.find_nearest_enemy(postion, radius))
                                            auto_attack();
                                        else
                                            done.done = true
                                    }
                                );
                            };
                        }
                        auto_attack();
                    }
                },
                //post_condition
                function () {
                    return (this.done && this.done.done);
                },
                //on_done
                function () {
                    console.log("__AUTO_ATTACK_DONE__");
                },
                //option
                { timeout: 10000 }
            );
        }
    }


    this._attack_enemy_ = function (list, enemy, postion, radius) {
        var Task;
        this.is_done = function () {
            return Task && Task.is_done;
        }
        this.is_fail = function () {
            return Task && Task.is_fail;
        }


        this.do = function () {
            Task = new AI_Task_Grouph();
            Task.add_task(
                //Task name
                "__ATTACK__ENEMY__",
                function () {
                    this.list = process_param(list);
                    this.enemy = process_param(enemy);
                    this.postion = process_param(postion);
                    this.radius = process_param(radius);
                    this.enemy_ID = this.enemy.ID;
                },
                //pre_condition
                function () { return true; },
                //work_for_do
                function () {
                    if (!this._flag_) {
                        this._flag_ = true;
                        send_command(this.list, { com: "attack", enemy: this.enemy });
                    }
                },
                //post_condition
                function () {
                    return (!map_unit_list_enemy[this.enemy_ID])
                        || AI_helper.calc_pos(this.postion, this.enemy) > this.radius;
                },
                //on_done
                function () {},
                //option
                { timeout: 10000 }
            );
        }

    }
*/


})();