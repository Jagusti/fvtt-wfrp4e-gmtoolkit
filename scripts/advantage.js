function getBaseActor(token) {
    if (token.data.actorLink) {
        return getActor = token.actor.data; // use linked actor
    } else {
        return getActor = token.data.actorData; // use synthetic actor
    }
} 

function getResourceBase(actor,baseActor) {
    let resourceData = baseActor.data;
    let resourceCurrent = 0;
    let resourceMax = Number();
    if (resourceData !== undefined && resourceData.status !== undefined && resourceData.status.advantage !== undefined) {
            resourceCurrent = Number(resourceData.status.advantage.value);
            resourceMax = resourceData.status.advantage.max | actor.data.data.status.advantage.max;
        } else {
            resourceMax = actor.data.data.status.advantage.max;
            // console.log("No status defined. Setting current value to " + resourceCurrent)
        } 
    return {"current":resourceCurrent, "max":resourceMax}; 
}

async function updateAdvantage(token, adjustment) {
    if (canvas.tokens.controlled.length !== 1) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
    
    let baseActor = getBaseActor(token) 
    let resourceBase = getResourceBase(token.actor, baseActor)
    let updatedAdvantage = await adjustAdvantage(token, resourceBase, adjustment)
    let uiNotice = String()
    
    switch (updatedAdvantage.outcome) {   
        case "increased":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Increased",{actorName: token.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new } );
            break;
        case "reduced":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reduced",{actorName: token.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new } );
            break; 
        case "reset":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reset",{actorName: token.name, startingAdvantage: updatedAdvantage.starting} );
            break;
        case "min":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.None",{actorName: token.name, startingAdvantage: updatedAdvantage.starting } );
            break;
        case "max":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Max",{actorName: token.name, startingAdvantage: updatedAdvantage.starting, maxAdvantage: resourceBase.max } );
            break;
        case "nochange":
            default:
            uiNotice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange");
            break;
    }  

    ui.notifications.notify(uiNotice);
    if (token.hasActiveHUD) {canvas.hud.token.render();}
}

async function adjustAdvantage (token, resourceBase, adjustment) {
    let startingAdvantage = resourceBase.current
    let newAdvantage = Number()
    let updateResult = String()

    switch (adjustment) {
        case "increase":
            if (startingAdvantage < resourceBase.max) {
                    newAdvantage = Number(startingAdvantage + 1);
                    await token.document.actor.update({"data.status.advantage.value": newAdvantage });
                    updateResult =  "increased"
                } else {
                    updateResult = "max"
            }
            break;
        case "reduce":
            if (startingAdvantage > 0) {
                    newAdvantage = Number(startingAdvantage - 1);
                    await token.document.actor.update({"data.status.advantage.value": newAdvantage });
                    updateResult =  "reduced"
                } else {
                    updateResult = "min"
            }
            break;
        case "clear":
            if (startingAdvantage == 0) {
                    updateResult = "min"
                } else {
                    newAdvantage = Number(0);
                    await token.document.actor.update({"data.status.advantage.value": newAdvantage });
                    updateResult =  "reset"
            }
            break;
    }
    // console.log(updateResult);
    return {
        outcome: updateResult, 
        starting: startingAdvantage,
        new: newAdvantage 
    }
}

async function clearAdvantage(context) {
    
    let settingClearAdvantage = String(game.settings.get("wfrp4e-gm-toolkit", "clearAdvantage"))
    
    if (settingClearAdvantage == "always" || settingClearAdvantage == context) {
        for (let token of canvas.tokens.placeables) {
            console.log(token)
            await token.document.actor.update({"data.status.advantage.value": 0 });
            if (token.hasActiveHUD) {canvas.hud.token.render();}
        }
        
        let uiNotice = String()
        if (context == "start") (uiNotice = game.i18n.format("GMTOOLKIT.Combat.Started")) 
        if (context == "end") (uiNotice = game.i18n.format("GMTOOLKIT.Combat.Ended")) 

        uiNotice += " " + game.i18n.format("GMTOOLKIT.Advantage.Cleared",{sceneName: game.scenes.viewed.name} )
        ui.notifications.notify(uiNotice);
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
		name: "GMTOOLKIT.Settings.clearAdvantage.name",
		hint: "GMTOOLKIT.Settings.clearAdvantage.hint",
		scope: "world",
		config: true,
		default: "always",
		type: String,
		choices: {
			"always": "GMTOOLKIT.Settings.clearAdvantage.both",
			"start": "GMTOOLKIT.Settings.clearAdvantage.start",
			"end": "GMTOOLKIT.Settings.clearAdvantage.end",
			"never": "GMTOOLKIT.Settings.clearAdvantage.never"
		}
	});
});
