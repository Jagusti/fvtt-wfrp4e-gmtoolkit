import GMToolkit from "./gm-toolkit.mjs";
import { inActiveCombat } from "./utility.mjs";

export default class Advantage {

    
/** 
 * Entry point for adjustments to Advantage through . 
 * @param {Object} character   :   Token, Actor. Combatant is passed in as Token.
 * @param {String} adjustment  :   increase (+1), clear (=0), reduce (-1)
 * @param {String} context     :   macro, wfrp4e:opposedTestResult, wfrp4e:applyDamage, createCombatant, deleteCombatant, createActiveEffect, loseMomentum
 * @return {Array} update      :   outcome (String: increased, reduced, min, max, reset, no change), 
 *                                 starting (Number: what the character's Advantage was at the start of the routine)
 *                                 new (Number: what the character's Advantage is at the end of the routine)
 **/ 
    static async update(character, adjustment, context = "macro") {    
        // Guards
        if (character === undefined) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
        if (character?.document?.documentName == "Token") {
            if (context == "macro" && canvas.tokens.controlled.length != 1) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
            if (!character.inCombat && (adjustment != "clear")) return ui.notifications.error(`${game.i18n.format("GMTOOLKIT.Advantage.NotInCombat",{actorName: character.name, sceneName : game.scenes.viewed.name})}`);
        } 

        // Find current and max Advantage for token or actor. 
        let resourceBase = []
        resourceBase = await this.get(character, resourceBase, adjustment);
        GMToolkit.log(false,resourceBase)
        
        // Make the adjustment to the token actor and capture the outcome
        let updatedAdvantage = await this.adjust(character, resourceBase, adjustment);
        
        // Report the outcome to the user
        let update = await this.report(updatedAdvantage, character, resourceBase, context)
        update.outcome = updatedAdvantage.outcome
        update.new = updatedAdvantage.new
        update.starting = updatedAdvantage.starting
        GMToolkit.log(false, update)
        return (update)
    }

