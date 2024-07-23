import GMToolkit from "./gm-toolkit.mjs"
import GMToolkitAdvantageSettings from "../apps/gm-toolkit-advantage-settings.js"
import GMToolkitDarkWhispersSettings from "../apps/gm-toolkit-darkwhispers-settings.js"
import GMToolkitSessionManagementSettings from "../apps/gm-toolkit-session-management-settings.js"
import GMToolkitVisionSettings from "../apps/gm-toolkit-vision-settings.js"
import GMToolkitGroupTestSettings from "../apps/gm-toolkit-grouptest-settings.js"
import GMToolkitMaintenanceWrapper from "../apps/gm-toolkit-maintenance.js"
import { strip } from "./utility.mjs"

export class GMToolkitSettings {

  static register () {

    // Menu for Advantage handling
    game.settings.registerMenu(GMToolkit.MODULE_ID, "menuAdvantage", {
      name: "GMTOOLKIT.Settings.Advantage.menu.name",
      label: "GMTOOLKIT.Settings.Advantage.menu.label",
      hint: "GMTOOLKIT.Settings.Advantage.menu.hint",
      icon: "fas fa-caret-square-up",
      type: GMToolkitAdvantageSettings,
      restricted: true
    })
    // Automate advantage for winning or losing an opposed test
    game.settings.register(GMToolkit.MODULE_ID, "automateOpposedTestAdvantage", {
      name: "GMTOOLKIT.Settings.Advantage.Automate.OpposedTest.name",
      hint: "GMTOOLKIT.Settings.Advantage.Automate.OpposedTest.hint",
      scope: "world",
      config: false,
      default: true,
      type: Boolean,
      onChange: debouncedReload,
      feature: "advantage"
    })
    // Automate advantage for outmanouvring and losing wounds from unopposed tests
    game.settings.register(GMToolkit.MODULE_ID, "automateDamageAdvantage", {
      name: "GMTOOLKIT.Settings.Advantage.Automate.UnopposedDamage.name",
      hint: "GMTOOLKIT.Settings.Advantage.Automate.UnopposedDamage.hint",
      scope: "world",
      config: false,
      default: true,
      type: Boolean,
      onChange: debouncedReload,
      feature: "advantage"
    })
    // Clear advantage when suffering a condition
    game.settings.register(GMToolkit.MODULE_ID, "automateConditionAdvantage", {
      name: "GMTOOLKIT.Settings.Advantage.Automate.SufferCondition.name",
      hint: "GMTOOLKIT.Settings.Advantage.Automate.SufferCondition.hint",
      scope: "world",
      config: false,
      default: true,
      type: Boolean,
      onChange: debouncedReload,
      feature: "advantage"
    })
    // Prompt to lose advantage when not gained in a round
    game.settings.register(GMToolkit.MODULE_ID, "promptMomentumLoss", {
      name: "GMTOOLKIT.Settings.Advantage.Automate.LoseMomentum.name",
      hint: "GMTOOLKIT.Settings.Advantage.Automate.LoseMomentum.hint",
      scope: "world",
      config: false,
      default: true,
      type: Boolean,
      onChange: debouncedReload,
      feature: "advantage"
    })
    // Clear Advantage when token is added to combat tracker
    game.settings.register(GMToolkit.MODULE_ID, "clearAdvantageCombatJoin", {
      name: "GMTOOLKIT.Settings.Advantage.Automate.CombatJoin.name",
      hint: "GMTOOLKIT.Settings.Advantage.Automate.CombatJoin.hint",
      scope: "world",
      config: false,
      default: true,
      type: Boolean,
      onChange: debouncedReload,
      feature: "advantage"
    })
    // Clear Advantage when token is removed from combat tracker
    game.settings.register(GMToolkit.MODULE_ID, "clearAdvantageCombatLeave", {
      name: "GMTOOLKIT.Settings.Advantage.Automate.CombatLeave.name",
      hint: "GMTOOLKIT.Settings.Advantage.Automate.CombatLeave.hint",
      scope: "world",
      config: false,
      default: true,
      type: Boolean,
      onChange: debouncedReload,
      feature: "advantage"
    })
    game.settings.register(GMToolkit.MODULE_ID, "persistAdvantageNotifications", {
      name: "GMTOOLKIT.Settings.Advantage.PersistNotices.name",
      hint: "GMTOOLKIT.Settings.Advantage.PersistNotices.hint",
      scope: "world",
      config: false,
      default: false,
      type: Boolean,
      onChange: debouncedReload,
      feature: "advantage"
    })

    // Menu for Session Management
    game.settings.registerMenu(GMToolkit.MODULE_ID, "menuSessionManagement", {
      name: "GMTOOLKIT.Settings.SessionManagement.menu.name",
      label: "GMTOOLKIT.Settings.SessionManagement.menu.label",
      hint: "GMTOOLKIT.Settings.SessionManagement.menu.hint",
      icon: "fas fa-history",
      type: GMToolkitSessionManagementSettings,
      restricted: true
    })
    // Settings for Session Management
    game.settings.register(GMToolkit.MODULE_ID, "sessionID", {
      name: "GMTOOLKIT.Settings.SessionTurnover.SessionID.name",
      hint: "GMTOOLKIT.Settings.SessionTurnover.SessionID.hint",
      scope: "world",
      config: false,
      default: "0",
      type: String,
      feature: "session"
    })
    game.settings.register(GMToolkit.MODULE_ID, "defaultPartySessionTurnover", {
      name: "GMTOOLKIT.Settings.SessionTurnover.DefaultParty.name",
      hint: "GMTOOLKIT.Settings.SessionTurnover.DefaultParty.hint",
      scope: "world",
      config: false,
      default: "party",
      type: String,
      choices: {
        party: "GMTOOLKIT.Group.Type.party",
        company: "GMTOOLKIT.Group.Type.company"
      },
      feature: "session"
    })
    game.settings.register(GMToolkit.MODULE_ID, "addXPPrompt", {
      name: "GMTOOLKIT.Settings.AddXP.Prompt.name",
      hint: "GMTOOLKIT.Settings.AddXP.Prompt.hint",
      scope: "world",
      config: false,
      default: false,
      type: Boolean,
      onChange: debouncedReload,
      feature: "session"
    })
    game.settings.register(GMToolkit.MODULE_ID, "addXPDefaultAmount", {
      name: "GMTOOLKIT.Settings.AddXP.Default.name",
      hint: "GMTOOLKIT.Settings.AddXP.Default.hint",
      scope: "world",
      config: false,
      default: 20,
      type: Number,
      range: {
        min: 0,
        max: 200,
        step: 5
      },
      onChange: debouncedReload,
      feature: "session"
    })
    game.settings.register(GMToolkit.MODULE_ID, "addXPDefaultReason", {
      name: "GMTOOLKIT.Settings.AddXP.Reason.name",
      hint: "GMTOOLKIT.Settings.AddXP.Reason.hint",
      scope: "world",
      config: false,
      default: "Session %session% (%date%)",
      type: String,
      onChange: debouncedReload,
      feature: "session"
    })
    game.settings.register(GMToolkit.MODULE_ID, "holdingScene", {
      name: "GMTOOLKIT.Settings.SessionTurnover.HoldingScene.name",
      hint: "GMTOOLKIT.Settings.SessionTurnover.HoldingScene.hint",
      scope: "world",
      config: false,
      default: "",
      type: String,
      feature: "session"
    })
    game.settings.register(GMToolkit.MODULE_ID, "exportChat", {
      name: "GMTOOLKIT.Settings.SessionEnd.ExportChat.name",
      hint: "GMTOOLKIT.Settings.SessionEnd.ExportChat.hint",
      scope: "world",
      config: false,
      default: false,
      type: Boolean,
      feature: "session"
    })
    game.settings.register(GMToolkit.MODULE_ID, "scenePullActivate", {
      name: "GMTOOLKIT.Settings.ScenePullActivate.name",
      hint: "GMTOOLKIT.Settings.ScenePullActivate.hint",
      scope: "world",
      config: false,
      default: "never",
      type: String,
      choices: {
        always: "GMTOOLKIT.Settings.ScenePullActivate.Always",
        never: "GMTOOLKIT.Settings.ScenePullActivate.Never",
        prompt: "GMTOOLKIT.Settings.ScenePullActivate.Prompt"
      },
      feature: "session"
    })


    // Menu for Vision settings used by Set Token Vision and Light Macro
    game.settings.registerMenu(GMToolkit.MODULE_ID, "menuTokenVision", {
      name: "GMTOOLKIT.Settings.Vision.menu.name",
      label: "GMTOOLKIT.Settings.Vision.menu.label",
      hint: "GMTOOLKIT.Settings.Vision.menu.hint",
      icon: "fas fa-eye",
      type: GMToolkitVisionSettings,
      restricted: true
    })
    // Vision Settings for Set Token Vision and Light Macro
    game.settings.register(GMToolkit.MODULE_ID, "rangeNormalSight", {
      name: "GMTOOLKIT.Settings.Vision.NormalSight.name",
      hint: "GMTOOLKIT.Settings.Vision.NormalSight.hint",
      scope: "world",
      config: false,
      default: 2,
      type: Number,
      step: "any",
      feature: "vision"
    })
    game.settings.register(GMToolkit.MODULE_ID, "rangeDarkVision", {
      name: "GMTOOLKIT.Settings.Vision.DarkVision.name",
      hint: "GMTOOLKIT.Settings.Vision.DarkVision.hint",
      scope: "world",
      config: false,
      default: 120,
      type: Number,
      step: "any",
      feature: "vision"
    })
    game.settings.register(GMToolkit.MODULE_ID, "overrideNightVision", {
      name: "GMTOOLKIT.Settings.Vision.OverrideNightVision.name",
      hint: "GMTOOLKIT.Settings.Vision.OverrideNightVision.hint",
      scope: "world",
      config: false,
      default: false,
      type: Boolean,
      feature: "vision"
    })
    game.settings.register(GMToolkit.MODULE_ID, "overrideDarkVision", {
      name: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.name",
      hint: "GMTOOLKIT.Settings.Vision.OverrideDarkVision.hint",
      scope: "world",
      config: false,
      default: false,
      type: Boolean,
      feature: "vision"
    })


    // Menu for Send Dark Whispers Macro
    game.settings.registerMenu(GMToolkit.MODULE_ID, "menuDarkWhispers", {
      name: "GMTOOLKIT.Settings.DarkWhispers.menu.name",
      label: "GMTOOLKIT.Settings.DarkWhispers.menu.label",
      hint: "GMTOOLKIT.Settings.DarkWhispers.menu.hint",
      icon: "fas fa-comment-dots",
      type: GMToolkitDarkWhispersSettings,
      restricted: true
    })
    // Settings for Send Dark Whispers Macro
    game.settings.register(GMToolkit.MODULE_ID, "defaultGroupDarkWhispers", {
      name: "GMTOOLKIT.Settings.DarkWhispers.DefaultGroup.name",
      hint: "GMTOOLKIT.Settings.DarkWhispers.DefaultGroup.hint",
      scope: "world",
      config: false,
      default: "party",
      type: String,
      choices: {
        party: "GMTOOLKIT.Group.Type.party",
        company: "GMTOOLKIT.Group.Type.company"
      },
      feature: "darkwhispers"
    })
    game.settings.register(GMToolkit.MODULE_ID, "messageDarkWhispers", {
      name: "GMTOOLKIT.Settings.DarkWhispers.message.name",
      hint: "GMTOOLKIT.Settings.DarkWhispers.message.hint",
      scope: "world",
      config: false,
      default: "taunt",
      type: String,
      choices: {
        taunt: "GMTOOLKIT.Settings.DarkWhispers.message.taunt",
        threat: "GMTOOLKIT.Settings.DarkWhispers.message.threat"
      },
      feature: "darkwhispers"
    })

    // Menu for Group Tests
    game.settings.registerMenu(GMToolkit.MODULE_ID, "menuGroupTest", {
      name: "GMTOOLKIT.Settings.GroupTest.menu.name",
      label: "GMTOOLKIT.Settings.GroupTest.menu.label",
      hint: "GMTOOLKIT.Settings.GroupTest.menu.hint",
      icon: "fas fa-dice",
      type: GMToolkitGroupTestSettings,
      restricted: true
    })
    if (!game.babele || game.babele.initialized) registerGroupTestSettings()

    // Settings for Token Hud Extension
    game.settings.register(GMToolkit.MODULE_ID, "enableTokenHudExtensions", {
      name: "GMTOOLKIT.Settings.TokenHudExtensions.Enabled.name",
      hint: "GMTOOLKIT.Settings.TokenHudExtensions.Enabled.hint",
      scope: "client",
      config: true,
      default: true,
      type: Boolean,
      onChange: debouncedReload,
      feature: "tokenhud"
    })

    // Settings for suppressing Spectator notification
    game.settings.register(GMToolkit.MODULE_ID, "suppressSpectatorNotice", {
      name: "GMTOOLKIT.Settings.Spectators.name",
      hint: "GMTOOLKIT.Settings.Spectators.hint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      onChange: debouncedReload
    })

    // Menu for Module Content Management
    game.settings.registerMenu(GMToolkit.MODULE_ID, "menuMaintenance", {
      name: "GMTOOLKIT.Settings.Maintenance.menu.name",
      label: "GMTOOLKIT.Settings.Maintenance.menu.label",
      hint: "GMTOOLKIT.Settings.Maintenance.menu.hint",
      icon: "fas fa-cog",
      type: GMToolkitMaintenanceWrapper,
      restricted: true
    })

  }

}


