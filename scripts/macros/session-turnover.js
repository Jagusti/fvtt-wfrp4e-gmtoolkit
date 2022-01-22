endSession();

async function endSession () {
    if (!game.user.isGM) {
        return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.SessionEnd.NoPermission"), {});
    }
    
    game.gmtoolkit.module.log(false, "Processing Session Turnover.")

    game.gmtoolkit.module.log(false, "Pausing game.")
    await game.togglePause(true);

    game.gmtoolkit.module.log(false, `Switching to holding scene.`)
    game.scenes.getName(game.settings.get("wfrp4e-gm-toolkit", "holdingScene"))?.activate(true)
    
    game.gmtoolkit.module.log(false, "Adding Experience.")
    await game.macros.getName("Add XP").execute();
    
    game.gmtoolkit.module.log(false, "Resetting Fortune.")
    await game.macros.getName("Reset Fortune").execute();
    
    game.gmtoolkit.module.log(false, "Exporting Chat.")
    if (game.settings.get("wfrp4e-gm-toolkit", "exportChat")) {
        await game.messages.export();
    }; 
    
    if (game.settings.get("wfrp4e-gm-toolkit", "sessionID") == "null") {
        game.gmtoolkit.module.log(false, `Not updating Session ID.`)
    } else {
        game.gmtoolkit.module.log(false, "Updating Session ID.")
        const thisSession = game.gmtoolkit.utility.getSession().id 
        let nextSession = Math.trunc(thisSession) == thisSession ? Number(thisSession) + 1 : thisSession;
        
        const dialog = new Dialog({
            title: (game.i18n.localize("GMTOOLKIT.Dialog.SessionTurnover.UpdateSessionID.Title")),
            content: `<form>
            <p>${game.i18n.format("GMTOOLKIT.Dialog.SessionTurnover.UpdateSessionID.CurrentSession", {thisSession})}</p>
            <div class="form-group">
            <p>${game.i18n.localize("GMTOOLKIT.Dialog.SessionTurnover.UpdateSessionID.NextSession")}</p> 
            <input type="text" id="next-session" name="next-session" value="${nextSession}" />
            </div>
            </form>`,
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: game.i18n.localize("GMTOOLKIT.Dialog.Apply"),
                    callback: (html) => {
                        nextSession = html.find("#next-session").val();
                        game.settings.set("wfrp4e-gm-toolkit", "sessionID", nextSession)
                        game.gmtoolkit.module.log(true, `Previous Session ID was ${thisSession}. Next Session ID is ${nextSession}.`)
                    }
                },
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
                },
            },
            default: "yes"
        }).render(true);
    } // End Session ID Update

    game.gmtoolkit.module.log(false, `Completed Session Turnover tasks.`)
};

/* ==========
 * MACRO: Session Turnover
 * VERSION: 0.9.3
 * UPDATED: 2022-01-22
 * DESCRIPTION: Unified macro to run start and end of session admin, including awarding Experience Points, resetting Fortune, pausing the game and exporting the chat log. 
 * TIP: Various default options can be defined in Session Management Settings under Module Settings.
 ========== */