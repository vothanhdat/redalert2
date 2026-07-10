import { LATE } from "./core/late";

/// <reference path="../Scripts/soundjs-0.6.1.min.js" />

var origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
    //console.log(arguments);
    return origOpen.apply(this, arguments);
};


var AUDIO = new (function () {
    const AUDIO_SIGHT = 400;

    this.loaded_sound = {};

    this.list_instance = [];

    this.sound_key_length = {};

    this.load_sound = function () {
        var all_object = {};
        var all_sound = [];
        Object.assign(
            all_object,
            LATE.CONSTRUCTION_TYPE,
            LATE.VEHICLE_UNIT,
            LATE.SOLIDER_TYPE,
            LATE.MAP_CONSTRUCTION_UNIT_TYPE,
            LATE.ATTACK_TYPE,
            LATE.MAP_OBJECT_TYPE,
            LATE.EFFECT_TYPE,
            { USER_CONTROLER: LATE.USER_CONTROLER }
        );
        for (var i in all_object) {
            if (all_object[i].sound)
                all_sound.push(all_object[i].sound);
            else for (var j in all_object[i].audio) {
                all_sound.push(all_object[i].audio[j]);
            }
        }
        all_object = null;
        all_sound = LATE.sort_unique(all_sound);
        console.log(all_sound);

        for(var e of all_sound) if (e) {
            createjs.Sound.registerSound(e, e);
            this.sound_key_length[e] = 0;
        }

        createjs.Sound.on("fileload", function (e) {
            console.log(e.id);
            this.loaded_sound[e.id] = true;
        },this);
    }

    this.on_start_sound = function (sound) {
        this.list_instance.push(sound);
        this.sound_key_length[sound.ob_key]++;
    }

    this.on_stop_sound = function (sound) {
        this.sound_key_length[sound.ob_key]--;
        sound.destroy();
        return true;
    }


    this.createsound = function (key, ob, volume, max) {
        if (!this.loaded_sound[key] || this.sound_key_length[key] > (max || 10))
            return;
        this.calc_audio(ob);
        if (!__sound__mute__) {
            var s = createjs.Sound.play(key);
            s.ob_volume = volume || 0.5;
            s.ob_pos = ob;
            s.ob_key = key;
            this.on_start_sound(s);
            this.process_sound_instance(s);
            return s;
        }

    }

    this.create_controlsound = function (key, ob, volume) {
        var s = this.createsound(key, ob, volume, 0.1);
        return s;
    }

    var __sound__volume__ = 0,
        __sound__pan__ = 0,
        __sound__mute__ = false;

    this.calc_audio = function (pos_ob) {
        if (pos_ob) {
            var pos = LATE.convert2screen(pos_ob.x, pos_ob.y, pos_ob.z);
            var dx = pos.x - innerWidth / 2;
            var dy = pos.y - innerHeight / 2;
            var d = Math.sqrt(dx * dx + dy * dy);
            __sound__volume__ = Math.min(1, Math.max(0, (2 * AUDIO_SIGHT - d) / AUDIO_SIGHT));
            __sound__pan__ = Math.min(1, Math.max(-1, 2 * dx / innerWidth));
            __sound__mute__ = __sound__volume__ < 0.005;
        } else {
            __sound__volume__ = 1;
            __sound__pan__ = 0;
            __sound__mute__ = false;
        }
    }

    this.process_sound_instance = function (sound) {
        this.calc_audio(sound.ob_pos);
        if (__sound__mute__) {
            sound.muted || (sound.muted = true);
        } else {
            sound.volume = Math.max(0, Math.min(1, __sound__volume__ * sound.ob_volume || 0));
            sound.pan = Math.max(0, Math.min(1, __sound__pan__ || 0));
            sound.muted && (sound.muted = false);
        }

    }

    this.process = function () {
        this.list_instance = this.list_instance.filter(e => !((e.playState == "playFinished" || e.playState == "playFailed") && this.on_stop_sound(e)));
        this.list_instance.forEach(e => this.process_sound_instance(e));
    }


    this.music = new (function () {

        this.music = null;
        this.music = new Audio();
        this.music.volume = 0.7;

        this.play_menu_music = function () {
            this.music.src = "Audio/Music/Indeep.mp3";
            this.music.loop = true;
            this.music.play();
        }

        this.game_music_list = [
            "Audio/Music/Blowitup.mp3",
            "Audio/Music/Destroy.mp3",
            "Audio/Music/Grinder.mp3",
            "Audio/Music/HellMarch2.mp3"
        ];


        this.play_game_music = function () {
            this.music.src = this.game_music_list[Math.floor(Math.random() * 4)];
            this.music.loop = false;
            this.music.list_src = this.game_music_list;
            this.music.onended = function () {
                this.src = this.list_src[Math.floor(Math.random() * 4)];
                this.play();
            }
            this.music.play();
        }

        this.play_overview_music = function () {

        }

        this.stop = function () {

        }
    })

})();






export { AUDIO, origOpen };
