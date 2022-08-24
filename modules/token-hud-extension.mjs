/* eslint-disable no-useless-return */
import GMToolkit from "./gm-toolkit.mjs"
import { hasSkill, adjustStatus } from "./utility.mjs"

export default class TokenHudExtension {

  static async addTokenHudExtensions (app, html, data) {
    const actor = game.actors.get(canvas.tokens.controlled[0].actor.id)
    if (actor === undefined) return

    const wfrp4eContent = {}
    wfrp4eContent.core = game.modules.get("wfrp4e-core")?.active || false
    GMToolkit.log(false, wfrp4eContent.core)

    this.addHudContainer(app, html, data)
    this.addPlayerCharacterTokenTip(app, html, data, actor, wfrp4eContent)
    this.addInitiativeTokenTip(app, html, data, actor)
    this.addMovementTokenTip(app, html, data, actor)
  }

  static async addHudContainer (app, html, data) {
    // Add Extension Container
    const divTokenHudExt = '<div class="tokenHudContainer"></div>'
    html.find(".col.left").before(divTokenHudExt)

    // Add Extension columns
    const hudExtensionColumnInner = '<div class="col tokenHudColumn" id="hudLeftInner"></div>'
    const hudExtensionColumnOuter = '<div class="col tokenHudColumn" id="hudLeftOuter"></div>'

    html.find(".tokenHudContainer").prepend(hudExtensionColumnOuter)
    html.find(".tokenHudContainer").prepend(hudExtensionColumnInner)
  }

