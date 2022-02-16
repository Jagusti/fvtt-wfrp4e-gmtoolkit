import GMToolkit from "./gm-toolkit.mjs";
import { inActiveCombat } from "./utility.mjs";

export default class Advantage {

/* 
character   :   Token, Actor. Combatant is passed in as Token.
adjustment  :   increase (+1), reduce (=0), clear (-1)
context     :   macro, wfrp4e:opposedTestResult, wfrp4e:applyDamage, createCombatant, deleteCombatant, createActiveEffect
 */
    static async updateAdvantage(character, adjustment, context = "macro") {    
        // Guards
        if (character === undefined) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
        if (character?.document?.documentName == "Token") {
            if (context == "macro" && canvas.tokens.controlled.length != 1) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
            if (!character.inCombat && (adjustment != "clear")) return ui.notifications.error(`${game.i18n.format("GMTOOLKIT.Advantage.NotInCombat",{actorName: character.name, sceneName : game.scenes.viewed.name})}`);
        } 

        // Find current and max Advantage for token or actor. 
        let resourceBase = []
        resourceBase = await this.getAdvantage(character, resourceBase, adjustment);
        GMToolkit.log(false,resourceBase)
        
        // Make the adjustment to the token actor and capture the outcome
        let updatedAdvantage = await this.adjustAdvantage(character, resourceBase, adjustment);
        
        // Report the outcome to the user
        await this.reportAdvantageUpdate(updatedAdvantage, character, resourceBase, context)
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

    static async reportAdvantageUpdate(updatedAdvantage, character, resourceBase, context) {
        let uiNotice = "";
        let type = "info";
        let options = {permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications")};

        switch (updatedAdvantage.outcome) {
            case "increased":
                if (context == "wfrp4e:opposedTestResult" ) uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Context.WonOpposedTest", { actorName: character.name});
                uiNotice += game.i18n.format("GMTOOLKIT.Advantage.Increased", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
                break;
            case "reduced":
                // TODO: add context to notification (eg, not gained advantage)
                uiNotice += game.i18n.format("GMTOOLKIT.Advantage.Reduced", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
                break;
            case "reset":
                if (context == "wfrp4e:opposedTestResult" ) uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Context.LostOpposedTest", { actorName: character.name});
                if (context == "createCombatant") uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Context.AddedToCombat", { actorName: character.name});
                if (context == "deleteCombatant") uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Context.RemovedFromCombat", { actorName: character.name});
                uiNotice += game.i18n.format("GMTOOLKIT.Advantage.Reset", { actorName: character.name, startingAdvantage: updatedAdvantage.starting });
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
        if (game.user.isGM) {ui.notifications.notify(message, type, options)} 
        GMToolkit.log(true, uiNotice);
        // Force refresh the token hud if it is visible
        if (character.hasActiveHUD) {await canvas.hud.token.render(true);}
    }

    // Clears flags set for increasing token Advantage during combat
    static unsetFlags(advantaged) {
        advantaged.filter(a => a.token.actor.unsetFlag('wfrp4e-gm-toolkit','advantage'))
        console.log(advantaged)

        GMToolkit.log(false,`Advantage Flags: Unset.`)
    }

    
    static async loseMomentum() {
        let checkOptions = "";
        let checkGained = "";
        let noAdvantage = "";
        let combatantLine = "";
        
        game.combats.active.combatants.forEach(combatant => {
            let combatantAdvantage = combatant.token.actor.data.data.status?.advantage?.value;
            let checkMomentum = combatant.token.actor.getFlag('wfrp4e-gm-toolkit','advantage') ? false : "checked"
            
            if (!combatantAdvantage) {
                noAdvantage += `${combatant.name};&nbsp;`
            } else {
                combatantLine = `
                <div class="form-group">
                <input type="checkbox" name="${combatant.data.tokenId}" value="${combatant.name}" ${checkMomentum}> 
                <label for="${combatant.data.tokenId}"> <strong>${combatant.name}</strong></label>
                <label for="${combatant.data.tokenId}"> ${combatantAdvantage} </label>
                </div>
                `;
                (checkMomentum) ? checkOptions += combatantLine : checkGained += combatantLine;
            }            
        });

        if (noAdvantage == "") noAdvantage = game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters");

        let dialogContent = `
            <div class="form-group ">
            <label for="targets">${game.i18n.localize("GMTOOLKIT.Dialog.Advantage.NotGainedAdvantage")} </label>
            </div>
            ${checkOptions} 
            <div class="form-group ">
            <label for="targets">${game.i18n.localize("GMTOOLKIT.Dialog.Advantage.GainedAdvantage")} </label>
            </div>
            ${checkGained} 
            <div class="form-group noAdvantage">
              <label for="noAdvantage">${game.i18n.localize("GMTOOLKIT.Dialog.Advantage.NoAdvantage")}</label>
            </div>
            <div class="form-group">${noAdvantage}</div>
        `;

        new Dialog({
            title: game.i18n.localize("GMTOOLKIT.Dialog.Advantage.LoseMomentum.Title"),
            content: dialogContent,
            buttons: {
                reduceAdvantage: {
                    label: game.i18n.localize("GMTOOLKIT.Dialog.Advantage.LoseMomentum"),
                    callback: (html) => {
                        // reduce advantage for selected combatants
                        /* game.combats.active.combatants.forEach (combatant => {
                            if (html.find(`[name="${combatant.data.tokenId}"]`)[0].checked){
                            Advantage.reduceAdvantage(combatant.token)
                            }
                        }) */
                        
                        for ( let combatant of game.combats.active.combatants ) {
                            console.log(combatant.data.tokenId)
                            if (html.find(`[name="${combatant.data.tokenId}"]`)[0].checked){
                                Advantage.reduceAdvantage(combatant.token)
                            }
                        }

                        }
                    }
                }
            }
        ).render(true);

    }
} // End Class

Hooks.on("createCombatant", function(combatant) {
    if (game.settings.get(GMToolkit.MODULE_ID, "clearAdvantageCombatJoin")) {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.updateAdvantage(token, "clear", "createCombatant");
        Advantage.unsetFlags([combatant])
    } 
});

Hooks.on("deleteCombatant", function(combatant) {
    if (game.settings.get(GMToolkit.MODULE_ID, "clearAdvantageCombatLeave")) {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.updateAdvantage(token, "clear", "deleteCombatant");
        Advantage.unsetFlags([combatant])
    } 
});

Hooks.on("wfrp4e:applyDamage", async function(scriptArgs) {  
    GMToolkit.log(false, scriptArgs)    
    if (!scriptArgs.opposedTest.defenderTest.context.unopposed) return // Only apply when Outmanouevring (ie, damage from an unopposed test). 
    if (!game.settings.get(GMToolkit.MODULE_ID, "automateDamageAdvantage")) return 
    if (!inActiveCombat(scriptArgs.opposedTest.attackerTest.actor) | !inActiveCombat(scriptArgs.opposedTest.defenderTest.actor)) return // Exit if either actor is not in the active combat

    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.Outmanoeuvre",{actorName: scriptArgs.actor.name, attackerName: scriptArgs.attacker.name, totalWoundLoss: scriptArgs.totalWoundLoss} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications")};

    if (game.user.isGM) {ui.notifications.notify(message, type, options)}
    GMToolkit.log(true,uiNotice)

    // Clear advantage on actor that has taken damage
    var character = scriptArgs.actor.data.token
    await Advantage.updateAdvantage(character,"clear","wfrp4e:applyDamage" );

    // Increase advantage on actor that dealt damage, as long as it has not already been updated for this test
    var character = scriptArgs.attacker.data.token
    if (character.document.getFlag(GMToolkit.MODULE_ID, 'advantage')?.outmanoeuvre != scriptArgs.opposedTest.attackerTest.message.id) {
        await Advantage.updateAdvantage(character,"increase","wfrp4e:applyDamage");
        await character.document.setFlag(GMToolkit.MODULE_ID, 'advantage', {outmanoeuvre: scriptArgs.opposedTest.attackerTest.message.id});
        console.log(character, character.document.getFlag(GMToolkit.MODULE_ID, 'advantage'))
    } else {
        console.log(`Advantage increase already applied to ${character.name} for outmanoeuvring.`)
    }

    GMToolkit.log(false,`Outmanoeuvring Advantage: Finished.`)
});


Hooks.on("wfrp4e:opposedTestResult", async function(opposedTest, attackerTest, defenderTest) {  
    GMToolkit.log(false, opposedTest, attackerTest, defenderTest)
    if (defenderTest.context.unopposed) return // Unopposed Test. Advantage from outmanouevring is handled if damage is applied (on wfrp4e:applyDamage hook)
    if (!game.settings.get(GMToolkit.MODULE_ID, "automateOpposedTestAdvantage")) return 
    
    let attacker = attackerTest.actor
    let defender = defenderTest.actor
    if (!inActiveCombat(attacker) | !inActiveCombat(defender)) return // Exit if either actor is not in the active combat

    let winner = opposedTest.result.winner == "attacker" ? attacker : defender
    let loser = opposedTest.result.winner == "attacker" ? defender : attacker

    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.OpposedTest",{winner: winner.name, loser: loser.name} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications")};

    if (game.user.isGM) {ui.notifications.notify(message, type, options)}
    GMToolkit.log(false,uiNotice)

    // Clear advantage on actor that has lost opposed test
    var character = loser.data.token
    await Advantage.updateAdvantage(character,"clear","wfrp4e:opposedTestResult" );

    // Increase advantage on actor that has won opposed test, as long as it has not already been updated for this test
    var character = winner.data.token
    if (character.document.getFlag(GMToolkit.MODULE_ID, 'advantage')?.opposed != opposedTest.attackerTest.message.id) {
        await Advantage.updateAdvantage(character,"increase","wfrp4e:opposedTestResult");
        await character.document.setFlag(GMToolkit.MODULE_ID, 'advantage', {opposed: opposedTest.attackerTest.message.id});
        console.log(character, character.document.getFlag(GMToolkit.MODULE_ID, 'advantage'))
    } else {
        console.log(`Advantage increase already applied to ${character.name} for winning opposed test.`)
    }

    GMToolkit.log(false,`Opposed Test Advantage: Finished.`)
});


// Intercept when an actor gets a condition during combat
Hooks.on("createActiveEffect", async function(conditionEffect) {  
    GMToolkit.log(false, conditionEffect)

    if (!conditionEffect.isCondition) return 
    let condId = conditionEffect.conditionId
    if (condId == "dead" || condId == "fear" || condId == "grappling") return // Exit if not a proper condition

    if (!game.settings.get(GMToolkit.MODULE_ID, "automateConditionAdvantage")) return 
	
    if (!inActiveCombat(conditionEffect.parent, "silent")) return
    
    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.Condition", {character: conditionEffect.parent.name, condition: condId} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications")};
    if (game.user.isGM) {ui.notifications.notify(message, type, options)}
    GMToolkit.log(false,uiNotice) 
        
