import GMToolkit from "../modules/gm-toolkit.mjs"
import { refreshToolkitContent, strip } from "../modules/utility.mjs"

export default class GMToolkitMaintenance
  extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "gmtoolkit-maintenance",
    tag: "form",
    form: {
      handler: GMToolkitMaintenance.onSubmit,
      submitOnChange: false,
      closeOnSubmit: false
    },
    position: { width: 560 },
    window: {
      icon: "fas fa-gear",
      title: `${GMToolkit.MODULE_NAME_FULL} Maintenance`,
      contentClasses: ["standard-form"]
    },
    actions: {
      macros: GMToolkitMaintenance.updateMacros,
      tables: GMToolkitMaintenance.updateRollTable
    }
  }

  static PARTS = {
    form: {
      template: "/modules/wfrp4e-gm-toolkit/templates/gm-toolkit-maintenance.html",
      classes: ["gmtoolkit", "scrollable"]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  async _prepareContext (options) {
    const context = await super._prepareContext(options)

    context.macros = await buildLocalizedContent(game.macros)
    context.tables = await buildLocalizedContent(game.tables)
    context.buttons = [
      {
        type: "submit",
        icon: "fa-solid fa-ban",
        label: "Cancel",
        action: "cancel"
      },
      {
        type: "button",
        icon: "fa-solid fa-th-list",
        label: "Update RollTables",
        action: "tables"
      },
      {
        type: "button",
        icon: "fa-solid fa-code",
        label: "Update Macros",
        action: "macros"
      }
    ]

    return context
  }

  static async onSubmit (event, form, formData) {
    if (event.submitter.dataset.action === "cancel") this.close()
  }

  static async updateMacros () {
    await refreshToolkitContent("Macro")
  }

  static async updateRollTable () {
    await refreshToolkitContent("RollTable")
  }

} // End class GMToolkitMaintenance

async function buildLocalizedContent (documentType) {
  GMToolkit.log(false, "Starting buildLocalizedContent")
  const toolkitContent = documentType.filter(
    m => m.folder?.name === game.gmtoolkit.module.MODULE_NAME
  ).sort((a, b) => a.name.localeCompare(b.name))
  const contentArray = []
  let pack = []

  // Set translationKey prefix, depending on document type
  let translationKeyPrefix = ""
  if (documentType === game.macros) {
    translationKeyPrefix = "GMTOOLKIT.Macro"
    pack = game.packs.get(`${game.gmtoolkit.module.MODULE_ID}.gm-toolkit-macros`)
  }
  if (documentType === game.tables) {
    translationKeyPrefix = "GMTOOLKIT.Table"
    pack = game.packs.get(`${game.gmtoolkit.module.MODULE_ID}.gm-toolkit-tables`)
  }

  // Get Compendium documents
  const documents = await pack.getDocuments()

  // Build localized array
  for (const content of toolkitContent) {
    content.translationKey = strip(content.name, translationKeyPrefix, ".")
    content.compendiumVersion = documents
      .filter(d => d.name === game.i18n.localize(content.translationKey))
      .map(i => i.flags["wfrp4e-gm-toolkit"]?.version)[0]
    contentArray.push(content)
  }

  GMToolkit.log(false, "contentArray : ", contentArray)
  GMToolkit.log(false, "Ending buildLocalizedContent")

  return contentArray

}  // End function buildLocalizedContent()
