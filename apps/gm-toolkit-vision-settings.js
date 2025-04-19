import GMToolkit from "../modules/gm-toolkit.mjs"
import { prepareSettingsFormData } from "../modules/gm-toolkit-settings.mjs"

export default class GMToolkitVisionSettings
  extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "gmtoolkit-settings-vision",
    tag: "form",
    form: {
      handler: GMToolkitVisionSettings.onSubmit,
      submitOnChange: false,
      closeOnSubmit: true
    },
    position: { width: 560 },
    window: {
      icon: "fas fa-gear",
      title: "GMTOOLKIT.Settings.Vision.menu.title",
      contentClasses: ["standard-form"]
    }
  }

  static PARTS = {
    form: {
      template: "modules/wfrp4e-gm-toolkit/templates/gm-toolkit-settings-V2.html"
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  async _prepareContext (options) {
    const context = await super._prepareContext(options)

    context.settings = await prepareSettingsFormData("vision")
    context.buttons = [
      {
        type: "submit",
        icon: "fa-solid fa-save",
        label: "Submit",
        action: "submit"
      }
    ]

    return context
  }

  static async onSubmit (event, form, formData) {
    const inputFields = formData.object
    for (const setting in inputFields) game.settings
      .set(GMToolkit.MODULE_ID, setting, inputFields[setting])
  }
}
