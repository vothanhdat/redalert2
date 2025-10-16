export function bootstrapLegacy() {
  if (globalThis.__legacyBootstrapDone) {
    return;
  }
  globalThis.__legacyBootstrapDone = true;

  const g = globalThis;

  g.SPEED = 1.5;
  g.GRAVITY = 20;
  g.UI_WIDTH = 250;
  g.UI_HEIGTH = 30;
  g.screen_width = window.innerWidth;
  g.screen_height = window.innerHeight;
  g.display_width = g.screen_width - g.UI_WIDTH;
  g.display_height = g.screen_height - g.UI_HEIGTH;
  g.screen_x = 0;
  g.screen_y = 0;
  g.screen_w = g.display_width / 60;
  g.screen_h = g.display_height / 30;
  g.max_x = 0;
  g.max_y = 0;
  g.map = undefined;
  g.drawtime = performance.now();

  if (!g.renderer) {
    g.renderer = PIXI.autoDetectRenderer(g.screen_width, g.screen_height, { transparent: true, antialias: false });
  } else if (typeof g.renderer.resize === "function") {
    g.renderer.resize(g.screen_width, g.screen_height);
  }
  g.renderer.view.style.position = "absolute";
  g.renderer.view.style.top = "0px";
  g.renderer.view.style.left = "0px";

  if (!g.mouserenderer) {
    g.mouserenderer = PIXI.autoDetectRenderer(55, 43, { transparent: true, antialias: false });
  }
  g.mouserenderer.view.style.position = "absolute";
  g.mouserenderer.view.style.pointerEvents = "none";
  g.mouserenderer.view.style.cursor = "none";

  window.onmousemove = function (event) {
    USER_CONTROLER.onmousemove(event);
  };

  window.ondblclick = function (event) {
    USER_CONTROLER.ondblclick(event);
    return true;
  };

  window.onmousedown = function (event) {
    USER_CONTROLER.onmousedown(event);
  };

  window.onmouseup = function (event) {
    USER_CONTROLER.onmouseup(event);
  };

  window.onmouseleave = function (event) {
    USER_CONTROLER.onmouseleave(event);
    return true;
  };

  window.onkeyup = function (event) {
    USER_CONTROLER.onkeyup(event);
    return true;
  };

  window.onkeydown = function (event) {
    USER_CONTROLER.onkeydown(event);
    return true;
  };

  window.onresize = function () {
    g.screen_width = window.innerWidth;
    g.screen_height = window.innerHeight;
    g.display_width = g.screen_width - g.UI_WIDTH;
    g.display_height = g.screen_height - g.UI_HEIGTH;
    g.screen_w = g.display_width / 60;
    g.screen_h = g.display_height / 30;
    g.renderer.resize(g.screen_width, g.screen_height);
    g.map && g.map.update(true);
    globalThis.FOG_GRAPGICH && globalThis.FOG_GRAPGICH.update(true);
    globalThis.MINIMAP && globalThis.MINIMAP.resize();
  };

  window.onload = function () {
    g.GAME_MANAGER.load_texture();
  };

  window.oncontextmenu = function () {
    return false;
  };

  window.animate = function () {
    var deltatime = (performance.now() - g.drawtime) / 16.67;
    if (deltatime > 15) {
      deltatime = 1;
    }
    g.drawtime = performance.now();

    globalThis.graphics.clear();
    globalThis.graphics2.clear();

    globalThis.CONTROLER.update(deltatime * g.SPEED);

    g.map.update(deltatime * g.SPEED);

    globalThis.MINIMAP.update(deltatime * g.SPEED);

    globalThis.FOG_GRAPGICH.update(deltatime * g.SPEED);

    globalThis.GAME_OBJECT.main_loop(deltatime * g.SPEED);

    globalThis.AUDIO.process();

    g.renderer.render(globalThis.mainstage);

    requestAnimationFrame(window.animate);
  };

  globalThis.FOG_GRAPGICH.init();

  globalThis.mainstage.addChild(globalThis.FOG_GRAPGICH.get_fog_sprite_area());
  globalThis.mainstage.addChild(globalThis.MINIMAP.get_minimap_sprite());

  globalThis.mouse_stage.addChild(USER_CONTROLER.get_mouse_sprite());

  globalThis.AUDIO.load_sound();

  g.GAME_MANAGER = {
    on_menu() {
      $.ajax({
        url: "JS/UI/Menu.html",
        async: false
      }).done(function (data) {
        $("body").append(data);
      }).fail(function () {
      });
    },
    on_unloadmenu() {
      $(".MENU")[0].remove();
    },
    on_start_game() {
      g.map = new Map("map3");
      globalThis.MENU && globalThis.MENU.display_progess(true);

      g.map && (g.map.on_load_done = function () {
        $.ajax({
          url: "JS/UI/Playing_layout.html",
          async: false
        }).done(function (data) {
          document.body.appendChild(g.renderer.view);
          $("body").append(data);
          $("body")[0].style.cursor = "none";
          document.body.appendChild(g.mouserenderer.view);
          globalThis.MENU && globalThis.MENU.display_progess(false);
          g.GAME_MANAGER.on_unloadmenu();
        }).fail(function () {
        });
      });
      g.map && (g.map.on_load_progess = function (progress) {
        globalThis.MENU && globalThis.MENU.set_progess(progress);
      });
    },
    on_unload_game() {
    },
    load_texture() {
      globalThis.LOADER_SCREEN.on_start();
      PIXI.loader.on("progress", function (loader) {
        globalThis.LOADER_SCREEN.on_progess(loader.progress / 100);
      });
      PIXI.loader.load(function (loader, resources) {
        globalThis.CONSTRUCTION_UNIT.load_texture_done(loader, resources);
        globalThis.SOLIDER_UNIT.load_texture_done(loader, resources);
        globalThis.VEHICLE_UNIT.load_texture_done(loader, resources);
        globalThis.EFFECT.load_texture_done(loader, resources);
        globalThis.MAP_OBJECT.load_texture_done(loader, resources);
        globalThis.MAP_CONSTRUCTION_UNIT.load_texture_done(loader, resources);
        globalThis.PLANE_UNIT.load_texture_done(loader, resources);
        globalThis.LOADER_SCREEN.on_done_texture();
        g.GAME_MANAGER.on_menu();
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
  };
}
