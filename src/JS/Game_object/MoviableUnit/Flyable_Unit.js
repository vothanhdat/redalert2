/// <reference path="MoviableUnit.js" />
"use strict";

class Flyable_Unit extends Movealbe_unit {

}

Flyable_Unit.list_unit = [];


PIXI.loader.add({ name: "plane", url: "IMG/Unit/Plane/img.json" });

var PLANE_UNIT = {
    image_type: ["normal", "direct"],

    init_plus: function (property, listresource) {
        for (var i in property.img) {
            if (PLANE_UNIT.image_type.indexOf(i) > -1) {
                IMAGE_PROCESS.process_gl(property.img[i], property.img.main_path, property.img.margin, listresource);
            }
        };


        if (property.img.shadow) {
            var path = property.img.main_path.replace("IMG/Unit/Plane/", "");
            console.log(path + property.img.shadow);
            property.img.shadowsprite = listresource[0][path + property.img.shadow];
            console.log(property.img.shadowsprite);
        }
    },

    load_texture_done: function (loader, resources) {
        var listresource = [];
        listresource[0] = resources.plane.textures;
        console.log(resources);
        IMAGE_PROCESS.processcolor_gl(
            resources.plane_image.texture,
            TEAM,
            PLANE_UNIT.process_color_gl_done,
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

        for (var i in PLANE_UNIT_TYPE)
            PLANE_UNIT.init_plus(PLANE_UNIT_TYPE[i], listresource);
        console.log(listresource);
        on_texture_load_done("plane");
        PLANE_UNIT = null;
    },
}



class Plane_unit extends Flyable_Unit {
    constructor(x, y, z, team, property) {
        super(Math.round(x), Math.round(y), z, team, property);
        this.v = property.property.speed;
        this.attackdone = property.property.attack_time;
        this.attackload = this.attackdone;
        //this.height = 0;
        this.angel = 0;
        this.angelv = property.property.angel_v;
        this.group = null;
        this.enemy = null;
        this.goal = null;
        this.zv = 0;

        if (property.img.high_res) {
            this.sprite = IMAGE_PROCESS.getsprite_rotate_high(this.property.img.normal.sprites[this.team], this.property.img.normal.margin, 0.85);
        } else {
            this.sprite = IMAGE_PROCESS.getsprite_rotate(this.property.img.normal.sprites[this.team], this.property.img.normal.margin, 0.85);
        }
        this.shadowsprite = IMAGE_PROCESS.getsprite_shadow(this.property.img.shadowsprite);
        this.shadowsprite.scale.x *= 0.85;
        this.shadowsprite.scale.y *= 0.85;

        this.healthsprite = IMAGE_PROCESS.gethealthsprite(this);
        this.renderable = true;
        this.height_fly = property.property.height_fly || 22;
        this.check_collision = true;

    }



    init() {
        super.init();
        stage.addChild(this.sprite);
        stage.addChild(this.shadowsprite);
        Flyable_Unit.list_unit.push(this);
    }

    delete () {
        stage.removeChild(this.sprite);
        stage.removeChild(this.shadowsprite);
        healthcontainer.removeChild(this.healthsprite);
        Flyable_Unit.list_unit.splice(Flyable_Unit.list_unit.indexOf(this), 1);
        super.delete();
    }


    draw() {
        var pos = convert2screen(this.x, this.y, this.z);
        this.pos = pos;
        if (check_available_screen(this.pos, this.sprite.width / 2, this.sprite.height / 2) && GRID.check_availble_user_fogmap(this)) {
            this.angel_idx = get_frame_idx(this.angel, this.sprite.sprites.length - 1);
            this.sprite.z_idx = this.x + this.y + 0.55;
            this.sprite.change_rotation(this.angel);
            this.sprite.position.set(this.pos.x, this.pos.y);
            this.sprite.renderable = true;
            if (this.healthsprite) {
                this.healthsprite.renderable = true;
                this.healthsprite.position.set(pos.x - 23, pos.y - 30);
            }
        } else {
            this.sprite.renderable = false;
            if (this.healthsprite) {
                this.healthsprite.renderable = false;
                this.healthsprite.position.set(pos.x - 23, pos.y - 30);
            }
        }

        var pos_shadow = convert2screen(this.x, this.y, GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)]);


        if (check_available_screen(pos_shadow, this.shadowsprite.width / 2, this.shadowsprite.height / 2) && GRID.check_availble_user_fogmap(this)) {
            this.shadowsprite.position.set(pos_shadow.x, pos_shadow.y);
            this.shadowsprite.renderable = true;
            this.shadowsprite.change_rotation(this.angel);
        } else {
            this.shadowsprite.renderable = false;
        }
    }

    process(time) {
        this.process_move(time);
    }


    process_move(time) {
        time /= 60;
        if (this.goal) {
            var d = calcfar(this.goal, this);
            var dnx = (this.goal.x - this.x) / d;
            var dny = (this.goal.y - this.y) / d;
            var total_x = 0;
            let total_y = 0;
            if (this.check_collision) {
                for(let e of Flyable_Unit.list_unit) if (e != this) {
                    let dd = calcfar2(this, e) + 0.01;
                    let weight = 0.5 * Math.pow(2.5 / dd, 3);
                    total_x += (e.x - this.x) * weight;
                    total_y += (e.y - this.y) * weight;
                }
            }
            dnx -= total_x;
            dny -= total_y;

            var angle = myAtan(dny, dnx);
            var delta = normal_angel(angle - this.angel);
            var back_x = this.x;
            var back_y = this.y;

            this.angel = normal_angel(this.angel + Math.max(-time * this.angelv, Math.min(time * this.angelv, delta)));


            this.x += myCos(this.angel) * this.v * time;
            this.y += mySin(this.angel) * this.v * time;
            this.z += ((GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)] + this.height_fly - this.z > 0 ? 1 : -1)) * this.v * time * 2;

            if (Math.round(back_x) != Math.round(this.x) || Math.round(back_y) != Math.round(this.y)) {
                GRID.setmovefogmap(this, Math.round(back_x), Math.round(back_y), Math.round(this.x), Math.round(this.y));
            }

        }
    }


    /** @description Apply command for list game unit.
     * @param {Command} command The list of game unit.
     */
    command(command) {
        if (this.state == STATE.DELETE)
            return;
        super.command(command);
        this.next_command = command.next_command;

        this._is_protect_area_ = false;
        this.group_protect = null;
        this._go_into_ = false;
        this._go_into_ob_ = null;

        switch (command.com) {
            case "protect_area":
                if (command.group) {
                    this._is_protect_area_ = true;
                    this.group_protect = command.group;
                    if (!this.group_protect._time_) {
                        this.group_protect._time_ = performance.now();
                        this.group_protect.listgoal = [];
                    }
                }
                break;
            case "auto":
                this._auto_command_ = true;
                break;
            case "move":
                if (command.group) {
                    this.goal = command.goal;
                    this.changetostate(STATE.MOVE);
                }
                break;
            case "attack":
                if (command.group) {
                    this.enemy = command.enemy;
                    this.goal = command.enemy;
                    this.changetostate(STATE.MOVE2ATTACK);
                }
                break;
        }
    }


    on_destroy(attackobject) {
        super.on_destroy(attackobject);
        if (Math.random() < 0.5) {
            GAME_OBJECT.add_effect(this.x, this.y, this.z, EFFECT_TYPE.exploit5);
        } else {
            GAME_OBJECT.add_instance(new Plane_unit_failout(this));
        }
    }

    on_attacked(attackobject) {
        super.on_attacked(attackobject);
        this.healthsprite.sethealth(this.health / this.totalhealth);
    }


    check_choose(x, y) {
        return this.pos && Math.abs(this.pos.x - x) <= 30 && Math.abs(this.pos.y - y - 3) <= 15;
    }

    get_element_ceil() {
        return [];
    }

    scan_enemy() {
        return null;
    }

    filter_enemy() {
        return false;
    }

    set_data(array, idx, team) {
        Movealbe_unit.prototype.set_data.call(this, array, idx, team);
    }


    get_data(team) {
        return Movealbe_unit.prototype.get_data.call(this, team);
    }


}


