import GMToolkit from "./gm-toolkit.mjs"

export default class SocketHandlers {

  // Used for updating Advantage when the opposed test is resolved by a player character that does not own the opposing character
  static async updateAdvantage (data, options, response) {
    GMToolkit.log(true, "Socket: updateAdvantage. Payload.", data)
    // console.log("Socket: updateAdvantage", options)
    // console.log("Socket: updateAdvantage", response)

    if (!game.user.isUniqueGM) return

    const character = game.scenes.active.tokens
      .filter(t => t.actor.id === data.payload.character)[0].actor
    GMToolkit.log(true, "Socket: updateAdvantage. Character.", character)

    const updated = await character.update(data.payload.updateData)
    GMToolkit.log(true, "Socket: updateAdvantage. Updated.", updated)
    return updated
  }

  // Used for updating Advantage flags on combatant when the opposed test is resolved by a player character that does not own the opposing actor
  static async setFlag (data, options, response) {
    GMToolkit.log(true, "Socket: setFlag. Payload.", data)
    // console.log("Socket: setFlag", options)
    // console.log("Socket: setFlag", response)

    if (!game.user.isUniqueGM) return

    const combatant = game.combat.combatants.get(data.payload.character._id)
    GMToolkit.log(true, "Socket: setFlag. Combatant.", combatant)

    ui.notifications.notify(`Setting flag \`${data.payload.updateData.key}\` to \`${data.payload.updateData.value}\` on ${combatant.token.name} as GM`,
      "info",
      { permanent: true, console: true }
    )

    const updated = await combatant.setFlag(
      GMToolkit.MODULE_ID,
      data.payload.updateData.flag,
      { [data.payload.updateData.key]: data.payload.updateData.value }
    )
    GMToolkit.log(true, "Socket: setFlag. Updated.", updated)
    return updated
  }

}
