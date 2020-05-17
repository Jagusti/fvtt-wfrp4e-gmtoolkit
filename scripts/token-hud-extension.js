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

        let TooltipMovement = game.i18n.localize('Move') + ": " + move +"; " + game.i18n.localize('Walk') +": " + walk + "; " + game.i18n.localize('Run') + ": " + run
        
        let divTokenHudExt = '<div class="tokenhudext left">';
        let hudMovement = '<div class="control-icon tokenhudicon left" title="' + TooltipMovement + '"><i class="fas fa-shoe-prints"></i> ' + run + '</div>';

        html.find('.attribute.elevation').wrap(divTokenHudExt);
        html.find('.attribute.elevation').before(hudMovement);

    }
    
    static async addInitiativeTokenTip(app, html, data) {
        
       // Do not show initiative token tip unless this is the active scene 
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
       let hudInitiative = '<div class="control-icon tokenhudicon right" title="' + TooltipInitiative + '"><i class="fas fa-spinner"></i> ' + initiative + '</div>';

       html.find('.control-icon.combat').wrap(divTokenHudExt);
       html.find('.control-icon.combat').after(hudInitiative);

   }

    static async addPlayerCharacterTokenTip(app, html, data) {

        let actor = game.actors.get(data.actorId);
        if (actor === undefined)
            return;
            
        // console.log("GM Toolkit Token Hud Extensions | Actor?", actor); 
        
        const actorData = actor.data;
        const actorStatus = actorData.data.status;
        const actorCharacteristics = actor.data.data.characteristics;

        if (actorData.type === "character") {
        
            let fortune = actorStatus.fortune.value 
            let fate = actorStatus.fate.value
            let resolve = actorStatus.resolve.value 
            let resilience = actorStatus.resilience.value
            let corruption = actorStatus.corruption.value
            let maxCorruption = actorStatus.corruption.max || (actor.data.data.characteristics.wp.bonus + actor.data.data.characteristics.t.bonus) // default max does not consider Pure Soul talent
            let sin = actorStatus.sin.value
            let perception = actor.items.find(i => i.data.name === game.i18n.localize('Perception')  ).data.data.advances.value + actorCharacteristics.i.value
            let intuition = actor.items.find(i => i.data.name === game.i18n.localize('Intuition') ).data.data.advances.value + actorCharacteristics.i.value

            let TooltipFate = game.i18n.localize('Fortune') + ": " + fortune +"; " + game.i18n.localize('Fate') +": " + fate
            let TooltipResolve = game.i18n.localize('Resolve') + ": " + resolve +"; " + game.i18n.localize('Resilience') +": " + resilience
            let TooltipCorruption = game.i18n.localize('Corruption') + ": " + corruption +" / " + maxCorruption + "; " + game.i18n.localize('Sin') +": " + sin
            let TooltipPerception = game.i18n.localize('Perception') + ": " + perception +"; " + game.i18n.localize('Intuition') +": " + intuition

            let divTokenHudExt = '<div class="tokenhudext left">';

            let hudFateResolve = '<div class="control-icon tokenhudicon left" title="' + TooltipFate + '"><i class="fas fa-dice"></i> ' + fortune + '</div>'  + '<div class="control-icon tokenhudicon left" title="' + TooltipResolve + '"><i class="fas fa-hand-rock"></i> ' + resolve + '</div>';
            html.find('.control-icon.config').wrap(divTokenHudExt);
            html.find('.control-icon.config').before(hudFateResolve);
     
            let hudCorruptionPerception = '<div class="control-icon tokenhudicon left" title="' + TooltipCorruption + '"><i class="fas fa-bahai"></i> ' + corruption + '</div>'  + '<div class="control-icon tokenhudicon left" title="' + TooltipPerception + '"><i class="fas fa-eye"></i> ' + perception + '</div>';
            html.find('.control-icon.target').wrap(divTokenHudExt);
            html.find('.control-icon.target').before(hudCorruptionPerception);

        }
    }

}

Hooks.on('ready', () => {
    if (game.user.isGM) {
        Hooks.on('renderTokenHUD', (app, html, data) => { TokenHudExtension.addMovementTokenTip(app, html, data) });
        Hooks.on('renderTokenHUD', (app, html, data) => { TokenHudExtension.addInitiativeTokenTip(app, html, data) });
        Hooks.on('renderTokenHUD', (app, html, data) => { TokenHudExtension.addPlayerCharacterTokenTip(app, html, data) });
    }

});

console.log("GM Toolkit Token Hud Extensions loaded.");