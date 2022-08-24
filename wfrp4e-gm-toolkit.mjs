/**
 * A utility module for Warhammer Fantasy Roleplay 4e Gamemasters.+
 * Author: Jagusti
 * Repository: https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/
 * Issue Tracker: https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues
 */

// Import Helpers
import GMToolkit from "./modules/gm-toolkit.mjs"
import * as GMToolkitUtility from "./modules/utility.mjs"

// Import Modules
import { GMToolkitSettings, registerGroupTestSettings } from "./modules/gm-toolkit-settings.mjs"
import Advantage from "./modules/advantage.mjs"
import { runSilentGroupTest, runGroupTest } from "./modules/group-test.mjs"
import { GroupTest } from "./apps/group-test.js"
import DarkWhispers from "./modules/dark-whispers.mjs"
import TokenHudExtension from "./modules/token-hud-extension.mjs"


/* -------------------------------------------- */
/*  Foundry VTT Initialisation                  */
/* -------------------------------------------- */

/**
 * Carry out initialisation routines
 */
Hooks.once("init", function () {
  GMToolkit.log(false, `Initialising ${GMToolkit.MODULE_NAME}.`)

  // Create namespace within game global
  game.gmtoolkit = {
    advantage: Advantage,
    utility: GMToolkitUtility,
    module: GMToolkit,
    grouptest: {
      launch: GroupTest,
      run: runGroupTest,
      silent: runSilentGroupTest
    },
    skills: []
  }

})


/* -------------------------------------------- */
/*  Foundry VTT Ready                           */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
  // Preload skills, used for Group Test settings registration
  if (!game.babele || game.babele.initialized) {
    GMToolkit.log(false, "Building skills as Babele is not active or is initialized")
    game.gmtoolkit.skills = await GMToolkitUtility.compileItems(["skill"])
  } else {
    GMToolkit.log(false, "Deferring skill list build until Babele is initialized.")
  }

  // Register module settings
  await GMToolkitSettings.register()

  GMToolkit.log(false, `${GMToolkit.MODULE_NAME} is ready.`)

  // Notify any player users that do not have characters assigned
  const spectators = GMToolkitUtility.getGroup("spectators").map(i => ` ${i.name}`)
  if (spectators.length > 0) {
    GMToolkit.log(true, `Spectators: ${spectators}`)
    if (!game.settings.get("wfrp4e-gm-toolkit", "suppressSpectatorNotice")) {
      ui.notifications.error(`${game.i18n.format("GMTOOLKIT.Message.Spectators", { spectators })}`, { permanent: true, console: false })
    }
  }

  // Register Handlebar helper to find an entry within an array
  Handlebars.registerHelper("ifIn", function (toFind, inList) {
    if (inList.indexOf(toFind) > -1) {
      return true
    }
  })

})

Hooks.on("ready", async () => {
  game.socket.on(`module.${GMToolkit.MODULE_ID}`, data => {
    SocketHandlers[data.type](data)
  })
})

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

// Register module debug flag with Developer Mode custom hook
Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(GMToolkit.MODULE_ID)
})

// Disable movement on holding scene
Hooks.on("preUpdateToken", (token, change) => {
  GMToolkit.log(false, `${token.x} -> ${change?.x}, ${token.y} -> ${change?.y}`)
  if (!game.user.isGM && game.canvas.scene.name === game.settings.get("wfrp4e-gm-toolkit", "holdingScene")) {
    if (change?.x) {change.x = token.x}
    if (change?.y) {change.y = token.y}
  }
})

// Display Token Hud Extension if enabled
Hooks.on("renderTokenHUD", (app, html, data) => {
  if (game.settings.get(GMToolkit.MODULE_ID, "enableTokenHudExtensions")) TokenHudExtension.addTokenHudExtensions(app, html, data)
})

// If Babele is installed, wait until it completed initialisation and then compile localized skills list used for Group Tests
Hooks.once("babele.ready", async function () {
  // Preload skills, used for Group Test settings registration
  if (!game.babele || game.babele.initialized) {
    console.log("Building skills now Babele is ready")
    game.gmtoolkit.skills = await GMToolkitUtility.compileItems(["skill"])
    registerGroupTestSettings()
  }
})

/* -------------------------------------------- */
/*  Socket Handlers                                 */
/* -------------------------------------------- */

export class SocketHandlers {

  // Used for updating Advantage when the opposed test is resolved by a player character that does not own the opposing character
  static async updateAdvantage (data) {
    console.log("Socket: updateAdvantage", data)
    if (!game.user.isUniqueGM) return
    let updated = ""
    const { character } = data.payload
    return updated = await game.scenes.active.tokens
      .filter(t => t.actor.id === character)[0].actor
      .update(data.payload.updateData)
  }

  // Used for updating Advantage flags on combatant when the opposed test is resolved by a player character that does not own the opposing actor
  static async setFlag (data) {
    console.log("Socket: setFlag", data)
    if (!game.user.isUniqueGM) return
    ui.notifications.notify(`Setting flag "${data.payload.updateData.key}" on ${data.payload.character.name} as GM`, "info", { permanent: true, console: true })

    const { character } = data.payload  // This should be a Combatant

    // const actorToChange = game.scenes.active.tokens
    //   .filter(t => t.actor.id === character.actorId)[0].actor

    let updated = ""
    return updated = await character.setFlag(
      GMToolkit.MODULE_ID,
      data.payload.updateData.flag,
      { [data.payload.updateData.key]: data.payload.updateData.value }
    )

  }

}
