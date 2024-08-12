export class DamageConsole extends FormApplication {

  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["gmtoolkit"],
      popOut: true,
      id: "damage-console",
      title: game.i18n.localize("GMTOOLKIT.Damage.Dialog.Title"),
      template: "modules/wfrp4e-gm-toolkit/templates/damage.hbs",
      width: 740
    })
  }


  /**
   * Build data set to be presented and manipulated in form, applying default values where not provided in the form application request.
   * @returns {data} object : The data to be presented in the form
   **/
  getData () {
    // Send data to the template
    const data = super.getData()

    // Set group defaults if not provided
    data.group = {
      /* Uncomment this to leverage or add user defined default group,
       * such as that used for Group Tests
      options: {
        type: this.object.groupOptions?.type || game.settings.get("wfrp4e-gm-toolkit", "defaultPartyGroupTest")
      } */
    }
    // Build member list
    data.group.members = {
      playerGroup: game.gmtoolkit.utility.getGroup("entourage"),
      npcTokens: game.gmtoolkit.utility.getGroup("npcTokens")
    }

    const tokenTargets = game.gmtoolkit.utility.getGroup("tokens", { interaction: "targeted", present: true })
    const companyTargets = game.gmtoolkit.utility.getGroup("entourage", { interaction: "targeted", present: true })
    data.group.members.targeted = [...companyTargets, ...tokenTargets]

    return data
  }


  /**
   * Process application options and call the group test routine.
   * @param {object} event : The submission event. Used to identify which button is used to submit the form.
   * @param {object} formData : The data submitted by the form
   * @private
   **/
  async _updateObject (event, formData) {
    if (event.submitter.name === "cancel") return ui.notifications.info(game.i18n.localize("GMTOOLKIT.Damage.Message.Abort"))

    // If randomiseDamage checkbox is disabled, damage must be a whole number
    if (document.getElementById("randomiseDamage").disabled === true && !Number.isInteger(Number(document.getElementById("damageFormula").value))) {
      throw ui.notifications.warn("Invalid damage formula")
    }

    // Call the damage dealer outer, passing in submitted parameters
    await dealDamage(formData).then(this.close())
  }


  /**
   * Identify interaction events and call relevant function
   * @param {object} html : The form application content
   **/
  activateListeners (html) {
    super.activateListeners(html)
    html.find("select#selectedHitLocation").change(event => this._toggleRandomiseHitLocation(event))
    html.find("input#damageFormula").change(event => this._toggleRandomiseDamage(event))
  }


  /**
   * Disable randomise hit location option if 'Roll' is not selected
   * @param {Event} event : The originating event: change in selectedHitLocation dropdown
   * @private
   **/
  _toggleRandomiseHitLocation (event) {
    document.getElementById("randomiseHitLocation").disabled = event.target.value !== "roll"
  }

  /**
   * Disable randomise damage if number or non-roll formula
   * @param {Event} event : The originating event: change in damageFormula field
   * @private
   **/
  _toggleRandomiseDamage (event) {
    try {
      const roll = new Roll(event.target.value).evaluate()
      document.getElementById("randomiseDamage").disabled = roll.isDeterministic
    } catch(err) {
      document.getElementById("randomiseDamage").disabled = true
    }
  }
}

async function dealDamage (data) {
  let actorProcessingResult = ""
  let dealDamageSummary = []

  // Set damageType
  let damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL
  if (data.ignoreAP && data.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL
  if (data.ignoreAP && !data.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP
  if (!data.ignoreAP && data.ignoreTB) damageType = game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB

  // Roll damage and hit location if to be randomised
  let damage = (isNaN(data.damageFormula) && data.randomiseDamage === false)
    ? await evaluateDamageFormula(data.damageFormula)
    : data.damageFormula

  let selectedHitLocation = data.selectedHitLocation
  if (data.selectedHitLocation === "roll" && data.randomiseHitLocation === false) {
    await game.wfrp4e.tables.rollTable("hitloc", { hideDSN: true })
      .then(hitlocPromise => selectedHitLocation = hitlocPromise.result)
  }

  // Set options
  const options = {
    damage: damage,
    damageType: damageType,
    damageFormula: data.damageFormula,
    randomiseDamage: data.randomiseDamage,
    selectedHitLocation: selectedHitLocation,
    randomiseHitLocation: data.randomiseHitLocation,
    minimumOne: data.minimumOne
  }

  // Get the target actors
  for (const member of data.targetGroup) {
    if (member === null) continue
    // Make sure to get the actor rather than the token document
    let actor = await fromUuid(member)
    actor = actor?.actor ? actor.actor : actor
    actorProcessingResult = await processActorDamage(actor, options)
    await dealDamageSummary.push(actorProcessingResult)
  }
  // Process the summary message
  await ChatMessage.create({
    content: dealDamageSummary.join("<br>"),
    whisper: game.users.filter(u => u.isGM).map(u => u.id)
  })

}

async function processActorDamage (actor, options) {
  // Roll damage randomly per character if required
  let damage = options.damage
  if (options.randomiseDamage === true) {
    await evaluateDamageFormula(options.damage)
      .then(damagePromiseResult => damage = damagePromiseResult)
  }

  // Roll hit location randomly per character if required
  let selectedHitLocation = options.selectedHitLocation
  if (options.randomiseHitLocation === true) {
    await game.wfrp4e.tables
      .rollTable(actor.details.hitLocationTable.value, { hideDSN: true })
      .then(hitlocPromiseResult => selectedHitLocation = hitlocPromiseResult.result)
  }

  // Apply damage to the character
  let msg = await actor.applyBasicDamage(Number(damage),
    { damageType: options.damageType,
      minimumOne: options.minimumOne,
      loc: selectedHitLocation,
      suppressMsg: true
    })

  // The actor method applyBasicDamage() should return a msg result if successful.
  // Exit with a fallback message if none is returned.
  if (!msg) return game.i18n.format("GMTOOLKIT.Damage.Message.CannotApplyDamage", { character: actor.name })

  // Update the standard applyBasicDamage message
  // Add a random damage indicator to the results message if a damage formula is used
  if (isNaN(options.damageFormula)) {
    const rollResult = `${options.damage}: ${damage}`
    const appliedDamage = msg.substring(0, msg.search(" "))
    const explainedDamage = `<abbr title = "${rollResult}"><i class = "fas fa-dice"></i></abbr> <strong>${appliedDamage}</strong>`
    msg = msg.replace(appliedDamage, explainedDamage)
  }

  // Add hit location details to the results message if armour is not being ignored
  if (!options.ignoreAP) {
    const hitLocation = game.i18n.localize(game.wfrp4e.config.locations[selectedHitLocation])
    const explainedAP = `<abbr title = "${hitLocation}">AP</abbr>`
    msg = msg.replace("AP", explainedAP)
  }

  // Add heartbeat icon to the results message if character has zero wounds
  if (actor.system.status.wounds.value <= 0) {
    msg += ` <abbr title="${game.i18n.localize("GMTOOLKIT.Damage.Message.At0Wounds")}"><i class="fas fa-heartbeat"></i></abbr>`
  }

  return msg
}

async function evaluateDamageFormula (damageFormula) {
  let damage
  await new Promise((resolve, reject) => {
    resolve(
      new Roll(damageFormula).evaluate()
        .then(r => damage = r)
    )
  })
  if (!damage) console.log(`Cannot evaluate damage formula! ${damageFormula}`)
  return damage.total
}
