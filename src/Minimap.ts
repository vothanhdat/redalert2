// import PIXI from "pixi.js";
import { GLOBAL } from "./GLOBAL";
import { InverseAlpha, NoiseFilter } from "./jsHelper";
import { TEAM } from "./Controler";


export const FOG_GRAPGICH = new (function () {
    var backsceenx, backsceeny;

    this.get_fog_sprite_area = function () {
        return fog_sprite;
    }

    this.get_fog_sprite_texture = function () {
        return render3;
    }

    this.init = function () {

        render1 = new PIXI.RenderTexture(GLOBAL.renderer, 242, 242);
        render2 = new PIXI.RenderTexture(GLOBAL.renderer, 242, 242);
        render3 = new PIXI.RenderTexture(GLOBAL.renderer, 242, 242);
        fog_texture = new PIXI.Texture(render3.baseTexture, new PIXI.Rectangle(0, 0, 242, 242));
        fog_sprite = new PIXI.Sprite(fog_texture);

        rendersprite1 = new PIXI.Sprite(render1);
        rendersprite1_ = new PIXI.Sprite(render1);
        rendersprite2 = new PIXI.Sprite(render2);

        renderstage1 = new PIXI.Container();
        renderstage2 = new PIXI.Container();


        renderstage1.addChild(rendersprite1);

        rendersprite2.alpha = 0.5;
        renderstage2.addChild(rendersprite1_);
        renderstage2.addChild(rendersprite2);
        renderstage2.filters = [new InverseAlpha()];

        this.init = function () { };
    }

    var render1, render2, render3, fog_texture;
    var rendersprite1, rendersprite1_, rendersprite2, fog_sprite;
    var renderstage0, renderstage1, renderstage2;

    var tmp_sprite;



    var mainstage = new PIXI.Container();
    var paticile = new PIXI.ParticleContainer();
    var texture = PIXI.Texture.fromImage("IMG/effect/hidecircle.png");
    mainstage.addChild(paticile);


    var count_update = 0;

    this.update = function (force) {
        if (true) {
            switch (count_update++ % 4) {
                case 0:
                    for(var e of GAME_OBJECT.listobject) if (e.__hidesprite__) {
                        e.__hidesprite__.position.set(
                            (e.x - e.y + GRID.dim1_2) / (GRID.dim) * 242,
                            (e.x + e.y - GRID.dim1_2 - e.z * 0.2) / (GRID.dim) * 242
                        );
                    }
                    render1.render(mainstage, null, true);
                    break;
                case 1:
                    render2.render(renderstage1, null, false);
                    break;
                case 2:
                    render3.render(renderstage2, null, true);
                    break;
                case 3:
                    break;
            }

            var x = GLOBAL.screen_x * 242 / GRID.dim1_2,
                y = GLOBAL.screen_y * 242 / GRID.dim1_2,
                width = GLOBAL.DISPLAY_WIDTH / 60 * 242 / GRID.dim1_2,
                height = GLOBAL.DISPLAY_HEIGHT / 30 * 242 / GRID.dim1_2;

            x = Math.max(0, Math.min(242 - width, x));
            y = Math.max(0, Math.min(242 - height, y));

            fog_texture.frame = { x, y, width, height };

            fog_sprite.scale.set(GLOBAL.DISPLAY_WIDTH / width, GLOBAL.DISPLAY_HEIGHT / height);
        }
    }

    /**
     * @param {Game_unit} ob
     * @param {Number} x
     * @param {Number} y
     */
    this.set = function (ob, x, y) {

        var sprite = new PIXI.Sprite(texture);
        ob.__hidesprite__ = sprite;
        ob.__hidesprite__.anchor.set(0.5, 0.5);
        ob.__hidesprite__.scale.set((ob.property.property.sight || 10) / GRID.dim1_2 / 15 * 242);
        ob.__hidesprite__.position.set(
            (x - y + GRID.dim1_2) / (GRID.dim) * 242,
            (x + y - GRID.dim1_2 - ob.z * 0.2) / (GRID.dim) * 242
        );
        paticile.addChild(sprite);
    }

    /**
     * @param {Game_unit} ob
     * @param {Number} x
     * @param {Number} y
     */
    this.unset = function (ob, x, y) {
        ob.__hidesprite__ && paticile.removeChild(ob.__hidesprite__);
        ob.__hidesprite__ = undefined;
    }


})();





