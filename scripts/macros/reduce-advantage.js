/* Reduces Advantage for the selected token by 1 (to minimum 0).
*/

if (!token)
  return ui.notifications.error("Please select a token first.");

if (Number(actor.data.data.status.advantage.value) > 0)
    {
        actor.update({"data.status.advantage.value" : Number(actor.data.data.status.advantage.value)-1}); 

        ui.notifications.notify(`Advantage reduced by 1 to ${Number(actor.data.data.status.advantage.value)-1} for ${actor.data.name}.`)
    } 
    else 
    {
        ui.notifications.notify(`${actor.data.name} already has ${actor.data.data.status.advantage.value} Advantage. No change made.`);
    }
