import GMToolkit from "../modules/gm-toolkit.mjs";
import { refreshToolkitContent, strip } from "../modules/utility.mjs";

export default class GMToolkitMaintenanceWrapper extends FormApplication {
    async render() {
        let listToolkitContent = new Array()
        listToolkitContent.macros = await buildLocalizedContent(game.macros)
        listToolkitContent.tables = await buildLocalizedContent(game.tables)
        
        let html = await renderTemplate("modules/wfrp4e-gm-toolkit/templates/gm-toolkit-maintenance.html", listToolkitContent)

        new GMToolkitMaintenance("wfrp4e-gm-toolkit", `${GMToolkit.MODULE_NAME_FULL} Maintenance`,html).render(true);
    }
} // end class GMToolkitMaintenanceWrapper

class GMToolkitMaintenance extends Dialog {

    constructor(module = GMToolkit.MODULE_ID, title, html) {
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

} // end class GMToolkitMainenance

async function buildLocalizedContent(documentType) {
    GMToolkit.log(false, "Starting buildLocalizedContent")
    let toolkitContent = (documentType.filter(m=>m.folder?.name==game.gmtoolkit.module.MODULE_NAME)).sort((a, b) => a.name.localeCompare(b.name))       
    let contentArray = [] 
    let pack = []

    // Set translationKey prefix
    let translationKeyPrefix = ""
    if (documentType === game.macros) {
        translationKeyPrefix = "GMTOOLKIT.Macro"
        pack = game.packs.get(`${game.gmtoolkit.module.MODULE_ID}.gm-toolkit-macros`);
    }
    if (documentType === game.tables) {
        translationKeyPrefix = "GMTOOLKIT.Table"
        pack = game.packs.get(`${game.gmtoolkit.module.MODULE_ID}.gm-toolkit-tables`);
    }
    
    // Get Compendium documents
    let documents = await pack.getDocuments();

    // build localized array
    for (var content of toolkitContent) {
        content.translationKey = strip(content.name, translationKeyPrefix, ".")
        content.compendiumVersion = documents.filter(d => d.id == content.id).map(i => i.data.flags["wfrp4e-gm-toolkit"].version)

        contentArray.push(content)    
    }
    
    GMToolkit.log(false, "contentArray : ",  contentArray)
    GMToolkit.log(false, "Ending buildLocalizedContent")
    
    return(contentArray)
    
}  // end function buildLocalizedContent()
