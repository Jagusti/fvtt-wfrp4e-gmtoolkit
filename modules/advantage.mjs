import GMToolkit from "./gm-toolkit.mjs"
import { inActiveCombat } from "./utility.mjs"

export default class Advantage {

  /**
   * Entry point for adjustments to Advantage through .
   * @param {Object} character   :   Token
   * @param {string} adjustment  :   increase (+1), clear (=0), reduce (-1)
   * // TODO: add support for numeric adjustment values
   * @param {string} context     :   macro, wfrp4e:opposedTestResult, wfrp4e:applyDamage, createCombatant, preDeleteCombatant, createActiveEffect, loseMomentum
   * @returns {Array} update     :   outcome (String: increased, reduced, min, max, reset, no change),
   *                                 starting (Number: what the character's Advantage was at the start of the routine)
   *                                 new (Number: what the character's Advantage is at the end of the routine)
   **/
  static async update (character, adjustment, context = "macro") {
    // GUARDS. Exit if ...
    // TODO: add error message to set adjustment
    if (adjustment === null) return  // ... no adjustment set
    if (
      (character === undefined)  // ... no character set
      || (character?.document?.documentName !== "Token")  // ... not a Token.
      || (context === "macro" && canvas.tokens.controlled.length !== 1) // ... only one Token is not selected when using the macros
    ) {
      return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.SingleSelect"), { console: true })
    }
    // ... not in combat, unless clearing Advantage
    if (!character.inCombat && adjustment !== "clear") {
      return ui.notifications.error(`${game.i18n.format("GMTOOLKIT.Advantage.NotInCombat", { actorName: character.name, sceneName: game.scenes.viewed.name })}`, { console: true })
    }

    // Gather key character info into a single convenient object
    const characterInfo = { name: character.name }
    characterInfo.advantage = {
      personal: {
        current: character.actor.status.advantage.value,
        max: character.actor.status.advantage.max
      },
      group: {
        affiliation: character.actor.advantageGroup,
        current: await game.settings.get("wfrp4e", "groupAdvantageValues")[character.actor.advantageGroup]
      }
    }
    GMToolkit.log(false, characterInfo)

    // Make the adjustment to the token actor and capture the outcome
    const updatedAdvantage = await this.adjust(
      character,
      characterInfo.advantage.personal,
      adjustment
    )

    // Report the outcome to the user
    const update = await this.report(
      updatedAdvantage,
      character,
      characterInfo.advantage.personal,
      context
    )
    update.outcome = updatedAdvantage.outcome
    update.new = updatedAdvantage.new
    update.starting = updatedAdvantage.starting
    GMToolkit.log(false, update)
    return update
  }

  static async adjust (character, advantage, adjustment) {
    GMToolkit.log(false, `Attempting to ${adjustment} Advantage for ${character.name} from ${advantage.current}`)
    let outcome = ""

    switch (adjustment) {
      case "increase":
        if (game.settings.get("wfrp4e", "useGroupAdvantage")
          || advantage.max === undefined
          || advantage.current < advantage.max) {
          advantage.new = Number(advantage.current + 1)
          const updated = await updateCharacterAdvantage()
          updated ? outcome = "increased" : outcome = "nochange"
        } else {
          outcome = "max"
        }
        break
      case "reduce":
        if (advantage.current > 0) {
          advantage.new = Number(advantage.current - 1)
          const updated = await updateCharacterAdvantage();
          (updated) ? outcome = "reduced" : outcome = "nochange"
        } else {
          outcome = "min"
        }
        break
      case "clear":
        if (advantage.current === 0) {
          outcome = "min"
        } else {
          advantage.new = Number(0)
          const updated = await updateCharacterAdvantage();
          (updated) ? outcome = "reset" : outcome = "nochange"
        }
        break
    }
    return {
      outcome,
      starting: advantage.current,
      new: advantage.new
    }

    async function updateCharacterAdvantage () {
      let updated = ""

      if (!character.actor.isOwner) {
        return updated = await game.socket.emit(
          `module.${GMToolkit.MODULE_ID}`,
          {
            type: "updateAdvantage",
            payload: {
              character: character.actor.id,
              updateData: { "data.status.advantage.value": advantage.new }
            }
          }
        )

      } else {
        return updated = await character.actor.update({ "data.status.advantage.value": advantage.new })
      }
    }
  }