class Plane_unit_failout extends Game_unit {
    /**
     *   @param {Plane_unit} ob
     * */
    constructor(ob) {
        super(ob.x, ob.y, ob.z, -1, ob.property);
        this.v = ob.v;;
        this.angel = ob.angel;
        this.sprite = ob.sprite;
        this.shadowsprite = ob.shadowsprite;
        this.original_angel = this.angel;
        this.angel_rotate = (Math.random() - 0.5) * this.property.img.angel_rotate_fail
        this.zv = 0;
        this.sprite.tint = 0x999999;
        this.wait_smooke = 0;
    }
    process(time) {
        this.wait_smooke += time;
        time /= 60;
        this.zv += time * GRAVITY * 0.8;
        this.x += myCos(this.original_angel) * this.v * time;
        this.y += mySin(this.original_angel) * this.v * time;
        this.z -= this.zv * time;
        this.angel = normal_angel(this.angel_rotate * time + this.angel);


        if (this.wait_smooke > 3) {
            this.wait_smooke = 0;
            GAME_OBJECT.add_instance(new SmokeEffect2(
                this.x + Math.random() * 0.3 - 0.15 + 0.7 * myCos(this.angel),
                this.y + Math.random() * 0.3 - 0.15 + 0.7 * mySin(this.angel),
                this.z + Math.random() - 0.5,
                0, 0, 0, 0.6
                ));
        } else {
            GAME_OBJECT.add_instance(new SmokeEffect2_supersort(
               this.x + 0.7 * myCos(this.angel),
               this.y + 0.7 * mySin(this.angel),
               this.z,
               0, 0, 0, 0.6
               ));
        }
        if (this.z <= GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)]) {
            GAME_OBJECT.add_effect(this.x, this.y, this.z, EFFECT_TYPE.exploit5);
            this.delete();
        }

    }
    draw() {
        Plane_unit.prototype.draw.call(this);
    }
    delete () {
        stage.removeChild(this.sprite);
        stage.removeChild(this.shadowsprite);
        this.state = STATE.DELETE;
    }
    init() {
        stage.addChild(this.sprite);
        stage.addChild(this.shadowsprite);
    }
}


