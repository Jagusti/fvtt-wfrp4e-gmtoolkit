export default class DarkWhispers {

  static chatListeners (html) {
    // Click on buttons related to the Dark Whispers macro
    html.addEventListener("click", async event => {
      event.preventDefault()
      if (!game.user.isGM) {
        let actor = game.user.character
        if ( actor ) {  // Assigned player character
          let response = ""
          // eslint-disable-next-line capitalized-comments
          // data-action tells us what button was clicked
          switch ($(event.currentTarget).attr("data-action")) {
            case "accept":
              response = `${game.i18n.format("GMTOOLKIT.Message.DarkWhispers.Accepted", { currentUser: actor.name })}`
              // Adjusting Corruption is left as a manual intervention.
              // Automating could leverage the Token Hud Extension function.
              // adjustStatus (actor, "Corruption", Number(-1));
              break
            case "reject":
              response = `${game.i18n.format("GMTOOLKIT.Message.DarkWhispers.Rejected", { currentUser: actor.name })}`
              break
          }

          // Add the ask from the original message
          response += `<blockquote>${$(event.currentTarget).attr("data-ask")}</blockquote>`
          let chatData = {
            speaker: ChatMessage.getSpeaker("token"),
            content: response,
            whisper: ChatMessage.getWhisperRecipients("GM")
          }
          await ChatMessage.create(chatData, {})

        } else { // Player without character
          ui.notifications.notify(game.i18n.format("GMTOOLKIT.Notification.NoActor", { currentUser: game.users.current.name }))
        }
      } else { // Non-player (ie, GM)
        const buttonText = event.currentTarget.textContent
        if (buttonText !== undefined) {
          ui.notifications.notify(game.i18n.format("GMTOOLKIT.Notification.UserMustBePlayer", { action: buttonText }))
        }
      }
    })
  } // End of chatListeners

}


// ---- Set up Hooks ----
// Activate chat listeners
Hooks.on("renderChatMessageHTML", (chatMessage, html) => {
  const darkWhisperButtons = html.querySelectorAll(".darkwhisper-button")
  darkWhisperButtons.forEach(button => {
    DarkWhispers.chatListeners(button)
  })
})
