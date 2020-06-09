Hooks.on("init", function() {
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
		type: Boolean
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