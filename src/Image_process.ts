// @ts-nocheck
//
// Stage 3 of the Vite/TypeScript migration: this file is renamed to .ts but not yet typed.
// It is 2015-era JavaScript whose classes assign undeclared properties in their
// constructors, which TypeScript reports as TS2339 several hundred times per file.
//
// Remove this directive one file at a time, declare the class fields, and let
// `npx tsc --noEmit` gate the result. Files already checked: src/core/*, src/lib/*,
// src/Game_Container.ts, src/UI/Playing_layout.ts, src/main.ts.
import { LATE } from "./core/late";
import { TEAM } from "./Controler";
import { renderer as global_renderer } from "./core/renderer";
import { SPEED } from "./core/state";
import { TeamColorFilter } from "./lib/JavaScript_helper";

/// <reference path="../Scripts/pixi.js" />
/// <reference path="Game_Container.js" />

"use strict";
var dashtt = new PIXI.Texture.fromImage("IMG/dash.png");
var healthtt = new PIXI.Texture.fromImage("IMG/health_1.png");
var humtt = new PIXI.Texture.fromImage("IMG/hum.png");
var contain_sprite0 = new PIXI.Texture.fromImage("IMG/capacity_0.png");
var contain_sprite1 = new PIXI.Texture.fromImage("IMG/capacity_1.png");

var health_critical_1 = 0.8;
var health_critical_2 = 0.2;
var calc_health_color = function (health) {
    if (health > health_critical_1)
        return 0x00ff00;
    else if (health > health_critical_2) {
        var tmp = (health - health_critical_2) / (health_critical_1 - health_critical_2);
        var green = Math.floor(255 * Math.sqrt(Math.sqrt(tmp))) & 0xff;
        var red = Math.floor(255 * Math.sqrt(Math.sqrt((1 - tmp) / 1))) & 0xff;
        return (green << 8) | (red << 16);
    } else {
        return 0xff0000;
    }
}
var healthtexture = [
    new PIXI.Texture(healthtt.baseTexture, new PIXI.Rectangle(0, 0, 41, 5)),
    new PIXI.Texture(healthtt.baseTexture, new PIXI.Rectangle(0, 5, 41, 5)),
    new PIXI.Texture.fromImage("IMG/construction_health_0.png"),
    new PIXI.Texture.fromImage("IMG/construction_health_1.png"),
];




