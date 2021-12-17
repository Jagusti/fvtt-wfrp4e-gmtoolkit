import GMToolkit from './gm-toolkit.mjs'

/** 
 * Returns whether an actor has the skill to be tested.
 * @param {Object} actor 
 * @param {String} targetSkill - Name of skill to be tested.
 * @return {Object} The skill object to be tested.
**/ 
export function hasSkill (actor, targetSkill) {
    // Match exact skill only
    let skill = actor.items.find(i => i.type == "skill" && i.data.name === game.i18n.localize(targetSkill)) 
    if (skill == null) {
        let message = `${actor.name} does not have the ${targetSkill} skill. Aborting skill test. `;
        console.log(`${GMToolkit.MODULE_NAME} | ${message}`)
        ui.notifications.error(message) 
    } else {
        console.log(`${GMToolkit.MODULE_NAME} | ${actor.name} has the ${game.i18n.localize(targetSkill)} skill.`) 
    }
    return (skill);
}

/** 
 * Increase or reduce the status value from the Token Hud
 * @param {Object} actor        
 * @param {String} status - Characteristic to be adjusted
 * @param {Number} [1|-1] - increase or decrease value for status
**/ 
export async function adjustStatus (actor, status, change) {
    let originalStatus = Number();
    let newStatus = Number();
    let result = ""
   
    switch (status)
    {
        case "Resolve":
            originalStatus = actor.data.data.status.resolve.value
            if (Number(change) < 0) {
                newStatus = Math.max((originalStatus + Number(change)),0)
            } else {
                let item = actor.items.find(i => i.data.name === game.i18n.localize("GMTOOLKIT.Talent.StrongMinded") )
                let advStrongMinded = Number();
                if(item == undefined || item.data.data.advances.value < 1) {
                    advStrongMinded = 0;
                    } else { 
                        for (let item of actor.items)
                            {
                            if (item.type == "talent" && item.name == game.i18n.localize("GMTOOLKIT.Talent.StrongMinded"))
                                {
                                    advStrongMinded += item.data.data.advances.value;
                                }
                            }
                    }
                let maxStatus = actor.data.data.status.resilience.value + advStrongMinded
                newStatus = Math.min((originalStatus + Number(change)),maxStatus)
            }
            await actor.update({
                "data.status.resolve.value": newStatus
            })
            break;    
        case "Sin":
            originalStatus = actor.data.data.status.sin.value
            if (Number(change) < 0) {
                newStatus = Math.max((originalStatus + Number(change)),0);
            } else {
                newStatus = Number(originalStatus + Number(change));
            }
            await actor.update({
                "data.status.sin.value": newStatus
            })
            break;
        case "Corruption":
            originalStatus = actor.data.data.status.corruption.value
            if (Number(change) < 0) {
                newStatus = Math.max((originalStatus + Number(change)),0)
            } else {
                    let maxStatus = actor.data.data.status.corruption.max
                    newStatus = Math.min((originalStatus + Number(change)),maxStatus)
                    // TODO: Post Corruption Test if max Corruption threshold is exceeded
                    // game.wfrp4e.utility.postCorruptionTest("moderate")
                }
            await actor.update({
                "data.status.corruption.value": newStatus
            })
            break;
        case "Fortune":
            originalStatus = actor.data.data.status.fortune.value
            if (Number(change) < 0) {
                newStatus = Math.max((originalStatus + Number(change)),0)
            } else {
                    let item = actor.items.find(i => i.data.name === game.i18n.localize("GMTOOLKIT.Talent.Luck") )
                    let advLuck = Number();
                    if(item == undefined || item.data.data.advances.value < 1) {
                        advLuck = 0;
                        } else { 
                            for (let item of actor.items)
                                {
                                if (item.type == "talent" && item.name == game.i18n.localize("GMTOOLKIT.Talent.Luck"))
                                    {
                                        advLuck += item.data.data.advances.value;
                                    }
                                }
                        }
                    let maxStatus = actor.data.data.status.fate.value + advLuck
                    newStatus = Math.min((originalStatus + Number(change)),maxStatus)
                }
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