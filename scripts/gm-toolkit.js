Hooks.on('ready', async () => {
	// Only show warning to GMs
	if (!game.user.isGM)
        return;
    if (!(game.modules.get("furnace").active))  {
        console.log(game.i18n.localize("GMTOOLKIT.Log.FurnaceNotInstalled"));
        return ui.notifications.error( game.i18n.localize("GMTOOLKIT.Message.InstallFurnace") );
        } else {
        console.log(game.i18n.localize("GMTOOLKIT.Log.FurnaceInstalled"));
        }
})