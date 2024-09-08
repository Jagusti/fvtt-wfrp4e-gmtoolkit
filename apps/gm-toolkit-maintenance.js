import GMToolkit from "../modules/gm-toolkit.mjs"
import { refreshToolkitContent, strip } from "../modules/utility.mjs"

export default class GMToolkitMaintenanceWrapper extends FormApplication {
  async render () {
    let listToolkitContent = []
    listToolkitContent.macros = await buildLocalizedContent(game.macros)
    listToolkitContent.tables = await buildLocalizedContent(game.tables)

    let html = await renderTemplate("modules/wfrp4e-gm-toolkit/templates/gm-toolkit-maintenance.html", listToolkitContent)

    new GMToolkitMaintenance(`${GMToolkit.MODULE_NAME_FULL} Maintenance`, html, "wfrp4e-gm-toolkit").render(true)
  }
} // End class GMToolkitMaintenanceWrapper

class GMToolkitMaintenance extends Dialog {

  constructor (title, html, module = GMToolkit.MODULE_ID) {
    super({
      title,
      content: html,
      module: game.modules.get(module),
      buttons: {
        macros: {
          label: "Macros",
          callback: async () => {
            await refreshToolkitContent("Macro")
          }
        },
        tables: {
          label: "Tables",
          callback: async () => {
            await refreshToolkitContent("RollTable")
          }
        }
      }
    })
  }

  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      popOut: true,
      width: 560,
      resizable: true
    })
  }
} // End class GMToolkitMaintenance

async function buildLocalizedContent (documentType) {
  GMToolkit.log(false, "Starting buildLocalizedContent")
  let toolkitContent = documentType.filter(
    m => m.folder?.name === game.gmtoolkit.module.MODULE_NAME
  ).sort((a, b) => a.name.localeCompare(b.name))
  let contentArray = []
  let pack = []

  // Set translationKey prefix
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
  let documents = await pack.getDocuments()

  // Build localized array
  for (const content of toolkitContent) {
    content.translationKey = strip(content.name, translationKeyPrefix, ".")
    content.compendiumVersion = documents
      .filter(d => d.name === game.i18n.localize(content.translationKey))
      .map(i => i.flags["wfrp4e-gm-toolkit"]?.version)
    contentArray.push(content)
  }

  GMToolkit.log(false, "contentArray : ", contentArray)
  GMToolkit.log(false, "Ending buildLocalizedContent")

  return contentArray

}  // End function buildLocalizedContent()
