
// import PIXI from "pixi.js";
import { TEAM } from "../../../Controler";
import { on_texture_load_done } from "../../../Done";
import { GAME_OBJECT } from "../../../Game_object";
import { IMAGE_PROCESS } from "../../../Image_process";
import { Ground_moveable_unit } from "../MoviableUnit";
import { VEHICLE_TYPE } from "./Vehicle_Unit_Type";

PIXI.loader.add({ name: "veh", url: "IMG/Unit/Vehicle/vehicle.json" });

export const VEHICLE_UNIT = {
    image_type: ["normal", "direct", "normal2"],

    init_plus: function (property, listresource) {
        for (var i in property.img) {
            if (VEHICLE_UNIT.image_type.indexOf(i) > -1) {
                IMAGE_PROCESS.process_gl(property.img[i], property.img.main_path, property.img.margin, listresource);
            }
        };
    },

    load_texture_done: function (loader, resources) {
        var listresource = [];
        listresource[0] = resources.veh.textures;
        console.log(resources);
        IMAGE_PROCESS.processcolor_gl(
            resources.veh_image.texture,
            TEAM,
            VEHICLE_UNIT.process_color_gl_done,
            listresource
        );
    },

    process_color_gl_done: function (textures, listresource) {
        var baseresource = listresource[0];
        for (var i = 1; i < textures.length; i++) {
            var processresource = {};
            var baseTexture = textures[i].baseTexture;
            for (var j in baseresource) {
                processresource[j] = new PIXI.Texture(baseTexture, baseresource[j].frame, baseresource[j].crop, baseresource[j].trim);
            }
            listresource[i] = processresource;
        }

        for (var i in VEHICLE_TYPE)
            VEHICLE_UNIT.init_plus(VEHICLE_TYPE[i], listresource);
        console.log(listresource);
        on_texture_load_done("vehicle");
        // VEHICLE_UNIT = null;
    },

}



export class Vehicle_unit extends Ground_moveable_unit {

    /**
      Constructor for a new Vehicle_unit
      @class Vehicle_unit
      @param {Number} x - Options to initialize the component with
      @param {Number} y - Options to initialize the component with
      @param {Number} z - Options to initialize the component with
      @param {Number} team - Options to initialize the component with
      @param {Vehicle_Property} property - Options to initialize the component with
    */
    constructor(x, y, z, team, property) {
        super(x, y, z, team, property);
        this.basesprite = IMAGE_PROCESS.getsprites(property.img.normal.sprites[team], property.img.margin);
        this.healthsprite = IMAGE_PROCESS.gethealthsprite(this);
        if (property.img.direct)
            this.sprite = IMAGE_PROCESS.getsprites(property.img.direct.sprites[team], property.img.margin);
        this.headangel = 0;
        this.renderable = true;

    }

    init() {
        super.init();
        stage.addChild(this.basesprite);
        this.sprite && this.basesprite.addChild(this.sprite);
    }

    draw() {
        var pos = convert2screen(this.x, this.y, this.z);

        this.pos = pos;

        if (!check_available_screen(pos, 30, 30) || !GRID.check_availble_user_fogmap(this)) {
            this.basesprite.renderable = false;
            this.healthsprite.renderable = false;
            this.basesprite.z_idx = 0;

            return;
        } else {
            this.basesprite.renderable = true;
            this.healthsprite.renderable = true;
            this.basesprite.z_idx = this.x + this.y;

        }
        var direction = Math.floor(MOVEABLE_UNIT.getangeldraw(this.angel, 8));
        var headdirection = Math.floor(MOVEABLE_UNIT.getangeldraw(this.headangel, 8));
        if (this.property.img.direct) {
            this.sprite.changeframe(headdirection);
            this.basesprite.position.set(pos.x, pos.y);
            this.basesprite.changeframe(direction);
        } else {
            this.basesprite.position.set(pos.x, pos.y);
            this.basesprite.changeframe(headdirection);
        }
        this.healthsprite.position.set(pos.x - 23, pos.y - 30);

    }

    attack(enemy) {
        super.attack(enemy);
        this.headangel = MOVEABLE_UNIT.getangelmove(enemy, this);
    }

    fire() {
        super.fire();
        this.headangel = MOVEABLE_UNIT.getangelmove(this.enemy, this);
    }

    process(time) {
        super.process(time);

        if (this.health / this.totalhealth < 0.3)
            (Math.random() > (0.85 + 0.5 * this.health / this.totalhealth)) && GAME_OBJECT.add_instance(new SmokeEffect(this.x, this.y, this.z));

    }

    changetostate(state) {
        super.changetostate(state);
        switch (this.state) {
            case STATE.MOVE:
                break;
            case STATE.IDLE:
                break;
            case STATE.DEFENSE:
                break;
        }
    }

    move_to_point(p) {
        super.move_to_point(p);
        this.headangel = this.angel;
    }

    on_destroy(attackobject) {
        GAME_OBJECT.add_effect(this.x, this.y, this.z, EFFECT_TYPE.exploit5);
        super.on_destroy(attackobject);
    }

    on_attacked(attackobject) {
        super.on_attacked(attackobject);
        this.healthsprite.sethealth(this.health / this.totalhealth);
    }



    delete() {
        super.delete();
        stage.removeChild(this.basesprite);
        healthcontainer.removeChild(this.healthsprite);
    }

}

GAME_OBJECT.add_class(Vehicle_unit, "vehicle");


