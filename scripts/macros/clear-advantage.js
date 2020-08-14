/* Resets Advantage for the selected token to 0 */

(() => {
  if (canvas.tokens.controlled.length != 1) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"), {});
    } else {
    updateAdvantage(token,"clear")
    }
})();