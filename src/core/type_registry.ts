// Map files name their type tables by string, e.g.
//
//     Unit 118 60 0 1 VEHICLE_TYPE veh_rhi_soviet
//     Mine 102 176 0 MAP_OBJECT_TYPE goldmine
//
// Done.js used to resolve those with `window[ob[5]][ob[6]]`. Module bindings do not
// live on window, so the six tables reachable from map data are listed explicitly.
//
// Keep in sync with the table names used in Data/map/*.txt.

import { CONSTRUCTION_TYPE } from "../Game_object/Construction/Construction_Unit_Type";
import { MAP_CONSTRUCTION_UNIT_TYPE } from "../Game_object/Construction/Map_Construction_Unit";
import { MAP_OBJECT_TYPE } from "../Game_object/Map_Object/Map_object";
import { PLANE_UNIT_TYPE } from "../Game_object/MoviableUnit/Flyable_Unit";
import { SOLIDER_TYPE } from "../Game_object/MoviableUnit/Solider_Unit/Solider_Unit_Type";
import { VEHICLE_TYPE } from "../Game_object/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type";

export const TYPE_REGISTRY = {
  CONSTRUCTION_TYPE,
  MAP_CONSTRUCTION_UNIT_TYPE,
  MAP_OBJECT_TYPE,
  PLANE_UNIT_TYPE,
  SOLIDER_TYPE,
  VEHICLE_TYPE,
};
