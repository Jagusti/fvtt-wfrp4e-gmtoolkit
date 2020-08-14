/* Open a dialog for quickly changing vision and lighting parameters of the selected token(s).
 * This macro is adapted for WFRP4e from Token Vision Configuration by @Sky#9453
 * https://github.com/Sky-Captain-13/foundry/tree/master/scriptMacros
 */

(() => { 
  if (canvas.tokens.controlled.length < 1) 
    return ui.notifications.error( game.i18n.localize("GMTOOLKIT.Token.Select"),{} );

  let applyChanges = false;

  new Dialog({
    title: game.i18n.localize("GMTOOLKIT.Dialog.SetVisionLight.Title"),
    content: `
      <form> 
        <div class="form-group">
          <label>
          ${game.i18n.localize("GMTOOLKIT.Dialog.SetVisionLight.VisionType")}
        </label>
          <select id="vision-type" name="vision-type"> 
            <option value="normalVision">
            ${game.i18n.localize("GMTOOLKIT.Vision.Normal")} 
            </opton> 
            <option value="blindedVision"> 
            ${game.i18n.localize("GMTOOLKIT.Vision.Blinded")} 
            </option>
            <option value="nightVision"> 
            ${game.i18n.localize("GMTOOLKIT.Vision.Night")} 
            </option>
            <option value="darkVision">
            ${game.i18n.localize("GMTOOLKIT.Vision.Dark")} 
            </option>
            <option value="noVision">
            ${game.i18n.localize("GMTOOLKIT.Vision.None")} 
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>
          ${game.i18n.localize("GMTOOLKIT.Dialog.SetVisionLight.LightSource")} 
          </label>
          <select id="light-source" name="light-source">
            <option value="none"> 
            ${game.i18n.localize("GMTOOLKIT.LightSource.NoLight")}
            </option>
            <option value="candle">
            ${game.i18n.localize("GMTOOLKIT.LightSource.Candle")} 
            </option>
            <option value="davrich-lamp">
            ${game.i18n.localize("GMTOOLKIT.LightSource.DavrichLamp")} 
            </option>
            <option value="torch">
            ${game.i18n.localize("GMTOOLKIT.LightSource.Torch")}
            </option>
            <option value="lantern">
            ${game.i18n.localize("GMTOOLKIT.LightSource.Lantern")}
            </option>
            <option value="storm-dim">
            ${game.i18n.localize("GMTOOLKIT.LightSource.StormLantern.Dim")} 
            </option>
            <option value="storm-bright">
            ${game.i18n.localize("GMTOOLKIT.LightSource.StormLantern.Bright")} 
            </option>
            <option value="storm-shut"> 
            ${game.i18n.localize("GMTOOLKIT.LightSource.StormLantern.Shut")}
            </option>
            <option value="light">
            ${game.i18n.localize("GMTOOLKIT.LightSource.Light")}
            </option>
            <option value="witchlight">
            ${game.i18n.localize("GMTOOLKIT.LightSource.Witchlight")}
            </option>
            <option value="glowing-skin">
            ${game.i18n.localize("GMTOOLKIT.LightSource.GlowingSkin")}
            </option>
            <option value="ablaze"> 
            ${game.i18n.localize("GMTOOLKIT.LightSource.Ablaze")} 
            </option>
            <option value="pha">
            ${game.i18n.localize("GMTOOLKIT.LightSource.Pha")} 
            </option>
          </select>
        </div>
      </form>
      `,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: game.i18n.localize("GMTOOLKIT.Dialog.Apply"),
        callback: () => applyChanges = true
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
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
        let item = token.actor.items.find(i => i.data.name.toLowerCase() == game.i18n.localize("GMTOOLKIT.Talent.NightVision").toLowerCase() );
          if(item == undefined || item.data.data.advances.value < 1) {
            advNightVision = 0;
          } else { 
            for (let item of token.actor.items)
              {
                if (item.type == "talent" && item.name.toLowerCase() == game.i18n.localize("GMTOOLKIT.Talent.NightVision").toLowerCase() )
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
})();