StoryCharacters = {};

StoryCharacters.init = function(){
	var button = document.getElementById("storyCharactersAddButton");
	button.addEventListener("click", StoryCharacters.addCharacter);

	var button = document.getElementById("storyCharactersSwitchButton");
	button.addEventListener("click", StoryCharacters.switchCharacters);
	
	var button = document.getElementById("storyCharactersRemoveButton");
	button.addEventListener("click", StoryCharacters.removeCharacter);
	
	StoryCharacters.content = document.getElementById("storyCharactersDiv");
};

StoryCharacters.refresh = function(){
	var addSelector = document.getElementById("storyCharactersAddSelector");
	var removeSelector = document.getElementById("storyCharactersRemoveSelector");
	var fromSelector = document.getElementById("storyCharactersFromSelector");
	var toSelector = document.getElementById("storyCharactersToSelector");
	
	removeChildren(addSelector);
	removeChildren(removeSelector);
	removeChildren(fromSelector);
	removeChildren(toSelector);
	
	var addArray = [];
	var removeArray = [];
	
	var localCharacters = Stories.CurrentStory.characters;
	for ( var name in localCharacters) {
		removeArray.push(name);
	}
	
	for(var name in Database.Characters){
		if(!localCharacters[name]){
			addArray.push(name);
		}
	}
	
	addArray.sort(charOrdA);
	removeArray.sort(charOrdA);
	
	for (var i = 0; i < addArray.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(addArray[i]));
		addSelector.appendChild(option);
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(addArray[i]));
		toSelector.appendChild(option);
	}
	for (var i = 0; i < removeArray.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(removeArray[i]));
		removeSelector.appendChild(option);
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(removeArray[i]));
		fromSelector.appendChild(option);
	}
	
	var table = document.getElementById("storyCharactersTable");
	removeChildren(table);
	
	StoryCharacters.appendCharacterHeader(table);

//	for (var i = 0; i < Stories.CurrentStory.characters.length; ++i) {
//		StoryCharacters.appendCharacterInput(table, Stories.CurrentStory.characters[i], i + 1);
//	}
//	for ( var name in Stories.CurrentStory.characters) {
	for (var i = 0; i < removeArray.length; ++i) {
		StoryCharacters.appendCharacterInput(table, Stories.CurrentStory.characters[removeArray[i]]);
	}
	
};

StoryCharacters.addCharacter = function() {
	var characterName = document.getElementById("storyCharactersAddSelector").value.trim();
	
	Stories.CurrentStory.characters[characterName] = {
			name:characterName,
			inventory:""
	};

	StoryCharacters.refresh();
};

StoryCharacters.switchCharacters = function() {
	var fromName = document.getElementById("storyCharactersFromSelector").value.trim();
	var toName = document.getElementById("storyCharactersToSelector").value.trim();
	
	Stories.CurrentStory.characters[toName] = Stories.CurrentStory.characters[fromName];
	Stories.CurrentStory.characters[toName].name = toName;
	delete Stories.CurrentStory.characters[fromName];
	for (var i = 0; i < Stories.CurrentStory.events.length; ++i) {
		var event = Stories.CurrentStory.events[i];
		if(event.characters[fromName]){
			event.characters[fromName].name = toName;
			event.characters[toName] = event.characters[fromName]; 
			delete event.characters[fromName];
		}
	}
	
	StoryCharacters.refresh();
};

StoryCharacters.removeCharacter = function(){
	var characterName = document.getElementById("storyCharactersRemoveSelector").value.trim();
	
	if (confirm("Вы уверены, что хотите удалить персонажа " + name + " из истории? Все данные связанные с персонажем будут удалены безвозвратно.")) {
		delete Stories.CurrentStory.characters[characterName];
		for (var i = 0; i < Stories.CurrentStory.events.length; ++i) {
			var event = Stories.CurrentStory.events[i];
			delete event.characters[characterName];
		}
		
		StoryCharacters.refresh();
	}
};


StoryCharacters.appendCharacterHeader = function(table) {
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var td = document.createElement("th");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("Имя"));	
	var td = document.createElement("th");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("Инвентарь"));
};

StoryCharacters.appendCharacterInput = function(table, character, index) {
	var tr = document.createElement("tr");
		var td = document.createElement("td");
			td.appendChild(document.createTextNode(character.name));
		tr.appendChild(td);
		
		var td = document.createElement("td");
			var input = document.createElement("input");
				input.value = character.inventory;
				input.characterInfo = character;
				input.className = "inventoryInput";
				input.addEventListener("change", StoryCharacters.updateCharacterInventory);
			td.appendChild(input);
		tr.appendChild(td);
	table.appendChild(tr);
};

StoryCharacters.updateCharacterInventory = function(event){
	event.target.characterInfo.inventory = event.target.value;
	var inventoryCheck = document.getElementById("inventoryCheck");
	removeChildren(inventoryCheck);
	var arr = event.target.characterInfo.inventory.split(",");
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i].trim();
	}
	inventoryCheck.appendChild(document.createTextNode(JSON.stringify(arr)));
};