// import PIXI from "pixi.js"
import { IMAGE_PROCESS } from "../../Image_process";
import { STATE } from "../../jsHelper";
import { on_texture_load_done } from "../../Done";
import { stage } from "../../Game_Container";
import { Map_object_Base } from "../../Game_object";
import { GRID } from "../../GRID";

PIXI.loader.add({ name: "map_ob", url: "IMG/Unit/MapObject/img.json" });

export const MAP_OBJECT = {
    init: function (property) {
        IMAGE_PROCESS.effect_sprite(property.img);
    },
    init_gl: function (property, listresource) {
        IMAGE_PROCESS.effect_sprite_gl(property.img, listresource);
    },
    load_texture_done: function (loader, resources) {
        var listresource = resources.map_ob.textures;
        console.log(listresource);
        for (var i in MAP_OBJECT_TYPE)
            MAP_OBJECT.init_gl(MAP_OBJECT_TYPE[i], listresource);
        on_texture_load_done("map_ob");
    }
}


export class Map_object extends Map_object_Base {
    constructor(x, y, z, property) {
        super(x, y, z);
        this.property = property;
    }
    init() {
        super.init();
        this.state = STATE.IDLE;
    }
}


export class Heap_mine extends Map_object {

    constructor(x, y, z, mine, property) {
        super(x, y, z, property);
        this.mine = mine;
        this.sprites = IMAGE_PROCESS.getsprites(property.img.sprites, property.img.margin);
        this.quatity = 1;
    }

    init() {
        super.init();
        stage.addChild(this.sprites);
        GRID.heapmine[this.x * GRID.dim + this.y] = this;
    }

    process(time) {
        this.sprites.changeframe(this.sprites.sprites.length * Math.min(0.99, this.quatity));
    }

    draw() {
        var scr = convert2screen(this.x, this.y, this.z);
        if (!check_available_screen(scr, 30, 30)) {
            this.sprites.renderable = false;
        } else {
            this.sprites.renderable = true;
            this.sprites.position.set(scr.x, scr.y);
            this.sprites.z_idx = this.x + this.y;
        }
    }

    on_mine(time) {
        var delta = Math.min(0.5 * time / 60, this.quatity);
        this.quatity -= delta;
        return delta * this.property.property.quatity * this.property.property.ratio;
    }

    delete() {
        super.delete();
        stage.removeChild(this.sprites);
        GRID.heapmine[this.x * GRID.dim + this.y] = null;
    }

}


export class Mine extends Map_object {

    constructor(x, y, z, property) {
        super(x, y, z, property);
        this.list_mine = [];
        this.total_temp = 0;
        this.sprites = IMAGE_PROCESS.getmovieclip(property.img.sprites, property.img.step, property.img.margin);
        this.grouph = null;
        stage.addChild(this.sprites);

    }

    init() {
        this.sprites.play();
        var range = this.property.property.range;
        for (var i = -range, x = i + this.x; i <= range; i++, x++) {
            for (var j = -range, y = j + this.y; j <= range; j++, y++)
                if ((i * i + j * j < range * range) && (i || j) && (x >= 0 && y >= 0 && x < GRID.dim && y < GRID.dim)) {
                    var heapmine = GRID.heapmine[x * GRID.dim + y]
                        || new Heap_mine(x, y, 0, this, MAP_OBJECT_TYPE[this.property.mine_type[Math.round(Math.random())]]);
                    GAME_OBJECT.add_instance(heapmine);
                    this.list_mine.push(heapmine);
                }
        }
        this.list_mine.sort((a, b) => calcfar2(this, a) - calcfar2(this, b));
        var findnear = GAME_OBJECT.list_mine.find(e => calcfar2(e, this) <= (range + 5) * (range + 5));
        this.grouph = findnear ? findnear.grouph : new Grouph_mine();;
        this.grouph.list_mine.push(this);
        GAME_OBJECT.list_mine.push(this);
        Array.prototype.push.apply(this.grouph.list_ceil, this.list_mine);
        GRID.set_object(this);
    }

