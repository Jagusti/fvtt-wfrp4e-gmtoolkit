import GMToolkit from "./gm-toolkit.mjs";
import GMToolkitSettings from "./gm-toolkit-settings.mjs";

export default class Advantage {

/* 
character   :   Token, Actor. Combatant is passed in as Token.
adjustment  :   increase (+1), reduce (=0), clear (-1)
context     :   macro, wfrp4e:applyDamage, createCombatant, createActiveEffect
 */
    static async updateAdvantage(character, adjustment, context = "macro") {    
        // Guards
        if (character === undefined) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
        if (character?.document?.documentName == "Token") {
            if (context == "macro" && canvas.tokens.controlled.length != 1) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
            if (!character.inCombat && (adjustment == "increase" || adjustment == "reduce")) return ui.notifications.error(`${game.i18n.format("GMTOOLKIT.Advantage.NotInCombat",{actorName: character.name, sceneName : game.scenes.viewed.name})}`);
        }

        // Clear console if token. 
        GMToolkit.log(false, character); GMToolkit.log(false,`${character.document.documentName} ${character.name}: ${adjustment}`)

        // Find current and max Advantage for token or actor. 
        let resourceBase = []
        resourceBase = await this.getAdvantage(character, resourceBase, adjustment);
        GMToolkit.log(false,resourceBase)
        
        // Make the adjustment to the token actor and capture the outcome
        let updatedAdvantage = await this.adjustAdvantage(character, resourceBase, adjustment);
        
        // Report the outcome to the user
        await this.reportAdvantageUpdate(updatedAdvantage, character, resourceBase)
    }

    static async getAdvantage(character, resourceBase, adjustment) {
        switch(character.document.documentName) {
            case "Actor":
                resourceBase = duplicate(character.document.status.advantage);
                resourceBase.current = resourceBase.value || 0;
                break;
            case "Token":
                if (character.data.actorLink) { // get status from linked actor
                    resourceBase = duplicate(character.actor.status.advantage);
                    resourceBase.current = resourceBase.value;
                } else { // get status from token actorData (fallback to source actor)
                    resourceBase.current = character.data.actorData?.data?.status?.advantage?.value || 0;
                    if (adjustment == "increase") { resourceBase.max = character.data.actorData?.data?.status?.advantage?.max || character.actor.status.advantage.max; }
                }
                break;
        }    
        return resourceBase;
    }

    static async adjustAdvantage (character, advantage, adjustment) {
        GMToolkit.log(false, `Attempting to ${adjustment} Advantage for ${character.name} from ${advantage.current}`)
        let outcome = ""

        switch (adjustment) {
            case "increase":
                if (advantage.current < advantage.max) {
                        advantage.new = Number(advantage.current + 1); 
                        let updated = await updateCharacterAdvantage();
                        (updated) ? outcome = "increased" : outcome = "nochange"
                    } else {
                        outcome = "max"
                }
                break;
            case "reduce":
                if (advantage.current > 0) {
                        advantage.new = Number(advantage.current - 1); 
                        let updated = await updateCharacterAdvantage();
                        (updated) ? outcome = "reduced" : outcome = "nochange"
                    } else {
                        outcome = "min"
                }
                break;
            case "clear":
                if (advantage.current == 0) {
                        outcome = "min"
                    } else {
                        advantage.new = Number(0); 
                        let updated = await updateCharacterAdvantage();
                        (updated) ? outcome =  "reset" : outcome = "nochange"
                }
                break;
        }
        return {
            outcome, 
            starting: advantage.current,
            new: advantage.new 
        }

        async function updateCharacterAdvantage() {
            let updated = ""
            if (character.document.documentName == "Token") return updated = await character.document.actor.update({ "data.status.advantage.value": advantage.new }); 
            if (character.document.documentName == "Actor") return updated = await character.document.update({ "data.status.advantage.value": advantage.new });
        }
    }

    static async reportAdvantageUpdate(updatedAdvantage, character, resourceBase) {
        let uiNotice = "";
        let type = "info";
        let options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")};

        switch (updatedAdvantage.outcome) {
            case "increased":
                // TODO: add context to notification (eg, win opposed test)
                uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Increased", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
                break;
                case "reduced":
                // TODO: add context to notification (eg, not gained advantage)
                uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reduced", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
                break;
            case "reset":
                // TODO: add context to notification (eg, added to or removed from combat, suffer condition, lose opposed test)
                uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reset", { actorName: character.name, startingAdvantage: updatedAdvantage.starting });
                break;
            case "min":
                uiNotice = game.i18n.format("GMTOOLKIT.Advantage.None", { actorName: character.name, startingAdvantage: updatedAdvantage.starting });
                break;
            case "max":
                uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Max", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, maxAdvantage: resourceBase.max });
                break;
            case "nochange":
            default:
                uiNotice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange");
                break;
        }

        let message = uiNotice
        ui.notifications.notify(message, type, options) 
        GMToolkit.log(true, uiNotice);
        // Force refresh the token hud if it is visible
        if (character.hasActiveHUD) {await canvas.hud.token.render(true);}
    }