GAME_OBJECT.add_class(Plane_unit, "plane");


class Parachutist extends Flyable_Unit {


    static init_texture(listresource) {
        this.textures = [];
        this.speed = 1 / 3;
        for (var i = 0 ; i < listresource.length; i++) {
            this.textures[i] = [];
            for (var j = 1; j <= 69; j++) {
                this.textures[i].push(listresource[i][`Drop/drop (${j}).png`]);
            }
        }
        this.shadow_texture = new PIXI.Texture.fromImage("IMG/effect/hidecircle.png");
    }


    constructor(x, y, z, team, property) {
        super(x, y, z, team, property);
        this.healthsprite = IMAGE_PROCESS.gethealthsprite(this);
        this.solider_sprite = IMAGE_PROCESS.getsprites(SOLIDER_TYPE.sol_gi_allied.img.drop.sprites[this.team]);
        this.speed = Parachutist.speed;
        this.frame_idx = 0;
    }

    init() {
        super.init();
        stage.addChild(this.solider_sprite);
        GAME_OBJECT.add_instance(new Parachutist_Sprite(this));
    }

    delete () {
        super.delete();
        healthcontainer.removeChild(this.healthsprite);
        stage.removeChild(this.solider_sprite);
    }


    draw() {
        let pos = convert2screen(this.x, this.y, this.z);
        this.pos = pos;
        if (check_available_screen(pos, this.solider_sprite.width, this.solider_sprite.height) && GRID.check_availble_user_fogmap(this)) {
            this.healthsprite.position.set(pos.x - 10, pos.y - 25);
            this.solider_sprite.position.set(pos.x, pos.y);
            this.solider_sprite.z_idx = this.x + this.y;
            this.healthsprite.renderable = true;
            this.solider_sprite.renderable = true;
        } else if (this.solider_sprite.renderable) {
            this.healthsprite.renderable = false;
            this.solider_sprite.renderable = false;

        }
    }

    process(time) {
        super.process(time);
        if (this.z > GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)]) {
            var frame = Math.floor(this.timelife * this.speed);
            this.frame_idx = frame;
            if (frame < 14) {
                this.z -= 0.2 * time;
            } else {
                this.z -= 0.05 * time;
            }
        } else {
            var newunit = new SOLIDER_TYPE.sol_gi_allied.class(
                this.x, this.y, this.z, this.team,
                SOLIDER_TYPE.sol_gi_allied
            );
            this.change_type(SOLIDER_TYPE.sol_gi_allied.class, newunit);
        }
    }

    /**
     * @param {Function} type
     * @param {Game_unit} newinstance
     * */
    change_type(type, newinstance) {
        var command = this._command_;
        super.change_type(type, newinstance);
        command && this.command(command);
    }


    /** @description Apply command for list game unit.
     * @param {Command} command The list of game unit.
     */
    command(com) {
        this._command_ = com;
    }



    on_destroy(attackobject) {
        GAME_OBJECT.add_effect(this.x, this.y, this.z, EFFECT_TYPE.exploit5);
        super.on_destroy(attackobject);
    }

    on_attacked(attackobject) {
        super.on_attacked(attackobject);
        this.healthsprite.sethealth(this.health / this.totalhealth);
    }

    display_health_point(onoff) {
        if (this.state == STATE.DELETE)
            return;
        if (onoff)
            healthcontainer.addChild(this.healthsprite);
        else
            healthcontainer.removeChild(this.healthsprite);
    }

    check_choose(x, y) {
        return this.pos && Math.abs(this.pos.x - x) <= 30 && Math.abs(this.pos.y - y - 3) <= 15;
    }



    get_element_ceil() {
        return [];
    }

    scan_enemy() {
        return null;
    }

    filter_enemy() {
        return false;
    }
}




class V3Rocket extends Flyable_Unit {
    constructor(x, y, z, team, property, enemy) {
        super(Math.round(x), Math.round(y), z, team, property);
        this.v = property.property.min_v * get_random(0.2);
        this.acceleration = property.property.acceleration * get_random(0.2);
        this.angelacceleration = property.property.angelacceleration * get_random(0.2);
        this.max_v = property.property.max_v * get_random(0.2);
        this.angel = myAtan(enemy.y - this.y, enemy.x - this.x) + (Math.random() - 0.5) * 0.5;
        this.angel_h = property.property.angel_h_init;
        this.sprite = IMAGE_PROCESS.getsprite_rotate_high(
            this.property.img.normal.sprites[this.team],
            this.property.img.normal.margin,
            property.property.scale);
        this.shadowsprite = IMAGE_PROCESS.getsprite_shadow(this.property.img.shadowsprite);
        this.shadowsprite.scale.x *= property.property.scale;
        this.shadowsprite.scale.y *= property.property.scale;
        this.renderable = true;
        this.property.sight = 0;
        this.enemy = enemy;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.wait_smooke = 0;
    }



