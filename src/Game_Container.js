import { GlowFilter, GlowFilter2, Lighter4x } from "./lib/JavaScript_helper.js";

/// <reference path="../Scripts/pixi.js" />

var mainstage = new PIXI.Container();

//mainstage.filterArea = new PIXI.Rectangle(0, 0, 300, 300);

var mapcontainer = new PIXI.Container();
mainstage.addChild(mapcontainer);

var stage = new PIXI.Container();
mainstage.addChild(stage);

var particlecontainer = new PIXI.Container();
mainstage.addChild(particlecontainer);

var smokecontainer = new PIXI.Container();
mainstage.addChild(smokecontainer);

var smokecontainer2 = new PIXI.Container();
mainstage.addChild(smokecontainer2);
smokecontainer2.filters = [new Lighter4x()];


var firecontainer = new PIXI.Container();
mainstage.addChild(firecontainer);

var variouscontainer = new PIXI.Container();
mainstage.addChild(variouscontainer);

var graphics2 = new PIXI.Graphics();
graphics2.filters = [new GlowFilter(), new GlowFilter2()];
mainstage.addChild(graphics2);

var air_container = new PIXI.Container();
mainstage.addChild(air_container);

var cloundcontainer = new PIXI.Container();
mainstage.addChild(cloundcontainer);


var graphics = new PIXI.Graphics();
mainstage.addChild(graphics);


var healthcontainer = new PIXI.Container();
mainstage.addChild(healthcontainer);


var mouse_stage = new PIXI.Container();


export { air_container, cloundcontainer, firecontainer, graphics, graphics2, healthcontainer, mainstage, mapcontainer, mouse_stage, particlecontainer, smokecontainer, smokecontainer2, stage, variouscontainer };