    static async get(character, resourceBase, adjustment) {
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

    static async adjust (character, advantage, adjustment) {
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

    static async report(updatedAdvantage, character, resourceBase, context) {
        let update = []
        let type = "info";
        let options = {permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications")};

        switch (context) {
            case "wfrp4e:opposedTestResult": 
                if (updatedAdvantage.outcome == "increased") update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.WonOpposedTest", { actorName: character.name});
                if (updatedAdvantage.outcome == "reset") update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.LostOpposedTest", { actorName: character.name});
                break;
            case "loseMomentum" : 
                update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.LoseMomentum", { actorName: character.name});
                break;
            case "createCombatant" : 
                update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.AddedToCombat", { actorName: character.name});
                break;
            case "deleteCombatant" : 
                update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.RemovedFromCombat", { actorName: character.name});
                break;
        }

        switch (updatedAdvantage.outcome) {
            case "increased":
                update.notice = game.i18n.format("GMTOOLKIT.Advantage.Increased", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
                break;
            case "reduced":
                update.notice = game.i18n.format("GMTOOLKIT.Advantage.Reduced", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new });
                break;
            case "reset":
                update.notice = game.i18n.format("GMTOOLKIT.Advantage.Reset", { actorName: character.name, startingAdvantage: updatedAdvantage.starting });
                break;
            case "min":
                update.notice = game.i18n.format("GMTOOLKIT.Advantage.None", { actorName: character.name, startingAdvantage: updatedAdvantage.starting });
                break;
            case "max":
                update.notice = game.i18n.format("GMTOOLKIT.Advantage.Max", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, maxAdvantage: resourceBase.max });
                break;
            case "nochange":
            default:
                update.notice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange");
                break;
        }

        let message = (update.context ? update.context : "") + update.notice
        if (game.user.isGM) {ui.notifications.notify(message, type, options)} 
        GMToolkit.log(true, update);
        // Force refresh the token hud if it is visible
        if (character.hasActiveHUD) {await canvas.hud.token.render(true);}
        update.context = (update.context) ? update.context : context 
        return(update)
    }

    // Clears flags set for increasing token Advantage during combat
    static unsetFlags(advantaged, startOfRound = false) {
        advantaged.filter(a => a.token.actor.unsetFlag("wfrp4e-gm-toolkit","advantage"))
        if (startOfRound) advantaged.filter(a => a.token.actor.unsetFlag("wfrp4e-gm-toolkit","sorAdvantage"))
        GMToolkit.log(false,`Advantage Flags: Unset.`)
    }

    static async loseMomentum(combat, round) {
        let checkNotGained = ""; // list of tokens that have not accrued advantage
        let checkGained = ""; // list of tokens that have accrued advantage
        let noAdvantage = ""; // list of tokens that have no advantage at the end of the round
        let combatantLine = ""; // html string for constructing dialog
        let combatantAdvantage = [];
        
        combat.combatants.forEach(combatant => {
            combatantAdvantage.startOfRound = combatant.token.actor.getFlag("wfrp4e-gm-toolkit","sorAdvantage")
            combatantAdvantage.endOfRound = combatant.token.actor.data.data.status?.advantage?.value;
            let checkToLoseMomentum = (combatantAdvantage.endOfRound - combatantAdvantage.startOfRound > 0) ? false : "checked"
            
            // TODO: Define and replace the inline styles within the stylesheet
            if (!combatantAdvantage.endOfRound) {
                noAdvantage += `<img src="${combatant.img}" style = "height: 2rem; border: none; padding-right: 2px; padding-left: 2px;" alt="${combatant.name}" title="${combatant.name}">&nbsp;${combatant.name}</img>`
            } else {
                combatantLine = `
                <div class="form-group">
                <input type="checkbox" id="${combatant.data.tokenId}" name="${combatant.data.tokenId}" value="${combatant.name}" ${checkToLoseMomentum}> 
                <img src="${combatant.img}" style = "height: 2rem; vertical-align : middle; border: none; padding-right: 6px; padding-left: 2px;" />
                <label for="${combatant.data.tokenId}" style = "text-align: left;  border: none;">  <strong>${combatant.name}</strong></label>
                <label for="${combatant.data.tokenId}"  style = "text-align: left;  border: none;"> ${combatantAdvantage.startOfRound} -> ${combatantAdvantage.endOfRound} </label>
                </div>
                `;
                (checkToLoseMomentum) ? checkNotGained += combatantLine : checkGained += combatantLine;
            }            
        });

        // Exit without prompt if no combatant has Advantage to lose
        if (checkGained == "" && checkNotGained == "") {
            let uiNotice = game.i18n.format("GMTOOLKIT.Message.Advantage.NoCombatantsWithAdvantage", {combatRound: round}) 
            if (game.user.isGM) {ui.notifications.notify(uiNotice, "info", {permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications")})} 
            GMToolkit.log(true, uiNotice);
            return
        }
        
        // Explain empty dialog sections
        if (checkGained == "") checkGained = `<div class="form-group">${game.i18n.localize("GMTOOLKIT.Message.Advantage.NoCombatantsAccruedAdvantage")}</div>`;
        if (checkNotGained == "") checkNotGained = `<div class="form-group">${game.i18n.localize("GMTOOLKIT.Message.Advantage.NoCombatantsNotAccruedAdvantage")}</div>`;
        if (noAdvantage == "") noAdvantage = game.i18n.localize("GMTOOLKIT.Message.Advantage.NoCombatantsWithoutAdvantage");
        
        let templateData = {'gained' : checkGained, 'notgained' : checkNotGained , 'none' : noAdvantage}
        const dialogContent = await renderTemplate("modules/wfrp4e-gm-toolkit/templates/gm-toolkit-advantage-momentum.html", templateData)
        let lostAdvantage = ""
    
        new Dialog({
            title: game.i18n.format("GMTOOLKIT.Dialog.Advantage.LoseMomentum.Title", {combatRound: round}),
            content: dialogContent,
            buttons: {
                reduceAdvantage: {
                    label: game.i18n.localize("GMTOOLKIT.Dialog.Advantage.LoseMomentum.Button"),
                    callback: async (html) => {
                        // reduce advantage for selected combatants
                        for ( let combatant of combat.combatants ) {
                            if (html.find(`[name="${combatant.data.tokenId}"]`)[0]?.checked){
                                let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
                                let result = await this.update(token, 'reduce', 'loseMomentum')
                                lostAdvantage += `${token.name}: ${result.starting} -> ${result.new} <br/>`
                                }
                            }
                        // confirm changes made in whisper to GM
                        if (lostAdvantage != "") {
                            let chatData = game.wfrp4e.utility.chatDataSetup(lostAdvantage, "gmroll", false)
                            chatData.flavor = game.i18n.format("GMTOOLKIT.Message.Advantage.LostMomentum", {combatRound: round})
                            ChatMessage.create(chatData, {}); 
                            }                            
                        }
                    },
                    cancel: {
                      label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
                    },
                }
            }
        ).render(true);

        GMToolkit.log(false,`Lose Momentum at End of Round: Finished.`)
    
    }

} // End Class


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
    await Advantage.update(character,"clear","wfrp4e:applyDamage" );

    // Increase advantage on actor that dealt damage, as long as it has not already been updated for this test
    var character = scriptArgs.attacker.data.token
    if (character.document.getFlag(GMToolkit.MODULE_ID, 'advantage')?.outmanoeuvre != scriptArgs.opposedTest.attackerTest.message.id) {
        await Advantage.update(character,"increase","wfrp4e:applyDamage");
        await character.document.setFlag(GMToolkit.MODULE_ID, 'advantage', {outmanoeuvre: scriptArgs.opposedTest.attackerTest.message.id});
        console.log(character, character.document.getFlag(GMToolkit.MODULE_ID, 'advantage'))
    } else {
        console.log(`Advantage increase already applied to ${character.name} for outmanoeuvring.`)
    }

    GMToolkit.log(false,`Outmanoeuvring Advantage: Finished.`)
});


Hooks.on("wfrp4e:opposedTestResult", async function(opposedTest, attackerTest, defenderTest) {  
    GMToolkit.log(true, opposedTest, attackerTest, defenderTest)

    // Set Advantage flag if attacker and/or defender charged. Do this once before exiting for unopposed tests. 
    if (attackerTest.data.preData?.charging || attackerTest.data.result.other == game.i18n.localize("Charging")) await opposedTest.attacker.setFlag(GMToolkit.MODULE_ID, 'advantage', {charging: opposedTest.attackerTest.message.id});
    if (defenderTest.data.preData?.charging || defenderTest.data.result.other == game.i18n.localize("Charging")) await opposedTest.defender.setFlag(GMToolkit.MODULE_ID, 'advantage', {charging: opposedTest.attackerTest.message.id});

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
    await Advantage.update(character,"clear","wfrp4e:opposedTestResult" );

    // Increase advantage on actor that has won opposed test, as long as it has not already been updated for this test
    var character = winner.data.token
    if (character.document.getFlag(GMToolkit.MODULE_ID, 'advantage')?.opposed != opposedTest.attackerTest.message.id) {
        await Advantage.update(character,"increase","wfrp4e:opposedTestResult");
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
    
    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.Condition", {character: conditionEffect.parent.name, condition: conditionEffect.displayLabel} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications")};
    if (game.user.isGM) {ui.notifications.notify(message, type, options)}
    GMToolkit.log(false,uiNotice) 
        
    // Clear Advantage
    await Advantage.update(conditionEffect.parent.data.token,"clear", "createActiveEffect");
    
    GMToolkit.log(false,`Condition Advantage: Finished.`)
    
}); 


Hooks.on("createCombatant", function(combatant) {
    if (game.settings.get(GMToolkit.MODULE_ID, "clearAdvantageCombatJoin")) {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.update(token, "clear", "createCombatant");
        Advantage.unsetFlags([combatant])
    } 
});

Hooks.on("deleteCombatant", function(combatant) {
    if (game.settings.get(GMToolkit.MODULE_ID, "clearAdvantageCombatLeave")) {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.update(token, "clear", "deleteCombatant");
        Advantage.unsetFlags([combatant], true)
    } 
});

Hooks.on("preUpdateCombat", async function(combat, change) {
    if (!game.user.isUniqueGM || !combat.combatants.size || !change.round) return
    if (combat.round > change.round) return // Exit if going backwards through combat 

    // Check for momentum (actor has more Advantage at the end of the round than at start)
    if (game.settings.get(GMToolkit.MODULE_ID, "promptMomentumLoss")) {
        GMToolkit.log(false, "preUpdateCombat: compare Advantage at start and end of round")
        if (combat.previous.round != null || (combat.previous.round == null && combat.round > 0)) {
            let round = (change.turn) ? combat.previous.round : combat.current.round 
            if (round > 0) Advantage.loseMomentum(combat, round)
        }
    } 

    // Clear Advantage flags when the combat round changes
    console.log("preUpdateCombat: unsetting Advantage flags")
    let advFlagged = combat.combatants.filter(a => (a.token.actor.getFlag("wfrp4e-gm-toolkit","advantage")))
    if (advFlagged.length) await Advantage.unsetFlags(advFlagged)
});

Hooks.on("updateCombat", async function(combat, change) {
    if (!combat.round || !game.user.isUniqueGM || !combat.combatants.size) return     
    if (!change.round) return // Exit if this isn't the start of a round

    GMToolkit.log(false, "updateCombat: Setting startOfRound flag")
    if (combat.turns && combat.isActive) {
        combat.combatants.forEach (async c => {
            await c.token.actor.setFlag("wfrp4e-gm-toolkit","sorAdvantage", c.token.actor.data.data.status?.advantage?.value ?? 0);
            GMToolkit.log(false,`${c.name}:  ${c.token.actor.getFlag("wfrp4e-gm-toolkit","sorAdvantage") }`)
        });
    }    
});

Hooks.on("preDeleteCombat", async function(combat) {
    GMToolkit.log(false, "preDeleteCombat: clear Advantage flags")
    if (!game.user.isUniqueGM || !combat.combatants.size) return 
    let advFlagged = combat.combatants.filter(a => (a.token.actor.getFlag("wfrp4e-gm-toolkit","advantage")))
    if (advFlagged.length) await Advantage.unsetFlags(advFlagged)
    await Advantage.unsetFlags(combat.combatants, true)
});

