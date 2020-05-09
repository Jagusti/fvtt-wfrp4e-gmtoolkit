/* Resets Advantage for the selected token to 0 */

if (canvas.tokens.controlledTokens.length != 1) 
  return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
  
let startingAdvantage = Number(actor.data.data.status.advantage.value);

actor.update({"data.status.advantage.value" : 0})

let uiNotice = game.i18n.format("GMTOOLKIT.Advantage.Reset",{actorName: actor.data.name, startingAdvantage} );

ui.notifications.notify(uiNotice);
