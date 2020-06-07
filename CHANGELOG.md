# Changelog
All notable changes to this project will be documented in this file.  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project tries to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) conventions.

---

## Unreleased
- *Added* shortcut to make Track test (CTRL + SHIFT + Initiative hud extension).
- *Added* Strong-minded advances for determining maximum Resolve when increasing through Token Hud. 
- *Fixed* undeclared target error when adding Fortune through Token Hud.
- *Fixed* unlinked actor issue when adjusting advantage from selected token. 
- *Added* macro to toggle Token Vision and Global Illumination on the current viewed scene.
- *Added* option to reset Advantage for all tokens (including non-combatants), at start and/or end of combat encounter.

See [Issue Backlog](../../issues) and [Roadmap](../../milestones). 

## Version 0.4
- *Breaking changes* to token selection validation to make compatible with FVTT v0.6.0. All Advantage macros plus Set Token Vision and Light macro should be re-imported from the macro compendium. 
- *Added* interactions for Token Hud Extension: various skill and characteristic tests, status value adjustments and table rolls. Full details on https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/wiki/token-hud-extensions. 
- *Added* Perception and Intuition to Token Hud.
- *Added* Swim value to Movement tip on Token Hud.
- *Fixed* alignment of first-child Token Hud icons. 

## Version 0.3.2
- *Added* Advanced macros in the Toolkit require Kakaroto's Furnace module. If this is not installed and active, a warning message is displayed. Console logs are included to confirm whether Furnace is installed and advanced macro support is enabled.

## Version 0.3.1
- *Fixed* Luck Talent translation in French translation file. Thanks to JDW for flagging. 

## Version 0.3

### Changed
- Extended and standardised localization strings.
- Refactored macros extensively to support translation and handling situations where no token is selected or targeted.
  - All macros are now fully localized.
  - Error and success notifications for macros are significantly improved.
- Rationalised console messages for macros.

### Added
- French translation support started. Thanks to @LeRatierBretonnien#2065!

## Version 0.2.1

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

## Version 0.2

### Changed
- Added feature descriptions to changelog.
- Set macro icons and some descriptions.

### Fixed
- Typos in macro descriptions.
- Include macro pack and correct script pack for Token Hud Extensions (doh!)
- Fixed links to wiki and issue backlog.

## Version 0.1

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