    get_grouph_move() {
        if (!this.grouph._grouph_move_)
            this.grouph._grouph_move_ = { goal: this, list: [] }
        return this.grouph._grouph_move_;
    }

    get_grid() {
        if (this.grouph._grouph_move_) {
            return this.grouph._grouph_move_.grid;
        }
        if (!this.grouph.grid_move)
            this.grouph.grid_move = GRID.get_grid_move(this.grouph);
        return this.grouph.grid_move;
    }

    get_element_ceil() {
        return this.grouph.list_ceil.map(e => ({ x: e.x, y: e.y }));
    }

    draw() {
        var scr = convert2screen(this.x, this.y, this.z);
        if (!check_available_screen(scr, 30, 30)) {
            this.sprites.renderable = false;
            return;
        } else {
            this.sprites.renderable = true;
            this.sprites.position.set(scr.x, scr.y);
            this.sprites.z_idx = this.x + this.y;
        }
    }

    process(time) {
        this.total_temp += time / 600;
        var count = 0, c = 4;
        if (this.total_temp > time / 30) {
            for (var e of this.list_mine) {
                if (e.quatity >= 1)
                    continue;
                else if (count++ < c) {
                    e.quatity += this.total_temp / c;
                } else
                    break;
            }
            this.total_temp = 0;
        }
    }

    get_remain_heamine() {
        var total = 0;
        for (var i = 0, n = this.list_mine.length; i < n; ++i)
            total += this.list_mine[i].quatity;
        return total;
    }

    delete() {
        super.delete();
        stage.removeChild(this.sprites);
        for (var e of this.list_mine) {
            e.delete();
        }
        GRID.unset_object(this);
    }

}


export class Grouph_mine {
    constructor(x, y, z, property) {
        this.list_mine = [];
        this.list_ceil = [];
    }
    get_element_ceil() {
        return this.list_ceil;
    }
    get_quatity() {
        return this.list_mine.map(e => e.get_remain_heamine()).reduce((e, f) => e + f, 0);
    }

    get_total_quatity() {
        return this.list_ceil.length;
    }
    get_center() {
        if (this._center_)
            return this._center_;
        var tmp = this.list_mine.map(e => (e.x * 10000 + e.y)).reduce((e, f) => e + f, 0);
        return (this._center_ = { x: Math.floor(tmp / this.list_mine.length / 10000), y: Math.floor((tmp % 10000) / this.list_mine.length) });
    }
}




export class Simple_map_object extends Map_object {
    constructor(x, y, z, property) {
        super(x, y, z, property);

    }

    init() {

    }

    process(time) {

    }

    draw() {
        var scr = convert2screen(this.x, this.y, this.z);
        if (!check_available_screen(scr, 30, 30)) {
            this.sprites.renderable = false;
        } else {
            this.sprites.renderable = true;
            this.sprites.position.set(scr.x, scr.y);
            this.sprites.z_idx = this.x + this.y;
        }
    }

    delete() {

    }
}



export class Tree extends Map_object {
    constructor(x, y, z, property, indextype) {
        super(x, y, z, property);
        if (!property.img.sprites[indextype])
            throw Error("Tree not Found =>>>>>>>>>>>>>>>>>>>> === <<<<<<<<<<<<<<<<<<<<<<<<,,");
        this.indextype = indextype;
        this.sprite = new PIXI.Sprite(property.img.sprites[indextype]);
        this.sprite.anchor.set(0.5, 0.5);
        this.health = 150;
        this.shield = property.property.shield;
    }

    check_choose(x, y) {
        var scr = convert2screen(this.x, this.y, this.z);
        var dx = x - scr.x,
            dy = y - scr.y;
        return (dy < 10 && dy > -50 && Math.abs(dx) < 15);
    }

    init() {
        stage.addChild(this.sprite);
        GRID.set_object(this);
    }

    process(time) { }

    draw() {
        var scr = convert2screen(this.x, this.y, this.z);
        if (!check_available_screen(scr, this.sprite.width / 2, this.sprite.height / 2)) {
            this.sprite.renderable = false;
        } else {
            this.sprite.renderable = true;
            this.sprite.position.set(scr.x, scr.y);
            this.sprite.z_idx = this.x + this.y;
        }
    }

