import GMToolkit from "./gm-toolkit.mjs"
import { getGroup } from "./utility.mjs"

export async function launchGroupTest (groupOptions, testParameters) {
  new game.gmtoolkit.grouptest({ groupOptions, testParameters }).render(true)
}


export async function runSilentGroupTest (groupOptions, testParameters) {
  const testSkill = testParameters?.testSkill || game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest")

  const testOptions = {
    bypass: testParameters?.bypass === undefined ? game.settings.get("wfrp4e-gm-toolkit", "bypassTestDialogGroupTest") : testParameters?.bypass,
    rollMode: testParameters?.rollMode || game.settings.get("wfrp4e-gm-toolkit", "defaultRollModeGroupTest"),
    fallback: testParameters?.fallback === undefined ? game.settings.get("wfrp4e-gm-toolkit", "fallbackAdvancedSkills") : testParameters?.fallback
  }

  groupOptions.members = await getGroupMembers(groupOptions?.type)
  const targetGroup
    = (groupOptions.members.controlled.length > 0)
      ? groupOptions.members.controlled
      : groupOptions.members.playerGroup

  if (targetGroup.length === 0) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.MakeSecretGroupTest.NoGroup"), { console: true })
  }

  testOptions.targetGroup = targetGroup

  runGroupTest(testSkill, testOptions)
}

export async function getGroupMembers (groupType = game.settings.get("wfrp4e-gm-toolkit", "defaultPartyGroupTest")) {
  const members = {
    playerGroup: game.gmtoolkit.utility.getGroup(groupType).map(g => g.uuid),
    selected: game.gmtoolkit.utility.getGroup("company", { interaction: "selected", present: true }).map(g => g.uuid),
    npcTokens: game.gmtoolkit.utility.getGroup("npcTokens").map(g => g.document.uuid),
    controlled: canvas.tokens.placeables.filter(t => t.controlled & t.actor.type !== "vehicle").map(g => g.document.uuid)
  }
  return members
}


export async function runGroupTest (testSkill, testOptions) {
  await game.settings.set("wfrp4e-gm-toolkit", "aggregateResultGroupTest", [])
  let actorTestResult = ""
  const activePlayers = getGroup("assigned", { active: true })
  const targetGroup = (testOptions.targetGroup.filter(member => member !== null))

  for (const member of targetGroup) {
    // Make sure to get the actor rather than the token document
    let actor = await fromUuid(member)
    actor = actor?.actor ? actor.actor : actor

    if (testOptions?.difficulty === undefined) {
      // Overrides default difficulty to Average depending on module setting and combat state
      let difficulty = "challenging"
      if (game.settings.get("wfrp4e", "testDefaultDifficulty") && (game.combat != null))
        difficulty = game.combat.started ? "challenging" : "average"
      else if (game.settings.get("wfrp4e", "testDefaultDifficulty"))
        difficulty = "average"
      testOptions.difficulty = difficulty
    }

    // Delegate tests to active assigned players
    if (!testOptions.bypass
      && activePlayers.map(p => p.character.uuid).includes(member)) {

      const requestData = {
        type: "requestRoll",
        payload: {
          character: actor,
          test: {
            type: "skill",
            against: testSkill,
            options: testOptions
          }
        }
      }
      await game.socket.emit(`module.${GMToolkit.MODULE_ID}`, requestData)
    } else {
      // Don't delegate if character player is not active or roll dialog is not bypassed
      actorTestResult = await runActorTest(actor, testSkill, testOptions)
    }
  }

  if (game.settings.get("wfrp4e-gm-toolkit", "aggregateResultGroupTest").length > 0) {
    sendAggregateGroupTestResults(testSkill, testOptions)
  }

}


async function sendAggregateGroupTestResults (testSkill, testOptions) {
  const summaryThreshold = await game.settings.get("wfrp4e-gm-toolkit", "summariseResultsThresholdGroupTest")
  const groupTestResults = await game.settings.get("wfrp4e-gm-toolkit", "aggregateResultGroupTest")

  // Don't show a summary if a positive threshold isn't set or there are no test results
  if (summaryThreshold <= 0 || groupTestResults.length === 0) return
  // Don't show a summary if there are test results, but fewer than the threshold
  if (groupTestResults.length < summaryThreshold) return

  let testParameters = `${game.i18n.localize("Difficulty")}: ${game.wfrp4e.config.difficultyLabels[testOptions.difficulty]}\n`
    + `${game.i18n.localize("Modifier")}: ${testOptions.testModifier}\n`
    + `${game.i18n.localize("GMTOOLKIT.Settings.GroupTest.bypassTestDialog.name")}: ${testOptions.bypass}\n`
    + `${game.i18n.localize("GMTOOLKIT.Settings.MakeSecretGroupTests.FallbackAdvanced.name")}: ${testOptions.fallback}\n`
    + `${game.i18n.localize("DIALOG.DifficultyStep")}: ${game.settings.get("wfrp4e-gm-toolkit", "fallbackAdjustDifficulty")}\n`

  let groupTestResultsMessage = `<h3><abbr title="${testParameters}">${game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.RollTitleSummary")}</abbr><strong>${testSkill}</strong></h3>`
  let actorTestResultMessage = ""

  for (let testResult of groupTestResults) {
    // Build individual test result message
    if (testResult.outcome === "success") actorTestResultMessage += "<i class='fas fa-check'></i> "
    actorTestResultMessage
      += `<strong>${testResult.actor.name}:</strong> `
      + `<abbr title="${testResult.description}"><strong>${testResult.sl} SL</strong></abbr> (${testResult.roll} v ${testResult.target})`
    if (testResult.characteristic) actorTestResultMessage += ` [${game.i18n.localize(game.wfrp4e.config.characteristics[testResult.characteristic])
    }]`

    // Transfer to group test message and nuke actor test message
    groupTestResultsMessage += `${actorTestResultMessage}</br>`
    actorTestResultMessage = ""
  }

  await ChatMessage.create({
    content: groupTestResultsMessage,
    whisper: game.users.filter(u => u.isGM).map(u => u.id)
  })

  // clean up aggregate results pseudo-setting
  await game.settings.set("wfrp4e-gm-toolkit", "aggregateResultGroupTest", [])
}


