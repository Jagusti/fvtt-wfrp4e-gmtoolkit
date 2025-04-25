import { runGroupTest } from "../modules/group-test.mjs"

export class GroupTest
  extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "group-test",
    tag: "form",
    form: {
      handler: GroupTest.onSubmit,
      submitOnChange: false,
      closeOnSubmit: true
    },
    position: {
      width: 740
    },
    window: {
      icon: "fas fa-dice",
      title: "GMTOOLKIT.Dialog.MakeSecretGroupTest.Title",
      contentClasses: ["standard-form", "gmtoolkit"]
    }
  }

  static PARTS = {
    form: {
      template: "modules/wfrp4e-gm-toolkit/templates/group-test.hbs"
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }


  /**
   * Build data set to be presented and manipulated in form, applying default values where not provided in the form application request.
   * @param {Object} options : Form application options
   * @returns {Object} context : The data to be presented in the form
   **/
  async _prepareContext (options) {
    const context = await super._prepareContext(options)

    context.skills = {
      list: game.gmtoolkit.skills,
      target: game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest"),
      quickTest1: game.settings.get("wfrp4e-gm-toolkit", "quicktest1GroupTest"),
      quickTest2: game.settings.get("wfrp4e-gm-toolkit", "quicktest2GroupTest"),
      quickTest3: game.settings.get("wfrp4e-gm-toolkit", "quicktest3GroupTest"),
      quickTest4: game.settings.get("wfrp4e-gm-toolkit", "quicktest4GroupTest")
    }

    context.skills.target
      = (game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest") === "null")
        ? ""
        : game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest")
    context.skills.custom = context.skills.list.map(m => m.name).includes(context.skills.target) ? "" : context.skills.target

    context.testParameters = {
      testModifier: game.settings.get("wfrp4e-gm-toolkit", "defaultTestModifierGroupTest"),
      rollMode: game.settings.get("wfrp4e-gm-toolkit", "defaultRollModeGroupTest"),
      testDifficulty: game.settings.get("wfrp4e-gm-toolkit", "defaultDifficultyGroupTest")
      // _slBonus: this.object.testParameters?.slBonus || 0,
      // _successBonus: this.object.testParameters?.successBonus || 0,
    }

    context.testParameters.bypass = this.object?.testParameters?.bypass === undefined ? game.settings.get("wfrp4e-gm-toolkit", "bypassTestDialogGroupTest") : this.object?.testParameters?.bypass
    context.testParameters.fallback = this.object?.testParameters?.fallback === undefined ? game.settings.get("wfrp4e-gm-toolkit", "fallbackAdvancedSkills") : this.object?.testParameters?.fallback

    context.rollModeOptions = CONFIG.Dice.rollModes
    context.difficultyOptions = game.wfrp4e.config.difficultyLabels

    // Set group defaults if not provided
    context.group = {
      options: {
        type: this.object?.groupOptions?.type || game.settings.get("wfrp4e-gm-toolkit", "defaultPartyGroupTest") // ,
        // _present: this.object.groupOptions?.present || true,
        // _interaction: this.object.groupOptions?.interaction || undefined
      }
    }

    // Build member list
    context.group.members = {
      playerGroup: game.gmtoolkit.utility.getGroup(context.group.options.type),
      selected: game.gmtoolkit.utility.getGroup("company", { interaction: "selected", present: true }),
      npcTokens: game.gmtoolkit.utility.getGroup("npcTokens"),
      // _game.gmtoolkit.utility.getGroup("tokens", { interaction: "selected" })
      controlled: canvas.tokens.controlled
    }

    context.buttons = [
      {
        type: "submit",
        icon: "fa-solid fa-ban",
        label: "GMTOOLKIT.Dialog.Cancel",
        action: "cancel"
      },
      {
        type: "submit",
        icon: "fa-solid fa-dice",
        label: "GMTOOLKIT.Dialog.MakeSecretGroupTest.RunTest",
        action: "submit"
      }
    ]

    return context
  }


  /**
   * Identify interaction events and call relevant function
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  _onRender (context, options) {

    const selectedSkill = document.getElementById("skill-list")
    selectedSkill.addEventListener("change", () => {
      toggleGroupedSkill(selectedSkill)
    })

    const bypassDialog = document.getElementById("bypass")
    bypassDialog.addEventListener("change", () => {
      toggleBypassTestDialog(bypassDialog)
    })

  }


  /**
   * Process application options and call the group test routine.
   * @param {object} event : The submission event. Used to identify which button is used to submit the form.
   * @param {object} form : The form object.
   * @param {object} formData : The data submitted by the form
   * @private
   **/
  static async onSubmit (event, form, formData) {
    const choices = foundry.utils.expandObject(formData.object)

    let testSkill = ""

    // Set target skill depending on how the form is submitted
    switch (event.submitter.dataset.action) {
      case "quicktest":
        testSkill = event.submitter.title
        ui.notifications.info(game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.RunningGroupSkillTest", { skill: testSkill }))
        break
      case "submit":
        testSkill = choices["skill-name"] ? choices["skill-name"] : choices["skill-list"]
        // Has a skill choice been made?
        if (testSkill) {
          // Is it a grouped skill that require a specialisation?
          // some skills indicate grouped with "( )"
          if (choices["skill-list"].slice(-3) === "( )") {
            testSkill = [
              choices["skill-list"].slice(0, choices["skill-list"].length - 2),
              choices["skill-name"], // Insert specified skill as specialisation
              choices["skill-list"].slice(choices["skill-list"].length - 2)
            ].join("")
          }
          // Some skills indicate grouped with "()"
          if (choices["skill-list"].slice(-2) === "()") {
            testSkill = [
              choices["skill-list"].slice(0, choices["skill-list"].length - 1),
              choices["skill-name"], // Insert specified skill as specialisation
              choices["skill-list"].slice(choices["skill-list"].length - 1)
            ].join("")
          }
          // Is the skill name well-formed?
          if (testSkill.slice(-2) !== "()" && testSkill.slice(-3) !== "( )") {
            ui.notifications.info(game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.RunningGroupSkillTest", { skill: testSkill }))
            break
          }
          ui.notifications.info(game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.SkillNeedsSpecialisation", { skill: testSkill }))
        }
        // Fall through if no target skill selected
      case "cancel":
      default:
        return ui.notifications.info(game.i18n.localize("GMTOOLKIT.Message.MakeSecretGroupTest.AbortGroupSkillTest"))
    }

    // Call the secret group test, passing in submitted parameters
    runGroupTest(testSkill, choices)
  }

}


/**
 * Toggle form label to reflect whether a skill or specialisation is needed
 * @param {Element} control : The originating control: skill-list dropdown
 **/
function toggleGroupedSkill (control) {
  const label = document.getElementById("skill-name-label")
  const field = document.getElementById("skill-name")
  // Set text field label
  if (control.value.slice(-2) === "()" || control.value.slice(-3) === "( )") {
    label.innerHTML = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SetSpecialisation")
    field.placeholder = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SetSpecialisationPlaceholder")
  } else {
    label.innerHTML = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SpecifySkill")
    field.placeholder = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SpecifySkillPlaceholder")
  }
  // Set text field value
  if (control.value !== "") {
    field.value = ""
  }
  if (control.value === "") {
    field.value
    = (game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest") === "null")
        ? ""
        : game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest")
  }
}

/**
 * Toggle modifiers, disabling if not bypassing roll dialog, as they are ignored in interactive tests
 * @param {Element} control : The originating control: bypass checkbox
 * @private
 **/
function toggleBypassTestDialog (control) {
  document.getElementById("testModifier").disabled = !control.checked
  document.getElementById("difficulty").disabled = !control.checked
}
