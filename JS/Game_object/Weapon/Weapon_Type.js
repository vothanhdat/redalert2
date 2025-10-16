/// <reference path="Weapon.js" />
"use strict";

/********************************************************

//-------------- About damage and shield ----------------//

_1 : Biological
_2 : Structural
_3 : Electrical
_4 : Thermal

//-------------- About damage and shield ----------------//

**********************************************************/


var ATTACK_TYPE = {};


ATTACK_TYPE.attack_prims = {
    name: "attack_prims",
    type: "attack",
    die_effect_solider: "solider_die_electron",
    static_init: null,
    weight: 1,
    /**
     * @param {Weapon} object
     */
    init (object) {
        var color = TEAM[object.team].color || [255, 255, 255];
        object.color = (color[0] << 16) | (color[1] << 8) | (color[2]);
        GAME_OBJECT.add_instance(new Light_Effect(
            object.distination.x,
            object.distination.y,
            object.distination.z,
            0x999999 | object.color,
            this.weight * 0.7));
        object.parrent.deep || AUDIO.createsound(this.audio.audio, {
            x: (object.parrent.x + object.distination.x) * 0.5,
            y: (object.parrent.y + object.distination.y) * 0.5,
            z: (object.parrent.z + object.distination.z) * 0.5,
        }, 0.15 * this.weight);
    },
    process (object, dont_use, time) {

        if (object.timeline > 10)
            object.delete();
        if (!object.first) {
            object.first = true;
            return this.weight;
        };
    },
    draw (object, static_object) {
        if (!object.line) {
            object.line = createline(object.pos1, object.pos2);
            object.line.tint = 0x777777 | object.color;
            particlecontainer.addChild(object.line);
        } else {
            updateline(object.line, object.pos1, object.pos2);
        }
        object.line.scale.y = 2.5 * Math.abs(10 - object.timeline) / 5 * this.weight;
    },
    on_delete (object, static_object) {
        particlecontainer.removeChild(object.line);
        delete object.line;
    },
    property: {
        attack: { _1: 10, _2: 0, _3: 0, _4: 40, area: 0 },
        timeline: 10,
    },
    audio: {
        audio: "Audio/bpriat1a.wav"
    }
};


ATTACK_TYPE.attack_heavy_prims = {
    __proto__: ATTACK_TYPE.attack_prims,
    name: "attack_heavy_prims",
    weight: 1.5,
    draw(object, static_object) {
        static_object.__proto__.draw(object, static_object);
        if (!object.line1) {
            object.line1 = createline(object.pos1, object.pos2);
            object.line1.tint = 0x777777 | object.color;
            particlecontainer.addChild(object.line1);
        } else {
            updateline(object.line1, object.pos1, object.pos2);
        }
        object.line1.scale.y = 2 * Math.abs(10 - object.timeline) / 5 * static_object.weight;
    },
    on_delete (object, static_object) {
        particlecontainer.removeChild(object.line1);
        static_object.__proto__.on_delete(object, static_object);
    },
    property: {
        attack: { _1: 10, _2: 0, _3: 0, _4: 100, area: 0 },
        timeline: 10,
    },
}



ATTACK_TYPE.attack_super_prims = {
    __proto__: ATTACK_TYPE.attack_prims,
    name: "attack_super_prims",
    init (object) {
        ATTACK_TYPE.attack_prims.init(object);
        var deep = object.parrent.deep || 0;
        var distination = object.distination;
        var newdistination = {
            get x() { return distination.x },
            get y() { return distination.y },
            get z() { return distination.z },
            team: object.parrent.team,
            attackdam: object.parrent.attackdam,
            height: 0,
            deep: 1 + (deep || 0),
        }
        var x = Math.round(newdistination.nx || newdistination.x),
            y = Math.round(newdistination.ny || newdistination.y);
        var has_reflex = GRID.objectmap[x * GRID.dim + y].some(e => e instanceof Movealbe_unit);
        if (deep < 1 && has_reflex) {
            var starx = Math.round(Math.max(0, x - 2)),
                 stary = Math.round(Math.max(0, y - 2)),
                 endx = Math.min(GRID.dim - 1, x + 2),
                 endy = Math.min(GRID.dim - 1, y + 2);
            for (var i = starx; i <= endx; i++)
                for (var j = stary; j <= endy; j++) {
                    if (i == x && j == y)
                        continue;
                    var tmp = GRID.objectmap[i * GRID.dim + j];
                    if (tmp && tmp.length > 0) {
                        if (Math.random() < 0.2)
                            GAME_OBJECT.add_instance(new Weapon(newdistination, tmp[0], ATTACK_TYPE.attack_super_prims));
                    } else if (Math.random() < 0.05) {
                        var dis = { __proto__: newdistination, x: i, y: j };
                        GAME_OBJECT.add_instance(new Weapon(newdistination, dis, ATTACK_TYPE.attack_super_prims));
                    }
                }
        }
    },
    process(object, static_ob, time) {
        if (object.parrent.deep) {
            object.x = object.parrent.x;
            object.y = object.parrent.y;
            object.z = object.parrent.z;
        }
        return static_ob.__proto__.process(object, static_ob, time);
    }
}



