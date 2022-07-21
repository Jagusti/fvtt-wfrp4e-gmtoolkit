/* === Set Target Group === */
const groupOptions = {
  // type: "company" // options: "party" (default: player-assigned characters), "company" (PCs plus player-owned characters, eg henchmen)
  }
  
/* === Set Test Parameters === */
const testParameters = {
  // testSkill: "Stealth (Rural)",  // eg, "Perception", "Evaluate", "Lore (Reikland)". 
  // rollMode : "public",  // choose from "blindroll" (default), "gmroll", "selfroll",  "public"
  // testModifier: -10,  // any +/- integer (0: default)
  // difficulty: "difficult",  // options: "default" (default) or system difficultyModifiers (see reference at end)
  // bypass: false,  // options: true (default), false
  // fallback: false,  // options: true (default), false
  }

/* === Interactive or Silent Test === */
const interactive = true // set false to bypass Set up Group Test user interface (must set {testParameters.testSkill})

/* === Guard === */
// Exit with notice if no actors in group
if (!game.user.isGM) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Message.MakeSecretGroupTest.NoPermission"))

/* === Run Group Test === */
// RUN SILENT TEST
if (!interactive) return game.gmtoolkit.grouptest.silent(groupOptions, testParameters)
// LAUNCH USER INTERFACE
new game.gmtoolkit.grouptest.launch({groupOptions, testParameters}).render(interactive);


/* ==========
 * MACRO: Make Secret Group Test
 * VERSION: 0.9.4
 * UPDATED: 2022-07-21
 * DESCRIPTION: Quckly roll and report group skill tests for player and non-player characters. 
 * TIP: Default options for Quick Test and custom skills can be set in module settings. 
 * TIP: By default, tests are rolled blind. Right-click a test result in the chat log to show the results to players.
 * TIP: You can use the results of a secret test in an opposed test (such as secret Stealth v Perception tests) as normal. Use the double arrows in the chat log card, or roll a group test when Opposing with Targets.
 * TIP: Set interactive = false to bypass the Set up Group Test user interface and use defaults in module settings
 ========== */

/* === REFERENCE: DIFFICULTY MODIFIER
--- difficulty can be "default" or reference built-in system difficultyModifiers, eg, "average", etc
  * "default" (in quotes) leaves the group test setup option blank, and uses the system setting for determining default difficulty
--- Accepted difficultyModifiers (replacing "default") and their standard interpretation are
  * "veasy": "Very Easy (+60)",
  * "easy": "Easy (+40)",
  * "average": "Average (+20)",
  * "challenging": "Challenging (+0)",
  * "difficult": "Difficult (-10)",
  * "hard": "Hard (-20)",
  * "vhard": "Very Hard (-30)",
  * "futile": "Futile (-40)" // requires Enemy in Shadows module
  * "impossible": "Impossible (-50)" // requires Enemy in Shadows module
--- Modifier values may vary if using homebrew settings, such as MooMan's symmetric Difficulty Options
*/