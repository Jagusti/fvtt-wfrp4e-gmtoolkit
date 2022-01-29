/* Toggles the Token Vision and Unrestricted Vision Range settings. 
 * If Token Vision is set, Unrestricted Vision Range is unset (and vice-versa).
 * Applies to the scene being viewed, which is not necessarily the active scene.
 */


let thisScene = game.scenes.viewed;
let uiNotice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange", {});

if (thisScene.data.tokenVision) {
  thisScene.update({tokenVision: false, globalLight: true});
  uiNotice = game.i18n.format("GMTOOLKIT.Scene.UnrestrictedNotToken", {sceneName: thisScene.name}, {});
} else {
  thisScene.update({tokenVision: true, globalLight: false});
  uiNotice = game.i18n.format("GMTOOLKIT.Scene.TokenNotUnrestricted", {sceneName: thisScene.name}, {});
}

ui.notifications.notify(uiNotice);