    init() {
        super.init();
        stage.addChild(this.sprite);
        stage.addChild(this.shadowsprite);
    }

    delete () {
        stage.removeChild(this.sprite);
        stage.removeChild(this.shadowsprite);
        super.delete();
    }


    draw() {
        if (this.state == STATE.DELETE)
            return;
        var pos = convert2screen(this.x, this.y, this.z);

        this.pos = pos;
        if (check_available_screen(this.pos, this.sprite.width / 2, this.sprite.height / 2) && GRID.check_availble_user_fogmap(this)) {

            // #region CORE CONVERT TO SCREEN
            var dx = 30 * (-this.vx + this.vy);
            var dy = -15 * this.vx - 15 * this.vy + 6 * this.vz;
            var dz = 30 * (-this.vx + -this.vy);
            var angle1 = myAtan(dy, dx);
            var angel2 = normal_angel(3 * Math.PI / 4 + myAtan(dz, Math.sqrt(dx * dx + dy * dy)));
            // #endregion

            this.sprite.z_idx = this.x + this.y + 0.55;
            this.sprite.change_rotation(angel2);
            this.sprite.position.set(this.pos.x, this.pos.y);
            this.sprite.renderable = true;
            this.sprite.rotation = angle1;
            if (this.healthsprite) {
                this.healthsprite.renderable = true;
                this.healthsprite.position.set(pos.x - 23, pos.y - 30);
            }
        } else {
            this.sprite.renderable = false;
            if (this.healthsprite) {
                this.healthsprite.renderable = false;
                this.healthsprite.position.set(pos.x - 23, pos.y - 30);
            }
        }

        var pos_shadow = convert2screen(this.x, this.y, GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)]);

        if (check_available_screen(pos_shadow, this.shadowsprite.width / 2, this.shadowsprite.height / 2) && GRID.check_availble_user_fogmap(this)) {
            this.shadowsprite.position.set(pos_shadow.x, pos_shadow.y);
            this.shadowsprite.renderable = true;
            this.shadowsprite.change_rotation(this.angel);
        } else {
            this.shadowsprite.renderable = false;
        }
    }

    process(time) {
        super.process(time);
        this.process_move(time);
        var add_speed_smooke = 1;

        if (this.timelife < 30)
            add_speed_smooke += 1 - (this.timelife / 30);

        this.wait_smooke += time;
        if (this.wait_smooke >= 2 || this.timelife < 15) {
            this.wait_smooke = 0;
            GAME_OBJECT.add_instance(new SmokeEffect2(
                this.x + Math.random() * 0.2 - 0.1 - 0.7 * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                this.y + Math.random() * 0.2 - 0.1 - 0.7 * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                this.z + Math.random() * 0.10 - 0.5 - 5 * 0.7 * mySin(this.angel_h),
                add_speed_smooke * (this.v - this.max_v) * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel_h) * 5
                ));
        } else {
            GAME_OBJECT.add_instance(new SmokeEffect2_supersort(
                this.x - 0.7 * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                this.y - 0.7 * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                this.z - 5 * 0.7 * mySin(this.angel_h),
                add_speed_smooke * (this.v - this.max_v) * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel_h) * 5
                ));
        }
        if ((GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)] >= this.z)) {
            this.delete();
            var x = Math.round(this.x),
                y = Math.round(this.y);
            GAME_OBJECT.add_instance(new Weapon(this, { x, y }, ATTACK_TYPE.attack_bomb_explorer));
        }
    }


    process_move(time) {
        time /= 60;
        if (this.enemy) {
            var DX = this.enemy.x - this.x;
            var DY = this.enemy.y - this.y;
            var DZ = (this.enemy.z - this.z) / 5;
            var DXY = Math.sqrt(DX * DX + DY * DY);
            var DXYZ = Math.sqrt(DX * DX + DY * DY + DZ * DZ);

            var max_angel_v = this.angelacceleration * time;
            var angel = myAtan(DY, DX);
            var angel_h = myAtan(DZ, Math.sqrt(DX * DX + DY * DY));
            var height = GRID.heightmap[GRID.dim * Math.round(this.x) + Math.round(this.y)];

            this.angel += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel - this.angel)));

            if (DXY < 10 * Math.abs(DZ * 0.18)) {
                this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel_h - this.angel_h)));
            }else if(this.z - height < 25){
                this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(Math.PI / 4 - this.angel_h)));
            } else {
                this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(0 - this.angel_h)));
            }


            if (DXYZ > 2 && this.timelife > 90) {
                this.angel += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel - this.angel)));
                if (this.angel_h > 0 || DXY < 10 * Math.abs(DZ * 0.18))
                    this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel_h - this.angel_h)));
            }

            var h = Math.abs(myCos(this.angel_h));
            this.v = Math.min(this.max_v, this.v + this.acceleration * time);
            this.x += this.vx = this.v * myCos(this.angel) * Math.abs(myCos(this.angel_h)) * time;
            this.y += this.vy = this.v * mySin(this.angel) * Math.abs(myCos(this.angel_h)) * time;
            this.z += this.vz = this.v * mySin(this.angel_h) * time * 5;

        }
    }


    /** @description Apply command for list game unit.
     * @param {Command} command The list of game unit.
     */
    command(command) { }


    on_destroy(attackobject) {
        super.on_destroy(attackobject);
        GAME_OBJECT.add_effect(this.x, this.y, this.z, EFFECT_TYPE.exploit5);
    }

    on_attacked(attackobject) {
        super.on_attacked(attackobject);
        console.log(this.health);
    }


    check_choose(x, y) { return false; }

    get_element_ceil() { return []; }

    scan_enemy() { return null; }

    filter_enemy() { return false; }
}




