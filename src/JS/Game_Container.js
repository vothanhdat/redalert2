const alreadyDefined = typeof globalThis.mainstage !== "undefined";

const mainstage = alreadyDefined ? globalThis.mainstage : new PIXI.Container();
const mapcontainer = alreadyDefined ? globalThis.mapcontainer : new PIXI.Container();
const stage = alreadyDefined ? globalThis.stage : new PIXI.Container();
const particlecontainer = alreadyDefined ? globalThis.particlecontainer : new PIXI.Container();
const smokecontainer = alreadyDefined ? globalThis.smokecontainer : new PIXI.Container();
const smokecontainer2 = alreadyDefined ? globalThis.smokecontainer2 : new PIXI.Container();
const firecontainer = alreadyDefined ? globalThis.firecontainer : new PIXI.Container();
const variouscontainer = alreadyDefined ? globalThis.variouscontainer : new PIXI.Container();
const graphics2 = alreadyDefined ? globalThis.graphics2 : new PIXI.Graphics();
const air_container = alreadyDefined ? globalThis.air_container : new PIXI.Container();
const cloundcontainer = alreadyDefined ? globalThis.cloundcontainer : new PIXI.Container();
const graphics = alreadyDefined ? globalThis.graphics : new PIXI.Graphics();
const healthcontainer = alreadyDefined ? globalThis.healthcontainer : new PIXI.Container();
const mouse_stage = alreadyDefined ? globalThis.mouse_stage : new PIXI.Container();

if (!alreadyDefined) {
	mainstage.addChild(mapcontainer);
	mainstage.addChild(stage);
	mainstage.addChild(particlecontainer);
	mainstage.addChild(smokecontainer);
	mainstage.addChild(smokecontainer2);
	smokecontainer2.filters = [new Lighter4x()];
	mainstage.addChild(firecontainer);
	mainstage.addChild(variouscontainer);
	graphics2.filters = [new GlowFilter(), new GlowFilter2()];
	mainstage.addChild(graphics2);
	mainstage.addChild(air_container);
	mainstage.addChild(cloundcontainer);
	mainstage.addChild(graphics);
	mainstage.addChild(healthcontainer);

	globalThis.mainstage = mainstage;
	globalThis.mapcontainer = mapcontainer;
	globalThis.stage = stage;
	globalThis.particlecontainer = particlecontainer;
	globalThis.smokecontainer = smokecontainer;
	globalThis.smokecontainer2 = smokecontainer2;
	globalThis.firecontainer = firecontainer;
	globalThis.variouscontainer = variouscontainer;
	globalThis.graphics2 = graphics2;
	globalThis.air_container = air_container;
	globalThis.cloundcontainer = cloundcontainer;
	globalThis.graphics = graphics;
	globalThis.healthcontainer = healthcontainer;
	globalThis.mouse_stage = mouse_stage;
}

export {
	mainstage,
	mapcontainer,
	stage,
	particlecontainer,
	smokecontainer,
	smokecontainer2,
	firecontainer,
	variouscontainer,
	graphics2,
	air_container,
	cloundcontainer,
	graphics,
	healthcontainer,
	mouse_stage
};
