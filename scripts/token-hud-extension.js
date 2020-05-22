class TokenHudExtension {

    static async addMovementTokenTip(app, html, data) {

        let actor = game.actors.get(data.actorId);
        if (actor === undefined)
            return;

        // console.log("GM Toolkit Token Hud Extensions | Actor?", actor);
            
        const actorData = actor.data;
        const actorMoveDetails = actorData.data.details.move;

        let move = actorMoveDetails.value;
        let walk = actorMoveDetails.walk;
        let run = actorMoveDetails.run;
        let swim = actorMoveDetails.value / 2;

        let TooltipMovement = game.i18n.localize('Move') + ": " + move +"; " + game.i18n.localize('Walk') +": " + walk + "; " + game.i18n.localize('Run') + ": " + run + "; " + game.i18n.localize('Swim') + ": " + swim
        
        let divTokenHudExt = '<div class="tokenhudext left">';
        html.find('.attribute.elevation').wrap(divTokenHudExt);

        let hudMovement = '<div class="control-icon tokenhudicon left" title="' + TooltipMovement + '"><i class="fas fa-shoe-prints"></i> ' + run + '</div>';
        html.find('.attribute.elevation').before(hudMovement);

    }
    
    static async addInitiativeTokenTip(app, html, data) {
        
       // Do not show initiative token tip unless this is the active scene 
       // TODO: Make conditional visibility an option
       if (game.scenes.active.isView === false)
        return;

       let actor = game.actors.get(data.actorId);
       if (actor === undefined)
            return;

        // console.log("GM Toolkit Token Hud Extensions | Actor?", actor); 

       const actorCharacteristics = actor.data.data.characteristics;

       let initiative = actorCharacteristics.i.value;
       let agility = actorCharacteristics.ag.value;

       let TooltipInitiative = game.i18n.localize('CHAR.I') + ": " + initiative +"; " + game.i18n.localize('CHAR.Ag') +": " + agility

       let divTokenHudExt = '<div class="tokenhudext right">';
       html.find('.control-icon.combat').wrap(divTokenHudExt);

       let hudInitiative = '<div class="control-icon tokenhudicon right" title="' + TooltipInitiative + '"><i class="fas fa-spinner"></i> ' + initiative + '</div>';
       html.find('.control-icon.combat').after(hudInitiative);

   }

    static async addPlayerCharacterTokenTip(app, html, data) {

        let actor = game.actors.get(data.actorId);
        if (actor === undefined)
            return;
            
        // console.log("GM Toolkit Token Hud Extensions | Actor?", actor); 
        
        if (actor.data.type === "character") {
            
            // Set variables
            const actorData = actor.data;
            const actorStatus = actorData.data.status;
            const actorCharacteristics = actor.data.data.characteristics;
        
            let fortune = actorStatus.fortune.value 
            let fate = actorStatus.fate.value
            let resolve = actorStatus.resolve.value 
            let resilience = actorStatus.resilience.value
            let corruption = actorStatus.corruption.value
            let maxCorruption = actorStatus.corruption.max 
            let sin = actorStatus.sin.value
            let perception = actor.items.find(i => i.data.name === game.i18n.localize('Perception')  ).data.data.advances.value + actorCharacteristics.i.value
            let intuition = actor.items.find(i => i.data.name === game.i18n.localize('Intuition') ).data.data.advances.value + actorCharacteristics.i.value

            let TooltipFortune = game.i18n.localize('Fortune') + ": " + fortune +"; " + game.i18n.localize('Fate') +": " + fate
            let TooltipResolve = game.i18n.localize('Resolve') + ": " + resolve +"; " + game.i18n.localize('Resilience') +": " + resilience
            let TooltipCorruption = game.i18n.localize('Corruption') + ": " + corruption +" / " + maxCorruption + "; " + game.i18n.localize('Sin') +": " + sin
            let TooltipPerception = game.i18n.localize('Perception') + ": " + perception +"; " + game.i18n.localize('Intuition') +": " + intuition

            let divTokenHudExt = '<div class="tokenhudext left">';
            
            // Create space for Hud Extensions next to config icon
            // Resolve, Resilience, Fortune, Fate
            html.find('.control-icon.config').wrap(divTokenHudExt);

            // Resolve and Resilience
            let hudResolve = $(`<div class="control-icon tokenhudicon left" title="` + TooltipResolve + `"><i class="fas fa-hand-rock">&nbsp;` + resolve + `</i></div>`);
            html.find('.control-icon.config').before(hudResolve); // Add Resolve token tip

            // Fortune and Fate
            let hudFortune = $(`<div class="control-icon tokenhudicon left" title="` + TooltipFortune + `"><i class="fas fa-dice">&nbsp;` + fortune + `</i></div>`);
            html.find('.control-icon.config').before(hudFortune); // Add Fortune token tip

            // Create space for Hud Extensions next to target icon
            // Corruption, Sin, Perception, Intuition
            html.find('.control-icon.target').wrap(divTokenHudExt);

            // Corruption and Sin
            let hudCorruption = $(`<div class="control-icon tokenhudicon left" title="` + TooltipCorruption + `"><i class="fas fa-bahai">&nbsp;` + corruption + `</i></div>`);
            html.find('.control-icon.target').before(hudCorruption); // Add Corruption token tip

            // Perception and Intuition
            let hudPerception = $(`<div class="control-icon tokenhudicon left" title="` + TooltipPerception + `"><i class="fas fa-eye">&nbsp;` + perception + `</i></div>`);
            html.find('.control-icon.target').before(hudPerception); // Add Perception token tip
            // Add interactions for Perception and Intuition
            hudPerception.find('i').dblclick(async (ev) => {
                // console.log("GM Toolkit (WFRP4e) | Perception hud extension double-clicked.") 
                if (ev.altKey) {
                    if (hasSkill(actor, "Intuition") !== null) {
                        actor.setupSkill(skill.data);
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.ctrlKey) {
                    if (hasSkill(actor, "Perception") !== null) {
                        actor.setupSkill(skill.data);
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            })

        }
    }

}

/* 

*/ 
/** 
 * Returns whether an actor has the skill to be tested.
 * @param {Object} actor 
 * @param {String} targetSkill - Name of skill to be tested.
 * @return {Object} The skill object to be tested.
**/ 
function hasSkill (actor, targetSkill) {
    // Match exact skill only
    skill = actor.items.find(i => i.type == "skill" && i.data.name === game.i18n.localize(targetSkill)) 
    if (skill == null) {
        let message = actor.name + " does not have the " + targetSkill + " skill. Aborting skill test. ";
        console.log("GM Toolkit (WFRP4e) | " + message)
        ui.notifications.error(message) 
    } else {
        console.log("GM Toolkit (WFRP4e) | " + actor.name + " has the " + game.i18n.localize(targetSkill) + " skill.") 
    }
    return (skill);
}
// 
Hooks.on('ready', () => {
    if (game.user.isGM) {  // TODO: Optionalise to allow players to access hud extensions
        Hooks.on('renderTokenHUD', (app, html, data) => { TokenHudExtension.addMovementTokenTip(app, html, data) });
        Hooks.on('renderTokenHUD', (app, html, data) => { TokenHudExtension.addInitiativeTokenTip(app, html, data) });
        Hooks.on('renderTokenHUD', (app, html, data) => { TokenHudExtension.addPlayerCharacterTokenTip(app, html, data) });
    }

});

console.log("GM Toolkit (WFRP4e) | Token Hud Extensions loaded.");