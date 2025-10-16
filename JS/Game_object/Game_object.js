/// <reference path="GRID.js" />
/// <reference path="../Image_process.js" />
/// <reference path="../Controler.js" />
/// <reference path="../Audio.js" />
/// <reference path="../UI/Minimap.js" />
/// <reference path="~/Scripts/Javascript_helper.js" />


"use strict";



var GAME_OBJECT = new (function () {
    this.listobject = [];
    this.listattack = [];
    this.listeffect = [];
    this.listgameunit = [[], [], []];
    this.map_id_unit = {};
    this.list_mine = [];

    this.update_filterlist = function (list) {
        for (var i = 0, lg = list.length; i < lg; i++) {
            if (list[i].state == STATE.DELETE || list[i].health <= 0) {
                delete list[i];
                list.splice(i, 1);
                i--;
                lg--;
            }
        }
    }





    this.main_loop = function (time) {

        //this.listobject.forEach(e => e.process_(time));
        this.listobject.forEach(e => e.process(time));

        //console.time("s")
        this.listobject.sort((a, b) =>  a.fartogoal - b.fartogoal);
        //console.timeEnd("s");
        this.update_filterlist(this.listobject);
        this.listobject.forEach(e => e.draw());


        //this.listattack.forEach(e => e.process_(time));
        this.listattack.forEach(e => e.process(time));

        this.update_filterlist(this.listattack);
        this.listattack.forEach(e => e.draw());
        WEAPON.static_process(time);


        //this.listeffect.forEach(e => e.process_(time));
        this.listeffect.forEach(e => e.process(time));

        this.update_filterlist(this.listeffect);
        this.listeffect.forEach(e => e.draw());


        
        stage.children.sort((a, b) => (a.z_idx || 0) - (b.z_idx || 0));



        var lists = [particlecontainer];
        for(var par of lists) {
            var list = par.children;
            for (var i = 0; i < list.length; i++) {
                if (list[i].had_remove) {
                    par.removeChildAt(i);
                    i--;
                }
            }
        }



        // #region HIGHPERFOMANCE CACHE SPRITE SMOOKECONTAINER2

        // IF REMOVE IT, CACHE IS NOT CLEAN AND MEMORY WILL BE LEAK

        SmokeEffect.process();
        SmokeEffect2.process();

        // #endregion


    };


    this.add_instance = function (object) {
        if (object instanceof Game_unit || object instanceof Map_object || object instanceof Map_scrap)
            GAME_OBJECT.listobject.push(object);
        else if (object instanceof Game_weapon)
            GAME_OBJECT.listattack.push(object);
        else if (object instanceof Game_Effect)
            GAME_OBJECT.listeffect.push(object);
        object.init();
        return object;
    };

    this.map_class = {};

    this.add_class = function (classob, classname) {
        if ((typeof classob) == "function") {
            this.map_class[classname] = classob;
        } else {
            throw "Wrong class ob type";
        };
    }

    this.add_unit = function (x, y, z, team, property) {
        if (property.class) {
            return this.add_instance(new (property.class)(x, y, z, team, property));
        } else if (this.map_class[property.type]) {
            return this.add_instance(new (this.map_class[property.type])(x, y, z, team, property));
        } else {
            throw "Class type not found";
        }
    }

    this.add_effect = function (x, y, z, property, is_sort, notsound) {
        if (property.class) {
            return this.add_instance(new (property.class)(x, y, z, property, is_sort, notsound));
        } else {
            return this.add_instance(new Effect(x, y, z, property, is_sort, notsound));
        }
    }


    setInterval(function () {
        var TMP = sort_unique(GAME_OBJECT.listobject.filter(e => e instanceof Movealbe_unit).map(e => e.group))
            .forEach(e => e && e.goal && !e.listgoal && GRID.get_grid_move_async(e, e.enemy || e.goal, e.farest));
    }, 5000 / GLOBAL.SPEED);


    setInterval(function () {
        GRID.update_worker();
    }, 120000 / GLOBAL.SPEED);

})();



