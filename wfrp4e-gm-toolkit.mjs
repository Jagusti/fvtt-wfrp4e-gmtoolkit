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
        utility : GMToolkitUtility, 
        module : GMToolkit
    }
    
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

// Disable movement on holding scene
Hooks.on("preUpdateToken", (token, change) => {
	GMToolkit.log(false, `${token.data.x} -> ${change?.x}, ${token.data.y} -> ${change?.y}`)
	if (!(game.user.isGM) && game.canvas.scene.name == game.settings.get("wfrp4e-gm-toolkit", "holdingScene")) { 
		if (change?.x) {change.x = token.data.x}
		if (change?.y) {change.y = token.data.y}
	}
  }); 