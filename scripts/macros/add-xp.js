/* Adds a set amount of XP to targeted character(s).
 * Adds XP update note to the Chat log.
 */

 // Enter Wanted XP.
let XP = 20; // TODO: Add dialog box for XP. 

if (game.user.targets.size < 1) 
  return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.TargetPCs"));

let targetName = String(); 
let XPTotal = Number();
let newXPTotal = Number();
let XPCurrent = Number();
let newXPCurrent = Number();
let chatContent = String("No change made.");

game.user.targets.forEach(target => {
targetName = target.data.name; 

if (target.actor.data.type == "character")
  {
    XPTotal = target.actor.data.data.details.experience.total; 
    newXPTotal = XPTotal + XP;
    XPCurrent = target.actor.data.data.details.experience.current; 
    newXPCurrent = XPCurrent + XP;

    target.actor.update({
      "data.details.experience.total": newXPTotal
    })
        
    chatContent = game.i18n.format("GMTOOLKIT.AddXP.Success", {XP, targetName, XPTotal, newXPTotal, XPCurrent, newXPCurrent} )
  } else {
    chatContent = game.i18n.format("GMTOOLKIT.AddXP.NotPC", {targetName} )
  }

  let chatData = {
    user: game.user._id,
    content: chatContent
  };

ChatMessage.create(chatData, {});  
console.log(chatContent)

})
