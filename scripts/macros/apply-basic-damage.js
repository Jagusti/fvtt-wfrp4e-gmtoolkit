const dialog = new Dialog({
  title: game.i18n.localize("GMTOOLKIT.Dialog.ApplyBasicDamage.Title"),
  content:
    `<form>
      <!-- TEXTBOX: Enter damage amount or dice roll amount -->
      <div class="form-group">
        <label for="damageFormula" title="A whole number or roll formula for the amount of damage to apply.">Damage to apply</label>
        <input type="text" id="damageFormula" name="damageFormula">
      </div>  
      <!-- CHECKBOX: Randomise damage per target -->
      <div class="form-group">
        <label for="randomiseDamage" title="Randomise damage for each target if a valid dice roll formula is provided.">Roll damage for each token</label>
        <input type="checkbox" id="randomiseDamage" name="randomiseDamage">
      </div>
      <!-- CHECKBOX: Minimum One -->
      <div class="form-group">
        <label for="minimumOne" title="Apply at least 1 point of damage after any armour and Tougness Bonus reductions.">Minimum 1 Damage</label>
        <input type="checkbox" id="minimumOne" name="minimumOne" checked>
      </div>
      <!-- CHECKBOX: Ignore Toghness Bonus -->
      <div class="form-group">
        <label for="ignoreTB" title="Ignore Tougness Bonus.">Ignore TB</label>
        <input type="checkbox" id="ignoreTB" name="ignoreTB">
      </div>
      <!-- CHECKBOX: Ignore Armour Points -->
      <div class="form-group">
        <label for="ignoreAP" title="Ignore Armour Points.">Ignore AP</label>
        <input type="checkbox" id="ignoreAP" name="ignoreAP">
      </div>
      <!-- DROPDOWN: Hit Location -->
      <div class="form-group custom-select">
        <label>Hit Location</label>
        <select name="selectedHitLocation" id="selectedHitLocation">
            <option value="roll">Roll</option>
            <option value="none">None</option>
            <option value="head">Head</option>
            <option value="lArm">Left Arm</option>
            <option value="rArm">Right Arm</option>
            <option value="body" selected>Body</option>
            <option value="lLeg">Left Leg</option>
            <option value="rLeg">Right Leg</option>
          </select>
      </div>
      <!-- CHECKBOX: Suppress Message -->
      <div class="form-group">
        <label for="suppressMsg" title="Don't show results in chat.">Suppress Message</label>
        <input type="checkbox" id="suppressMsg" name="suppressMsg">
      </div>
    </form>`,
  buttons: {
    cancel: {
      label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
      callback: async () => {
        console.log("Closing without action")
        this.close
      }
    },
    apply: {
      // label: game.i18n.localize("GMTOOLKIT.Dialog.ApplyBasicDamage.ApplyDamage"),
      label: game.i18n.localize("Apply Damage"),
      callback: async () => {
        options = {
          damageFormula: damageFormula.value,
          randomiseDamage: randomiseDamage.checked,
          minimumOne: minimumOne.checked,
          ignoreTB: ignoreTB.checked,
          ignoreAP: ignoreAP.checked,
          selectedHitLocation: selectedHitLocation.value,
          suppressMsg: suppressMsg.checked
        }
        console.log(options)
        applyDamageToGroup(options)
      }
    }
  },
  default: "apply"
}).render(true)

async function applyDamageToGroup (options) {

  // Set damageType
  let damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL
  if (options.ignoreAP && options.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL
  if (options.ignoreAP && !options.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP
  if (!options.ignoreAP && options.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB

  // Roll damage and hit location if to be randomised
  let damage = (isNaN(options.damageFormula) && options.randomiseDamage === false)
    ? await evaluateDamageFormula(options.damageFormula)
    : options.damageFormula
  console.log(options.damageFormula, damage)
  const group = game.gmtoolkit.utility.getGroup("tokens", { interaction: "targeted" })

  // Apply damage
  for (t of group) {
    // Roll randomly per actor if required
    if (options.randomiseDamage === true) {
      console.log(`Randomising damage for ${t.name}`)
      await evaluateDamageFormula(options.damageFormula)
        .then(damagePromiseResult => damage = damagePromiseResult)
      console.log(damage)
    }
    if (options.randomiseDamage === true) {
      console.log(`Randomising hit location for ${t.name}`)
      await game.wfrp4e.tables
        .rollTable(t.actor.details.hitLocationTable.value, { hideDSN: true })
        .then(hitlocPromiseResult => selectedHitLocation = hitlocPromiseResult)
      console.log(selectedHitLocation)
    }
    t.actor.applyBasicDamage(Number(damage),
      { damageType,
        minimumOne: options.minimumOne,
        loc: selectedHitLocation || options.selectedHitLocation,
        suppressMsg: options.suppressMsg
      })
  }
}

async function evaluateDamageFormula (damageFormula) {
  console.log("Evaluating damage formula")
  let damage
  await new Promise((resolve, reject) => {
    resolve(
      new Roll(damageFormula).evaluate({ async: true })
        .then(r => damage = r)
    )
  })
  console.log(damage)
  if (!damage) console.log("Cannot evaluate damage formula!")
  return isNaN(damage.total) ? false : damage.total
}

/* ==========
* MACRO: Apply Basic Damage
* VERSION: ...
* UPDATED: 2022-08-31
* DESCRIPTION: Increases Advantage for the selected token by 1.
========== */
