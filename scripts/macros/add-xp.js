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

  // Setup: exit with notice if there are no player-assigned characters
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
  if (game.settings.get("wfrp4e-gm-toolkit", "addXPPrompt")) {
    let awardeeList = "<ul>"
    awardees.forEach(pc => {
      awardeeList += `<li>${pc?.actor?.name || pc.name}</li>`
    })
    awardeeList += "</ul>"
    const dialog = new Dialog({
      title: game.i18n.localize("GMTOOLKIT.Dialog.AddXP.Title"),
      content: `<form>
              <p>${game.i18n.format("GMTOOLKIT.Dialog.AddXP.Recipients", { recipients: awardeeList })}</p>
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
            updateXP(awardees, XP, reason)
          }
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel")
        }
      },
      default: "yes"
    }).render(true)
  } else {
    updateXP(awardees, XP, reason)
  }

} // END: addXP

function updateXP (awardees, XP, reason) {
  let chatContent = ""

  // Cycle through player characters, gathering experience change data for report message
  awardees.forEach(pc => {
    const recipient = pc?.actor?.name || pc.name
    const XPTotal = pc?.details?.experience?.total
    const newXPTotal = Math.max(XPTotal + XP, 0)
    const XPCurrent = pc?.details?.experience?.current || 0
    const newXPCurrent = Math.max(XPCurrent + XP, 0)

    // Update token actor or actor
    pc?.actor ? pc.actor.system.awardExp(XP, reason) : pc.system.awardExp(XP, reason)

    // Build report message
    chatContent += game.i18n.format("GMTOOLKIT.AddXP.Success", { recipient, XPTotal, newXPTotal, XPCurrent, newXPCurrent } )
  }) // End cycle

  // confirm changes made in whisper to GM
  const chatData = game.wfrp4e.utility.chatDataSetup(chatContent, "gmroll", false)
  chatData.flavor = game.i18n.format("GMTOOLKIT.AddXP.Flavor", { XP, reason })
  ChatMessage.create(chatData, {})
  console.log(chatContent)

} // END: updateXP


/* ==========
 * MACRO: Add XP
 * VERSION: 8.0.0
 * UPDATED: 2024-09-08
 * DESCRIPTION: Adds a set amount of XP to all or targeted player character(s). Adds XP update note to the chat log.
 * TIP: Characters must have a player assigned (if default group is 'party') or be player-owned (if default group is 'company').
 * TIP: Default XP amount and reason can be preset in module settings, along with option to bypass prompt for XP amount each time.
 * TIP: Non-whole numbers are rounded off. Negative numbers are subtracted.
 ========== */
