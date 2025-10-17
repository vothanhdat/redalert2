// Game initialization and global variables
// This file contains the initialization code that was previously in index.html

// Declare global variables
declare global {
  interface Window {
    PIXI: any;
    $: any;
    jQuery: any;
    createjs: any;
    SPEED: number;
    GRAVITY: number;
    UI_WIDTH: number;
    UI_HEIGTH: number;
    screen_width: number;
    screen_height: number;
    display_width: number;
    display_height: number;
    screen_x: number;
    screen_y: number;
    screen_w: number;
    screen_h: number;
    max_x: number;
    max_y: number;
    map: any;
    drawtime: number;
    renderer: any;
    mouserenderer: any;
    mainstage: any;
    mouse_stage: any;
    graphics: any;
    graphics2: any;
    CONTROLER: any;
    USER_CONTROLER: any;
    FOG_GRAPGICH: any;
    MINIMAP: any;
    GAME_OBJECT: any;
    AUDIO: any;
    LOADER_SCREEN: any;
    CONSTRUCTION_UNIT: any;
    SOLIDER_UNIT: any;
    VEHICLE_UNIT: any;
    EFFECT: any;
    MAP_OBJECT: any;
    MAP_CONSTRUCTION_UNIT: any;
    PLANE_UNIT: any;
    MENU: any;
    GAME_MANAGER: any;
    animate: () => void;
    Map: any;
  }
}

// Initialize global variables
export function initGlobals() {
  // This is static share variable, do not change if not necessary
  window.SPEED = 1.5;
  window.GRAVITY = 20;
  window.UI_WIDTH = 250;
  window.UI_HEIGTH = 30;
  window.screen_width = window.innerWidth;
  window.screen_height = window.innerHeight;
  window.display_width = window.screen_width - window.UI_WIDTH;
  window.display_height = window.screen_height - window.UI_HEIGTH;
  window.screen_x = 0;
  window.screen_y = 0;
  window.screen_w = window.display_width / 60;
  window.screen_h = window.display_height / 30;
  window.max_x = 0;
  window.max_y = 0;
  window.drawtime = performance.now();

  // Initialize renderers with PIXI
  const PIXI = window.PIXI;
  window.renderer = PIXI.autoDetectRenderer({
    width: window.screen_width,
    height: window.screen_height,
    backgroundAlpha: 0,
    antialias: false
  });
  window.renderer.view.style.position = "absolute";
  window.renderer.view.style.top = "0px";
  window.renderer.view.style.left = "0px";

  window.mouserenderer = PIXI.autoDetectRenderer({
    width: 55,
    height: 43,
    backgroundAlpha: 0,
    antialias: false
  });
  window.mouserenderer.view.style.position = "absolute";
  window.mouserenderer.view.style.pointerEvents = "none";
  window.mouserenderer.view.style.cursor = 'none';
}

// Setup event handlers
export function setupEventHandlers() {
  window.onmousemove = function (event) {
    window.USER_CONTROLER.onmousemove(event);
  }

  window.ondblclick = function (event) {
    window.USER_CONTROLER.ondblclick(event);
    return true;
  }

  window.onmousedown = function (event) {
    window.USER_CONTROLER.onmousedown(event);
  }

  window.onmouseup = function (event) {
    window.USER_CONTROLER.onmouseup(event);
  }

  window.onmouseleave = function (event) {
    window.USER_CONTROLER.onmouseleave(event);
    return true;
  }

  window.onkeyup = function (event) {
    window.USER_CONTROLER.onkeyup(event);
    return true;
  }

  window.onkeydown = function (event) {
    window.USER_CONTROLER.onkeydown(event);
    return true;
  }

  window.onresize = function (e) {
    window.screen_width = window.innerWidth;
    window.screen_height = window.innerHeight;
    window.display_width = window.screen_width - window.UI_WIDTH;
    window.display_height = window.screen_height - window.UI_HEIGTH;
    window.screen_w = window.display_width / 60;
    window.screen_h = window.display_height / 30;
    window.renderer.resize(window.screen_width, window.screen_height);
    window.map && window.map.update(true);
    window.FOG_GRAPGICH && window.FOG_GRAPGICH.update(true);
    window.MINIMAP && window.MINIMAP.resize();
  }

  window.onload = function () {
    window.GAME_MANAGER.load_texture();
  }

  window.oncontextmenu = function () {
    return false;
  }
}

