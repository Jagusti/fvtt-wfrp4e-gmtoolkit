export async function launchGroupTest(groupOptions, testParameters) {
  new game.gmtoolkit.grouptest({groupOptions, testParameters}).render(true);
}


export async function runSilentGroupTest(groupOptions, testParameters) {
  const testSkill = testParameters?.testSkill || game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest")
  
  const testOptions = {
    bypass: testParameters?.bypass === undefined ? game.settings.get("wfrp4e-gm-toolkit", "bypassTestDialogGroupTest") : testParameters?.bypass,
    rollMode: testParameters?.rollMode || game.settings.get("wfrp4e-gm-toolkit", "defaultRollModeGroupTest"), 
    fallback: testParameters?.fallback === undefined ? game.settings.get("wfrp4e-gm-toolkit", "fallbackAdvancedSkills") : testParameters?.fallback
  }

  groupOptions.members = await getGroupMembers(groupOptions?.type)
  testOptions.targetGroup = groupOptions.members.controlled.length > 0 ? groupOptions.members.controlled : groupOptions.members.playerGroup

  if (testOptions.targetGroup.length === 0) {
    return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.MakeSecretGroupTest.NoGroup"))
  } 

  runGroupTest(testSkill, testOptions);
}

export async function getGroupMembers(groupType = game.settings.get("wfrp4e-gm-toolkit", "defaultPartyGroupTest")) {
  const members = {
    playerGroup: game.gmtoolkit.utility.getGroup(groupType).map(g => g.uuid),
    selected: game.gmtoolkit.utility.getGroup("company", {interaction : "selected", present: true}).map(g => g.uuid),
    npcTokens: game.gmtoolkit.utility.getGroup("npcTokens").map(g => g.document.uuid),
    controlled: canvas.tokens.placeables.filter(t => t._controlled & t.actor.type !== "vehicle").map(g => g.document.uuid)
  }
  return members
}


export async function runGroupTest(testSkill, testOptions) {
  await game.settings.set("wfrp4e-gm-toolkit", "aggregateResultGroupTest", [])
  let actorTestResult = ""

  for (let member of testOptions.targetGroup) {
    // make sure to get the actor rather than the token document
    let actor = await fromUuid(member);
    actor = actor?.actor ? actor.actor : actor
    actorTestResult = await runActorTest(actor, testSkill, testOptions)
  }
  return sendAggregateGroupTestResults(testSkill, testOptions);
}


async function sendAggregateGroupTestResults(testSkill, testOptions) {
  const summaryThreshold = await game.settings.get("wfrp4e-gm-toolkit","summariseResultsThresholdGroupTest")
  const groupTestResults = await game.settings.get("wfrp4e-gm-toolkit", "aggregateResultGroupTest")

  // Don't show a summary if a postive threshold isn't set or there are no test results
  if (summaryThreshold <= 0 || groupTestResults.length === 0) return 
  // Don't show a summary if there are test results, but fewer than the threshold
  if (groupTestResults.length < summaryThreshold) return

  let testParameters = `${game.i18n.localize("Difficulty")}: ${game.wfrp4e.config.difficultyLabels[testOptions.difficulty]}\n` +
    `${game.i18n.localize("Modifier")}: ${testOptions.testModifier}\n` +
    `${game.i18n.localize("GMTOOLKIT.Settings.GroupTest.bypassTestDialog.name")}: ${testOptions.bypass}\n` +
    `${game.i18n.localize("GMTOOLKIT.Settings.MakeSecretGroupTests.FallbackAdvanced.name")}: ${testOptions.fallback}\n` + 
    `${game.i18n.localize("DIALOG.DifficultyStep")}: ${game.settings.get("wfrp4e-gm-toolkit", "fallbackAdjustDifficulty")}\n` 

  let groupTestResultsMessage = `<h3><abbr title="${testParameters}">${game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.RollTitleSummary")}</abbr><strong>${testSkill}</strong></h3>`
  let actorTestResultMessage = ""

  for (let testResult of groupTestResults) {
    // build individual test result message 
    if (testResult.outcome === "success") actorTestResultMessage += `<i class='fas fa-check'></i> `
    actorTestResultMessage += 
      `<strong>${testResult.actor.name}:</strong> ` 
      + `<abbr title="${testResult.description}"><strong>${testResult.sl} SL</strong></abbr> (${testResult.roll} v ${testResult.target})`
    if (testResult.characteristic) actorTestResultMessage += ` [${game.i18n.localize(testResult.characteristic.abrev)}]`

    // transfer to group test message and nuke actor test message
    groupTestResultsMessage += `${actorTestResultMessage}</br>`
    actorTestResultMessage = ""
  }

  await ChatMessage.create({
    content: groupTestResultsMessage,
    whisper: game.users.filter((u) => u.isGM).map((u) => u.id)
  });
}