  static async report (updatedAdvantage, character, resourceBase, context) {
    const update = []
    const type = "info"
    const options = {
      permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications"),
      console: true
    }

    switch (context) {
      case "wfrp4e:opposedTestResult":
        if (updatedAdvantage.outcome === "increased") update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.WonOpposedTest", { actorName: character.name })
        if (updatedAdvantage.outcome === "reset") update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.LostOpposedTest", { actorName: character.name })
        break
      case "loseMomentum":
        update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.LoseMomentum", { actorName: character.name })
        break
      case "createCombatant":
        update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.AddedToCombat", { actorName: character.name })
        break
      case "preDeleteCombatant":
        update.context = game.i18n.format("GMTOOLKIT.Advantage.Context.RemovedFromCombat", { actorName: character.name })
        break
      default:
        break
    }

    switch (updatedAdvantage.outcome) {
      case "increased":
        update.notice = game.i18n.format("GMTOOLKIT.Advantage.Increased", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new })
        break
      case "reduced":
        update.notice = game.i18n.format("GMTOOLKIT.Advantage.Reduced", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, newAdvantage: updatedAdvantage.new })
        break
      case "reset":
        update.notice = game.i18n.format("GMTOOLKIT.Advantage.Reset", { actorName: character.name, startingAdvantage: updatedAdvantage.starting })
        break
      case "min":
        update.notice = game.i18n.format("GMTOOLKIT.Advantage.None", { actorName: character.name, startingAdvantage: updatedAdvantage.starting })
        break
      case "max":
        update.notice = game.i18n.format("GMTOOLKIT.Advantage.Max", { actorName: character.name, startingAdvantage: updatedAdvantage.starting, maxAdvantage: resourceBase.max })
        break
      case "nochange":
      default:
        update.notice = game.i18n.format("GMTOOLKIT.Message.UnexpectedNoChange")
        break
    }

    const message = (update.context ? update.context : "") + update.notice
    // Bypass individual player Advantage updates if Group Advantage is being used
    if (game.user.isGM && !(game.settings.get("wfrp4e", "useGroupAdvantage"))) ui.notifications.notify(message, type, options)
    // Force refresh the token hud if it is visible
    if (character.hasActiveHUD) {await canvas.hud.token.render(true)}
    update.context = (update.context) ? update.context : context
    return update
  }

  /**
   * Clears combatant flags set for increasing token Advantage during combat.
   * @param {Array} advantaged   :   Array of Combatant
   * @param {boolean} startOfRound  :   Unset sorAdvantage flag at end of round
   **/
  static unsetFlags (advantaged, startOfRound = false) {
    advantaged.filter(c => c.unsetFlag("wfrp4e-gm-toolkit", "advantage"))
    if (startOfRound) advantaged.filter(c => c.unsetFlag("wfrp4e-gm-toolkit", "sorAdvantage"))
    GMToolkit.log(false, "Advantage Flags: Unset.")
  }

  static async loseMomentum (combat, round) {
    let checkNotGained = "" // List of tokens that have not accrued advantage
    let checkGained = "" // List of tokens that have accrued advantage
    let noAdvantage = "" // List of tokens that have no advantage at the end of the round
    let combatantLine = "" // Html string for constructing dialog
    const combatantAdvantage = []

    combat.combatants.forEach(combatant => {
      combatantAdvantage.startOfRound = combatant.getFlag("wfrp4e-gm-toolkit", "sorAdvantage")
      // eslint-disable-next-line max-len
      combatantAdvantage.endOfRound = combatant.token.actor.system.status?.advantage?.value
      const checkToLoseMomentum
        = (combatantAdvantage.endOfRound - combatantAdvantage.startOfRound > 0)
          ? false
          : "checked"

      // TODO: Define and replace the inline styles within the stylesheet
      if (!combatantAdvantage.endOfRound) {
        noAdvantage += `<img src="${combatant.img}" style = "height: 2rem; border: none; padding-right: 2px; padding-left: 2px;" alt="${combatant.name}" title="${combatant.name}">&nbsp;${combatant.name}</img>`
      } else {
        combatantLine = `
                <div class="form-group">
                <input type="checkbox" id="${combatant.tokenId}" name="${combatant.tokenId}" value="${combatant.name}" ${checkToLoseMomentum}> 
                <img src="${combatant.img}" style = "height: 2rem; vertical-align : middle; border: none; padding-right: 6px; padding-left: 2px;" />
                <label for="${combatant.tokenId}" style = "text-align: left;  border: none;">  <strong>${combatant.name}</strong></label>
                <label for="${combatant.tokenId}"  style = "text-align: left;  border: none;"> ${combatantAdvantage.startOfRound} -> ${combatantAdvantage.endOfRound} </label>
                </div>
                `;
        (checkToLoseMomentum)
          ? checkNotGained += combatantLine
          : checkGained += combatantLine
      }
    })

    // Exit without prompt if no combatant has Advantage to lose
    if (checkGained === "" && checkNotGained === "") {
      const uiNotice = game.i18n.format("GMTOOLKIT.Message.Advantage.NoCombatantsWithAdvantage", { combatRound: round })
      if (game.user.isGM) {ui.notifications.notify(uiNotice, "info", { permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications") }, { console: true } )}
      return
    }

    // Explain empty dialog sections
    if (checkGained === "") checkGained = `<div class="form-group">${game.i18n.localize("GMTOOLKIT.Message.Advantage.NoCombatantsAccruedAdvantage")}</div>`
    if (checkNotGained === "") checkNotGained = `<div class="form-group">${game.i18n.localize("GMTOOLKIT.Message.Advantage.NoCombatantsNotAccruedAdvantage")}</div>`
    if (noAdvantage === "") noAdvantage = game.i18n.localize("GMTOOLKIT.Message.Advantage.NoCombatantsWithoutAdvantage")

    const templateData = {
      gained: checkGained,
      notgained: checkNotGained,
      none: noAdvantage
    }
    const dialogContent = await renderTemplate("modules/wfrp4e-gm-toolkit/templates/gm-toolkit-advantage-momentum.html", templateData)
    let lostAdvantage = ""

    new Dialog({
      title: game.i18n.format("GMTOOLKIT.Dialog.Advantage.LoseMomentum.Title", { combatRound: round }),
      content: dialogContent,
      buttons: {
        reduceAdvantage: {
          label: game.i18n.localize("GMTOOLKIT.Dialog.Advantage.LoseMomentum.Button"),
          callback: async html => {
            // Reduce advantage for selected combatants
            for ( const combatant of combat.combatants ) {
              if (html.find(`[name="${combatant.tokenId}"]`)[0]?.checked) {
                const token = canvas.tokens.placeables
                  .filter(a => a.id === combatant.tokenId)[0]
                const result = await this.update(token, "reduce", "loseMomentum")
                lostAdvantage += `${token.name}: ${result.starting} -> ${result.new} <br/>`
              }
            }
            // Confirm changes made in whisper to GM
            if (lostAdvantage !== "") {
              const chatData = game.wfrp4e.utility.chatDataSetup(lostAdvantage, "gmroll", false)
              chatData.flavor = game.i18n.format("GMTOOLKIT.Message.Advantage.LostMomentum", { combatRound: round })
              ChatMessage.create(chatData, {})
            }
          }
        },
        cancel: {
          label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel")
        }
      }
    }
    ).render(true)

    GMToolkit.log(false, "Lose Momentum at End of Round: Finished.")

  }

} // End Class


Hooks.on("wfrp4e:applyDamage", async function (scriptArgs) {
  GMToolkit.log(false, scriptArgs)
  if (!scriptArgs.opposedTest.defenderTest.context.unopposed) return // Only apply when Outmanouevring (ie, damage from an unopposed test).
  if (scriptArgs.opposedTest.attackerTest.preData.dualWielding) return // Exit if this is the first strike when Dual Wielding
  if (!game.settings.get(GMToolkit.MODULE_ID, "automateDamageAdvantage")) return
  if (!inActiveCombat(scriptArgs.opposedTest.attackerTest.actor)
    | !inActiveCombat(scriptArgs.opposedTest.defenderTest.actor)) return // Exit if either actor is not in the active combat

  const uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.Outmanoeuvre", { actorName: scriptArgs.actor.name, attackerName: scriptArgs.attacker.name, totalWoundLoss: scriptArgs.totalWoundLoss } )}`
  const message = uiNotice
  const type = "info"
  const options = { permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications"), console: true }

  if (game.user.isGM) {ui.notifications.notify(message, type, options)}

  // Clear advantage on actor that has taken damage when not using Group  Advantage
  if (!game.settings.get("wfrp4e", "useGroupAdvantage")) {
    const character = Array.from(game.combats.active.combatants)
      .filter(c => c.actor === scriptArgs.actor)[0]
      .token.object
    await Advantage.update(character, "clear", "wfrp4e:applyDamage" )
  }

  // Increase advantage on actor that dealt damage, as long as it has not already been updated for this test
  const character = Array.from(game.combats.active.combatants)
    .filter(c => c.actor === scriptArgs.attacker)[0]
    .token.object
  if (character.combatant.getFlag(GMToolkit.MODULE_ID, "advantage")?.outmanoeuvre !== scriptArgs.opposedTest.attackerTest.message.id) {
    await Advantage.update(character, "increase", "wfrp4e:applyDamage")

    if (!character.actor.isOwner) {
      await game.socket.emit(`module.${GMToolkit.MODULE_ID}`, {
        type: "setFlag",
        payload: {
          character: character.combatant,
          updateData: {
            flag: "advantage",
            key: "outmanoeuvre",
            value: scriptArgs.opposedTest.attackerTest.message.id
          }
        }
      })
    } else {
      await character.combatant.setFlag(GMToolkit.MODULE_ID, "advantage", { outmanoeuvre: scriptArgs.opposedTest.attackerTest.message.id })
    }

  } else {
    GMToolkit.log(true, `Advantage increase already applied to ${character.name} for outmanoeuvring.`)
  }

  GMToolkit.log(false, "Outmanoeuvring Advantage: Finished.")
})


Hooks.on("wfrp4e:opposedTestResult", async function (opposedTest, attackerTest, defenderTest) {
  GMToolkit.log(true, "wfrp4e:opposedTestResult", opposedTest, attackerTest, defenderTest)

  // For Group Advantage, handle tests which should not generate advantage
  if (
    game.settings.get("wfrp4e", "useGroupAdvantage") &&
    attackerTest.data?.result?.options?.preventAdvantage === true
  ) {
    GMToolkit.log(true, "No advantage gained for winning an opposed test that should not generate advantage.");
    return;
  }

  // CHARGING: Set Advantage flag if attacker and/or defender charged, and Group Advantage is not being used. Do this once before exiting for unopposed tests.
  if (!game.settings.get("wfrp4e", "useGroupAdvantage")) {
    // Flag attacker charging
    if (attackerTest.data.preData?.charging || attackerTest.data.result.other === game.i18n.localize("Charging")) {
      if (!attackerTest.actor.isOwner) {
        await game.socket.emit(`module.${GMToolkit.MODULE_ID}`, {
          type: "setFlag",
          payload: {
            character: Array.from(game.combats.active.combatants)
              .filter(c => c.actor === opposedTest.attacker)[0],
            updateData: {
              flag: "advantage",
              key: "charging",
              value: opposedTest.attackerTest.message.id
            }
          }
        })
      } else {
        await Array.from(game.combats.active.combatants)
          .filter(c => c.actor === opposedTest.attacker)[0]
          .setFlag(GMToolkit.MODULE_ID, "advantage", { charging: opposedTest.attackerTest.message.id })
      }
    }
    // Flag defender charging
    if (defenderTest.data.preData?.charging || defenderTest.data.result.other === game.i18n.localize("Charging")) {
      if (!defenderTest.actor.isOwner) {
        await game.socket.emit(`module.${GMToolkit.MODULE_ID}`, {
          type: "setFlag",
          payload: {
            character: Array.from(game.combats.active.combatants)
              .filter(c => c.actor === opposedTest.defender)[0],
            updateData: {
              flag: "advantage",
              key: "charging",
              value: opposedTest.attackerTest.message.id
            }
          }
        })
      } else {
        await Array.from(game.combats.active.combatants)
          .filter(c => c.actor === opposedTest.defender)[0]
          .setFlag(GMToolkit.MODULE_ID, "advantage", { charging: opposedTest.attackerTest.message.id })
      }
    }
  } // END: Flag for CHARGING

  // WINNING: Update Advantage for Opposed Tests
  if (defenderTest.context.unopposed) return // Unopposed Test. Advantage from outmanouevring is handled if damage is applied (on wfrp4e:applyDamage hook)
  if (attackerTest.preData.dualWielding) return // Exit if this is the first strike when Dual Wielding
  if (!game.settings.get(GMToolkit.MODULE_ID, "automateOpposedTestAdvantage")) return

  const attacker = attackerTest.actor
  const defender = defenderTest.actor
  if (!inActiveCombat(attacker) | !inActiveCombat(defender)) return // Exit if either actor is not in the active combat

  const winner = opposedTest.result.winner === "attacker" ? attacker : defender
  const loser = opposedTest.result.winner === "attacker" ? defender : attacker

  const uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.OpposedTest", { winner: winner.name, loser: loser.name } )}`
  const message = uiNotice
  const type = "info"
  const options = { permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications"), console: true }

  if (game.user.isGM) {ui.notifications.notify(message, type, options)}

  // Clear advantage on actor token that has lost opposed test when not using Group Advantage
  if (!game.settings.get("wfrp4e", "useGroupAdvantage")) {
    const character = Array.from(game.combats.active.combatants)
      .filter(c => c.actor === loser)[0]
      .token.object
    await Advantage.update(character, "clear", "wfrp4e:opposedTestResult" )
  }

  // Increase advantage on actor token that has won opposed test, as long as it has not already been updated for this test.
  const character = Array.from(game.combats.active.combatants)
    .filter(c => c.actor === winner)[0]
    .token.object
  if (character.combatant.getFlag(GMToolkit.MODULE_ID, "advantage")?.opposed !== opposedTest.attackerTest.message.id) {
    if (game.settings.get("wfrp4e", "useGroupAdvantage") === true && character.actor !== attacker) {
      GMToolkit.log(true, "No advantage gained for winning an opposed test you did not initiate.")
    } else {
      const resolution = await Advantage.update(character, "increase", "wfrp4e:opposedTestResult")
      if (!winner.isOwner) {
        await game.socket.emit(`module.${GMToolkit.MODULE_ID}`, {
          type: "setFlag",
          payload: {
            character: character.combatant,
            updateData: {
              flag: "advantage",
              key: "opposed",
              value: opposedTest.attackerTest.message.id
            }
          }
        })
        GMToolkit.log(true, "Advantage: wfrp4e:OpposedTestResult. Socket update resolved.", resolution )
      } else {
        await character.combatant
          .setFlag(GMToolkit.MODULE_ID, "advantage",
            { opposed: opposedTest.attackerTest.message.id }
          )
      }
    }
  } else {
    GMToolkit.log(true, `Advantage increase already applied to ${character.name} for winning opposed test.`)
  }

  GMToolkit.log(true, "Advantage: Opposed Test. Finished.")
})


// Intercept when an actor gets a condition during combat
Hooks.on("createActiveEffect", async function (conditionEffect) {
  GMToolkit.log(false, conditionEffect)
  // GUARDS. Exit if ...
  if (!game.settings.get(GMToolkit.MODULE_ID, "automateConditionAdvantage")) return // ... not using condition automation
  if (game.settings.get("wfrp4e", "useGroupAdvantage")) return // ... Group Advantage is in play
  if (!game.user.isUniqueGM) return // ... not a GM
  if (!conditionEffect.parent.inCombat) return // ... not in combat
  if (!conditionEffect.isCondition) return  // ... not a system recognised condition
  const nonConditions = ["dead", "fear", "grappling", "engaged"]
  const condId = conditionEffect.conditionId
  if (nonConditions.includes(condId)) return // ... not a core rules combat condition

  // Clear Advantage
  const token = canvas.tokens.placeables.filter(
    t => conditionEffect.parent.id === (t?.actor?.id || t?.document?.id)
  )[0]
  await Advantage.update(token, "clear", "createActiveEffect")

  // Notification declarations
  const uiNotice = `${game.i18n.format("GMTOOLKIT.Advantage.Automation.Condition", { character: conditionEffect.parent.name, condition: conditionEffect.displayLabel } )}`
  const message = uiNotice
  const type = "info"
  const options = {
    permanent: game.settings.get(GMToolkit.MODULE_ID, "persistAdvantageNotifications"),
    console: true
  }
  if (game.user.isGM) {ui.notifications.notify(message, type, options)}
})


Hooks.on("createCombatant", function (combatant) {
  // ADDING TO COMBAT: clear token Advantage only if enabled, and Group Advantage is not being used.
  // If Group Advantage is used, the system handles syncing individual advantage with the group
  if (game.user.isUniqueGM && game.settings.get(GMToolkit.MODULE_ID, "clearAdvantageCombatJoin") && !game.settings.get("wfrp4e", "useGroupAdvantage")) {
    const token = canvas.tokens.placeables
      .filter(a => a.id === combatant.tokenId)[0]
    Advantage.update(token, "clear", "createCombatant")
    Advantage.unsetFlags([combatant])
  }
})

Hooks.on("deleteCombatant", function (combatant) {
  if (game.user.isUniqueGM && game.settings.get(GMToolkit.MODULE_ID, "clearAdvantageCombatLeave")) {
    const token = canvas.tokens.placeables
      .filter(a => a.id === combatant.tokenId)[0]
    Advantage.update(token, "clear", "deleteCombatant")
  }
})


Hooks.on("preUpdateCombat", async function (combat, change) {
  if (!game.user.isUniqueGM || !combat.combatants.size || !change.round) return
  if (combat.round > change.round) return // Exit if going backwards through combat

  // Lose Momentum: proceed only if enabled, and Group Advantage is not being used
  if (game.settings.get(GMToolkit.MODULE_ID, "promptMomentumLoss") && !game.settings.get("wfrp4e", "useGroupAdvantage")) {
    // Check for momentum (actor has more Advantage at the end of the round than at start)
    GMToolkit.log(false, "preUpdateCombat: compare Advantage at start and end of round")
    if (
      combat.previous.round != null
      || (combat.previous.round == null && combat.round > 0)
    ) {
      const round = (change.turn) ? combat.previous.round : combat.current.round
      if (round > 0) Advantage.loseMomentum(combat, round)
    }
  }

  // Clear Advantage flags when the combat round changes
  // Still required when Group Advantage is used because of Opposed Test flags
  GMToolkit.log(true, "preUpdateCombat: unsetting Advantage flags")
  const advFlagged = combat.combatants.filter(c => c.getFlag("wfrp4e-gm-toolkit", "advantage"))
  if (advFlagged.length) await Advantage.unsetFlags(advFlagged)
})


Hooks.on("updateCombat", async function (combat, change) {
  if (!combat.round || !game.user.isUniqueGM || !combat.combatants.size) return
  if (!change.round) return // Exit if this isn't the start of a round

  GMToolkit.log(false, "updateCombat: Setting startOfRound flag")
  // Skip individual start of round Advantage tracking if Group Advantage is being used
  if (combat.turns && combat.isActive && !game.settings.get("wfrp4e", "useGroupAdvantage")) {
    combat.combatants.forEach(async c => {
      await c.setFlag("wfrp4e-gm-toolkit", "sorAdvantage", c.token.actor.system.status?.advantage?.value ?? 0)
      GMToolkit.log(false, `${c.name}:  ${c.getFlag("wfrp4e-gm-toolkit", "sorAdvantage")}`)
    })
  }
})
