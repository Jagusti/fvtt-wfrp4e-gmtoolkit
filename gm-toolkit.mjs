// Import Modules
import GMToolkit from './modules/classes/gm-toolkit.mjs'
import GMToolkitSettings from './modules/classes/gm-toolkit-settings.mjs'
import TokenHudExtension from './modules/classes/token-hud-extension.mjs'
import DarkWhispers from './modules/classes/dark-whispers.mjs'
import Advantage from './modules/classes/advantage.mjs'

/**
 * Register our module's debug flag with developer mode's custom hook
 */
 Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(GMToolkit.MODULE_ID);
  });

// Carry out initialisation routines
Hooks.once("init", function () {
    console.log(`${GMToolkit.MODULE_ID} | Initialising ${GMToolkit.MODULE_NAME}.`);
    GMToolkitSettings.register();
    game.gmtoolkit = {
        advantage : Advantage
    }
    // TODO: update advantage macros 
    // game.gmtoolkit.advantage.updateAdvantage(token,`increase`);
});


Hooks.once("ready", function () {
    GMToolkit.log(false ,`Ready.`);
    });

// ---- Set up Hooks ----
// Activate Dark Whisper chat listeners
Hooks.on('renderChatLog', (log, html, data) => {
    DarkWhispers.chatListeners(html)  
});


// Disable movement on landing page scene
// TODO: Add world setting for landing page scene
/* Hooks.on("preUpdateToken", (token, change) => {
	// console.log(token.data.x, token.data.y)
	// console.log(change?.x, change?.y)
	if (!(game.user.isGM) && game.canvas.scene.name == "Scene") { //TODO: replace Scene name with configured landing page scene ID
		if (change?.x) {change.x = token.data.x}
		if (change?.y) {change.y = token.data.y}
	}
  }); */

