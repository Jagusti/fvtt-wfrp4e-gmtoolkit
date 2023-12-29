import GMToolkit from "./gm-toolkit.mjs"
import { runActorTest } from "./group-test.mjs"

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


  /**
   * Request a roll from players which is resolved using
   * the group test function `runActorTest()`
   * @param {Object} data :
   *  type (indicating socket context)
   *  payload (with transaction specific data)
   * @param {string} options : id of requesting user
   * -------------------------------------------- **/
  static async requestRoll (data, options) {
    GMToolkit.log(true, `Socket: ${data.type}. Payload.`, data, options)

    const actor = game.actors.get(data.payload.character._id)
    const testSkill = data.payload.test.against
    const testOptions = data.payload.test.options

    // Bypass users that are not intended recipients for the roll request
    if (game.user.character !== actor) return GMToolkit.log(true, `Socket: ${data.type}. Not my roll.`)

    const delegatedRoll = await runActorTest(actor, testSkill, testOptions)
    return delegatedRoll

  }


  /**
   * Update group test aggregate results when roll is delegated to player
   * by pushing a socket request to a unique GM
   * @param {Object} data :
   *  type (indicating socket context)
   *  payload (with transaction specific data)
   * @param {string} options : id of requesting user
   * -------------------------------------------- **/
  static async aggregateGroupTestResults (data, options) {
    GMToolkit.log(true, `Socket: ${data.type}. Payload.`, data, options)

    if (!game.user.isUniqueGM) return GMToolkit.log(
      true,
      `Socket: ${data.type}. Only GMs can update aggregate Group Test results.`
    )

    const response = await game.settings.set(
      "wfrp4e-gm-toolkit",
      "aggregateResultGroupTest",
      data.payload
    )

    GMToolkit.log(true, `Socket: ${data.type}. Results.`, response)

  }

}
