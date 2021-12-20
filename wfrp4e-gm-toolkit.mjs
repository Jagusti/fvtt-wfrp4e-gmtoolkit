/**
 * A utility module for Warhammer Fantasy Roleplay 4e Game Masters.+
 * Author: Jagusti
 * Repository: https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/
 * Issue Tracker: https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues
 */

// Import Modules
import GMToolkit from "./modules/gm-toolkit.mjs";
import GMToolkitSettings from "./modules/gm-toolkit-settings.mjs";
import Advantage from "./modules/advantage.mjs";
import DarkWhispers from "./modules/dark-whispers.mjs";
import TokenHudExtension from "./modules/token-hud-extension.mjs";

// Import Helpers
import * as GMToolkitUtility from "./modules/utility.mjs";


/* -------------------------------------------- */
/*  Foundry VTT Initialisation                  */
/* -------------------------------------------- */

/** 
 * Carry out initialisation routines
 */
Hooks.once("init", function () {
    GMToolkit.log(false ,`Initialising ${GMToolkit.MODULE_NAME}.`);

    // Create namespace within game global
    game.gmtoolkit = {
        advantage : Advantage,
        utility: GMToolkitUtility
    }
    // TODO: update advantage macros to use namespaced functions
    // game.gmtoolkit.advantage.updateAdvantage(token,`increase`);
    
    // Register module settings
    GMToolkitSettings.register();
});


/* -------------------------------------------- */
/*  Foundry VTT Ready                           */
/* -------------------------------------------- */

Hooks.once("ready", function () {
    GMToolkit.log(false ,`${GMToolkit.MODULE_NAME} is ready.`);
});


/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

/**
 * Register module debug flag with Developer Mode custom hook
 */
 Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(GMToolkit.MODULE_ID);
  });