ATTACK_TYPE.attack_tesla = {
    name: "attack_tesla",
    type: "attack",
    die_effect_solider: "solider_die_electron",
    weight: 1.8,
    color: [0xaaffff, 0xffff88],
    audio: {
        audio: "Audio/btesat1a.wav"
    },
    audio_volume: 0.14,
    light_alpha: 0.5,
    static_init (ob) { },
    init (object) {
        object.idx = 0;
        GAME_OBJECT.add_instance(new Light_Effect_Autoscale(
            object.distination.x,
            object.distination.y,
            object.distination.z,
            0xaaffff, this.light_alpha));

        AUDIO.createsound(this.audio.audio, {
            x: (object.parrent.x + object.distination.x) * 0.5,
            y: (object.parrent.y + object.distination.y) * 0.5,
            z: (object.parrent.z + object.distination.z) * 0.5,
        }, this.audio_volume);
    },
    process (object, static_ob, time) {
        if (object.timeline > 10)
            object.delete();

        if (!object.first) {
            object.first = true;
            return static_ob.weight * 0.55;
        };
    },
    draw (object, static_object) {
        var case_draw = 0;
        if (object.pos1.x > 0 && object.pos1.y > 0 && object.pos1.x < window.screen_width && object.pos1.y < window.screen_height)
            case_draw = 1;
        else if (object.pos2.x > 0 && object.pos2.y > 0 && object.pos2.x < window.screen_width && object.pos2.y < window.screen_height)
            case_draw = 2;

        if (!case_draw)
            return;

        var x = object.pos1.x, y = object.pos1.y,
            endx = object.pos2.x, endy = object.pos2.y;

        graphics2.lineStyle(
            static_object.weight * (0.8 + Math.random() * 0.4),
            static_object.color[Math.floor(static_object.color.length * Math.random())],
            0.8
        );

        var arr = [];

        arr.push(x, y);
        for (var i = 0; i < 1000; i++) {
            var dx = (endx - x),
                dy = (endy - y);
            var angle = (Math.random() - 0.5) * 3 + myAtan(dy, dx);
            var length = Math.random() * 8;
            x += myCos(angle) * length;
            y += mySin(angle) * length;
            arr.push(x, y);
            if (dx * dx + dy * dy < 100)
                break;
        }

        arr.push(endx, endy);

        graphics2.drawPolygon(arr);

        graphics2.currentPath.shape.closed = false;

    },
    property: {
        attack: { _1: 10, _2: 0, _3: 50, _4: 0, area: 0 },
    },
}



ATTACK_TYPE.attack_super_tesla = {
    __proto__: ATTACK_TYPE.attack_tesla,
    name: "attack_super_tesla",
    weight: 2.5,
    audio_volume: 0.4,
    light_alpha: 1,
    color: [0xaaffff, 0xffff88, 0xffffff],
    property: {
        attack: { _1: 20, _2: 10, _3: 100, _4: 10, area: 0 },
    },
}



const _attack_rpg_step_ = Math.round(3 / GLOBAL.SPEED);
const _attack_rpg_step_1 = _attack_rpg_step_ - 1;
const _attack_rpg_max_his_ = (_attack_rpg_step_ + 1) * 5;

