(() => {
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

  let buttons = {}
  let dialog
  let content = "<div style=\"width: 100%; " // Closing this bracket seems to break the form

  macros.forEach(name => {
    label = (game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
      === game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
      ? name
      : game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
    buttons[name] = {
      label: label,
      icon: `<img src = "${game.macros.getName(name).img}" style = "height: 2rem; vertical-align : middle; border: none;" >`,
      callback: () => {
        game.macros.getName(name).execute()
        dialog.render(true)
      }
    }
  })
  dialog = new Dialog({ title: game.i18n.localize("GMTOOLKIT.Dialog.GMToolbox.Title"), content, buttons }).render(true)
})()


/* ==========
* MACRO: GM Toolbox
* VERSION: 6.1.1
* UPDATED: 2023-04-25
* DESCRIPTION: Adds a customisable floating dialog for quick access to frequently used Toolkit macros, freeing up hotbar spots
* TIP: Add / remove macros from the 'macros' list to tailor it for your game. Names must exactly match those in the Macro Directory.
* TIP: The macro dialog can be kept open for quick access and minimised to reduce space
========== */
