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


// ---- Set up Hooks ----
// Activate Dark Whisper chat listeners
Hooks.on("renderChatLog", (log, html, data) => {
    DarkWhispers.chatListeners(html)  
});


// Disable movement on landing page scene
// TODO: Add world setting for landing page scene
/* Hooks.on("preUpdateToken", (token, change) => {
	GMToolkit.log(false, `${token.data.x} -> ${change?.x}, ${token.data.y} -> ${change?.y}`)
	if (!(game.user.isGM) && game.canvas.scene.name == "Scene") { //TODO: replace Scene name with configured landing page scene ID
		if (change?.x) {change.x = token.data.x}
		if (change?.y) {change.y = token.data.y}
	}
  }); */

