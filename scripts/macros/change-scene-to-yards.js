const scale = 2 / canvas.scene.grid.distance
await canvas.scene.update({
  "grid.distance": 2,
  "grid.units": "yd"
})
const newLights = canvas.scene.lights.map(light => ({
  _id: light.id,
  "config.dim": light.config.dim * scale,
  "config.bright": light.config.bright * scale
}))
await canvas.scene.updateEmbeddedDocuments("AmbientLight", newLights)

/* ==========
* MACRO: Change Scene to Yards
* VERSION: 6.0.4
* UPDATED: 2026-05-24
* DESCRIPTION: Change scene grid to 2 yards, keeping lighting at scale. Useful for maps created for DnD that have a grid of 5ft, or any other grid size.
========== */
