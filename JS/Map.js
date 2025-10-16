

/*
Map material  :
0 : Ground;
1 : Rock : can't move here;
2 : Water
3 : Rock Water: can't move here;
*/



// const MAP_TEST_DEEP = false;


// const MAP_TEST_DEEP2 = false;

function convertImageToCanvas(image) {
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    return canvas;
}

function loadImageData(src) {
    var imgmaptexture = new Image();
    imgmaptexture.src = src;

    return new Promise((resolve, reject) => {
        imgmaptexture.onload = () => resolve(imgmaptexture);
        imgmaptexture.onerror = (err) => reject(err);
    }).then((image) => {
        var mapcontext = convertImageToCanvas(image).getContext("2d");
        var mapdataarray = mapcontext.getImageData(0, 0, image.width, image.height);
        return mapdataarray
    })
}


var init_mapscr2pos = function (heightmap) {
    var mapscr2pos = [];

    for (var i = 0; i < heightmap.length; i++) {
        for (var j = 0; j < heightmap[i].length; j++) {
            var height = heightmap[i][j];
            var newx = Math.floor(0.2 * (5 * i + 10 - height));
            var newy = Math.floor(0.2 * (5 * j + 10 - height));
            if (!mapscr2pos[newx])
                mapscr2pos[newx] = [];
            mapscr2pos[newx][newy] = { x: i, y: j };
        }
    }
    return mapscr2pos;
}


var getTextureOffsetMap = (mapoffset) => {
    let mapTextureOffset = {}

    var mapoffsetFn = {
        setoffsetarrayY: function (y, from, to) {
            for (var i = from; i <= to; i++)
                mapTextureOffset[i] = { y };
        },
        setoffsetY: function (y, array) {
            for (var index of array)
                mapTextureOffset[index] = { y };
        },
        setoffsetXandY: function (x, y, array) {
            for (var index of array)
                mapTextureOffset[index] = { x, y };
        }
    };

    for (let [offsetType, ...params] of mapoffset) {
        mapoffsetFn?.[offsetType]?.(...params);
    }
    return mapTextureOffset
}

var initmaptexture = function (maptype, onProgress) {


    return new Promise((resolve, reject) => {
        var oReq = new XMLHttpRequest();
        var image_link = "IMG/MAP/" + maptype + "/map.webp";
        oReq.open("GET", image_link, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer)
                window.FILECACHE[image_link] = "data:image/png;base64," + btoa([].reduce.call(new Uint8Array(arrayBuffer), function (p, c) { return p + String.fromCharCode(c) }, ''));

            PIXI.loader.add({ name: "tex", url: "IMG/MAP/" + maptype + "/map.json", crossOrigin: true });
            PIXI.loader.on('progress', function (loader, loadedResource) {
                onProgress?.(loader.progress / 100);
            });

            PIXI.loader.load(function (loader, resources) {
                console.log("Load Map Texture Image Done");
                // This.on_load_done && This.on_load_done();
                resolve(resources);
            });

        };

        oReq.onprogress = function (e) {
            onProgress?.((e.loaded / e.total));
        }

        oReq.send(null)
    })





}

window.FILECACHE ||= {};

/**
 * Create map object, contain texture, terian, material
 * @param {String} mapname 
 */

