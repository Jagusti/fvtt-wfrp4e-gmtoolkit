/* Increases Advantage for the selected token by 1.
 * Caps at character's maximum advantage. 
*/

if (canvas.tokens.controlled.length != 1) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
    } else {
    updateAdvantage(token,"increase")
    }
