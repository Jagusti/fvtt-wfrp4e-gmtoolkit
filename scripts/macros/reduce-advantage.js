/* Reduces Advantage for the selected token by 1 (to minimum 0).
*/

if (canvas.tokens.controlled.length != 1) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"));
    } else {
    updateAdvantage(token,"reduce")
    }
