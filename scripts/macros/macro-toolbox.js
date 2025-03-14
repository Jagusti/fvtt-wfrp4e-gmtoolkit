(async () => {
  // Add and remove macros from the list as needed.
  const macros = [
    "Add Advantage",
    "Clear Advantage",
    "Reduce Advantage",
    "Check Conditions",
    "Session Turnover",
    "Add XP",
    "Reset Fortune",
    "Launch Damage Console",
    "Make Secret Group Test",
    "Send Dark Whispers",
    "Toggle Scene Visibility and Light",
    "Set Token Vision and Light",
    "Pull Everyone to Scene",
    "Change Scene to Yards",
    "Simply d100",
    "GM Toolkit Settings"
  ]

  const content = "<div style=\"width: 100%;>"
  const buttons = []

  macros.forEach(name => {
    label = (game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
      === game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
      ? name
      : game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
    buttons.push({
      label: label,
      action: name,
      callback: () => {
        game.macros.getName(name).execute()
      }
    })
  })

  const dialog = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("GMTOOLKIT.Dialog.GMToolbox.Title") },
    rejectClose: false,
    form: { closeOnSubmit: false },
    content,
    buttons
  })

})()


/* ==========
* MACRO: GM Toolbox
* VERSION: 8.1.0
* UPDATED: 2025-03-14
* DESCRIPTION: Adds a customisable floating dialog for quick access to frequently used Toolkit macros, freeing up hotbar spots
* TIP: Add / remove macros from the 'macros' list to tailor it for your game. Names must exactly match those in the Macro Directory.
* TIP: The macro dialog can be kept open for quick access and minimised to reduce space
========== */
