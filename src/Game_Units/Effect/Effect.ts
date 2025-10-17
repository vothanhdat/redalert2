// import PIXI from "pixi.js"
import { AUDIO } from "../../Audio";
import { on_texture_load_done } from "../../Done";
import { cloundcontainer, smokecontainer, smokecontainer2, stage, variouscontainer } from "../../Game_Container";
import { Game_Effect_Base } from "../../Game_object";
import { GAME_OBJECT } from "../../Game_object_All";
import { GRID } from "../../GRID";
import { IMAGE_PROCESS } from "../../Image_process";
import { UnitRegistryClass } from "../../UnitRegistry";
import { check_available_screen, convert2screen } from "../../utils";

PIXI.loader.add({ name: "eff", url: "IMG/effect/effect.json" });

var smooketexture = new PIXI.Texture.fromImage("IMG/effect/smoke.png");

var cloundbasetexture = new PIXI.Texture.fromImage("IMG/effect/clound.png");
var cloundtexture = [];
for (var i = 0; i < 200; i += 50) {
    for (var j = 0; j < 200; j += 50) {
        cloundtexture.push(new PIXI.Texture(cloundbasetexture.baseTexture, new PIXI.Rectangle(i, j, 50, 50)));
    }
}

var lighttexture = new PIXI.Texture.fromImage("IMG/effect/die_green/prim.png");

var Light_Effect_Autoscale_List = [];


export var EFFECT = {
    init: function (property) {
        IMAGE_PROCESS.effect_sprite(property);
    },
    init_gl: function (property, listresource) {
        IMAGE_PROCESS.effect_sprite_gl(property, listresource);
    },
    load_texture_done: function (loader, resources) {
        var listresource = resources.eff.textures;
        for (var i in EFFECT_TYPE)
            EFFECT.init_gl(EFFECT_TYPE[i], listresource);
        for (var i in EFFECT_FIRE_TYPE)
            EFFECT.init_gl(EFFECT_FIRE_TYPE[i], listresource);
        on_texture_load_done("effect");
    }
}

export class Game_Effect extends Game_Effect_Base {


}


export class Effect extends Game_Effect {
    constructor(x, y, z, property, sort, not_sound) {
        super(x, y, z);
        this.sprite = IMAGE_PROCESS.getsprites(property.sprites);
        this.timeline = 0;
        this.maxtimeline = property.sprites.length;
        this.step = property.step;
        this.sort = sort;
        this.on_done = property.on_done;
        this.sort ? stage.addChild(this.sprite) : variouscontainer.addChild(this.sprite);
        property.scale && this.sprite.scale.set(property.scale);
        property.on_start && property.on_start(this);
        (!not_sound) && property.sound && AUDIO.createsound(property.sound, this, 0.15);
    }
    process(time) {
        if (Math.floor(this.timeline) >= this.maxtimeline)
            this.delete();
        else
            this.sprite.changeframe(Math.floor(this.timeline));
        this.timeline += time * this.step;
        this.sprite.z_idx = this.x + this.y;

    }
    draw() {
        let pos = convert2screen(this.x, this.y, this.z);
        if (check_available_screen(pos, 30, 30) && GRID.check_availble_user_fogmap(this)) {
            this.sprite.position.set(pos.x, pos.y);
            this.sprite.renderable = true;
        } else if (this.sprite.renderable) {
            this.sprite.renderable = false;
        }
    }
    delete() {
        super.delete();
        this.on_done && this.on_done(this);
        this.sort ? stage.removeChild(this.sprite) : variouscontainer.removeChild(this.sprite);
    }
};


export class Effect_with_smooke extends Effect {
    constructor(x, y, z, property, sort, notsound) {
        super(x, y, z, property, sort, notsound);
        var size = property.smooke_size;
        var number_smooke = Math.ceil(size * size * size * 4);
        while (number_smooke-- > 0)
            GAME_OBJECT.add_instance(new SmokeEffect(
                this.x + size * (Math.random() - 0.5),
                this.y + size * (Math.random() - 0.5),
                this.z + size * (Math.random() - 0.5)
            ));
    }
}

