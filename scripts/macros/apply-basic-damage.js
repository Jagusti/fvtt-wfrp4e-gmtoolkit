const dialog = new Dialog({
  title: game.i18n.localize("GMTOOLKIT.Dialog.ApplyBasicDamage.Title"),
  content:
    `<form>
      <!-- TEXTBOX: Enter damage amount or dice roll amount -->
      <div class="form-group">
        <label for="damageFormula" title="A whole number or roll formula for the amount of damage to apply.">Damage to apply</label>
        <input type="text" id="damageFormula" name="damageFormula" value="1d10">
      </div>
      <div class = "form-group">
        <label for="randomiseDamage" title="Randomise damage for each target if a valid dice roll formula is provided.">Roll damage for each target</label>
        <input type="checkbox" id="randomiseDamage" name="randomiseDamage" title="Randomise damage for each target if a valid dice roll formula is provided." checked>
      </div>  
      <!-- DROPDOWN: Hit Location -->
      <div class="form-group custom-select">
        <label for="selectedHitlocation" title="Choose 'Roll' to randomise hit location or for non-humanoid creatures.">Hit Location</label>
        <select name="selectedHitLocation" id="selectedHitLocation">
            <option value="roll" selected>Roll</option>
            <option value="none">None</option>
            <option value="head">Head</option>
            <option value="lArm">Left Arm</option>
            <option value="rArm">Right Arm</option>
            <option value="body">Body</option>
            <option value="lLeg">Left Leg</option>
            <option value="rLeg">Right Leg</option>
        </select>
      </div>
      <!-- CHECKBOX: Randomise per target -->
      <div class="form-group">
        <label for="randomiseHitLocation" title="Randomise hit location for each target if 'Roll' is selected." class = "checkbox-label">Roll hit location for each target</label>
        <input type="checkbox" id="randomiseHitLocation" name="randomiseHitLocation" title="Randomise hit location for each target if 'Roll' is selected." checked>
      </div>
      <!-- CHECKBOX: Ignore Toughness Bonus -->
      <div class="form-group">
        <label for="ignoreTB" title="Ignore Toughness Bonus.">Ignore TB</label>
        <input type="checkbox" id="ignoreTB" name="ignoreTB">
      </div>
      <!-- CHECKBOX: Ignore Armour Points -->
      <div class="form-group">
        <label for="ignoreAP" title="Ignore Armour Points.">Ignore AP</label>
        <input type="checkbox" id="ignoreAP" name="ignoreAP" checked>
      </div>
      <!-- CHECKBOX: Minimum One -->
      <div class="form-group">
        <label for="minimumOne" title="Apply at least 1 point of damage after any armour and Toughness Bonus reductions.">Minimum 1 Damage</label>
        <input type="checkbox" id="minimumOne" name="minimumOne" checked>
      </div>
      <!-- CHECKBOX: Suppress Message -->
      <div class="form-group">
        <label for="suppressMsg" title="Don't show results in chat.">Suppress Message</label>
        <input type="checkbox" id="suppressMsg" name="suppressMsg">
      </div>
      <!-- <label for="damageReason">Reason for damage</label>
      <textarea id="damageReason" name="damageReason" rows="2" cols="40"></textarea> -->
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
      label: game.i18n.localize("Apply Damage"),
      callback: async () => {
        console.log(randomiseDamage.checked)
        options = {
          damageFormula: damageFormula.value,
          randomiseDamage: randomiseDamage.checked,
          randomiseHitLocation: randomiseHitLocation.checked,
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
  console.log(options)

  // Set damageType
  let damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL
  if (options.ignoreAP && options.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL
  if (options.ignoreAP && !options.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP
  if (!options.ignoreAP && options.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB

  // Roll damage and hit location if to be randomised
  console.log("Setting or rolling damage for group")
  let damage = (isNaN(options.damageFormula) && options.randomiseDamage === false)
    ? await evaluateDamageFormula(options.damageFormula)
    : options.damageFormula
  console.log(damage)

  console.log("Randomising hit location for group")
  let selectedHitLocation = (options.selectedHitLocation === "roll" && options.randomiseHitLocation === false)
    ? await game.wfrp4e.tables
      .rollTable(t.actor.details.hitLocationTable.value, { hideDSN: true })
      .then(hitlocPromiseResult => selectedHitLocation = hitlocPromiseResult.result)
    : options.selectedHitLocation
  console.log(selectedHitLocation)

  // Build group of targeted tokens
  const group = game.gmtoolkit.utility.getGroup("tokens", { interaction: "targeted" })

  // Iterate each group member
  for (t of group) {
    // Roll damage randomly per character if required
    if (options.randomiseDamage === true) {
      console.log(`Randomising damage for ${t.name}`)
      await evaluateDamageFormula(options.damageFormula)
        .then(damagePromiseResult => damage = damagePromiseResult)
    }
    console.log(damage)
    // Roll hit location randomly per character if required
    if (options.randomiseHitLocation === true) {
      console.log(`Randomising hit location for ${t.name}`)
      await game.wfrp4e.tables
        .rollTable(t.actor.details.hitLocationTable.value, { hideDSN: true })
        .then(hitlocPromiseResult => selectedHitLocation = hitlocPromiseResult.result)
    }
    console.log(selectedHitLocation)

    // Apply damage to token
    t.actor.applyBasicDamage(Number(damage),
      { damageType,
        minimumOne: options.minimumOne,
        loc: selectedHitLocation,
        suppressMsg: options.suppressMsg
      })
  }
}

async function evaluateDamageFormula (damageFormula) {
  console.log("Evaluating damage formula")
  let damage
  await new Promise((resolve, reject) => {
    resolve(
      new Roll(damageFormula).evaluate()
        .then(r => damage = r)
    )
  })
  console.log(damage)
  if (!damage) console.log("Cannot evaluate damage formula!")
  return damage.total
}

/* ==========
* MACRO: Apply Basic Damage
* VERSION: ...
* UPDATED: 2024-08-11
* DESCRIPTION: --
========== */