class Rocker extends Flyable_Unit {
    constructor(x, y, z, team, property, enemy) {
        super(Math.round(x), Math.round(y), z, team, property);
        this.v = property.property.min_v * get_random(0.2);
        this.acceleration = property.property.acceleration * get_random(0.2);
        this.angelacceleration = property.property.angelacceleration * get_random(0.2);
        this.max_v = property.property.max_v * get_random(0.2);
        this.angel = myAtan(enemy.y - this.y, enemy.x - this.x) + (Math.random() - 0.5) * 0.5;
        this.angel_h = property.property.angel_h_init;
        this.sprite = IMAGE_PROCESS.getsprite_rotate_high(
            this.property.img.normal.sprites[this.team],
            this.property.img.normal.margin,
            property.property.scale);
        this.shadowsprite = IMAGE_PROCESS.getsprite_shadow(this.property.img.shadowsprite);
        this.shadowsprite.scale.x *= property.property.scale;
        this.shadowsprite.scale.y *= property.property.scale;
        this.renderable = true;
        this.property.sight = 0;
        this.enemy = enemy;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.wait_smooke = 0;
    }



    init() {
        super.init();
        stage.addChild(this.sprite);
        stage.addChild(this.shadowsprite);
    }

    delete () {
        stage.removeChild(this.sprite);
        stage.removeChild(this.shadowsprite);
        super.delete();
    }