var CloundParticle_color = [0xffffff, 0xddffff, 0xdddddd];

export class CloundParticle extends Game_Effect {

    constructor(x, y, z, large) {
        super(x, y, z);
        this.sprite = new PIXI.Sprite(cloundtexture[Math.round(Math.random() * 16)]);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(2 + Math.random() * 4 * large);
        this.sprite.alpha = (0.3 + 0.25 * Math.random()) * 0.5;
        this.sprite.tint = CloundParticle_color[Math.floor(Math.random() * CloundParticle_color.length)];
        this.speed = (Math.random() * 0.2 + 0.9) * 0.002;
        cloundcontainer.addChild(this.sprite);
    }

    process(time) {
        this.x += time * this.speed;
        this.y -= time * this.speed;
    }
    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        if (check_available_screen(pos, this.sprite.width * 0.5, this.sprite.height * 0.5)) {
            this.sprite.position.set(pos.x, pos.y);
            this.sprite.renderable = true;
        } else if (this.sprite.renderable) {
            this.sprite.position.set(-200, -200);
            this.sprite.renderable = false;
        }
    }
    delete() {
        super.delete();
        cloundcontainer.removeChild(this.sprite);
    }
}


/**
 * @param {PIXI.Container} container
 * @param {Array.<PIXI.Sprite>} cachearray
 */
function HIGH_PERFOMANCE_REMOVE_SPRITE_IN_LOOP(container, cachearray) {
    var now_time = performance.now();
    var list_child = container.children;
    var count_delete = 0;

    for (var i = list_child.length - 1; i > -1 && count_delete < 500; i--) {

        if (list_child[i] && list_child[i].had_remove && (now_time - list_child[i].time_last) > 2000) {
            container.removeChildAt(i);
            count_delete++;
        }
    }


    for (var i = 0; i < cachearray.length; i++) {
        if (!cachearray[i].parent) {
            cachearray.splice(i, 1);
            i--;
        }
    }

}

HIGH_PERFOMANCE_REMOVE_SPRITE_IN_LOOP.data_count = {
    create: 0,
    total: 0,
    add: function (ismatch) {
        if (ismatch)
            this.create++;
        this.total++;
    },
    get rate() {
        return `${Math.round(100 * this.create / this.total)} %`;
    }
}

let Sprite_SmokeEffect_back = [];
let Sprite_SmokeEffect2_back = [];




/**
 * @param {PIXI.Container} container
 * @param {Array.<PIXI.Sprite>} cachearray
 * @param {PIXI.Texture} texture
 */
function HIGH_PERFOMANCE_GET_SPRITE(container, cachearray, texture) {
    var back_sprite = cachearray.shift();
    var sprite = back_sprite || new PIXI.Sprite(texture);
    sprite.had_remove = false;
    back_sprite || container.addChildAt(sprite, 0);
    HIGH_PERFOMANCE_REMOVE_SPRITE_IN_LOOP.data_count.add(back_sprite && true);
    return sprite;
}

/**
 * @param {PIXI.Sprite} sprite
 * @param {PIXI.Container} container
 * @param {Array.<PIXI.Sprite>} cachearray
 */
function HIGH_PERFOMANCE_REMOVE_SPRITE(sprite, container, cachearray) {
    cachearray.push(sprite);
    sprite.renderable = false;
    sprite.had_remove = true;
    sprite.time_last = performance.now();
}




export class SmokeEffect extends Game_Effect {
    static process() {
        HIGH_PERFOMANCE_REMOVE_SPRITE_IN_LOOP(smokecontainer, Sprite_SmokeEffect_back);
    }
    constructor(x, y, z) {
        super(x, y, z);
        this.sprite = HIGH_PERFOMANCE_GET_SPRITE(smokecontainer, Sprite_SmokeEffect_back, smooketexture);
        this.sprite.anchor.set(0.5, 0.5);
        this.timeline = 0;
        this.maxtime = 60 * (0.5 + Math.random());
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.vz = 3 * Math.random() + 4;
        this.scale = 0.5;
        this.alpha = 0;
    }

