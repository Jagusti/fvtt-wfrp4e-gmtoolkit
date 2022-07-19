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
  for (let member of testOptions.targetGroup) {
    // make sure to get the actor rather than the token document
    let actor = await fromUuid(member);
    actor = actor?.actor ? actor.actor : actor
    
    // stack tests rather than await: cancelling a non-silent test during an await(ed) call will abandon all subsequent tests
    let actorSkill = game.gmtoolkit.utility.hasSkill(actor, testSkill, "silent")
    if (actorSkill !== undefined) { 
      // Roll against the skill if the actor has it ...
      actor.setupSkill(actorSkill, {
        bypass: testOptions.bypass, 
        testModifier: testOptions.testModifier,
        rollMode: testOptions.rollMode,
        absolute: {difficulty: testOptions.difficulty},
        title : `${actorSkill.name} Test (${actor.name})`
      }).then(setupData => {actor.basicTest(setupData)});
    } else {
      // ... or conditionally fallback to underlying characteristic if they don't ...
      actorSkill = await game.wfrp4e.utility.findSkill(testSkill)
      // TODO: optionally step-adjust the difficulty in case of fallback
      if (actorSkill.advanced.value === "adv" && !testOptions.fallback) {
        ui.notifications.info(`${game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.AbortAdvancedSkillTest", {character: actor.name, skill: testSkill})}`)
        continue 
      }
      // ... rolling against the relevant characteristic instead
      let skillCharacteristic = game.wfrp4e.config.characteristics[actorSkill.characteristic.value]
      actor.setupCharacteristic(actorSkill.characteristic.value, {
        bypass: testOptions.bypass, 
        testModifier: testOptions.testModifier, 
        rollMode: testOptions.rollMode,
        absolute: {difficulty: testOptions.difficulty},
        title : `${skillCharacteristic} Test for ${actorSkill.name} (${actor.name})`
      }).then(setupData => {actor.basicTest(setupData)});
    }
  // TODO: #62 Aggregate skill check results
  }
}