async function runActorTest(actor, testSkill, testOptions) {
  let actorSkill = game.gmtoolkit.utility.hasSkill(actor, testSkill, "silent")
  let setupData = {}

  // Roll against the skill if the actor has it ...
  if (actorSkill !== undefined) { 
    setupData = await actor.setupSkill(actorSkill, {
      bypass: testOptions.bypass, 
      testModifier: testOptions.testModifier,
      rollMode: testOptions.rollMode,
      absolute: {difficulty: testOptions.difficulty},
      title : game.i18n.format("GMTOOLKIT.Dialog.MakeSecretGroupTest.RollTitle", {skill: actorSkill.name, actor: actor.name}),
      groupTest: true
    })
    return actor.basicTest(setupData);
  } 

  // ... or conditionally fallback to underlying characteristic if they don't ...
  if (actorSkill === undefined) {
    actorSkill = await game.wfrp4e.utility.findSkill(testSkill)
    if (actorSkill.advanced.value === "bsc" || testOptions.fallback) {
      let skillCharacteristic = game.wfrp4e.config.characteristics[actorSkill.characteristic.value]
      
      // optionally step-adjust the difficulty in case of fallback on advanced skills
      const stepAdjustDifficulty = (actorSkill.advanced.value === "adv") ? game.settings.get("wfrp4e-gm-toolkit", "fallbackAdjustDifficulty") : 0
      const difficultySetting = (actorSkill.advanced.value === "adv" && stepAdjustDifficulty !== 0) ? 
        {modify: {difficulty: stepAdjustDifficulty}} : {absolute: {difficulty: testOptions.difficulty}}

      setupData = await actor.setupCharacteristic(actorSkill.characteristic.value, mergeObject({
        bypass: testOptions.bypass, 
        testModifier: testOptions.testModifier, 
        rollMode: testOptions.rollMode,
        title : game.i18n.format("GMTOOLKIT.Dialog.MakeSecretGroupTest.RollTitleFallback", {characteristic: skillCharacteristic, skill: actorSkill.name, actor: actor.name}),
        groupTest: true
      }, difficultySetting))
      return actor.basicTest(setupData);
    }
    return ui.notifications.info(`${game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.AbortAdvancedSkillTest", {character: actor.name, skill: testSkill})}`);
  }
}


// Intercept test result
Hooks.on("wfrp4e:rollTest", async function (testData, chatData) {
  if (testData.options.groupTest) {
    const groupTestResult = [] 
    groupTestResult.push(...game.settings.get("wfrp4e-gm-toolkit", "aggregateResultGroupTest"))

    const testResult = {
      actor : testData.token || testData.actor,
      skill : testData?.skill, 
      characteristic : testData?.characteristic,
      outcome : testData.outcome,
      sl : testData.result.SL,
      description : testData.result.description,
      roll : testData.result.roll,
      target : testData.target
    }
    await groupTestResult.push(testResult)     
    return await game.settings.set("wfrp4e-gm-toolkit", "aggregateResultGroupTest", groupTestResult)
  };
});