function GameMap(mapname) {
    this.texture = [];
    this.terian = [];
    this.material = [];
    this.mapscr2pos = [];
    this.dim = 0;
    this.maxx = 0;
    this.maxy = 0;



    this.update = function (force) {

        crop_sprite && (crop_sprite.frame = {
            x: GLOBAL.screen_x * 60,
            y: GLOBAL.screen_y * 30,
            width: GLOBAL.DISPLAY_WIDTH,
            height: GLOBAL.DISPLAY_HEIGHT
        });
    }

    var map_sprite, crop_sprite;
    var This = this;



    var calc_second_map_layer = function (map) {
        var terrian = map.terrian;
        var upper_map = new Array(terrian.length);
        var behind_map = new Array(terrian.length);
        for (var i = 0; i < terrian.length; i++) {
            upper_map[i] = new Array(terrian.length);
            behind_map[i] = new Array(terrian.length);
        }
        var size = terrian.length;
        var i, j, xx, yy, mapt;
        var x, y, z;
        var t = Math.round(size / 2);



        for (y = 0; y < t; y++) {
            for (z = 0; z < 2; z++) {
                for (x = 0; x < t; x++) {
                    i = x + y + z;
                    j = t - x + y;
                    if (terrian[i] && terrian[i][j]) {
                        for (var k = 1; k < 4; k++) {
                            if (terrian[i - k] && terrian[i][j] > terrian[i - k][j - k] + 2 * k) {
                                upper_map[i][j] = true;
                                behind_map[i - k][j - k] = true;
                            }
                        }

                    }
                }
            }
        }
        map.upper_map = upper_map;
        map.behind_map = behind_map;


    }

    var initmapgraphich = async function (resources, main_texture, textture_offset) {
        console.log("initmapgraphich", { This, resources, main_texture, textture_offset })
        var size = This.dim;
        var i, j, xx, yy, mapt;
        var x, y, z;
        var t = Math.round(This.dim / 2);
        var map_renderer = new PIXI.RenderTexture(window.GLOBAL.renderer, Math.floor(t) * 60, Math.floor(t) * 30);

        var map_stage = new PIXI.Container();

        var minimap_stage = new PIXI.Container();

        for (y = -3; y < t + 3; y++) {
            for (z = 0; z < 2; z++) {
                for (x = -3; x < t + 3; x++) {
                    i = x + y + z;
                    j = t - x + y;
                    xx = x * 60 + z * 30;
                    yy = y * 30 + z * 15;
                    mapt = This.texture[i] ? This.texture[i][j] : 0;
                    var texture_key = `img (${mapt}).png`;
                    if (mapt && resources[texture_key]) {
                        let offset = textture_offset[mapt]
                        var postion = {
                            x: xx - (offset?.x ?? 0) - 45,
                            y: yy - (This.terrian[i][j] - 10) * 6 - (offset?.y ?? 0) - 7
                        }
                        var sprite = new PIXI.Sprite(resources[texture_key]);
                        sprite.position.set(postion.x, postion.y);
                        map_stage.addChild(sprite);



                    }
                }
            }
        }

        map_renderer.render(map_stage);

        await new Promise(r => requestAnimationFrame(r));

        console.log("------------------------------------------------")
        crop_sprite = new PIXI.Texture(map_renderer.baseTexture, new PIXI.Rectangle(0, 0, 200, 200));
        map_sprite = new PIXI.Sprite(crop_sprite);


        //map_sprite.filters = [noredfilter];
        mainstage.addChildAt(map_sprite, 0);


        setTimeout(async () => {
            var minimap_sprite = new PIXI.Sprite(map_renderer);

            minimap_stage.addChild(minimap_sprite);

            minimap_sprite.scale.set(242 / Math.floor(t) / 60, 242 / Math.floor(t) / 30);

            var minimap_renderer = new PIXI.RenderTexture(window.GLOBAL.renderer, 242, 242);
            minimap_renderer.render(minimap_stage);

            await new Promise(r => setTimeout(r, 100));

            console.log("------------------------------------------------")

            MINIMAP.initmap(minimap_renderer.getBase64());

            minimap_renderer.destroy(true);

            main_texture.baseTexture.destroy(true);
            console.log("Init map MiniMap done");

        }, 100)

        console.log("Init map Graphich done");



    }


    var loadMapDataAsync = async function (name) {

        let result = await fetch("/Data/map/map.json").then(e => e.json())


        let mapinfo = this.mapinfo = result.info[name];

        console.log({ name, mapinfo })

        let [imgmapterrian, imgmaptexture, list_object_data] = await Promise.all([
            loadImageData("/Data/map/" + mapinfo.terian + random()),
            loadImageData("/Data/map/" + mapinfo.material + random()),
            fetch("/Data/map/" + mapinfo.objectdata + random()).then(e => e.text())
        ])

        this.list_object_data = list_object_data;

        var mapheight = [];
        var mapmaterial = [];
        var mapdata = [];
        var mapgroundtable = [];

        for (var i = 0; i < imgmapterrian.width; i++) {
            mapheight[i] = [];
            mapmaterial[i] = [];
            for (var j = 0; j < imgmapterrian.height; j++) {
                var idx = (i * imgmapterrian.height + j) * 4;
                mapheight[i][j] = imgmapterrian.data[idx];
                mapmaterial[i][j] = ((imgmapterrian.data[idx + 1] < 100) ? 0 : 1) + ((imgmapterrian.data[idx + 2] < 100) ? 0 : 2);
            }
        }


        for (var i = 0; i < imgmaptexture.width; i++) {
            mapdata[i] = [];
            for (var j = 0; j < imgmaptexture.height; j++) {
                var idx = (i * imgmaptexture.height + j) * 4;
                var value = (imgmaptexture.data[idx] + imgmaptexture.data[idx + 1] * 256);
                mapdata[i][j] = value;
                mapgroundtable[value] = true;
            }
        }


        this.terrian = mapheight;
        this.material = mapmaterial;
        this.mapscr2pos = init_mapscr2pos(mapheight);
        this.texture = mapdata;
        this.mapgroundtable = mapgroundtable;

        this.mapTextureOffset = getTextureOffsetMap(result.offset[mapinfo.type])

        calc_second_map_layer(this);


        this.dim = this.texture.length;
        this.maxx = this.texture.length;
        this.maxy = this.texture.length;

        window.GLOBAL.max_x = this.maxx / 2;
        window.GLOBAL.max_y = this.maxy / 2;

        console.log("Load map Object done");

        GRID.init(this);


        const mapTexture = await initmaptexture(mapinfo.type, p => this.on_load_progess?.(p))

        await initmapgraphich(mapTexture.tex.textures, mapTexture.tex_image.texture, this.mapTextureOffset);

        on_texture_load_done("map");

    }

    this.on_load_done = null;
    this.on_load_progess = null;

    this.promise = loadMapDataAsync.call(this, mapname);

}



