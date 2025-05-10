// Import Helpers
import GMToolkit from "./gm-toolkit.mjs"
import { refreshToolkitContent } from "./utility.mjs"

export class GMToolkitWelcome {

  /**
   * Click on buttons to update Toolkit content
   * @param {html} html
   */
  static async chatListeners (html) {
    html.addEventListener("click", async event => {
      event.preventDefault()
      if (!game.user.isGM) return

      switch ($(event.currentTarget).attr("data-button")) {
        case "updateMacros":
          refreshToolkitContent("Macro")
          break
        case "updateTables":
          refreshToolkitContent("RollTable")
          break
      }
    })
  }

  /**
   * Shows a welcome message to GM users.
   * Sets a message version flag on the user to prevent message repeats.
   */
  static _welcomeMessage () {
    if (!game.user.isGM) return

    const currentVersion = game.modules.get(GMToolkit.MODULE_ID).version
    const messageVersion = game.user.getFlag(GMToolkit.MODULE_ID, "welcomeMessageShown")

    if (messageVersion !== undefined
      && !foundry.utils.isNewerVersion(currentVersion, messageVersion)) return

    const templateData = {
      version: currentVersion,
      releases: game.modules.get(GMToolkit.MODULE_ID).changelog
    }

    foundry.applications.handlebars.renderTemplate("modules/wfrp4e-gm-toolkit/templates/welcomeMessage.hbs", templateData).then(html => {
      let options = {
        whisper: [game.user.id],
        speaker: { alias: GMToolkit.MODULE_NAME },
        flags: { core: { canPopout: true } },
        content: html
      }
      ChatMessage.create(options)
    })

    game.user.setFlag(GMToolkit.MODULE_ID, "welcomeMessageShown", currentVersion)
  }
}


// ---- Set up Hooks ----
// Activate chat listeners
Hooks.on("renderChatMessageHTML", (chatMessage, html) => {
  const welcomeButtons = html.querySelectorAll(".updateToolkitContent-button")
  welcomeButtons.forEach(button => {
    GMToolkitWelcome.chatListeners(button)
  })
})
