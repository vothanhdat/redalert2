export const LOADER_SCREEN = new (function () {

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
        // console.log(this)
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