var IMAGE_PROCESS = {
    total_time: 0,
    count: 0,
    effect_sprite: function (property) {
        var sprite = [];
        for (var i = property.start; i <= property.end; i++) {
            sprite.push(PIXI.Texture.fromImage(property.path + "(" + i + ").png"));
        }
        property.sprites = sprite;
    },
    effect_sprite_gl: function (property, listresource) {
        var sprite = [];
        var path = property.path;
        path = path.replace("IMG/effect/", "");
        path = path.replace("Img/effect/", "");
        path = path.replace("IMG/Unit/MapObject/", "");


        for (var i = property.start; i <= property.end; i++) {
            sprite.push(listresource[path + "(" + i + ").png"]);
        }
        property.sprites = sprite;
    },
    process_gl: function (imageproperty, mainpath, margin, listresource, team__1) {
        mainpath = mainpath.replace("IMG/Unit/Solider/", "");
        mainpath = mainpath.replace("IMG/Unit/Vehicle/", "");
        mainpath = mainpath.replace("IMG/Unit/Construction/", "");
        mainpath = mainpath.replace("IMG/Unit/MapConstruction/", "");
        mainpath = mainpath.replace("IMG/Unit/Plane/", "");

        var sprite = new Array(TEAM.length);
        if (imageproperty.from && imageproperty.to) {
            for (var i in TEAM) if (i != "-1" || team__1) {
                sprite[i] = [];
                for (var j = imageproperty.from; j <= imageproperty.to; j++) {
                    sprite[i].push(listresource[i][mainpath + imageproperty.path + " (" + j + ").png"]);
                }
            }
            imageproperty.sprites = sprite;
        } else {
            for (var i in TEAM) if (i != "-1" || team__1) {
                sprite[i] = listresource[i][mainpath + imageproperty.path + ".png"];
            }
            imageproperty.sprite = sprite;
        }
    },
    process_vehicle: function (property, mainpath, margin, number, max_number_width) {
        number = number || 8;
        max_number_width = max_number_width || number;
        var col_count = Math.min(number, max_number_width);
        var row_count = Math.ceil(number / max_number_width);
        var count = (property.normal ? 1 : 0) + (property.direct ? 1 : 0);

        var image = new Image();
        image.onload = function () {
            var width = Math.floor(this.naturalWidth / col_count);
            var height = Math.floor(this.naturalHeight / row_count / count);
            console.log(mainpath, width, height, count);
            if (property.normal)
                property.normal.sprites = [];
            if (property.direct)
                property.direct.sprites = [];

            for (var j = 0; j < TEAM.length; j++) {
                if (property.normal)
                    property.normal.sprites[j] = [];
                if (property.direct)
                    property.direct.sprites[j] = [];
            }
            for (var j = 0; j < TEAM.length; j++) {
                var base_texture = new PIXI.Texture.fromCanvas(IMAGE_PROCESS.processcolor(this, TEAM[j].color));
                if (property.normal) {
                    for (var i = 0; i < number; i++)
                        property.normal.sprites[j].push(
                            new PIXI.Texture(
                                base_texture.baseTexture,
                                new PIXI.Rectangle(
                                    (i % col_count) * width,
                                    count * height * (Math.floor(i / col_count)),
                                    width,
                                    height))
                        );

                }
                if (property.direct) {
                    for (var i = 0; i < number; i++)
                        property.direct.sprites[j].push(
                            new PIXI.Texture(
                                base_texture.baseTexture,
                                new PIXI.Rectangle(
                                    (i % col_count) * width,
                                    height + 2 * height * (Math.floor(i / col_count)),
                                    width,
                                    height))
                        );
                }
            }
            image = null;
        }
        image.src = mainpath + "img.png";

    },
    processcolor: function (image, teamcolor) {
        var t = performance.now();

        var bright, r = teamcolor[0], g = teamcolor[1], b = teamcolor[2];
        var imagecavans = document.createElement('canvas');
        imagecavans.width = image.width;
        imagecavans.height = image.height;
        var imagecontext = imagecavans.getContext('2d');
        imagecontext.drawImage(image, 0, 0);
        if (r != 255 || g != 0 || b != 0) {
            var imagedata = imagecontext.getImageData(0, 0, image.width, image.height);
            var imagedataarray = imagedata.data;

            for (var i = 0; i < imagedataarray.length; i += 4) {
                if (imagedataarray[i + 1] < 10 && imagedataarray[i + 2] < 10 && imagedataarray[i] > 0) {
                    bright = imagedataarray[i] / 255;
                    imagedataarray[i + 0] = Math.round(bright * r);
                    imagedataarray[i + 1] = Math.round(bright * g);
                    imagedataarray[i + 2] = Math.round(bright * b);
                }
            }

            imagecontext.putImageData(imagedata, 0, 0);
        }

        IMAGE_PROCESS.total_time += (performance.now() - t);
        return imagecavans;
    },
    processcheckinteractive: function (canvas) {
        var width = canvas.width,
            height = canvas.height;
        var imagecontext = canvas.getContext('2d');
        var imagedataarray = imagecontext.getImageData(0, 0, width, height).data;
        var array_check = new Uint8Array(canvas.width * canvas.height);
        for (var i = 0; i < imagedataarray.length; i += 4) {
            if (imagedataarray[i + 3] > 10) {
                array_check[i / 4] = 1;
            }
        }
        this.array_check = array_check;
        this.check = function (x, y) {
            x = Math.round(x);
            y = Math.round(y);
            return (x >= 0 && x < width && y >= 0 && y < height && this.array_check[y * width + x]);
        }
    },
    getmovieclip_class: class extends PIXI.extras.MovieClip {
        /**
         * @param {Array.<PIXI.Texture>} sprites
         * @param {Number} step
         * @param {Object} margin
         */
        constructor(sprites, step, margin) {
            super(sprites);
            this.anchor.set(margin.x / this.width, margin.y / this.height);
            this.originalspeed = step * SPEED;
            this.animationSpeed = step * SPEED;
        }
        changemovieclip(sprites, step) {
            this.textures = sprites;
            if (step) {
                this.animationSpeed = step * SPEED;
                this.originalspeed = step * SPEED;
            }
        }
        pause() {
            this.animationSpeed = 0;
        }
        resume() {
            this.animationSpeed = this.originalspeed;
        }
    },
    /**
     * @param {Array.<PIXI.Texture>} sprites
     * @param {Number} step
     * @param {Object} margin
     * @returns {IMAGE_PROCESS.getmovieclip_class} 
     */
    getmovieclip: function (sprites, step, margin) {
        return new this.getmovieclip_class(sprites, step, margin);
    },


    getsprite_class: class extends PIXI.Sprite {
        /**
         * @param {PIXI.Texture} sprites
         * @param {Object} margin
         */
        constructor(sprite, margin) {
            super(sprite);
            if (margin)
                this.anchor.set(margin.x / this.width, margin.y / this.height);
            else
                this.anchor.set(0.5, 0.5);
        }
        changesprite(texture) {
            this.texture = texture;
            if (!this.texture)
                throw new Error("Null Texture");
        }
    },
    /**
     * @param {PIXI.Texture} sprites
     * @param {Object} margin
     * @returns {IMAGE_PROCESS.getsprite_class} 
     */
    getsprite: function (sprite, margin) {
        return new this.getsprite_class(sprite, margin);
    },


    getsprites_class: class extends PIXI.Sprite {
        /**
         * @param {Array.<PIXI.Texture>} sprites
         * @param {Object} margin
         */
        constructor(sprites, margin) {
            super(sprites[0]);
            this.sprites = sprites;
            this.idx = 0;
            if (margin)
                this.anchor.set(margin.x / this.width, margin.y / this.height);
            else
                this.anchor.set(0.5, 0.5);
        }
        /**
         * @param {Array.<PIXI.Sprite>} sprites
         */
        changesprite(sprites) {
            this.sprites = sprites;
            this.idx %= this.sprites.length;
            this.texture = this.sprites[this.idx];
        }
        changeframe(idx) {
            this.idx = Math.floor(idx) % this.sprites.length;
            this.texture = this.sprites[this.idx];
            if (!this.texture)
                throw new Error("Null IDX ", idx);
        }
    },
    /**
     * @param {Array.<PIXI.Texture>} sprites
     * @param {Object} margin
     */
    getsprites: function (sprites, margin) {
        return new this.getsprites_class(sprites, margin);
    },

    getsprite_rotate_class: class extends PIXI.Sprite {
        /**
         * @param {Array.<PIXI.Texture>} sprites
         * @param {Object} margin
         */
        constructor(sprites, margin,scale) {
            super(sprites[0]);
            this.sprites = sprites;
            this.scale_self = scale || 1;
            this.scale.y = this.scale_self;
            if (margin)
                this.anchor.set(margin.x / this.width, margin.y / this.height);
            else
                this.anchor.set(0.5, 0.5);
        }
        change_rotation(angel) {
            var frame_idx = LATE.get_frame_idx(angel, this.sprites.length - 1);
            this.texture = this.sprites[Math.abs(frame_idx)];
            this.scale.x = (frame_idx > 0) ? this.scale_self : -this.scale_self;
        }
    },
    /**
     * @param {Array.<PIXI.Texture>} sprites
     * @param {Object} margin
     */
    getsprite_rotate: function (sprites, margin, scale) {
        return new this.getsprite_rotate_class(sprites, margin, scale);
    },


    getsprite_rotate_high_class: class extends PIXI.Container {
        /**
      * @param {Array.<PIXI.Texture>} sprites
      * @param {Object} margin
      */
        constructor(sprites, margin, scale) {
            super();
            this.child = new PIXI.Sprite(sprites[0]);
            this.child.scale.set(1, 2);
            this.scale_self = scale || 1;
            this.addChild(this.child);
            this.sprites = sprites;
            this.scale.set(this.scale_self, this.scale_self * 0.5);
            if (margin)
                this.child.anchor.set(margin.x / this.child.width, margin.y / this.child.height);
            else
                this.child.anchor.set(0.5, 0.5);
        }
        change_rotation (angel) {
            var frame_idx = LATE.get_frame_idx(angel, this.sprites.length - 1);
            var delta_angel = angel - (Math.PI / 4 - (frame_idx / (this.sprites.length - 1) * Math.PI));
            this.child.texture = this.sprites[Math.abs(frame_idx)];
            this.child.rotation = delta_angel;
            this.child.scale.x = (frame_idx > 0) ? 1 : -1;
        }
        set tint(value) {
            this.child.tint = value;
        }
        get tint() {
            return this.child.tint;
        }
    },
    /**
     * @param {Array.<PIXI.Texture>} sprites
     * @param {Object} margin
     */
    getsprite_rotate_high: function (sprites, margin, scale) {
        return new this.getsprite_rotate_high_class(sprites, margin, scale);
    },
    getsprite_shadow: function (sprite) {
        var temp = new PIXI.Sprite(sprite);
        var temp2 = new PIXI.Container();
        temp2.addChild(temp);
        temp2.child = temp;
        temp2.scale.set(1, 0.5);
        temp.alpha = 0.5;
        temp.anchor.set(0.5, 0.5);
        temp2.change_rotation = function (angel) {
            this.child.rotation = angel - (Math.PI * 0.75);
        }
        return temp2;
    },
    /**
     * 
     * @param {Game_unit} ob
     */
    gethealthsprite: function (ob) {
        if (ob instanceof LATE.Movealbe_unit) {
            //#region   Movealbe_unit
            var con = new PIXI.Container();
            var sprite = new PIXI.Sprite(healthtexture[0]);
            var sprite2 = new PIXI.Sprite(healthtexture[1]);
            con.addChild(sprite2);
            con.addChild(sprite);
            con._sprite2_ = sprite2;
            sprite2.tint = 0x00ff00;
            con.sethealth = function (health) {
                this._sprite2_.scale.x = health;
                this._sprite2_.tint = calc_health_color(health);
            }
            if (ob instanceof LATE.Solider_unit || ob instanceof LATE.Parachutist) {
                con.scale.x = 0.5;
            } else if (ob instanceof LATE.PLANE_UNIT_TYPE.beag.class) {
                con.con_sprite_0 = new PIXI.extras.TilingSprite(contain_sprite0, 0, 6);
                con.con_sprite_1 = new PIXI.extras.TilingSprite(contain_sprite1, 0, 5);
                con.con_sprite_1.tint = 0x00ff00;
                con.addChild(con.con_sprite_0);
                con.addChild(con.con_sprite_1);
                con.con_sprite_0.position.y = 40;
                con.con_sprite_1.position.y = 40;
                con.set_contain = function (count, max) {
                    this.con_sprite_0.width = max * 5 + 1;
                    this.con_sprite_1.width = count * 5 ;
                }
                
            }
            return con;
            //#endregion
        } else if (ob instanceof LATE.Construction_unit || ob instanceof LATE.Map_Construction_unit) {
            //#region Construction_unit or Map_Construction_unit

            var width = ob.size.h * 30;
            var height = ob.size.h * 15 + 15;
            var sprite = new PIXI.extras.TilingSprite(healthtexture[2], width, height);
            var sprite2 = new PIXI.extras.TilingSprite(healthtexture[3], width, height);
            sprite2.tint = 0x00ff00;
            sprite.addChild(sprite2);
            sprite._sprite2_ = sprite2;
            sprite.sethealth = function (health) {
                this._sprite2_.width = this.width * health;
                this._sprite2_.tint = calc_health_color(health);
            }
            sprite.scale.y = -1;
            var w = ob.size.w, h = ob.size.h, h_ = ob.size.h_;
            var dw_x = w * 10, dw_y = w * 5, dh_x = h * 10, dh_y = h * 5, dh__ = -h_ * 3;
            var point = [
                { x: 0, y: 0 + 10 },
                { x: dw_x * 3, y: -dw_y * 3 + 10 },
                { x: dh_x * 3, y: dh_y * 3 + 10 },
                { x: dw_x * 3 + dh_x * 3, y: -dw_y * 3 + dh_y * 3 + 10 }
            ];
            [
                LATE.createline2(point[0], dw_x, -dw_y),
                LATE.createline2(point[0], dh_x, dh_y),
                LATE.createline2(point[0], 0, dh__),
                LATE.createline2(point[1], -dw_x, dw_y),
                LATE.createline2(point[1], dh_x, dh_y),
                LATE.createline2(point[1], 0, dh__),
                LATE.createline2(point[2], dw_x, -dw_y),
                LATE.createline2(point[2], -dh_x, -dh_y),
                LATE.createline2(point[2], 0, dh__),
                LATE.createline2(point[3], -dw_x, dw_y),
                LATE.createline2(point[3], -dh_x, -dh_y),
                LATE.createline2(point[3], 0, dh__)
            ].forEach(e => e && sprite.addChild(e) && (e.alpha = 0.7));


            if (ob instanceof LATE.Map_Building_Construction_unit && ob.property.property.can_go_into) {
                var capacity = ob.property.property.capacity;
                sprite.list_ob = [];
                for (var i = 0 ; i < capacity; i++) {
                    var hum_sprite = new PIXI.Sprite(humtt);
                    hum_sprite.position.x = i * 10 + 10;
                    hum_sprite.position.y = -h_ * 5 - i * 5;
                    hum_sprite.scale.set(-1);
                    hum_sprite.renderable = false;
                    sprite.addChild(hum_sprite);
                    sprite.list_ob.push(hum_sprite);
                    
                }
                sprite.setcontainstate = function (state) {
                    for (var i = 0 ; i < this.list_ob.length; i++) {
                        this.list_ob[i].renderable = state;
                    }
                }
                sprite.setcontain= function (num) {
                    for (var i = 0 ; i < this.list_ob.length; i++) {
                        this.list_ob[i].tint = (i < num) ? 0x00ff00 : 0xaaaaaa;
                    }
                }
            }
            return sprite;
            //#endregion
        }
    },
    getdashsprite: function () {
        var sprite = new PIXI.extras.TilingSprite(dashtt, 14, 3);
        sprite.setpossition = function (pos1, pos2) {
            var distX = pos1.x - pos2.x;
            var distY = pos1.y - pos2.y;
            this.anchor.y = 0.5;
            this.position.set(pos1.x, pos1.y);
            this.rotation = Math.atan2(distY, distX) + Math.PI;
            this.width = Math.hypot(distX, distY);
            this.tilePosition.x += 0.3;
        }
        return sprite;
    },
    processcolor_gl: function (texture, teams, on_done, para, is_team__1) {
        var list_texture = [];
        for (var i in teams) {
            if (!is_team__1 && i == "-1")
                continue;
            if (i == 0) {
                list_texture[i] = (texture);
            } else {
                var renderer = new PIXI.RenderTexture(global_renderer, texture.width, texture.height);
                var stage = new PIXI.Container();
                var sprite = new PIXI.Sprite(texture);
                var filtercolor = new TeamColorFilter(teams[i].color[0], teams[i].color[1], teams[i].color[2]);
                stage.addChild(sprite);
                stage.filters = [filtercolor];
                renderer.render(stage);
                list_texture[i] = renderer;
            }
        }
        setTimeout(function (list_texture) {
            on_done(list_texture, para);
        }, 500, list_texture, para);
    }
}





export { IMAGE_PROCESS, calc_health_color, contain_sprite0, contain_sprite1, dashtt, health_critical_1, health_critical_2, healthtexture, healthtt, humtt };