ATTACK_TYPE.attack_rpg = {
    name: "attack_rpg",
    type: "attack",
    audio: {
        audio: "Audio/vifvatta.wav"
    },
    init (object, static_ob) {
        object.conor_v = Math.atan2(object.distination.y - object.y, object.distination.x - object.x);
        object.conor_h = (Math.PI / 4) * (0.5 + Math.random());
        object.v = static_ob.property.v * (0.95 + Math.random() * 0.1);
        object.angel_v = static_ob.property.angel_v;
        object.his = new Queue();
        AUDIO.createsound(this.audio.audio, object, 0.2);
        object.lines = [];
        for (var i = 0; i < 5 ; i++) {
            object.lines[i] = new PIXI.Sprite(linetexture_rgb);
            object.lines[i].anchor.y = 0.5;
        }

    },
    process (object, static_ob, time) {

        /*
        if (object.parrent.enemy)
            object.distination = object.parrent.enemy;
        */
        time /= 60;
        var DX = object.distination.x - object.x;
        var DY = object.distination.y - object.y;
        var DZ = (object.distination.z - object.z) / 5;

        if (!object._delete_q) {

            if (object.distination instanceof Flyable_Unit && object.distination.angel && object.distination.v) {
                var t = Math.sqrt(DX * DX + DY * DY + DZ * DZ) / object.v * 0.5;
                DX += myCos(object.distination.angel) * t * object.distination.v;
                DY += mySin(object.distination.angel) * t * object.distination.v;
            }

            if (object.timeline > 20) {
                var max_angel_v = object.angel_v * time;
                var conor_v = myAtan(DY, DX);
                var conor_h = myAtan(DZ, Math.sqrt(DX * DX + DY * DY));
                object.conor_v += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(conor_v - object.conor_v)));
                object.conor_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(conor_h - object.conor_h)));
            }
            var h = Math.abs(myCos(object.conor_h));
            object.x += object.v * myCos(object.conor_v) * h * time;
            object.y += object.v * mySin(object.conor_v) * h * time;
            object.z += object.v * mySin(object.conor_h) * time * 5;

            object.his.enquene(convert2screenwithoutsrcpos(object.x, object.y, object.z));
            if (object.his.length() > _attack_rpg_max_his_)
                object.his.dequene();
            if (Math.abs(DX) < 0.25 && Math.abs(DY) < 0.25 && Math.abs(DZ) < 2) {
                object._delete_q = true;
                GAME_OBJECT.add_instance(new Effect(object.x + 0.6 * Math.random() - 0.3, object.y + 0.6 * Math.random() - 0.3, object.z, EFFECT_TYPE.bang2));
                return 1;
            }
        } else {
            if (object.his.length() > 0)
                object.his.dequene();
            else {
                object.delete();
            }
        }
    },
    on_delete (object, static_object) {
        if (!object._delete_q)
            GAME_OBJECT.add_instance(new Effect(object.x + 0.6 * Math.random() - 0.3, object.y + 0.6 * Math.random() - 0.3, object.z, EFFECT_TYPE.bang2));
        for (var i = 0; i < 5 ; i++) {
            object.lines[i].had_remove = true;
        }
    },
    draw (object, static_object) {

        if (check_available_screen(object.pos1, 40, 40) && GRID.check_availble_user_fogmap(object)) {
            if (!object.isdisplay) {
                object.isdisplay = true;
                for (var i = 0; i < 5 ; i++) {
                    object.lines[i].had_remove = false;
                    !object.lines[i].parent && particlecontainer.addChild(object.lines[i]);
                }
            }
            var arr = object.his.array,
                alpha = 1,
                count = 0;
            if (object._delete_q) {
                alpha = object.his.length() / _attack_rpg_max_his_;
            }

            var srcx = window.screen_x * 60;
            var srcy = window.screen_y * 30;
            for (var i = arr.length - 1 ; i > _attack_rpg_step_1 && count < 5 && alpha > 0; i -= _attack_rpg_step_) {
                var pos1 = arr[i];
                var pos2 = arr[i - _attack_rpg_step_];
                var sprite = object.lines[count];
                var distX = pos1.x - pos2.x;
                var distY = pos1.y - pos2.y;
                sprite.scale.x = Math.sqrt(distX * distX + distY * distY);
                sprite.rotation = Math.atan2(distY, distX) + Math.PI;
                sprite.alpha = alpha;
                sprite.scale.y = (alpha + 1) * 0.6;
                alpha -= 0.2;
                sprite.position.set(pos1.x - srcx, pos1.y - srcy);
                count++;
            }
        } else if (object.isdisplay) {
            object.isdisplay = false;
            for (var i = 0; i < 5 ; i++)
                object.lines[i].had_remove = true;
        }
    },
    property: {
        attack: { _1: 20, _2: 50, _3: 0, _4: 30, area: 0 },
        v: 6,
        angel_v: 6,
        timeline: 230,
    },

}


