/* Increases Advantage for the selected token by 1.
 * Caps at character's maximum advantage. 
 * This macro is adapted from Add XP WFRP4e by @DasSauerkraut#3215
 * https://github.com/CatoThe1stElder/WFRP-4th-Edition-FoundryVTT/wiki/Macro-Repository#add-xp
*/

if (canvas.tokens.controlledTokens.length != 1) 
  return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));

let actorName = actor.data.name;
let maxAdvantage = Number(actor.data.data.status.advantage.max);
let startingAdvantage = Number(actor.data.data.status.advantage.value);
let uiNotice = String("No change made.");

if (maxAdvantage > startingAdvantage)
    {
        let newAdvantage = Number(startingAdvantage + 1);

        actor.update({"data.status.advantage.value" : newAdvantage}); 

        uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Increased",{actorName, startingAdvantage, newAdvantage } );

    } 
    else 
    {
        uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Max",{actorName, startingAdvantage, maxAdvantage } );
    }

ui.notifications.notify(uiNotice);