    draw() {
        if (this.state == STATE.DELETE)
            return;
        var pos = convert2screen(this.x, this.y, this.z);

        this.pos = pos;
        if (check_available_screen(this.pos, this.sprite.width / 2, this.sprite.height / 2) && GRID.check_availble_user_fogmap(this)) {

            // #region CORE CONVERT TO SCREEN
            var dx = 30 * (-this.vx + this.vy);
            var dy = -15 * this.vx - 15 * this.vy + 6 * this.vz;
            var dz = 30 * (-this.vx + -this.vy);
            var angle1 = myAtan(dy, dx);
            var angel2 = normal_angel(3 * Math.PI / 4 + myAtan(dz, Math.sqrt(dx * dx + dy * dy)));
            // #endregion

            this.sprite.z_idx = this.x + this.y + 0.55;
            this.sprite.change_rotation(angel2);
            this.sprite.position.set(this.pos.x, this.pos.y);
            this.sprite.renderable = true;
            this.sprite.rotation = angle1;
            if (this.healthsprite) {
                this.healthsprite.renderable = true;
                this.healthsprite.position.set(pos.x - 23, pos.y - 30);
            }
        } else {
            this.sprite.renderable = false;
            if (this.healthsprite) {
                this.healthsprite.renderable = false;
                this.healthsprite.position.set(pos.x - 23, pos.y - 30);
            }
        }

        var pos_shadow = convert2screen(this.x, this.y, GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)]);

        if (check_available_screen(pos_shadow, this.shadowsprite.width / 2, this.shadowsprite.height / 2) && GRID.check_availble_user_fogmap(this)) {
            this.shadowsprite.position.set(pos_shadow.x, pos_shadow.y);
            this.shadowsprite.renderable = true;
            this.shadowsprite.change_rotation(this.angel);
        } else {
            this.shadowsprite.renderable = false;
        }
    }

    process(time) {
        super.process(time);
        this.process_move(time);
        var add_speed_smooke = 1;

        if (this.timelife < 30)
            add_speed_smooke += 1 - (this.timelife / 30);

        this.wait_smooke += time;
        if (this.wait_smooke >= 2 || this.timelife < 15) {
            this.wait_smooke = 0;
            GAME_OBJECT.add_instance(new SmokeEffect2(
                this.x + Math.random() * 0.2 - 0.1 - 0.7 * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                this.y + Math.random() * 0.2 - 0.1 - 0.7 * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                this.z + Math.random() * 0.10 - 0.5 - 5 * 0.7 * mySin(this.angel_h),
                add_speed_smooke * (this.v - this.max_v) * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel_h) * 5
                ));
        } else {
            GAME_OBJECT.add_instance(new SmokeEffect2_supersort(
                this.x - 0.7 * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                this.y - 0.7 * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                this.z - 5 * 0.7 * mySin(this.angel_h),
                add_speed_smooke * (this.v - this.max_v) * myCos(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel) * Math.abs(myCos(this.angel_h)),
                add_speed_smooke * (this.v - this.max_v) * mySin(this.angel_h) * 5
                ));
        }
        if ((GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)] >= this.z)) {
            this.delete();
            var x = Math.round(this.x),
                y = Math.round(this.y);
            GAME_OBJECT.add_instance(new Weapon(this, { x, y }, ATTACK_TYPE.attack_bomb_explorer));
        }
    }


    process_move(time) {
        time /= 60;
        if (this.enemy) {
            var DX = this.enemy.x - this.x;
            var DY = this.enemy.y - this.y;
            var DZ = (this.enemy.z - this.z) / 5;
            var DXY = Math.sqrt(DX * DX + DY * DY);
            var DXYZ = Math.sqrt(DX * DX + DY * DY + DZ * DZ);

            var max_angel_v = this.angelacceleration * time;
            var angel = myAtan(DY, DX);
            var angel_h = myAtan(DZ, Math.sqrt(DX * DX + DY * DY));
            var height = GRID.heightmap[GRID.dim * Math.round(this.x) + Math.round(this.y)];

            this.angel += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel - this.angel)));

            if (DXY < 10 * Math.abs(DZ * 0.18)) {
                this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel_h - this.angel_h)));
            } else if (this.z - height < 25) {
                this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(Math.PI / 4 - this.angel_h)));
            } else {
                this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(0 - this.angel_h)));
            }


            if (DXYZ > 2 && this.timelife > 90) {
                this.angel += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel - this.angel)));
                if (this.angel_h > 0 || DXY < 10 * Math.abs(DZ * 0.18))
                    this.angel_h += Math.max(-max_angel_v, Math.min(max_angel_v, normal_angel(angel_h - this.angel_h)));
            }

            var h = Math.abs(myCos(this.angel_h));
            this.v = Math.min(this.max_v, this.v + this.acceleration * time);
            this.x += this.vx = this.v * myCos(this.angel) * Math.abs(myCos(this.angel_h)) * time;
            this.y += this.vy = this.v * mySin(this.angel) * Math.abs(myCos(this.angel_h)) * time;
            this.z += this.vz = this.v * mySin(this.angel_h) * time * 5;

        }
    }


    /** @description Apply command for list game unit.
     * @param {Command} command The list of game unit.
     */
    command(command) { }


    on_destroy(attackobject) {
        super.on_destroy(attackobject);
        GAME_OBJECT.add_effect(this.x, this.y, this.z, EFFECT_TYPE.exploit5);
    }

    on_attacked(attackobject) {
        super.on_attacked(attackobject);
        console.log(this.health);
    }


    check_choose(x, y) { return false; }

    get_element_ceil() { return []; }

    scan_enemy() { return null; }

    filter_enemy() { return false; }
}


var PLANE_UNIT_TYPE = {};


var __beag__map__state__ = {
    "move_to_attack": STATE.MOVE2ATTACK,
    "return_to_attack": STATE.MOVE2ATTACK,
    "move": STATE.MOVE,
    "move_to_home": STATE.MOVE,
    "attack": STATE.MOVE2ATTACK,
    "in_home": STATE.IDLE,
    "take_down": STATE.MOVE
}