    // Clear Advantage
    await Advantage.updateAdvantage(conditionEffect.parent.data.token,"clear", "createActiveEffect");
    
    GMToolkit.log(false,`Condition Advantage: Finished.`)
    
}); 

Hooks.on("preUpdateCombat", async function(combat, change) {
    if (!change.round || (!game.user.isUniqueGM)) return 
    
    let gainedAdvantage = game.combats.active.combatants.filter(a => (a.token.actor.getFlag('wfrp4e-gm-toolkit','advantage') && (a.token.actor.data.data.status?.advantage?.value > 0)))
    
    let noMomentum = game.combats.active.combatants.filter(a => (!a.token.actor.getFlag('wfrp4e-gm-toolkit','advantage') || !(a.token.actor.data.data.status?.advantage?.value > 0)))
    // TODO: if (noMomentum.length) await Advantage.loseMomentum()
    
    console.log(gainedAdvantage)
    if (gainedAdvantage.length) Advantage.unsetFlags(gainedAdvantage)
    
    let advFlagged = game.combats.active.combatants.filter(a => (a.token.actor.getFlag('wfrp4e-gm-toolkit','advantage')))
    GMToolkit.log(false, advFlagged)
    if (advFlagged.length) await Advantage.unsetFlags(advFlagged)

});

/* Hooks.on("updateCombat", async function (combat, change) {
    if (!change.turn  || (!game.user.isUniqueGM) ) return 
    if (combat.data.round != 0 && combat.turns && combat.data.active) {
        game.combats.active.combatants.filter(x => x.token.actor.setFlag('wfrp4e-gm-toolkit','advantage',{startOfTurn : x.token.actor.data.data.status?.advantage?.value}))
        console.log(game.combats.active.combatants.map(x => x.token.actor.getFlag('wfrp4e-gm-toolkit','advantage')))
        console.log('Logged initial Advantage')
    }
}); */
