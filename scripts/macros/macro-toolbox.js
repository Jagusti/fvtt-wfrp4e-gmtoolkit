(()=>{
    // Add and remove macros from the list as needed. 
    const macros = [
        "Add Advantage",
        "Clear Advantage",
        "Reduce Advantage", 
        "Session Turnover",
        "Add XP",
        "Reset Fortune",
        "Make Secret Party Test",
        "Send Dark Whispers",
        "Toggle Scene Visibility and Light",
        "Set Token Vision and Light",
        "Pull Everyone to Scene", 
        "Simply d100"
    ];

    let buttons = {};
    let dialog;
    let content = `<div style="width: 100%; `; // closing this bracket seems to break the form
    
    macros.forEach((name)=> {
        label = (game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro","."))) == ((game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro","."))) ? name : (game.i18n.localize(game.gmtoolkit.utility.strip(name, "GMTOOLKIT.Macro",".")));
        buttons[name] = {
        label : label,
        icon : `<img src = "${game.macros.getName(name)?.data?.img}" style = "height: 2rem; vertical-align : middle; border: none;" >`,
        callback : () => {
            game.macros.getName(name).execute();
            dialog.render(true);
        }
        }
    });
    dialog = new Dialog({title : game.i18n.localize("GMTOOLKIT.Dialog.GMToolbox.Title"), content, buttons}).render(true);
})();
  
  
/* ==========
* MACRO: GM Toolbox
* VERSION: 0.9.3
* UPDATED: 2022-05-20
* DESCRIPTION: Adds a customisable floating dialog for quick access to frequently used Toolkit macros, freeing up hotbar spots
* TIP: Add / remove macros from the 'macros' list to tailor it for your game. Names must exactly match those in the Macro Directory.
* TIP: The macro dialog can be kept open for quick access and minimised to reduce space
========== */
