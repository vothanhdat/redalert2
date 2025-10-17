

"use strict";

// import { Game_unit } from "./Game_Unit";
import { GLOBAL } from "./GLOBAL";
import { GRID } from "./GRID";
import { STATE } from "./jsHelper";
// import { Map_object } from "./Game_Units/Map_Object/Map_object";
// import { Map_scrap } from "./Game_Units/Construction/Map_Construction_Unit";
// import { Game_Effect } from "./Game_Units/Effect/Effect";
// import { Game_weapon } from "./Game_Units/Weapon/Weapon";


class Game_object {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z || GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)];
        this.z_idx = x + y;
        this.state = 0;
    }
    delete() {
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

export class Game_Unit_Base extends Game_object { }
export class Map_object_Base extends Game_object { }
export class Map_scrap_Base extends Game_object { }
export class Game_weapon_Base extends Game_object { }
export class Game_Effect_Base extends Game_object { }


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