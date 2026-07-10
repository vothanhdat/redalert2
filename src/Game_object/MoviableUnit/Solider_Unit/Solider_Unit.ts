// @ts-nocheck
//
// Stage 3 of the Vite/TypeScript migration: this file is renamed to .ts but not yet typed.
// It is 2015-era JavaScript whose classes assign undeclared properties in their
// constructors, which TypeScript reports as TS2339 several hundred times per file.
//
// Remove this directive one file at a time, declare the class fields, and let
// `npx tsc --noEmit` gate the result. Files already checked: src/core/*, src/lib/*,
// src/Game_Container.ts, src/UI/Playing_layout.ts, src/main.ts.
import { LATE } from "../../../core/late";
import { AUDIO } from "../../../Audio";
import { TEAM } from "../../../Controler";
import { healthcontainer, stage } from "../../../Game_Container";
import { GRID } from "../../GRID";
import { GAME_OBJECT, check_available_screen, convert2screen } from "../../Game_object";
import { Ground_moveable_unit, MOVEABLE_UNIT } from "../MoviableUnit";
import { IMAGE_PROCESS } from "../../../Image_process";
import { STATE } from "../../../lib/JavaScript_helper";

/// <reference path="../MoviableUnit.js" />
"use strict";

PIXI.loader.add({ name: "sol", url: "IMG/Unit/Solider/solider.json" });

var SOLIDER_UNIT = {
    state_image: ["normal", "attack", "move", "wait", "change", "fix", "attack_fix", "die", "drop"],
    init_plus: function (property, listresource) {
        for (var i in property.img) {
            if (SOLIDER_UNIT.state_image.indexOf(i) > -1) {
                IMAGE_PROCESS.process_gl(property.img[i], property.img.main_path, property.img.margin, listresource);
            }
        };
        if (property.img.wait) {
            property.img.wait.random = function () { return this.type[Math.floor(Math.random() * this.type.length)]; };
        }
        if (property.img.die) {
            var index = 0;
            for (var e of property.img.die.type) {
                e.imgs = property.img.die.sprites.map(f => ({
                    step: property.img.die.step,
                    _count: e.count,
                    _index: index,
                    get sprites() {
                        return this._sprite || (this._sprite = f.slice(this._index, this._index + this._count));
                    },
                }));
                index += e.count;
            }
            property.img.die.random = function () { return this.type[Math.floor(Math.random() * this.type.length)]; };
        }

    },
    load_texture_done: function (loader, resources) {
        var listresource = [];
        listresource[0] = resources.sol.textures;
        console.log(resources);
        IMAGE_PROCESS.processcolor_gl(
            resources.sol_image.texture,
            TEAM,
            SOLIDER_UNIT.process_color_gl_done,
            listresource
        );
    },
    process_color_gl_done: function (textures, listresource) {
        var baseresource = listresource[0];
        for (var i = 1 ; i < textures.length; i++) {
            var processresource = {};
            var baseTexture = textures[i].baseTexture;
            for (var j in baseresource) {
                processresource[j] = new PIXI.Texture(baseTexture, baseresource[j].frame, baseresource[j].crop, baseresource[j].trim);
            }
            listresource[i] = processresource;
        }

        for (var i in LATE.SOLIDER_TYPE)
            SOLIDER_UNIT.init_plus(LATE.SOLIDER_TYPE[i], listresource);

        LATE.Parachutist.init_texture(listresource);

        console.log(listresource);
        LATE.on_texture_load_done("solider");
        SOLIDER_UNIT = null;
    },
}





class Solider_unit extends Ground_moveable_unit {


    /**
      Constructor for a new Solider_unit
      @class Solider_unit
      @param {Number} x - Options to initialize the component with
      @param {Number} y - Options to initialize the component with
      @param {Number} z - Options to initialize the component with
      @param {Number} team - Options to initialize the component with
      @param {Solider_Property} property - Options to initialize the component with
    */
    constructor(x, y, z, team, property) {
        super(x, y, z, team, property);
        this.sprite = IMAGE_PROCESS.getsprites(property.img.normal.sprites[team], property.img.margin);
        this.healthsprite = IMAGE_PROCESS.gethealthsprite(this);
        this.frameidx = 0;
        this.moveframenumber = property.img.move.sprites[team].length / 8;
        this.height = 2.5;
        this.position_inceil = 0;
        if (property.img.attack)
            this.fireframenumber = property.img.attack.sprites[team].length / 8;
    }

    init() {
        super.init();
        stage.addChild(this.sprite);
    }

    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        this.pos = pos;

        if (!check_available_screen(pos, 20, 20) || !GRID.check_availble_user_fogmap(this)) {
            this.sprite.renderable = false;
            this.healthsprite.renderable = false;
            this.sprite.z_idx = 0;

            return;
        } else {
            this.sprite.renderable = true;
            this.healthsprite.renderable = true;
            this.sprite.z_idx = this.x + this.y;
        }

        var direction = Math.floor(MOVEABLE_UNIT.getangeldraw(this.angel, 8));
        this.sprite.position.set(pos.x, pos.y);
        this.healthsprite.position.set(pos.x - 10, pos.y - 25);

