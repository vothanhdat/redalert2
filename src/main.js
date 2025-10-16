import "./legacy-shims/game-core-shim.js";
import { loadLegacyScriptsSequential } from "./legacy-shims/load-legacy-scripts.js";
import { bootstrapLegacy } from "./legacy-shims/bootstrap.js";

const LEGACY_SCRIPTS = [
  "JS/LOADER_PROGESS.js",
  "JS/Audio.js",
  "JS/Map.js",
  "JS/Controler.js",
  "JS/Image_process.js",
  "JS/Game_object/Game_Unit.js",
  "JS/Game_object/Construction/Construction_Unit.js",
  "JS/Game_object/Construction/Construction_Unit_Type.js",
  "JS/Game_object/MoviableUnit/MoviableUnit.js",
  "JS/Game_object/MoviableUnit/Solider_Unit/Solider_Unit.js",
  "JS/Game_object/MoviableUnit/Solider_Unit/Solider_Unit_Type.js",
  "JS/Game_object/MoviableUnit/Vihicle_Unit/Vihicle_Unit.js",
  "JS/Game_object/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type.js",
  "JS/Game_object/MoviableUnit/Flyable_Unit.js",
  "JS/Game_object/Weapon/Weapon.js",
  "JS/Game_object/Weapon/Weapon_Type.js",
  "JS/Game_object/Map_Object/Map_object.js",
  "JS/Game_object/Construction/Map_Construction_Unit.js",
  "JS/Game_object/Effect/Effect.js",
  "JS/AI_worker_comunication.js",
  "JS/UI/Playing_layout.js",
  "JS/UI/Minimap.js",
  "JS/Done.js"
];

const legacyLoadPromise = globalThis.__legacyScriptsPromise || (globalThis.__legacyScriptsPromise = loadLegacyScriptsSequential(LEGACY_SCRIPTS));

legacyLoadPromise
  .then(() => {
    bootstrapLegacy();
  })
  .catch((error) => {
    console.error("Failed to load legacy scripts", error);
  });

if (import.meta.hot) {
  import.meta.hot.accept();
}