PLANE_UNIT_TYPE.beag = {
    name: "beag",
    type: "plane",
    img: {
        main_path: "IMG/Unit/Plane/beag/",
        normal: { path: "img", from: 1, to: 19 },
        shadow: "shadow.png",
        high_res: true,
        angel_rotate_fail: 7,
    },
    audio: {},
    property: {
        shield: { _1: Infinity, _2: 30, _3: 30, _4: 30 },
        life: 40,
        cost: 2000,
        speed: 5.5,
        attack_type: "attack_tesla",
        attack_time: 70,
        attack_dam: 17,
        range: 13,
        sight: 14,
        angel_v: 2,
        height_fly: 35,

    },
    //require: ["con_power_allied", "con_tech_allied"],
    class: class extends Plane_unit {
        constructor(...Args) {
            super(...Args);
            this.state_plus = "in_home";
            this.bomb_count = 8;
            this.home = null;
            this.attacking = false;
        }
        init() {
            super.init();
            this.healthsprite.set_contain(8, 8);
        }
        process(time) {
            super.process(time);
            const sss = 13;
            const attack_delta = 6;
            switch (this.state_plus) {
                case "move":
                    var farfar = calcfar(this, this.goal);
                    if (farfar < sss * 0.5)
                        this.changetostateplus("move_to_home");
                    break;
                case "move_to_attack":
                case "return_to_attack":
                    var angle = myAtan(this.enemy.y - this.y, this.enemy.x - this.x);
                    var delta = normal_angel(angle - this.angel);
                    var farfar = calcfar(this, this.enemy);
                    if (this.state_plus == "move_to_attack") {
                        this.check_collision = farfar > sss * 1.5;
                    }
                    if (this.bomb_count <= 0) {
                        this.changetostateplus("move_to_home");
                    } else if (calcfar(this, this.enemy) < sss && Math.abs(Math.tan(delta) * farfar) < 1.1) {
                        this.changetostateplus("attack");
                    }
                    break;
                case "attack":
                    if (this.bomb_count > 0) {
                        this.attackload += time;
                        let angle = myAtan(this.enemy.y - this.y, this.enemy.x - this.x);
                        let delta = normal_angel(angle - this.angel);

                        if (this.attackload > attack_delta
                            && ATTACK_TYPE.attack_bomb_beag.check_can_drop_bomb(this, this.enemy, 2.0)) {
                            //this.attacking = true;
                            this.bomb_count--;
                            this.attackload = 0;
                            this.attack();
                            this.healthsprite.set_contain(this.bomb_count, 8);
                        } else if (this.attacking) {
                            //this.attacking = false;
                            //this.check_collision = true;
                        }

                        if (this.enemy.state == STATE.DELETE) {
                            this.changetostateplus("move_to_home");
                        } else if (calcfar(this, this.enemy) > sss * 1.2)
                            this.changetostateplus("move_to_attack");


                    } else {
                        this.changetostateplus("move_to_home");
                    }
                    break;
                case "move_to_home":
                    if (!this.home || this.home.state == STATE.DELETE) {
                        var point = this.find_home();
                        if (point) {
                            this.home = point.ob;
                            this.goal = point.point;
                        }
                    }
                    if (this.home) {
                        var far = calcfar(this, this.goal);
                        if (far < 6) {
                            this.v = this.property.property.speed * Math.sqrt(far / 6);
                            this.check_collision = false;
                        }
                        if (far < 0.1) {
                            this.changetostateplus("take_down");
                        }
                    }
                    break;
                case "take_down":
                    if (this.z > GRID.heightmap[Math.round(this.x) * GRID.dim + Math.round(this.y)]) {
                        this.z -= time * 0.2;
                        if (this.home.state == STATE.DELETE)
                            this.changetostateplus("move_to_home");
                    } else {
                        this.changetostateplus("in_home");
                    }
                    break;
                case "in_home":
                    if (this.home && this.home.health > 0) {
                        this.bomb_count = Math.min(8, this.bomb_count + time * 0.008);
                        this.healthsprite.set_contain(Math.floor(this.bomb_count), 8);
                        this.health = Math.min(this.totalhealth, this.health + time * 0.3);
                    }
                    break;

            }
        }
        changetostateplus(state) {
            this.state_plus = state;
            this.check_collision = true;
            this.angelv = this.property.property.angel_v;
            this.v = this.property.property.speed;
            switch (state) {
                case "move_to_attack":
                case "return_to_attack":
                    this.home && this.home.unregister_home(this);
                    this.home = null;
                    break;
                case "move":
                    this.home && this.home.unregister_home(this);
                    this.home = null;
                    this.enemy = null;
                    break;
                case "move_to_home":
                    this.enemy = null;
                    break;
                case "attack":
                    this.home && this.home.unregister_home(this);
                    this.check_collision = false;
                    this.angelv = 0;
                    break;
                case "in_home":
                    this.goal = false;
                    this.enemy = false;
                    break;
                case "take_down":
                    this.check_collision = false;
                    this.goal.x += 1;
                    this.v = 0;
                    break;
            }
        }
        changetostate(state) {
            super.changetostate(state);
            switch (this.state) {
                case STATE.MOVE2ATTACK:
                    this.changetostateplus("move_to_attack");
                    break;
                case STATE.MOVE:
                    this.changetostateplus("move");
                    break;
            }
        }
        attack() {
            GAME_OBJECT.add_instance(new Weapon(this, this.enemy, ATTACK_TYPE.attack_bomb_beag));
        }
        find_home() {
            var list_check = GAME_OBJECT.listgameunit[this.team]
                .filter(e => e instanceof CONSTRUCTION_TYPE.con_airplan_allied.class && e.team == this.team);
            list_check.forEach(e => e.__far_temp__ = calcfar(this, e));
            list_check.sort((e, f) => e.__far_temp__ - f.__far_temp__);

            for(var ob of list_check) {
                var point = ob.register_home(this);
                if (point)
                    return { ob, point };
            }
        }
        set_data(array, idx, team) {
            var add = (team == this.team);
            super.set_data(array, idx, team)
            array[idx + 18] = add && this.bomb_count;
            array[idx + 9] = add && __beag__map__state__[this.state_plus];
        }
        get_data(team) {
            super.get_data(team);
            if (this.team == team) {
                this._data_.container = this.bomb_count;
                this._data_.state = __beag__map__state__[this.state_plus];
            }
            return this._data_;
        }
    }

}


