# GM Toolkit (WFRP 4e)

[![Version](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/Jagusti/fvtt-wfrp4e-gmtoolkit/dev/module.json&label=Current+Version&query=version&color=blue)](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/latest)
[![Foundry Compatibility](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FJagusti%2Ffvtt-wfrp4e-gmtoolkit%2Fdev%2Fmodule.json&label=Foundry%20VTT%20Version&query=$.compatibility.minimum&colorB=orange)](https://foundryvtt.com/releases/)
[![GitHub release](https://img.shields.io/github/release-date/Jagusti/fvtt-wfrp4e-gmtoolkit?label=Released&color=brightgreen)](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases)
[![GitHub commits](https://img.shields.io/github/commits-since/Jagusti/fvtt-wfrp4e-gmtoolkit/latest?label=Commits%20Since%20Release&color=yellowgreen)](https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/commits/)<br>
![the latest version zip](https://img.shields.io/github/downloads/Jagusti/fvtt-wfrp4e-gmtoolkit/latest/wfrp4e-gm-toolkit.zip?label=Downloads%20(Current%20Version)&color=blue)
![all downloads zip](https://img.shields.io/github/downloads/Jagusti/fvtt-wfrp4e-gmtoolkit/wfrp4e-gm-toolkit.zip?label=Total%20Downloads&color=blueviolet) 

Utility module with tweaks, enhancements and macros to help GMs manage games of [Warhammer Fantasy Roleplay (4e)](https://github.com/moo-man/WFRP4e-FoundryVTT) in [Foundry Virtual Tabletop](https://foundryvtt.com/).

See the [wiki](../../wiki) for details about features, including (but not only): 
* Automating individual and group [Advantage](../../wiki/advantage-handling)
* Sending [Dark Whispers](../../wiki/send-dark-whispers)
* Setting [token vision and light](../../wiki/set-token-vision-and-light) (including handling Night Vision range correctly)
* Rolling secret [group skill tests](../../wiki/group-test) 
* Dealing out non-combat [damage](../../wiki/launch-damage-console) to multiple actors and vehicles
* Managing [session turnover](../../wiki/session-turnover) admin (including [adding Experience Points](../../wiki/add-xp) and [resetting Fortune](../../wiki/reset-fortune))
* Extending the [Token Hud](../../wiki/token-hud-extensions) (to access key attributes and skills without opening the character sheet)

## Compatibility

Version 7.1.x requires
- Foundry VTT: v12.330
- WFRP4e: 7.2.4

## Installation Instructions
For full details, see the [Getting Started guide](../../wiki/getting-started) on the [wiki](../../wiki). 

1. **Install the module** via the Add-on Modules tab of Foundry VTT setup.
   - Module Name: `GM Toolkit (WFRP4e)`
   - Manifest URL: https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/releases/latest/download/module.json
2. The GM needs to **enable the module** for the World:
   - `Settings` > `Manage Modules` > `GM Toolkit (WFRP 4e)`
3. **Import macros and tables** through either
   - [Toolkit Maintenance](../../wiki/toolkit-maintenance) option in `Settings` > `Module Settings` > `GM Toolkit (WFRP 4e)` > `Update GM Toolkit Content`.  Or
   - [manually importing](../../wiki/getting-started) from Compendium packs.
4. Finally **replace hotbar shortcuts**. 
   - These should be deleted automatically when using Toolkit Maintenance. 
   - Replace shortcuts by dragging and dropping from the `GM Toolkit` `Macro Directory` to ensure they point to the latest versions. 
   - If macros or shortcuts are not deleted automatically, be sure you don't have older copies of macros with the same names outside of the GM Toolkit folder. 

## References

* [Changelog](/CHANGELOG.md): for summary of latest and historical changes
* [Release Notes](../../releases): for details of latest and historical updates by version
* [Backlog](../../issues): for known bugs and suggested / planned enhancements
* [Roadmap](../../milestones): for planned feature schedule
* [Wiki](../../wiki): for functionality guides

---
<a href='https://ko-fi.com/jagusti' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/5cbed8a433a3f45a772abaf5_SupportMe_blue-p-500.png' border='0' alt='Support my WFRP/Foundry addiction at ko-fi.com' />
