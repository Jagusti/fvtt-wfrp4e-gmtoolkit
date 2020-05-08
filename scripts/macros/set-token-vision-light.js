/* Open a dialog for quickly changing vision and lighting parameters of the selected token(s).
 * This macro requires the advanced macros functionality of Furnace by @KaKaRoTo#4756
 * https://github.com/kakaroto/fvtt-module-furnace/
 * This macro is adapted for WFRP4e from Token Vision Configuration by @Sky#9453
 * https://github.com/Sky-Captain-13/foundry/tree/master/scriptMacros
 */

if (canvas.tokens.controlledTokens.length < 1) 
  return ui.notifications.error("Please select a token first.");

let applyChanges = false;

console.log("Before Dialog: ", token.actor.name, "Night Vision:", token.actor.advNightVision);

new Dialog({
  title: `Set Token Vision and Light`,
  content: `
    <form> 
      <div class="form-group">
        <label>Vision Type:</label>
        <select id="vision-type" name="vision-type"> 
          <option value="normalVision">Normal</option>
          <option value="blindedVision">Blinded (Condition)</option>
          <option value="nightVision">Night Vision (Talent)</option>
          <option value="darkVision">Dark Vision (Trait)</option>
          <option value="noVision">No Vision</option>
        </select>
      </div>
      <div class="form-group">
        <label>Light Source:</label>
        <select id="light-source" name="light-source">
          <option value="none">None</option>
          <option value="candle">Candle (10 yds)</option>
          <option value="davrich-lamp">Davrich Lamp (10 yds)</option>
          <option value="torch">Torch (15 yds)</option>
          <option value="lantern">Lantern (20 yds)</option>
          <option value="storm-dim">Storm Lantern (Broadbeam) (20 yds)</option>
          <option value="storm-bright">Storm Lantern (Narrowbeam) (30 yds)</option>
          <option value="light">Light (Petty Magic) (15 yds)</option>
          <option value="witchlight">Witchlight (Miscast) (20 yds)</option>
          <option value="glowing-skin">Glowing Skin (Mutation) (10 yds)</option>
          <option value="ablaze">Ablaze (Condition) (15 yds)</option>
          <option value="pha">Pha's Protection (WP Bonus yds)</option>
        </select>
      </div>
    </form>
    `,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Apply Changes`,
      callback: () => applyChanges = true
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel Changes`
    },
  },
  default: "yes",
  close: html => {
    if (applyChanges) {
      for ( let token of canvas.tokens.controlled ) {
        let visionType = html.find('[name="vision-type"]')[0].value || "nochange"; // TODO: default vision option based on condition -> trait -> talent
		let lightSource = html.find('[name="light-source"]')[0].value || "nochange";
        let advNightVision = 0;
        let dimSight = 0;
        let brightSight = 0;
        let dimLight = 0;
        let brightLight = 0; // TODO: user define brightLight distance as ratio of dimLight
        let lightAngle = 360;
		let lightColor = ""; // TODO: apply colours for different light sources
        let lockRotation = token.data.lockRotation;
		
        // Get Light Source Values
        switch (lightSource) {
          case "none":
            dimLight = 0;
            brightLight = 0;
            break;
          case "candle":
            dimLight = 10;
            brightLight = 5;
            break;
          case "torch":
            dimLight = 15;
            brightLight = 7.5;
            break;
          case "davrich-lamp":
            dimLight = 10;
            brightLight = 5;
            break;
          case "lantern":
            dimLight = 20;
            brightLight = 10;
            break;
          case "storm-dim":
            dimLight = 20;
            brightLight = 10;
            lockRotation = false;
            lightAngle = 90;
            break;
          case "storm-bright":
            dimLight = 30;
            brightLight = 15;
            lockRotation = false;
            lightAngle = 60;
            break;
          case "light":
            dimLight = 15;
            brightLight = 7.5;
            break;
          case "witchlight":
            dimLight = 20;
            brightLight = 10;
            break;
          case "glowing-skin":
            dimLight = 10;
            brightLight = 5;
            break;
          case "ablaze":
            dimLight = 15;
            brightLight = 7.5;
            break;
          case "pha":
            dimLight = token.actor.data.data.characteristics.wp.bonus;
            brightLight = (dimLight / 2);
            break;
          case "nochange":
          default:
            dimLight = token.data.dimLight;
            brightLight = token.data.brightLight;
            lightAngle = token.data.lightAngle;
            lockRotation = token.data.lockRotation;
            lightColor = token.data.lightColor;
        }
		
		
        // Get Vision Type Values
		switch (visionType) {
          case "noVision":
            dimSight = 0;
            brightSight = 0;
            break;
          case "normalVision":
            dimSight = 2; // TODO: user define normal vision
            brightSight = 0;
            break;
          case "blindedVision":
            dimSight = 1;
            brightSight = 0; 			
            break;
          case "nightVision":
			let item = token.actor.items.find(i => i.data.name === "Night Vision")
				if(item == undefined || item.data.data.advances.value < 1) {
					advNightVision = 0;
				} else { 
					for (let item of token.actor.items)
						{
						  if (item.type == "talent" && item.name == "Night Vision")
						  {
							advNightVision += item.data.data.advances.value;
						  }
						}
				}
			dimSight = (20 * advNightVision) + dimLight; 
			brightSight = (5 * advNightVision) + brightLight;
			break;
          case "darkVision":
            dimSight = 60;
            brightSight= 30;
            break;
          case "nochange":
            default:
            dimSight = token.data.dimSight;
            brightSight = token.data.brightSight;
        }
		
        // Update Token
        token.update({
          vision: true,
          visionType: visionType,
          lightSource: lightSource,
          dimLight: dimLight, 
          brightLight:  brightLight,
          lightAngle: lightAngle,
          lightColor: lightColor,
          dimSight: dimSight,
          brightSight: brightSight,
          lockRotation: lockRotation,
          advNightVision: advNightVision
        });
      }
    }
  }
}).render(true);