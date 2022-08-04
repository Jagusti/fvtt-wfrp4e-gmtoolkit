let packsource = [] // Leave empty to include compendium packs from all sources
// let packsouce = ["wfrp4e-core", "wfrp4e-gm-toolkit", "wfrp4e-eis-maps"] // Explicitly specify pack sources to only toggle their visiblity (eg, only show/hide packs from the wfrp4e-core module)

let packtypes = [] // Leave empty to include all types of compendium pack
// let packtypes = ["Actor","Item", "JournalEntry", "Scene", "Macro", "Cards"] // Explicitly specify types of pack to only toggle their visiblity (eg, only show/hide Actor and Item entries)

let packs = []

// eslint-disable-next-line capitalized-comments
let forcePrivate = false // false: toggle current visibility setting for pack; true: force to not visible

if (packsource.length === 0 && packtypes.length === 0 ) packs = game.packs.filter(p => p.metadata.system === "wfrp4e")

if (packsource.length > 0 && packtypes.length === 0 ) {
  packs = game.packs.filter(p => {
    for (const source of packsource) {
      if (p.metadata.package === source) return true
    }
    return false
  })
}

if (packsource.length === 0 && packtypes.length > 0) {
  packs = game.packs.filter(p => p.metadata.system === "wfrp4e").filter(p => {
    for (const type of packtypes) {
      if (p.metadata.type === type) return true
    }
    return false
  })
}


if (packsource.length > 0 && packtypes.length > 0) {
  packs = game.packs.filter(p => {
    for (const compendium of packsource) {
      for (const type of packtypes) {
        if (p.metadata.package === compendium
          && p.metadata.type === type) return true
      }
    }
    return false
  })
}

game.gmtoolkit.module.log(true, packs)

for (const pack of packs) {
  if (forcePrivate) {
    await pack.configure({ private: true })
  } else {
    await pack.configure({ private: !pack.private })
  }
}

/* ==========
* MACRO: Toggle Compendium Pack Visibility
* VERSION: 0.9.5
* UPDATED: 2022-08-04
* DESCRIPTION: Hides (or shows) compendium packs designated for the wfrp4e system
* TIP: If no compendium source is specified, only modules declared for the "wfrp4e" system are included
========== */
