// import PIXI from "pixi.js"
import { GlowFilter, GlowFilter2, Lighter4x } from "./jsHelper";

export const mainstage = new PIXI.Container();

//mainstage.filterArea = new PIXI.Rectangle(0, 0, 300, 300);

export const mapcontainer = new PIXI.Container();
mainstage.addChild(mapcontainer);

export const stage = new PIXI.Container();
mainstage.addChild(stage);

export const particlecontainer = new PIXI.Container();
mainstage.addChild(particlecontainer);

export const smokecontainer = new PIXI.Container();
mainstage.addChild(smokecontainer);

export const smokecontainer2 = new PIXI.Container();
mainstage.addChild(smokecontainer2);
smokecontainer2.filters = [new Lighter4x()];


export const firecontainer = new PIXI.Container();
mainstage.addChild(firecontainer);

export const variouscontainer = new PIXI.Container();
mainstage.addChild(variouscontainer);

export const graphics2 = new PIXI.Graphics();
graphics2.filters = [new GlowFilter(), new GlowFilter2()];
mainstage.addChild(graphics2);

export const air_container = new PIXI.Container();
mainstage.addChild(air_container);

export const cloundcontainer = new PIXI.Container();
mainstage.addChild(cloundcontainer);


export const graphics = new PIXI.Graphics();
mainstage.addChild(graphics);


export const healthcontainer = new PIXI.Container();
mainstage.addChild(healthcontainer);


export const mouse_stage = new PIXI.Container();
