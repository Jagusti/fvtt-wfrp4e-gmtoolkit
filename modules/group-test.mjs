// TODO: Add support for bypassing the Set up Group Test dialog (silentTest)
// TODO: Update Secret Group Test macro
// TODO: Add guard for no eligible group members
// TODO: Add guard for non-GM exectuor

/* 
// === Set up group 
const groupType = "party";  // choose from, eg, "party", "company"
// const present = true; // choose from (to only include actors in the viewed scene): undefined, true or false 
// const interaction = undefined;  // choose from: undefined, "selected", "targeted"

const group = game.gmtoolkit.utility.getGroup(groupType).filter(
    g => (
        g.documentName !== "User" && 
        g.actor?.type !== "vehicle" && 
        g.type !== "vehicle"
        )
    );
// Exit with error if no actors in group
if (!group.length) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.MakeSecretGroupTest.NoGroup"))

// === Set up test parameters
const testSkill = "Perception";  // eg, basic skill
// const testSkill = "Stealth (Rural)";  // eg, grouped skill
// const testSkill = "Play (Lute)";  // eg, advanced skill

const silentTest = true;  // true: to bypass roll dialog and post results directly to chat using the following default options
// const silentTest = false;  // false: to use the native Roll Dialog for control over talents and other modifiers/bonuses, which may vary by character; 

// === Set default options for silent tests (ignored for interactive tests)
const rollMode = "blindroll" // choose from "gmroll", "blindroll", "selfroll",  "public"
const testModifier = +20 // game.wfrp4e.config.difficultyModifiers[("average")]
const difficulty = "default" // or game.wfrp4e.config.difficultyModifiers[("average")]
// --- difficulty can be "default" or reference built-in system difficultyModifiers 
// --- (eg, 'game.wfrp4e.config.difficultyModifiers[("average")]' for +20)
// --- "default" leaves the group test setup option blank, and uses the system setting for determining default difficulty
// --- accepted difficultyModifier values are listed in the REFERENCES section below

// === Carry out the test if you are a GM
if (game.user.isGM) 
    {makeSecretGroupTest(testSkill)} 
else 
    {ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.MakeSecretGroupTest.NoPermission"), {})};
 */

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
  const groupTestResults = await game.settings.get("wfrp4e-gm-toolkit", "aggregateResultGroupTest")

  let testParameters = `${game.i18n.localize("Difficulty")}: ${game.wfrp4e.config.difficultyLabels[testOptions.difficulty]}\n` +
    `${game.i18n.localize("Modifier")}: ${testOptions.testModifier}\n` +
    `${game.i18n.localize("GMTOOLKIT.Settings.GroupTest.bypassTestDialog.name")}: ${testOptions.bypass}\n` +
    `${game.i18n.localize("GMTOOLKIT.Settings.MakeSecretGroupTests.FallbackAdvanced.name")}: ${testOptions.fallback}` 
  let groupTestResultsMessage = `<h3><abbr title="${testParameters}">Group Test:</abbr> <strong>${testSkill}</strong></h3>`
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
      title : `${actorSkill.name} Test (${actor.name})`,
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
        title : `${skillCharacteristic} Test for ${actorSkill.name} (${actor.name})`,
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
