# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project tries to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) conventions.

---

## Unreleased

See [Issue Backlog](../../issues). 

### Fixed
- Typos in Set Token and Light macro dropdown (Storm Lantern).


---

## Version 0.2.1

### Changed
- Chat log for Add XP macro is reported from player rather than character.

### Added
- Rather than silently failing or throwing a console error if a token hasn't been targeted or selected first, a UI notification is presented for all macros in the GM Toolkit as appropriate. 
- 

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
  - **Reset Fortune:**  reset Fortune for the *targeted* character to their Fate level, accounting for Luck talent advanced.
  - **Set Token Vision and Light:** opens a dialog for quickly changing vision and lighting parameters of the *selected* token(s). Night Vision applies range enhancements. Blinded condition and Dark Vision trait are supported. Light sources range from candles through Storm Lantern, as well as Petty Magic, Witchlight, Glowing Skin and Ablaze condition. **Requires** The [Furnace]( https://github.com/kakaroto/fvtt-module-furnace/) module by KaKaRoTo#4756.
  - **Add XP:** adds 20XP (configurable in macro script) to *selected* tokens, confirming change and new levels in chat message. By DasSauerkraut#3215.
  - **Pull Everyone to Scene:** yanks every player into the scene that the GM is on. Does not activate the scene. 
  - **Add/Reduce/Clear Advantage:** three separate macros to add or remove 1 Advantage from the *selected* actor, or to reset their advantage.
  - **Simply d100:** sometimes you just need a quick d100 roll. Nothing else, nothing fancy. 
- Override styling for `Furnace` module Advanced Macro dialog. 
