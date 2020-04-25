# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project tries to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) conventions.

## Types of changes
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed for` any bug fixes.
- `Security` in case of vulnerabilities.

---

## [Unreleased].

**Base Documentation**
- [ ] Set up [Issue Log](/issues), and carry over planned / unreleased functionality.
- [ ] Document initial functionality on [repository wiki](/wiki).
- [ ] Add functionality screenshots

**Functionality**
- Token Hud Extension
  - [ ] Add Perception indicators
  - [ ] Add Insight indicator
  - [ ] Make hud buttons rollable
- Add XP
  - [ ] Add XP dialog.
  - [ ] Add module settings to user define preset XP amount.
- Set Token Vision and Light
  - [ ] Enable translation for lighting macro. 
- Reset Fortune, Advantage macros
  - [ ] Provide UI feedback if no character is targeted or selected, as appropriate.

---

## Version 0.2
### Changed
- Added feature descriptions to changelog.
- Set macro icons.

### Fixed for
- Typos in macro descriptions.
- Include macro pack and correct script pack for Token Hud Extensions (doh!)

## Version 0.1

### Added
- Token Hud Extension 
  - Add Movement and Initiative to Token Hud, including tooltips for modes and Initiative/Agility values. 
  - Add Fortune, Resolve, and Corruption to Token Hud, including tooltips for Fate, Resilience and Sin values.
- Macros (available from Compendium > Macro > GM Toolkit)
  - **Reset Fortune:**  reset Fortune for the *targeted* character to their Fate level, accounting for Luck talent advanced.
  - **Set Token Vision and Light:** opens a dialog for quickly changing vision and lighting parameters of the *selected* token(s). Night Vision applies range enhancements. Blinded condition and Dark Vision trait are supported. Light sources range from candles through Storm Lantern, as well as Petty Magic, Witchlight, Glowing Skin and Ablaze condition. 
  - **Add XP:** adds 20XP (configurable in macro script) to *selected* tokens, confirming change and new levels in chat message. By DasSauerkraut#3215.
  - **Pull Everyone to Scene:** yanks every player into the scene that the GM is on. Does not activate the scene. 
  - **Add/Reduce/Clear Advantage:** three separate macros to add or remove 1 Advantage from the *selected* actor, or to reset their advantage.
  - **Simply d100:** sometimes you just need a quick d100 roll. Nothing else, nothing fancy. 

#### Changed
- Override styling for `Furnace` module Advanced Macro dialog. 
