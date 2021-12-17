import GMToolkit  from "./gm-toolkit.mjs";

export default class GMToolkitSettings {

    static debouncedReload = foundry.utils.debounce(() => {
      window.location.reload();
    }, 100);

    static register() {
        
        game.settings.register(GMToolkit.MODULE_ID, "scenePullActivate", {
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
        game.settings.register(GMToolkit.MODULE_ID, "addXPDefault", {
            name: "GMTOOLKIT.Settings.AddXP.Default.name",
            hint: "GMTOOLKIT.Settings.AddXP.Default.hint",
            scope: "world",
            config: true,
            default: 20,
            type: Number,
        });
        game.settings.register(GMToolkit.MODULE_ID, "addXPPrompt", {
            name: "GMTOOLKIT.Settings.AddXP.Prompt.name",
            hint: "GMTOOLKIT.Settings.AddXP.Prompt.hint",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            onChange: this.debouncedReload
        });
        game.settings.register(GMToolkit.MODULE_ID, "rangeNormalSight", {
            name: "GMTOOLKIT.Settings.Vision.NormalSight.name",
            hint: "GMTOOLKIT.Settings.Vision.NormalSight.hint",
            scope: "world",
            config: false,
            default: 2,
            type: Number,
            vision:true
        });
        game.settings.register(GMToolkit.MODULE_ID, "rangeDarkVision", {
            name: "GMTOOLKIT.Settings.Vision.DarkVision.name",
            hint: "GMTOOLKIT.Settings.Vision.DarkVision.hint",
            scope: "world",
            config: true,
            default: 120,
            type: Number,
            vision:true
        });
        game.settings.register(GMToolkit.MODULE_ID, "overrideNightVision", {
            name: "GMTOOLKIT.Settings.Vision.OverrideNightVision.name",
            hint: "GMTOOLKIT.Settings.Vision.OverrideNightVision.hint",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            vision:true
        });
        game.settings.register(GMToolkit.MODULE_ID, "overrideDarkVision", {
            name: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.name",
            hint: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.hint",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            vision:true
          });
        game.settings.register(GMToolkit.MODULE_ID, "exportChat", {
            name: "GMTOOLKIT.Settings.SessionEnd.ExportChat.name",
            hint: "GMTOOLKIT.Settings.SessionEnd.ExportChat.hint",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
        });
        game.settings.register(GMToolkit.MODULE_ID, "targetDarkWhispers", {
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
        game.settings.register(GMToolkit.MODULE_ID, "messageDarkWhispers", {
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

    }

}