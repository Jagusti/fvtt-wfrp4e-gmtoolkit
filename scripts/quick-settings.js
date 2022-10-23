(() => {
  const settings = [
    "advantage",
    "darkwhispers",
    "grouptest",
    "session",
    "vision"
  ]

  const root = "game.gmtoolkit.settings."
  let buttons = {}
  let content = "<div style=\"width: 100%; " // Closing this bracket seems to break the form

  settings.forEach(name => {
    const path = root + name
    const settingsApp = eval(`new ${path}()`)
    label = game.i18n.localize(settingsApp.title)
    buttons[name] = {
      label: label,
      callback: () => {
        settingsApp.render(true)
        // dialog.render(true)
      }
    }

  })

  const dialog = new Dialog({ title: game.i18n.localize("GMTOOLKIT.Dialog.QuickSettings.Title"), content, buttons }).render(true)
})()


/* ==========
* MACRO: GM Toolkit Settings Toolbox
* VERSION: 6.1.0
* UPDATED: 2022-02-23
* DESCRIPTION: Adds a floating dialog for quick access to GM Toolkit settings
========== */
