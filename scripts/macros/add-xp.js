/* Adds a set amount of XP to targeted character(s).
 * Adds XP update note to the Chat log.
 * This macro - Add XP - was written by DasSauerkraut#3215
 * https://github.com/CatoThe1stElder/WFRP-4th-Edition-FoundryVTT/wiki/Macro-Repository#add-xp
 */

 // Enter Wanted XP.
let XP = 20; // TODO: Add dialog box for XP. 

if (game.user.targets.size < 1) 
  return ui.notifications.error("Please target a token first.");

game.user.targets.forEach(target => {
  console.log(target.actor.data.data.details.experience.total)
   target.actor.update({
      "data.details.experience.total": target.actor.data.data.details.experience.total + XP
    })
         
let chatContent = game.i18n.format("GMT.AddingXPText", {XP: XP, targetName: target.data.name, XPTotal: target.actor.data.data.details.experience.total, 
      newXPTotal: target.actor.data.data.details.experience.total + XP, XPCurrent: target.actor.data.data.details.experience.current, 
      newXPCurrent: target.actor.data.data.details.experience.current + XP } )

let chatData = {
      user: game.user._id,
      content: chatContent
    };

ChatMessage.create(chatData, {});  

console.log(target.actor.data.data.details.experience.total + XP)
})