        switch (this.state) {
            case STATE.IDLE:
            case STATE.DEFENSE:
            case STATE.ATTACK:
                if (this.wating)
                    this.sprite.changeframe(Math.min(this.wating.end, Math.max(this.wating.start, Math.floor(this.frameidx))) - 1);
                else if (this.firing && this.property.img.attack)
                    this.sprite.changeframe(direction * this.fireframenumber + Math.floor(this.attackload % this.fireframenumber));
                else
                    this.sprite.changeframe(direction);
                break;
            case STATE.MOVE:
            case STATE.MOVE2ATTACK:
            case STATE.MOVE2DEFENSE:
            case STATE.MOVEBACK:
                this.sprite.changeframe(direction * this.moveframenumber + Math.floor(this.frameidx));
                break;

        }

    }

    process_idle_relax(time) {
        this.frameidx += this.property.img.wait.step * time;
        if (this.wating) {
            if (this.frameidx > this.wating.end + 1) {
                this.sprite.changesprite(this.property.img.normal.sprites[this.team]);
                this.frameidx = 0;
                this.wating = null;
            }
        } else if (this.frameidx > 10) {
            this.frameidx = 0;
            if (Math.random() < 0.1) {
                this.wating = this.property.img.wait.random();
                this.frameidx = this.wating.start;
                this.sprite.changesprite(this.property.img.wait.sprites[this.team]);
                var dxy = MOVEABLE_UNIT.idx_xy_map_round[this.wating.direct];
                this.angel = Math.atan2(-dxy.y, -dxy.x);

            }
        }
    }

    attack(enemy) {
        super.attack(enemy);
        this.angel = MOVEABLE_UNIT.getangelmove(enemy, this);
    }

    fire() {
        super.fire();
        this.firing = true;
        this.frameidx = 0;
        this.property.img.attack && this.sprite.changesprite(this.property.img.attack.sprites[this.team]);
    }

    process(time) {
        super.process(time);

        switch (this.state) {
            case STATE.IDLE:
                this.process_idle_relax(time);
                break;
            case STATE.MOVE:
            case STATE.MOVE2ATTACK:
                if (this.ismoving) {
                    this.frameidx += time * this.property.img.move.step;
                    this.frameidx %= this.moveframenumber;
                }
                break;
            case STATE.DEFENSE:
            case STATE.ATTACK:
                if (this.firing && this.attackload > this.fireframenumber || 0) {
                    this.firing = false;
                    this.sprite && this.sprite.changesprite(this.property.img.normal.sprites[this.team]);
                }
                break;
        }
    }

    changetostate(state) {
        super.changetostate(state);

        switch (this.state) {
            case STATE.MOVE:
            case STATE.MOVE2ATTACK:
            case STATE.MOVEBACK:
                this.sprite.changesprite(this.property.img.move.sprites[this.team]);
                this.frameidx = 0;
                this.wating = null;
                break;
            case STATE.IDLE:
                this.sprite.changesprite(this.property.img.normal.sprites[this.team]);
                this.wating = null;
                this.firing = false;
                break;
            case STATE.DEFENSE:
            case STATE.ATTACK:
                this.frameidx = 0;
                this.wating = null;
                break;
        }
    }

    /**
    @param {Weapon} attackobject       
    */
    on_attacked(attackobject) {
        super.on_attacked(attackobject);
        this.healthsprite.sethealth(this.health / this.totalhealth);

    }

    check_cross_move() {
        return true;
    }

    move_to_point(p) {
        super.move_to_point(p);
        var ceil = GRID.objectmap[p.x * GRID.dim + p.y].filter(e => e != this && e instanceof Solider_unit);
        var pos = [false, false, false, false];
        ceil.forEach(e => pos[e.position_inceil] = true);
        if (pos[this.position_inceil])
            for (var i in pos) if (!pos[i]) {
                this.position_inceil = i * 1;
                break;
            }
    }

    process_move(time) {
        var incell_add = MOVEABLE_UNIT.incell_map[this.position_inceil];
        super.process_move(time, incell_add.x, incell_add.y);
    }


    check_netxpoint() {
        var incell_add = MOVEABLE_UNIT.incell_map[this.position_inceil];
        return (this.nx == (this.x - incell_add.x) && this.ny == (this.y - incell_add.y));
    }

    /**
    @param {Weapon} attackobject       
    */
    on_destroy(attackobject) {
        super.on_destroy(attackobject)
        if (attackobject.property.die_effect_solider) {
            var tmp = LATE.EFFECT_TYPE[attackobject.property.die_effect_solider];
            tmp && GAME_OBJECT.add_effect(this.x, this.y, this.z, tmp, true);
        } else if (this.property.img.die) {
            var tmp = this.property.img.die.random().imgs[this.team];
            tmp && GAME_OBJECT.add_effect(this.x, this.y, this.z, tmp, true);
        }
        AUDIO.createsound(this.property.audio[`die${Math.floor(Math.random() * 4)}`], { x: this.x, y: this.y, z: this.z }, 0.15);
    }


    delete () {
        super.delete();
        stage.removeChild(this.sprite);
        healthcontainer.removeChild(this.healthsprite);
    }

    check_goal() {
        return super.check_goal(0.35);
    }

    check_choose(x, y) {
        return this.pos && Math.abs(this.pos.x - x) <= 8 && Math.abs(this.pos.y - y - 3) <= 15;
    }

}



GAME_OBJECT.add_class(Solider_unit, "solider");









// Published for modules that load earlier and reference these late (see src/core/late.js).
Object.assign(LATE, { Solider_unit });

export { SOLIDER_UNIT, Solider_unit };
