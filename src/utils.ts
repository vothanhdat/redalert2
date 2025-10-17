import { GLOBAL } from "./GLOBAL";
import { GRID } from "./GRID";


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