    process(time) {
        this.timeline += time;
        time /= 60;
        this.x += this.vx * time;
        this.y += this.vy * time;
        this.z += this.vz * time;
        this.scale += time;
        if (this.timeline < 21)
            this.alpha = this.timeline * 0.025;
        if (this.timeline > this.maxtime) {
            this.alpha -= time * 0.25;
            if (this.alpha <= 0.01)
                this.delete();
        }


    }
    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        if (check_available_screen(pos, 30, 30) && GRID.check_availble_user_fogmap(this)) {
            this.sprite.position.set(pos.x, pos.y);
            this.sprite.scale.set(this.scale);
            this.sprite.alpha = this.alpha;
            this.sprite.renderable = true;
        } else if (this.sprite.renderable) {
            this.sprite.position.set(-200, -200);
            this.sprite.renderable = false;
        }
    }
    delete() {
        super.delete();
        HIGH_PERFOMANCE_REMOVE_SPRITE(this.sprite, smokecontainer, Sprite_SmokeEffect_back);
    }
}

UnitRegistryClass['SmokeEffect'] = SmokeEffect

export class SmokeEffect2 extends Game_Effect {
    static process() {
        HIGH_PERFOMANCE_REMOVE_SPRITE_IN_LOOP(smokecontainer2, Sprite_SmokeEffect2_back);
    }
    constructor(x, y, z, vx, vy, vz, bright, r1, r2) {
        super(x, y, z);

        this.sprite = HIGH_PERFOMANCE_GET_SPRITE(smokecontainer2, Sprite_SmokeEffect2_back, smooketexture);

        this.sprite.anchor.set(0.5, 0.5);
        this.timeline = 0;
        this.scale = 0;
        this.alpha = 0;
        this.r1 = (r1 || 120) * get_random(0.5);
        this.r2 = (r2 || 0.005) * get_random(0.5);
        this.rx = vx || 0;
        this.ry = vy || 0;
        this.rz = vz || 0;
        this.bright = bright || 0.825;
        this.bright_delta = (this.bright - 0.25) / 15;
        this.light = true;
        this.is_ground = false;
        this.ground_height = GRID.heightmap[GRID.dim * Math.round(this.x) + Math.round(this.y)];
    }
    process(time) {
        this.timeline += time;
        if (this.light) {
            var value = Math.floor((this.bright - this.timeline * this.bright_delta) * 255) & 0xff;
            this.sprite.tint =
                (value << 16)
                | (((value * 0.7) & 0xff) << 8)
                | ((value * 0.5) & 0xff);

            if (this.timeline >= 15) {
                this.light = false;
                this.sprite.tint = 0x3f3f3f;
            }
        }

        var pow = Math.pow(0.95, time);
        time *= 0.01667;

        this.rx *= pow;
        this.ry *= pow;
        this.rz *= pow;


        this.x += this.rx * time;
        this.y += this.ry * time;
        this.z += this.rz * time;

        this.scale = this.timeline / this.r1 * 0.5 + 0.8;
        this.alpha = 1 - this.timeline * this.r2;
        if (this.alpha <= 0)
            this.delete();

        if (!this.is_ground && this.z - this.ground_height < 3) {
            this.is_ground = true;
            this.rx *= 0.2;
            this.ry *= 0.2;
            this.ry += 5 * Math.random() - 2.5;
            this.rx += 5 * Math.random() - 2.5;
            this.rz = 0.3 * Math.random() - 0.15;
        }
    }
    draw() {
        SmokeEffect.prototype.draw.call(this);
    }
    delete() {
        super.delete();
        HIGH_PERFOMANCE_REMOVE_SPRITE(this.sprite, smokecontainer2, Sprite_SmokeEffect2_back);
    }
}
UnitRegistryClass['SmokeEffect2'] = SmokeEffect2





export class SmokeEffect2_supersort extends SmokeEffect2 {
    constructor(...args) {
        super(...args);
        this.r2 *= 10;
    }
}

