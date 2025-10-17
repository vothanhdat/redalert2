// import PIXI from "pixi.js";

import { Game_weapon_Base } from "../../Game_object";

export const WEAPON = {
    init: function (property) {
        if (property.property.attack.area > 0) {
            var area_ = property.property.attack.area;
            var arear_array = [];
            for (var i = -area_; i <= area_; i++)
                for (var j = -area_; j <= area_; j++)
                    if (i * i + j * j <= (area_ + 1) * (area_ + 1))
                        arear_array.push({ x: i, y: j, dam: Math.max((area_ + 1 - Math.sqrt(i * i + j * j)) / (area_ + 1), 0) });
            property.attack_arear = arear_array;
        }
    },
    list_static_process_function: [],
    static_process: function (time) {
        for(var e of WEAPON.list_static_process_function)
            e(time);
    }
}

export class Game_weapon extends Game_weapon_Base {

}


export class Weapon extends Game_weapon {


    /**
      Constructor for a new Weapon
      @class Game_unit
      @param {Game_unit} parrent 
      @param {Game_unit} distination 
      @param {Weapon_Property} property 
    */
    constructor(parrent, distination, property) {
        super(parrent.x, parrent.y, parrent.z + (parrent.height || 0));
        this.parrent = parrent;
        this.distination = distination;
        this.property = property;
        this.team = parrent.team;
        this.attack = property.property.attack;
        this.maxtimeline = property.property.timeline || 20;
        this.damage_point = null;
        this.timeline = 0;
        if (property.property.attack.area > 0)
            this.setdamage = this.setdamage_area;
        
    }
    init() {
        super.init();
        this.property.init(this, this.property);
        
    }

    process(time) {
        this.timeline += time;
        super.process(time);
        var dam = this.property.process(this, this.property, time);
        dam && this.setdamage(this.damage_point || this.distination, this, dam * this.parrent.attackdam);
        if (this.timeline >= this.maxtimeline) {
            this.delete();
        }
    }

    draw() {
        this.pos1 = convert2screen(this.x, this.y, this.z);
        this.pos2 = convert2screen(this.distination.x, this.distination.y, this.distination.z);
        this.property.draw(this, this.property);
    }

    calcdammage(distination) {
        if (distination && distination.shield && distination.team != this.team) {
            var ob1 = this.attack;
            var ob2 = distination.shield;
            return (ob1._1 / ob2._1 + ob1._2 / ob2._2 + ob1._3 / ob2._3 + ob1._4 / ob2._4);
        } else {
            return 0;
        }
    }

    on_attack(ob, dam) {
        ob.health -= dam;
    }

    delete () {
        this.property.on_delete && this.property.on_delete(this, this.property);
        super.delete();
    }

    setdamage(distination, ob, dam) {
        var center_x = distination.nx || Math.round(distination.x);
        var center_y = distination.ny || Math.round(distination.y);
        if (center_x < 0 || center_y < 0 || center_x >= GRID.objectmap.length || center_y >= GRID.objectmap.length)
            return;
        if (distination instanceof Game_unit) {
            damage = dam * ob.calcdammage(distination);
            ob.on_attack && ob.on_attack(distination, damage);
            distination.on_attacked && distination.on_attacked(ob, damage);
        } else {
            for(var f of GRID.objectmap[center_x * GRID.dim + center_y]) {
                var damage = dam * ob.calcdammage(f);
                ob.on_attack && ob.on_attack(f, damage);
                f.on_attacked && f.on_attacked(ob, damage);
                break;
            }
        }
    }

    setdamage_area(distination, ob, dam) {
        var center_x = Math.round(distination.x);
        var center_y = Math.round(distination.y);
        for(var e of this.property.attack_arear) {
            var x = center_x + e.x,
                y = center_y + e.y,
                dam2 = e.dam * dam;
            if (x < 0 || y < 0 || x >= GRID.objectmap.length || y >= GRID.objectmap.length)
                return;
            for(var f of GRID.objectmap[x * GRID.dim + y]) {
                var damage = dam2 * ob.calcdammage(f);
                ob.on_attack && ob.on_attack(f, damage);
                f.on_attacked && f.on_attacked(ob, damage);
            }
        }
    }

    setdamage_area2(area, ob, dam) {
        var I, x, y;
        for (var i in area) {
            I = i.split(" ");
            x = parseInt(I[0]);
            y = parseInt(I[1]);
            if (x < 0 || y < 0 || x >= GRID.objectmap.length || y >= GRID.objectmap.length)
                return;
            for(var f of GRID.objectmap[x * GRID.dim + y]) {
                var damage = area[i] * dam * ob.calcdammage(f);
                ob.on_attack && ob.on_attack(f, damage);
                f.on_attacked && f.on_attacked(ob, damage);
            }
        }
    }

}

var linetexture = new PIXI.Texture.fromImage("IMG/Unit/Attack/Laser/laser.png");
var linetexture_rgb = new PIXI.Texture(linetexture.baseTexture, new PIXI.Rectangle(0, 1, 1, 3));
var linetexture_simple = new PIXI.Texture(linetexture.baseTexture, new PIXI.Rectangle(0, 2, 1, 1));



var updateline = function (line, pos1, pos2) {
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

var createline = function (pos1, pos2) {
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

var createline2 = function (pos, w, h) {
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

