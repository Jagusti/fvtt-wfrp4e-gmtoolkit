const title = "GM Toolbox"

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
  "Toggle Compendium Pack Visibility"
]

const settings = [
  // "advantage",
  // "darkwhispers",
  // "grouptest",
  // "session",
  // "vision",
  // "maintenance"
]


class QuickMenu extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    form: {
      handler: QuickMenu.formHandler,
      submitOnChange: false,
      closeOnSubmit: false
    },
    position: { width: 350 },
    window: { title: title }
  }

  static PARTS = {
    form: {
      template: "/modules/wfrp4e-gm-toolkit/templates/quickmenu.hbs"
    }
  }

  async _prepareContext () {
    const quickMenu = []
    buildMacroMenu()
    buildSettingsMenu()
    return { quickMenu }

    // Build Macro quick menu buttons
    function buildMacroMenu () {
      if (macros.length > 0) {
        for (const macro of macros) {
          const name = macro.trim()
          if (!game.macros.getName(name)) continue

          const label = (game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
            === game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))
            ? name
            : game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro", "."))

          const icon = game.macros.getName(name)?.img

          quickMenu.push({
            name: name,
            label: label,
            icon: icon,
            action: "macro"
          })
        }
      }
    }

    // Build Settings quick menu buttons
    function buildSettingsMenu () {
      if (settings.length > 0) {
        const root = "game.gmtoolkit.settings."
        for (const setting of settings) {
          const name = setting.trim()
          const path = root + name
          try {
            eval(`new ${path}()`)
          } catch(e) {
            console.error(`GM Toolkit: Quick Menu - ${name} is not a valid settings app`)
            continue
          }
          const settingsApp = eval(`new ${path}()`)
          const label = game.i18n.localize(settingsApp?.title)

          quickMenu.push({
            name: name,
            label: label,
            // icon: "modules/wfrp4e-gm-toolkit/assets/icons/quick-settings.svg",
            action: "setting"
          })
        }
      }
    }
  }

  static async formHandler (event, form, formData) {
    if (event.submitter.dataset.action === "macro") {
      game.macros.getName(event.submitter.dataset.name).execute()
    }
    if (event.submitter.dataset.action === "setting") {
      new game.gmtoolkit.settings[event.submitter.dataset.name]().render(true)
    }
  }

}

new QuickMenu().render({ force: true })


/* ==========
* MACRO: GM Toolbox
* VERSION: 9.0.0
* UPDATED: 2025-05-17
* DESCRIPTION: Adds a customisable floating dialog for quick access to frequently used Toolkit macros, freeing up hotbar spots
* TIP: Add / remove macros from the 'macros' list to tailor it for your game. Names must exactly match those in the Macro Directory.
* TIP: The macro dialog can be kept open for quick access and minimised to reduce space
========== */