    on_attacked(attackobject, damage) {
        if (this.health <= 0) {
            this.on_destroy(attackobject);
        }
    }

    /** @description Call this method when this Unit be destroyed by attackobject
     * @param {Game_weapon} attackobject The Attack object cause destroy this Unit
     */
    on_destroy(attackobject) {
        this.delete();
        this.on_destroy = () => null;
    }

    get_element_ceil() {
        return [{ x: this.x, y: this.y }];
    }

    delete() {
        stage.removeChild(this.sprite);
        GRID.unset_object(this);
        super.delete();
    }
}



export const MAP_OBJECT_TYPE = {};


MAP_OBJECT_TYPE.goldheap1 = {
    type: "map_object",
    map_object_type: "Heap_mine",
    name: "goldheap1",
    img: {
        path: "IMG/Unit/MapObject/gold/gold/img1 ",
        start: 0, end: 12, step: 0,
        margin: { x: 30, y: 46 },
    },
    property: {
        size: { w: 1, h: 1, h_: 0 },
        quatity: 10,
        ratio: 1,
        shield: {},
    }
}


MAP_OBJECT_TYPE.goldheap2 = {
    type: "map_object",
    map_object_type: "Heap_mine",
    name: "goldheap2",
    img: {
        path: "IMG/Unit/MapObject/gold/gold/img2 ",
        start: 0, end: 12, step: 0,
        margin: { x: 30, y: 46 },
    },
    property: {
        size: { w: 1, h: 1, h_: 0 },
        quatity: 10,
        ratio: 1,
        shield: {},
    }
}


MAP_OBJECT_TYPE.gemheap1 = {
    type: "map_object",
    map_object_type: "Heap_mine",
    name: "goldheap1",
    img: {
        path: "IMG/Unit/MapObject/gold/gem/img1 ",
        start: 0, end: 12, step: 0,
        margin: { x: 30, y: 46 },
    },
    property: {
        size: { w: 1, h: 1, h_: 0 },
        quatity: 10,
        ratio: 3,
        shield: {},
    }
}


MAP_OBJECT_TYPE.gemheap2 = {
    type: "map_object",
    map_object_type: "Heap_mine",
    name: "goldheap2",
    img: {
        path: "IMG/Unit/MapObject/gold/gem/img2 ",
        start: 0, end: 12, step: 0,
        margin: { x: 30, y: 46 },
    },
    property: {
        size: { w: 1, h: 1, h_: 0 },
        quatity: 10,
        ratio: 3,
        shield: {},
    }
}


MAP_OBJECT_TYPE.goldmine = {
    type: "map_object",
    map_object_type: "Mine",
    name: "goldmine",
    img: {
        path: "IMG/Unit/MapObject/gold/Goldmine/img ",
        start: 1, end: 11, step: 1 / 3,
        margin: { x: 42, y: 44 },
    },
    property: {
        size: { w: 1, h: 1, h_: 1 },
        life: 100000000,
        shield: {},
        total_ore: 300,
        range: 4,
    },
    mine_type: ["goldheap1", "goldheap2"],
}


MAP_OBJECT_TYPE.gemmine = {
    type: "map_object",
    map_object_type: "Mine",
    name: "gemmine",
    img: {
        path: "IMG/Unit/MapObject/gold/Goldmine/img ",
        start: 1, end: 11, step: 1 / 3,
        margin: { x: 42, y: 44 },
    },
    property: {
        size: { w: 1, h: 1, h_: 1 },
        life: 100000000,
        shield: {},
        total_ore: 300,
        range: 4,
    },
    mine_type: ["gemheap1", "gemheap2"],
}


MAP_OBJECT_TYPE.tree = {
    type: "map_object",
    map_object_type: "Tree",
    name: "tree",
    img: {
        path: "IMG/Unit/MapObject/tree/tree ",
        start: 1, end: 28,
    },
    property: {
        size: { w: 1, h: 1, h_: 1 },
        life: 200,
        shield: { _1: Infinity, _2: 100, _3: 100, _4: 100 },
    },
    mine_type: ["gemheap1", "gemheap2"],
}