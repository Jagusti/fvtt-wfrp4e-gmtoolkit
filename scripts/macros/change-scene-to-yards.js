const scale = 2 / canvas.scene.grid.distance;
await canvas.scene.update({
"grid.distance": 2,
"grid.units": "yd"
});
const newLights = canvas.scene.lights.map(light => {
  return {
    _id: light.id,
    "config.dim": light.config.dim * scale,
    "config.bright": light.config.bright * scale
  };
});
await canvas.scene.updateEmbeddedDocuments("AmbientLight", newLights);

/* ==========
* MACRO: Change scene to yards
* VERSION: 1.0
* UPDATED: 2023-03-08
* DESCRIPTION: Change scene grid to 2 yards, keeping lighting at scale. Useful for maps created for DnD that have a grid of 5ft, or any other grid size.
========== */