export class FireEffect extends Effect {
    constructor(parrent, x, y, z, property) {
        super(parrent.x + x, parrent.y + y, parrent.z + z, property);
        this.frame = property.start - property.end;
        this.xx = x;
        this.yy = y;
        this.zz = z;
        this.parrent = parrent;
        this.smoke_freq = 0.1;
        this.smoke_freq_info = property.smooke_freq;
    }

    process(time) {
        if (!this.parrent.isdamage)
            return;
        this.x == this.xx + this.parrent.x;
        this.y == this.yy + this.parrent.y;
        this.z == this.zz + this.parrent.z;
        (Math.random() > (1 - this.smoke_freq)) && GAME_OBJECT.add_instance(new SmokeEffect(this.x, this.y, this.z + 3));
        this.sprite.changeframe(Math.floor(this.timeline % this.frame));
        if (this.parrent.state == STATE.DELETE)
            this.delete();
        else
            this.sprite.changeframe(Math.floor(this.timeline % this.frame));
        this.smoke_freq = this.smoke_freq_info["" + Math.floor(this.timeline % this.frame)] || this.smoke_freq;
        this.timeline += time * this.step;
    }
    draw() {
        if (!this.parrent.isdamage) {
            this.sprite.renderable = false;
        } else
            super.draw();
    }
}


export class Light_Effect extends Game_Effect {
    constructor(x, y, z, tint, alpha, scale) {
        super(x, y, z);
        this.sprite = new PIXI.Sprite(lighttexture);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(scale || 2);
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD;
        this.sprite.tint = tint || 0xffffff;
        this.maxtime = 10;
        this.timeline = 0;
        this.max_alpha = Math.min(alpha, 1) || 0.5;
        variouscontainer.addChild(this.sprite);
    }
    process(time) {
        if ((this.timeline += time) >= this.maxtime)
            this.delete();
        this.sprite.alpha = (1 - Math.abs(1 - (this.timeline / this.maxtime))) * this.max_alpha;
    }
    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        this.sprite.position.set(pos.x, pos.y);
    }
    delete() {
        variouscontainer.removeChild(this.sprite);
        super.delete();
    }
}


export class Light_Effect_Autoscale extends Light_Effect {
    constructor(x, y, z, tint, alpha, scale, ratio) {
        super(x, y, z, tint, alpha, scale);
        this._idx_ = Math.round(x) * GRID.dim + Math.round(y);
        Light_Effect_Autoscale_List[this._idx_] = 1 + (Light_Effect_Autoscale_List[this._idx_] || 0);
        this.sprite.scale.set((scale || 2) * (Light_Effect_Autoscale_List[this._idx_] * (ratio || 0.05) + 1));
    }

    delete() {
        super.delete();
        Light_Effect_Autoscale_List[this._idx_]--;
    }
}


export class Repair_Effect extends Game_Effect {
    /**
     * @param {Construction_Unit} parent
     * 
    */
    constructor(parent) {
        var size = parent.size;
        super(parent.x, parent.y, parent.z + size._h * 0.8);
        var sprite = USER_CONTROLER.get_control_sprites("repair_action_animation");
        this.sprite = IMAGE_PROCESS.getsprites(sprite.sprites);
        this.step = sprite.speed;
        this.timeline = 0;
        this.parent = parent;
        variouscontainer.addChild(this.sprite);
    }

    process(time) {
        if (!this.parent.isrepair_pause)
            this.timeline += time * this.step;
        this.sprite.changeframe(Math.floor(this.timeline % this.sprite.sprites.length));
        if (!this.parent.isrepair || this.parent.state == STATE.DELETE)
            this.delete();
    }
    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        if (check_available_screen(pos, 30, 30) && GRID.check_availble_user_fogmap(this.parent)) {
            this.sprite.position.set(pos.x, pos.y);
            this.sprite.renderable = true;
        } else if (this.sprite.renderable) {
            this.sprite.renderable = false;
        }
    }

    delete() {
        variouscontainer.removeChild(this.sprite);
        super.delete();
    }
}


