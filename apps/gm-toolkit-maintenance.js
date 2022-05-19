import GMToolkit from "../modules/gm-toolkit.mjs";
import { getDataSettings } from "../modules/gm-toolkit-settings.mjs";
import { refreshToolkitContent } from "../modules/utility.mjs";

export default class GMToolkitMaintenanceWrapper extends FormApplication {
    async render() {
        let listToolkitContent = [] 
        listToolkitContent.macros = (game.macros.filter(m=>m.folder?.name==game.gmtoolkit.module.MODULE_NAME)).sort((a, b) => a.name.localeCompare(b.name))
        listToolkitContent.tables = (game.tables.filter(m=>m.folder?.name==game.gmtoolkit.module.MODULE_NAME)).sort((a, b) => a.name.localeCompare(b.name))
        
        let html = await renderTemplate("modules/wfrp4e-gm-toolkit/templates/gm-toolkit-maintenance.html", listToolkitContent)

        new GMToolkitMaintenance("wfrp4e-gm-toolkit", `${GMToolkit.MODULE_NAME_FULL} Maintenance`,html).render(true);
    }
}

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

} 
