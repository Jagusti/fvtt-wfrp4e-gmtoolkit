export class DamageConsole
  extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "damage-console",
    tag: "form",
    form: {
      handler: DamageConsole.onSubmit,
      submitOnChange: false,
      closeOnSubmit: true
    },
    position: {
      width: 740
    },
    window: {
      icon: "fas fa-bolt",
      title: "GMTOOLKIT.Damage.Dialog.Title",
      contentClasses: ["standard-form", "gmtoolkit"]
    }
  }

  static PARTS = {
    form: {
      template: "modules/wfrp4e-gm-toolkit/templates/damage.hbs"
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  async _prepareContext (options) {
    const context = await super._prepareContext(options)

    // Set group defaults if not provided
    context.group = {
      /* Uncomment this to leverage or add user defined default group,
        * such as that used for Group Tests
      options: {
        type: this.object.groupOptions?.type || game.settings.get("wfrp4e-gm-toolkit", "defaultPartyGroupTest")
      } */
    }

    // Build member list
    context.group.members = {
      playerGroup: game.gmtoolkit.utility.getGroup("entourage"),
      npcTokens: game.gmtoolkit.utility.getGroup("npcTokens")
    }

    const tokenTargets = game.gmtoolkit.utility.getGroup("tokens", { interaction: "targeted", present: true })
    const companyTargets = game.gmtoolkit.utility.getGroup("entourage", { interaction: "targeted", present: true })
    context.group.members.targeted = [...companyTargets, ...tokenTargets]

    context.buttons = [
      {
        type: "submit",
        icon: "fa-solid fa-ban",
        label: "Cancel",
        action: "cancel"
      },
      {
        type: "submit",
        icon: "fa-solid fa-bolt",
        label: "Apply",
        action: "damage"
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

    const selectedHitLocation = document.getElementById("selectedHitLocation")
    selectedHitLocation.addEventListener("change", () => {
      toggleRandomiseHitLocation(selectedHitLocation)
    })

    const damageFormula = document.getElementById("damageFormula")
    damageFormula.addEventListener("change", () => {
      toggleRandomiseDamage(damageFormula)
    })

  }

  static async onSubmit (event, form, formData) {
    if (event.submitter.dataset.action === "cancel") return ui.notifications.info(game.i18n.localize("GMTOOLKIT.Damage.Message.Abort"))

    // If randomiseDamage checkbox is disabled, damage must be a whole number
    if (document.getElementById("randomiseDamage").disabled === true && !Number.isInteger(Number(document.getElementById("damageFormula").value))) {
      throw ui.notifications.warn("Invalid damage formula")
    }

    // Call the damage dealer outer, passing in submitted parameters
    const choices = foundry.utils.expandObject(formData.object)

    if (!Array.isArray(choices.targetGroup)) {
      choices.targetGroup = [choices.targetGroup]
    }

    // If no target group is selected, abort
    if (choices.targetGroup.filter(member => member !== null).length === 0) {
      return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Damage.Message.Abort"))
    }

    await dealDamage(choices)

  }

}

/**
 * Disable randomise hit location option if 'Roll' is not selected
 * @param {Object} target : The originating control: selectedHitLocation dropdown
 **/
function toggleRandomiseHitLocation ( target ) {
  document.getElementById("randomiseHitLocation").disabled = target.value !== "roll"
}

/**
 * Disable randomise damage if number or non-roll formula
 * @param {Object} target : The originating control: damageFormula field
 **/
async function toggleRandomiseDamage ( target ) {
  try {
    const roll = await new Roll(target.value).evaluate()
    document.getElementById("randomiseDamage").disabled = roll.isDeterministic
  } catch(err) {
    document.getElementById("randomiseDamage").disabled = true
  }
}


/**
 * Process damage application based on selected options
 * @param {Object} data : Data submitted through Damage Console form
 **/
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
    minimumOne: data.minimumOne,
    ignoreAP: data.ignoreAP,
    ignoreTB: data.ignoreTB
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
      loc: selectedHitLocation === "none" ? "body" : selectedHitLocation,
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
    const explainedAP = `<p><strong>Location:</strong> ${hitLocation}</p><hr><p><strong>Wounds`
    msg = msg.replace("</p><hr><p><strong>Wounds", explainedAP)
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
