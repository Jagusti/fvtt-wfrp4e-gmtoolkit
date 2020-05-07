/* Restores Fortune the Fate level of targetted character(s).
 * Applies any Luck talent bonus.
 */

if (game.user.targets.size < 1) 
  return ui.notifications.error("Please target a token first.");
  
game.user.targets.forEach(target => {
	console.log(target.actor.data.data.status.fortune.value);

	let startingFortune = target.actor.data.data.status.fortune.value;
	let advLuck = 0;
	let item = target.actor.items.find(i => i.data.name === "Luck")
		if(item == undefined || item.data.data.advances.value < 1) {
			advLuck = 0;
		} else { 
			for (let item of target.actor.items)
				{
				  if (item.type == "talent" && item.name == "Luck")
				  {
					advLuck += item.data.data.advances.value;
				  }
				}
		}

	target.actor.update({
		"data.status.fortune.value": target.actor.data.data.status.fate.value + advLuck
    })
 
    let chatContent = `Resetting Fortune for ${target.data.name} from ${startingFortune} to ${target.actor.data.data.status.fate.value + luckNum}.`;

	let chatData = {
		user: game.user._id,
		content: chatContent
    };

    ChatMessage.create(chatData, {});  
 	console.log(target.actor.data.data.status.fortune.value);
})
