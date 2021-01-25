/* Open a dialog to send a Dark Whisper (WFRP p183) to selected player character(s).
 * Adapted from original macro developed by Vindico#9103. 
 */

formDarkWhispers(); // change parameter for 'all', 'absent' or 'present' party members. Set default in module settings. 

function formDarkWhispers(targets=String(game.settings.get("wfrp4e-gm-toolkit", "targetDarkWhispers"))) {

  // Non-GMs are not permitted to send Dark Whispers
  if (!game.user.isGM) {      
    return ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.NoPermission'));
  }

  // Only other users who have an assigned character are available to whisper to. By default only users who are currently logged in are included. 
  let users = []
  switch (targets) { 
  case 'all':
      users = game.users.filter(user => !user.isSelf && !!user.character);
      break;
  case 'absent':
      users = game.users.filter(user => !user.active  && !user.isSelf && !!user.character);
      break;
  case 'present':
  default:
     users = game.users.filter(user => user.active  && !user.isSelf && !!user.character);
     break;
  }

  if (!users) {   
    return ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters'));
  }
  
  // Build list of player / characters to select via dialog
  let corruptionAvailable = 0; // count to check there are characters with corruption to target
  let checkOptions = "";
  users.forEach(user => {
    let actorCorruption = {
      value: game.actors.get(user.character.id).data.data.status.corruption.value, 
      max: game.actors.get(user.character.id).data.data.status.corruption.max
    };
    corruptionAvailable += actorCorruption.value;
    // Make unselectable if no Corruption to deal with
    let canWhisperTo = "disabled";
    if (actorCorruption.value == true) {canWhisperTo = "enabled"};

    checkOptions+=`
        <div class="form-group">
        <input type="checkbox" name="${user.id}" value="${user.name}" ${canWhisperTo}>
        <label for="${user.id}"> <strong>${user.character.name}</strong> (${user.name})</label>
        <label for="${user.id}"> ${actorCorruption.value} / ${actorCorruption.max} ${game.i18n.localize('GMTOOLKIT.Status.Corruption')} </label>
        </div>
      `
  });
  
  if (corruptionAvailable == 0) {   
    return ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters'));
  };

 // Show dialog to write message and select target player characters
 new Dialog({
  title: game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.Title'),
  content:`<div class="form-group "><label for="targets">${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.WhisperTargets')}: </label></div>${checkOptions} 
    <div class="form-group message"><label for="message">${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.WhisperMessage')}</label></div>
    <div class="form-group"><textarea id="message" name="message" rows="4" cols="50"></textarea></div>`,
  buttons:{
    whisper:{   
      label: game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.Apply'),
      callback: (html) => sendDarkWhispers(html, users)
    }
  }
}).render(true);
}

function sendDarkWhispers(html, users) {
  var targets = [];
  // build list of selected players ids for whispers target
  for ( let user of users ) {
    if (html.find('[name="'+user.id+'"]')[0].checked){
      targets.push(user.id);
    }
    var messageText = html.find('[name="message"]')[0].value
  }

// Construct and send message to whisper targets
  ChatMessage.create({
    content: `${game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.OpeningText')} <blockquote>${messageText}</blockquote> ${game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.ClosingText')}`,
    whisper: targets
  });
}