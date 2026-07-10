
"use strict";



class AI_Task {

    constructor(init, pre_condition, work_for_do, post_condition, on_done, on_fail, option) {
        this._is_working_ = false;
        this._is_done_ = false;
        this._is_fail_ = false;
        this._pre_condition_ = pre_condition;
        this._work_for_do_ = work_for_do;
        this._post_condition_ = post_condition;
        this._on_done_ = on_done;
        this._on_fail_ = on_fail;
        this._init_ = init;
        this._time_out_ = (option && option.timeout) || 10;
        this._time_out_original_ = this._time_out_;
        this._maximum_try_ = (option && option.try);
        this.ondone_data = null;
        this.onfail_data = null;
        this.parent = null;
    }

    process(time) {
        if (this._init_) {
            this._init_();
            this._init_ = null;
        }
        if (this.is_delete)
            return;
        if (!this._is_working_ && this._pre_condition_()) {
            this._is_working_ = true;
            this._work_for_do_();
            if (!this._maximum_try)
                this._work_for_do_ = function () { };
        } else if (this._is_working_) {
            if (this._post_condition_()) {
                this.on_done();
            } else if (this._time_out_ == Infinity || this._maximum_try_ <= 0) {
                this.on_fail();
            } else if ((this._time_out_ -= time) < 0) {
                this._work_for_do_();
                this._time_out_ = this._time_out_original_;
                this._maximum_try_--
            }
        }
    }

    on_done() {
        this._is_done_ = true;
        if (this.ondone_data)
            console.log("this.ondone_data", this.ondone_data);
        this._on_done_ && this._on_done_(this.ondone_data);
    }

    on_fail() {
        this._is_fail_ = true;
        this._on_fail_ && this._on_fail_(this.onfail_data);
    }
    

    cancel() {

    }

    get is_done() {
        return this._is_done_;
    }

    get is_delete() {
        return this._is_done_ || this._is_fail_;
    }

    get is_fail() {
        return this._is_fail_;
    }

}


function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}


var newInstance = function (fn, args) {
    var instance = Object.create(fn.prototype);
    fn.apply(instance, args);
    return instance;
};


class AI_Task_Grouph {
    constructor() {
        this.is_done = false;
        this.is_fail = false;
        this.task_list = [];
        this.task_map = {};
        this.now_task = null;
        this.on_listtask_fail = null;
        this.on_listtask_done = null;
        this.wait_for_new_task = false;
        AI_TASK.add_Grouph_Task(this);
    }

    add_task(name, init, pre_condition, work_for_do, post_condition, on_done, option, on_fail) {
        var task = new AI_Task(init, pre_condition, work_for_do, post_condition, on_done, on_fail, option);
        this.task_list.push(task);
        this.task_map[name] = task;
        if (!this.now_task)
            this.now_task = task;
        task._name_ = name;
        task.parent = this;
        return task;
    }

    add_common_task(common_task, argument, option, on_done,on_fail) {
        if (common_task)
            return this.add_task("",
                function () { this.task = newInstance(common_task, argument);  },
                function () { return true; },
                function () { this.task.do(); },
                function () {
                    if (this.task.is_fail())
                        this.on_fail();
                    else
                        return this.task.is_done();
                },
                on_done,
                option || { timeout: 2000, try: 1 },
                on_fail
            );
    }

    cancel() {

    }


    process(time) {
        if (this.now_task) {
            //console.log("now_task" , this.now_task._name_);
            this.now_task.process(time);
            if (this.now_task.is_done) {
                if (this.now_task.next_task) {
                    if (this.now_task.next_task == "ALL_TASK_DONE") {
                        this.task_done();
                    } else if (this.task_map[this.now_task.next_task]) {
                        this.now_task = this.task_map[this.now_task.next_task];
                    } else
                        throw new Error(`Not Found ${this.now_task.next_task} in TaskList`);
                } else {
                    var idx = this.task_list.indexOf(this.now_task);
                    if (idx >= this.task_list.length - 1) {
                        this.task_done();
                    } else {
                        this.now_task = this.task_list[idx + 1];
                    }
                }
            } else if (this.now_task.is_fail) {
                this.task_fail();
            }
        }


        for (var i = 0; i < this.task_list.length; i++) {
            if (this.task_list[i].is_delete) {
                this.task_list.splice(i, 1);
                i--;
            }
        }
        for (var i in this.task_map) {
            if (this.task_map[i].is_delete)
                delete this.task_map[i]
        }

    }

    task_done() {
        if (this.wait_for_new_task)
            return;
        this.on_listtask_done && this.on_listtask_done();
        this.is_done = true;
    }

    task_fail() {
        this.is_fail = true;
        this.on_listtask_fail && this.on_listtask_fail();
    }

    get is_delete() {
        return this.is_done || this.is_fail;
    }

}



var AI_TASK = new (function () {



    this.list_grouph = [];


    this.process = function (time) {
        for (var i in this.list_grouph) {
            this.list_grouph[i].process(time);
        }

        for (var i = 0; i < this.list_grouph.length; i++) {
            if (this.list_grouph[i].is_delete) {
                this.list_grouph.splice(i, 1);
                i--;
            }
        }
    }


    this.add_Grouph_Task = function (grouph_task) {
        this.list_grouph.push(grouph_task);
    }

})()