// Animation loop
export function setupAnimationLoop() {
  window.animate = function () {
    const deltatime = Math.min((performance.now() - window.drawtime) / 16.67, 15);
    window.drawtime = performance.now();

    window.graphics.clear();
    window.graphics2.clear();

    // 1.5ms
    window.CONTROLER.update(deltatime * window.SPEED);
    window.map.update(deltatime * window.SPEED);

    //1.5ms
    window.MINIMAP.update(deltatime * window.SPEED);

    // 0.5ms
    window.FOG_GRAPGICH.update(deltatime * window.SPEED);

    // 2 - 6ms
    window.GAME_OBJECT.main_loop(deltatime * window.SPEED);

    window.AUDIO.process();

    //0.5 - 2ms
    window.renderer.render(window.mainstage);

    requestAnimationFrame(window.animate);
  }
}

// Initialize game stages
export function initGameStages() {
  window.FOG_GRAPGICH.init();
  window.mainstage.addChild(window.FOG_GRAPGICH.get_fog_sprite_area());
  window.mainstage.addChild(window.MINIMAP.get_minimap_sprite());
  window.mouse_stage.addChild(window.USER_CONTROLER.get_mouse_sprite());
  window.AUDIO.load_sound();
}

// Game Manager
export function createGameManager() {
  window.GAME_MANAGER = {
    on_menu() {
      window.$.ajax({
        url: "src/JS/UI/Menu.html",
        async: false
      }).done(function (data: any) {
        window.$("body").append(data);
      }).fail(function (xhr: any) {
        console.error("Failed to load menu");
      });
    },
    on_unloadmenu() {
      window.$(".MENU")[0].remove();
    },
    on_start_game() {
      window.map = new window.Map("map3");
      window.MENU && window.MENU.display_progess(true);

      window.map && (window.map.on_load_done = function () {
        window.$.ajax({
          url: "src/JS/UI/Playing_layout.html",
          async: false
        }).done(function (data: any) {
          document.body.appendChild(window.renderer.view);
          window.$("body").append(data);
          window.$("body")[0].style.cursor = "none";
          document.body.appendChild(window.mouserenderer.view);
          window.MENU && window.MENU.display_progess(false);
          window.GAME_MANAGER.on_unloadmenu();
        }).fail(function (xhr: any) {
          console.error("Failed to load playing layout");
        });
      })
      window.map && (window.map.on_load_progess = function (progess: number) {
        window.MENU && window.MENU.set_progess(progess);
      });
    },
    on_unload_game() {
    },
    load_texture() {
      window.LOADER_SCREEN.on_start();
      window.PIXI.Assets.loader.onProgress.add((loader: any) => {
        window.LOADER_SCREEN.on_progess(loader.progress / 100);
      });
      window.PIXI.Assets.load([
        // Add your texture paths here
      ]).then((resources: any) => {
        window.CONSTRUCTION_UNIT.load_texture_done(null, resources);
        window.SOLIDER_UNIT.load_texture_done(null, resources);
        window.VEHICLE_UNIT.load_texture_done(null, resources);
        window.EFFECT.load_texture_done(null, resources);
        window.MAP_OBJECT.load_texture_done(null, resources);
        window.MAP_CONSTRUCTION_UNIT.load_texture_done(null, resources);
        window.PLANE_UNIT.load_texture_done(null, resources);
        window.LOADER_SCREEN.on_done_texture();
        window.GAME_MANAGER.on_menu();
      });
    },
    load_map() {
    },
    choose_campain() {
    },
    choose_skrimming() {
      this.on_start_game();
    },
    choose_multiplayer() {
    },
    choose_setting() {
    },
    choose_about() {
    }
  }
}
