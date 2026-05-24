let packsource = [] // Leave empty to include compendium packs from all sources
// let packsouce = ["wfrp4e-core", "wfrp4e-gm-toolkit", "wfrp4e-eis-maps"] // Explicitly specify pack sources to only toggle their visiblity (eg, only show/hide packs from the wfrp4e-core module)

let packtypes = [] // Leave empty to include all types of compendium pack
// let packtypes = ["Actor","Item", "JournalEntry", "Scene", "Macro", "Cards"] // Explicitly specify types of pack to only toggle their visiblity (eg, only show/hide Actor and Item entries)

let packs = []

let forceLimited = false // false: toggle current visibility setting for pack; true: force to not visible

if (packsource.length === 0 && packtypes.length === 0 ) packs = game.packs.filter(p => p.metadata.system === "wfrp4e")

if (packsource.length > 0 && packtypes.length === 0 ) {
  packs = game.packs.filter(p => {
    for (const source of packsource) {
      if (p.metadata.packageName === source) return true
    }
    return false
  })
}

if (packsource.length === 0 && packtypes.length > 0) {
  console.log(packtypes)
  packs = game.packs.filter(p => p.metadata.system === "wfrp4e").filter(p => {
    for (const type of packtypes) {
      if (p.metadata.type === type) return true
    }
    return false
  })
}

if (packsource.length > 0 && packtypes.length > 0) {
  console.log(packsource, packtypes)
  packs = game.packs.filter(p => {
    for (const source of packsource) {
      for (const type of packtypes) {
        if (p.metadata.packageName === source
          && p.metadata.type === type) return true
      }
    }
    return false
  })
}

console.log(packs)

togglePermissions(packs, forceLimited)

async function togglePermissions (packs, force) {
  const permsLimited = {
    ASSISTANT: "OWNER",
    GAMEMASTER: "OWNER",
    PLAYER: "LIMITED",
    TRUSTED: "LIMITED"
  }
  const permsObserver = {
    ASSISTANT: "OWNER",
    GAMEMASTER: "OWNER",
    PLAYER: "OBSERVER",
    TRUSTED: "OBSERVER"
  }

  for (const pack of packs) {
    if (force) {
      await pack.configure({ ownership: permsLimited })
    } else {
      switch (pack.ownership.PLAYER) {
        case "LIMITED":
          await pack.configure({ ownership: permsObserver })
          break
        case "OBSERVER":
        default:
          await pack.configure({ ownership: permsLimited })
      }
    }
  }
}


/* ==========
* MACRO: Toggle Compendium Pack Visibility
* VERSION: 6.1.0
* UPDATED: 2025-05-25
* DESCRIPTION: Toggles effective visibility of compendium packs
* TIP: If no compendium source is specified, only modules declared for the "wfrp4e" system are included
* TIP: Toggles between Limited and Observer ownership permissions on compendium packs for players and trusted players
========== */
