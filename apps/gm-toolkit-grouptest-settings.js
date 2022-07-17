import GMToolkit from "../modules/gm-toolkit.mjs";
import { getDataSettings } from "../modules/gm-toolkit-settings.mjs";

export default class GMToolkitGroupTestSettings extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "homebrew-settings";
        options.template = "modules/wfrp4e-gm-toolkit/templates/gm-toolkit-settings.html";
        options.width = 560;
        options.minimizable = true;
        options.resizable = true;
        options.title = "GMTOOLKIT.Settings.GroupTest.menu.name"
        return options;
    }

    getData() {
        let data = super.getData()
        getDataSettings(data, "grouptest");
        console.log(data)
        return data
    }

    async _updateObject(event, formData) {
        for(let setting in formData) 
            game.settings.set(GMToolkit.MODULE_ID, setting, formData[setting])
    };
} 