ATTACK_TYPE.attack_rpg_fast = {
    __proto__: ATTACK_TYPE.attack_rpg,
    property: {
        attack: { _1: 20, _2: 30, _3: 20, _4: 50, area: 0 },
        v: 10,
        angel_v: 10,
        timeline: 230,
    },
}


ATTACK_TYPE.attack_bomb_beag = {
    __proto__: ATTACK_TYPE.attack_rpg,
    name: "attack_bomb_beag",
    init (object, static_ob) {
        object.vx = object.parrent.v * myCos(object.parrent.angel) * (0.96 + Math.random() * 0.08);
        object.vy = object.parrent.v * mySin(object.parrent.angel) * (0.96 + Math.random() * 0.08);;
        object.vz = 0;
        object.his = new Queue();
        AUDIO.createsound(this.audio.audio, object, 0.1);
        object.lines = [];
        for (var i = 0; i < 5 ; i++) {
            object.lines[i] = new PIXI.Sprite(linetexture_rgb);
            object.lines[i].anchor.y = 0.5;
        }
    },
    process (object, static_ob, time) {
        time /= 60;
        if (!object._delete_q) {
            object.vz -= time * GRAVITY;
            object.x += object.vx * time;
            object.y += object.vy * time;
            object.z += object.vz * time;

            object.his.enquene(convert2screenwithoutsrcpos(object.x, object.y, object.z));
            if (object.his.length() > _attack_rpg_max_his_)
                object.his.dequene();
            if ((GRID.heightmap[Math.round(object.x) * GRID.dim + Math.round(object.y)] >= object.z)) {
                object.damage_point = { x: Math.round(object.x), y: Math.round(object.y) };
                object._delete_q = true;
                GAME_OBJECT.add_instance(new Effect(object.x + 0.6 * Math.random() - 0.3, object.y + 0.6 * Math.random() - 0.3, object.z, EFFECT_TYPE.exploit3));
                return 1;
            }
        } else {
            if (object.his.length() > 0)
                object.his.dequene();
            else {
                object.delete();
            }
        }
    },
    check_can_drop_bomb(ob, destination, area) {
        area = area || 2;
        if (ob instanceof Plane_unit) {
            var height = ob.z - destination.z;
            var time = Math.sqrt(2 * height / GRAVITY);
            var dis_x = ob.x + (time * ob.v * myCos(ob.angel));
            var dis_y = ob.y + (time * ob.v * mySin(ob.angel));
            var w = Math.max((destination.size ? destination.size.w : 1), area) * 0.6;
            var h = Math.max((destination.size ? destination.size.h : 1), area) * 0.6;
            if (Math.abs(dis_x - destination.x) < w
                && Math.abs(dis_y - destination.y) < h) {
                return true;
            }
        }
    }
}



