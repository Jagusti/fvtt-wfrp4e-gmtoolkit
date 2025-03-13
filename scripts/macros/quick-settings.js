(async () => {
  const settings = [
    "advantage",
    "darkwhispers",
    "grouptest",
    "session",
    "vision"
  ]

  const root = "game.gmtoolkit.settings."
  let content = "<div style=\"width: 100%;>"
  let buttons = []

  settings.forEach(name => {
    const path = root + name
    const settingsApp = eval(`new ${path}()`)
    console.log(settingsApp)
    label = game.i18n.localize(settingsApp.title)
    buttons.push({
      label: label,
      action: name,
      callback: () => {
        settingsApp.render(true)
      }
    })
  })

  const dialog = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("GMTOOLKIT.Dialog.QuickSettings.Title") },
    form: { closeOnSubmit: false },
    content,
    buttons
  })

})()


/* ==========
* MACRO: GM Toolkit Settings Toolbox
* VERSION: 8.1.0
* UPDATED: 2025-03-13
* DESCRIPTION: Adds a floating dialog for quick access to GM Toolkit settings
========== */