function convert2screen(x, y, z) {
    return {
        x: (((x - y + GRID.dim1_2) / 2 - GLOBAL.screen_x) * 60),
        y: (((x + y - GRID.dim1_2) / 2 - GLOBAL.screen_y) * 30 - (z - 10) * 6)
    }
}

function convert2screenwithoutsrcpos(x, y, z) {
    return {
        x: Math.round(((x - y + GRID.dim1_2) / 2) * 60),
        y: Math.round(((x + y - GRID.dim1_2) / 2) * 30 - (z - 10) * 6)
    }
}

function convert2codinate(x, y) {
    x = (x / 60 + window.GLOBAL.screen_x);
    y = (y / 30 + window.GLOBAL.screen_y);
    var X = Math.round(x + y);
    var Y = Math.round(GRID.dim1_2 - x + y);
    try {
        var temp = map.mapscr2pos[X][Y];
        return temp;
    } catch (e) {
        return { x: 0, y: 0 };
    }
}

function checkcircle(timeline, time, circle) {
    return ((timeline % circle < 5) && ((timeline + time) % circle >= 5))
}

function calcfar2(ob1, ob2) {
    var dx = ob1.x - ob2.x;
    var dy = ob1.y - ob2.y;
    return (dx * dx + dy * dy);
}

function calcfar(ob1, ob2) {
    var dx = ob1.x - ob2.x;
    var dy = ob1.y - ob2.y;
    return Math.sqrt(dx * dx + dy * dy);
}



function calcfar2_full(ob1, ob2) {
    var dx = Math.abs(ob1.x - ob2.x) + 1;
    var dy = Math.abs(ob1.y - ob2.y) + 1;
    if (ob1 instanceof Construction_unit) {
        dx -= ob1.size.w * 0.5;
        dy -= ob1.size.h * 0.5;
    }
    if (ob2 instanceof Construction_unit) {
        dx -= ob2.size.w * 0.5;
        dy -= ob2.size.h * 0.5;
    }
    if (dx < 0)
        dx = 0;
    if (dy < 0)
        dy = 0;
    return (dx * dx + dy * dy);
}

function calcfar_full(ob1, ob2) {
    return Math.sqrt(calcfar2_full(ob1, ob2));
}

function sort_unique(arr) {
    return arr.sort().filter(function (el, i, a) {
        return (i == a.indexOf(el));
    });
}



function normal_angel(angel) {
    return (angel + 7 * Math.PI) % (2 * Math.PI) - Math.PI;
}

function check_available_screen(scr, hw, hh) {
    hw = hw || 0;
    hh = hh || 0;
    return (scr.x > -hw && scr.y > -hh && scr.x < GLOBAL.DISPLAY_WIDTH + hw && scr.y < GLOBAL.DISPLAY_HEIGHT + hh);
}

function get_frame_idx(angel, max) {
    return Math.round(max * normal_angel(-angel + 1 * Math.PI / 4) / Math.PI);
}

function null_func() { };


function get_random(value) {
    return 1 + (Math.random() - 0.5) * value;
}





class Game_object {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z || GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)];
        this.z_idx = x + y;
        this.state = 0;
    }
    delete () {
        this.state = STATE.DELETE;
    }
    init() {
        // This will be call when create object
    }
    process(time) {
        // This will be call on game loop to process
    }
    draw() {
        // This will be call on game loop to render graphich

    }
    /*
    process_(time) {
        if (!time_ob.get(this.constructor)) {
            time_ob.set(this.constructor,new time_check(this.constructor));
        }
        var t = performance.now();
        this.process(time);
        var s = time_ob.get(this.constructor);
        s && s.add(performance.now() - t);
    }   */
}

/*
var time_ob = new WeakMap();
var list_ob = [];

function show_time() {
   for (var e of list_ob) {
       console.log(e.o , e.time);
   }
}


class time_check {
   constructor(o) {
       this.o = o;
       this.count = 0;
       this._time_ = 0;
       list_ob.push(this);
   }

   add(time) {
       this.count++;
       this._time_ += time;
   }

   get time() {
       return this._time_ / this.count;
   }
}  */