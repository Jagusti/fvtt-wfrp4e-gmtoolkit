addXP()

async function addXP () {

  // Setup: determine group of actors to be awarded experience
  let awardees = []
  if (game.user.targets.size < 1) {
    // (1) all assigned player characters
    awardees = game.gmtoolkit.utility
      .getGroup(game.settings.get("wfrp4e-gm-toolkit", "defaultPartySessionTurnover"))
      .filter(g => g.type === "character")
  } else {
    // (2) all targeted tokens of awardee selection
    awardees = game.gmtoolkit.utility
      .getGroup(game.settings.get("wfrp4e-gm-toolkit", "defaultPartySessionTurnover"), { interaction: "targeted" })
      .filter(g => g.type === "character")
  }

  // Setup: exit with notice if there are no player-owned characters
  if (awardees.length < 1) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.TargetPCs"), {})

  // Get  session ID/date, default XP award and default reason
  const XP = Number(game.settings.get("wfrp4e-gm-toolkit", "addXPDefaultAmount"))
  let reason = (game.settings.get("wfrp4e-gm-toolkit", "addXPDefaultReason") === "null")
    ? ""
    : game.settings.get("wfrp4e-gm-toolkit", "addXPDefaultReason")
  if (reason) {
    reason = game.settings.get("wfrp4e-gm-toolkit", "addXPDefaultReason")
    const session = game.gmtoolkit.utility.getSession()
    reason = (session.date)
      ? reason.replace("(%date%)", `(${session.date})`)
      : reason.replace(" (%date%)", "")
    reason = (session.id !== "null" )
      ? reason.replace("%session%", session.id)
      : reason = reason.replace("%session%", "")
  }

  // Prompt for XP if option is set
  (game.settings.get("wfrp4e-gm-toolkit", "addXPPrompt"))
    ? promptForXP( awardees, XP, reason )
    : updateXP( awardees, XP, reason )

} // END: addXP

function updateXP (allAwardees, XP, reason) {
  let chatContent = ""
  const awardees = groupAwardees(allAwardees)
  const awards = {
    pc: XP,
    henchman: (XP / 2) | 0
  }

  // Cycle through player characters, gathering experience change data for report message
  if ( awardees.pcs.length > 0 ) {
    chatContent += `<h3>${game.i18n.format("GMTOOLKIT.Dialog.AddXP.Awarded", { award: awards.pc })}</h3><ul>`
    awardees.pcs.forEach(character => {
      applyAward(character, awards.pc)
    }) // End cycle
    chatContent += "</ul>"
  }

  // Cycle through henchmen, gathering experience change data for report message
  if ( awardees.henchmen.length > 0 ) {
    chatContent += `<h3>${game.i18n.format("GMTOOLKIT.Dialog.AddXP.Awarded", { award: awards.henchman })}</h3><ul>`
    awardees.henchmen.forEach(character => {
      applyAward(character, awards.henchman)
    }) // End cycle
    chatContent += "</ul>"
  }

  // confirm changes made in whisper to GM
  const chatData = game.wfrp4e.utility.chatDataSetup(chatContent, "gmroll", false)
  chatData.flavor = game.i18n.format("GMTOOLKIT.AddXP.Flavor", { reason })
  ChatMessage.create(chatData, {})
  console.log(chatContent)

  // Update actor and build report
  function applyAward (character, award) {
    const recipient = character?.actor?.name || character.name
    const XPTotal = character?.details?.experience?.total
    const newXPTotal = Math.max(XPTotal + award, 0)
    const XPCurrent = character?.details?.experience?.current || 0
    const newXPCurrent = Math.max(XPCurrent + award, 0)

    // Update token actor or actor
    character?.actor
      ? character.actor.system.awardExp(award, reason)
      : character.system.awardExp(award, reason)

    // Build report message
    chatContent += `<li>${game.i18n.format("GMTOOLKIT.AddXP.Success", { recipient, XPTotal, newXPTotal, XPCurrent, newXPCurrent })}</li>`
  }
} // END: updateXP

function promptForXP (allAwardees, XP, reason) {
  const awardees = groupAwardees(allAwardees)
  const awardeeList = {}
  let awardeeNotice = ""

  // Build player character awardee list
  if (awardees.pcs.length > 0) {
    awardeeList.pcs = "<ul>"
    awardees.pcs.forEach(character => {
      awardeeList.pcs += `<li>${character?.actor?.name || character.name}</li>`
    })
    awardeeList.pcs += "</ul>"
    awardeeNotice += `<p>${game.i18n.format("GMTOOLKIT.Dialog.AddXP.Recipients.Full", { recipients: awardeeList.pcs })}</p>`
  }

  // Build henchmen awardee list
  if (awardees.henchmen.length > 0) {
    awardeeList.henchmen = "<ul>"
    awardees.henchmen.forEach(character => {
      awardeeList.henchmen += `<li>${character?.actor?.name || character.name}</li>`
    })
    awardeeList.henchmen += "</ul>"
    awardeeNotice += `<p>${game.i18n.format("GMTOOLKIT.Dialog.AddXP.Recipients.Half", { recipients: awardeeList.henchmen })}</p>`
  }

  const dialog = new Dialog({
    title: game.i18n.localize("GMTOOLKIT.Dialog.AddXP.Title"),
    content: `<form>
            ${awardeeNotice}
            <div class="form-group">
              <label>${game.i18n.localize("GMTOOLKIT.Dialog.AddXP.Prompt")}</label> 
              <input type="text" id="add-xp" name="add-xp" value="${XP}" />
            </div>
            <div class="form-group">
              <label>${game.i18n.localize("GMTOOLKIT.Dialog.AddXP.Reason")}</label> 
              <input type="text" id="xp-reason" name="xp-reason" value="${reason}" />
            </div>
        </form>`,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: game.i18n.localize("GMTOOLKIT.Dialog.Apply"),
        callback: html => {
          const XP = Math.round(html.find("#add-xp").val())
          if (isNaN(XP)) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Dialog.AddXP.InvalidXP"))
          const reason = html.find("#xp-reason").val()
          updateXP(allAwardees, XP, reason)
        }
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel")
      }
    },
    default: "yes"
  }).render(true)

} // END: promptForXP

function groupAwardees (allAwardees) {
  const party = game.gmtoolkit.utility.getGroup("party")
  const henchmen = game.gmtoolkit.utility.getGroup("henchmen")
  const awardees = {
    pcs: allAwardees.filter(character => party.includes(character)),
    henchmen: allAwardees.filter(character => henchmen.includes(character))
  }
  return awardees
} // END: groupAwardees


/* ==========
 * MACRO: Add XP
 * VERSION: 8.0.0
 * UPDATED: 2024-09-08
 * DESCRIPTION: Adds a set amount of XP to all or targeted player character(s). Adds XP update note to the chat log.
 * TIP: Characters must have a player assigned (if default group is 'party') or be player-owned (if default group is 'company').
 * TIP: When default group is company, characters who are not assigned to a player are treated as henchmen, and receive half XP.
 * TIP: Default XP amount and reason can be preset in module settings, along with option to bypass prompt for XP amount each time.
 * TIP: Non-whole numbers are rounded off. Negative numbers are subtracted. Henchman awards are rounded down.
 ========== */
