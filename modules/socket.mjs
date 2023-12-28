import GMToolkit from "./gm-toolkit.mjs"

export default class SocketHandlers {

  /**
   * Update combatant Advantage when the opposed test is resolved
   * by a player character that does not own the opposing character
   * @param {Object} data :
   *  type (indicating socket context)
   *  payload (with transaction specific data)
   * @param {string} options : id of requesting user
   * -------------------------------------------- **/
  static async updateAdvantage (data, options) {
    GMToolkit.log(true, `Socket: ${data.type}. Payload.`, data, options)

    if (!game.user.isUniqueGM) return

    const character = game.scenes.active.tokens
      .filter(t => t.actor.id === data.payload.character)[0].actor
    GMToolkit.log(true, `Socket: ${data.type}. Character.`, character)

    const updated = await character.update(data.payload.updateData)
    GMToolkit.log(true, `Socket: ${data.type}. Updated.`, updated)
    return updated
  }


  /**
   * Update combatant Advantage flags when the opposed test is resolved
   * by a player character that does not own the opposing character
   * @param {Object} data :
   *  type (indicating socket context)
   *  payload (with transaction specific data)
   * @param {string} options : id of requesting user
   * -------------------------------------------- **/
  static async setFlag (data, options) {
    GMToolkit.log(true, `Socket: ${data.type}. Payload.`, data, options)

    if (!game.user.isUniqueGM) return

    const combatant = game.combat.combatants.get(data.payload.character._id)
    GMToolkit.log(true, `Socket: ${data.type}. Combatant.`, combatant)

    ui.notifications.notify(`Setting flag \`${data.payload.updateData.key}\` to \`${data.payload.updateData.value}\` on ${combatant.token.name} as GM`,
      "info",
      { permanent: true, console: true }
    )

    const updated = await combatant.setFlag(
      GMToolkit.MODULE_ID,
      data.payload.updateData.flag,
      { [data.payload.updateData.key]: data.payload.updateData.value }
    )
    GMToolkit.log(true, `Socket: ${data.type}. Updated.`, updated)
    return updated
  }

}
