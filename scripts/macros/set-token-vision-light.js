setTokenVisionLight()

async function canvasTokensUpdate (data) {
  const updates = canvas.tokens.controlled
    .map(token => foundry.utils.mergeObject({ _id: token.id }, data))
  await canvas.scene.updateEmbeddedDocuments("Token", updates)
}

async function setTokenVisionLight () {
  if (canvas.tokens.controlled.length < 1) return ui.notifications.error( game.i18n.localize("GMTOOLKIT.Token.Select"), {} )

  let applyChanges = false

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
              </option> 
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
              <option value="matches">
              ${game.i18n.localize("GMTOOLKIT.LightSource.Matches")} 
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
              <option value="storm-broad">
              ${game.i18n.localize("GMTOOLKIT.LightSource.StormLantern.Dim")} 
              </option>
              <option value="storm-narrow">
              ${game.i18n.localize("GMTOOLKIT.LightSource.StormLantern.Bright")} 
              </option>
              <option value="ablaze"> 
              ${game.i18n.localize("GMTOOLKIT.LightSource.Ablaze")} 
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
              <option value="soulfire">
              ${game.i18n.localize("GMTOOLKIT.LightSource.Soulfire")} 
              </option>
              <option value="pha">
              ${game.i18n.localize("GMTOOLKIT.LightSource.Pha")} 
              </option>
            </select>
          </div>
        </form>
        `,
    buttons: {
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel")
      },
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: game.i18n.localize("GMTOOLKIT.Dialog.Apply"),
        callback: () => applyChanges = true
      }
    },
    default: "yes",
    close: async html => {
      if (applyChanges) {

        for ( const token of canvas.tokens.controlled ) {

          // Define a set of baseline values. Light Source and Vision choices will only change the properties that differ. Not all of the options available since Foundry v9 are used.
          // Baseline Night Vision Advances
          let advNightVision = 0
          // Baseline Vision Values
          let sightAngle = 360
          let sightAttenuation = 0.1
          let sightBrightness = 0
          let sightColor = null
          let sightContrast = 0
          let sightRange = 0
          let sightSaturation = 0
          let visionMode = "basic"
          // Baseline Light Source Values
          let lightAlpha = 0.5 // Previously lightColorIntensity
          let lightAngle = 360
          let lightAnimationType = null
          let lightAnimationSpeed = 1
          let lightAnimationIntensity = 1
          let lightAnimationReverse = false
          let lightAttenuation = 0.5
          let lightBright = 0
          let lightColor = null
          let lightColoration = 1 // Coloration Technique: 1=AdaptiveLuminance, 10= NaturaLLight
          let lightContrast = 0
          let lightDarknessMax = 1
          let lightDarknessMin = 0
          let lightDim = 0
          let lightLuminosity = 0
          let lightSaturation = 0
          let lightShadows = 0

          let visionType = html.find('[name="vision-type"]')[0].value // TODO: default vision option based on condition -> trait -> talent. Issue Log: https://github.com/Jagusti/fvtt-wfrp4e-gmtoolkit/issues/42
          let item // Used for finding whether token has Night Vision or Dark Vision
          let lightSource = html.find('[name="light-source"]')[0].value

          // Get Light Source Values
          switch (lightSource) {
            case "none":
              break
            case "matches":
              lightDim = 5
              lightBright = 2
              lightColor = "#ffaa00"
              lightAlpha = 0.1
              lightAnimationIntensity = 4
              lightAnimationSpeed = 4
              lightAnimationType = "flame"
              break
            case "candle":
              lightDim = 10
              lightBright = 5
              lightColor = "#ffaa00"
              lightAlpha = 0.2
              lightAnimationIntensity = 3
              lightAnimationSpeed = 3
              lightAnimationType = "flame"
              break
            case "davrich-lamp":
              lightDim = 10
              lightBright = 5
              lightColor = "#ffaa00"
              lightAlpha = 0.5
              lightAnimationIntensity = 2
              lightAnimationSpeed = 2
              lightAnimationType = "torch"
              break
            case "torch":
              lightDim = 15
              lightBright = 7.5
              lightColor = "#ffaa00"
              lightAlpha = 0.3
              lightAnimationIntensity = 3
              lightAnimationSpeed = 3
              lightAnimationType = "flame"
              break
            case "lantern":
              lightDim = 20
              lightBright = 10
              lightColor = "#ffcc66"
              lightAlpha = 0.4
              lightAnimationIntensity = 3
              lightAnimationSpeed = 3
              lightAnimationType = "torch"
              break
            case "storm-broad":
              lightDim = 20
              lightBright = 10
              lightColor = "#ffcc66"
              lightAlpha = 0.4
              lightAnimationIntensity = 3
              lightAnimationSpeed = 3
              lightAnimationType = "torch"
              break
            case "storm-narrow":
              lightDim = 30
              lightBright = 20
              lightColor = "#ffcc66"
              lightAlpha = 0.6
              lightAnimationIntensity = 3
              lightAnimationSpeed = 3
              lightAnimationType = "torch"
              lightAngle = 90
              break
            case "light":
              lightDim = 15
              lightBright = 7.5
              lightColor = "#99ffff"
              lightAlpha = 0.4
              lightAnimationIntensity = 3
              lightAnimationSpeed = 3
              lightAnimationType = "pulse"
              lightColoration = 10 // Natural Light
              break
            case "witchlight":
              lightDim = 20
              lightBright = 10
              lightColor = "#99ffff"
              lightAlpha = 0.4
              lightAnimationIntensity = 4
              lightAnimationSpeed = 2
              lightAnimationType = "chroma"
              break
            case "glowing-skin":
              lightDim = 10
              lightBright = 3
              lightColor = "#ffbd80"
              lightAlpha = 0.3
              lightAnimationIntensity = 2
              lightAnimationSpeed = 2
              lightAnimationType = "pulse"
              break
            case "ablaze":
              lightDim = 15
              lightBright = 7.5
              lightColor = "#ff7733"
              lightAlpha = 0.5
              lightAnimationIntensity = 5
              lightAnimationSpeed = 4
              lightAnimationType = "flame"
              break
            case "soulfire":
              lightDim = 15
              lightBright = 7.5
              lightColor = "#ff7733"
              lightAlpha = 0.5
              lightAnimationIntensity = 4
              lightAnimationSpeed = 4
              lightAnimationType = "flame"
              break
            case "pha":
              lightDim = token.actor.system.characteristics.wp.bonus
              lightBright = token.actor.system.characteristics.wp.bonus
              lightColor = "#ffddbb"
              lightAlpha = 0.6
              lightAnimationIntensity = 2
              lightAnimationSpeed = 2
              lightAnimationType = "sunburst"
              break
            default:
              lightDim = token.document.light.dim
              lightBright = token.document.light.bright
              lightAngle = token.document.light.angle
              lightColor = token.document.light.color
          }

          // Get Vision Type Values
          switch (visionType) {
            case "blindedVision":
              sightBrightness = 1
              sightRange = 1
              sightSaturation = 1
              break
            case "noVision":
              sightRange = 0
              sightBrightness = -1
              lightDim = 0
              lightBright = 0
              break
            case "darkVision":
              const darkvision = game.i18n.localize("NAME.DarkVision").toLowerCase()
              item = token.actor.items.find(
                i => i.name.toLowerCase() === darkvision
              )
              if (item !== undefined) {
                sightRange = Number(game.settings.get("wfrp4e-gm-toolkit", "rangeDarkVision"))
              } else {
                game.settings.get("wfrp4e-gm-toolkit", "overrideDarkVision")
                  ? sightRange = Number(game.settings.get("wfrp4e-gm-toolkit", "rangeDarkVision"))
                  : sightRange = Number(game.settings.get("wfrp4e-gm-toolkit", "rangeNormalSight"))
              }
              sightBrightness = sightRange / 2
              break
            case "nightVision":
              const nightvision = game.i18n.localize("NAME.NightVision").toLowerCase()
              // Night Vision requires some minimal illumination to provide a benefit
              if (
                game.scenes.viewed.environment.darknessLevel < 1
                | lightDim > 0
                | game.scenes.viewed.environment.globalLight.enabled
              ) {
                item = token.actor.items.find(
                  i => i.name.toLowerCase() === nightvision
                )
                if (item === undefined) {
                  game.settings.get("wfrp4e-gm-toolkit", "overrideNightVision")
                    ? advNightVision = 1
                    : advNightVision = 0
                } else {
                  for (let item of token.actor.items) {
                    if (item.name.toLowerCase() === nightvision ) {
                      switch (item.type) {
                        case "trait":
                          advNightVision = 1
                          break
                        case "talent":
                          advNightVision += item.system.advances.value
                          break
                      }
                    }
                  }
                }
                if (advNightVision === 0) {
                  sightRange = Number(game.settings.get("wfrp4e-gm-toolkit", "rangeNormalSight"))
                  break
                }
                sightRange = Math.max(
                  (20 * advNightVision) + lightDim,
                  Number(game.settings.get("wfrp4e-gm-toolkit", "rangeNormalSight"))
                )
                sightColor = null
                visionMode = "basic"
                sightSaturation = -1
              }
              console.log(`Night Vision Advances ${advNightVision}`)
              break
            case "normalVision":
              sightRange = Number(game.settings.get("wfrp4e-gm-toolkit", "rangeNormalSight"))
              sightBrightness = 0
              sightColor = null
              visionMode = "basic"
              break
            default:
              sightRange = token.document.sight.range
              sightBrightness = token.document.sight.brightness
              sightColor = null
              visionMode = "basic"
          }

          // Update Token
          await token.document.update({
            sight: {
              angle: sightAngle,
              attenuation: sightAttenuation,
              brightness: sightBrightness,
              color: sightColor,
              contrast: sightContrast,
              enabled: true,
              range: sightRange,
              saturation: sightSaturation,
              visionMode: visionMode
            },
            light: {
              alpha: lightAlpha,
              angle: lightAngle,
              animation: {
                type: lightAnimationType,
                speed: lightAnimationSpeed,
                intensity: lightAnimationIntensity,
                reverse: lightAnimationReverse
              },
              attenuation: lightAttenuation,
              bright: lightBright,
              color: lightColor,
              coloration: lightColoration,
              contrast: lightContrast,
              darkness: {
                max: lightDarknessMax,
                min: lightDarknessMin
              },
              dim: lightDim,
              luminosity: lightLuminosity,
              saturation: lightSaturation,
              shadows: lightShadows
            }
          })
          token.refresh(true)
        }

        canvasTokensUpdate({ "sight.enabled": true })

      }
    }
  }).render(true)
}


/* ==========
 * MACRO: Set Token Vision and Light
 * VERSION: 7.0.0
 * UPDATED: 2024-07-23
 * DESCRIPTION: Open a dialog for quickly changing vision and lighting parameters of the selected token(s).
 * TIP: Default sight range and Darkvision / Night Vision overrides can be configured in Configure Token Vision Settings under Module Settings.
 ========== */
