
const EVENT = {
    on_buy_construction_done: "on_buy_construction_done",
    update_unit_can_buy: "update_unit_can_buy",
    set_position_construction_result: "set_position_construction_result",
    on_attacked: "on_attacked",
    on_detect_enemy: "on_detect_enemy",
    on_new_unit_ready: "on_new_unit_ready",
    on_unit_destroyed: "on_unit_destroyed",
    on_unit_move_done: "on_unit_move_done",
    on_new_unit: "on_new_unit",
    on_delete_unit: "on_delete_unit",
}

const UNIT_TYPE = {
    constrution: {
        con_contruction_allied: "con_contruction_allied",
        con_barracks_allied: "con_barracks_allied",
        con_factory_allied: "con_factory_allied",
        con_refinery_allied: "con_refinery_allied",
        con_power_allied: "con_power_allied",
        con_airplan_allied: "con_airplan_allied",
        con_tech_allied: "con_tech_allied",
        con_garage_allied: "con_garage_allied",
    },
    constrution_defense: {
        con_primtower_allied: "con_primtower_allied",
        con_teslatower_soviet: "con_teslatower_soviet",
        pillbox: "pillbox",
        con_super_cannon: "con_super_cannon",
        con_air_missle: "con_air_missle",
    },
    solider: {
        sol_cons_soviet: "sol_cons_soviet",
        sol_dog: "sol_dog",
        sol_eng: "sol_eng",
        sol_flakt_allied: "sol_flakt_allied",
        sol_gi_allied: "sol_gi_allied",
        sol_ivan_soviet: "sol_ivan_soviet",
        sol_shk_soviet: "sol_shk_soviet",
        sol_snipe_soviet: "sol_snipe_soviet",
        sol_spy_allied: "sol_spy_allied",
    },
    vehicle: {
        veh_firetank: "veh_firetank",
        veh_ifv_allied: "veh_ifv_allied",
        veh_mcv_allied: "veh_mcv_allied",
        veh_ore_allied: "veh_ore_allied",
        veh_prism_allied: "veh_prism_allied",
        veh_rhi_soviet: "veh_rhi_soviet",
        veh_tesla_soviet: "veh_tesla_soviet",
    },
    ship: {

    },
    plane: {
        beag: "beag",
        zeg: "zeg"
    },
    s: {
        constrution: "contruction",
        constrution_defense: "contruction_denfense",
        solider: "solider",
        vehicle: "vehicle",
        ship: "ship",
        plane: "plane"
    }
}

const UNIT_STATE = {
    IDLE: 1,
    RUN: 2,
    ATTACK: 3,
    ATTACKFIRE: 4,
    MOVE2ATTACK: 5,
    BUILDING: 6,
    SELLING: 7,
    MOVE: 8,
    DEFENSE: 9,
    DEFENSEFIRE: 10,
    DELETE: 11,
    MOVE2DEFENSE: 12,
    tostring: function (state) {
        for (var i in STATE)
            if (STATE[i] == state)
                return i;
    }
};


