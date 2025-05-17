pullEveryoneToScene()

async function pullEveryoneToScene () {
  if (!game.user.isGM) {
    ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.ScenePullActivate.NoPermission"))
  }

  switch (game.settings.get("wfrp4e-gm-toolkit", "scenePullActivate")) {
    case "prompt":
      const promptPullActivate = await foundry.applications.api.DialogV2.wait({
        window: { title: game.i18n.localize("GMTOOLKIT.Dialog.ScenePullActivate.Title") },
        rejectClose: true,
        content: `<form>
                        <div class="form-group">
                        <label>
                            ${game.i18n.localize("GMTOOLKIT.Dialog.ScenePullActivate.Prompt")}         
                            </label>
                        </div>
                    </form>`,
        buttons: [
          {
            icon: "fas fa-target",
            label: game.i18n.localize("GMTOOLKIT.Dialog.ScenePullActivate.ActivateScene"),
            action: "activate"
          },
          {
            icon: "fas fa-door",
            label: game.i18n.localize("GMTOOLKIT.Dialog.ScenePullActivate.PullOnly"),
            action: "pull",
            default: "yes"
          }
        ]
      })
      pullToScene(promptPullActivate)
      break
    case "always":
      pullToScene("activate")
      break
    case "never":
      pullToScene("pull")
      break
  }

  function pullToScene (activateScene) {
    let thisScene = game.scenes.viewed
    if (activateScene === "activate") {
      thisScene.update({ active: true })
      let sceneActiveState = thisScene.active
      ui.notifications.notify(game.i18n.format("GMTOOLKIT.Message.ScenePullActivate.Activated", { sceneName: thisScene.name }))
    } else {
      for ( let u of game.users.players ) {
        game.socket.emit("pullToScene", thisScene.id, u.id)
      }
      let sceneActiveState = String()
      if (thisScene.active === true ) {
        sceneActiveState = game.i18n.localize("GMTOOLKIT.Scene.Active")
      } else {
        sceneActiveState = game.i18n.localize("GMTOOLKIT.Scene.NotActive")
      }
      ui.notifications.notify(game.i18n.format("GMTOOLKIT.Message.ScenePullActivate.Pulled", { sceneName: thisScene.name, sceneActiveState }))
    }
  }
}

/* ==========
* MACRO: Pull Everyone to Scene
* VERSION: 9.0.0
* UPDATED: 2025-05-25
* DESCRIPTION: Yanks every player into the scene that the GM is on.
* TIP: Optionally activate (or prompt to activate) the scene through Configure Session Options in module settings.
========== */