export async function runActorTest (actor, testSkill, testOptions) {
  let actorSkill = game.gmtoolkit.utility.hasSkill(actor, testSkill, "silent")
  let setupData = {
    bypass: testOptions.bypass,
    fields: {
      modifier: testOptions?.testModifier || 0,
      rollMode: testOptions.rollMode,
      // TODO: set difficulty selection to system default when bypassing dialog
      difficulty: testOptions.difficulty
    },
    groupTest: true,
    title: game.i18n.format("GMTOOLKIT.Dialog.MakeSecretGroupTest.RollTitle", { skill: actorSkill?.name, actor: actor.name })
  }

  // Roll against the skill if the actor has it ...
  if (actorSkill !== undefined) {
    const skillTest = await actor.setupSkill(actorSkill, setupData)
    return skillTest.roll()
  }

  // ... or conditionally fallback to underlying characteristic if they don't ...
  if (actorSkill === undefined) {
    actorSkill = await game.wfrp4e.utility.findSkill(testSkill)
    if (actorSkill.advanced.value === "bsc" || testOptions.fallback) {
      const skillCharacteristic = game.wfrp4e.config
        .characteristics[actorSkill.characteristic.value]

      // Optionally step-adjust the difficulty in case of fallback on advanced skills
      const stepAdjustDifficulty
        = (actorSkill.advanced.value === "adv")
          ? game.settings.get("wfrp4e-gm-toolkit", "fallbackAdjustDifficulty")
          : 0
          // TODO: Refactor to use wfrp4e.utility.alterDifficulty
      const difficultySetting
        = (actorSkill.advanced.value === "adv" && stepAdjustDifficulty !== 0)
          ? { modify: { difficulty: stepAdjustDifficulty } }
          : { absolute: { difficulty: testOptions.difficulty } }
      const dialogFallbackTitle = {
        title: game.i18n.format("GMTOOLKIT.Dialog.MakeSecretGroupTest.RollTitleFallback",
          { characteristic: skillCharacteristic,
            skill: actorSkill.name,
            actor: actor.name
          })
      }

      const characteristicTest = await actor.setupCharacteristic(
        actorSkill.characteristic.value,
        foundry.utils.mergeObject(setupData, dialogFallbackTitle, difficultySetting)
      )
      return characteristicTest.roll()
    }
    return ui.notifications.info(`${game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.AbortAdvancedSkillTest", { character: actor.name, skill: testSkill })}`, { console: true } )
  }
}

/**
 * Incrementally updates a world-scoped setting after each actor test
 * @param {Object} actorTestResult
 * @returns {Object} setting: aggregateResultGroupTest
 */
export async function updateGroupTestResults (actorTestResult) {
  await game.settings.set(
    "wfrp4e-gm-toolkit",
    "aggregateResultGroupTest",
    actorTestResult
  )

  return GMToolkit.log(
    true,
    "updateGroupTestResults",
    game.settings.get(GMToolkit.MODULE_ID, "aggregateResultGroupTest")
  )
}

// Intercept test result
Hooks.on("wfrp4e:rollTest", async function (testData, chatData) {
  if (testData.options.groupTest) {
    const groupTestResult = []
    await groupTestResult.push(...game.settings.get("wfrp4e-gm-toolkit", "aggregateResultGroupTest"))

    const testResult = {
      actor: testData.token || testData.actor,
      skill: testData?.skill,
      // characteristic: ( testData?.characteristic ? testData?.characteristicKey ),
      outcome: testData.outcome,
      sl: testData.result.SL,
      description: testData.result.description,
      roll: testData.result.roll,
      target: testData.target
    }

    if (testData?.characteristic) (
      testResult.characteristic = testData.characteristicKey
    )

    await groupTestResult.push(testResult)
    // GMToolkit.log(true, "groupTestResult: this test result", testResult)
    // GMToolkit.log(true, "groupTestResult: groupTestResult", groupTestResult)

    if (game.user.isUniqueGM) {
      return await updateGroupTestResults(groupTestResult)
    } else {
      return game.socket.emit(`module.${GMToolkit.MODULE_ID}`,
        { type: "aggregateGroupTestResults", payload: groupTestResult })
    }

  }
})

