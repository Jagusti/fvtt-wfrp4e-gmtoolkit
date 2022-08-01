formDarkWhispers(); 

async function formDarkWhispers() {
  // Non-GMs are not permitted to send Dark Whispers
  if (!game.user.isGM) {      
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.NoPermission"));
  }

  // setup: determine group of actors to be whispered to 
  const group =  game.gmtoolkit.utility.getGroup(game.settings.get("wfrp4e-gm-toolkit", "defaultGroupDarkWhispers")).filter(g => g.type === "character")
  const targeted = game.gmtoolkit.utility.getGroup(game.settings.get("wfrp4e-gm-toolkit", "defaultGroupDarkWhispers"), {interaction : "targeted"}).filter(g => g.type === "character");
  // setup: exit with notice if there are no player-assigned characters
  if (!group) {   
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters"));
  }
  // setup: exit with notice if there are no player-assigned characters with Corruption
  if (!group.some(g => g.data.data?.status?.corruption?.value > 0)) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters"));
  }

  // Setup dialog content
  // Build list of characters to select via dialog
  const characterList = []
  group.forEach(g => { 
    characterList.push({
      actorId: g?.actor?.id || g.id, 
      name: g?.actor?.name || g.name, 
      corruption: {
        value: g.data.data?.status?.corruption?.value, 
        max: g.data.data?.status?.corruption?.max
      }, 
      assignedUser: game.users.players.filter(p => p.character === g)[0],
      owners : game.users.players.filter(p => p.id in g.data.permission),
      targeted : targeted.includes(g)
    })
  });

  // Build dialog content
  let checkOptions = "";
  characterList.forEach(actor => {
    let canWhisperTo = (actor.corruption.value) ? `enabled title="${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.HasCorruption')}"` : `disabled title="${game.i18n.localize('GMTOOLKIT.Dialog.DarkWhispers.NoCorruption')}"`;
    let checked = (actor.targeted && actor.corruption.value) ? "checked" : "";
    let playerOwners = actor.owners.map(m => m.name).join(", ")
    checkOptions +=`
      <div class="form-group">
      <input type="checkbox" id="${actor.actorId}" name="${actor.actorId}" value="${actor.name}" ${canWhisperTo} ${checked}>
      <label for="${actor.actorId}" title="${game.i18n.format('GMTOOLKIT.Dialog.DarkWhispers.PlayerTooltip', {assignedUser: actor.assignedUser?.name || game.i18n.localize('GMTOOLKIT.Dialog.None'), playerOwners: playerOwners})}"> <strong>${actor.name}</strong> (${actor.assignedUser?.name || game.i18n.localize('GMTOOLKIT.Dialog.NotAssigned')})</label>
      <label for="${actor.actorId}"> ${actor.corruption.value} / ${actor.corruption.max} ${game.i18n.localize("NAME.Corruption")} </label>
      </div>
    `
  });

  // Construct and show form
  let darkwhisper = (game.tables.getName(game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.Title"))) ? await game.wfrp4e.tables.rollTable("darkwhispers") : game.i18n.format("GMTOOLKIT.Dialog.DarkWhispers.ImportTable")

  let dialogContent = `
    <div class="form-group ">
      <label for="targets">${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.WhisperTargets")} </label>
    </div>
    ${checkOptions} 
    <div class="form-group message">
      <label for="message">${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.WhisperMessage")}</label>
    </div>
    <div class="form-group">
      <textarea id="message" name="message" rows="4" cols="50">${darkwhisper?.result || darkwhisper}</textarea>
    </div>
    <div class="form-group">
      <input type="checkbox" id="sendToOwners" name="sendToOwners">
      <label for="sendToOwners">${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.SendToOwners")}</label>
    </div>
  `

  new Dialog({
    title: game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.Title"),
    content:dialogContent,
    buttons: {
      cancel: {   
        label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
        callback: (html) => abortWhisper()
      },
      whisper: {   
        label: game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.SendWhisper"),
        callback: (html) => sendDarkWhispers(html, characterList, html.find('[name="sendToOwners"]')[0].checked)
      }
    }
    }).render(true);
}

function sendDarkWhispers(html, characterList, sendToOwners) {
  // Build list of selected players ids for whispers target
  let characterTargets = []; 
  let playerRecipients = [];  

  for ( let character of characterList ) {
    if (html.find(`[name="${character.actorId}"]`)[0].checked) {
      characterTargets.push(character.name);
      sendToOwners ? playerRecipients.push(...character.owners.map(m => m.id)) : playerRecipients.push(character.assignedUser?.id)
    }
  }
    
  // check for whisper message 
  darkwhisper = html.find('[name="message"]')[0].value   
  // abort if no whisper or character is selected 
  if (playerRecipients.filter(p => p === undefined).length === playerRecipients.length || !playerRecipients.length || !darkwhisper) return abortWhisper()

  // Construct and send message to whisper targets
  // Build the translation string based on the setting
  const messageTemplate = `GMTOOLKIT.Settings.DarkWhispers.message.${game.settings.get("wfrp4e-gm-toolkit", "messageDarkWhispers")}`
  // Parse the translated message
  const whisperMessage = `${game.i18n.format(messageTemplate, {message: darkwhisper})}`
  // Add response buttons for chat card. data- attributes are used by listener.
  const responseButtons = `
    <span class="chat-card-button-area">
    <a class="chat-card-button darkwhisper-button" data-button="actOnWhisper" data-ask="${game.i18n.format(darkwhisper)}">${game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.Accept")}</a>
    <a class="chat-card-button darkwhisper-button" data-button="denyDarkGods" data-ask="${game.i18n.format(darkwhisper)}">${game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.Reject")}</a>
    </span>
    `
  // Post the message 
  ChatMessage.create({
    content: whisperMessage + responseButtons,
    whisper: playerRecipients, 
    flavor: characterTargets.join(', ') 
  });
}

function abortWhisper() {
  return ui.notifications.error(game.i18n.format("GMTOOLKIT.Message.DarkWhispers.WhisperAborted", {currentUser: game.user.name}));
}


/* ==========
* MACRO: Send Dark Whispers
* VERSION: 0.9.4.3
* UPDATED: 2022-07-31
* DESCRIPTION: Open a dialog to send a Dark Whisper (WFRP p183) to one or more selected player character(s).
* TIP: Only player-assigned or player-owned characters with Corruption can be sent a Dark Whisper. 
* TIP: The placeholder whisper is drawn from the Dark Whispers table. Change this for different random whispers. 
* TIP: The whisper can be edited in the dialog, regardless of what is pre-filled from the Dark Whispers table. 
* TIP: Actor tokens that are targeted in a scene are pre-selecteed in the Send Dark Whisper dialog.
========== */