export const MINIMAP = new (function () {
    //var renderer = PIXI.autoDetectRenderer(242, 242, { transparent: true, antialias: false });
    var renderer = new PIXI.RenderTexture(GLOBAL.renderer, 242, 242);
    var particle_renderer = new PIXI.RenderTexture(GLOBAL.renderer, 242, 242);
    var stage = new PIXI.Container();
    var mainstage = new PIXI.Container();
    var background_sprite = new PIXI.Sprite(new PIXI.Texture.fromImage("IMG/minimap_background.jpg"))
    var ground_sprite = new PIXI.Sprite();
    var fogmap_sprite = new PIXI.Sprite();
    var paticile = new PIXI.ParticleContainer();
    var paticile_sprite = new PIXI.Sprite(particle_renderer);
    var graphich = new PIXI.Graphics();
    var mouse_l_hold = false;
    var filter = new NoiseFilter();
    var rada_state = false;
    var rada_state_delay = 0;

    var out_sprite = new PIXI.Sprite(renderer);

    mainstage.renderable = false;
    ground_sprite.renderable = false;
    fogmap_sprite.renderable = false;

    stage.addChild(background_sprite);
    stage.addChild(mainstage);

    mainstage.addChild(ground_sprite);
    mainstage.addChild(paticile_sprite);

    mainstage.addChild(fogmap_sprite);
    mainstage.addChild(graphich);





    this.onmousedown = function (e) {
        if (!rada_state)
            return;

        var x = e.offsetX * GRID.dim1_2 / 242;
        var y = e.offsetY * GRID.dim1_2 / 242;

        var X = Math.round(x + y);
        var Y = Math.round(y - x + GRID.dim);
        console.log(e.which, X, Y);
        switch (e.which) {
            case 1:
                mouse_l_hold = true;
                GLOBAL.screen_x = x - GLOBAL.screen_w / 2;
                GLOBAL.screen_y = y - GLOBAL.screen_h / 2;
                break;
            case 3:
                var X = Math.round(x + y);
                var Y = Math.round(y - x + GRID.dim1_2);

                console.log(X, Y);
                USER_CONTROLER.team_controler.send_command(
                    USER_CONTROLER.chooselist.filter(e => e instanceof Movealbe_unit),
                    { com: "move", goal: { x: X, y: Y } });
                break;
        }

    }

    this.onmousemove = function (e) {
        if (mouse_l_hold) {
            var x = e.offsetX * GRID.dim1_2 / 242;
            var y = e.offsetY * GRID.dim1_2 / 242;
            GLOBAL.screen_x = x - GLOBAL.screen_w / 2;
            GLOBAL.screen_y = y - GLOBAL.screen_h / 2;
        }
    }

    this.onmouseup = function (e) {
        switch (e.which) {
            case 1:
                mouse_l_hold = false;
                break;
            case 3:

                break;
        }
    }

    var color_texture = (function (TEAM) {
        var imagecavans = document.createElement('canvas');
        imagecavans.width = 20;
        imagecavans.height = 2;
        var imagecontext = imagecavans.getContext('2d');

        for (var i in TEAM) {
            var color = 0x1000000 | (TEAM[i].color[0] << 16) | (TEAM[i].color[1] << 8) | (TEAM[i].color[2]);
            imagecontext.fillStyle = ("#" + color.toString(16)).replace("#1", "#");
            imagecontext.fillRect(i * 2, 0, 2, 2);
        }

        imagecontext.fillStyle = "#ffffff";
        imagecontext.fillRect(18, 0, 2, 2);

        var maintexture = new PIXI.Texture.fromCanvas(imagecavans);
        var texture = [];


        for (var i in TEAM) {
            texture.push(new PIXI.Texture(maintexture.baseTexture, new PIXI.Rectangle (i * 2, 0, 2, 2)));
        }
        texture[-1] = new PIXI.Texture(maintexture.baseTexture, new PIXI.Rectangle(18, 0, 2, 2));

        return texture;
    })(TEAM);


    this.get_minimap_sprite = function () {
        out_sprite.position.x = GLOBAL.DISPLAY_WIDTH + 4;
        out_sprite.position.y = 34;
        return out_sprite;
    }


    this.resize = function () {
        if (out_sprite) {
            out_sprite.position.x = GLOBAL.DISPLAY_WIDTH + 4;
            out_sprite.position.y = 34;
        }
    }


    /** @description 
    * @param {String} url 
    * @todo update playing layout 
    */
    this.initmap = function (url) {
        ground_sprite.texture = new PIXI.Texture.fromImage(url);
        ground_sprite.renderable = true;
        fogmap_sprite.texture = FOG_GRAPGICH.get_fog_sprite_texture();
        fogmap_sprite.renderable = true;

        $("#minimap")[0].onmousedown = e => this.onmousedown(e);
        $("#minimap")[0].onmousemove = e => this.onmousemove(e);
        $("#minimap")[0].onmouseup = e => this.onmouseup(e);

    }

    /** @description 
    * @param {Game_object} ob 
    * @todo update playing layout 
    */
    this.add = function (ob) {
        ob.minimap_sprite = new PIXI.Sprite(color_texture[ob.team]);
        ob.minimap_sprite.anchor.set(0.5, 0.5);
        ob.minimap_sprite.rotation = Math.PI / 4;
        if (ob instanceof Construction_unit) {
            ob.minimap_sprite.scale.set(ob.size.w * 242 / GRID.dim1_2 / 3, ob.size.h * 242 / GRID.dim1_2 / 3);
        } else {
            ob.minimap_sprite.scale.set(242 / GRID.dim1_2 / 3);
        }
        paticile.addChild(ob.minimap_sprite);
    }

    /** @description 
    * @param {Game_object} ob 
    * @todo update playing layout 
    */
    this.remove = function (ob) {
        //ob.minimap_sprite = null;
        ob.minimap_sprite && paticile.removeChild(ob.minimap_sprite);
    }

    var count_render = 0;

    this.update = function (time) {


        // #region MINIMAP EFFECT

        rada_state_delay += (rada_state ? 1 : -1) * time * 0.007;
        rada_state_delay = Math.min(1, Math.max(rada_state_delay, 0));

        mainstage.alpha = rada_state_delay;
        ground_sprite.alpha = Math.pow(rada_state_delay, 2);

        if (rada_state_delay > 0.1 && rada_state_delay < 0.9) {
            filter.blur = 50 - Math.floor(rada_state_delay * 50);
        } else if (rada_state_delay < 0.1 && !rada_state) {
            mainstage.renderable = false;
        } else if (rada_state_delay > 0.9 && rada_state) {
            mainstage.filters = null;
            mainstage.renderable = true;
        }


        // #endregion


        // #region UPDATE GAMEUNIT POSITION

        if ((count_render += time) >= 4 && rada_state_delay > 0.1) {
            count_render = 0;
            for(var e of GAME_OBJECT.listobject) if (e.minimap_sprite) {
                if (GRID.check_availble_user_fogmap(e)) {
                    var x = (e.x - e.y + GRID.dim1_2) / (GRID.dim) * 242;;
                    var y = (e.x + e.y - GRID.dim1_2 - e.z * 0.2) / (GRID.dim) * 242;
                    e.minimap_sprite.position.set(x, y);
                } else {
                    e.minimap_sprite.position.set(-20, -20);
                }
            }
            particle_renderer.render(paticile, null, true);
        }



        // #endregion


        // #region DRAW MINIMAP INFO

        graphich.clear();

        var draw_ratio = 242 / GRID.dim1_2;

        // #region DRAW SCREEN POSITION

        graphich.lineStyle(2, 0x00FFFF);
        graphich.drawRect(
            GLOBAL.screen_x * draw_ratio,
            GLOBAL.screen_y * draw_ratio,
            GLOBAL.screen_w * draw_ratio,
            GLOBAL.screen_h * draw_ratio
        );

        // #endregion

        // #region DRAW ATTACKED POINT NOTICE

        graphich.lineStyle(2, 0xFF0000);
        var now_time = performance.now();
        for (e of (list_attacked_point = list_attacked_point.filter(e=> now_time - e.time < 3200))) {
            var r = 7.0 - 0.006 * ((now_time - e.time) % 500);
            var x = (e.x - e.y + GRID.dim1_2) / 2;
            var y = (e.x + e.y - GRID.dim1_2) / 2;
            graphich.drawRect(
                (x - r) * draw_ratio,
                (y - r) * draw_ratio,
                2 * r * draw_ratio,
                2 * r * draw_ratio
            );
        }


        // #endregion

        // #region DRAW DETECTED POINT 

        graphich.lineStyle(2, 0x00FF00);
        for (e of (list_detected_point = list_detected_point.filter(e=> now_time - e.time < 3200))) {
            var r = 0.01 * ((now_time - e.time) % 500);
            var x = (e.x - e.y + GRID.dim1_2) / 2;
            var y = (e.x + e.y - GRID.dim1_2) / 2;
            graphich.drawRect(
                (x - r) * draw_ratio,
                (y - r) * draw_ratio,
                2 * r * draw_ratio,
                2 * r * draw_ratio
            );
        }


        // #endregion

        // #endregion


        renderer.render(stage);


    }


    var list_attacked_point = [];
    var list_detected_point = [];

    this.on_notify = function (name, data) {
        switch (name) {
            case "on_attacked":
                list_attacked_point.push(
                    {
                        data,
                        get x() { return this.data.x },
                        get y() { return this.data.y },
                        time: performance.now()
                    });
                break;
            case "on_detect_enemy":
                list_detected_point.push({
                    data,
                    get x() { return this.data.x },
                    get y() { return this.data.y },
                    time: performance.now()
                });
                break;
            case "minimap_on":
                this.turn_on();
                break;
            case "minimap_off":
                this.turn_off();
                break;
        }
    }

    this.getrender = function () {
        return renderer;
    }

    this.turn_on = function () {
        mainstage.filters = [filter];
        mainstage.renderable = true;
        rada_state = true;
    }


    this.turn_off = function () {
        mainstage.filters = [filter];
        rada_state = false;
    }

})();