PLANE_UNIT_TYPE.plane = {
    name: "plane",
    type: "plane",
    img: {
        main_path: "IMG/Unit/Plane/plane/",
        normal: { path: "img", from: 1, to: 51 },
        shadow: "shadow.png",
        high_res: true,
        angel_rotate_fail: 6,
    },
    audio: {},
    property: {
        shield: { _1: Infinity, _2: 100, _3: 100, _4: 100 },
        life: 80,
        speed: 4.5,
        attack_type: "attack_tesla",
        attack_time: 70,
        attack_dam: 10,
        range: 13,
        sight: 14,
        angel_v: 0.8,
        height_fly: 32,
    },
    require: ["notfound"],

    class: class extends Plane_unit {
        constructor(x, y, z, team, property) {
            super(0, 0, 0, team, property);
            this.drop_point = { x, y };
            this.stateplus = "init";
            this.pa_number = 20;
        }
        process(time) {
            switch (this.stateplus) {
                case "init":
                    TEAM[this.team].team.send_command([this], {
                        com: "move",
                        goal: this.drop_point,
                        __flag__private__: true
                    })
                    this.stateplus = "go_to_drop";
                    break;
                case "go_to_drop":
                    if (calcfar(this, this.drop_point) < 6) {
                        this.stateplus = "dropping";
                        this.angelv = 0;
                    }
                    break;
                case "dropping":
                    if (this.pa_number > 0) {
                        if (Math.random() < (time * 0.15 * SPEED)) {
                            this.pa_number--;
                            GAME_OBJECT.add_instance(new Parachutist(
                                this.x + 4 * Math.random() - 2,
                                this.y + 4 * Math.random() - 2,
                                this.z,
                                this.team,
                                SOLIDER_TYPE.sol_gi_allied
                            ));
                        }
                    } else {
                        this.stateplus = "go_back";
                        this.angelv = this.property.property.angel_v;
                        TEAM[this.team].team.send_command([this], {
                            com: "move",
                            goal: { x: GRID.dim, y: GRID.dim },
                            __flag__private__: true
                        });
                    }
                    break;
                case "go_back":
                    {
                        let x = (this.x - this.y + GRID.dim1_2) / 2;
                        let y = (this.x + this.y - GRID.dim1_2) / 2;
                        if (x < -10 || y < -10 || x > GRID.dim1_2 + 10 || y > GRID.dim1_2 + 10)
                            this.delete();
                    }
                    break;
            }
            super.process(time);
        }

        command(command) {
            if (command.__flag__private__) {
                super.command(command);
            }
        }

        check_choose(x, y) {
            return false;
        }
    }

}


PLANE_UNIT_TYPE.zeg = {
    name: "zeg",
    type: "plane",
    img: {
        main_path: "IMG/Unit/Plane/zeg/",
        normal: { path: "img", from: 1, to: 51 },
        shadow: "shadow.png",
        angel_rotate_fail: 1.5,
    },
    audio: {},
    property: {
        shield: { _1: Infinity, _2: 100, _3: 100, _4: 100 },
        life: 800,
        cost: 2000,
        speed: 0.75,
        attack_type: "attack_tesla",
        attack_time: 70,
        attack_dam: 10,
        range: 13,
        sight: 14,
        angel_v: 0.17,
        height_fly: 28
    },
    require: ["con_power_allied"],
    class: Plane_unit
}


PLANE_UNIT_TYPE.rocket = {
    name: "rocket",
    type: "plane",
    img: {
        main_path: "IMG/Unit/Plane/rocket/",
        normal: { path: "img", from: 1, to: 40 },
        shadow: "shadow.png",
    },
    audio: {},
    property: {
        shield: { _1: Infinity, _2: 15, _3: 15, _4: 15 },
        life: 100,
        angelacceleration: 0.5,
        acceleration: 1,
        min_v: 0,
        max_v: 8.5,
        attack_dam: 16,
        angel_h_init: Math.PI / 7,
        scale : 0.85

    },
    require: ["Notfound@@@@@@@@"],
    class: V3Rocket,
    get_object(x, y, z, t, enemy) {
        if (!enemy)
            throw new Error("sssssssssssssssssssssssss");
        return new V3Rocket(x, y, z, t, this, enemy);
    }
}




var ADDITIONAL_TYPE = {};




ADDITIONAL_TYPE.parachutist_plane = {
    name: "parachutist_plane",
    type: "additional",
    property: {
        time: 120,
    },
    require: ["cuairp"],
    run(team, pos) {
        GAME_OBJECT.add_unit(pos.x, pos.y, 0, team, PLANE_UNIT_TYPE.plane);
    }
};
