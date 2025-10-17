import { GLOBAL } from "./GLOBAL";
import { GRID } from "./GRID";
import { UnitRegistryClass } from "./UnitRegistry";


export function convert2screen(x, y, z) {
    return {
        x: (((x - y + GRID.dim1_2) / 2 - GLOBAL.screen_x) * 60),
        y: (((x + y - GRID.dim1_2) / 2 - GLOBAL.screen_y) * 30 - (z - 10) * 6)
    }
}

export function convert2screenwithoutsrcpos(x, y, z) {
    return {
        x: Math.round(((x - y + GRID.dim1_2) / 2) * 60),
        y: Math.round(((x + y - GRID.dim1_2) / 2) * 30 - (z - 10) * 6)
    }
}

export function convert2codinate(x, y) {
    x = (x / 60 + GLOBAL.screen_x);
    y = (y / 30 + GLOBAL.screen_y);
    var X = Math.round(x + y);
    var Y = Math.round(GRID.dim1_2 - x + y);
    try {
        var temp = GLOBAL.map?.mapscr2pos[X][Y];
        return temp;
    } catch (e) {
        return { x: 0, y: 0 };
    }
}

export function checkcircle(timeline, time, circle) {
    return ((timeline % circle < 5) && ((timeline + time) % circle >= 5))
}

export function calcfar2(ob1, ob2) {
    var dx = ob1.x - ob2.x;
    var dy = ob1.y - ob2.y;
    return (dx * dx + dy * dy);
}

export function calcfar(ob1, ob2) {
    var dx = ob1.x - ob2.x;
    var dy = ob1.y - ob2.y;
    return Math.sqrt(dx * dx + dy * dy);
}


export function calcfar2_full(ob1, ob2) {
    var dx = Math.abs(ob1.x - ob2.x) + 1;
    var dy = Math.abs(ob1.y - ob2.y) + 1;
    if (ob1 instanceof UnitRegistryClass['Construction_unit']) {
        dx -= ob1.size.w * 0.5;
        dy -= ob1.size.h * 0.5;
    }
    if (ob2 instanceof UnitRegistryClass['Construction_unit']) {
        dx -= ob2.size.w * 0.5;
        dy -= ob2.size.h * 0.5;
    }
    if (dx < 0)
        dx = 0;
    if (dy < 0)
        dy = 0;
    return (dx * dx + dy * dy);
}

export function calcfar_full(ob1, ob2) {
    return Math.sqrt(calcfar2_full(ob1, ob2));
}

export function sort_unique(arr) {
    return arr.sort().filter((el, i, a) => {
        return (i == a.indexOf(el));
    });
}



export function normal_angel(angel) {
    return (angel + 7 * Math.PI) % (2 * Math.PI) - Math.PI;
}

export function check_available_screen(scr, hw, hh) {
    hw = hw || 0;
    hh = hh || 0;
    return (scr.x > -hw && scr.y > -hh && scr.x < GLOBAL.DISPLAY_WIDTH + hw && scr.y < GLOBAL.DISPLAY_HEIGHT + hh);
}

export function get_frame_idx(angel, max) {
    return Math.round(max * normal_angel(-angel + 1 * Math.PI / 4) / Math.PI);
}

export function null_func() { };


export function get_random(value) {
    return 1 + (Math.random() - 0.5) * value;
}





export const updateline = function (line, pos1, pos2) {
    var distX = pos1.x - pos2.x;
    var distY = pos1.y - pos2.y;
    var dist = Math.sqrt(distX * distX + distY * distY);
    line.scale.x = dist;
    line.anchor.y = 0.5;
    line.position.x = pos1.x;//viewWidth/2;
    line.position.y = pos1.y;//viewHeight/2;
    line.blendMode = PIXI.BLEND_MODES.ADD;
    line.rotation = Math.atan2(distY, distX) + Math.PI;
}

var linetexture = new PIXI.Texture.fromImage("IMG/Unit/Attack/Laser/laser.png");
var linetexture_rgb = new PIXI.Texture(linetexture.baseTexture, new PIXI.Rectangle(0, 1, 1, 3));
var linetexture_simple = new PIXI.Texture(linetexture.baseTexture, new PIXI.Rectangle(0, 2, 1, 1));



export const createline = function (pos1, pos2) {
    var distX = pos1.x - pos2.x;
    var distY = pos1.y - pos2.y;
    var dist = Math.sqrt(distX * distX + distY * distY);
    var sprite = new PIXI.Sprite(linetexture);
    sprite.scale.x = dist;
    sprite.anchor.y = 0.5;
    sprite.position.x = pos1.x;//viewWidth/2;
    sprite.position.y = pos1.y;//viewHeight/2;
    sprite.blendMode = PIXI.BLEND_MODES.ADD;
    sprite.rotation = Math.atan2(distY, distX) + Math.PI;
    return sprite;
}

export const createline2 = function (pos, w, h) {
    var dist = Math.sqrt(w * w + h * h);
    var sprite = new PIXI.Sprite(linetexture_simple);
    sprite.scale.x = dist;
    sprite.scale.y = 2;
    sprite.anchor.y = 0.5;
    sprite.position.x = pos.x;//viewWidth/2;
    sprite.position.y = pos.y;//viewHeight/2;
    sprite.rotation = Math.atan2(h, w);
    return sprite;
}


export function reverseArray(array) {
    var result = [];
    for (var i = array.length - 1; i >= 0; i -= 1)
        result.push(array[i]);
    return result;
}