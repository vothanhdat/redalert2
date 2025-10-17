import { Game_Effect_Base, Game_Unit_Base, Game_weapon_Base, Map_object_Base, Map_scrap_Base } from "./Game_object";
import { GLOBAL } from "./GLOBAL";
import { GRID } from "./GRID";
import { sort_unique } from "./utils"

export const GAME_OBJECT = new (function () {
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
        this.listobject.sort((a, b) => a.fartogoal - b.fartogoal);
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
        for (var par of lists) {
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
        if (object instanceof Game_Unit_Base || object instanceof Map_object_Base || object instanceof Map_scrap_Base)
            GAME_OBJECT.listobject.push(object);
        else if (object instanceof Game_weapon_Base)
            GAME_OBJECT.listattack.push(object);
        else if (object instanceof Game_Effect_Base)
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
