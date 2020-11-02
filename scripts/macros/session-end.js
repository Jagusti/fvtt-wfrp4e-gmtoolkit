/* Unified macro to run for end of session admin.
 * Automatically fires up other macros.
 * Affects actors according to the criteria of individual macros.
 * Add XP and Reset Fortune both require player characters to be targeted.
 */ 

endSession();

async function endSession () {
    if (!game.user.isGM) {
        ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.ScenePullActivate.NoPermission'), {});
    }

    await game.macros.getName("Add XP").execute();
    await game.macros.getName("Reset Fortune").execute();
    game.togglePause();

}
