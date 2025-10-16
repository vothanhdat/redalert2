

/** @description This.Object to Constrol Playing layout(HTML)
    //User for CONTROLER Object
*/
PLAYING_LAYOUT = new (function () {


    //TODO METHOD ========================================================
    /**
    * Call this method when buy a unit
    * @param {BuyData} data 
    */
    this.on_buy_unit = function (data) {
        USER_CONTROLER.on_buy(data);
    }

    /**
    * Call this method when buy a unit is cancel
    * @param {BuyData} data
    */
    this.on_buy_unit_cancel = function (data) {
        USER_CONTROLER.on_cancel_buy(data);
    }

    /**
    * Call this method when construction unit ready to build and
    * @param {BuyData} data 
    */
    this.on_building_construction = function (data) {
        USER_CONTROLER.on_building_construction(data);
    }

    /**
    * 
    * @param {BuyData} data 
    */
    this.on_set_addtional_pos = function (data) {
        USER_CONTROLER.on_set_addtional_pos(data);
    }




    //TODO CALLBACK ========================================================


    this._switchdiv_ = function () {
        return this._switchdiv_data_ || (this._switchdiv_data_ = $(".switch div"));
    }

    this._buypanel_ = function () {
        return this._buypanel_data_ || (this._buypanel_data_ = $(".buypanel")[0]);
    }


    /** @description Call when addtional functional complete
    * @param {BuyData} data 
    * @todo 
    */
    this.on_addtional_done = function (data) {
        this.get_buy_button(data);
        data.wait_for_setpos = true;
        data.canvas.className = "buttonsplash";
        var type = map_type_number[map_type_number.map[data.type][data.name].type];
        var button = this._switchdiv_()[type];
        if (type != this.now_type)
            button.className = "button buttonsplash";
    };


    this.on_addtional_set_pos_done = function (data) {
        data.wait_for_setpos = false;
        data.canvas.className = "";
    }


    /** @description Call when buy construction complete
    * @param {BuyData} data 
    * @todo 
    */
    this.on_buy_construction_done = function (data) {
        //return;
        data.wait_for_building = true;
        data.canvas.className = "buttonsplash";
        var type = map_type_number[map_type_number.map[data.type][data.name].type];
        var button = this._switchdiv_()[type];
        if (type != this.now_type)
            button.className = "button buttonsplash";
    }

    /**
    * Call this method when construction unit build done
    * @param {BuyData} data
    */
    this.on_building_construction_done = function (data) {
        data.wait_for_building = false;
        data.canvas.className = "";
    }


    /** @description Update buy panel when add or remove a construction unit;
    * @param {Array.<BuyData>} data 
    */
    this.update_display_unit = function (data) {
        this.buy_data = data;
        var element = this._buypanel_();
        element.innerHTML = "";
        for (var e of data) if (this.fillter_type_display(e))
            element.appendChild(this.get_buy_button(e));
    }




    // ========================================================================= 

    this.fillter_type_display = function (data) {
        try {
            return map_type_number[map_type_number.map[data.type][data.name].type] == this.now_type;
        } catch (e) {
            debugger;
        }
    }


    /** @description Change tab type;
    * @param {Number} type = 0,1,2,3,4 
    */
    this.set_type_display = function (type) {
        this._switchdiv_()[this.now_type].className = "button";
        this.now_type = type;
        this._switchdiv_()[this.now_type].className = "button buttonon";
        var element = this._buypanel_();
        element.innerHTML = "";
        for (var e of this.buy_data) if (this.fillter_type_display(e)) {
            element.appendChild(this.get_buy_button(e));
            //console.log(e);
        }
    }


    /** 
    * Update about 60 times / seconds
    */
    this.process = function () {
        // Update progess in buy panel
        for (var e of this.buy_data)
            if (this.fillter_type_display(e))
                e.setprogess();

        // Update gold resource
        if (!resoure_goal_element)
            resoure_goal_element = $(".resource#goal")[0];
        if (!power_div)
            power_div = $(".powerpanel")[0];

        if (resoure_goal_element)
            resoure_goal_element.innerHTML = "$" + Math.round(USER_CONTROLER.team_controler.money);

        var total_power = Math.atan(USER_CONTROLER.team_controler.total_power / 2500) / Math.PI * 2;
        var power_usage = Math.atan(USER_CONTROLER.team_controler.power_usage / 2500) / Math.PI * 2;

        power_value[0] += (total_power - power_value[0]) * 0.07;
        power_value[1] += (power_usage - power_value[1]) * 0.07;
        if (power_div) {
            power_div.children[0].style.height = (power_value[0] * 100) + "%";
            power_div.children[1].style.height = (power_value[1] * 100) + "%";
        }
    }

    var resoure_goal_element;
    var power_div;
    var power_value = [0, 0];


    var func_get = function (key, ...listob) {
        return func_get[key] || (func_get[key] = Object.assign({}, ...listob));
    }


    var map_type_number = {
        contruction: 0,
        contruction_denfense: 1,
        solider: 2,
        vehicle: 3,
        plane: 3,
        ship: 3,
        defender: 2,
        technology: 4,
        additional: 1,
        map: {
            get construction() { return func_get("construction", CONSTRUCTION_TYPE) },
            get contruction_denfense() { return func_get("contruction_denfense", CONSTRUCTION_TYPE) },
            get solider() { return func_get("solider", SOLIDER_TYPE) },
            get vehicle() { return func_get("vehicle", VEHICLE_TYPE) },
            get additional() { return func_get("additional", ADDITIONAL_TYPE) },
            get plane() { return func_get("plane", PLANE_UNIT_TYPE) }
        }
    };

    var img_buy_progess = (function () {
        var img = [];
        for (var i = 0; i < 55; i++)
            (img[i] = new Image()).src = "IMG/effect/buy/img (" + (i + 1) + ").png";;
        return img;
    })();

    var img_buy_ready = (function () {
        var img = new Image();
        img.src = "IMG/effect/buy/Ready.png"
        return img;
    })();

    this.get_buy_button = function (data) {
        if (!data.div) {
            var canvas = document.createElement("canvas");
            var context2d = canvas.getContext("2d");
            var div = document.createElement('div');

            div.className = "item";
            div.title = data.progess + "$";
            div.appendChild(canvas);
            div.style.backgroundImage = "url('" + "IMG/icon/images/" + data.name + ".png" + "')";
            div.onmousedown = function (e) {
                switch (e.which) {
                    case 1:
                        !data.wait_for_building && PLAYING_LAYOUT.on_buy_unit(data);
                        break;
                    case 3:
                        PLAYING_LAYOUT.on_buy_unit_cancel(data);
                        break;
                }
            }
            div.onclick = function (e) {
                switch (e.which) {
                    case 1:
                        data.wait_for_building && PLAYING_LAYOUT.on_building_construction(data);
                        data.wait_for_setpos && PLAYING_LAYOUT.on_set_addtional_pos(data);
                        break;
                }
            }
            data.setprogess = function () {
                if (!PLAYING_LAYOUT.fillter_type_display(data))
                    return;
                var tmp = this.progess_load / this.progess;
                var progess = Math.floor(54.9 * (Math.ceil(tmp) - tmp));
                var str_compare = (data.wait_for_building || data.wait_for_setpos) + "_" + (this.progess_load > 0) + "_" + progess + "_" + Math.floor(this.progess_load / this.progess);
                if (str_compare != data.back) {
                    data.back = str_compare;
                    canvas.width = 60; canvas.height = 48;
                    if (data.wait_for_building || data.wait_for_setpos) {
                        context2d.drawImage(img_buy_ready, 0, 0);
                    } else if (this.progess_load > 0) {
                        context2d.drawImage(img_buy_progess[progess], 0, 0);
                        if (this.progess_load > this.progess) {
                            context2d.fillStyle = "#ffff00";
                            context2d.font = "bold 15px Arial";
                            context2d.textAlign = "right";
                            context2d.fillText("" + Math.floor(this.progess_load / this.progess) + "", 58, 15);
                        }
                    }
                }

            }
            data.div = div;
            data.canvas = canvas;
        }
        return data.div;
    }

    this.buy_data = [];

    this.now_type = 0;

})();