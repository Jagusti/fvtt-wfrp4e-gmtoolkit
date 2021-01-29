/* Open a dialog to send a Dark Whisper (WFRP p183) to selected player character(s).
 * Adapted from original macro developed by Vindico#9103. 
 */

formDarkWhispers(); //  Set default user target filter in module settings. Override by adding parameter to 'all', 'absent' or 'present' party members. Clear parameter to revert to default. 

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
    // Make unselectable if character has no Corruption to deal with
    let canWhisperTo = 'disabled title="No Corruption to spend on offer"';
    if (actorCorruption.value >0 ) {canWhisperTo = "enabled"};

    checkOptions+=`
        <div class="form-group">
        <input type="checkbox" name="${user.id}" value="${user.name}" ${canWhisperTo}>
        <label for="${user.id}"> <strong>${user.character.name}</strong> (${user.name})</label>
        <label for="${user.id}"> ${actorCorruption.value} / ${actorCorruption.max} ${game.i18n.localize('GMTOOLKIT.Status.Corruption')} </label>
        </div>
      `
  });
  
  // abort if no characters have any Corruption
  if (corruptionAvailable == 0) {   
    return ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters'));
  };

 // Construct and show form to write whisper message and select target player characters
 let dialogContent = `
    <div class="form-group ">
      <label for="targets">${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.WhisperTargets')} </label>
    </div>
    ${checkOptions} // filtered character list
    <div class="form-group message">
      <label for="message">${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.WhisperMessage')}</label>
    </div>
    <div class="form-group">
      <textarea id="message" name="message" rows="4" cols="50">${game.wfrp4e.tables.rollTable('darkwhispers').description}</textarea>
    </div>
    `
 new Dialog({
  title: game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.Title'),
  content:dialogContent,
  buttons:{
    whisper:{   
      label: game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.SendWhisper'),
      callback: (html) => sendDarkWhispers(html, users, "private")
    }
  }
}).render(true);
}

function sendDarkWhispers(html, users, sendmode) {
  // check for whisper message 
  var messageText = html.find('[name="message"]')[0].value;
  
  // build list of selected players ids for whispers target
  var targets = [];
  for ( let user of users ) {
    if (html.find('[name="'+user.id+'"]')[0].checked){
      targets.push(user.id);
    }
  }

  // abort if no whisper or character is selected 
  if (targets.length == 0 || messageText.length == 0) {
    return ui.notifications.error(game.i18n.format('GMTOOLKIT.Message.DarkWhispers.WhisperAborted', {currentUser: game.users.current.name}));
  }

  // Construct and send message to whisper targets
  // Build the translation string based on the setting
  let messageTemplate = "GMTOOLKIT.Settings.DarkWhispers.message" + `.${game.settings.get("wfrp4e-gm-toolkit", "messageDarkWhispers")}`
  // Parse the translated message
  let whisperMessage = `${game.i18n.format(messageTemplate, {message: messageText})}`
  
  // Add response buttons for chat card
  // data- attributes are used by listener
  let responseObjects = `
    <span class="chat-card-button-area">
    <a class='chat-card-button darkwhisper-button' data-button='actOnWhisper' data-ask="${game.i18n.format(messageText)}">${game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.Accept')}</a>
    <a class='chat-card-button darkwhisper-button' data-button='denyDarkGods' data-ask="${game.i18n.format(messageText)}">${game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.Reject')}</a>
    </span>
    `  

  ChatMessage.create({
    content: whisperMessage + responseObjects,
    whisper: targets
  });
  
}