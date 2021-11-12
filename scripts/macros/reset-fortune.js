resetFortune();

function resetFortune() {
// setup: exit with notice if there are no player-owned characters
	party = Array.from(game.actors).filter(pc => pc.hasPlayerOwner && pc.type == 'character'); 
	if (party.length == 0) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.ResetFortune.NoPlayerCharacters")); 
	let chatContent = ""

// cycle through player characters, updating Fortune and building a report message
	party.forEach (character => {
		currentFortune = character.data.data.status.fortune.value
		maxFortune = getMaxFortune(character);
		character.update({'data.status.fortune.value': maxFortune})
		chatContent += `${character.name}:  ${currentFortune} -> ${maxFortune} <br>`
	});

// confirm changes made in chat
	let chatData = {
		user: game.user.id,
		content: chatContent, 
		flavor: game.i18n.localize("GMTOOLKIT.ResetFortune.Restored") 
	};
	ChatMessage.create(chatData, {});  
}

// Calculate the Fortune target to be restored, based on Fate and Luck talent advances
function getMaxFortune(target) {
    let advLuck = 0;
    let item = target.items.find(i => i.name === game.i18n.localize("GMTOOLKIT.Talent.Luck") )
	if(!(item == undefined || item.data.data.advances.value < 1)) { 
		for (let item of target.items)
			{
				if (item.type == "talent" && item.name == game.i18n.localize("GMTOOLKIT.Talent.Luck"))
					{
						advLuck += item.data.data.advances.value;
					}
			}
		} 
    return  target.status.fate.value + advLuck
}

/* ==========
 * MACRO: Reset Fortune
 * VERSION: 0.8.0
 * UPDATED: 2021-11-12
 * DESCRIPTION: Restores Fortune to the Fate level of player character(s). Applies any Luck talent bonus.
 * TIP: Characters must have a player assigned. 
 ========== */