ATTACK_TYPE.attack_piff = {
    name: "attack_piff",
    type: "attack",
    path: "IMG/Unit/Attack/piff/img",
    start: 1, end: 7,
    static_init () {
        var sprite = [];
        for (var i = this.start; i <= this.end; i++)
            sprite.push(PIXI.Texture.fromImage(this.path + " (" + i + ").png"));
        this.sprites = sprite;
    },
    init (object, static_object) {
        object.sprite = new PIXI.extras.MovieClip(static_object.sprites);
        object.sprite.anchor.set(0.5, 0.5);
        object.sprite.loop = false;
        object.sprite.blendMode = PIXI.BLEND_MODES.LIGHTEN;
        object.sprite.play();
        object.dx = 30 * Math.random() - 15;
        object.dy = 15 * Math.random() - 7;
        object.x = object.distination.x;
        object.y = object.distination.y;
        object.z = object.distination.z;
        variouscontainer.addChild(object.sprite);

        AUDIO.createsound(this.audio.audio, object.parrent, 0.12);

    },
    process (object, static_ob, time) {
        if (object.timeline > static_ob.sprites.length)
            object.delete();
        return time / static_ob.sprites.length;
    },
    draw (object, static_object) {
        if (check_available_screen(object.pos2) && GRID.check_availble_user_fogmap(object)) {
            object.sprite.position.x = object.pos2.x + object.dx;
            object.sprite.position.y = object.pos2.y + object.dy;
            object.sprite.renderable = true;
        } else {
            object.sprite.renderable = false;
        }
    },
    on_delete (object, static_object) {
        variouscontainer.removeChild(object.sprite);
    },
    property: {
        attack: { _1: 10, _2: 5, _3: 0, _4: 10, area: 0 },
    },
    audio: {
        audio: "Audio/vifvat2a.wav",
    }

}



ATTACK_TYPE.attack_submachine = {
    __proto__: ATTACK_TYPE.attack_piff,
    name: "attack_submachine",
    path: "IMG/Unit/Attack/submachine/img",
    start: 1, end: 12,
    property: {
        attack: { _1: 15, _2: 10, _3: 0, _4: 15, area: 0 },
    },
    audio: {
        audio: "Audio/vifvat2b.wav",
    }
}



ATTACK_TYPE.attack_snipe = {
    __proto__: ATTACK_TYPE.attack_piff,
    name: "attack_snipe",
    property: {
        attack: { _1: 10000, _2: 0, _3: 0, _4: 0, area: 0 },
    },
    audio: {
        audio: "Audio/isniatta.wav",
    }
}


ATTACK_TYPE.attack_shot = {
    __proto__: ATTACK_TYPE.attack_piff,
    name: "attack_snipe",
    property: {
        attack: { _1: 10000, _2: 0, _3: 0, _4: 0, area: 0 },
    },
    audio: {
        audio: "Audio/itanatta.wav",
    }
}


ATTACK_TYPE.attack_cannon = {
    name: "attack_cannon",
    type: "attack",
    img_path: "IMG/Unit/Attack/cannon/img.png",
    atteff: "bang2",
    audio: {
        audio: "Audio/gexpifvb.wav",
    },

    /** @description Predict unit position.
     * @param {Movealbe_unit} ob Unit object;
     * @param {Number} speed The speed( ceil per seconds).
     * @return {Ceil_grid}
     */
    predict_position (ob, X, Y, speed) {
        if (ob.group && ob.group.grid && (ob.state == STATE.MOVE || ob.state == STATE.MOVE2ATTACK)) {
            var result;
            var unit_speed = ob.v;
            var time = 0;
            var x = ob.nx, y = ob.ny;
            var now_point = ob.group.grid.get(x * GRID.dim + y);
            for (var i = 0 ; i < 6 && now_point; i++) {
                var di = x - now_point.x, dj = y - now_point.y, dx = x - X, dy = y - Y;
                x = now_point.x;
                y = now_point.y;
                if (i > 0)
                    time += ((di && dj) ? Math.SQRT2 : 1) / unit_speed;
                if (time < Math.sqrt(dx * dx + dy * dy) / speed)
                    result = now_point;
                else
                    break;
                now_point = ob.group.grid.get(now_point.b);

            }
            return result;

        }
    },
    static_init () {
        this.texture = PIXI.Texture.fromImage(this.img_path);
    },
    init (object, static_object) {
        var distination = { __proto__: object.distination };
        if (object.distination instanceof Movealbe_unit) {
            var predict = static_object.predict_position(object.distination, object.x, object.y, static_object.property.speed);
            if (predict) {
                distination.x = predict.x;
                distination.y = predict.y;
            }
        }

        var dx = distination.x - object.x;
        var dy = distination.y - object.y;
        var dz = distination.z - object.z;
        var d = Math.sqrt(dx * dx + dy * dy);
        object.v = static_object.property.speed;
        object.conor = Math.atan2(dy, dx);
        object.vz = (dz * object.v / d) + (GRAVITY * d) / (object.v * 2);
        object.sprite = new PIXI.Sprite(static_object.texture);
        object.sprite.anchor.set(0.5, 0.5);
        variouscontainer.addChild(object.sprite);
        AUDIO.createsound(this.audio.audio, { x: object.x, y: object.y, z: object.z }, 0.15);

    },
    process (object, static_ob, time) {
        time *= 0.0167;
        var v = object.v * time;
        object.vz -= time * GRAVITY;
        object.x += Math.cos(object.conor) * v;
        object.y += Math.sin(object.conor) * v;
        object.z += object.vz * time;
        //(Math.abs(object.x - object.damage_point.x) < v && Math.abs(object.y - object.damage_point.y) < v)

        if ((GRID.heightmap[Math.round(object.x) * GRID.dim + Math.round(object.y)] >= object.z)) {
            object.damage_point = { x: Math.round(object.x), y: Math.round(object.y) };
            object.delete();
            return 1;
        }
    },
    draw (object, static_object) {
        var x = object.pos1.x, y = object.pos1.y;
        if (!check_available_screen(object.pos1, 5, 5) || !GRID.check_availble_user_fogmap(object)) {
            object.sprite.renderable = false;
        } else {
            object.sprite.renderable = true;
        }
        object.sprite.position.set(x, y);
    },
    on_delete (object, static_object) {
        variouscontainer.removeChild(object.sprite);
        GAME_OBJECT.add_effect(
            object.x + 0.6 * Math.random() - 0.3,
            object.y + 0.6 * Math.random() - 0.3,
            object.z,
            EFFECT_TYPE[static_object.atteff]
        );
    },
    property: { attack: { _1: 10, _2: 10, _3: 20, _4: 50, area: 0 }, speed: 15, timeline: 500 },
}



