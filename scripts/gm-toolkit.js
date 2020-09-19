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
});


