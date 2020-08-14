/* Adds a set amount of XP to targeted character(s). 
* Default amount of XP can be preset in module settings, 
* along with option to prompt for XP amount each time.
* Non-whole numbers are rounded off. Negative numbers are subtracted. 
* Adds XP update note to the Chat log.
 */

(() => {

  if (game.user.targets.size < 1) 
  return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.TargetPCs"), {});
  
  // Set default XP
  let XP = Number(game.settings.get("wfrp4e-gm-toolkit", "addXPDefault"))
  
  // Prompt for XP
  if (game.settings.get("wfrp4e-gm-toolkit", "addXPPrompt")) {
    const dialog = new Dialog({
      title: (game.i18n.localize('GMTOOLKIT.Dialog.AddXP.Title')),
      content: `<form>
              <div class="form-group">
              <label>
                  ${game.i18n.localize("GMTOOLKIT.Dialog.AddXP.Prompt")}          
                  </label> 
                  <input type="text" id="add-xp" name="add-xp" value="${XP}" />
              </div>
          </form>`,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("GMTOOLKIT.Dialog.Apply"),
          callback: (html) => {
            let XP = html.find('#add-xp').val();
            addXP(Number(XP));
          }
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
        },
      },
      default: "yes"
  }).render(true);
  } else {
    addXP(XP)
  }
  
  function addXP(XP) {
    XP = Math.round(XP);
    if (isNaN(XP)) return ui.notifications.error(game.i18n.localize('GMTOOLKIT.Dialog.AddXP.InvalidXP'))
  
    let targetName = String(); 
    let XPTotal = Number();
    let newXPTotal = Number();
    let XPCurrent = Number();
    let newXPCurrent = Number();
    let chatContent = String(game.i18n.localize("GMTOOLKIT.Dialog.Cancel"));
  
    game.user.targets.forEach(target => {
    targetName = target.data.name; 
  
    if (target.actor.data.type == "character")
      {
        XPTotal = target.actor.data.data.details.experience.total; 
        newXPTotal = Math.max(XPTotal + XP,0);
        XPCurrent = target.actor.data.data.details.experience.current; 
        newXPCurrent = XPCurrent + XP,0;
  
        target.actor.update({
          "data.details.experience.total": newXPTotal
        })
            
        chatContent = game.i18n.format('GMTOOLKIT.AddXP.Success', {XP, targetName, XPTotal, newXPTotal, XPCurrent, newXPCurrent} )
      } else {
        chatContent = game.i18n.format('GMTOOLKIT.AddXP.NotPC', {targetName} )
      }
  
      let chatData = {
        user: game.user._id,
        content: chatContent
      };
  
    ChatMessage.create(chatData, {});  
    console.log(chatContent)
    })
  }
})();