export default class GMToolkit {

    static MODULE_ID = "wfrp4e-gm-toolkit";
    static MODULE_NAME = "GM Toolkit (WFRP4e)";
    static MODULE_ABBREV = "GMTOOLKIT";
    
    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     * 
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static log(force, ...args) {  
        const shouldLog = force || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.MODULE_ID);
    
        if (shouldLog) {
          console.log("%c%s%c%s%s", "color: black; background: orange;", this.MODULE_ID, "color: unset; background: unset;" , " | ",  ...args);
        }
      }

}