    static async clearAdvantage(context) {    
        let settingClearAdvantage = String(game.settings.get("wfrp4e-gm-toolkit", "clearAdvantage"))    
        if (settingClearAdvantage == "always" || settingClearAdvantage == context) {
            for (let token of canvas.tokens.placeables) {
                await token.document.actor.update({"data.status.advantage.value": 0 });
                if (token.hasActiveHUD) {canvas.hud.token.render(true);}
            }        
            let uiNotice = String()
            // if (context == "start") (uiNotice = game.i18n.format("GMTOOLKIT.Combat.Started")) 
            if (context == "end") (uiNotice = game.i18n.format("GMTOOLKIT.Combat.Ended")) 
            uiNotice += ` ${game.i18n.format("GMTOOLKIT.Advantage.Cleared",{sceneName: game.scenes.viewed.name} )}`
            let message = uiNotice
            let type = "info"
            let options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")};
            ui.notifications.notify(message, type, options);
        }
    }

} // End Class

Hooks.on("createCombatant", function(combatant) {
    // TODO: update START option to take effect when character is added, not when encounter is created or combat begins
    // TODO: add "added to combat" context to notification
    let settingClearAdvantage = String(game.settings.get("wfrp4e-gm-toolkit", "clearAdvantage"))    
    if (settingClearAdvantage == "always" || settingClearAdvantage == "start") {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.updateAdvantage(token, "clear", "createCombatant");
    } 
});

Hooks.on("deleteCombatant", function(combatant) {
    // TODO: update ALWAYS option to include deleting combatant
    // TODO: add "removed from combat" context to notification
    // reset advantage when a character is removed from a combat, even if the combat has not been ended
    if (String(game.settings.get("wfrp4e-gm-toolkit", "clearAdvantage")) == "always") {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.updateAdvantage(token, "clear", "deleteCombatant");
    } 
});

Hooks.on("preDeleteCombat", function() {
    Advantage.clearAdvantage("end");
}); 
 
Hooks.once("init", function() {	
    // TODO: Adjust UI control / options to align with updated handling of when to clear advantage 
	game.settings.register(GMToolkit.MODULE_ID, "clearAdvantage", {
		name: "GMTOOLKIT.Settings.Advantage.Clear.name",
		hint: "GMTOOLKIT.Settings.Advantage.Clear.hint",
		scope: "world",
		config: false,
		default: "always",
		type: String,
		choices: {
			"always": "GMTOOLKIT.Settings.clearAdvantage.both",
			"start": "GMTOOLKIT.Settings.clearAdvantage.start",
			"end": "GMTOOLKIT.Settings.clearAdvantage.end",
			"never": "GMTOOLKIT.Settings.clearAdvantage.never"
		},
        onChange: GMToolkitSettings.debouncedReload, 
        feature: "advantage" 
	});
	game.settings.register(GMToolkit.MODULE_ID, "automateDamageAdvantage", {
		name: "GMTOOLKIT.Settings.Advantage.Automate.OpposedDamage.name",
		hint: "GMTOOLKIT.Settings.Advantage.Automate.OpposedDamage.hint",
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
});

Hooks.on("wfrp4e:applyDamage", async function(scriptArgs) {  
    GMToolkit.log(false, scriptArgs)    
    let automateDamageAdvantage = String(game.settings.get("wfrp4e-gm-toolkit", "automateDamageAdvantage")) 
    GMToolkit.log(false, `Automate Damage Advantage: ${automateDamageAdvantage}`) 
    if (!automateDamageAdvantage) return

    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.OpposedDamage",{actorName: scriptArgs.actor.name, attackerName: scriptArgs.attacker.name, totalWoundLoss: scriptArgs.totalWoundLoss} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")};

    ui.notifications.notify(message, type, options) 
    GMToolkit.log(true,uiNotice)

    // Clear advantage on actor that has taken damage
    var character = scriptArgs.actor.data.token
    GMToolkit.log(false, character.document.documentName)
    await Advantage.updateAdvantage(scriptArgs.actor.data.token,"clear","wfrp4e:applyDamage" );

    // Increase advantage on actor that dealt damage
    var character = scriptArgs.attacker.data.token
    GMToolkit.log(false, character.document.documentName)
    await Advantage.updateAdvantage(scriptArgs.attacker.data.token,"increase","wfrp4e:applyDamage");

    GMToolkit.log(false,`Automate Damage Advantage: Finished.`)
});
