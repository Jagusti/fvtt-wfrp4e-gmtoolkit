Hooks.on("init", function() {
	game.settings.register("wfrp4e-gm-toolkit", "scenePullActivate", {
		name: "GMTOOLKIT.Settings.ScenePullActivate.name",
		hint: "GMTOOLKIT.Settings.ScenePullActivate.hint",
		scope: "world",
		config: true,
		default: "never",
		type: String,
		choices: {
            "always": "GMTOOLKIT.Settings.always",
			"never": "GMTOOLKIT.Settings.never",
			"prompt": "GMTOOLKIT.Settings.prompt",
		}
	});
});

Hooks.on('ready', async () => {
	// Only show warning to GMs
	if (!game.user.isGM)
        return;
    if (!(game.modules.get("furnace").active))  {
        console.log(game.i18n.localize("GMTOOLKIT.Log.FurnaceNotInstalled"));
        return ui.notifications.error( game.i18n.localize("GMTOOLKIT.Message.InstallFurnace") );
        } else {
        console.log(game.i18n.localize("GMTOOLKIT.Log.FurnaceInstalled"));
        }
})