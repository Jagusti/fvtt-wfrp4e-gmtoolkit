formDarkWhispers()

async function formDarkWhispers () {
  // Non-GMs are not permitted to send Dark Whispers
  if (!game.user.isGM) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.NoPermission"))
  }

  // Setup: determine group of actors to be whispered to
  const group = game.gmtoolkit.utility.getGroup(game.settings.get("wfrp4e-gm-toolkit", "defaultGroupDarkWhispers")).filter(g => g.type === "character")
  const targeted = game.gmtoolkit.utility.getGroup(game.settings.get("wfrp4e-gm-toolkit", "defaultGroupDarkWhispers"), { interaction: "targeted" }).filter(g => g.type === "character")
  // Setup: exit with notice if there are no player-assigned characters
  if (!group) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters"))
  }
  // Setup: exit with notice if there are no player-assigned characters with Corruption
  if (!group.some(g => g.system?.status?.corruption?.value > 0)) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.NoEligibleCharacters"))
  }

  // Setup dialog content
  // Build list of characters to select via dialog
  const characterList = []
  group.forEach(g => {
    characterList.push({
      actorId: g?.actor?.id || g.id,
      name: g?.actor?.name || g.name,
      corruption: {
        value: g.system?.status?.corruption?.value,
        max: g.system?.status?.corruption?.max
      },
      assignedUser: game.users.players.filter(p => p.character === g)[0],
      owners: game.users.players.filter(p => p.id in g.ownership),
      targeted: targeted.includes(g)
    })
  })

  // Build dialog content
  let checkOptions = ""
  characterList.forEach(actor => {
    const canWhisperTo = (actor.corruption.value)
      ? `enabled title="${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.HasCorruption")}"`
      : `disabled title="${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.NoCorruption")}"`
    const checked = (actor.targeted && actor.corruption.value) ? "checked" : ""
    const playerOwners = actor.owners.map(m => m.name).join(", ")
    checkOptions += `
      <div class="form-group" style="margin-block: -0.75rem;">
      <input type="checkbox" id="${actor.actorId}" name="${actor.actorId}" value="${actor.name}" ${canWhisperTo} ${checked}>
      <label for="${actor.actorId}" title="${game.i18n.format("GMTOOLKIT.Dialog.DarkWhispers.PlayerTooltip", { assignedUser: actor.assignedUser?.name || game.i18n.localize("GMTOOLKIT.Dialog.None"), playerOwners: playerOwners })}"> <strong>${actor.name}</strong> (${actor.assignedUser?.name || game.i18n.localize("GMTOOLKIT.Dialog.NotAssigned")})</label>
      <label for="${actor.actorId}"> ${actor.corruption.value} / ${actor.corruption.max} ${game.i18n.localize("NAME.Corruption")} </label>
      </div>
    `
  })

  // Construct and show form
  const darkwhisper = (game.tables.getName(game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.Title")))
    ? await game.tables.getName(game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.Title")).draw(
      { displayChat: false }
    ).then(w => w.results[0].description)
    : game.i18n.format("GMTOOLKIT.Dialog.DarkWhispers.ImportTable")

  const dialogContent = `
    <div class="form-group">
      <label for="targets">${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.WhisperTargets")}</label>
      </div>
    ${checkOptions}
    <div class="form-group message style="margin-block: -0.75rem;">
      <label for="message">${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.WhisperMessage")}</label>
    </div>
    <div class="form-group" style="margin-block: -0.75rem;">
      <textarea id="message" name="message" rows="4" cols="50">${darkwhisper}</textarea>
    </div>
    <div class="form-group">
      <input type="checkbox" id="sendToOwners" name="sendToOwners">
      <label for="sendToOwners">${game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.SendToOwners")}</label>
    </div>
  `

  foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.Title") },
    rejectClose: false,
    content: dialogContent,
    buttons: [
      {
        label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
        callback: () => abortWhisper(),
        action: "cancel"
      },
      {
        label: game.i18n.localize("GMTOOLKIT.Dialog.DarkWhispers.SendWhisper"),
        action: "whisper",
        default: true,
        callback: (event, button, dialog) => {
          result = new foundry.applications.ux
            .FormDataExtended(button.form).object
          sendDarkWhispers(result, characterList, result.sendToOwners)
        }
      }
    ]
  })
}

function sendDarkWhispers (result, characterList, sendToOwners) {
  // Build list of selected players ids for whispers target
  const characterTargets = []
  const playerRecipients = []

  for ( const character of characterList ) {
    if (result[character?.actorId] === character.name) {
      characterTargets.push(character.name)
      result.sendToOwners
        ? playerRecipients.push(...character.owners.map(m => m.id))
        : playerRecipients.push(character.assignedUser?.id)
    }
  }
  // Check for whisper message
  darkwhisper = result.message
  // Abort if no whisper or character is selected
  if (playerRecipients.filter(p => p === undefined).length
    === playerRecipients.length
    || !playerRecipients.length || !darkwhisper
  ) return abortWhisper()

  // Construct and send message to whisper targets
  // Build the translation string based on the setting
  const messageTemplate = `GMTOOLKIT.Settings.DarkWhispers.message.${game.settings.get("wfrp4e-gm-toolkit", "messageDarkWhispers")}`
  // Parse the translated message
  const whisperMessage = `${game.i18n.format(messageTemplate, { message: darkwhisper })}`
  // Add response buttons for chat card. data- attributes are used by listener.
  const responseButtons = `
    <span class="chat-buttons">
    <button class="chat darkwhisper-button" data-button="darkwhispers" data-action="accept" data-ask="${game.i18n.format(darkwhisper)}">${game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.Accept")}</button>
    <button class="chat darkwhisper-button" data-button="darkwhispers" data-action="reject" data-ask="${game.i18n.format(darkwhisper)}">${game.i18n.localize("GMTOOLKIT.Message.DarkWhispers.Reject")}</button>
    </span>
    `
  // Post the message
  ChatMessage.create({
    content: whisperMessage + responseButtons,
    whisper: playerRecipients,
    flavor: characterTargets.join(", ")
  })
}

function abortWhisper () {
  return ui.notifications.warn(
    game.i18n.format("GMTOOLKIT.Message.DarkWhispers.WhisperAborted", { currentUser: game.user.name }),
    { console: false }
  )
}


/* ==========
* MACRO: Send Dark Whispers
* VERSION: 9.0.0
* UPDATED: 2025-05-10
* DESCRIPTION: Open a dialog to send a Dark Whisper (WFRP p183) to one or more selected player character(s).
* TIP: Only player-assigned or player-owned characters with Corruption can be sent a Dark Whisper.
* TIP: The placeholder whisper is drawn from the Dark Whispers table. Change this for different random whispers.
* TIP: The whisper can be edited in the dialog, regardless of what is pre-filled from the Dark Whispers table.
* TIP: Actor tokens that are targeted in a scene are pre-selected in the Send Dark Whisper dialog.
========== */
