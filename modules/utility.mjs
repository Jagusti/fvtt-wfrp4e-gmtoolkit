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
            talent = actor.items.find(i => i.data.name === game.i18n.localize("NAME.StrongMinded") )
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
            talent = actor.items.find(i => i.data.name === game.i18n.localize("NAME.Luck") )
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

    if (game.combats?.active?.combatants?.contents.filter(a => a.data.actorId == character.id) == false) {
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
    return [prefix, originalText.replace(/\s+/g, '')].join(joiner)
}


/** 
 * Return an array of users, actors, tokens or combatants that meet a certain criteria. 
 * @param {String} groupType :   game.users: users, gms, players, spectators, assigned
 * @param {String} groupType :   game.actors: actors, characters, party, company, entourage
 * @param {String} groupType :   game.tokens: tokens, nonparty, pcTokens, npcTokens, friends, enemies
 * @param {String} groupType :   game.combat.combatants: combatants, allies, adversaries
 * @param {Boolean} options.active   :   user is logged in and has character in selected group 
 * @param {Boolean} options.present  :   user is viewing scene or actor has token in scene 
 * @param {String} options.interaction  :   token is "selected" or "targeted" (ignored for game.users requests)
 * @return {Array} group     :   array of objects representing filtered group members
 **/ 
export function getGroup(groupType, options = []) {
    const active = options.active
    const present = options.present
    const interaction  = options.interaction

    let group = []
    let filteredByOption = []

    switch (groupType) {
        case ("users") :  // all users, including players and GMs
            group = Array.from(game.users)
            break;
        case ("gms") :  // only GM users
            group = game.users.filter(u => u.isGM)
            break;
        case ("players") :  // only player users
            group = game.users.players
            break;
        case ("spectators") : // only players that do not have characters assigned
            group = game.users.players.filter(u => !u.character)
            break;
        case ("assigned") :  // only players that have characters assigned
            group = game.users.players.filter(u => u.character)
            break;
        case ("actors") :  // all actors in the world
            group = Array.from(game.actors)
            break;
        case ("characters") :  // all characters in the world, including unassigned actors
            group = game.actors.filter(a => a.type === "character")            
            break;
        case ("party") :   // all player assigned characters in the world       
            group = game.users.filter(u => u.character).map(g => g.character)            
            break;
        case ("company") :  // all actors in the world owned by players, including characters, NPCs and creatures, but not vehicles
            group = game.actors.filter(a => a.hasPlayerOwner && a.type !== "vehicle")
            break; 
        case ("entourage") :  // all actors in the world owned by players, including characters, NPCs, vehicles and creatures
            group = game.actors.filter(a => a.hasPlayerOwner)            
            break;
        case ("nonparty") :  // all tokens in the scene whose actor is not owned by players, including characters, NPCs, vehicles and creatures
            group = game.canvas.tokens.placeables.filter(t => !t.actor.hasPlayerOwner)            
            break;
        case ("tokens") :  // all tokens in the scene
            group = Array.from(game.canvas.tokens.placeables)
            break;
        case ("pcTokens") :  // all player character tokens in the scene
            group = game.canvas.tokens.placeables.filter(t => t.actor.hasPlayerOwner && t.actor.type === "character")
            break;
        case ("npcTokens") :  // all non-vehicle tokens in the scene that are not player owned
            group = game.canvas.tokens.placeables.filter(t => !t.actor.hasPlayerOwner && t.actor.type !== "vehicle")
            break;
            break;
        case ("friends") :  // all player owned tokens or those with a friendly disposition
            group = game.canvas.tokens.placeables.filter(t => (t.actor.hasPlayerOwner || t.data.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY))
            break;
        case ("enemies") :  // all non-player owned tokens or those with a neutral or hostile disposition
            group = game.canvas.tokens.placeables.filter(t => !(t.actor.hasPlayerOwner || t.data.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY))
            break;
        case ("combatants") :  // all combatants in the active combat
            group = Array.from(game.combat.combatants)
            break;
        case ("allies") :  // all player owned characters in the active combat
            group = game.combat.combatants.filter(c => (c.hasPlayerOwner || c.token.data.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY))
            break;
        case ("adversaries") :  // all hostile non-player combatants in the active combat 
            group =  game.combat.combatants.filter(c => !(c.hasPlayerOwner || c.token.data.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY))
            break;
    }

    // Filter the group depending on whether the assigned player is online or offline
    if (group.length > 0 && active !== undefined) {
        const worldPCs = game.users.players.filter(u => u.character && u.active === active).map(u => u.character)
        filteredByOption.length = 0
        switch (groupType) {
            // game.users
            case ("users") :  // game.users
            case ("gms") :  // game.users
            case ("players") :  // game.users
            case ("spectators") :  // game.users
            case ("assigned") :  // game.users
                filteredByOption = (group.filter(g => g.active === active));
                break;
            // the rest: game.actors, game.tokens, game.combat.combatants
            case ("actors") : // game.actors
            case ("characters") : // game.actors
            case ("party") : // game.actors
            case ("entourage") : // game.actors
            case ("company") : // game.actors
            case ("tokens") :  // game.tokens
            case ("nonparty") :  // game.tokens
            case ("pcTokens") :  // game.tokens
            case ("npcTokens") :  // game.tokens
            case ("friends") :  // game.tokens
            case ("enemies") :  // game.tokens
            case ("combatants") :  // game.combat.combatants
            case ("allies") :  // game.combat.combatants
            case ("adversaries") :  // game.combat.combatants
                worldPCs.forEach(wPC => {
                    filteredByOption.push(group.filter(g => 
                        g?.actor === wPC ||  // combatants, tokens
                        g === wPC)  // actors
                    [0]);  
                })
                break;
            default : 
                break;
        }
        group.splice(0, group.length, ...filteredByOption)
    }

    // Filter the group depending on scene presence
    // users: user viewedScene is game viewed scene
    // actors: have token in scene
    // token, combatants: no change to group: these only exist on a scene
    if (group.length > 0 && present !== undefined) {
        filteredByOption.length = 0
        switch (groupType) {
            // game.users
            case ("users") :  // game.users
            case ("gms") :  // game.users
            case ("players") :  // game.users
            case ("spectators") :  // game.users
            case ("assigned") :  // game.users
                filteredByOption = present ? (group.filter(g => g.viewedScene === game.scenes.viewed.id)) : (group.filter(g => g.viewedScene !== game.scenes.viewed.id));
                break;
            // game.actors
            case ("actors") : // game.actors
            case ("characters") : // game.actors
            case ("party") : // game.actors
            case ("company") : // game.actors
            case ("entourage") : // game.actors
                group.forEach(a => {
                    if (present == (a.getActiveTokens().length > 0)) {
                        filteredByOption.push(a);  
                    }
                })
                break;
            // game.tokens
            case ("tokens") :  // game.tokens
            case ("nonparty") :  // game.tokens
            case ("pcTokens") :  // game.tokens
            case ("npcTokens") :  // game.tokens
            case ("friends") :  // game.tokens
            case ("enemies") :  // game.tokens
            // game.combat.combatants
            case ("combatants") :  // game.combat.combatants
            case ("allies") :  // game.combat.combatants
            case ("adversaries") :  // game.combat.combatants
            default : 
                if (present) {
                    filteredByOption.splice(0, group.length, ...group)
                }
                break;
        }        
        filteredByOption ? group.splice(0, group.length, ...filteredByOption) : group.length = 0;
    }

    
    if (group.length > 0 && interaction !== undefined) {
        filteredByOption.length = 0
        let hasInteraction = []
        if (interaction === "selected") hasInteraction = game.canvas.tokens.controlled
        if (interaction === "targeted") hasInteraction = game.canvas.tokens.placeables.filter(t => t.isTargeted)
        switch (groupType) {
            // game.users
            case ("users") :  // game.users
            case ("gms") :  // game.users
            case ("players") :  // game.users
            case ("spectators") :  // game.users
            case ("assigned") :  // game.users
                break;
            // game.actors
            case ("actors") : // game.actors
            case ("characters") : // game.actors
            case ("party") : // game.actors
            case ("company") : // game.actors
            case ("entourage") : // game.actors
                filteredByOption = hasInteraction.filter(i => group.includes(i.actor)).map(m => m.actor)
                break;
            // game.tokens
            case ("tokens") :  // game.tokens
            case ("nonparty") :  // game.tokens
            case ("pcTokens") :  // game.tokens
            case ("npcTokens") :  // game.tokens
            case ("friends") :  // game.tokens
            case ("enemies") :  // game.tokens
                filteredByOption = hasInteraction.filter(i => group.includes(i))
                break;
            // game.combat.combatants
            case ("combatants") :  // game.combat.combatants
            case ("allies") :  // game.combat.combatants
            case ("adversaries") :  // game.combat.combatants
                filteredByOption = hasInteraction.filter(i => group.includes(i.combatant)).map(m => m.combatant)
                break;
            default : 
                break;
        }        
        filteredByOption ? group.splice(0, group.length, ...filteredByOption) : group.length = 0;
    }

    GMToolkit.log(false, group)
    return group;
}


/** 
 * Compile all items of a particular type from compendium packs. 
 * @param {Array}  itemType  :  Name of item type, eg, "skill", "talent", "trait"
 * @param {Boolean}  rollable  :  For traits, only include if rollable
 * @return {Array}  Alphabetically sorted list of items
 **/ 
 export async function compileItems(itemType = ["skill"], rollable = undefined) {
    let items = [];
    for (let p of game.packs.filter(p => p.metadata.type === "Item")) {
        await p.getDocuments().then(content => {
            itemType.forEach(t => {
                if (t === "trait" && rollable !== undefined ) {
                    items.push(...content.filter(i => i.type === t && i?.rollable?.value === rollable))
                } else {
                    items.push(...content.filter(i => i.type === t))
                }
            })
        })
    }
    items = items.sort((a, b) => (a.name > b.name) ? 1 : -1);
    return items
}

