// @ts-nocheck
//
// Stage 3 of the Vite/TypeScript migration: this file is renamed to .ts but not yet typed.
// It is 2015-era JavaScript whose classes assign undeclared properties in their
// constructors, which TypeScript reports as TS2339 several hundred times per file.
//
// Remove this directive one file at a time, declare the class fields, and let
// `npx tsc --noEmit` gate the result. Files already checked: src/core/*, src/lib/*,
// src/Game_Container.ts, src/UI/Playing_layout.ts, src/main.ts.
var LOADER_SCREEN = new (function () {

    this.div = null;
    this.progess_bar = null;
    this.on_start = function () {
        this.div = $("#loader")[0];
        this.progess_bar = $("div#loader progress")[0];
        var nodes = document.body.childNodes;
        for (var i in nodes) {
            if (nodes[i].nodeName == "CANVAS" || nodes[i].nodeName == "DIV") {
                nodes[i].style.display = "none";
            }

        }
        this.div.style.display = null;
        this.div.style.width = innerWidth;
        this.div.style.width = innerHeight;
    }


    this.on_done = function () {
        var nodes = document.body.childNodes;
        for (var i in nodes) {
            if (nodes[i].nodeName == "CANVAS" || nodes[i].nodeName == "DIV") {
                nodes[i].style.display = null;
            }
        }
        this.div.style.display = "none";
        this.div.remove();
    }

    this.on_done_texture = function () {
        var nodes = document.body.childNodes;
        for (var i in nodes) {
            if (nodes[i].nodeName == "CANVAS" || nodes[i].nodeName == "DIV") {
                nodes[i].style.display = null;
            }
        }
        this.div.style.display = "none";
        this.div.remove();

    }


    this.on_progess = function (progess) {
        console.log('Progress:', progess, "%");
        if (this.progess_bar)
            this.progess_bar.value = (progess * 100);
    }


})();







export { LOADER_SCREEN };
