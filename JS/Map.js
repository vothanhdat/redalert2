

/*
Map material  :
0 : Ground;
1 : Rock : can't move here;
2 : Water
3 : Rock Water: can't move here;
*/


/**
 * Create map object, contain texture, terian, material
 * @param {String} mapname 
 */

// const MAP_TEST_DEEP = false;


// const MAP_TEST_DEEP2 = false;

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
        // crop_sprite_second && (crop_sprite_second.frame = {
        //     x: GLOBAL.screen_x * 60,
        //     y: GLOBAL.screen_y * 30,
        //     width: GLOBAL.DISPLAY_WIDTH,
        //     height: GLOBAL.DISPLAY_HEIGHT
        // });


    }



    var maptexturetableoffsetx = [];
    var maptexturetableoffsety = [];


    var map_sprite, crop_sprite;
    // var map_sprite_second, crop_sprite_second;
    var This = this;


    var setoffset = function (mapoffset) {

        var mapoffsetfunction = {
            setoffsetarrayY: function (y, from, to) {
                for (var i = from; i <= to; i++)
                    maptexturetableoffsety[i] = y;
            },
            setoffsetY: function (y, array) {
                for (var i in array)
                    maptexturetableoffsety[array[i]] = y;
            },
            setoffsetXandY: function (x, y, array) {
                for (var i in array) {
                    maptexturetableoffsetx[array[i]] = x;
                    maptexturetableoffsety[array[i]] = y;
                }
            }
        };

        console.log(mapoffset.length);

        for (var i in mapoffset) {
            var arg = mapoffset[i];
            if (mapoffsetfunction[arg[0]]) {
                mapoffsetfunction[arg[0]](arg[1], arg[2], arg[3]);
            };
        }
    }

    var initmaptexture = function (maptable, maptype, ondone) {

        window.FILECACHE = [];

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
                This.on_load_progess && This.on_load_progess(loader.progress / 100);
            });
            PIXI.loader.load(function (loader, resources) {
                console.log("Load Map Texture Image Done");
                This.on_load_done && This.on_load_done();
                ondone && ondone(loader, resources.tex.textures, resources.tex_image.texture);
            });

        };

        oReq.onprogress = function (e) {
            This.on_load_progess && This.on_load_progess((e.loaded / e.total));
        }

        oReq.send(null)







    }

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

    var initmapgraphich = function (map, loader, resources, main_texture) {
        console.log("initmapgraphich", { map, loader, resources, main_texture })

        var size = map.dim;
        var i, j, xx, yy, mapt;
        var x, y, z;
        var t = Math.round(map.dim / 2);
        var map_renderer = new PIXI.RenderTexture(window.GLOBAL.renderer, Math.floor(t) * 60, Math.floor(t) * 30);

        var minimap_renderer = new PIXI.RenderTexture(window.GLOBAL.renderer, 242, 242);
        var map_stage = new PIXI.Container();

        var minimap_stage = new PIXI.Container();

        for (y = -3; y < t + 3; y++) {
            for (z = 0; z < 2; z++) {
                for (x = -3; x < t + 3; x++) {
                    i = x + y + z;
                    j = t - x + y;
                    xx = x * 60 + z * 30;
                    yy = y * 30 + z * 15;
                    mapt = map.texture[i] ? map.texture[i][j] : 0;
                    var texture_key = `img (${mapt}).png`;
                    if (mapt && resources[texture_key]) {
                        var postion = {
                            x: xx - (maptexturetableoffsetx[mapt] ? maptexturetableoffsetx[mapt] : 0) - 45,
                            y: yy - (map.terrian[i][j] - 10) * 6 - (maptexturetableoffsety[mapt] ? maptexturetableoffsety[mapt] : 0) - 7
                        }
                        var sprite = new PIXI.Sprite(resources[texture_key]);
                        sprite.position.set(postion.x, postion.y);
                        map_stage.addChild(sprite);



                    }
                }
            }
        }

        map_renderer.render(map_stage);

        window.setTimeout(function () {

            crop_sprite = new PIXI.Texture(map_renderer.baseTexture, new PIXI.Rectangle(0, 0, 200, 200));
            map_sprite = new PIXI.Sprite(crop_sprite);


            //map_sprite.filters = [noredfilter];
            mainstage.addChildAt(map_sprite, 0);




            // Render minimap
            var minimap_sprite = new PIXI.Sprite(map_renderer);
            minimap_stage.addChild(minimap_sprite);
            minimap_sprite.scale.set(242 / Math.floor(t) / 60, 242 / Math.floor(t) / 30);
            minimap_renderer.render(minimap_stage);
            window.setTimeout(function () {
                MINIMAP.initmap(minimap_renderer.getBase64());
                minimap_renderer.destroy(true);
                main_texture.baseTexture.destroy(true);
            }, 100);


        }, 100);

        console.log("Init map Graphich done");
        on_texture_load_done("map");

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

        setoffset(result.offset[mapinfo.type]);


        calc_second_map_layer(this);

        initmaptexture(this.mapgroundtable, mapinfo.type, (loader, resources, maintexture) => {
            initmapgraphich(this, loader, resources, maintexture);
        });

        this.dim = this.texture.length;
        this.maxx = this.texture.length;
        this.maxy = this.texture.length;

        window.GLOBAL.max_x = this.maxx / 2;
        window.GLOBAL.max_y = this.maxy / 2;

        console.log("Load map Object done");

        GRID.init(this);



    }

    loadMapDataAsync.call(this, mapname);

    this.on_load_done = null;
    this.on_load_progess = null;

}



