/* Reduces Advantage for the selected token by 1 (to minimum 0).
*/

if (canvas.tokens.controlled.length != 1) 
  return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));

let actorName = actor.data.name;
let startingAdvantage = Number(actor.data.data.status.advantage.value);
let uiNotice = String("No change made.");

if (startingAdvantage > 0)
    {
        let newAdvantage = Number(startingAdvantage - 1);

        actor.update({"data.status.advantage.value" : newAdvantage}); 

        uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reduced",{actorName, startingAdvantage, newAdvantage } );

    } 
    else 
    {
        uiNotice = game.i18n.format("GMTOOLKIT.Advantage.None",{actorName, startingAdvantage } );
    }

ui.notifications.notify(uiNotice);
