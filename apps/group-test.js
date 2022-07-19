import { runGroupTest } from "../modules/group-test.mjs";

export class GroupTest extends FormApplication {
  constructor (app) {
    super(app);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['gmtoolkit'],
      popOut: true,   
      id: "group-test",
      title: game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.Title"),
      template: "modules/wfrp4e-gm-toolkit/templates/group-test.hbs",
      width: 740
    })
  }


  /** 
   * Build data set to be presented and manipulated in form, applying default values where not provided in the form application request.
   * @returns {data} object : The data to be presented in the form
   **/
  getData() {
    // Send data to the template
    const data = super.getData()

    data.skills = {
      list: game.gmtoolkit.skills,
      target: this.object.testParameters?.testSkill || game.settings.get("wfrp4e-gm-toolkit", "defaultSkillGroupTest"),
      quickTest1: game.settings.get("wfrp4e-gm-toolkit", "quicktest1GroupTest"),
      quickTest2: game.settings.get("wfrp4e-gm-toolkit", "quicktest2GroupTest"),
      quickTest3: game.settings.get("wfrp4e-gm-toolkit", "quicktest3GroupTest"),
      quickTest4: game.settings.get("wfrp4e-gm-toolkit", "quicktest4GroupTest"),
    }

    data.skills.custom = data.skills.list.map(m => m.name).includes(data.skills.target, name) ? "" : data.skills.target

    data.testParameters = {
      testModifier: this.object.testParameters?.testModifier || game.settings.get("wfrp4e-gm-toolkit", "defaultTestModifierGroupTest"), 
      rollMode:  this.object.testParameters?.rollMode || game.settings.get("wfrp4e-gm-toolkit", "defaultRollModeGroupTest"), 
      testDifficulty: this.object.testParameters?.difficulty || game.settings.get("wfrp4e-gm-toolkit", "defaultDifficultyGroupTest")
      // _slBonus: this.object.testParameters?.slBonus || 0,
      // _successBonus: this.object.testParameters?.successBonus || 0,
    } 

    data.testParameters.bypass = this.object.testParameters?.bypass === undefined ? game.settings.get("wfrp4e-gm-toolkit", "bypassTestDialogGroupTest") : this.object.testParameters?.bypass
    data.testParameters.fallback = this.object.testParameters?.fallback === undefined ? game.settings.get("wfrp4e-gm-toolkit", "fallbackAdvancedSkills") : this.object.testParameters?.fallback

    data.rollModeOptions = CONFIG.Dice.rollModes
    data.difficultyOptions = game.wfrp4e.config.difficultyLabels
    
    // Set group defaults if not provided
    data.group = {
      options : {
        type: this.object.groupOptions?.type || game.settings.get("wfrp4e-gm-toolkit", "defaultPartyGroupTest") //,
        // _present: this.object.groupOptions?.present || true,
        // _interaction: this.object.groupOptions?.interaction || undefined
      }
    }
    // Build member list
    data.group.members = {
      playerGroup: game.gmtoolkit.utility.getGroup(data.group.options.type),
      selected: game.gmtoolkit.utility.getGroup("company", {interaction : "selected", present: true}),
      npcTokens: game.gmtoolkit.utility.getGroup("npcTokens"),
      controlled: canvas.tokens.placeables.filter(t => t._controlled)
    }

    return data
  }

  
  /** 
   * Process application options and call the group test routine.
   * @param {event} object : The submission event. Used to identify which button is used to submit the form. 
   * @param {formData} object : The data submitted by the form
   * @private
   **/
  async _updateObject(event, formData) {
    let testSkill = ""
    
    // Set target skill depending on how the form is submitted 
    switch (event.submitter.name)
    {
      case "quicktest" :
        testSkill = event.submitter.title
        ui.notifications.info(game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.RunningGroupSkillTest", {skill: testSkill}))
        break;
      case "submit" :
        testSkill = formData["skill-name"] ? formData["skill-name"] : formData["skill-list"]
        // has a skill choice been made? 
        if (testSkill) {
          // is it a grouped skill that require a specialisation? 
          // some skills indicate grouped with "( )"
          if (formData["skill-list"].slice(-3) === "( )") {
            testSkill = [
              formData["skill-list"].slice(0,(formData["skill-list"].length - 2)), 
              formData["skill-name"], // insert specified skill as specialisation 
              formData["skill-list"].slice((formData["skill-list"].length - 2))
            ].join("")
          }
          // some skills indicate grouped with "()"
          if (formData["skill-list"].slice(-2) === "()") {
            testSkill = [
              formData["skill-list"].slice(0,(formData["skill-list"].length - 1)), 
              formData["skill-name"], // insert specified skill as specialisation 
              formData["skill-list"].slice((formData["skill-list"].length - 1))
            ].join("")
          }
          // is the skill name well-formed?
          if (testSkill.slice(-2) !== "()" && testSkill.slice(-3) !== "( )") {
            ui.notifications.info(game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.RunningGroupSkillTest", {skill: testSkill}))
            break;
          } 
          ui.notifications.info(game.i18n.format("GMTOOLKIT.Message.MakeSecretGroupTest.SkillNeedsSpecialisation", {skill: testSkill}))
        }
        // fall through if no target skill selected
      case "cancel" : 
      default : 
        return ui.notifications.info(game.i18n.localize("GMTOOLKIT.Message.MakeSecretGroupTest.AbortGroupSkillTest"))
    }

    // Call the secret group test, passing in submitted parameters
    runGroupTest(testSkill, formData)
  }


  /** 
   * Identify interaction events and call relevant function
   * @param {html} object : The form application content
   **/
  activateListeners(html) {
    super.activateListeners(html)
    html.find("select#skill-list").change((event) => this._toggleGroupedSkill(event));
    html.find("input#bypass").change((event) => this._toggleBypassTestDialog(event));
  }
  

  /** 
   * Toggle form label to reflect whether a skill or specialisation is needed
   * @param {Event} event : The originating change event
   * @private
   **/
  _toggleGroupedSkill(event) {
    const label = document.getElementById("skill-name-label");
    const field = document.getElementById("skill-name");
    if (event.target.value.slice(-2) == "()" || event.target.value.slice(-3) == "( )") {
      label.innerHTML = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SetSpecialisation") 
      field.placeholder = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SetSpecialisationPlaceholder")
    } else {
      label.innerHTML = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SpecifySkill") 
      field.placeholder = game.i18n.localize("GMTOOLKIT.Dialog.MakeSecretGroupTest.SpecifySkillPlaceholder") 
    }
  }

  /** 
   * Toggle modifiers, disabling if not bypassing roll dialog, as they are ignored in interactive tests
   * @param {Event} event : The originating change event
   * @private
   **/
  _toggleBypassTestDialog(event) {
    document.getElementById("testModifier").disabled = !event.target.checked;
    document.getElementById("difficulty").disabled = !event.target.checked;    
  }

}