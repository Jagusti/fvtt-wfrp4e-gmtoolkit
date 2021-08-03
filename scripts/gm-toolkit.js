// Activate chat listeners defined in gm-toolkit.js
Hooks.on('renderChatLog', (log, html, data) => {
    WFRP4eGMToolkit.chatListeners(html)  
});

class WFRP4eGMToolkit {

/* Listeners
/ --------
*/
static async chatListeners(html) {

	// Click on buttons related to the Dark Whispers macro
	html.on("click", '.darkwhisper-button', event => {
		event.preventDefault();	
		if (!game.user.isGM) {
			let actor = game.user.character;
			if ( actor ) {  // assigned player character
				let response = "";
				// data-button tells us what button was clicked
				switch ($(event.currentTarget).attr("data-button")) {
					case "actOnWhisper":
						response = `${game.i18n.format('GMTOOLKIT.Message.DarkWhispers.Accepted', {currentUser: actor.name})}`;
						// Adjusting Corruption is left as a manual intervention. 
						// Automating could leverage the Token Hud Extension function.
						// adjustStatus (actor, "Corruption", Number(-1));
					break;
					case "denyDarkGods" :
						response = `${game.i18n.format('GMTOOLKIT.Message.DarkWhispers.Rejected', {currentUser: actor.name})}`
					break;
				};

				// Add the ask from the original message
				response += `<blockquote>${$(event.currentTarget).attr("data-ask")}</blockquote>`

				let chatData = {
					speaker: ChatMessage.getSpeaker("token"),
					content: response,
					whisper: ChatMessage.getWhisperRecipients("GM")
				}; 
				ChatMessage.create(chatData, {});
			} else { // player without character
				ui.notifications.notify(game.i18n.format('GMTOOLKIT.Notification.NoActor', {currentUser: game.users.current.name}));
			}
		}  else { // non-player (ie, GM)
			let buttonAction = event.currentTarget.text
			ui.notifications.notify(game.i18n.format('GMTOOLKIT.Notification.UserMustBePlayer', {action: buttonAction}));
		}
	})
}; // End of chatListeners
} // End of class


/* Settings
/ ---------
*/
const debouncedReload = foundry.utils.debounce(() => {
    window.location.reload();
  }, 100);

Hooks.once("init", function() {
	game.settings.register("wfrp4e-gm-toolkit", "scenePullActivate", {
		name: "GMTOOLKIT.Settings.ScenePullActivate.name",
		hint: "GMTOOLKIT.Settings.ScenePullActivate.hint",
		scope: "world",
		config: true,
		default: "never",
		type: String,
		choices: {
            "always": "GMTOOLKIT.Settings.ScenePullActivate.Always",
			"never": "GMTOOLKIT.Settings.ScenePullActivate.Never",
			"prompt": "GMTOOLKIT.Settings.ScenePullActivate.Prompt",
		}
	});
	game.settings.register("wfrp4e-gm-toolkit", "addXPDefault", {
		name: "GMTOOLKIT.Settings.AddXP.Default.name",
		hint: "GMTOOLKIT.Settings.AddXP.Default.hint",
		scope: "world",
		config: true,
		default: 20,
		type: Number,
	});
	game.settings.register("wfrp4e-gm-toolkit", "addXPPrompt", {
		name: "GMTOOLKIT.Settings.AddXP.Prompt.name",
		hint: "GMTOOLKIT.Settings.AddXP.Prompt.hint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
        onChange: debouncedReload 
	});
	game.settings.register("wfrp4e-gm-toolkit", "rangeNormalSight", {
		name: "GMTOOLKIT.Settings.Vision.NormalSight.name",
		hint: "GMTOOLKIT.Settings.Vision.NormalSight.hint",
		scope: "world",
		config: true,
		default: 2,
		type: Number,
	});
	game.settings.register("wfrp4e-gm-toolkit", "rangeDarkVision", {
		name: "GMTOOLKIT.Settings.Vision.DarkVision.name",
		hint: "GMTOOLKIT.Settings.Vision.DarkVision.hint",
		scope: "world",
		config: true,
		default: 120,
		type: Number,
	});
	game.settings.register("wfrp4e-gm-toolkit", "overrideNightVision", {
		name: "GMTOOLKIT.Settings.Vision.OverrideNightVision.name",
		hint: "GMTOOLKIT.Settings.Vision.OverrideNightVision.hint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});
	game.settings.register("wfrp4e-gm-toolkit", "overrideDarkVision", {
		name: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.name",
		hint: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.hint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
  	});
	game.settings.register("wfrp4e-gm-toolkit", "exportChat", {
		name: "GMTOOLKIT.Settings.SessionEnd.ExportChat.name",
		hint: "GMTOOLKIT.Settings.SessionEnd.ExportChat.hint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});
	game.settings.register("wfrp4e-gm-toolkit", "targetDarkWhispers", {
		name: "GMTOOLKIT.Settings.DarkWhispers.Filter.name",
		hint: "GMTOOLKIT.Settings.DarkWhispers.Filter.hint",
		scope: "world",
		config: true,
		default: "all",
		type: String,
		choices: {
            "all": "GMTOOLKIT.Settings.DarkWhispers.Filter.All",
			"present": "GMTOOLKIT.Settings.DarkWhispers.Filter.Present",
			"absent": "GMTOOLKIT.Settings.DarkWhispers.Filter.Absent",
		}
	});
	game.settings.register("wfrp4e-gm-toolkit", "messageDarkWhispers", {
		name: "GMTOOLKIT.Settings.DarkWhispers.message.name",
		hint: "GMTOOLKIT.Settings.DarkWhispers.message.hint",
		scope: "world",
		config: true,
		default: "taunt",
		type: String,
		choices: {
            "taunt": "GMTOOLKIT.Settings.DarkWhispers.message.taunt",
			"threat": "GMTOOLKIT.Settings.DarkWhispers.message.threat",
		}
	});
});


