import { AI_WORKER } from "./AI_worker_comunication";


export const GRID = new (function () {
    //Path_finding_worker.js
    var worker = new Worker("JS/Path_finding_worker.js");
    var groupg_idx = {};

    this.groupg_idx = groupg_idx;


    class grid_class {
        constructor(raw_grid) {
            this.raw_grid = raw_grid;
        }
        get(idx) {
            idx *= 4;
            if (!this.raw_grid[idx])
                return null;
            let x = this.raw_grid[idx];
            let y = this.raw_grid[idx + 1];
            let l = this.raw_grid[idx + 2] / 10;
            let b = this.raw_grid[idx + 3];
            return { x, y, l, b };
        }
    }

    var worker_onmessage_worker = function (e) {
        switch (e.data.flag) {
            case "find_path_done":
                if (e.data.r && groupg_idx[e.data.r]) {
                    console.timeEnd("find_path : " + e.data.r);
                    groupg_idx[e.data.r].grid = new grid_class(e.data.grid);
                    delete groupg_idx[e.data.r];
                }
                break;
        }
    }


    worker.onmessage = worker_onmessage_worker;

    var dim = 0;
    this.dim = 0;
    this.heightmap = null;
    this.materialmap = null;
    this.object_count = null;
    this._object_count_ = null;

    this.buffer_heightmap = null;
    this.buffer_materialmap = null;
    this.buffer_object_count = null;
    this.buffer__object_count_ = null;

    this.objectmap = null;
    //this.groundcodinate = null;
    this.heapmine = null;
    this.fogmap = null;


    /** @description Init the grid infomation from map
     * @param {Map} map The Map.
     */
    this.init = function (map) {
        this.dim = dim = map.dim;

        this.buffer_heightmap = new ArrayBuffer(this.dim * this.dim * 2);
        this.buffer_materialmap = new ArrayBuffer(this.dim * this.dim * 2);
        this.buffer_object_count = new ArrayBuffer(this.dim * this.dim * 2);
        this.buffer__object_count_ = new ArrayBuffer(this.dim * this.dim * 2);

        this.heightmap = new Int16Array(this.buffer_heightmap);
        this.materialmap = new Int16Array(this.buffer_materialmap);
        this.objectmap = new Array(this.dim * this.dim);
        this.object_count = new Int16Array(this.buffer_object_count);
        this._object_count_ = new Int16Array(this.buffer__object_count_);
        this.heapmine = new Array(this.dim * this.dim);
        this.fogmap = [new Uint16Array(this.dim * this.dim), new Uint16Array(this.dim * this.dim)];


        for (var i = 0 ; i < this.dim; i++)
            for (var j = 0; j < this.dim; j++) {
                var idx = i * this.dim + j;
                this.heightmap[idx] = (map.terrian[i][j]) || -30;
                this.materialmap[idx] = map.material[i][j];
                this.objectmap[idx] = [];
                this.object_count[idx] = 0;
            }
        this.dim1_2 = this.dim / 2;

        console.time("init_map_data");
        worker.postMessage({ flag: "init_map_data", dim: this.dim, terrian: this.heightmap, material: this.materialmap });
        AI_WORKER.postMessage("init_map_data", { dim: this.dim, terrian: this.heightmap, material: this.materialmap });

        /*
       common.naclModule.postMessage({
           flag: "init_map_data",
           dim: this.dim,
           terrian: this.buffer_heightmap,
           material: this.buffer_materialmap
       });*/

        console.timeEnd("init_map_data");
    }

    /** @description Add Game_Unit in grid map
     * @param {Game_unit} ob The Game_Unit.
     * @param {Number} x The axis x.
     * @param {Number} y The axis y.
     */
    this.set_object = function (ob, x, y) {
        // if (ob instanceof Flyable_Unit)
        //     return;

        x = x || ob.x;
        y = y || ob.y;
        var add = ob.grid_weight ?? 1;
        var sizeproperty = ob.property.property.size;

        if (!sizeproperty || (sizeproperty.h == 1 && sizeproperty.w == 1)) {
            var i = Math.round(x);
            var j = Math.round(y);
            this.objectmap[i * this.dim + j].push(ob);
            this._object_count_[i * this.dim + j] += add;
            // if (ob instanceof Construction_unit || ob instanceof Tree)
            //     this.object_count[i * this.dim + j]++;
        } else {
            var starx = Math.max(0, Math.round(x - sizeproperty.w / 2));
            var stary = Math.max(0, Math.round(y - sizeproperty.h / 2));
            var endx = Math.min(this.dim - 1, x + sizeproperty.w / 2);
            var endy = Math.min(this.dim - 1, y + sizeproperty.h / 2);
            for (var i = starx; i <= endx; i++)
                for (var j = stary; j <= endy; j++) {
                    this.objectmap[i * this.dim + j].push(ob);
                    // if (ob instanceof Construction_unit || ob instanceof Tree)
                    //     this.object_count[i * this.dim + j]++;
                    this._object_count_[i * this.dim + j] += add;
                }
        }



    }


    /** @description Remove Game_Unit in grid map
     * @param {Game_unit} ob The Game_Unit.
     * @param {Number} x The axis x.
     * @param {Number} y The axis y.
     */
    this.unset_object = function (ob, x, y) {
        // if (ob instanceof Flyable_Unit)
        //     return;
        x = x || ob.nx || ob.x;
        y = y || ob.ny || ob.y;
        var add = ob.grid_weight ?? 1;
        var sizeproperty = ob.property.property.size;
        if (!sizeproperty || (sizeproperty.h == 1 && sizeproperty.w == 1)) {
            var i = Math.round(x);
            var j = Math.round(y);
            var idx = this.objectmap[i * this.dim + j].indexOf(ob);
            if (idx > -1) {
                this.objectmap[i * this.dim + j].splice(idx, 1);
                if (ob instanceof Construction_unit || ob instanceof Tree)
                    this.object_count[i * this.dim + j]--;
                this._object_count_[i * this.dim + j] -= add;

            }
        } else {
            var starx = Math.max(0, Math.round(x - sizeproperty.w / 2));
            var stary = Math.max(0, Math.round(y - sizeproperty.h / 2));
            var endx = Math.min(this.dim - 1, x + sizeproperty.w / 2);
            var endy = Math.min(this.dim - 1, y + sizeproperty.h / 2);
            for (var i = starx; i <= endx; i++)
                for (var j = stary; j <= endy; j++) {
                    var idx = this.objectmap[i * this.dim + j].indexOf(ob);
                    if (idx > -1) {
                        this.objectmap[i * this.dim + j].splice(idx, 1);
                        if (ob instanceof Construction_unit || ob instanceof Tree)
                            this.object_count[i * this.dim + j]--;
                        this._object_count_[i * this.dim + j] -= add;
                    }
                }
        }
    }


    /** @description Move Game_Unit to other position in grid map
     * @param {Game_unit} ob The Game_Unit.
     * @param {Number} odlx The old axis x.
     * @param {Number} oldy The old axis y.
     * @param {Number} newx The new axis x.
     * @param {Number} newy The new axis y.
     */
    this.move_object = function (ob, odlx, oldy, newx, newy) {
        this.unset_object(ob, odlx, oldy);
        this.set_object(ob, newx, newy);
    }


    /** @description Get all Game_unit around object position
     * @param {Game_unit} ob The axis x.
     * @return {Array.<Game_unit>} 
     */
    this.get_around_tile = function (ob) {

        var result = [];
        var x = Math.max(1, Math.min(this.dim - 1, Math.round(ob.nx || ob.x)));
        var y = Math.max(1, Math.min(this.dim - 1, Math.round(ob.ny || ob.y)));

        result.push.apply(result, this.objectmap[x * this.dim + y - this.dim - 1]);
        result.push.apply(result, this.objectmap[x * this.dim + y - this.dim]);
        result.push.apply(result, this.objectmap[x * this.dim + y - this.dim + 1]);

        result.push.apply(result, this.objectmap[x * this.dim + y - 1]);
        result.push.apply(result, this.objectmap[x * this.dim + y]);
        result.push.apply(result, this.objectmap[x * this.dim + y + 1]);

        result.push.apply(result, this.objectmap[x * this.dim + y + this.dim - 1]);
        result.push.apply(result, this.objectmap[x * this.dim + y + this.dim]);
        result.push.apply(result, this.objectmap[x * this.dim + y + this.dim + 1]);

        return result;
    }


    /** @description Count all Game_unit at object position
     * @param {Number} x The axis x.
     * @param {Number} y The axis y.
     * @return {Number} 
     */
    this.get_tile_count = function (x, y) {
        return this._object_count_[Math.round(x) * this.dim + Math.round(y)];
    }


    /** @description Get all Game_unit at object position
     * @param {Game_unit} object The axis x.
     * @return {Array.<Game_unit>} 
     */
    this.get_tile_object = function (object) {
        return this.objectmap[(object.nx || Math.round(object.x)) * this.dim + (object.ny || Math.round(object.y))];
    }


    /** @description Check moveable to position {x,y} for pathfinding
     * @param {Number} x The axis x.
     * @param {Number} y The axis x.
     * @param {Number} height The axis x.
     * @return {Boolean} 
     */
    this.checkcanmove = function (x, y, height) {
        // Perfomance is very Importain 
        var idx = x * dim + y;
        return (x >= 0) && (x < dim)
            && this.materialmap[idx] == 0
            && Math.abs(this.heightmap[idx] - height) < 3
            && this.object_count[idx] == 0;
    }
    this.checkcanmove_fast = function (x, idx, height) {
        // Perfomance is very Importain 
        return (x >= 0) && (x < dim)
            && this.materialmap[idx] == 0
            && Math.abs(this.heightmap[idx] - height) < 3
            && this.object_count[idx] == 0;
    }



    /** @description Check moveable to position {x,y} for Game_unit move
     * @param {Number} x The axis x.
     * @param {Number} y The axis x.
     * @param {Number} height The axis x.
     * @return {Boolean} 
     */
    this.check_moveable = function (x, y, height, ob) {
        var add = (ob instanceof Solider_unit) ? 1 : 3;
        return (this.checkcanmove(x, y, height) && GRID.get_tile_count(x, y) + add < 4);
    }



    /** @description Get List of ceil can move from postion {x ,y} for path finding
     * @param {Number} x The axis x.
     * @param {Number} y The axis x.
     * @param {Number} l The height ob position {x,y}
     * @return {Array.<Ceil>} 
     */
    this.getnextstep = function (x, y, l) {
        // Perfomance is very IMPORTAIN
        var result = [], count = 0;
        var l_1 = l + 1, l_s2 = l + Math.SQRT2;
        var idx = x * dim + y;
        var height = ((x >= 0) && (x < dim)) ? this.heightmap[idx] : -10;
        this.checkcanmove_fast(x + 1, idx + dim + 1, height) && (result[count++] = { x: x + 1, y: y + 1, l: l_s2, b: idx });
        this.checkcanmove_fast(x + 1, idx + dim - 1, height) && (result[count++] = { x: x + 1, y: y - 1, l: l_s2, b: idx });
        this.checkcanmove_fast(x - 1, idx - dim + 1, height) && (result[count++] = { x: x - 1, y: y + 1, l: l_s2, b: idx });
        this.checkcanmove_fast(x - 1, idx - dim - 1, height) && (result[count++] = { x: x - 1, y: y - 1, l: l_s2, b: idx });
        this.checkcanmove_fast(x, idx + 1, height) && (result[count++] = { x: x, y: y + 1, l: l_1, b: idx });
        this.checkcanmove_fast(x, idx - 1, height) && (result[count++] = { x: x, y: y - 1, l: l_1, b: idx });
        this.checkcanmove_fast(x + 1, idx + dim, height) && (result[count++] = { x: x + 1, y: y, l: l_1, b: idx });
        this.checkcanmove_fast(x - 1, idx - dim, height) && (result[count++] = { x: x - 1, y: y, l: l_1, b: idx });
        return result;
    }


    this.getnextstep_temp = function (x, y, l) {
        // Perfomance is very IMPORTAIN
        var result = [], count = 0;
        var l_1 = l + 10, l_s2 = l + 10 * Math.SQRT2;
        var idx = x * dim + y;
        var height = ((x >= 0) && (x < dim)) ? this.heightmap[idx] : -10;
        this.checkcanmove_fast(x + 1, idx + dim + 1, height) && (result[count++] = [x + 1, y + 1, l_s2, idx]);
        this.checkcanmove_fast(x + 1, idx + dim - 1, height) && (result[count++] = [x + 1, y - 1, l_s2, idx]);
        this.checkcanmove_fast(x - 1, idx - dim + 1, height) && (result[count++] = [x - 1, y + 1, l_s2, idx]);
        this.checkcanmove_fast(x - 1, idx - dim - 1, height) && (result[count++] = [x - 1, y - 1, l_s2, idx]);
        this.checkcanmove_fast(x, idx + 1, height) && (result[count++] = [x, y + 1, l_1, idx]);
        this.checkcanmove_fast(x, idx - 1, height) && (result[count++] = [x, y - 1, l_1, idx]);
        this.checkcanmove_fast(x + 1, idx + dim, height) && (result[count++] = [x + 1, y, l_1, idx]);
        this.checkcanmove_fast(x - 1, idx - dim, height) && (result[count++] = [x - 1, y, l_1, idx]);
        return result;
    }




    /** @description Get List of ceil can move from postion {x ,y} for path finding
     * @param {Point} goal The Goal axis  .
     * @param {Number} [count_point] Count of Game_unit find point
     * @return {Array.<Ceil>} 
     */
    this.get_grid_move = function (goal, count_point) {
        // Perfomance is very Importain 
        console.time("GET GRID");
        var listgoal;

        if (goal instanceof Game_unit || goal instanceof Map_object || goal instanceof Grouph_mine)
            listgoal = goal.get_element_ceil();
        else
            listgoal = [goal];

        var tonumber = function (state) { return (state[0] * dim + state[1]) * 4 }
        var his = new Uint16Array(dim * dim * 4);
        var queue = new PriorityQueue(dim * dim);
        var state, list, length, listi, number;



        // PREPROCESSOR
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

        // RUNNING

        while (queue.length > 0) {
            state = queue.dequene();
            list = this.getnextstep_temp(state[0], state[1], state[2]);
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

        // POST PROCESS DATA
        console.timeEnd("GET GRID");
        return new grid_class(his);

        /*
        var grid = new Array(his.length / 4);
        for (var i = 0, lg = his.length; i < lg; i += 4) {
            if (his[i])
                grid[i / 4] = {
                    x: his[i],
                    y: his[i + 1],
                    l: his[i + 2] / 10,
                    b: his[i + 3],
                }
        }
        his = null;
        console.timeEnd("GET GRID");
        return grid;   */
    }


    this._grid_cache_ = {};

    this.get_grid_move_async = function (grouph, goal, farest) {

        var tonumber = function (state) { return state.x * dim + state.y }
        var his = new Array(dim * dim);
        var queue = new PriorityQueue(dim * dim);
        var state, list, length, listi, number;

        var random = Math.round(Math.random() * 10000000);
        console.time("find_path : " + random);
        groupg_idx[random] = grouph;

        if (goal instanceof Array) {
            //var list_goal = goal.map(e => ({ x: e.x, y: e.y }));
            var list_tmp = [].concat.apply([].concat.apply([], goal.map(e => e.get_element_ceil())));
            var list_goal = [], last;
            list_tmp.map(e => e.x * dim + e.y).sort().forEach(function (e) {
                if (e != last) {
                    last = e;
                    list_goal.push({ x: Math.floor(e / dim), y: e % dim });
                }
            })

            //console.log(list_goal.map(e => e.x + " - " + e.y));
            worker.postMessage({
                flag: "find_path",
                objectcount: this.object_count,
                //_object_count_: this._object_count_,
                list_goal: list_goal, r: random, farest: farest
            });
        } else if (goal instanceof Game_unit || goal instanceof Map_object) {
            var list_goal = goal.get_element_ceil();
            worker.postMessage({
                flag: "find_path",
                objectcount: this.object_count,
                // _object_count_: this._object_count_,
                list_goal: list_goal, r: random, farest: farest
            });
            /*
            common.naclModule.postMessage({
                flag: "find_path",
                objectcount: this.buffer_object_count,
                list_goal: list_goal,
                r: random
            }); */
        } else {
            var list_goal = [goal];
            var ob_goal = this.objectmap[goal.x * dim + goal.y].find(e => e instanceof Construction_unit);
            if (ob_goal)
                list_goal = ob_goal.get_element_ceil();

            worker.postMessage({
                flag: "find_path",
                objectcount: this.object_count,
                // _object_count_: this._object_count_,
                list_goal: list_goal, r: random, farest: farest
            });
            /*
            common.naclModule.postMessage({
                flag: "find_path",
                objectcount: this.buffer_object_count,
                list_goal: [goal],
                r: random
            }); */
        }
    }


    /** @description Check arear for building construction
     * @param {Number} x The axis X .
     * @param {Number} y The axis Y .
     * @param {Number} w The Width .
     * @param {Number} h The Height .
     * @return {Boolean} 
     */


    this.check_area_for_construct = function (x, y, w, h, skipthis) {
        //console.log("check_area_for_construct", x, y, w, h);
        var starx = Math.round(x - w / 2);
        var stary = Math.round(y - h / 2);
        var endx = x + w / 2 - 0.001;
        var endy = y + h / 2 - 0.001;
        //console.log("check_area_for_construct", starx, stary, endx, endy);

        if (starx < 0 || stary < 0 || endx > this.dim - 1 || endy > this.dim - 1 || !w || !h)
            return false;
        var height = this.heightmap[starx * dim + stary];
        if (skipthis) {
            var X = Math.round(x);
            var Y = Math.round(y);
            for (var i = starx; i <= endx; i++) {
                for (var j = stary; j <= endy; j++)
                    if (i != X || j != Y) {
                        if (this.get_tile_count(i, j) > 0 || height != this.heightmap[i * dim + j])
                            return false;
                    }
            }
        } else {
            for (var i = starx; i <= endx; i++) {
                for (var j = stary; j <= endy; j++) {
                    if (this.get_tile_count(i, j) > 0 || height != this.heightmap[i * dim + j])
                        return false;
                }
            }
        }

        return true;
    }


    var deltafogmap = new (function () {
        var array_index = [];
        this.get = function (sight, dx, dy) {
            var sight2 = sight * sight;
            var idx = sight + "_" + dx + "_" + dy;
            if (!array_index[idx]) {
                array_index[idx] = [];
                for (var i = -sight - 2; i <= sight + 2; i++)
                    for (var j = -sight - 2; j <= sight + 2; j++) {
                        var i_ = i - dx,
                            j_ = j - dy;
                        var c1 = (i * i + j * j < sight2);
                        var c2 = (i_ * i_ + j_ * j_ < sight2);
                        if (c1 && !c2)
                            array_index[idx].push({ i, j, value: -1 })
                        else if (!c1 && c2)
                            array_index[idx].push({ i, j, value: 1 })
                    }
            }
            return array_index[idx];
        }
    })();


    var normalnumber = function (number) {
        return (number >= 0) ? number : 0;
    }


    this.setfogmap = function (ob, x, y) {
        if (ob instanceof Game_unit && ob.team != -1 && ob.property.property.sight) {
            x = x || ob.x;
            y = y || ob.y;

            var sight = ob.property.property.sight || 10,
                sight2 = sight * sight;
            var fogmap = this.fogmap[ob.team];
            var startx = Math.max(0, Math.round(x - sight));
            var starty = Math.max(0, Math.round(y - sight));
            var endx = Math.min(this.dim - 1, x + sight);
            var endy = Math.min(this.dim - 1, y + sight);
            for (var i = startx; i < endx; i++)
                for (var j = starty; j < endy; j++) {
                    var dx = i - x,
                        dy = j - y;
                    if (dx * dx + dy * dy < sight2)
                        fogmap[i * this.dim + j]++;
                }
            if (ob.team == USER_CONTROLER.team_controler.team)
                FOG_GRAPGICH.set && FOG_GRAPGICH.set(ob, x, y);
        }
    }


    this.setmovefogmap = function (ob, bx, by, nx, ny) {

        if (Math.round(bx) != Math.round(nx) || Math.round(by) != Math.round(ny)) {
            if (ob instanceof Game_unit && ob.team != -1 && ob.property.property.sight) {
                var fogmap = this.fogmap[ob.team];
                var sight = ob.property.property.sight || 10;
                var delta_arr = deltafogmap.get(sight, nx - bx, ny - by);
                for (var i = delta_arr.length - 1; i > -1; i--) {
                    let e = delta_arr[i],
                        x = bx + e.i,
                        y = by + e.j;
                    if (x > -1 && y > -1 && x < this.dim && y < this.dim)
                        fogmap[x * this.dim + y] += e.value;
                }
                if (ob.team == USER_CONTROLER.team_controler.team)
                    FOG_GRAPGICH.move && FOG_GRAPGICH.move(ob, bx, by, nx, ny);
            }
        }
    }


    this.unsetfogmap = function (ob, x, y) {
        if (ob instanceof Game_unit && ob.team != -1 && ob.property.property.sight) {
            x = x || ob.nx || ob.x;
            y = y || ob.ny || ob.y;

            var sight = ob.property.property.sight || 10,
                sight2 = sight * sight;
            var fogmap = this.fogmap[ob.team];
            var startx = Math.max(0, Math.round(x - sight));
            var starty = Math.max(0, Math.round(y - sight));
            var endx = Math.min(this.dim - 1, x + sight);
            var endy = Math.min(this.dim - 1, y + sight);
            for (let i = startx; i < endx; i++)
                for (let j = starty; j < endy; j++) {
                    let dx = i - x,
                        dy = j - y;
                    if (dx * dx + dy * dy < sight2)
                        fogmap[i * this.dim + j]--;
                }
            if (ob.team == USER_CONTROLER.team_controler.team)
                FOG_GRAPGICH.unset && FOG_GRAPGICH.unset(ob, x, y);
        }
    }


    this.check_availble_user_fogmap = function (ob, team) {
        //return true;
        var userteam = team || USER_CONTROLER.team_controler.team;
        if (ob instanceof Game_unit) {
            if (ob.team == userteam)
                return true;
            else
                return (this.fogmap[userteam][Math.round(ob.x) * this.dim + Math.round(ob.y)] > 0);
        } else if (ob instanceof Game_weapon || ob instanceof Game_Effect || ob instanceof Tree) {
            return (this.fogmap[userteam][Math.round(ob.x) * this.dim + Math.round(ob.y)] > 0);
        } 
    }


    this.fast_check_availble_user_fogmap = function (ob, team) {
        if (ob instanceof Game_unit) {
            if (ob.team == team)
                return true;
            else
                return (this.fogmap[team][Math.round(ob.x) * this.dim + Math.round(ob.y)] > 0);
        }
    }


    this.check_availble_user_fogmap_func = this.check_availble_user_fogmap;


    this.fast_check_availble_user_fogmap_func = this.fast_check_availble_user_fogmap;




    this.update_worker = function () {
        //console.time("update_worker");
        worker.terminate();
        worker = new Worker("JS/Path_finding_worker.js");
        worker.onmessage = worker_onmessage_worker;
        worker.postMessage({
            flag: "init_map_data",
            dim: this.dim,
            terrian: this.heightmap,
            material: this.materialmap
        });
        groupg_idx = {};

        this.groupg_idx = groupg_idx;
        //console.timeEnd("update_worker");
    }
})();