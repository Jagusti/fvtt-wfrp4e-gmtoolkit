// === Set up test parameters
let targetSkill = 'Gossip';  // eg, 'Perception' or 'Stealth (Urban)'
let silentTest = true;  
// false: to use the native Roll Dialog for control over talents and other modifiers/bonuses, which may vary by character; 
// true: to bypass roll dialog and post results directly to chat using the following default options 

// === Set default options for silent tests (ignored for interactive tests)
let rollMode = 'blindroll' // choose from 'gmroll', 'blindroll', 'selfroll',  'public'
let slBonus = 0
let successBonus = 0
let testModifier = +20 // game.wfrp4e.config.difficultyModifiers[('average')]
// --- testModifier can be numeric or reference built-in system difficultyModifiers 
// --- (eg, "game.wfrp4e.config.difficultyModifiers[('average')]" for +20)
// --- accepted difficultyModifier values are listed in the REFERENCES section below

// === Carry out the test if you are a GM
if (game.user.isGM) 
    {makeSecretPartyTest(targetSkill)} 
else 
    {ui.notifications.error(game.i18n.localize('GMTOOLKIT.Message.MakeSecretPartyTest.NoPermission'), {})
};

// === Where the magic happens. 

async function makeSecretPartyTest(targetSkill) {
    let party = Array.from(game.actors).filter(a => a.hasPlayerOwner && a.type == 'character');
    for (let pc of party) {
    let pcSkill = pc.items.find(i => i.name === targetSkill && i.type == "skill");
        if (pcSkill != null) { 
            // ui.notifications.info(pc.name + ': ' + pcSkill.name)        
            // stack these rather than await: cancelling a non-silent test during an await(ed) call will abandon all subsequent tests
            pc.setupSkill(pcSkill, {bypass: silentTest, testModifier, slBonus, successBonus, rollMode, title : pcSkill.name + ` Test (` + pc.name + `)`}).then(setupData => {pc.basicTest(setupData)});
        } else
        {
            // console.log(pc.name + ' does not have ' + targetSkill)}
            ui.notifications.info(pc.name + ' does not have ' + targetSkill)
        }        
    }
}

/* ==========
 * MACRO: Make Secret Party Test
 * VERSION: 0.7.0
 * UPDATED: 2021-08-07
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