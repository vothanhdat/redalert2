var LOADER_SCREEN = new (function () {

    this.div = null;
    this.progess_bar = null;
    this.on_start = function () {
        this.div = $("#loader")[0];
        this.progess_bar = $("div#loader progress")[0];
        for (const node of Array.from(document.body.childNodes)) {
            if (node.nodeName == "CANVAS" || node.nodeName == "DIV") {
                (node as HTMLElement).style.display = "none";
            }
        }
        this.div.style.display = null;
        this.div.style.width = innerWidth;
        this.div.style.width = innerHeight;
    }


    this.on_done = function () {
        for (const node of Array.from(document.body.childNodes)) {
            if (node.nodeName == "CANVAS" || node.nodeName == "DIV") {
                (node as HTMLElement).style.display = null;
            }
        }
        this.div.style.display = "none";
        this.div.remove();
    }

    this.on_done_texture = function () {
        for (const node of Array.from(document.body.childNodes)) {
            if (node.nodeName == "CANVAS" || node.nodeName == "DIV") {
                (node as HTMLElement).style.display = null;
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
