// Import Modules
import GMToolkit from "./modules/gm-toolkit.mjs";
import GMToolkitSettings from "./modules/gm-toolkit-settings.mjs";
import TokenHudExtension from "./modules/token-hud-extension.mjs";
import DarkWhispers from "./modules/dark-whispers.mjs";
import Advantage from "./modules/advantage.mjs";

/**
 * Register module debug flag with Developer Mode custom hook
 */
 Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(GMToolkit.MODULE_ID);
  });

/** 
 * Carry out initialisation routines
 */
Hooks.once("init", function () {
    GMToolkit.log(false ,`Initialising ${GMToolkit.MODULE_NAME}.`);
    GMToolkitSettings.register();
    game.gmtoolkit = {
        advantage : Advantage
    }
    // TODO: update advantage macros 
    // game.gmtoolkit.advantage.updateAdvantage(token,`increase`);
});

/** 
 * Signal end of initialisation routines
 */
Hooks.once("ready", function () {
    GMToolkit.log(false ,`${GMToolkit.MODULE_NAME} is ready.`);
    });