export class Parachutist_Sprite extends Game_Effect {
    /**
     * @param {Parachutist} parent
     * 
    */
    constructor(parent) {
        super(parent.x, parent.y, parent.z);
        this.parent = parent;
        this.dropsprite = IMAGE_PROCESS.getsprites(Parachutist.textures[parent.team]);
        this.shadowsprite = IMAGE_PROCESS.getsprite_shadow(Parachutist.shadow_texture);
        this.max_frame = this.dropsprite.sprites.length;
        this.speed = Parachutist.speed;
        this.ground_idx = 0;
        stage.addChild(this.dropsprite);
        stage.addChild(this.shadowsprite);
    }

    process(time) {
        if (this.parent.health <= 0) {
            this.delete();
        } else if (this.parent instanceof Parachutist) {
            this.x = this.parent.x;
            this.y = this.parent.y;
            this.z = this.parent.z;
            var frame = this.parent.frame_idx;
            if (frame < 14)
                this.dropsprite.changeframe(frame);
            else
                this.dropsprite.changeframe((frame - 20) % 20 + 20);

            if (frame < 7)
                this.shadowsprite.scale.set(0.6, 0.3);
            else if (frame < 13)
                this.shadowsprite.scale.set(0.6 + 0.4 * (frame - 7), 0.3 + 0.2 * (frame - 7));

            if (frame > 20) {
                var s = Math.abs((frame + 5) % 20 - 10) - 5;
                this.shadowsprite.child.anchor.x = 0.5 - s * 0.007;
            }
        } else {
            this.ground_idx += time;
            var frame = Math.floor(this.ground_idx * this.speed) + 40;
            this.dropsprite.changeframe(frame);
            this.shadowsprite.alpha *= Math.pow(0.95, time);
            this.shadowsprite.child.anchor.x += time * 0.011;
            this.shadowsprite.child.anchor.y += time * 0.011;
            this.shadowsprite.child.scale.x *= Math.pow(1.005, time);
            this.shadowsprite.child.scale.y *= Math.pow(1.005, time);
            if (frame >= this.max_frame) {
                this.delete();
            }

        }
    }


    draw() {
        let pos = convert2screen(this.x, this.y, this.z);
        let pos_shadow = convert2screen(this.x, this.y, GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)]);

        if (check_available_screen(pos, this.dropsprite.width, this.dropsprite.height)) {
            this.dropsprite.position.set(pos.x, pos.y - 10);
            this.dropsprite.z_idx = this.x + this.y + this.z * 0.01 - 0.5;
            this.dropsprite.renderable = true;
        } else if (this.dropsprite.renderable) {
            this.dropsprite.renderable = false;
        }

        if (check_available_screen(pos_shadow, this.shadowsprite.width / 2, this.shadowsprite.height / 2)) {
            this.shadowsprite.position.set(pos_shadow.x, pos_shadow.y);
            this.shadowsprite.renderable = true;
        } else {
            this.shadowsprite.renderable = false;
        }
    }

    delete() {
        stage.removeChild(this.dropsprite);
        stage.removeChild(this.shadowsprite);
        super.delete();
    }
}

export class Controler_Animation extends Game_Effect {
    constructor(x, y, z, key, sort) {
        super(x, y, z);
        var texture = USER_CONTROLER.get_control_sprites(key);
        this.sprite = IMAGE_PROCESS.getsprites(texture.sprites);
        this.timeline = 0;
        this.maxtimeline = texture.sprites.length;
        this.step = texture.speed;
        this.sort = sort;
        this.sort ? stage.addChild(this.sprite) : variouscontainer.addChild(this.sprite);
    }
    process(time) {
        if (Math.floor(this.timeline) >= this.maxtimeline)
            this.delete();
        else
            this.sprite.changeframe(Math.floor(this.timeline));
        this.timeline += time * this.step;
        this.sprite.z_idx = this.x + this.y;

    }
    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        if (check_available_screen(pos, 30, 30) && GRID.check_availble_user_fogmap(this)) {
            this.sprite.position.set(pos.x, pos.y);
            this.sprite.renderable = true;
        } else if (this.sprite.renderable) {
            this.sprite.renderable = false;
        }
    }
    delete() {
        super.delete();
        this.sort ? stage.removeChild(this.sprite) : variouscontainer.removeChild(this.sprite);
    }
}

