// import PIXI from "pixi.js"

var GLOBAL = (() => {

    var SPEED = 1.5;

    var GRAVITY = 20;
    var UI_WIDTH = 250, UI_HEIGTH = 30;
    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    var DISPLAY_WIDTH = SCREEN_WIDTH - UI_WIDTH;
    var DISPLAY_HEIGHT = SCREEN_HEIGHT - UI_HEIGTH;
    var screen_x = 0;
    var screen_y = 0;
    var screen_w = DISPLAY_WIDTH / 60;
    var screen_h = DISPLAY_HEIGHT / 30;
    var max_x = 0;
    var max_y = 0;
    var map;
    var drawtime = performance.now();


    var renderer = PIXI.autoDetectRenderer(SCREEN_WIDTH, SCREEN_HEIGHT, { transparent: true, antialias: false });
    renderer.view.style.position = "absolute";
    renderer.view.style.top = "0px";
    renderer.view.style.left = "0px";


    var mouserenderer = PIXI.autoDetectRenderer(55, 43, { transparent: true, antialias: false });
    mouserenderer.view.style.position = "absolute";
    mouserenderer.view.style.pointerEvents = "none";
    mouserenderer.view.style.cursor = 'none';

    return {
        SPEED,
        GRAVITY,
        UI_WIDTH,
        UI_HEIGTH,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        DISPLAY_WIDTH,
        DISPLAY_HEIGHT,
        screen_x,
        screen_y,
        screen_w,
        screen_h,
        max_x,
        max_y,
        map,
        drawtime,
        renderer,
        mouserenderer,
    }
})()

export { GLOBAL }