export function getDataSettings (data, feature) {
  data.settings = Array.from(game.settings.settings)
    .filter(s => s[1].feature === feature)
    .map(i => i[1])
  data.settings.forEach(s => {
    if (s.type === Boolean) {
      s.boolean = true
      s.inputType = "checkbox"
    }
    if (s.range) {
      s.isRange = true
      s.inputType = "range"
    }
    if (s.type === Number & !s.range) {
      s.isNumber = true
      s.inputType = "number"
      s.step = s.step ?? 1
    }
    s.value = game.settings.get(s.namespace, s.key)
  })
}


export async function registerGroupTestSettings () {
  const skillList = await game.gmtoolkit.skills.reduce((skills, skill) => ({ ...skills, [`${game.i18n.localize(skill.name)}`]: `${game.i18n.localize(skill.name)}` }), {})

  // Settings for Group Tests application
  game.settings.register(GMToolkit.MODULE_ID, "quicktest1GroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.quicktest1.name",
    hint: "GMTOOLKIT.Settings.GroupTest.quicktest.hint",
    scope: "world",
    config: false,
    default: game.i18n.localize("NAME.Perception"),
    choices: skillList,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "quicktest2GroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.quicktest2.name",
    hint: "GMTOOLKIT.Settings.GroupTest.quicktest.hint",
    scope: "world",
    config: false,
    default: game.i18n.localize("NAME.Cool"),
    type: String,
    choices: skillList,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "quicktest3GroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.quicktest3.name",
    hint: "GMTOOLKIT.Settings.GroupTest.quicktest.hint",
    scope: "world",
    config: false,
    default: game.i18n.localize("NAME.Intuition"),
    type: String,
    choices: skillList,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "quicktest4GroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.quicktest4.name",
    hint: "GMTOOLKIT.Settings.GroupTest.quicktest.hint",
    scope: "world",
    config: false,
    default: game.i18n.localize("NAME.Gossip"),
    type: String,
    choices: skillList,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "defaultSkillGroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.defaultSkill.name",
    hint: "GMTOOLKIT.Settings.GroupTest.defaultSkill.hint",
    scope: "world",
    config: false,
    default: "Lore (Reikland)",
    type: String,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "bypassTestDialogGroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.bypassTestDialog.name",
    hint: "GMTOOLKIT.Settings.GroupTest.bypassTestDialog.hint",
    scope: "world",
    config: false,
    default: true,
    type: Boolean,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "defaultDifficultyGroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.defaultDifficulty.name",
    hint: "GMTOOLKIT.Settings.GroupTest.defaultDifficulty.hint",
    scope: "world",
    config: false,
    type: String,
    choices: { ...game.wfrp4e.config.difficultyLabels, ...{ default: "" } },
    default: "average",
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "defaultRollModeGroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.defaultRollMode.name",
    hint: "GMTOOLKIT.Settings.GroupTest.defaultRollMode.hint",
    scope: "world",
    config: false,
    type: String,
    choices: { ...CONFIG.Dice.rollModes },
    default: "blindroll",
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "defaultTestModifierGroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.defaultTestModifier.name",
    hint: "GMTOOLKIT.Settings.GroupTest.defaultTestModifier.hint",
    scope: "world",
    config: false,
    default: "",
    type: Number,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "defaultPartyGroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.defaultParty.name",
    hint: "GMTOOLKIT.Settings.GroupTest.defaultParty.hint",
    scope: "world",
    config: false,
    default: "party",
    type: String,
    choices: {
      party: "GMTOOLKIT.Group.Type.party",
      company: "GMTOOLKIT.Group.Type.company"
    },
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "fallbackAdvancedSkills", {
    name: "GMTOOLKIT.Settings.MakeSecretGroupTests.FallbackAdvanced.name",
    hint: "GMTOOLKIT.Settings.MakeSecretGroupTests.FallbackAdvanced.hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "fallbackAdjustDifficulty", {
    name: "GMTOOLKIT.Settings.GroupTest.FallbackAdjustDifficulty.name",
    hint: "GMTOOLKIT.Settings.GroupTest.FallbackAdjustDifficulty.hint",
    scope: "world",
    config: false,
    default: 0,
    type: Number,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "summariseResultsThresholdGroupTest", {
    name: "GMTOOLKIT.Settings.GroupTest.SummariseResultsThresholdGroupTest.name",
    hint: "GMTOOLKIT.Settings.GroupTest.SummariseResultsThresholdGroupTest.hint",
    scope: "world",
    config: false,
    default: 2,
    type: Number,
    feature: "grouptest"
  })
  game.settings.register(GMToolkit.MODULE_ID, "aggregateResultGroupTest", {
    scope: "world",
    config: false,
    default: []
  })
}
