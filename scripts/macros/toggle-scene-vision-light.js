let thisScene = game.scenes.viewed
let uiNotice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange", {})

await thisScene.update( { tokenVision: !thisScene.tokenVision})
await thisScene.update( { globalLight: !thisScene.tokenVision})

uiNotice = (thisScene.tokenVision) 
  ? game.i18n.format("GMTOOLKIT.Scene.TokenNotGlobal", { sceneName: thisScene.name })
  : game.i18n.format("GMTOOLKIT.Scene.GlobalNotToken", { sceneName: thisScene.name })

ui.notifications.info(uiNotice, { console: false })

/* ==========
* MACRO: Toggle Scene Vision and Light
* VERSION: 0.9.5
* UPDATED: 2022-08-14
* DESCRIPTION: Toggles the Token Vision and Global Illumination settings.
* TIP: If Token Vision is set, Global Illumination is unset (and vice-versa).
* TIP: Applies to the scene being viewed, which is not necessarily the active scene.
========== */
