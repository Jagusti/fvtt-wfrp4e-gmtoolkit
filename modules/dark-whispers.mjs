export default class DarkWhispers {

    static async chatListeners(html) {

        // Click on buttons related to the Dark Whispers macro
        html.on("click", ".darkwhisper-button", event => {
            event.preventDefault();	
            if (!game.user.isGM) {
                let actor = game.user.character;
                if ( actor ) {  // assigned player character
                    let response = "";
                    // data-button tells us what button was clicked
                    switch ($(event.currentTarget).attr("data-button")) {
                        case "actOnWhisper":
                            response = `${game.i18n.format("GMTOOLKIT.Message.DarkWhispers.Accepted", {currentUser: actor.name})}`;
                            // Adjusting Corruption is left as a manual intervention. 
                            // Automating could leverage the Token Hud Extension function.
                            // adjustStatus (actor, "Corruption", Number(-1));
                        break;
                        case "denyDarkGods" :
                            response = `${game.i18n.format("GMTOOLKIT.Message.DarkWhispers.Rejected", {currentUser: actor.name})}`
                        break;
                    };
    
                    // Add the ask from the original message
                    response += `<blockquote>${$(event.currentTarget).attr("data-ask")}</blockquote>`
    
                    let chatData = {
                        speaker: ChatMessage.getSpeaker("token"),
                        content: response,
                        whisper: ChatMessage.getWhisperRecipients("GM")
                    }; 
                    ChatMessage.create(chatData, {});
                } else { // player without character
                    ui.notifications.notify(game.i18n.format("GMTOOLKIT.Notification.NoActor", {currentUser: game.users.current.name}));
                }
            }  else { // non-player (ie, GM)
                let buttonAction = event.currentTarget.text
                ui.notifications.notify(game.i18n.format("GMTOOLKIT.Notification.UserMustBePlayer", {action: buttonAction}));
            }
        })
    }; // End of chatListeners    

}


// ---- Set up Hooks ----
// Activate Dark Whisper chat listeners
Hooks.on("renderChatLog", (log, html, data) => {
    DarkWhispers.chatListeners(html)  
});
