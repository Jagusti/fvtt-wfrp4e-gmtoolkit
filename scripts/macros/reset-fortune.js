/* Restores Fortune the Fate level of targetted character(s).
 * Applies any Luck talent bonus.
 */

resetFortune();

async function resetFortune() {
	if (game.user.targets.size < 1) 
	return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.TargetPCs"),{});

	let targetName = String(); 
	let startingFortune = Number();
	let newFortune = Number();
	let chatContent;

	game.user.targets.forEach(target => {
		targetName = target.data.name; 
		
		if (target.actor.data.type == "character")
			{
				startingFortune = target.actor.data.data.status.fortune.value;
				let advLuck = 0;
				let item = target.actor.items.find(i => i.data.name === game.i18n.localize("GMTOOLKIT.Talent.Luck") )
				if(item == undefined || item.data.data.advances.value < 1) {
					advLuck = 0;
					} else { 
						for (let item of target.actor.items)
							{
							if (item.type == "talent" && item.name == game.i18n.localize("GMTOOLKIT.Talent.Luck"))
								{
									advLuck += item.data.data.advances.value;
								}
							}
					}
				newFortune = target.actor.data.data.status.fate.value +advLuck
				target.actor.update({
					"data.status.fortune.value": newFortune
				})
	
				chatContent = game.i18n.format("GMTOOLKIT.ResetFortune.Success",{targetName, startingFortune, newFortune} );
			} else {
				chatContent = game.i18n.format("GMTOOLKIT.ResetFortune.NotPC", {targetName} )
			}
		let chatData = {
			user: game.user.id,
			content: chatContent
		};

		ChatMessage.create(chatData, {});  
		console.log(chatContent);
	})
};