# Changelog
All notable changes to this project will be documented in this file.  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## Unreleased
See [Issue Backlog](../../issues) and [Roadmap](../../milestones).

## [Version 7.0.1](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/7.0.1)  (2024-06-11)
* *Added* pack compiler to release workflow to ensure compendium packs are included in module package. [[#265](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/265)]

## [Version 7.0.0](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/7.0.0)  (2024-06-11)
* *Changed* compendium packs from `nedb` to `leveldb` format.  This database format is used from Foundry v11, and this change breaks GM Toolkit compatibility with earlier versions of Foundry. [#247](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/247)
* Fix Group Test to work with roll dialog changes from WFRP4e 7.1.5.
* *Changed* **minimum compatibility requirements** to Foundry VTT v11.315 and WFRP4e 7.1.5.
* *Updated* package dependencies and linting rules. [#248](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/248)
* *Updated* Japanese translations (thanks @doumoku!) [#245](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/245)
* *Fixed* incorrect notification of Advantage change when condition is applied outside of combat. [#249](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/249)
* *Fixed* Make Secret Group Tests to clean up temporarily stored results after posting test results to chat [#255](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/255)
* *Added* feature to delegate group test rolls for assigned characters to active (logged-in) players.
  * The GM will need to select the "Bypass Roll Dialog" option when making a Group Test.
  * Players should complete their rolls before the GM to have their roll results included in the summary group test result message.
* *Fixed* group advantage for actors where GM is not explicitly an owner. Thanks @Forien! [#237](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/237) [#250](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/250) [#262](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/262)
* *Fixed* example in Group Test settings for fallback difficulty adjustment.
* *Added* check to prevent advantage gain when Group Advantage is enabled and opposed test should not generate advantage when using Token Action HUD WFRP4e. Thanks @Forien! [#263](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/263)

## [Version 6.0.5](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/6.0.5)  (2023-09-03)
* *Added* compatibility for FVTT v11. [#241](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/241)
* *Updated* word-wrap dependency version. [#238](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/238)

## [Version 6.0.4](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/6.0.4)  (2023-06-04)
* *Added* compatibility for FVTT v11. [#228](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/228)
* *Changed* **minimum compatibility requirements** to Foundry VTT v10.291 and WFRP4e 6.5.7.
* *Added* support for setting non-integer default ranges for normal and dark vision. [#223](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/223) 
* *Changed* Group Test actor roll test functions to avoid deprecated system roll test functions. [#226](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/226)
* *Added* v11 support for Toggle Compendium Pack Visibility, based on ownership permissions. [#225](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/225) 

## [Version 6.0.3](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/6.0.3)  (2023-04-25)
* *Fixed* issue where Advantage was not applied on opposed or unopposed tests. [#217](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/217)
* *Added* macro to change scene grid to 2 yards, keeping lighting at scale. Useful for maps created for other game systems that have a grid of 5ft, or any other grid size.  Thanks @AncAinu! [#189](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/189)
* *Changed* Set Token Vision and Light Macro to improve appearance, including reducing animation intensity, speed and luminosity for various light effects and reverting tint and monochrome effect on Night Vision. [#219](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/219)

## [Version 6.0.2](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/6.0.2)  (2023-04-17)
* *Changed* **minimum compatibility requirements** to Foundry VTT v10.291 and WFRP4e 6.4.0.
* *Added* compatibility with `Engaged` pseudo-condition, so that when a character becomes Engaged and this condition is added, they do not lose their Advantage. [#206](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/206)
* *Added* a new context menu option to chat messages to edit flavour text. [#207](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/207)
* *Added* a quick launch macro to easily access GM Toolkit Settings without having to navigate Foundry configuration menus. [#203](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/203)
* *Fixed* issue where Add XP macro uses default group setting for Group Tests rather than Session Turnover. [#201](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/201)
*  *Fixed* issue where a character would gain an advantage boost for their first melee or ranged strike when using the Dual Wielder talent. [#205](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/205)
*  *Fixed* issue where an actor is identified as being in combat even though they are not in the combat tracker, leading to a false notification that an Advantage update is pending for winning an opposed test. [#213](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/213)

## [Version 6.0.1](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/6.0.1) (2022-10-13)
* *Changed* **minimum compatibility requirements** to Foundry VTT v10.288 and WFRP4e 6.1.4.
* *Added* headline features (with wiki links) to README to make it easier for users to get an overview of what's available in the Toolkit suite. [`2da77fa`](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/commit/2da77fa27c40ce9f93d5234ba519b25da0df5e55) [#178](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/178) [#197](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/197) 
* *Added* advice about replacing macro hotbar shortcuts to avoid compatibility issues. [#181](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/181)
* *Fixed* issue where Launch Damage Console was not translated in Toolkit Maintenance dialog. [#177](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/177)
* *Fixed* issue where Toolkit Maintenance would not show compendium versions of macros. [#176](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/176)
* *Fixed* issue where the game would not be paused for connected players when the GM ran the Session Turnover macro. [#182](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/182)
* *Added* Polish localization. Thanks [@twisniowski](https://github.com/twisniowski) and [@silentmark](https://github.com/silentmark)! [#188](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/188)
* *Fixed* error when applying damage or making ranged attacks outside of combat when using group advantage. Thanks [@silentmark](https://github.com/silentmark)! [`a186651`](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/188/commits/a186651)
* *Added* version and download stat shields to README, to make it easy to see key install data for users and repo owners. [#190](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/190)
* *Fixed* module setting for Spectator notifications to *not* be suppressed by default. Unassigned characters were still being overlooked when experiencing issues with some macros that require an assigned actor. [#192](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/192)
* *Fixed* issue where the Add Advantage macro would be capped when using Group Advantage. [#194](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/194)
* *Added* welcome message and invitation to feedback that is shown to GMs when updating or first installing the module. The message is saved in the chat log and confirms the installed version, links to release notes and provides quick access buttons to update macro and table content. [#196](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/196)

## [Version 6.0.0](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/6.0.0)  (2022-09-06)
- *Changed* Group Test setup form to clear or restore custom skill field if a skill is chosen from the skill list dropdown. [#160](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/160)
- *Fixed* an issue where you could gain advantage if you did not initiate an opposed test when Group Advantage is being used. [#159](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/159)
- *Added* the [Damage Console](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/168), from which GMs can quickly set and apply damage to one or more actors without starting a combat, opposed or other test. [#158](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/158)
- *Changed* GM Toolbox to include a new *Launch Damage Console* macro. This will need to be re-imported to take effect. [`a0366a9`](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/168/commits/a0366a9ff5acc9217ebc44a168067f1ed10e9027)
- *Changed* version numbering to bring in step with WFRP4e system major versioning. GM Toolkit jumps from 0.9.5 to 6.0.0 in this release, with no v1-v5 version in between. 

## [Version 0.9.5](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.5)  (2022-08-24)
- *Added* compatibility for Foundry VTT v10. This is a **breaking change**: 
  - v9 is no longer supported beyond GM Toolkit [v0.9.4.4](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.4.4).
  - v10 the minimum version required for GM Toolkit.
  - Full details can be found in [#156](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/156).
  - Nearly all macros have been updated. These can be re-imported using the `Update GM Toolkit`  module setting.
- *Removed* extra console logging in maintenance and group test applications. [#75d6dd](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/commit/75d6dd540a7d8dbe6a3cb9d6be940a33552dbd03)
- *Added* initial support for vision modes, as well as sight saturation and colour to be able to leverage v10 vision changes in Set Token Vision and Light.
- *Changed* Advantage handling to deal with Tokens primarily, and Combatants for setting flags (which is used for Lose Momentum). Actor documents are no longer supported.
- *Fixed* Dark Whispers table to draw from all entries when using the `/table darkwhispers` chat command. This did not affect using the Rolltable or Send Dark Whispers macro.

## [Version 0.9.4.4](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.4.4)  (2022-08-07)
- *Fixed* regression that prevented Group Advantage from updating in some cases. It should now update correctly whether using the Advantage macros or completing an automated process, such as outmanoeuvring or winning an opposed test.
- *Added* linting rules to help improve code consistency and readability. 
  - These are applied in all modules, apps and macro scripts. 
  - Reimport macros from the Settings menu to use updated versions.
- *Changed* prompt for Add XP macro to suppress `%sessionID%` variable and empty `()` if no session ID or next session date, respectively, are set.
 
## [Version 0.9.4.3](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.4.3)  (2022-08-01)
- *Fixed* issue where players would see permission errors during advantage updates on other users' actors. [#150](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/150) 
- *Added* new option to set `party` (player-assigned: default) or `company` (player-owned) actors as default group type for **Session Turnover** macros. [#151](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/151)
  - The **Reset Fortune** and **Add XP** macros use the Session Turnover Default Group Selection option. 
  - Actors who are not character type, but are player-owned (ie, NPC, vehicle and creature type actors) are ignored whe processing Session Turnover macros.
- *Added* new option to set `party` (player-assigned: default) or `company` (player-owned) actors as default group type for **Send Dark Whispers** macros. [#151](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/151)
  - When using `company` as the default group, it is possible to select unassigned players. In this case, no whisper is sent unless the 'Send to player owners' option is selected in the Send Dark Whispers dialog.
- *Added* new localisation keys to support additional dialog and settings options for default group selections. [#151](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/151)

## [Version 0.9.4.2](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.4.2)  (2022-07-29)
- *Added* localization improvements for Condition Check and Secret Group Test macros. (Thanks @Txus5012!) [[#141](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/141)] 
- *Added* German localization. (Thanks 24Nomad!) [[#143](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/143)] 
- *Fixed* compatibility issue with Babele. [[#135](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/135)] [[#146](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/146)] 

## [Version 0.9.4-1](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.4-1)  (2022-07-23)
- *Fixed* an issue where the Token Hud Extension would not display, even if enabled in module settings. [[#132](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/132)] 
- *Fixed* an issue where players are blanked by the Chaos Gods and could not respond to Dark Whispers. (Thanks @Yasnen!) [[#137](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/137)] 
- *Added* Japanese translations for changes up to 0.9.4-1. (Thanks @Yasnen!) [[#134](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/134)] [[#137](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/137)] [[0f620b0](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/commit/0f620b06daf902e0c52bcec03f968ffabed3d6a9)]
- *Added* new macro to **Check Conditions** at the end of a combat round for tokens in the scene. (Thanks to @Totalgit for the inspiration.) [[#138](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/138)]

~~Known Issue: The Group Test skill list entries are not translated. In some cases this appears to affect Babel translation of compendium skill items. [#135](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/135)~~ Resolved in Version 0.9.4.2. 

## [Version 0.9.4](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.4)  (2022-07-22)
Advantage
- *Fixed* Advantage updates when an opposed roll is resolved by a player that does not have owner permission on the opposing actor or token. [[#105](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/105)] [[#108](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/108)] [[#109](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/109)]
- *Added* compatibility with Group Advantage implementation. [[#113](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/113)]

Group and Player Management
- *Added* error notification on startup if there are players that do not have characters assigned (spectators). [[#102](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/102)]
- *Added* group selection utility for consistency when setting defaults in macros and other functionality. The utility returns an array of users, actors, tokens or combatants, and can be filtered by user logged-in status, scene presence, and whether targeted or selected as a token.  [[#61](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/61)]

Group Tests
- *Fixed* issue where Assistant GMs could not make secret (party) group tests. [[#124](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/124)]
- *Added* **Group Test** user interface, functionality and module settings, supporting non-player characters, storing  default test parameters and improving user experience. [[#63](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/63)] [[#125](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/125)]
- *Added* option to step-adjust difficulty of Advanced Skill tests where an actor does not have the required skill, and when falling back to a characteristic test. [[#127](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/127)]
- *Added* optional summary of Group Test results that are reported in a single GM whisper message to complement individual test cards. [[#128](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/128)]
- *Changed* Make Secret Party Test macro to **Make Secret Group Test**, overhauling to use group selection functionality and new Group Test user interface. [[#129](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/129)]
- *Added* support for silent group tests. These bypass the group test user interface and use default test parameters as defined in module settings.  [[#129](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/129)]
- *Changed* Macro Toolbox to reflect changes to Make Secret Group Test macro name. 

Macros
- *Fixed* an issue with the **Add XP** macro, where it would fail for a character with 0 XP, who had also never previously had XP.  [[#106](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/106)] [[#114](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/114)]  [[#115](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/115)]
- *Changed* **Add XP**, **Reset Fortune** and **Send Dark Whispers** macros to use group selection utility. Default "party" selection enforces that a character *must* be assigned to a player. [[#119](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/119)] [[#120](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/120)] [[#121](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/121)]
- *Changed* **Send Dark Whispers** macro to enable selection by actor rather than player. [[#58](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/58)]
- *Added* an option to send a Dark Whisper to each player owner rather than just the assigned player. Hovering over the character name lists all player owners as well as the assigned player. [[#121](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/121)]
- *Removed* the module setting to define default targets for Dark Whispers, in favour of automatic pre-selection based on selected tokens. [[#121](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/121)]
- *Changed* Make Secret Party Test macro to **Make Secret Group Test**, overhauling to use group selection functionality and new Group Test user interface. [[#129](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/pull/129)]

Other
- *Added* style overrides to improve presentation for Developer Mode module , macro sheet and form areas, as well as increase condition status icons by 50% in token hud.  [[38492d4](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/commit/38492d40e8ddc9b91630d9d9387a661f8899b965)] [[4018d2b](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/commit/38492d40e8ddc9b91630d9d9387a661f8899b965)]
- *Changed* various references to use localization keys for skills, talents and status provided by WFRP4e system. [[#110](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/110)]
## [Version 0.9.3](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.3)  (2022-05-25)
- *Fixed* missing Token Hud Extension options for players who don't have access to configure tokens. The layout of Token Hud Extensions has been reorganised as a result of this change. [[#67](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/67)]
- *Changed* Advantage automation to represent Outmanoeuvring (WFRP p164). 
  - In Foundry, tests should be targeted and handled as unopposed. 
  - The advantage updates are made only when using an Apply Damage option by right-clicking the results card in the chat log (if enabled in settings). 
  - Advantage is increased for the winner and cleared for the loser. 
- *Added* Advantage automation for winning Opposed Tests, regardless of applying damage.  [[#83](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/83)]
  - A new module setting is added to automate advantage handling when winning or losing Opposed Tests. This is separate to the Outmanoeuvring setting.
  - Advantage is increased for the winner of a test and cleared for the loser. 
  - No damage needs to have been applied, so this iteration covers situations where a character successfully Dodges or otherwise uses a non-damaging skill to successfully oppose. 
  - Changes are applied as soon as the defender rolls. Be aware that updates may therefore be duplicated if the roll is edited or re-rolled by using Fortune or Dark Deal.
- *Added* Advantage automation when suffering a new Condition during combat (WFRP p167) [[#84](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/84)].
  - This is not applied to Foundry 'conditions' such as Dead, Grappling and Fear.
  - Advantage is cleared when a new condition is added to a character. In the case of stackable conditions (such as Bleeding), the Advantage loss is not re-applied if the character already has an instance of the condition. 
- *Added* option to confirm reducing combatant Advantage when it has not been gained in a round (WFRP p164)  [[#91](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/91)].
  - A new module setting is added to enable or disable a dialog prompt at the end of each combat round that allows GMs to select who should lose Advantage.
  - Characters who have not increased Advantage since the start of the round are pre-selected to lose Advantage. 
  - GMs can override default selections before confirming Advantage losses. 
  - Changes made are confirmed in a chat whisper to the GM, which can be revealed to players.
- *Added* flags to prevent increasing Advantage multiple times when successfully opposing or outmanoeuvring multiple targets. 
- *Added* checks to ensure automated advantage handling only applies to characters in an active combat.
  - A notification is shown if the Winning or Outmanoeuvring automation options are enabled but either character in the test is not in the active combat. 
- *Changed* Advantage UI notifications to only present to GM users. This is introduced to prevent token or actor names being revealed to players. This will not prevent names being revealed in chat log messages, such as for opposed test results.  [[#87](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/87)]
- *Changed* Advantage macros to reflect refactored Advantage class.    [[#98](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/98)]
  - The Advantage suite macros (Add, Reduce and Clear Advantage) will need to be re-imported from the compendium for changes to apply. 
- *Fixed* compatibility with Advanced Macros  [[#86](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/86)]
  - Add XP [[#90](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/90)], Reset Fortune and Session Turnover [[#85](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/85)] macros no longer throw an error if the Advanced Macros module is also active. 
  - These macros will need to be re-imported from the compendium for changes to apply. 
- *Changed* references to Global Illumination to Unrestricted Token Vision, to align with changes in Foundry scene configuration options.
  - This affects the Toggle Scene Visibility and Light macro, which should be re-imported from the compendium for changes to apply. 
- *Changed* compendium pack definitions to use field 'type' instead of deprecated 'entity'.
- *Added* Japanese language support, including including localisation improvements to Pull Everyone to Scene and GM Toolbox macros. Thanks @Yasnen for contributing these!  [[#92](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/92)]
  - The Pull Everyone to Scene and GM Toolbox macros will need to be re-imported from the compendium for localization and related improvements to apply. 
- *Added* new option in module settings to `Update GM Toolkit Content`.  [[#97](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/97)]
  - It is **recommended** to use this option when upgrading to a new version of the module to ensure you have the latest macro and table content.
  - Content is imported from compendium packs into the GM Toolkit Macro Directory folder or RollTable folder, depending on document type being imported.
  - Existing content in the folder is removed, so any customizations should be moved to a separate location first. 
  - The Maintenance dialog shows version numbers for world and compendium content, so you can more easily identify if an item has been updated for a release. 
  - The Maintenance dialog also shows the database ID of the item. This can be used to identify existing duplicate world content (such as customised table or macro in a different folder location) that prevents re-importing. 
- *Added* notes footer to Advantage suite and Toggle Scene Visibility and Light macros.
  - This includes macro description, version number and date plus usage tips.
  - This change standardises the presentation of in-context macro documentation across the suite.
- *Added* new macro to Toggle Compendium Pack Visibility.  [[#99](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/99)]
  - Use this macro to hide or show compendium packs, such as premium content scenes, journal entries and actors that may include spoiler or sensitive information that you want to make sure players cannot see.
  - The macro can be modified to toggle visibility of packs from only specific sources (such as wfrp4e-core) and/or types (eg, Actors, Items).
  - If no specific criteria or source is set, all packs from modules declared for the wfrp4e system are included.
  - Setting the `forcePrivate` variable to `true` in the macro will force visibility to hidden, rather than toggle current state.  
- *Added* development setting to ignore module lock file during.

## [Version 0.9.2](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.2)  (2021-01-09)
- *Fixed* duplicate results numbering in Dark Whispers table and localization omission [#79] (Thanks @Txus5012).
- *Fixed* an issue where Advantage is always handled automatically when applying damage, even if the option is not selected. 

## [Version 0.9.1](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.1)  (2021-01-03)
- *Changed* Set Token Vision and Light macro to await token updates, to prevent a conflict or failure when multiple tokens are selected. This will need to be **manually re-imported** from the compendium. 
- *Added* movement lock to prevent players from moving tokens on the configured holding scene. This allows tokens to be used in fixed locations with all the usual selection, targeting and hud interactions rather than just non-interactive tiles or pictures for character portraits. 

## [Version 0.9.0](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.9.0)  (2021-01-03)
- *Changed* Foundry compatibility to v9. WFRP4e system compatibility is v5. 
- *Fixed* non-rendered html in Marginal Success roll description.
- *Fixed* issue where module settings could not be accessed [[#70](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/70)].
- *Added* RollTable compatibility to the Send Dark Whispers macro. This fixes issues with "undefined" Dark Whisper text in the Send Dark Whispers dialog [[#69](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/69)].
- *Added* Dark Whispers RollTable from compendium for use by Send Dark Whispers macro. 
- *Added* prompt to import table in Send Dark Whispers dialog if not present. 
- *Added* RollTable compatibility to Token Hud Extensions. This fixes issues with rolling for Mental Corruption, Physical Mutation and Wrath of the Gods using Token Hud Extension shortcuts. [[#69](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/69)]. 
- *Changed* Token Hud shortcut for Mental Corruption from `CTRL+SHIFT+double-click` to `SHIFT+double-click`.
- *Added* message prompt to install Mental Corruption, Physical Mutation and Wrath of the Gods Rolltables if not present. 
- *Changed* Set Token Vision and Light macro to be compatible with Foundry v9 canvas and lighting updates. This fixes issues with tokens not updating light and sight radius or animation when using the macro [[#68](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/68)].
  - Sight changes may not be refreshed until tokens are moved or deselected and then reselected. This is due to an outstanding Foundry core bug [#6389]((https://gitlab.com/foundrynet/foundryvtt/-/issues/6389)).
- *Changed* listed radius for Soulcast (Miscast) from 15m to 15yds, to maintain consistency with Ablaze condition lighting details. French translation retains metric units. 
- *Changed* Storm Lantern narrowbeam angle from 60 to 90 degrees, as per WFRP p309. Token lock rotation is no longer adjusted (previously the macro would ensure it was not locked.)
- *Changed* Night Vision to use sight angle of light source.  
- *Fixed* issue with Night Vision multiplier being applied to Dim Sight on tokens that do not have Night Vision when multiple tokens are selected. 
- *Removed* redundant "nochange" processing for light and sight, as this is not triggered. 

## [Version 0.8.0](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.8.0)  (2021-12-31)
- *Changed* Advantage scripts to handle non-token characters. 
- *Added* option to automate changes to Advantage when a character deals or is dealt combat damage in opposed contests. 
- *Added* option for sticky notifications for Advantage updates. This is introduced to provide better visibility of automated changes to Advantage, so that any related amendments are not missed. 
  - The option is disabled by default. Foundry supports a limit of 3 notification popups being displayed, so these should be cleared down each turn. Other notifications are typically queued and will appear after the on-screen popups are dismissed.
  - When enabled, Advantage related info popups will persist until manually dismissed. 
  - A copy of the notification is also kept in the console session. These are lost when the application or browser is refreshed or shut down, or the console log is cleared. 
- *Added* localisation support for new Advantage messaging.
- *Added* check to ensure combat is active when using the Increase or Reduce Advantage macros. 
  - No change is made if the selected character is not in an encounter in the viewed scene.
  - The Clear Advantage macro can still be used to reset advantage for a token if it is outside of combat.
- *Changed* the automatic clearing of Advantage to happen when tokens are added or removed from a combat / encounter, rather than when a combat encounter is added or begun. This now allows for multiple combats in a scene without resetting Advantage when a new one is initiated. 
- *Removed* option and functionality to clear advantage of all tokens in scene at start or end of combat. Native system functionality handles this for when specific combats end, and the revised approach to clearing advantage when a combatant is added or removed should ensure that there is no orphaned Advantage carried over outside of a combat situation. 
- *Added* context to Advantage notifications to help make visible where automated handling has occurred. 
- *Added* new setting submenus to consolidate related options and declutter the module settings page.
- *Changed* Reset Fortune macro to not require tokens. All player characters have their Fortune points restored when the macro is run.
- *Changed* the Add XP macro to leverage the system Award Experience functionality.
- *Changed* the Add XP macro to not require targeting tokens. If tokens are targeted, only player-assigned characters among the targets are updated. If no tokens are targeted, all player-assigned characters are targeted. 
- *Added* a reason option for awarding XP, which is used to populate the experience log. A default can be set in Session Management settings. 
- *Added* a preview list of affected characters to the Add XP prompt.
- *Changed* the Add XP confirmation to a single consolidated GM whisper message with starting and updated XP values. Native system functionality is used to report awards to individual characters. 
- *Added* new Session ID option to Session Management settings. This is used in the default Add XP reason, and can be automatically incremented using the Session Turnover macro at the same time as awarding Experience Points and resetting Fortune. 
- *Added* option to define holding scene to automatically transition to when running Session Turnover routine. This can be used for campaign hubs or landing pages between sessions. 
- *Added* fallback for Secret Party Tests. Related characteristic will be tested for basic skills if the actor does not have the skill, and for Advanced skills if the option is selected in module settings.
- *Added* new GM Toolbox macro, which pops up a persistent dialog for quick links to Toolkit and other macros. The Toolbox can be easily customised for a tailored GM workspace. It can be minimised to reduce space, and allows hotbar spaces to be freed up without losing quick access to useful macros. 
- *Changed* Token Hud Extension to always show Initiative tip for non-vehicles. The corresponding setting has been removed. 
- *Changed* existing scripts into ES modules, refactoring extensively across the application.
- *Added* support for Developer Mode console logging (https://github.com/League-of-Foundry-Developers/foundryvtt-devMode)


## [Version 0.7.0](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.7.0)  (2021-08-07)
- *Added* new template macro 'Make Secret Party Test' for GMs to silently or interactively roll tests for party members (such as Perception and Stealth). 
- *Changed* macros to be compatible with FVTT 0.8.8 and WFRP4e 4.0.x. 
  - Add XP and Reset Fortune. No change is needed for the End of Session Routine macro that uses these.
  - Advantage macros (to add, reduce or clear combat advantage).
  - Token Hud Extension display and interactions.
  - Set Token Vision and Light. 
- *Changed* settings to use `debouncedReload` instead of `window.location.reload`.
- *Changed* some module settings to trigger a reload of the client so they can take immediate effect, rather than require manually reloading the game:
  - Always show Initiative in Token Hud Extension. The setting to Enable Token Hud Extension already forces a client refresh. 
  - Clear Advantage for all tokens
  - Prompt for XP amount
- *Fixed* vehicle handling in Token Hud Extension:
  - `undefined` error for Movement: only base Movement is shown for vehicles
  - `NaN` error: no longer attempts to display initiative or agility for vehicles
  - Context shortcuts are disabled for vehicles
  - Vehicle movement displays wheel icon rather than feet icon
- *Fixed* TypeError issues when triggering skill tests via Token Hud Extension when an actor does not have the relevant skill. 
- *Changed* Send Dark Whispers macro to offer only users with player character actors (thereby excluding vehicles, creatures and other potentially player controlled actors that do not have Corruption).
- *Added* localisation strings for Send Dark Whispers tooltips.
- *Updated* French translations (thanks to @McGregor777).


## [Version 0.6.3](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.6.3) (2021-07-23)
- *Changed* Foundry compatibility to up to 0.7.10. WFRP4e system compatibility is up to 3.6.2.  
  - This is the final release of the GM Toolkit to support FVTT 0.7.x and WFRP4e 3.x.
- *Changed* manifest to point to latest release note for installation file and download link. 
  - Installation link will now consistently reference "https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/latest/download/module.json" rather than the raw repository file. 
  - Download link points to a version specific archive file. 
- *Added* links to release notes and bugs, as well as expanded [manifest+](https://foundryvtt.wiki/en/development/manifest-plus) fields to manifest
- *Removed* `wfrp4e` as an explicit dependency in manifest file (as this is sufficiently handled through the system declaration).
- *Added* dramatic test outcome hints (such as "Yes, and ..." or "No, but ...") to roll results descriptions in the chat log, depending on success levels. More information can be found on p152 of the core rulebook. 
- *Added* links to [ko-fi](https://ko-fi.com/jagusti) for those who may wish to support work on the Toolkit. The module is freeware, and there's no expectation or obligation to make a contribution, but any is welcome. 

## Version 0.6.2 (2021-02-28)

General Module Stuff
- *Added* compatibility updates for WFRP4e version 3 and premium content,
  -  Replaced obsolete references to `WFRP_Utility` and `WFRP_Tables` with `game.wfrp4e.utility` and `game.wfrp4e.tables` respectively.
  -  Updated skill and characteristic test calls to use the new basicTest functionality.
  -  If premium core content module is not installed, the Token Hud Extension shortcuts for rolling on the Physical/Mental Mutation and Wrath of Gods tables will silently fail (avoiding a 'Table not found' error). 
- *Changed* minimum core Foundry compatibility to 0.7.9. Minimum WFRP4e system compatibility is 3.4.1.  

Macros
- *Changed* Set Token Vision and Light macro to use Normal Vision range if Night Vision is selected but the token does not have it. In fact, it sets the Dim Light range to the higher of the default Normal Vision range and the calculated Dim Vision range, which would be 0 if the token doesn't have Night Vision.
- *Fixed* a bug that could prevent advantage macros from updating or capping correctly. 
- *Changed* the 'Simply d100' macro to explicitly state the number of dice rolled. This was temporarily breaking on an earlier version of FVTT. While the current version does not break, this change is applied for full compatibility. 
- *Added* new module setting to export the chat log as part of the End of Session Routine. 
- *Fixed* a macro compendium error, restoring the Set Token Light and Vision macro. 
- *Fixed* translation strings for Add XP and Reset Fortune that would trigger console warnings. 

Token Hud Extension 
-  *Added* translation string for Little Prayer result, which can be rolled from Token Hud extensions.

Dark Whispers
- *Added* macro to Send Dark Whispers. GMs can target one or more player characters who have at least 1 Corruption with an offer from the Dark Gods. This supports the game feature described on page 183 of the WFRP 4e rulebook - basically to let something dodgy happen to reduce their Corruption by 1. Players can accept or reject the offer from the private chat message they are sent. Corruption is not automatically removed if the player accepts as:
  - there may be a significant delay in the narrative before the player is able to meet the conditions. 
  - the GM rather than the system should make the decision about whether the character has met the terms of the offer.
- *Added* a new system table with suggestions for Dark Whispers. This is available through a chat command (`/table darkwhispers`) but is also used by the Send Dark Whispers macro to prepopulate the dialog box and to give the GM a starting point for inspiration. 

## [Version 0.6](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/tag/v0.6) (2020-11-02)

General Module Stuff
- *Changed* minimum core Foundry compatibility to 0.7.5 and minimum WFRP4e system compatibility to 2.2.1 to support animated token light effects. 
- *Added* French translations for enhancements and changes to Version 0.5.1 (thanks to @LeRatierBretonnien).
- *Added* explicit dependency on WFRP4e system, as supported by Foundry 0.6.6.

Macros
- *Removed* dependency on external Furnace module. Macros should be re-imported from the macro compendium to take advantage. Thanks to Forien for support with this. 
- *Added* new custom icons for the Toolkit macros.
- *Added* `End of Session` macro which automatically runs end of session admin macros (`Add XP` and `Reset Fortune`), as well as ensuring the game is paused. 
- *Changed* macro compendium to include latest versions of macros. **Updated macros will need to be manually re-imported from the compendium.** 
- *Changed* macro code to improve notification and string handling. 

Token Hud Extension
- *Added* option to toggle token hud extensions. Hud extensions are enabled by default. This update also makes the token hud extension available to non-GMs, and each user can enable or disable it independently. 
- *Added* dynamic update to token hud when Advantage is increased, reduced or cleared. Any changes are visible immediately in the token hud resource bar if the token hud is active. This applies when using the relevant advantage macros as well as when starting or ending combat, depending on the Clear Advantage setting. 
- *Added* dynamic update to Token Hud Extension when using shortcuts to increment or decrement Resolve, Resilience, Fortune, Fate, Sin or Corruption. Any changes are visible immediately in the token hud resource bar if the token hud is active. 
- *Changed* Token Hud setting description to clarify that the hud extension is only shown on controlled tokens. GMs can generally see any token hud, but players will only see their own characters token hud. 
- *Added* option to always show Initiative in Token Hud Extension. Previously Initiative and Agility tooltips and shortcuts were only available in active scenes. This option is now enabled for all scenes by default. 
- *Added* a message to confirm when no changes are made when using the status change shortcuts to alter Fate, Fortune, Resolve or Resilience via the Token Hud Extension. This can occur when the status attribute is already at 0 or its maximum value.
- *Fixed* a console error that was thrown when chat messages were logged when status changes were made via the Token Hud Extension. 

Token Vision and Light
- *Added* module settings for the GM to:
  - define token vision distances for normal and Dark Vision in dim or night conditions. 
  - allow Night or Dark Vision even if token does not have the relevant talent or trait. 
- *Fixed* Night Vision to work with characters with the Trait, and not just characters with the Talent.
- *Changed* No Vision setting to also clear light emission from token.
- *Added* new light source options
  -  Soulfire (Magic Miscast).
  -  Matches (trappings).
- *Fixed* Storm Lantern lighting options. 
  - Broadbeam is treated as unshuttered and providing 360° illumination.
  - Shuttered eliminates light emission.
- *Added* colour and light animation effects to differentiate light sources. Preconfigured settings are documented on the [wiki](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/wiki/set-token-vision-and-light#light-sources). 
- *Changed* the bright radius of various light sources. Previously these were treated as half the dim radius. New values are documented on the [wiki](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/wiki/set-token-vision-and-light#light-sources). 
- *Changed* the application of Night Vision to require a minimum level of light in the scene. This is fulfilled by any of the following criteria:
  -  global darkness level of less than 1 (indicating some ambient light)
  -  the token itself having some kind of light source (conferring a dimLight setting > 0)
  -  global illumination being enabled on the scene. 

## Version 0.5.1  (2020-06-23)
- *Fixed* typo in Add XP macro

## Version 0.5 (2020-06-09)
- *Added* shortcut to make Track test (CTRL + SHIFT + Initiative hud extension).
- *Added* Strong-minded advances for determining maximum Resolve when increasing through Token Hud. 
- *Fixed* undeclared target error when adding Fortune through Token Hud.
- *Fixed* unlinked actor issue when adjusting advantage from selected token. 
- *Added* macro to toggle Token Vision and Global Illumination on the current viewed scene.
- *Added* user setting to optionally reset Advantage for all tokens (including non-combatants), at start and/or end of combat encounter.
- *Added* user setting to optionally activate scene after pulling everyone to it (always, never or prompt).
- *Added* user settings to configure default amount of XP to add, and optionally prompt for how many each time. Improved data input validation and handling.
- *Changed* startup checks to ensure that Furnace module is installed *and* has Advanced Macros enabled.
- *Added* multiple translation strings for various settings and prompts.
- *Added* French translations for enhancements and changes (thanks to @LeRatierBretonnien).
- *Changed* Foundry 0.6.2 compatibility.

## Version 0.4 (2020-05-22)
- *Breaking changes* to token selection validation to make compatible with FVTT v0.6.0. All Advantage macros plus Set Token Vision and Light macro should be re-imported from the macro compendium. 
- *Added* interactions for Token Hud Extension: various skill and characteristic tests, status value adjustments and table rolls. Full details on https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/wiki/token-hud-extensions. 
- *Added* Perception and Intuition to Token Hud.
- *Added* Swim value to Movement tip on Token Hud.
- *Fixed* alignment of first-child Token Hud icons. 

## Version 0.3.2
- *Added* Advanced macros in the Toolkit require Kakaroto's Furnace module. If this is not installed and active, a warning message is displayed. Console logs are included to confirm whether Furnace is installed and advanced macro support is enabled.

## Version 0.3.1
- *Fixed* Luck Talent translation in French translation file. Thanks to JDW for flagging. 

## Version 0.3 (2020-05-09)

### Changed
- Extended and standardised localization strings.
- Refactored macros extensively to support translation and handling situations where no token is selected or targeted.
  - All macros are now fully localized.
  - Error and success notifications for macros are significantly improved.
- Rationalised console messages for macros.

### Added
- French translation support started. Thanks to @LeRatierBretonnien#2065!

## Version 0.2.1  (2020-05-08)

### Changed
- Chat log for Add XP macro is reported from player rather than character.
- UI feedback for advantage macros improved to show change and new value, or no change if none made.

### Added
- Rather than silently failing or throwing a console error if a token hasn't been targeted or selected first, a UI notification is presented for all macros in the GM Toolkit as appropriate. 
- Added script files for Advantage macros. 

### Fixed
- Increase Advantage macro caps advantage at character max. Thanks to JDW#6422.
- Reduce Advantage macro no longer drops advantage below 0.
- Typo in Set Token and Light macro dropdown options.
- Macros relying on token selection no longer run when no token is selected. 

## Version 0.2  (2020-04-25)

### Changed
- Added feature descriptions to changelog.
- Set macro icons and some descriptions.

### Fixed
- Typos in macro descriptions.
- Include macro pack and correct script pack for Token Hud Extensions (doh!)
- Fixed links to wiki and issue backlog.

## Version 0.1  (2020-04-25)

### Added
- Token Hud Extension 
  - Add Movement and Initiative to Token Hud, including tooltips for modes and Initiative/Agility values. 
  - Add Fortune, Resolve, and Corruption to Token Hud, including tooltips for Fate, Resilience and Sin values.
- Macros (available from Compendium > Macro > GM Toolkit)
  - **Reset Fortune:**  reset Fortune for the *targeted* character to their Fate level, accounting for Luck talent advances.
  - **Set Token Vision and Light:** opens a dialog for quickly changing vision and lighting parameters of the *selected* token(s). Night Vision applies range enhancements. Blinded condition and Dark Vision trait are supported. Light sources range from candles through Storm Lantern, as well as Petty Magic, Witchlight, Glowing Skin and Ablaze condition. **Requires** The [Furnace]( https://github.com/kakaroto/fvtt-module-furnace/) module by KaKaRoTo#4756.
  - **Add XP:** adds 20XP (configurable in macro script) to *selected* tokens, confirming change and new levels in chat message. By DasSauerkraut#3215.
  - **Pull Everyone to Scene:** yanks every player into the scene that the GM is on. Does not activate the scene. 
  - **Add/Reduce/Clear Advantage:** three separate macros to add or remove 1 Advantage from the *selected* actor, or to reset their advantage.
  - **Simply d100:** sometimes you just need a quick d100 roll. Nothing else, nothing fancy. 
- Override styling for `Furnace` module Advanced Macro dialog. 
