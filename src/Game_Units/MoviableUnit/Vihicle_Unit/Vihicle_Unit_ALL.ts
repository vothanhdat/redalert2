
// import PIXI from "pixi.js";
import { TEAM } from "../../../CONTROLLER";
import { on_texture_load_done } from "../../../Done";
import { IMAGE_PROCESS } from "../../../Image_process";
import { VEHICLE_TYPE } from "./Vehicle_Unit_Type";

PIXI.loader.add({ name: "veh", url: "IMG/Unit/Vehicle/vehicle.json" });

export const VEHICLE_UNIT = {
    image_type: ["normal", "direct", "normal2"],

    init_plus: function (property, listresource) {
        for (var i in property.img) {
            if (VEHICLE_UNIT.image_type.indexOf(i) > -1) {
                IMAGE_PROCESS.process_gl(property.img[i], property.img.main_path, property.img.margin, listresource);
            }
        };
    },

    load_texture_done: function (loader, resources) {
        var listresource = [];
        listresource[0] = resources.veh.textures;
        console.log(resources);
        IMAGE_PROCESS.processcolor_gl(
            resources.veh_image.texture,
            TEAM,
            VEHICLE_UNIT.process_color_gl_done,
            listresource
        );
    },

    process_color_gl_done: function (textures, listresource) {
        var baseresource = listresource[0];
        for (var i = 1; i < textures.length; i++) {
            var processresource = {};
            var baseTexture = textures[i].baseTexture;
            for (var j in baseresource) {
                processresource[j] = new PIXI.Texture(baseTexture, baseresource[j].frame, baseresource[j].crop, baseresource[j].trim);
            }
            listresource[i] = processresource;
        }

        for (var i in VEHICLE_TYPE)
            VEHICLE_UNIT.init_plus(VEHICLE_TYPE[i], listresource);
        console.log(listresource);
        on_texture_load_done("vehicle");
        // VEHICLE_UNIT = null;
    },

}

