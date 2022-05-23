export default class GMToolkit {

    static MODULE_ID = "wfrp4e-gm-toolkit";
    static MODULE_ABBREV = "GMTOOLKIT";
    static MODULE_NAME = "GM Toolkit";
    static MODULE_NAME_FULL = "GM Toolkit (WFRP4e)";
    
    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     * 
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static log(force, ...args) {  
        const shouldLog = force || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.MODULE_ID);
    
        if (shouldLog) {
          console.log("%c%s%c%s", "color: black; background: orange;", this.MODULE_ID, "color: unset; background: unset;" , " | ",  ...args);
        }
      }

}