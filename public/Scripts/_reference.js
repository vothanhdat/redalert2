/// <autosync enabled="true" />

/**
 @typedef Ceil
 @type {Object}
 @property {Number} x The axis X
 @property {Number} y The axis Y
 @property {Number} l The far to goal
 @property {Number} l The far to goal
 */


/**
 @typedef CheckCeil
 @type {Object}
 @property {Number} x The axis X
 @property {Number} y The axis Y
 @property {Boolean} canbuild The ceil condition.
 */

/**
 @typedef CheckArea
 @type {Object}
 @property {Array.<Array.<CheckCeil>>} grid The Grid condition.
 @property {Boolean} canbuild The condition Building.
 */


/**
 @typedef Gameunit_Property_Info
 @type {Object}
 @property {Object} shield The Game Object name type.
 @property {Number} life The Game Object name type.
 @property {Number} cost The Game Object name type.
 @property {Number} speed The Game Object name type.
 @property {String} attack_type The Game Object name type.
 @property {Number} attack_time The Game Object name type.
 @property {Number} attack_dam The Game Object name type.
 @property {Number} range The Game Object name type.
 @property {Number} power The Game Object name type.
 @property {Number} sight The Game Object name type.
 @property {Size} size The Game Object name type.
 */


/**
 @typedef Gameunit_Property
 @type {Object}
 @property {String} name The Game Object name type.
 @property {String} type The Game Object Type.
 @property {Object} audio The Audio infomation.
 @property {Gameunit_Property_Info} property The Gameobject's Property infomation.
 @property {Function} class The Custom class for Gameobject.
 @property {Object} functional The functional ob Gameobject.
 @property {Array.<String>} require  The Requirement when buy Unit.
 @property {Boolean} can_change The visible of change Game Unit. 
 */


/**
 @typedef Construction_Property
 @type {Object}
 @property {Construction_Img_Property} img The Image infomation.
 @property {String} name The Game Object name type.
 @property {String} type The Game Object Type.
 @property {Object} audio The Audio infomation.
 @property {Gameunit_Property_Info} property The Gameobject's Property infomation.
 @property {Function} class The Custom class for Gameobject.
 @property {Object} functional The functional ob Gameobject.
 @property {Array.<String>} require  The Requirement when buy Unit.
 @property {Boolean} can_change The visible of change Game Unit. 
 */


/**
 @typedef Construction_Img_Property
 @type {Object}
 @property {String} main_path
 @property {Img_Info} build 
 @property {Img_Info} run 
 @property {Img_Info} active 
 @property {Img_Info} normal 
 @property {Img_Info} impaired 
 @property {Array.<Array.<Number|String>>} impaired_fire The fire position when construction is damaged;
 @property {Margin} margin  The Requirement when buy Unit.
 */



/**
 @typedef Vehicle_Property
 @type {Object}
 @property {Vehicle_Img_Property} img The Image infomation.
 @property {String} name The Game Object name type.
 @property {String} type The Game Object Type.
 @property {Object} audio The Audio infomation.
 @property {Gameunit_Property_Info} property The Gameobject's Property infomation.
 @property {Function} class The Custom class for Gameobject.
 @property {Object} functional The functional ob Gameobject.
 @property {Array.<String>} require  The Requirement when buy Unit.
 @property {Boolean} can_change The visible of change Game Unit. 
 */


/**
 @typedef Vehicle_Img_Property
 @type {Object}
 @property {String} main_path
 @property {Img_Info} normal 
 @property {Img_Info} direct
 @property {Margin} margin  The Requirement when buy Unit.
 */




/**
 @typedef Solider_Property
 @type {Object}
 @property {Solider_Img_Property} img The Image infomation.
 @property {String} name The Game Object name type.
 @property {String} type The Game Object Type.
 @property {Object} audio The Audio infomation.
 @property {Gameunit_Property_Info} property The Gameobject's Property infomation.
 @property {Function} class The Custom class for Gameobject.
 @property {Object} functional The functional ob Gameobject.
 @property {Array.<String>} require  The Requirement when buy Unit.
 @property {Boolean} can_change The visible of change Game Unit. 
 */

/**
 @typedef Solider_Img_Property
 @type {Object}
 @property {String} main_path
 @property {Img_Info} normal 
 @property {Img_Info} attack
 @property {Img_Info} move 
 @property {Img_Info} wait
 @property {Margin} margin  The Requirement when buy Unit.
 */




/**
 @typedef Img_Info
 @type {Object}
 @property {String} path The Game Object name type.
 @property {Number} [from] The Game Object Type.
 @property {Number} [to] The Image infomation.
 @property {Number} [step] The step for each anmation
 @property {Sprite} sprite The step for each anmation
 @property {<Array.<Sprite>>} sprites The step for each anmation
 */


/**
 @typedef Size
 @type {Object}
 @property {Number} w The Width of Game_unit.
 @property {Number} h The Breadth of Game_unit.
 @property {Number} h_ The Height of Game_unit.
 */

/**
 @typedef Margin
 @type {Object}
 @property {Number} x The Margin X.
 @property {Number} y The Margin Y.
 */






/**
 @typedef Point
 @type {Object}
 @property {Number} x The axis X
 @property {Number} y The axis Y
*/

/**
 @typedef Grouph
 @type {Object}
 @property {Point} goal The Goal Point
 @property {Array.<Game_unit>} list The list in grouph
*/



/**
 @typedef Command
 @type {Object}
 @property {String} com The command type
 @property {Point} goal The Goal Point
 @property {Game_unit} enemy The command type
 @property {Grouph} group The grouph
*/



/**
 @typedef BuyData
 @type {Object}
 @property {String} name The name of unit.
 @property {String} type The type of unit.
 @property {Number} remain The number item in queue.
 @property {Number} progess The progess.
 @property {Boolean} wait_for_building 
 @property {Element} div 
*/



/**
 @typedef WEAPON
 @type {Object}
 @property {Game_unit} parrent 
 @property {Game_unit} distination .
 @property {Weapon_Property} property 
 @property {Number} team 
 @property {Number} attack 
 @property {Number} maxtimeline
 @property {Point} damage_point 
*/


/**
 @typedef Weapon_Property
 @type {Object}
 @property {String} name The Game Wwapon name type.
 @property {String} type The Game Wwapon Type.
 @property {String} atteff The Effect type 
 @property {String} die_effect_solider The Effect type when solider die by this Weapon
 @property {String} sound The Audio infomation.
 @property {Weapon_Property_Info} property The Gameobject's Property infomation.
 */

/**
 @typedef Weapon_Property_Info
 @type {Object}
 @property {Object} attack The Image infomation.
 @property {String} speed The Game Object name type.
 @property {String} timeline The Game Object Type.
 */