export const CONTROLLER_ANIMATION = {
    mouse_repair: class extends Controler_Animation {
        constructor(parrent) {
            constructor(
                parrent.x,
                parrent.y,
                parrent.z + parrent.property.property.size._h,
                "repair_action_animation", true);
        }
        process(time) {
            super.process(time);
            this.sprite.z_idx = this.x + this.y - 100;
        }
    }
}


export const EFFECT_FIRE_TYPE = {};

export const EFFECT_TYPE = {};



EFFECT_TYPE.exploit1 = {
    type: "effect",
    name: "exploit1",
    path: "Img/effect/exp3/img ",
    start: 1,
    end: 14,
    step: 1 / 2,
};

EFFECT_TYPE.exploit2 = {
    type: "effect",
    name: "exploit2",
    path: "Img/effect/exp2/img ",
    sound: "Audio/gexp10a.wav",
    scale: 1.5,
    sound_vol: 0.5,
    start: 1,
    end: 14,
    step: 1 / 3,
    smooke_size: 1,
    class: Effect_with_smooke
};

EFFECT_TYPE.exploit3 = {
    type: "effect",
    name: "exploit3",
    path: "Img/effect/exp_att_3/img ",
    start: 1,
    end: 16,
    step: 1 / 2,

}

EFFECT_TYPE.exploit4 = {
    type: "effect",
    name: "exploit4",
    path: "Img/effect/exp_att_4/img ",
    start: 1,
    end: 20,
    step: 1 / 2,
    smooke_size: 1,
}

EFFECT_TYPE.exploit5 = {
    type: "effect",
    name: "exploit5",
    path: "Img/effect/exp5/img ",
    sound: "Audio/vgendiec.wav",
    start: 1,
    end: 21,
    step: 1 / 3,
    smooke_size: 1.5,
    class: Effect_with_smooke
}

EFFECT_TYPE.exploitm = {
    type: "effect",
    name: "exploitm",
    path: "Img/effect/exp_m/img ",
    start: 1,
    end: 14,
    step: 1 / 2,
}

EFFECT_TYPE.bang1 = {
    type: "effect",
    name: "bang1",
    path: "Img/effect/bang/img_1 ",
    start: 1,
    end: 8,
    step: 1 / 2,
}

EFFECT_TYPE.bang2 = {
    type: "effect",
    name: "bang2",
    path: "Img/effect/bang/img_2 ",
    sound: "Audio/vflaat2c.wav",
    sound_vol: 0.3,
    start: 1,
    end: 8,
    step: 1 / 2,
}

EFFECT_TYPE.bang3 = {
    type: "effect",
    name: "bang3",
    path: "Img/effect/bang/img_3 ",
    start: 1,
    end: 13,
    step: 1 / 3,
}

EFFECT_TYPE.pow_exp = {
    type: "effect",
    name: "pow_exp",
    path: "Img/effect/pow_exp/img ",
    start: 1,
    end: 25,
    step: 1 / 2,
}

EFFECT_TYPE.solider_die_green = {
    type: "effect",
    name: "solider_die_green",
    path: "Img/effect/solider_die_green/img ",
    start: 1,
    end: 58,
    step: 1 / 2,
}

EFFECT_TYPE.solider_die_electron = {
    type: "effect",
    name: "solider_die_electron",
    path: "Img/effect/die_e/img ",
    start: 1,
    end: 14,
    step: 1 / 2,
}

EFFECT_TYPE.exploit_ivan = {
    type: "effect",
    name: "exploit_ivan",
    path: "Img/effect/exploit_ivan/img ",
    start: 1,
    end: 23,
    step: 1 / 2,
}

