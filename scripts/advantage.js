async function updateAdvantage(character, adjustment) {    
    // Guards
    if (character === undefined) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
    if (character?.document?.documentName == "Token") {
        if (canvas.tokens.controlled.length != 1) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
        if (!character.inCombat && (adjustment == "increase" || adjustment == "reduce")) return ui.notifications.error(`${game.i18n.format("GMTOOLKIT.Advantage.NotInCombat",{actorName: character.name, sceneName : game.scenes.viewed.name})}`);
    }

    // Clear console if token. 
    console.log(character); console.log(`${character.document.documentName} ${character.name}: ${adjustment}`)

    // Find current and max Advantage for token or actor. 
    let resourceBase = []
    resourceBase = getAdvantage(character, resourceBase, adjustment);
    console.log(resourceBase)
    
    // Make the adjustment to the token actor and capture the outcome
    let updatedAdvantage = await adjustAdvantage(character, resourceBase, adjustment);
    
    // Report the outcome to the user
    reportAdvantageUpdate(updatedAdvantage, character, resourceBase);
}

function getAdvantage(character, resourceBase, adjustment) {
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

async function adjustAdvantage (character, advantage, adjustment) {
    console.log(`GM Toolkit (WFRP4e) | Attempting to ${adjustment} Advantage for ${character.name} from ${advantage.current}`)
    switch (adjustment) {
        case "increase":
            if (advantage.current < advantage.max) {
                    advantage.new = Number(advantage.current + 1); 
                    await updateCharacterAdvantage();
                    (updated) ? outcome = "increased" : outcome = "nochange"
                } else {
                    outcome = "max"
            }
            break;
        case "reduce":
            if (advantage.current > 0) {
                    advantage.new = Number(advantage.current - 1); 
                    await updateCharacterAdvantage();
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
                    await updateCharacterAdvantage();
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
        if (character.document.documentName == "Token") return updated = await character.document.actor.update({ "data.status.advantage.value": advantage.new }); 
        if (character.document.documentName == "Actor") return updated = await character.document.update({ "data.status.advantage.value": advantage.new });
    }
}

async function reportAdvantageUpdate(updatedAdvantage, character, resourceBase) {
    switch (updatedAdvantage.outcome) {
        case "increased":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Increased", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
            break;
        case "reduced":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reduced", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
            break;
        case "reset":
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
    ui.notifications.notify(message = uiNotice, type = "info", options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")})
    console.log(`GM Toolkit (WFRP4e) | ${uiNotice}`);
    // Force refresh the token hud if it is visible
    if (character.hasActiveHUD) {await canvas.hud.token.render(true);}
}

async function clearAdvantage(context) {    
    let settingClearAdvantage = String(game.settings.get("wfrp4e-gm-toolkit", "clearAdvantage"))    
    if (settingClearAdvantage == "always" || settingClearAdvantage == context) {
        for (let token of canvas.tokens.placeables) {
            await token.document.actor.update({"data.status.advantage.value": 0 });
            if (token.hasActiveHUD) {canvas.hud.token.render(true);}
        }        
        let uiNotice = String()
        if (context == "start") (uiNotice = game.i18n.format("GMTOOLKIT.Combat.Started")) 
        if (context == "end") (uiNotice = game.i18n.format("GMTOOLKIT.Combat.Ended")) 
        uiNotice += ` ${game.i18n.format("GMTOOLKIT.Advantage.Cleared",{sceneName: game.scenes.viewed.name} )}`
        ui.notifications.notify(message = uiNotice, type = "info", options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")});
    }
}

Hooks.on("preUpdateCombat", function() {
    if (game.combat.round == 0) clearAdvantage("start")
})

Hooks.on("preDeleteCombat", function() {
    clearAdvantage("end");
});
 
Hooks.once("init", function() {	
	game.settings.register("wfrp4e-gm-toolkit", "clearAdvantage", {
		name: "GMTOOLKIT.Settings.Advantage.Clear.name",
		hint: "GMTOOLKIT.Settings.Advantage.Clear.hint",
		scope: "world",
		config: true,
		default: "always",
		type: String,
		choices: {
			"always": "GMTOOLKIT.Settings.clearAdvantage.both",
			"start": "GMTOOLKIT.Settings.clearAdvantage.start",
			"end": "GMTOOLKIT.Settings.clearAdvantage.end",
			"never": "GMTOOLKIT.Settings.clearAdvantage.never"
		},
        onChange: debouncedReload 
	});
	game.settings.register("wfrp4e-gm-toolkit", "automateDamageAdvantage", {
		name: "GMTOOLKIT.Settings.Advantage.Automate.OpposedDamage.name",
		hint: "GMTOOLKIT.Settings.Advantage.Automate.OpposedDamage.hint",
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
        onChange: debouncedReload 
	});
	game.settings.register("wfrp4e-gm-toolkit", "persistAdvantageNotifications", {
		name: "GMTOOLKIT.Settings.Advantage.PersistNotices.name",
		hint: "GMTOOLKIT.Settings.Advantage.PersistNotices.hint",
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
        onChange: debouncedReload 
	});
});

Hooks.on("wfrp4e:applyDamage", async function(scriptArgs) {  
    // console.log(scriptArgs)    
    let automateDamageAdvantage = String(game.settings.get("wfrp4e-gm-toolkit", "automateDamageAdvantage")) 
    console.log(`GM Toolkit (WFRP4e) | Automate Damage Advantage: ${automateDamageAdvantage}`) 
    if (!automateDamageAdvantage) return

    uiNotice = ` ${game.i18n.format("GMTOOLKIT.Advantage.Automation.OpposedDamage",{actorName: scriptArgs.actor.name, attackerName: scriptArgs.attacker.name, totalWoundLoss: scriptArgs.totalWoundLoss} )}`
    ui.notifications.notify(message = uiNotice, type = "info", options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")}) 
    console.log(`GM Toolkit (WFRP4e) | ${uiNotice}`)

    // Clear advantage on actor that has taken damage
    var character = scriptArgs.actor.data.token
    console.log(character.document.documentName)
    await updateAdvantage(scriptArgs.actor.data.token,"clear");

    // Increase advantage on actor that dealt damage
    var character = scriptArgs.attacker.data.token
    console.log(character.document.documentName)
    await updateAdvantage(scriptArgs.attacker.data.token,"increase");

    console.log(`GM Toolkit (WFRP4e) | Automate Damage Advantage: Finished.`)
});
