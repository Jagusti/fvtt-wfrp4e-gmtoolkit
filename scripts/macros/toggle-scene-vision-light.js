/* Toggles the Token Vision and Global Illumination settings. 
 * If Token Vision is set, Global Illumination is unset (and vice-versa).
 * Applies to the scene being viewed, which is not necessarily the active scene.
 */


let thisScene = game.scenes.viewed;
let uiNotice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange", {});

if (thisScene.data.tokenVision) {
  thisScene.update({tokenVision: false, globalLight: true});
  uiNotice = game.i18n.format("GMTOOLKIT.Scene.GlobalNotToken", {sceneName: thisScene.name}, {});
} else {
  thisScene.update({tokenVision: true, globalLight: false});
  uiNotice = game.i18n.format("GMTOOLKIT.Scene.TokenNotGlobal", {sceneName: thisScene.name}, {});
}

ui.notifications.notify(uiNotice);
