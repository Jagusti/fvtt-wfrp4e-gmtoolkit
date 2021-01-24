let checkOptions = ""
let users = game.users.filter(user => user.active);
let playerTokenIds = users.map(u => u.character?.id).filter(id => id !== undefined);

let selectedPlayerIds = canvas.tokens.controlled.map(token => {
  if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
});

users.forEach(user => {
  let checked = !!user.character && selectedPlayerIds.includes(user.character.id) && 'checked';
  checkOptions+=`
    <br>
    <input type="checkbox" name="${user.id}" value="${user.name}" ${checked}>\n
    <label for="${user.id}">${user.name}</label>
  `
});

new Dialog({
  title:"Whisper",
  content:`Whisper To: ${checkOptions} <br>
    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="4" cols="50"></textarea><br>`,
  buttons:{
    whisper:{   
      label:"Whisper",
      callback: (html) => createMessage(html)
    }
  }
}).render(true);

let messageOpenerRaw = `<strong>Dark Whispers Linger In Your Ears... </strong><br><i>Do not in any way reveal that you have received this message</i><br><br>`

let messageCloserRaw = `<br><br><i>If you do as directed, your corruption total will be reduced by </i><strong>1</strong>.`
 
function createMessage(html) {
  var targets = [];
  // build list of selected players ids for whispers target
  for ( let user of users ) {
    if (html.find('[name="'+user.id+'"]')[0].checked){
      targets.push(user.id);
    }
    var messageText = html.find('[name="message"]')[0].value
  }

  ChatMessage.create({
    content: messageOpenerRaw  + messageText + messageCloserRaw,
    whisper: targets
  });
}