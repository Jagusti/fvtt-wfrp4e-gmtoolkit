import GMToolkit from "../modules/gm-toolkit.mjs"
import { prepareSettingsFormData } from "../modules/gm-toolkit-settings.mjs"

export default class GMToolkitSessionManagementSettings
  extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "gmtoolkit-settings-session",
    tag: "form",
    form: {
      handler: GMToolkitSessionManagementSettings.onSubmit,
      submitOnChange: false,
      closeOnSubmit: false
    },
    actions: {
      add: GMToolkitSessionManagementSettings.increaseValue,
      subtract: GMToolkitSessionManagementSettings.decreaseValue
    },
    position: { width: 560 },
    window: {
      icon: "fas fa-gear",
      title: "GMTOOLKIT.Settings.SessionManagement.menu.title",
      contentClasses: ["standard-form"]
    }
  }

  static PARTS = {
    form: {
      template: "modules/wfrp4e-gm-toolkit/templates/gm-toolkit-settings.html"
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  async _prepareContext (options) {
    const context = await super._prepareContext(options)

    context.settings = await prepareSettingsFormData("session")
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

  static increaseValue (event, target) {
    const input = target.form.querySelector(`input[name=${target.dataset.name}]`)
    const newVal = input.valueAsNumber + (event.shiftKey ? 10 : 1)
    input.value = newVal > Number(input.max) ? input.max : newVal
  }

  static decreaseValue (event, target) {
    const input = target.form.querySelector(`input[name=${target.dataset.name}]`)
    const newVal = input.valueAsNumber - (event.shiftKey ? 10 : 1)
    input.value = newVal < 0 ? 0 : newVal
  }

  static async onSubmit (event, form, formData) {
    const inputFields = formData.object
    for (const setting in inputFields) game.settings
      .set(GMToolkit.MODULE_ID, setting, inputFields[setting])
    if (event.type === "submit") this.close(false)
  }
}
