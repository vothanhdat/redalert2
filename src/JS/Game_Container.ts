// TypeScript conversion of Game_Container
import * as PIXI from 'pixi.js';

// Access global PIXI from window
const PIXI_GLOBAL = (window as any).PIXI;

// Main stage container
const mainstage = new PIXI_GLOBAL.Container();
(window as any).mainstage = mainstage;

// Map container
const mapcontainer = new PIXI_GLOBAL.Container();
mainstage.addChild(mapcontainer);
(window as any).mapcontainer = mapcontainer;

// Main stage for game objects
const stage = new PIXI_GLOBAL.Container();
mainstage.addChild(stage);
(window as any).stage = stage;

// Particle container
const particlecontainer = new PIXI_GLOBAL.Container();
mainstage.addChild(particlecontainer);
(window as any).particlecontainer = particlecontainer;

// Smoke containers
const smokecontainer = new PIXI_GLOBAL.Container();
mainstage.addChild(smokecontainer);
(window as any).smokecontainer = smokecontainer;

const smokecontainer2 = new PIXI_GLOBAL.Container();
mainstage.addChild(smokecontainer2);
// Note: Lighter4x filter needs to be defined elsewhere
if ((window as any).Lighter4x) {
    smokecontainer2.filters = [new (window as any).Lighter4x()];
}
(window as any).smokecontainer2 = smokecontainer2;

// Fire container
const firecontainer = new PIXI_GLOBAL.Container();
mainstage.addChild(firecontainer);
(window as any).firecontainer = firecontainer;

// Various container
const variouscontainer = new PIXI_GLOBAL.Container();
mainstage.addChild(variouscontainer);
(window as any).variouscontainer = variouscontainer;

// Graphics with glow filters
const graphics2 = new PIXI_GLOBAL.Graphics();
// Note: GlowFilter needs to be defined elsewhere
if ((window as any).GlowFilter && (window as any).GlowFilter2) {
    graphics2.filters = [new (window as any).GlowFilter(), new (window as any).GlowFilter2()];
}
mainstage.addChild(graphics2);
(window as any).graphics2 = graphics2;

// Air container
const air_container = new PIXI_GLOBAL.Container();
mainstage.addChild(air_container);
(window as any).air_container = air_container;

// Cloud container
const cloundcontainer = new PIXI_GLOBAL.Container();
mainstage.addChild(cloundcontainer);
(window as any).cloundcontainer = cloundcontainer;

// Graphics
const graphics = new PIXI_GLOBAL.Graphics();
mainstage.addChild(graphics);
(window as any).graphics = graphics;

// Health container
const healthcontainer = new PIXI_GLOBAL.Container();
mainstage.addChild(healthcontainer);
(window as any).healthcontainer = healthcontainer;

// Mouse stage
const mouse_stage = new PIXI_GLOBAL.Container();
(window as any).mouse_stage = mouse_stage;