  static async addMovementTokenTip (app, html, data, actor) {

    const actorMoveDetails = actor.system.details.move
    const move = actorMoveDetails.value
    let TooltipMovement = `${game.i18n.localize("Move")}: ${move}`
    let displayedMovement = move
    let movementIcon = "fa-dharmachakra"
    if (actor.type !== "vehicle") {
      const { walk, run } = actorMoveDetails
      const swim = actorMoveDetails.value / 2
      movementIcon = "fa-shoe-prints"
      TooltipMovement += `; ${game.i18n.localize("Walk")}: ${walk}; ${game.i18n.localize("Run")}: ${run}; ${game.i18n.localize("Swim")}: ${swim}`
      displayedMovement = run
    }
    const hudMovement = $(`<div class="control-icon tokenhudicon left" id="movement" title="${TooltipMovement}"><i class="fas ${movementIcon}"><span class="tokenhudext">&nbsp;${displayedMovement}</span></i></div>`)
    html.find('[id = "hudLeftInner"]').prepend(hudMovement)// Add Movement token tip

    // Add interactions for Movement
    hudMovement.find("i").dblclick(async ev => {
      if (actor.type === "vehicle") return
      GMToolkit.log(false, "Movement hud extension double-clicked.")
      if (ev.altKey && ev.shiftKey && ev.ctrlKey) {
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Swim")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      if (ev.ctrlKey && ev.altKey) {
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Climb")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      if (ev.ctrlKey && ev.shiftKey) {
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Drive")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      if (ev.altKey && ev.shiftKey) {
        // TODO: Interrogate actor Ride specializations and offer selection if more than one is available
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Ride")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      if (ev.ctrlKey) {
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Dodge")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      if (ev.altKey) {
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Athletics")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      if (ev.shiftKey) {
        // TODO: Interrogate actor Stealth specializations and offer selection if more than one is available
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Stealth")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      GMToolkit.log(false, "Movement Button Clicked")
    })

  }

  static async addInitiativeTokenTip (app, html, data, actor) {

    // Do not show initiative token tip if vehicle
    if (actor.type === "vehicle") return

    const actorCharacteristics = actor.system.characteristics
    const initiative = actorCharacteristics.i.value
    const agility = actorCharacteristics.ag.value
    const TooltipInitiative = `${game.i18n.localize("CHAR.I")}: ${initiative}; ${game.i18n.localize("CHAR.Ag")}: ${agility}`
    const hudInitiative = $(`<div class="control-icon tokenhudicon left" id="initiative" title="${TooltipInitiative}"><i class="fas fa-spinner"><span class="tokenhudext">&nbsp;${initiative}</span></i></div>`)
    html.find('[id = "hudLeftInner"]').prepend(hudInitiative)  // Add Initiative and Agility token tip

    // Add interactions for Initiative and Agility
    hudInitiative.find("i").dblclick(async ev => {
      GMToolkit.log(false, "Initiative hud extension double-clicked.")
      if (ev.ctrlKey && ev.shiftKey) {
        const skill = hasSkill(actor, `${game.i18n.localize("NAME.Track")}`)
        if (skill) {
          actor.setupSkill(skill)
            .then(setupData => {actor.basicTest(setupData)})
        }
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
      if (ev.ctrlKey) {
        actor.setupCharacteristic("i")
          .then(setupData => {actor.basicTest(setupData)})
        ev.preventDefault()
        ev.stopPropagation()
      }
      if (ev.altKey) {
        actor.setupCharacteristic("ag")
          .then(setupData => {actor.basicTest(setupData)})
        ev.preventDefault()
        ev.stopPropagation()
      }
    })

  }

  // eslint-disable-next-line max-len
  static async addPlayerCharacterTokenTip (app, html, data, actor, wfrp4eContent) {

    if (actor.type === "character") {

      // Set variables
      const actorStatus = actor.system.status
      const actorCharacteristics = actor.system.characteristics

      const fortune = actorStatus.fortune.value
      const fate = actorStatus.fate.value
      const resolve = actorStatus.resolve.value
      const resilience = actorStatus.resilience.value
      const corruption = actorStatus.corruption.value
      const maxCorruption = actorStatus.corruption.max
      const sin = actorStatus.sin.value
      const perception = actor.items.find(i => i.name === game.i18n.localize("NAME.Perception")).system.total.value
      const intuition = actor.items.find(i => i.name === game.i18n.localize("NAME.Intuition")).system.total.value

      const TooltipFortune = `${game.i18n.localize("Fortune")}: ${fortune}; ${game.i18n.localize("Fate")}: ${fate}`
      const TooltipResolve = `${game.i18n.localize("Resolve")}: ${resolve}; ${game.i18n.localize("Resilience")}: ${resilience}`
      const TooltipCorruption = `${game.i18n.localize("Corruption")}: ${corruption} / ${maxCorruption}; ${game.i18n.localize("Sin")}: ${sin}`
      const TooltipPerception = `${game.i18n.localize("NAME.Perception")}: ${perception}; ${game.i18n.localize("NAME.Intuition")}: ${intuition}`

      const divTokenHudExt = '<div class="tokenhudext left">'

      // Resolve and Resilience
      const hudResolve = $(`<div class="control-icon tokenhudicon left" id="resolve" title="${TooltipResolve}"><i class="fas fa-hand-rock"><span class="tokenhudext">&nbsp;${resolve}</span></i></div>`)
      html.find('[id = "hudLeftOuter"]').prepend(hudResolve)// Add Resolve token tip

      // Add interactions for Resolve and Resilience
      hudResolve.find("i").contextmenu(async ev => {
        GMToolkit.log(false, "Resolve hud extension right-clicked.")
        if (ev.ctrlKey) {
          const result = await adjustStatus(actor, "Resolve", -1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey) {
          const result = await adjustStatus(actor, "Resolve", 1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
      })
      hudResolve.find("i").dblclick(async ev => {
        GMToolkit.log(false, "Resolve hud extension double-clicked.")
        if (ev.ctrlKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Cool")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.altKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Endurance")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.ConsumeAlcohol")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
      })

      // Fortune and Fate
      const hudFortune = $(`<div class="control-icon tokenhudicon left" id="fortune" title="${TooltipFortune}"><i class="fas fa-dice"><span class="tokenhudext">&nbsp;${fortune}</span></i></div>`)
      html.find('[id = "hudLeftOuter"]').append(hudFortune)// Add Fortune token tip
      // Add interactions for Fortune and Fate
      hudFortune.find("i").contextmenu(async ev => {
        GMToolkit.log(false, "Fortune hud extension right-clicked.")
        if (ev.ctrlKey) {
          const result = await adjustStatus(actor, "Fortune", -1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey) {
          const result = await adjustStatus(actor, "Fortune", 1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
      })
      hudFortune.find("i").dblclick(async ev => {
        GMToolkit.log(false, "Fortune hud extension double-clicked.")
        if (ev.shiftKey && ev.altKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.CharmAnimal")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.ctrlKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Gamble")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Charm")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.altKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Gossip")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
      })


      // Corruption, Sin, Perception, Intuition
      // Corruption and Sin
      const hudCorruption = $(`<div class="control-icon tokenhudicon left" id="corruption" title="${TooltipCorruption}"><i class="fas fa-bahai"><span class="tokenhudext">&nbsp;${corruption}</span></i></div>`)
      html.find('[id = "hudLeftOuter"]').prepend(hudCorruption)// Add Corruption token tip

      // Add interactions for Corruption and Sin
      hudCorruption.find("i").contextmenu(async ev => {
        GMToolkit.log(false, "Corruption hud extension right-clicked.")
        if (ev.ctrlKey && ev.altKey) {
          const result = await adjustStatus(actor, "Sin", -1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey && ev.altKey) {
          const result = await adjustStatus(actor, "Sin", 1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.ctrlKey) {
          const result = await adjustStatus(actor, "Corruption", -1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey) {
          const result = await adjustStatus(actor, "Corruption", 1)
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
      })
      hudCorruption.find("i").dblclick(async ev => {
        GMToolkit.log(false, "Corruption hud extension double-clicked.")
        if (ev.ctrlKey && ev.altKey) {
          const littlePrayer = await new Roll("d100").roll({ async: true })
          const result = game.i18n.format("GMTOOLKIT.TokenHudExtension.LittlePrayerResult", { actorName: actor.name, littlePrayerResult: littlePrayer.result })
          ChatMessage.create(game.wfrp4e.utility.chatDataSetup(result, "gmroll", true))
          GMToolkit.log(false, result)
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey && ev.altKey && wfrp4eContent.core) {
          const result = (game.tables.getName("Wrath of the Gods Table"))
            ? await game.wfrp4e.tables.rollTable("wrath")
            : `${game.i18n.format("GMTOOLKIT.TokenHudExtension.ImportTable", { table: "Wrath of the Gods" })}`
          const chatData = game.wfrp4e.utility.chatDataSetup(result?.result || result, "gmroll", true)
          chatData.flavor = game.i18n.format("GMTOOLKIT.TokenHudExtension.Sufferance", { actor: actor.name, plight: "the Wrath of the Gods" })
          ChatMessage.create(chatData, {})
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.ctrlKey && wfrp4eContent.core) {
          const result = (game.tables.getName("Physical Mutation"))
            ? await game.wfrp4e.tables.rollTable("mutatephys")
            : `${game.i18n.format("GMTOOLKIT.TokenHudExtension.ImportTable", { table: "Physical Mutation" })}`
          const chatData = game.wfrp4e.utility.chatDataSetup(result?.result || result, "gmroll", true)
          chatData.flavor = game.i18n.format("GMTOOLKIT.TokenHudExtension.Sufferance", { actor: actor.name, plight: "Physical Mutation" })
          ChatMessage.create(chatData, {})
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.shiftKey && wfrp4eContent.core) {
          const result = (game.tables.getName("Mental Corruption"))
            ? await game.wfrp4e.tables.rollTable("mutatemental")
            : `${game.i18n.format("GMTOOLKIT.TokenHudExtension.ImportTable", { table: "Mental Corruption" })}`
          const chatData = game.wfrp4e.utility.chatDataSetup(result?.result || result, "gmroll", true)
          chatData.flavor = game.i18n.format("GMTOOLKIT.TokenHudExtension.Sufferance", { actor: actor.name, plight: "Mental Corruption" })
          ChatMessage.create(chatData, {})
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.altKey && !ev.shiftKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Pray")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
      })

      // Perception and Intuition
      const hudPerception = $(`<div class="control-icon tokenhudicon left" id="perception" title="${TooltipPerception}"><i class="fas fa-eye"><span class="tokenhudext">&nbsp;${perception}</span></i></div>`)
      html.find('[id = "hudLeftInner"]').append(hudPerception)// Add Perception token tip

      // Add interactions for Perception and Intuition
      hudPerception.find("i").dblclick(async ev => {
        GMToolkit.log(false, "Perception hud extension double-clicked.")
        if (ev.altKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Intuition")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
        if (ev.ctrlKey) {
          const skill = hasSkill(actor, `${game.i18n.localize("NAME.Perception")}`)
          if (skill) {
            actor.setupSkill(skill)
              .then(setupData => {actor.basicTest(setupData)})
          }
          ev.preventDefault()
          ev.stopPropagation()
          return
        }
      })

    }
  }

}
