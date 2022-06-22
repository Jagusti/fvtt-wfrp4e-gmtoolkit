import GMToolkit  from "./gm-toolkit.mjs";
import GMToolkitAdvantageSettings from "../apps/gm-toolkit-advantage-settings.js";
import GMToolkitDarkWhispersSettings from "../apps/gm-toolkit-darkwhispers-settings.js";
import GMToolkitSessionManagementSettings from "../apps/gm-toolkit-session-management-settings.js";
import GMToolkitVisionSettings from "../apps/gm-toolkit-vision-settings.js";
import GMToolkitMaintenanceWrapper from "../apps/gm-toolkit-maintenance.js";

export default class GMToolkitSettings {

    static debouncedReload = foundry.utils.debounce(() => {
      window.location.reload();
    }, 100);

    static register() {
            
        // Menu for Advantage handling
        game.settings.registerMenu(GMToolkit.MODULE_ID, "menuAdvantage", {
            name: "GMTOOLKIT.Settings.Advantage.menu.name",
            label: "GMTOOLKIT.Settings.Advantage.menu.label",      
            hint: "GMTOOLKIT.Settings.Advantage.menu.hint",
            icon: "fas fa-caret-square-up",               
            type: GMToolkitAdvantageSettings,   
            restricted: true                 
        });
        // Automate advantage for winning or losing an opposed test
        game.settings.register(GMToolkit.MODULE_ID, "automateOpposedTestAdvantage", {
            name: "GMTOOLKIT.Settings.Advantage.Automate.OpposedTest.name",
            hint: "GMTOOLKIT.Settings.Advantage.Automate.OpposedTest.hint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "advantage"  
        });
        // Automate advantage for outmanouvring and losing wounds from unopposed tests
        game.settings.register(GMToolkit.MODULE_ID, "automateDamageAdvantage", {
            name: "GMTOOLKIT.Settings.Advantage.Automate.UnopposedDamage.name",
            hint: "GMTOOLKIT.Settings.Advantage.Automate.UnopposedDamage.hint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "advantage"  
        });
        // Clear advantage when suffering a condition
        game.settings.register(GMToolkit.MODULE_ID, "automateConditionAdvantage", {
            name: "GMTOOLKIT.Settings.Advantage.Automate.SufferCondition.name",
            hint: "GMTOOLKIT.Settings.Advantage.Automate.SufferCondition.hint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "advantage"  
        });
        // Prompt to lose advantage when not gained in a round
        game.settings.register(GMToolkit.MODULE_ID, "promptMomentumLoss", {
            name: "GMTOOLKIT.Settings.Advantage.Automate.LoseMomentum.name",
            hint: "GMTOOLKIT.Settings.Advantage.Automate.LoseMomentum.hint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "advantage"  
        });
        // Clear Advantage when token is added to combat tracker
        game.settings.register(GMToolkit.MODULE_ID, "clearAdvantageCombatJoin", {
            name: "GMTOOLKIT.Settings.Advantage.Automate.CombatJoin.name",
            hint: "GMTOOLKIT.Settings.Advantage.Automate.CombatJoin.hint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "advantage"  
        });
        // Clear Advantage when token is removed from combat tracker
        game.settings.register(GMToolkit.MODULE_ID, "clearAdvantageCombatLeave", {
            name: "GMTOOLKIT.Settings.Advantage.Automate.CombatLeave.name",
            hint: "GMTOOLKIT.Settings.Advantage.Automate.CombatLeave.hint",
            scope: "world",
            config: false,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "advantage"  
        });
        game.settings.register(GMToolkit.MODULE_ID, "persistAdvantageNotifications", {
            name: "GMTOOLKIT.Settings.Advantage.PersistNotices.name",
            hint: "GMTOOLKIT.Settings.Advantage.PersistNotices.hint",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "advantage" 
        });

        // Menu for Session Management
        game.settings.registerMenu(GMToolkit.MODULE_ID, "menuSessionManagement", {
            name: "GMTOOLKIT.Settings.SessionManagement.menu.name",
            label: "GMTOOLKIT.Settings.SessionManagement.menu.label",      
            hint: "GMTOOLKIT.Settings.SessionManagement.menu.hint",
            icon: "fas fa-history",               
            type: GMToolkitSessionManagementSettings,   
            restricted: true                 
        });
        // Settings for Session Management
        game.settings.register(GMToolkit.MODULE_ID, "sessionID", {
            name: "GMTOOLKIT.Settings.SessionTurnover.SessionID.name",
            hint: "GMTOOLKIT.Settings.SessionTurnover.SessionID.hint",
            scope: "world",
            config: false,
            default: "0",
            type: String,
            feature: "session"
        });
        game.settings.register(GMToolkit.MODULE_ID, "addXPPrompt", {
            name: "GMTOOLKIT.Settings.AddXP.Prompt.name",
            hint: "GMTOOLKIT.Settings.AddXP.Prompt.hint",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
            onChange: this.debouncedReload,
            feature: "session"
        });
        game.settings.register(GMToolkit.MODULE_ID, "addXPDefaultAmount", {
            name: "GMTOOLKIT.Settings.AddXP.Default.name",
            hint: "GMTOOLKIT.Settings.AddXP.Default.hint",
            scope: "world",
            config: false,
            default: 20,
            type: Number,
            range: {
                min: 0,
                max: 200,
                step: 5
            },
            onChange: this.debouncedReload,
            feature: "session"
        });
        game.settings.register(GMToolkit.MODULE_ID, "addXPDefaultReason", {
            name: "GMTOOLKIT.Settings.AddXP.Reason.name",
            hint: "GMTOOLKIT.Settings.AddXP.Reason.hint",
            scope: "world",
            config: false,
            default: "Session %session% (%date%)",
            type: String,
            onChange: this.debouncedReload,
            feature: "session"
        });
        game.settings.register(GMToolkit.MODULE_ID, "holdingScene", {
            name: "GMTOOLKIT.Settings.SessionTurnover.HoldingScene.name",
            hint: "GMTOOLKIT.Settings.SessionTurnover.HoldingScene.hint",
            scope: "world",
            config: false,
            default: "",
            type: String,
            feature: "session"
        });
        game.settings.register(GMToolkit.MODULE_ID, "exportChat", {
            name: "GMTOOLKIT.Settings.SessionEnd.ExportChat.name",
            hint: "GMTOOLKIT.Settings.SessionEnd.ExportChat.hint",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
            feature: "session"
        });
        game.settings.register(GMToolkit.MODULE_ID, "scenePullActivate", {
            name: "GMTOOLKIT.Settings.ScenePullActivate.name",
            hint: "GMTOOLKIT.Settings.ScenePullActivate.hint",
            scope: "world",
            config: false,
            default: "never",
            type: String,
            choices: {
                "always": "GMTOOLKIT.Settings.ScenePullActivate.Always",
                "never": "GMTOOLKIT.Settings.ScenePullActivate.Never",
                "prompt": "GMTOOLKIT.Settings.ScenePullActivate.Prompt",
            },
            feature: "session"
        });


        // Menu for Vision settings used by Set Token Vision and Light Macro
        game.settings.registerMenu(GMToolkit.MODULE_ID, "menuTokenVision", {
            name: "GMTOOLKIT.Settings.Vision.menu.name",
            label: "GMTOOLKIT.Settings.Vision.menu.label",      
            hint: "GMTOOLKIT.Settings.Vision.menu.hint",
            icon: "fas fa-eye",               
            type: GMToolkitVisionSettings,   
            restricted: true                 
        });
        // Vision Settings for Set Token Vision and Light Macro
        game.settings.register(GMToolkit.MODULE_ID, "rangeNormalSight", {
            name: "GMTOOLKIT.Settings.Vision.NormalSight.name",
            hint: "GMTOOLKIT.Settings.Vision.NormalSight.hint",
            scope: "world",
            config: false,
            default: 2,
            type: Number,
            feature : "vision"
        });
        game.settings.register(GMToolkit.MODULE_ID, "rangeDarkVision", {
            name: "GMTOOLKIT.Settings.Vision.DarkVision.name",
            hint: "GMTOOLKIT.Settings.Vision.DarkVision.hint",
            scope: "world",
            config: false,
            default: 120,
            type: Number,
            feature : "vision"
        });
        game.settings.register(GMToolkit.MODULE_ID, "overrideNightVision", {
            name: "GMTOOLKIT.Settings.Vision.OverrideNightVision.name",
            hint: "GMTOOLKIT.Settings.Vision.OverrideNightVision.hint",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
            feature : "vision"
        });
        game.settings.register(GMToolkit.MODULE_ID, "overrideDarkVision", {
            name: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.name",
            hint: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.hint",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
            feature : "vision"
        });
            
            
        // Menu for Send Dark Whispers Macro
        game.settings.registerMenu(GMToolkit.MODULE_ID, "menuDarkWhispers", {
            name: "GMTOOLKIT.Settings.DarkWhispers.menu.name",
            label: "GMTOOLKIT.Settings.DarkWhispers.menu.label",      
            hint: "GMTOOLKIT.Settings.DarkWhispers.menu.hint",
            icon: "fas fa-comment-dots",               
            type: GMToolkitDarkWhispersSettings,   
            restricted: true                 
        });
        // Settings for Send Dark Whispers Macro
        game.settings.register(GMToolkit.MODULE_ID, "targetDarkWhispers", {
            name: "GMTOOLKIT.Settings.DarkWhispers.Filter.name",
            hint: "GMTOOLKIT.Settings.DarkWhispers.Filter.hint",
            scope: "world",
            config: false,
            default: "all",
            type: String,
            choices: {
                "all": "GMTOOLKIT.Settings.DarkWhispers.Filter.All",
                "present": "GMTOOLKIT.Settings.DarkWhispers.Filter.Present",
                "absent": "GMTOOLKIT.Settings.DarkWhispers.Filter.Absent",
            },
            feature: "darkwhispers"
        });
        game.settings.register(GMToolkit.MODULE_ID, "messageDarkWhispers", {
            name: "GMTOOLKIT.Settings.DarkWhispers.message.name",
            hint: "GMTOOLKIT.Settings.DarkWhispers.message.hint",
            scope: "world",
            config: false,
            default: "taunt",
            type: String,
            choices: {
                "taunt": "GMTOOLKIT.Settings.DarkWhispers.message.taunt",
                "threat": "GMTOOLKIT.Settings.DarkWhispers.message.threat",
            },
            feature: "darkwhispers"
        });

        
        // Settings for Token Hud Extension
        game.settings.register(GMToolkit.MODULE_ID, "enableTokenHudExtensions", {
            name: "GMTOOLKIT.Settings.TokenHudExtensions.Enabled.name",
            hint: "GMTOOLKIT.Settings.TokenHudExtensions.Enabled.hint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "tokenhud" 
        });

        // Settings for Make Secret Party Tests
        game.settings.register(GMToolkit.MODULE_ID, "fallbackAdvancedSkills", {
            name: "GMTOOLKIT.Settings.MakeSecretPartyTests.FallbackAdvanced.name",
            hint: "GMTOOLKIT.Settings.MakeSecretPartyTests.FallbackAdvanced.hint",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            feature: "grouptests" 
        });

        // Settings for suppressing Spectator notification
        game.settings.register(GMToolkit.MODULE_ID, "suppressSpectatorNotice", {
            name: "GMTOOLKIT.Settings.Spectators.name",
            hint: "GMTOOLKIT.Settings.Spectators.hint",
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
            onChange: GMToolkitSettings.debouncedReload,
            feature: "grouptests" 
        });

        // Menu for Module Content Management
        game.settings.registerMenu(GMToolkit.MODULE_ID, "menuMaintenance", {
            name: "GMTOOLKIT.Settings.Maintenance.menu.name",
            label: "GMTOOLKIT.Settings.Maintenance.menu.label",      
            hint: "GMTOOLKIT.Settings.Maintenance.menu.hint",
            icon: "fas fa-cog",               
            type: GMToolkitMaintenanceWrapper,   
            restricted: true                 
        });
 
    }

}


export function getDataSettings(data, feature) {
    data.settings = Array.from(game.settings.settings).filter(s => s[1].feature == feature).map(i => i[1]);
    data.settings.forEach(s => {
        if (s.type == Boolean) {
            s.boolean = true;
            s.inputType = "checkbox"
        }
        if (s.range) {
            s.isRange = true;
            s.inputType = "range"
        }
        if (s.type == Number & !s.range) {
            s.isNumber = true;
            s.inputType = "number"
        }
        s.value = game.settings.get(s.namespace, s.key);
    });
}
