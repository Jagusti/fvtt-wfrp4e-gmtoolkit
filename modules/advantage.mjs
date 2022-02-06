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
        let options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")};

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

} // End Class

Hooks.on("createCombatant", function(combatant) {
    if (game.settings.get("wfrp4e-gm-toolkit", "clearAdvantageCombatJoin")) {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.updateAdvantage(token, "clear", "createCombatant");
    } 
});

Hooks.on("deleteCombatant", function(combatant) {
    if (game.settings.get("wfrp4e-gm-toolkit", "clearAdvantageCombatLeave")) {
        let token = canvas.tokens.placeables.filter(a => a.data._id == combatant.data.tokenId)[0]
        Advantage.updateAdvantage(token, "clear", "deleteCombatant");
    } 
});

Hooks.on("wfrp4e:applyDamage", async function(scriptArgs) {  
    GMToolkit.log(false, scriptArgs)    
    if (!scriptArgs.opposedTest.defenderTest.context.unopposed) return // Only apply when Outmanouevring (ie, damage from an unopposed test). 
    if (!game.settings.get("wfrp4e-gm-toolkit", "automateDamageAdvantage")) return 
    if (!inActiveCombat(scriptArgs.opposedTest.attackerTest.actor) | !inActiveCombat(scriptArgs.opposedTest.defenderTest.actor)) return // Exit if either actor is not in the active combat

    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.Outmanoeuvre",{actorName: scriptArgs.actor.name, attackerName: scriptArgs.attacker.name, totalWoundLoss: scriptArgs.totalWoundLoss} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")};

    if (game.user.isGM) {ui.notifications.notify(message, type, options)}
    GMToolkit.log(true,uiNotice)

    // Clear advantage on actor that has taken damage
    var character = scriptArgs.actor.data.token
    await Advantage.updateAdvantage(character,"clear","wfrp4e:applyDamage" );

    // Increase advantage on actor that dealt damage
    var character = scriptArgs.attacker.data.token
    await Advantage.updateAdvantage(character,"increase","wfrp4e:applyDamage");

    GMToolkit.log(false,`Outmanoeuvring Advantage: Finished.`)
});


Hooks.on("wfrp4e:opposedTestResult", async function(opposedTest, attackerTest, defenderTest) {  
    GMToolkit.log(false, opposedTest, attackerTest, defenderTest)
    if (defenderTest.context.unopposed) return // Unopposed Test. Advantage from outmanouevring is handled if damage is applied (on wfrp4e:applyDamage hook)
    if (!game.settings.get("wfrp4e-gm-toolkit", "automateOpposedTestAdvantage")) return 
    
    let attacker = attackerTest.actor
    let defender = defenderTest.actor
    if (!inActiveCombat(attacker) | !inActiveCombat(defender)) return // Exit if either actor is not in the active combat

    let winner = opposedTest.result.winner == "attacker" ? attacker : defender
    let loser = opposedTest.result.winner == "attacker" ? defender : attacker

    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.OpposedTest",{winner: winner.name, loser: loser.name} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")};

    if (game.user.isGM) {ui.notifications.notify(message, type, options)}
    GMToolkit.log(false,uiNotice)

    // Clear advantage on actor that has lost opposed test
    var character = loser.data.token
    await Advantage.updateAdvantage(character,"clear","wfrp4e:opposedTestResult" );

    // Increase advantage on actor that has won opposed test
    var character = winner.data.token
    await Advantage.updateAdvantage(character,"increase","wfrp4e:opposedTestResult");

    GMToolkit.log(false,`Opposed Test Advantage: Finished.`)
});


// Intercept when an actor gets a condition during combat
Hooks.on("createActiveEffect", async function(conditionEffect) {  
    GMToolkit.log(false, conditionEffect)

    if (!conditionEffect.isCondition) return 
    let condId = conditionEffect.conditionId
    if (condId == "dead" || condId == "fear" || condId == "grappling") return // Exit if not a proper condition

    if (!game.settings.get("wfrp4e-gm-toolkit", "automateConditionAdvantage")) return 
	
    if (!inActiveCombat(conditionEffect.parent, "silent")) return
    
    let uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.Condition", {character: conditionEffect.parent.name, condition: condId} )}`
    let message = uiNotice
    let type = "info"
    let options = {permanent: game.settings.get("wfrp4e-gm-toolkit", "persistAdvantageNotifications")};
    if (game.user.isGM) {ui.notifications.notify(message, type, options)}
    GMToolkit.log(false,uiNotice) 
        
    // Clear Advantage
    await Advantage.updateAdvantage(conditionEffect.parent.data.token,"clear", "createActiveEffect");
    
    GMToolkit.log(false,`Condition Advantage: Finished.`)
    
}); 