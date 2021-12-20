import GMToolkit from "./gm-toolkit.mjs";

/** 
 * Returns whether an actor has the skill to be tested.
 * @param {Object} actor 
 * @param {String} targetSkill  :   Name of skill to be tested.
 * @return {Object} skill       :   The skill object to be tested.
**/ 
// TODO: Review notifications, maybe optionally pass these out to a notification handler
export function hasSkill (actor, targetSkill) {
    // Match exact skill only
    let skill = actor.items.find(i => i.type == "skill" && i.data.name === game.i18n.localize(targetSkill)) 
    if (skill == null) {
        let message = `${actor.name} does not have the ${targetSkill} skill. Aborting skill test. `;
        GMToolkit.log(false, message)
        ui.notifications.error(message) 
    } else {
        GMToolkit.log(false, `${actor.name} has the ${game.i18n.localize(targetSkill)} skill.`) 
    }
    return (skill);
}

/** 
 * Increase or reduce the status value. Re-render the Token Hud is shown.
 * @param {Object} actor        
 * @param {String} status   :   Status characteristic to be adjusted
 * @param {Number} change   :   Amount to increase or decrease status value. Typically 1 or-1.
 * @return {String} result  :   Message confirming outcome of adjustment
**/ 
// TODO: Review notifications, maybe optionally pass these out to a notification handler, independent of Token Hud Extension
export async function adjustStatus (actor, status, change) {
    let originalStatus = Number(actor.data.data.status[status.toLowerCase()].value);
    let newStatus = Number();
    let maxStatus = getMaxStatus(actor, status);
    let result = ""

    switch (status.toLowerCase())
    {
        case "resolve":
            (Number(change) < 0) ? newStatus = Math.max((originalStatus + Number(change)),0) : newStatus = Math.min((originalStatus + Number(change)),maxStatus)
            await actor.update({
                "data.status.resolve.value": newStatus
            })
            break;    
        case "sin":
            newStatus = Math.max((originalStatus + Number(change)),0)
            await actor.update({
                "data.status.sin.value": newStatus
            })
            break;
        case "corruption":
            newStatus = Math.max((originalStatus + Number(change)),0)
            await actor.update({
                "data.status.corruption.value": newStatus
            })
            // TODO: Prompt for Challenging Endurance Test (WFRP p183) if max Corruption threshold is exceeded
            // if (newStatus > maxStatus) ...
            break;
        case "fortune":
            (Number(change) < 0) ? newStatus = Math.max((originalStatus + Number(change)),0) : newStatus = Math.min((originalStatus + Number(change)),maxStatus)
            await actor.update({
                "data.status.fortune.value": newStatus
            })
            break;     
    }

    if (Number(originalStatus) != Number(newStatus)) {
        result = game.i18n.format("GMTOOLKIT.TokenHudExtension.StatusChanged",{targetStatus: (game.i18n.localize(status)), targetName: actor.data.name, originalStatus, newStatus} );
    } else {
        result = game.i18n.format("GMTOOLKIT.TokenHudExtension.StatusNotChanged",{targetStatus: (game.i18n.localize(status)), targetName: actor.data.name, originalStatus} );
    }
    
    ChatMessage.create(game.wfrp4e.utility.chatDataSetup(result));
    // UI notification to confirm outcome
    ui.notifications.notify(result) 
    canvas.hud.token.render();
    return(result)
}  


/** 
 * Returns the calculated maximum value for different Status values. 
 * @param {Object} actor        
 * @param {String} status       Resolve, Fortune, Corruption. Other status options passed will return 0. 
 * @return {Number} maxStatus   The skill object to be tested.
**/ 
function getMaxStatus(actor,status) {
    let maxStatus = 0
    let talent = []

    switch (status.toLowerCase())
    {
        case "resolve":
            talent = actor.items.find(i => i.data.name === game.i18n.localize("GMTOOLKIT.Talent.StrongMinded") )
            maxStatus = actor.data.data.status.fate.value + statusBoosts(talent);
            break;  
        case "corruption":
            if (actor.data.flags.autoCalcCorruption) {
                maxStatus = actor.data.data.status.corruption.max
            } else {
                talent = actor.items.find(i => i.data.name === game.i18n.localize("NAME.PS") )
                maxStatus = actor.data.data.characteristics.t.bonus + actor.data.data.characteristics.wp.bonus + statusBoosts(talent);
            }
            break;
        case "fortune":
            talent = actor.items.find(i => i.data.name === game.i18n.localize("GMTOOLKIT.Talent.Luck") )
            maxStatus = actor.data.data.status.fate.value + statusBoosts(talent);
            break;     
    }

return(maxStatus)

/** 
 * Internal function to getMaxStatus(). 
 * Tallies the number of advances in a talent the actor has, across all owned item instances of the talent. 
 * @param {Object} talent        
 * @return {Number} talentAdvances  
**/ 
    function statusBoosts(talent) {
        console.log(talent)
        let talentAdvances = Number();
        if (talent == undefined || talent.data.data.advances.value < 1) {
            talentAdvances = 0;
        } else {
            for (let item of actor.items) {
                if (item.type == "talent" && item.name == talent.name) {
                    talentAdvances += item.data.data.advances.value;
                }
            }
        }
        console.log(talentAdvances)
        return talentAdvances;
    }
}