EFFECT_TYPE.solider_die_fire = {
    type: "effect",
    name: "solider_die_fire",
    path: "Img/effect/solider_fire/img ",
    start: 1,
    end: 107,
    step: 1 / 2,
    class: class extends Effect {
        constructor(x, y, z, property, sort) {
            super(x, y, z, property, sort);
            this.direct = Math.floor(Math.random() * 8);;
        }
        process(time) {
            this.timeline += time * this.step;
            this.sprite.z_idx = this.x + this.y;
            if (Math.floor(this.timeline) >= this.maxtimeline)
                this.delete();
            else if (this.timeline < 48) {
                if (Math.random() < 0.1)
                    this.direct = Math.floor(Math.random() * 8);
                this.x += MOVEABLE_UNIT.idx_xy_map[this.direct + 1].x * time * 0.03;
                this.y += MOVEABLE_UNIT.idx_xy_map[this.direct + 1].y * time * 0.03;
                this.sprite.changeframe(Math.floor(this.direct * 6 + Math.floor(this.timeline % 6)));
            } else {
                this.sprite.changeframe(Math.floor(this.timeline));
            }
        }
    }
};

EFFECT_FIRE_TYPE.fire1 = {
    type: "effect",
    name: "fire1",
    start: 1,
    end: 30,
    step: 1 / 3,
    margin: { x: 15, y: 23 },
    path: "IMG/effect/fire1/img ",
    smooke_freq: {},
}

EFFECT_FIRE_TYPE.fire2 = {
    type: "effect",
    name: "fire2",
    start: 1,
    end: 64,
    step: 1 / 3,
    margin: { x: 20, y: 35 },
    path: "IMG/effect/fire2/img ",
    smooke_freq: { "9": 0.25, "16": 0.05, "50": 0.25, "58": 0.05, "4": 0.05 },
};

EFFECT_FIRE_TYPE.fire3 = {
    type: "effect",
    name: "fire3",
    start: 1,
    end: 30,
    step: 1 / 3,
    margin: { x: 20, y: 35 },
    path: "IMG/effect/fire3/img ",
    smooke_freq: {},
};

EFFECT_TYPE.mouse_move = {
    type: "effect",
    name: "mouse_move",
    path: "Img/effect/mouse/move_point ",
    start: 1,
    end: 17,
    step: 1 / 3,
    class: class extends Effect {
        constructor(x, y, z, property, sort) {
            super(x, y, z, property, true);
        }
        process(time) {
            super.process(time);
            this.sprite.z_idx = this.x + this.y - 100;
        }
    }
};

window.EFFECT_TYPE = EFFECT_TYPE







export const CLOUND = {
    init() {
        for (var i = 0; i < 25; i++) {
            var Rx = Math.random() * 200;
            var Ry = Math.random() * 200;
            if (Math.abs(Rx - 100) + Math.abs(Ry - 100) < 100) {
                this.create_clound(Rx, Ry, 1.5);
            } else {
                i--;
            }
        }
    },
    create_clound(x, y, large) {
        large |= 1;
        var size = 5;
        var count = size * size * 0.3;
        for (var i = 0; i < count; i++) {
            var count2 = 3 + Math.random() * 4;
            var X = (Math.random() - 0.5) * size * 2 * large + x;
            var Y = (Math.random() - 0.5) * size * 2 * large + y;
            for (var j = 0; j < count2; j++) {
                var XX = X + (Math.random() - 0.5) * 2.5 * large;
                var YY = Y + (Math.random() - 0.5) * 2.5 * large;
                GAME_OBJECT.add_instance(new CloundParticle(XX, YY, 60, large));
            }
        }
    }
}


UnitRegistryClass['Game_Effect'] = Game_Effect
UnitRegistryClass['Effect'] = Effect
UnitRegistryClass['Effect_with_smooke'] = Effect_with_smooke
UnitRegistryClass['CloundParticle'] = CloundParticle
UnitRegistryClass['SmokeEffect'] = SmokeEffect
UnitRegistryClass['SmokeEffect2'] = SmokeEffect2
UnitRegistryClass['SmokeEffect2_supersort'] = SmokeEffect2_supersort
UnitRegistryClass['FireEffect'] = FireEffect
UnitRegistryClass['Light_Effect'] = Light_Effect
UnitRegistryClass['Light_Effect_Autoscale'] = Light_Effect_Autoscale
UnitRegistryClass['Repair_Effect'] = Repair_Effect
UnitRegistryClass['Parachutist_Sprite'] = Parachutist_Sprite
UnitRegistryClass['Controler_Animation'] = Controler_Animation


