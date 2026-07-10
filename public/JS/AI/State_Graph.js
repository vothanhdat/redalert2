"use strict";

class State {
    /**
    * @constructs State
    * @param {Function} init
    * @param {Function} process
    */
    constructor(init, process) {
        this._init_ = init;
        this._process_ = process;
        this._state_graph_ = null;
    }

    /**
    @memberof State 
    */
    process(time) {
        this.init();
        this._process_(time);
    }

    /** 
    @memberof State 
    */
    init() {
        this.init = function () { };
        this._init_ && this._init_();
    }
}



class Connector {
    /**
    * @constructs Connector
    * @param {Function} condition
    * @param {Function} action
    * @param {Function} [init]
    */
    constructor(condition, action, init) {
        this._condition_ = condition;
        this._init_ = init;
        this._action_ = action;
        this._state_graph_ = null;
    }

    /** 
    @return {Boolean}
    */
    check() {
        this.init();
        return this._condition_();
    }

    /**

    */
    init() {
        this.init = function () { };
        this._init_ && this._init_();
    }


    /**

    */
    action() {
        this._action_();
    }

}



class State_Graph {
    /**
    * @constructs State_Graph
    */
    constructor() {
        this.list_state = {};
        this.list_connect = {};
        this.now_state = null;

        setInterval(function (This) { This.process(200) }, 200, this);
    }

    /**
    @param {String} name
    */
    set_init_state(name) {
        this.now_state = name;
    }

    /**
    @param {String} name
    @param {State} state
    */
    add_state(name, state) {
        this.list_state[name] = state;
        this.list_connect[name] = [];
        state._state_graph_ = this;
    }

    /**
    * @param {Connector} connector
    * @param {String} scr
    * @param {String} dis
    */
    add_connect(scr, dis, connector) {
        connector.scr = scr;
        connector.dis = dis;
        this.list_connect[connector.scr].push(connector);
        connector._state_graph_ = this;
    }

    /**
    @param {Number} time
    */
    process(time) {
        if (this.list_state[this.now_state]) {
            var now_state = this.list_state[this.now_state];
            now_state.process(time);
            for (var e of this.list_connect[this.now_state]) {
                if (e.check()) {
                    e.action();
                    this.now_state = e.dis;
                    break;
                }
            }
        } else {

        }
    }


    get present_state() {
        return this.list_state[this.now_state];
    }


}



