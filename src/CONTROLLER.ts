
import {Team_Controler, User_Controler, Ai_Controlder} from "./ControllerClass"

export const CONTROLER = new (function () {
    this.list_control = [];
    this.update = function (time) {
        this.list_control.forEach(e => e.update(time));
    }
    this.add = function (ob) {
        this.list_control.push(ob);
    }
})();

export const CONTROLER1 = new Team_Controler(0);

export const CONTROLER2 = new Team_Controler(1);


export const USER_CONTROLER = new User_Controler(CONTROLER1);

// export const AI_CONTROLER1 = undefined;
export const AI_CONTROLER2 = new Ai_Controlder(CONTROLER2);

CONTROLER.add(USER_CONTROLER)
CONTROLER.add(AI_CONTROLER2)

export const TEAM = [
    {
        color: [255, 0, 0],
        team: CONTROLER1,
        _id_: 0,
        get ID() { return this._id_++ }
    },
    {
        color: [0, 255, 0],
        team: CONTROLER2,
        _id_: 1000000,
        get ID() { return this._id_++ }
    },
];

TEAM[-1] = {
    color: [255, 255, 255],
    _id_: 2000000,
    get ID() { return this._id_++ }
}

window.TEAM = TEAM