ATTACK_TYPE.attack_strong_cannon = {
    __proto__: ATTACK_TYPE.attack_canon,
    name: "attack_strong_cannon",
    type: "attack",
    atteff: "exploit3",
    static_init: null,
    property: { attack: { _1: 10, _2: 10, _3: 30, _4: 75, area: 1 }, speed: 20, timeline: 500 },
}



ATTACK_TYPE.attack_super_cannon = {
    __proto__: ATTACK_TYPE.attack_cannon,
    name: "attack_super_cannon",
    type: "attack",
    atteff: "exploit4",
    static_init: null,
    property: { attack: { _1: 20, _2: 20, _3: 30, _4: 100, area: 1 }, speed: 15, timeline: 500 },
}



//solider_die_fire
ATTACK_TYPE.attack_fire = {
    name: "attack_fire",
    type: "attack",
    die_effect_solider: "solider_die_fire",
    static_init () {
        this.fire_texture = new PIXI.Texture.fromImage("IMG/Unit/Attack/fire_particle.png");
    },
    fire_particle: class extends Game_weapon {
        constructor(x, y, z, angel, speed, parrent) {
            super(x, y, z);
            this.vx = Math.cos(angel) * speed;
            this.vy = Math.sin(angel) * speed;
            this.vzmax = speed;
            this.parrent = parrent;
            this.timeline = 0;
            this.tick = 0;
            this.maxtimeline = 110;
            this.sprite = new PIXI.Sprite(ATTACK_TYPE.attack_fire.fire_texture);
            this.sprite.anchor.set(0.5, 0.5);
            var p1 = convert2screen(this.x, this.y, this.z);;
            var p2 = convert2screen(this.x + this.vx, this.y + this.vy, this.z);
            this.sprite.rotation = Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.PI;
            this.parrent.countfireball++;
            //firecontainer.addChild(this.sprite);
            firecontainer.addChildAt(this.sprite, 0);
            
        }
        process(time) {
            this.timeline += time;
            this.tick += time;
            time *= 0.0167;
            this.x += this.vx * time;
            this.y += this.vy * time;
            this.scale = this.timeline * 0.01;

            var dz = GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)] - this.z;
            if (this.timeline > this.maxtimeline || dz > 4)
                this.delete();
            else
                this.z += time * this.vzmax;

            if (this.tick > 10) {
                this.tick -= 10;
                this.parrent.setdam(this.x, this.y, this.scale * 4);
            }
        }
        draw() {
            this.pos = convert2screen(this.x, this.y, this.z);
            this.sprite.position.set(this.pos.x, this.pos.y);
            this.sprite.alpha = (this.timeline < 10 ?
                    (this.timeline * 0.1) : (this.timeline + 40 > this.maxtimeline ?
                        ((this.maxtimeline - this.timeline) * 0.025) : 1
                        ));
            this.sprite.scale.set(Math.max(this.scale, 0.5), this.scale);

        }
        delete () {
            firecontainer.removeChild(this.sprite);
            this.parrent.countfireball--;
            this.state = STATE.DELETE;
        }
    },

    init (object) {
        object.countfireball = 0;
        object.tick_time = 0;
        object.area_dam = [];
        object.setdam = function (x, y, area) {
            var startx = Math.round(x - area * 0.5);
            var starty = Math.round(y - area * 0.5);
            var endx = (x + area * 0.5);
            var endy = (y + area * 0.5);
            //var array = [];
            for (var i = startx; i <= endx; i++)
                for (var j = starty; j <= endy; j++) {
                    var key = i + " " + j;
                    this.area_dam[key] = 1 + (this.area_dam[key] || 0);
                }
        }
    },
    process (object, dont_use, time) {
        if (!object.stop) {
            if (Math.random() < 0.2 * GLOBAL.SPEED) {
                var angel = Math.atan2(object.distination.y - object.y, object.distination.x - object.x) + 0.1 * (Math.random() - 0.5);
                var speed = 5 * (0.8 + Math.random() * 0.4);
                GAME_OBJECT.add_instance(new ATTACK_TYPE.attack_fire.fire_particle(object.x, object.y, object.z, angel, speed, object));

            }
            if (object.parrent.state != STATE.ATTACK && object.parrent.state != STATE.DEFENSE)
                object.stop = true;

        } else if (object.countfireball == 0) {
            object.delete();
        }
        object.tick_time += time;
        if (object.tick_time > 10) {
            object.tick_time -= 10;
            object.setdamage_area2(object.area_dam, object, object.parrent.attackdam);
        }

    },
    draw () {
        
    },
    property: { attack: { _1: 0, _2: 0, _3: 0, _4: 5, area: 0 }, speed: 7, timeline: 60 },
}