var AI_helper = new (function () {

    var calc_time_to_point_list = {};


    this._require_info_respond = function (data) {
        //console.log(data);
        switch (data.req) {

        }
    }


    this._GRID_ = new (function () {

        function PriorityQueue(maxsize) {
            this.heap = maxsize ? (new Array(maxsize)) : [];
            this.length = 0;
            this.swap = function (a, b) {
                var temp = this.heap[a];
                this.heap[a] = this.heap[b];
                this.heap[b] = temp;
            }

            this.enquene = function (ob, priority) {
                var idx = this.length;
                this.length++;
                this.heap[idx] = { _1: ob, _2: priority };
                while (idx > 0) {
                    var idxtemp = (idx - 1) >> 1;
                    if (this.heap[idx]._2 < this.heap[idxtemp]._2)
                        this.swap(idx, idxtemp);
                    idx = idxtemp;
                }
            }

            this.dequene = function () {
                this.length--;
                this.swap(0, this.length);
                var result = this.heap[this.length];
                this.heap[this.length] = null;
                var idx = 0, minidx, idx1;
                while ((idx1 = 1 + (idx << 1)) < this.length) {
                    minidx = (idx1 + 1 >= this.length || (this.heap[idx1]._2 < this.heap[idx1 + 1]._2)) ? idx1 : (idx1 + 1);
                    if (this.heap[idx]._2 <= this.heap[minidx]._2)
                        break;
                    this.swap(minidx, idx);
                    idx = minidx;
                }
                return result._1;
            }
        }

        var dim;
        var terrian;
        var material;
        var objectcount;
        var list_goal;

        this.dim = 0;
        this._objectcount_ = [];

        var checkcanmove_fast = function (x, idx, height) {
            // Perfomance is very Importain 
            return (x >= 0) && (x < dim)
                && material[idx] == 0
                && Math.abs(terrian[idx] - height) < 3
                && objectcount[idx] == 0;
        }

        var getnextstep = function (x, y, l) {
            // Perfomance is very IMPORTAIN
            var result = new Array(),
                count = 0;
            var l_1 = l + 10, l_s2 = l + 14;
            var idx = x * dim + y;
            var height = ((x >= 0) && (x < dim)) ? terrian[idx] : -10;

            if (checkcanmove_fast(x + 1, idx + dim + 1, height))
                result[count++] = [x + 1, y + 1, l_s2, idx];
            if (checkcanmove_fast(x + 1, idx + dim - 1, height))
                result[count++] = [x + 1, y - 1, l_s2, idx];
            if (checkcanmove_fast(x - 1, idx - dim + 1, height))
                result[count++] = [x - 1, y + 1, l_s2, idx];
            if (checkcanmove_fast(x - 1, idx - dim - 1, height))
                result[count++] = [x - 1, y - 1, l_s2, idx];
            if (checkcanmove_fast(x, idx + 1, height))
                result[count++] = [x, y + 1, l_1, idx];
            if (checkcanmove_fast(x, idx - 1, height))
                result[count++] = [x, y - 1, l_1, idx];
            if (checkcanmove_fast(x + 1, idx + dim, height))
                result[count++] = [x + 1, y, l_1, idx];
            if (checkcanmove_fast(x - 1, idx - dim, height))
                result[count++] = [x - 1, y, l_1, idx];
            return result;
        }

        this.init_map_data = function (data) {
            dim = data.dim;
            this.dim = dim;
            terrian = data.terrian;
            material = data.material;
            //console.log("init_map_data");
        }

        this.update_object_count = function (data) {
            objectcount = new Uint16Array(data);
        }


        this.update_object_count2 = function (data) {
            this._objectcount_ = new Uint16Array(data);
        }


        /**
         * 
         * @param {Array.<Point>} listgoal
         * @returns {Array.<Point>} 
         */
        this.get_grid_move = function (listgoal) {
            var tonumber = function (state) { return (state[0] * dim + state[1]) * 4 }
            var his = new Uint16Array(dim * dim * 4);
            var queue = new PriorityQueue(dim * dim);
            var state, list, length, listi, number;

            var goal_idx = listgoal[0].x * dim + listgoal[0].y;
            for(var e of listgoal) {
                var f = [e.x, e.y, 0, goal_idx];
                var number = tonumber(f);
                his[number] = e.x;
                his[number + 1] = e.y;
                his[number + 2] = 0;
                his[number + 3] = goal_idx;
                queue.enquene(f, 0);
            }

            while (queue.length > 0) {
                state = queue.dequene();
                list = getnextstep(state[0], state[1], state[2]);
                length = list.length;
                for (var i = 0 ; i < length; i++) {
                    listi = list[i];
                    number = tonumber(listi);
                    if (!his[number] || his[number + 2] > listi[2]) {
                        queue.enquene(listi, listi[2]);
                        his[number] = listi[0];
                        his[number + 1] = listi[1];
                        his[number + 2] = listi[2];
                        his[number + 3] = listi[3];
                    }
                }
            }

            return his;
        }


        /**
         * 
         * @param {Number} x
         * @param {Number} y
         * @param {Number} w
         * @param {Number} h
         * @param {Boolean} skip_this
         * @returns {Boolean} 
         */
        this.check_area_for_construct = function (x, y, w, h, skip_this) {

            var starx = Math.round(x - w / 2);
            var stary = Math.round(y - h / 2);
            var endx = x + w / 2 - 0.01;
            var endy = y + h / 2 - 0.01;

            if (starx < 0 || stary < 0 || endx > dim - 1 || endy > dim - 1 || !w || !h)
                return false;
            var height = terrian[starx * dim + stary];
            for (var i = starx; i <= endx; i++) {
                for (var j = stary; j <= endy; j++)
                    if (!skip_this || x != i || y != j) {
                        var idx = i * dim + j;
                        if (objectcount[idx] > 0 || this._objectcount_[idx] > 0 || height != terrian[idx] || material[idx])
                            return false;
                    }
            }
            return true;
        }


        /**
         * 
         * @param {Array.<Array.<Number>>} array
         * @param {Number} w
         * @param {Number} h
         * @returns {Array.<Array.<Number>>} 
         */
        function check(array, w, h) {
            var r1 = [];
            var h_ = array[0].length - h + 1,
                w_ = array.length - w + 1;
            var result = [];
            for (var i = 0; i < array.length; i++) {
                r1[i] = []
                for (var j = 0; j < h_; j++)
                    for (var k = 0; k < h; k++) {
                        r1[i][j] = 0;
                        if (array[i][j + k]) {
                            r1[i][j] = 1;
                            break;
                        }
                    }
            }
            for (var i = 0; i < w_; i++) {
                for (var j = 0; j < h_; j++) {
                    var has = true;
                    for (var k = 0; k < w; k++) {
                        if (r1[i + k][j]) {
                            has = false;
                            break;
                        }
                    }
                    has && result.push({ i, j })
                }
            }
            return result;
        }


        /**
         * 
         * @param {Number} x
         * @param {Number} y
         * @param {Number} w
         * @param {Number} h
         * @param {Boolean} skip_this
         * @param {Number} max
         * @param {Number} padding
         * @param {Array.<Point>} list_post_near
         * @returns {Array.<Point>} 
         */
        this.find_arear_for_construct = function (x, y, w, h, skip_this, max, padding, list_post_near) {
            //console.time("find_arear_for_construct");
            var max = max || 15;
            var padding = padding || 0;
            var startx = Math.max(0, Math.round(x - max));
            var starty = Math.max(0, Math.round(y - max));
            var endx = Math.min(dim - 1, x + max);
            var endy = Math.min(dim - 1, y + max);
            var total_w = endx - startx;
            var total_h = endy - starty;
            var data_arr = [];
            var skip_idx = skip_this ? x * dim + y : -1;
            for (var i = 0; i < total_w; i++) {
                data_arr[i] = [];
                for (var j = 0; j < total_h; j++) {
                    var idx = (i + startx) * dim + (j + starty);
                    if (idx == skip_idx)
                        continue;
                    data_arr[i][j] = (
                        objectcount[idx] > 0
                        || this._objectcount_[idx] > 0
                        || terrian[idx] != terrian[idx + 1]
                        || terrian[idx] != terrian[idx + dim]
                        || material[idx]
                    ) ? 1 : 0;
                }
                ////console.log(data_arr[i]);
            }
            var temp = check(data_arr, w + padding * 2, h + padding * 2);
            var temp2 = temp.map(e => ({
                x: e.i + startx + (w - 1) / 2 + 0.01 + padding,
                y: e.j + starty + (h - 1) / 2 + 0.01 + padding,
                i: i,
                j: j
            }));
            list_post_near = list_post_near || [{ x, y }];
            function carfar2(e, f) {
                var dx = e.x - f.x,
                    dy = e.y - f.y;
                return dx * dx + dy * dy;
            }
            temp2.forEach(function (e) {
                var list_tmp = list_post_near.map(f => carfar2(e, f));
                e.l2 = Math.min.apply(Math, list_tmp);
            });
            temp2.sort((a, b) => a.l2 - b.l2);
            // console.timeEnd("find_arear_for_construct");
            return temp2;
        }

    })();


    this.calc_time_to_point = function (start, goal, ondone, para) {
        var grid = this._GRID_.get_grid_move([goal]);
        var idx = start.x * this._GRID_.dim + start.y;
        var l = grid[idx * 4 + 2] / 10;
        var speed = info_type[start.name].property.speed;
        return l / speed;
    }


    this.find_nearest_enemy = function (data, max_pos) {
        var x = data.x, y = data.y;
        var result = null, postion2 = (max_pos * max_pos) || Infinity;
        var type_add = { "contruction_denfense": 0, "vehicle": 0, "solider": 100, "contruction": 300 }
        for (var e of unit_list_enemy.filter(e => e.type != "plane")) {
            var pos = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y) + 0 * (type_add[e.type] || 0);
            if (e.name == UNIT_TYPE.vehicle.veh_ore_allied)
                pos += 500;
            if (pos < postion2) {
                postion2 = pos;
                result = e;
            }
        }
        return result;
    }


    this.get_list_around = function (list_in, pos, radius) {
        if (!pos)
            return [];
        var radius2 = radius * radius,
            x = pos.x, y = pos.y;

        return list_in.filter(function (e) {
            var dx = x - e.x, dy = y - e.y;
            return dx * dx + dy * dy < radius2;
        });
    }


    this.calc_pos = function (ob1, ob2) {
        var dx = ob1.x - ob2.x, dy = ob1.y - ob2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }



    this.find_nearpoint_to_build = function (postion, typename, skip_this, max, padding, list_point_near) {
        var size = info_type[typename].property.size;
        return this._GRID_.find_arear_for_construct(postion.x, postion.y, size.w, size.h, skip_this, max, padding, list_point_near);
    }

    /**
     * 
     * @param {Point} postion
     * @param {String} typename
     * @param {Boolean} skip_this
     * @returns {Point} 
     */
    this.check_area_for_construct = function (postion, typename, skip_this) {
        var size = info_type[typename].property.size;
        return this._GRID_.check_area_for_construct(postion.x, postion.y, size.w, size.h, skip_this);
    }


    /**
     * @param {String} name
     * @returns {Game_unit} 
     */
    this.find_unit_by_name = function (name) {
        return unit_list_mine.find(e => e.name == name);
    }


    /**
     * @param {String} name
     * @param {Point} pos
     * @returns {Game_unit} 
     */
    this.find_unit = function (name, pos) {
        var list_clone = unit_list_mine.map(e => e);
        list_clone.forEach(e => (e._sss_ = this.calc_pos(pos, e)));
        list_clone.sort((e, f) => e._sss_ - f._sss_);
        return list_clone[0];
    }


    /**
     * 
     * @param {String} name
     * @returns {Boolean} 
     */
    this.check_unit_can_buy = function (name) {
        ////console.log(name,"================================ ", buy_unit_index[name]);
        return buy_unit_index[name];
    }


    this._event_list_ = {};
    this.register_event = function (flag, func, object) {
        if (!this._event_list_[flag])
            this._event_list_[flag] = [];
        this._event_list_[flag].push({ flag, func, object });
        return func;
    }

    this.remove_event = function (flag, func) {
        var remove_idx = this._event_list_[flag].findIndex(e => e.func == func);
        if (remove_idx >= 0)
            this._event_list_[flag].splice(remove_idx, 1);
    }


    this.process_event = function (flag, data) {
        //console.log("process_event", flag, data);
        if (this._event_list_[flag]) {
            for (var i = 0; i < this._event_list_[flag].length; i++) {
                var e = this._event_list_[flag][i];
                if (e.delete)
                    this._event_list_[flag].splice(i++, 1);
                else {
                    e.func.call(e.object, data);
                }
            }
        }
    }


    this.compare_speed = function (unit1, unit2) {
        var t1 = info_type[unit1.name];
        var t2 = info_type[unit2.name];
        return (t1.property.speed / t2.property.speed) || 0;
    }


    this.compare_power = function (unit1, unit2) {


    }


    this.compare_group_power = function (list1, list2) {


    }



    this.set_default_point_solider = function (point) {
        this._point_solider_ = point;
    }

    this.set_default_point_vehivle = function (point) {
        this._point_vehivle_ = point;
    }

    this.set_default_point_ship = function (point) {
        this._point_ship_ = point;
    }


    this.register_event(
        EVENT.on_new_unit_ready,
        function (data) {
            switch (data.name) {
                case "con_barracks_allied":
                    if (this._point_solider_)
                        send_command([data], { com: "setworkpoint", workpoint: this._point_solider_ })
                    break;
                case "con_factory_allied":
                    if (this._point_vehivle_)
                        send_command([data], { com: "setworkpoint", workpoint: this._point_vehivle_ })
                    break;

            }
        },
        this
    );


})();

