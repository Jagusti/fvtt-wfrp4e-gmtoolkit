/* Increases Advantage for the selected token by 1.
 * Caps at character's maximum advantage. 
*/

if (!token)
  return ui.notifications.error("Please select a token first.");

if (Number(actor.data.data.status.advantage.max) > Number(actor.data.data.status.advantage.value))
    {
        actor.update({"data.status.advantage.value" : Number(actor.data.data.status.advantage.value)+1}); 

        ui.notifications.notify(`Advantage increased by 1 to ${Number(actor.data.data.status.advantage.value)+1} for ${actor.data.name}.`)
    } 
    else 
    {
        ui.notifications.notify(`${actor.data.name} is already at maximum (${Number(actor.data.data.status.advantage.max)}). No change made.`);
    }
