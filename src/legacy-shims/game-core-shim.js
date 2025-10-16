const g = globalThis;

if (!g.__legacyErrorLog) {
	g.__legacyErrorLog = [];
	window.addEventListener("error", (event) => {
		g.__legacyErrorLog.push({
			message: event.message,
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno,
			stack: event.error ? event.error.stack : null
		});
	});
}

if (typeof g.SPEED === "undefined") {
	g.SPEED = 1;
}
if (typeof g.UI_WIDTH === "undefined") {
	g.UI_WIDTH = 250;
}
if (typeof g.UI_HEIGTH === "undefined") {
	g.UI_HEIGTH = 30;
}
if (typeof g.screen_width === "undefined") {
	g.screen_width = window.innerWidth || 0;
}
if (typeof g.screen_height === "undefined") {
	g.screen_height = window.innerHeight || 0;
}
if (typeof g.display_width === "undefined") {
	g.display_width = g.screen_width - g.UI_WIDTH;
}
if (typeof g.display_height === "undefined") {
	g.display_height = g.screen_height - g.UI_HEIGTH;
}
if (typeof g.screen_x === "undefined") {
	g.screen_x = 0;
}
if (typeof g.screen_y === "undefined") {
	g.screen_y = 0;
}
if (typeof g.screen_w === "undefined") {
	g.screen_w = 1;
}
if (typeof g.screen_h === "undefined") {
	g.screen_h = 1;
}
if (typeof g.max_x === "undefined") {
	g.max_x = 0;
}
if (typeof g.max_y === "undefined") {
	g.max_y = 0;
}
if (typeof g.renderer === "undefined") {
	g.renderer = null;
}
if (typeof g.mouserenderer === "undefined") {
	g.mouserenderer = null;
}

await Promise.all([
	import("../JS/Game_Container.js"),
	import("../JS/Game_object/GRID.js"),
	import("../JS/Game_object/Game_object.js")
]);
