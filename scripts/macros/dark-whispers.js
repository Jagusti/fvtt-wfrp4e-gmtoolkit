/* Open a dialog to send a Dark Whisper (WFRP p183) to selected player character(s).
 * Original macro developed by Vindico#9103. 
 */

formDarkWhispers();

function formDarkWhispers() {

  // Non-GMs are not permitted to send Dark Whispers
  if (!game.user.isGM) {      
    return ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.DarkWhispers.NoPermission'));
  }

  // Only other users who are currently logged in and have an assigned character are available to whisper to. 
  let users = game.users.filter(user => user.active && !user.isSelf && !!user.character);
  let checkOptions = "";

  // Build list of player / characters to select via dialog
  users.forEach(user => {
    checkOptions+=`
        <input type="checkbox" name="${user.id}" value="${user.name}" >\n
        <label for="${user.id}"> ${user.character.name} (${user.name})</label>
        <br>
      `
  });

 // Show dialog to write message and select target player characters
 new Dialog({
  title: game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.Title'),
  content:`${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.WhisperTargets')}: <br>${checkOptions} <br>
    <label for="message">${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.WhisperMessage')}</label>
    <textarea id="message" name="message" rows="4" cols="50"></textarea><br>`,
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
