// Main entry point for the Red Alert 2 game
import * as PIXI from 'pixi.js';
import $ from 'jquery';
// @ts-ignore - SoundJS doesn't have proper type definitions
import * as createjs from 'soundjs';

// Make libraries globally available for legacy code
(window as any).PIXI = PIXI;
(window as any).$ = $;
(window as any).jQuery = $;
(window as any).createjs = createjs;

// Import helper scripts
import './lib/JavaScript_helper.js';
import './lib/priorityqueue.js';

// Import game modules in order
import './JS/LOADER_PROGESS.js';
import './JS/Audio.js';
import './JS/Map.js';
import './JS/Controler.js';
import './JS/Image_process.js';
import './JS/Game_object/GRID.js';
import './JS/Game_object/Game_object.js';
import './JS/Game_object/Game_Unit.js';
import './JS/Game_object/Construction/Construction_Unit.js';
import './JS/Game_object/Construction/Construction_Unit_Type.js';
import './JS/Game_object/MoviableUnit/MoviableUnit.js';
import './JS/Game_object/MoviableUnit/Solider_Unit/Solider_Unit.js';
import './JS/Game_object/MoviableUnit/Solider_Unit/Solider_Unit_Type.js';
import './JS/Game_object/MoviableUnit/Vihicle_Unit/Vihicle_Unit.js';
import './JS/Game_object/MoviableUnit/Vihicle_Unit/Vehicle_Unit_Type.js';
import './JS/Game_object/MoviableUnit/Flyable_Unit.js';
import './JS/Game_object/Weapon/Weapon.js';
import './JS/Game_object/Weapon/Weapon_Type.js';
import './JS/Game_object/Map_Object/Map_object.js';
import './JS/Game_object/Construction/Map_Construction_Unit.js';
import './JS/Game_object/Effect/Effect.js';
import './JS/AI_worker_comunication.js';
import './JS/UI/Playing_layout.js';
import './JS/UI/Minimap.js';
import './JS/Done.js';
import './JS/Game_Container.js';

// Import game initialization
import {
  initGlobals,
  setupEventHandlers,
  setupAnimationLoop,
  initGameStages,
  createGameManager
} from './game-init';

// Initialize the game after DOM is ready
console.log('Red Alert 2 - Game initializing with Vite + TypeScript...');

// Initialize game
initGlobals();
setupEventHandlers();
setupAnimationLoop();
createGameManager();
initGameStages();
