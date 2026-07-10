

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

function Queue() {
    this.array = [];

    this.enquene = function (ob) {
        this.array.push(ob);
        return ob;
    }

    this.dequene = function () {
        var result = this.array[0];
        this.array.splice(0, 1);
        return result;
    }

    this.length = function () {
        return this.array.length;
    }
}

function Circular_Queue(max) {
    var array = new Array(max);
    var idx = 0;
    this.enquene = function (ob) {
        this.array[idx++] = ob;
        idx = idx % max;
    }

    /*
    @param {Number} index - index shound be from 0 to max - 1
    */
    this.get = function (index) {
        return (array[(idx-index - 1)%max])
    }
}



export { Circular_Queue, PriorityQueue, Queue };
