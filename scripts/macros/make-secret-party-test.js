// === Set up test parameters
let targetSkill = "Perception";  // eg, basic skill
// let targetSkill = "Stealth (Rural)";  // eg, grouped skill
// let targetSkill = "Play (Lute)";  // eg, advanced skill

let silentTest = true;  // true: to bypass roll dialog and post results directly to chat using the following default options
// let silentTest = false;  // false: to use the native Roll Dialog for control over talents and other modifiers/bonuses, which may vary by character; 

// === Set default options for silent tests (ignored for interactive tests)
let rollMode = "blindroll" // choose from "gmroll", "blindroll", "selfroll",  "public"
let slBonus = 0
let successBonus = 0
let testModifier = +20 // game.wfrp4e.config.difficultyModifiers[("average")]
// --- testModifier can be numeric or reference built-in system difficultyModifiers 
// --- (eg, 'game.wfrp4e.config.difficultyModifiers[("average")]' for +20)
// --- accepted difficultyModifier values are listed in the REFERENCES section below

// === Carry out the test if you are a GM
if (game.user.isUniqueGM) 
    {makeSecretPartyTest(targetSkill)} 
else 
    {ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.MakeSecretPartyTest.NoPermission"), {})
};

// === Where the magic happens. 

async function makeSecretPartyTest(targetSkill) {
    let party = Array.from(game.actors).filter(a => a.hasPlayerOwner && a.type == "character");
    for (let pc of party) {
        // stack tests rather than await: cancelling a non-silent test during an await(ed) call will abandon all subsequent tests
        let pcSkill = game.gmtoolkit.utility.hasSkill(pc, targetSkill, "silent")
        if (pcSkill != null) { 
            // Roll against the skill if the actor has it ...
            pc.setupSkill(pcSkill, {bypass: silentTest, testModifier, slBonus, successBonus, rollMode, title : `${pcSkill.name} Test (${pc.name})`}).then(setupData => {pc.basicTest(setupData)});
        } else {
            // ... or fallback to underlying characteristic if they don't
            pcSkill = await game.wfrp4e.utility.findSkill(targetSkill)
            // TODO: optionally step-adjust the difficulty in case of fallback
            if (pcSkill.advanced.value == "adv" && !game.settings.get("wfrp4e-gm-toolkit", "fallbackAdvancedSkills")) {
                ui.notifications.info(`${game.i18n.format("GMTOOLKIT.Message.MakeSecretPartyTest.AbortAdvancedSkillTest", {character: pc.name, skill: targetSkill})}`)
                continue 
            }
            let skillCharacteristic = game.wfrp4e.config.characteristics[pcSkill.characteristic.value]
            pc.setupCharacteristic(pcSkill.characteristic.value, {bypass: silentTest, testModifier, slBonus, successBonus, rollMode, title : `${skillCharacteristic} Test for ${pcSkill.name} (${pc.name})`}).then(setupData => {pc.basicTest(setupData)});
        }        
    }
}

/* ==========
 * MACRO: Make Secret Party Test
 * VERSION: 0.8.0
 * UPDATED: 2021-12-31
 * DESCRIPTION: Macro template for GMs to run secret skill tests for their party. 
 * TIP: Create copies of this macro and adjust the parameters (and title and/or icon) for different skill tests. Add them to your macro bar for one-click resolution. 
 * TIP: By default, tests are rolled blind. Right-click a test result in the chat log to show the results to players.
 * TIP: You can use the results of a secret test in an opposed test as normal (using the double arrows in the chat log card.), such as secret Stealth v Perception tests
 ========== */

/* === REFERENCES: 
* --- Accepted difficultyModifier values that can be used for testModifier
* "veasy": "Very Easy (+60)",
* "easy": "Easy (+40)",
* "average": "Average (+20)",
* "challenging": "Challenging (+0)",
* "difficult": "Difficult (-10)",
* "hard": "Hard (-20)",
* "vhard": "Very Hard (-30)",
* "futile": "Futile (-40)" // requires Enemy in Shadows module
* "impossible": "Impossible (-50)" // requires Enemy in Shadows module
*/