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
    return {"base":resourceData, "current":resourceCurrent, "max":resourceMax}; 
}

function updateAdvantage(token, adjustment) {
    const selected = token 
    let baseActor = getBaseActor(token) 
    let resourceBase = getResourceBase(selected.actor,baseActor)
    let updateAdvantage = adjustAdvantage(selected, resourceBase, adjustment)
    let uiNotice = String()
    
    switch (updateAdvantage.outcome) {   
        case "increased":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Increased",{actorName: token.name, startingAdvantage: updateAdvantage.starting, newAdvantage: updateAdvantage.new } );
            break;
        case "reduced":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reduced",{actorName: token.name, startingAdvantage: updateAdvantage.starting, newAdvantage: updateAdvantage.new } );
            break; 
        case "reset":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reset",{actorName: token.name, startingAdvantage: updateAdvantage.starting} );
            break;
        case "min":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.None",{actorName: token.name, startingAdvantage: updateAdvantage.starting } );
            break;
        case "max":
            uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Max",{actorName: token.name, startingAdvantage: updateAdvantage.starting, maxAdvantage: resourceBase.max } );
            break;
        case "nochange":
            default:
            uiNotice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange");
            break;
    }  

    ui.notifications.notify(uiNotice);
}

function adjustAdvantage (token, resourceBase, adjustment) {
    let startingAdvantage = resourceBase.current
    let newAdvantage = Number()
    let updateResult = String()

    switch (adjustment) {
        case "increase":
            if (startingAdvantage < resourceBase.max) {
                    newAdvantage = Number(startingAdvantage + 1);
                    token.actor.update({"data.status.advantage.value": newAdvantage });
                    updateResult =  "increased"
                } else {
                    updateResult = "max"
            }
            break;
        case "reduce":
            if (startingAdvantage > 0) {
                    newAdvantage = Number(startingAdvantage - 1);
                    token.actor.update({"data.status.advantage.value": newAdvantage });
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
                    token.actor.update({"data.status.advantage.value": newAdvantage });
                    updateResult =  "reset"
            }
            break;
    }
    
    return {
        outcome: updateResult, 
        starting: startingAdvantage,
        new: newAdvantage 
    }
}

function clearAdvantage(context) {
    
    let settingClearAdvantage = String(game.settings.get("wfrp4e-gm-toolkit", "clearAdvantage"))
    
    if (settingClearAdvantage == "always" || settingClearAdvantage == context) {
        for (let token of canvas.tokens.placeables) {
            console.log(token)
            token.actor.update({"data.status.advantage.value": 0 });
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
 
Hooks.on("init", function() {	
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
