"use strict";
(function () {
    var _back_array_ = [];

    class PriorityQueue {
        constructor() {
            this.heap = _back_array_;
            this.length = 0;
        }
        swap(a, b) {
            var temp = this.heap[a];
            this.heap[a] = this.heap[b];
            this.heap[b] = temp;
        }
        enquene(ob, priority) {
            var idx = this.length;
            this.length++;
            this.heap[idx] = { _1: ob, _2: priority };
            while (idx > 0) {
                var idxtemp = (idx - 1) >> 1;
                if (this.heap[idx]._2 < this.heap[idxtemp]._2)
                    this.swap(idx, idxtemp);
                else
                    break;
                idx = idxtemp;
            }
        }
        dequene() {
            this.length--;
            this.swap(0, this.length);
            var result = this.heap[this.length];
            this.heap[this.length] = undefined;
            var idx = 0, minidx, idx1;
            while ((idx1 = 1 + (idx << 1)) < this.length) {
                minidx = (idx1 + 1 < this.length && this.heap[idx1 + 1]._2 < this.heap[idx1]._2) ? (idx1 + 1) : idx1;

                //minidx = (idx1 + 1 >= this.length || (this.heap[idx1]._2 < this.heap[idx1 + 1]._2)) ? idx1 : (idx1 + 1);

                if (this.heap[idx]._2 <= this.heap[minidx]._2)
                    break;
                this.swap(minidx, idx);
                idx = minidx;
            }
            return result._1;
        }
        delete () { }
    }

    var dim, dim_1;
    var terrian;
    var material;
    var objectcount;
    var _objectcount_;
    var list_goal;
    var array_process;
    var array_height;
    var his_array;
    var farest;



    var preprocess_height = function () {

        array_height = new Uint8Array(dim * dim);

        for (var i = 0; i < dim; i++)
            for (var j = 1; j < dim; j++) {
                var idx = i * dim + j;
                var idx_ = i * dim + (j - 1);
                if (Math.abs(terrian[idx] - terrian[idx_]) > 2)
                    array_height[idx] = array_height[idx_] = 1;
            }
        for (var i = 1; i < dim; i++)
            for (var j = 0; j < dim; j++) {
                var idx = i * dim + j;
                var idx_ = (i - 1) * dim + j;
                if (Math.abs(terrian[idx] - terrian[idx_]) > 2)
                    array_height[idx] = array_height[idx_] = 1;
            }
    }


    var preprocess_his = function () {
        his_array = new Uint16Array(dim * dim * 4);

        for (var i = 0; i < dim; i++)
            for (var j = 0; j < dim; j++) {
                var IDX = (i * dim + j) * 4;
                his_array[IDX] = i;
                his_array[IDX + 1] = j;
                his_array[IDX + 2] = 65535;
            }
    }


    var pre_process_data = function () {
        array_process = new Uint8Array(dim * dim);
        var dim2 = dim * dim;
        for (var i = 0; i < dim2; i++)
            array_process[i] = material[i] || objectcount[i] || array_height[i];
    }

    var post_process_data_farest = function (x, y, radius) {
        var r2 = radius * radius;
        for (var i = 0; i < dim; i++)
            for (var j = 0; j < dim; j++) {
                var dx = i - x, dy = j - y;
                if (dx * dx + dy * dy > r2)
                    array_process[i * dim + j] = 1;
            }
    }


    function to_number(X, Y) {
        return (X * dim + Y) * 4 + 2;
    }

    var list_num = [
        { x: -4, y: 0, l: 5000 },
        { x: 4, y: 0, l: 5000 },
        { x: 0, y: -4, l: 5000 },
        { x: 0, y: 4, l: 5000 },
        { x: -10, y: 0, l: 10000 },
        { x: 10, y: 0, l: 10000 },
        { x: 0, y: -10, l: 10000 },
        { x: 0, y: 10, l: 10000 },
        { x: 7, y: 7, l: 10000 },
        { x: 7, y: -7, l: 10000 },
        { x: -7, y: 7, l: 10000 },
        { x: -7, y: -7, l: 10000 },
        { x: -15, y: 0, l: 15000 },
        { x: 15, y: 0, l: 15000 },
        { x: 0, y: -15, l: 15000 },
        { x: 0, y: 15, l: 15000 },
        { x: 10, y: 10, l: 15000 },
        { x: 10, y: -10, l: 15000 },
        { x: -10, y: 10, l: 15000 },
        { x: -10, y: -10, l: 15000 },
    ];

    var genpoint_to_near = function (x, y, his, queue) {

        for(var e of list_num) {
            var X = x + e.x,
                Y = y + e.y;
            if (X > 0 && Y > 0 && X < dim && Y < dim) {
                if (e.l < his[to_number(X, Y)])
                    his[to_number(X, Y)] = e.l;
                queue.enquene([X, Y, e.l, X * dim + Y], 5000);
            }
        }

    }


    /*
    var checkcanmove_fast = function (idx, height) {
        return array_process[idx] === 0;
    }
   */


    var getnextstep = function (x, y, l, tmp, dim) {
        // Perfomance is very IMPORTAIN
        if (x < 1 || x > dim_1 || y < 1 || y > dim_1)
            return [];
        var result = new Array(),
            count = 0;
        var l_1 = l + 10, l_s2 = l + 14;
        var idx = x * dim + y;

        if (tmp[idx + dim + 1] == 0)
            result[count++] = [x + 1, y + 1, l_s2, idx];
        if (tmp[idx + dim - 1] == 0)
            result[count++] = [x + 1, y - 1, l_s2, idx];
        if (tmp[idx - dim + 1] == 0)
            result[count++] = [x - 1, y + 1, l_s2, idx];
        if (tmp[idx - dim - 1] == 0)
            result[count++] = [x - 1, y - 1, l_s2, idx];
        if (tmp[idx + 1] == 0)
            result[count++] = [x, y + 1, l_1, idx];
        if (tmp[idx - 1] == 0)
            result[count++] = [x, y - 1, l_1, idx];
        if (tmp[idx + dim] == 0)
            result[count++] = [x + 1, y, l_1, idx];
        if (tmp[idx - dim] == 0)
            result[count++] = [x - 1, y, l_1, idx];


        return result;
    }

    var get_grid_move = function (listgoal, farest) {

        var DIM = dim;
        var queue = new PriorityQueue(DIM * DIM);
        var tonumber = function (state) { return (state[0] * DIM + state[1]) * 4 };
        var process_incell = function (his, listi) {
            var number = tonumber(listi);
            if (his[number + 2] > listi[2]) {
                queue.enquene(listi, listi[2]);
                his[number + 2] = listi[2];
                his[number + 3] = listi[3];
            }
        }
        var his = new Uint16Array(his_array);
        var tmp = array_process;

        if (!listgoal[0])
            return his;

        var goal_idx = listgoal[0].x * DIM + listgoal[0].y;
        for(var e of listgoal) {
            var f = [e.x, e.y, 0, goal_idx];
            var number = tonumber(f);
            his[number] = e.x;
            his[number + 1] = e.y;
            his[number + 2] = 0;
            his[number + 3] = goal_idx;
            genpoint_to_near(e.x, e.y, his, queue);
            queue.enquene(f, 0);
        }

        if (farest) {
            post_process_data_farest(listgoal[0].x, listgoal[0].y, farest);
            while (queue.length > 0) {
                var state = queue.dequene();
                var list = getnextstep(state[0], state[1], state[2], tmp, DIM);
                var length = list.length;
                for (var i = 0 ; i < length; i++)
                    process_incell(his, list[i]);
                //list = null;
                //state = null;
            }
        } else {
            while (queue.length > 0) {
                var state = queue.dequene();
                var list = getnextstep(state[0], state[1], state[2], tmp, DIM);
                var length = list.length;
                for (var i = 0 ; i < length; i++)
                    process_incell(his, list[i]);
                //list = null;
                //state = null;
            }
        }
        queue.delete();
        tonumber = null;
        process_incell = null;
        queue = null;
        return his;
    }

    self.onmessage = function (e) {
        switch (e.data.flag) {
            case "init_map_data":
                dim = e.data.dim;
                dim_1 = dim - 1;
                terrian = e.data.terrian;
                material = e.data.material;
                preprocess_height();
                preprocess_his();
                break;
            case "find_path":
                //console.time("GET GRID WORKER");
                // console.log(" e.data.farest : ", e.data.farest);
                objectcount = e.data.objectcount;
                //_objectcount_ = e.data._object_count_;
                list_goal = e.data.list_goal;
                farest = e.data.farest;
                pre_process_data();
                objectcount = null;
                var result = get_grid_move(list_goal, 0);
                //_objectcount_ = null;
                //console.timeEnd("GET GRID WORKER");
                var r = e.data.r;
                //console.time("SEND GRID");
                postMessage({ flag: "find_path_done", r: r, grid: result }, [result.buffer]);
                //console.timeEnd("GET GRID WORKER");
                result = null;
                list_goal = null;
                break;
        }
    }
})();
