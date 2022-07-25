checkConditions(endOfCombatRoundOnly = true, skipPCs = true)

async function checkConditions () {
  if (!game.user.isGM) return

  if (endOfCombatRoundOnly && !isEndOfRound()) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.CheckConditions.WaitForEndOfRound"))

  const tokens = game.gmtoolkit.utility.getGroup("tokens").filter(g => g.actor.conditions.length !== 0); console.log(tokens)
  const party = game.gmtoolkit.utility.getGroup("party").filter(g => g.conditions.length !== 0); console.log(party)

  const testOptions = {
    absolute : {difficulty: "challenging"}, 
    rollMode : "gmroll"
  }

  const removedConditions = []
  
  for await (const tokenActor of tokens) {
    if (skipPCs && party.includes(tokenActor.actor)) continue 
    testOptions.appendTitle = game.i18n.format("GMTOOLKIT.Dialog.CheckConditions.For",  {name: tokenActor.actor.name})

    for await (cond of tokenActor.actor.conditions) {
      await processConditionTest(tokenActor, testOptions, cond.conditionId, removedConditions)
    }
  }

  if (removedConditions.length !== 0) ChatMessage.create({ content: removedConditions.join("<br>") })

  return // END OF FUNCTION

  function isEndOfRound() {
    const combat = game.combat
    if (!combat) return false
    if (combat.data.round != 0 && combat.turns && combat.data.active) {
      return (combat.current.turn > -1 && combat.current.turn == combat.turns.length - 1)
    }
  }

  async function processConditionTest(tokenActor, testOptions, condition, removedConditions) {
    if (tokenActor.actor.type === "vehicle" && condition !== "ablaze") return;  // vehicles can burn, but not make condition tests
    const title = `${game.i18n.localize(game.wfrp4e.config.conditions[(condition)])}`
    const conditionCount = tokenActor.actor.hasCondition(condition).conditionValue;
    let conditionRemoved = ""
    let setupData = {};
    let conditionTest = {};
    let skill = {};
    // show the roll dialog for broken condition tests, so the difficulty can be correctly set
    // note: cancelling the roll dialog cancels any outstanding condition checks
    condition === "broken" ? testOptions.bypass = false : testOptions.bypass = true

    switch (condition) {
      case "surprised": // lose condition
        tokenActor.actor.removeCondition(condition);
        conditionRemoved = condition
        break;
      case "ablaze":  // lose 1d10-TB-AP+(condition-1) (min 1) Wounds
        // doesn't consider the least protected hit location, but does show how much damage is absorbed by AP for manual adjustment if desired
        const ablazeDamage = await new Roll(`1d10 + ${conditionCount} - 1`).evaluate();
        console.log(ablazeDamage)
        tokenActor.actor.applyBasicDamage(ablazeDamage.total, {});
        break;
      case "stunned": // challenging Endurance: remove 1+SL (min 1) condition
        // fall through: 
      case "poisoned": // challenging Endurance: remove 1+SL (min 1) condition 
        skill = game.gmtoolkit.utility.hasSkill(tokenActor.actor, game.i18n.localize("NAME.Endurance"), "silent");
        // setup test data
        if (skill !== undefined) {   // prefer Endurance test
          testOptions.title = game.i18n.format("GMTOOLKIT.Dialog.CheckConditions.Skill", {title: title, skill: game.i18n.localize("NAME.Endurance")});
          setupData = await tokenActor.actor.setupSkill(skill, testOptions)
        } 
        if (skill === undefined) {  // fallback to Toughness if no Endurance skill
          testOptions.title = game.i18n.format("GMTOOLKIT.Dialog.CheckConditions.Fallback", {title: title, char: game.i18n.localize("CHAR.T")});
          setupData = await tokenActor.actor.setupCharacteristic("t", testOptions) 
        }
        // process test
        await processConditionTest();
        break;
      case "broken":  // challenging Cool: remove 1+SL (min 1) condition
        skill = game.gmtoolkit.utility.hasSkill(tokenActor.actor, game.i18n.localize("NAME.Cool"), "silent");
        // setup test data
        if (skill !== undefined) {   // prefer Cool test
          testOptions.title = game.i18n.format("GMTOOLKIT.Dialog.CheckConditions.Skill", {title: title, skill: game.i18n.localize("NAME.Cool")});
          setupData = await tokenActor.actor.setupSkill(skill, testOptions)
        } 
        if (skill === undefined) {  // fallback to Willpower if no Cool skill
          testOptions.title = game.i18n.format("GMTOOLKIT.Dialog.CheckConditions.Fallback", {title: title, char: game.i18n.localize("CHAR.WP")});
          setupData = await tokenActor.actor.setupCharacteristic("t", testOptions) 
        }
        // process test
        await processConditionTest();
        break;
      default:
        break;
    }    
    // collect removed conditions
    if (conditionRemoved !== "") {
      removedConditions.push(
        game.i18n.format("CHAT.RemovedConditions", {
          condition: title,
          name: tokenActor.actor.name 
        })
      )
    }

    async function processConditionTest() {
      conditionTest = await tokenActor.actor.basicTest(setupData);
      if (conditionTest.succeeded) {
        tokenActor.actor.removeCondition(condition, Math.min(Number(conditionTest.result.SL) + 1, conditionCount));
        conditionRemoved = condition;
      }
      return conditionTest
    }
  } // end processConditionTest
}


/* ==========
* MACRO: Check Conditions
* VERSION: 0.9.4.2
* UPDATED: 2022-07-25
* DESCRIPTION: Process end of round condition checks. Automatically handle removal of Surprised condition, tests to remove Poisoned, Stunned and Broken conditions, and Ablaze damage (including to vehicles).
* TIP: Set `skipPCs = false` to automatically make condition checks for player-assigned characters. 
* TIP: Set `endOfCombatRoundsOnly = false` to use the macro in any combat round, or even outside combat. 
========== */
