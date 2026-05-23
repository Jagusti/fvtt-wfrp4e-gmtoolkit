endSession()

async function endSession () {
  if (!game.user.isGM) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.SessionEnd.NoPermission"), {})
  }

  game.gmtoolkit.module.log(false, "Processing Session Turnover.")

  game.gmtoolkit.module.log(false, "Pausing game.")
  game.togglePause(true, { broadcast: true })

  game.gmtoolkit.module.log(false, "Switching to holding scene.")
  game.scenes.getName(game.settings.get("wfrp4e-gm-toolkit", "holdingScene"))?.activate(true)

  game.gmtoolkit.module.log(false, "Adding Experience.")
  await game.macros.getName("Add XP").execute()

  game.gmtoolkit.module.log(false, "Resetting Fortune.")
  await game.macros.getName("Reset Fortune").execute()

  game.gmtoolkit.module.log(false, "Exporting Chat.")
  if (game.settings.get("wfrp4e-gm-toolkit", "exportChat")) {
    await game.messages.export()
  }

  if (game.settings.get("wfrp4e-gm-toolkit", "sessionID") === "null") {
    game.gmtoolkit.module.log(false, "Not updating Session ID.")
  } else {
    game.gmtoolkit.module.log(false, "Updating Session ID.")
    const thisSession = game.gmtoolkit.utility.getSession().id
    let nextSession = Math.trunc(thisSession) === Number(thisSession)
      ? Number(thisSession) + 1
      : thisSession

    foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("GMTOOLKIT.Dialog.SessionTurnover.UpdateSessionID.Title") },
      rejectClose: false,
      content: `<form>
            <p>${game.i18n.format("GMTOOLKIT.Dialog.SessionTurnover.UpdateSessionID.CurrentSession", { thisSession })}</p>
            <div class="form-group">
            <p>${game.i18n.localize("GMTOOLKIT.Dialog.SessionTurnover.UpdateSessionID.NextSession")}</p> 
            <input type="text" id="nextsession" name="nextsession" value="${nextSession}" />
            </div>
            </form>`,
      buttons: [
        {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("GMTOOLKIT.Dialog.Apply"),
          action: "apply",
          callback: (event, button, dialog) => {
            result = new foundry.applications.ux
              .FormDataExtended(button.form).object
            nextSession = result.nextsession
            game.settings.set("wfrp4e-gm-toolkit", "sessionID", nextSession)
            game.gmtoolkit.module.log(true, `Previous Session ID was ${thisSession}. Next Session ID is ${nextSession}.`)
          }
        },
        {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
          action: "cancel"
        }
      ]
    })
  } // End Session ID Update

  game.gmtoolkit.module.log(false, "Completed Session Turnover tasks.")
}

/* ==========
 * MACRO: Session Turnover
 * VERSION: 10.0.0
 * UPDATED: 2026-05-23
 * DESCRIPTION: Unified macro to run start and end of session admin, including awarding Experience Points, resetting Fortune, pausing the game and exporting the chat log.
 * TIP: Various default options can be defined in Session Management Settings under Module Settings.
 ========== */
