import GMToolkit from "./gm-toolkit.mjs";

/** 
 * Returns whether an actor has the skill to be tested.
 * @param {Object} actor 
 * @param {String} targetSkill  :   Name of skill to be tested.
 * @param {String} notification :   "silent" suppresses UI notification, "persist" makes notifications stick until dismissed
 * @return {Object} skill       :   The skill object to be tested.
**/ 
// TODO: Review notifications, maybe optionally pass these out to a notification handler
export function hasSkill (actor, targetSkill, notification = true) {
    // Match exact skill only
    let skill = actor.items.find(i => i.type == "skill" && i.data.name === game.i18n.localize(targetSkill)) 
    if (skill == null) {
        let message = `${actor.name} does not have the ${targetSkill} skill.`;
        GMToolkit.log(false, message)
        if (notification != "silent") {
            (notification == "persist") ? ui.notifications.error(message, {permanent : true}) : ui.notifications.error(message) 
        }
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


/** 
 * Get session management parameters date and time based on world settings. 
 * @return {String} date    :   Date in yyyy-mm-dd format based on Next Session date, as set through Edit World settings. Empty if not defined.
 * @return {String} time    :   Time in hh:mm:ss.000Z format based on Next Session date, as set through Edit World settings. Empty if not defined.
 * @return {String} id      :   Session number or reference set through Session Management Options in module settings
 **/ 
export function getSession() {
    let date = "", time = ""
    let id = game.settings.get("wfrp4e-gm-toolkit", "sessionID")
    if (game.world.data.nextSession != null) {
        date = game.world.data.nextSession?.split("T")[0] 
        time = game.world.data.nextSession?.split("T")[1]  
    }
    return {date, time, id}
}


/** 
 * Check characters are in combat. 
 * @param {Object} character    :   Actor object of the character
 * @param {String} notification :   "silent" suppresses UI notification //, "persist" makes notifications stick until dismissed
 * @return {Boolean}       :   
 **/ 
export function inActiveCombat(character, notification = true) {
    let inActiveCombat = true

    if (game.combats.active.combatants.contents.filter(a => a.data.actorId == character.id) == false) {
        inActiveCombat = false
        let message = (`${game.i18n.format("GMTOOLKIT.Advantage.NotInCombat",{actorName: character.name, sceneName : game.scenes.viewed.name})}`);
        if (notification != "silent") {
            (notification == "persist") ? ui.notifications.error(message, {permanent : true}) : ui.notifications.error(message) 
        } else {
            GMToolkit.log(true, message)
        }
    }
    return inActiveCombat
}

/** 
 * Delete and re-import GM Toolkit macros  
 * @param {String} documentType    :   Actor object of the character
 **/ 
export async function refreshToolkitContent(documentType) {

    let toolkitContent = []

    switch (documentType) {
        case "Macro" :
            // delete macros
            await Macro.deleteDocuments(game.macros.filter(m=>m.folder?.name==GMToolkit.MODULE_NAME).map(m=>m.id))
            // delete Macro folder 
            await Folder.deleteDocuments(game.folders.filter(f => f.name == GMToolkit.MODULE_NAME && f.type == "Macro").map(f => f.id)) 
            // import macros from compendium
            toolkitContent = await game.packs.get(`${GMToolkit.MODULE_ID}.gm-toolkit-macros`).importAll({
                folderName:  GMToolkit.MODULE_NAME,
                options: {keepId : true}
            });
            break;
        case "RollTable" :
            // delete tables within GM Toolkit directory
            await RollTable.deleteDocuments(game.tables.filter(t=>t.folder?.name==GMToolkit.MODULE_NAME).map(t=>t.id))
            // delete RollTable folder
            await Folder.deleteDocuments(game.folders.filter(f => f.name == GMToolkit.MODULE_NAME && f.type == "RollTable").map(f => f.id)) 
            // import tables from compendium
            toolkitContent = await game.packs.get(`${GMToolkit.MODULE_ID}.gm-toolkit-tables`).importAll({
                folderName:  GMToolkit.MODULE_NAME,
                options: {keepId : true}
            });
            break;
    }
    
    GMToolkit.log(false, toolkitContent) 

}

/** 
 * Remove all leading, trailing and internal whitespace from a string. 
 * Typical use is in constructing localization strings from, eg, macro names
 * @param {String} originalText    :   string from which to remove all whitespace
 * @param {String} prefix          :   optional prefix for building string
 * @param {String} joiner          :   optional joining character to connect prefix and stripped string
 * @return {String} 
 **/ 
 export function strip(originalText, prefix = "", joiner = "") {
    return (prefix + joiner + originalText.replace(/\s+/g, ''))
}