ATTACK_TYPE.attack_dog = {
    name: "attack_dog",
    type: "attack",
    static_init () { },
    init (object, static_object) { },
    process (object, static_ob, time) {
        if (object.timeline > 15 && !object.isdone) {
            object.isdone = true;
            return 1;
        }
    },
    draw (object, static_object) { },
    property: { attack: { _1: 10000, _2: 0, _3: 0, _4: 0, area: 0, timeline: 30 } },
}



ATTACK_TYPE.attack_ivan_explorer = {
    name: "attack_ivan_explorer",
    type: "attack",
    static_init () { },
    init (object, static_object) {
        GAME_OBJECT.add_instance(new Effect(object.x, object.y, object.z, EFFECT_TYPE.exploit_ivan));
        object.team = -1.5;
    },
    process (object, static_ob, time) {
        if (object.timeline > 15 && !object.isdone) {
            object.isdone = true;
            return 1;
        }
    },
    draw (object, static_object) { },
    on_delete (object, static_object) { },
    property: {
        attack: { _1: 50, _2: 50, _3: 50, _4: 50, area: 2 },
    }
}

ATTACK_TYPE.attack_bomb_explorer = {
    __proto__ : ATTACK_TYPE.attack_ivan_explorer,
    name: "attack_bomb_explorer",
    type: "attack",
    static_init () { },
    init (object, static_object) {
        GAME_OBJECT.add_effect(object.x, object.y, object.z, EFFECT_TYPE.exploit5);
        object.team = -1.5;
        object.on_attack = function (ob, dam) {
            ob.health -= dam * (ob instanceof Movealbe_unit?4:1);
        }
    },
    property: {
        attack: { _1: 300, _2: 50, _3: 50, _4: 50, area: 1 },
    }
}



for (var i in ATTACK_TYPE) {
    ATTACK_TYPE[i].static_init && ATTACK_TYPE[i].static_init();
    WEAPON.init(ATTACK_TYPE[i]);
    if (ATTACK_TYPE[i].static_process) {
        WEAPON.list_static_process_function.push(ATTACK_TYPE[i].static_process);
    }
}

