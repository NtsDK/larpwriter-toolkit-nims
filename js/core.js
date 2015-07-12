init = function(selectedStory){
	var selector = document.getElementById("storySelector");
	removeChildren(selector);
	
	for ( var name in Database) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(name));
		selector.appendChild(option);
	}
	
	var index = 0;
	if(selectedStory){
		for ( var name in Database) {
			if (name == selectedStory) {
				break;
			} else {
				index++;
			}
		}
	}
	
	selector.selectedIndex = index;

	
	selector.addEventListener("change", onStorySelectorChange);
	
	CurrentStory = Database[selector.value];
	var button = document.getElementById("createStoryButton");
	button.addEventListener("click", createStory);
	
	var button = document.getElementById("makeBriefings");
	button.addEventListener("click", makeBriefings);
	
	onLoad();
}

makeBriefings = function(){
	
	var characterList = {};
	
	for(var storyName in Database){
		for(var charName in Database[storyName].characters){
			if(!characterList[charName]){
				characterList[charName] = "";
			}
		}
	}
	
	for(var charName in characterList){
		for(var storyName in Database){
			if(Database[storyName].characters[charName]){
				characterList[charName] += "----------------------------------\n\n";
				characterList[charName] += storyName + "\n\n";
				for(var i=0;i<Database[storyName].events.length; ++i){
					var event = Database[storyName].events[i];
					if(event.characters[charName]){
						if(event.characters[charName].text != ""){
							characterList[charName] += event.characters[charName].text + "\n\n";
						} else {
							characterList[charName] += event.text + "\n\n";
						}
					}
				}
				characterList[charName] += "----------------------------------\n\n";
				
			}
		}
	}
	
	var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;
	
	if(toSeparateFiles){
		for(var charName in characterList){
			window.open("data:text/plain;charset=utf-8," + encodeURIComponent(charName + "\n\n" + characterList[charName]) );
		}
	} else {
		var result = "";
		for(var charName in characterList){
			result += charName + "\n\n";
			result += characterList[charName];
		}
		window.open("data:text/plain;charset=utf-8," + encodeURIComponent(result) );
	}
	
}

createStory = function(){
	var storyName = document.getElementById("createStoryName").value.trim();
	if(storyName == ""){
		alert("Название истории пусто.")
	}
	
	Database[storyName] = {
			story:"",
			characters:{},
			events:[]
	};
	
	init(storyName);
	
//	var selector = document.getElementById("storySelector");
	
//	var option = document.createElement("option");
//	option.appendChild(document.createTextNode(storyName));
//	selector.appendChild(option);
//	
//	selector.selectedIndex 
}

onStorySelectorChange = function(event){
	CurrentStory = Database[event.target.value];
	
	onLoad();
}

onLoad = function() {
	
	var storyArea = document.getElementById("masterStoryArea");
	storyArea.value = CurrentStory.story;

	var characterBlock = document.getElementById("characterBlock");

	removeChildren(characterBlock);

	// for(var i=0;i<Database.characters.length;++i){
	for ( var name in CurrentStory.characters) {
		// var name = Database.characters[i];
		appendCharacterInput(characterBlock, name);
	}

	var table = document.getElementById("eventBlock");
	removeChildren(table);

	appendEventHeader(table);

	for (var i = 0; i < CurrentStory.events.length; ++i) {
//		var eventText = Database.events[i].text;
		appendEventInput(table, CurrentStory.events[i], i + 1);
	}

	var button = document.getElementById("createCharacterButton");
	button.addEventListener("click", createCharacter);

	var button = document.getElementById("createEventButton");
	button.addEventListener("click", createEvent);

	basicFileUtilsInit();

	var button = document.getElementById("saveButton");
	button.addEventListener("click", saveAll);
	
	var selector = document.getElementById("personalStoriesCharacter");
	removeChildren(selector);
	
	for ( var name in CurrentStory.characters) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(name));
		selector.appendChild(option);
	}
	
	selector.addEventListener("change", updatePersonalStories);
	
	var checkbox = document.getElementById("showUnfinishedStoriesOnly");
	
	checkbox.addEventListener("change", updatePersonalStories);
	
	updatePersonalStories();
	
	var button = document.getElementById("renameCharacter");
	button.addEventListener("click", renameCharacter);
	
	updatePositionSelector();
	
	updateSwapSelector();
	
	var button = document.getElementById("swapEventsButton");
	button.addEventListener("click", swapEvents);
	
}

swapEvents = function(){
	var index1 = document.getElementById("firstEvent").selectedIndex;
	var index2 = document.getElementById("secondEvent").selectedIndex;
	if(index1 == index2){
		alert("Позиции событий совпадают");
		return;
	}
	
	var tmp = CurrentStory.events[index1];
	CurrentStory.events[index1] = CurrentStory.events[index2];
	CurrentStory.events[index2] = tmp;
	
	onLoad();
}

renameCharacter = function(){
	var fromName = document.getElementById("fromName").value.trim();
	var toName = document.getElementById("toName").value.trim();
	
	if(fromName == "" || toName == ""){
		alert("Одно из имен не указано.");
		return;
	}
	
	if(fromName ==  toName){
		alert("Имена совпадают.");
		return;
	}
	
	if(!CurrentStory.characters[fromName]){
		alert("Персонажа " + fromName + " не существует.");
		return;
	}
	
	CurrentStory.characters[toName] = true;
	delete CurrentStory.characters[fromName];
	
	var events = CurrentStory.events;
	
	for (var i = 0; i < events.length; i++) {
		if(events[i].characters[fromName]){
			events[i].characters[toName] = events[i].characters[fromName];
			delete events[i].characters[fromName];
		}
	}
	
	onLoad();
}

updatePersonalStories = function(){
	var table = document.getElementById("personalStories");
	removeChildren(table);
	
	var selector = document.getElementById("personalStoriesCharacter");
	var name = selector.value;
	
	var showUnfinishedOnly = document.getElementById("showUnfinishedStoriesOnly").checked;
	
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var headers = ["Оригинал", "Адаптация"];
	
	for (var i = 0; i < headers.length; i++) {
		var th = document.createElement("th");
		th.appendChild(document.createTextNode(headers[i]));
		tr.appendChild(th);
	}
	
	var events = CurrentStory.events;
	
	for (var i = 0; i < events.length; i++) {
		if(events[i].characters[name]){
			if(showUnfinishedOnly){
				if(events[i].characters[name].text != ""){
					continue;
				}
			}
			var tr = document.createElement("tr");
			table.appendChild(tr);
			
			var td = document.createElement("td");
			td.appendChild(document.createTextNode(events[i].text));
			tr.appendChild(td);
			
			td = document.createElement("td");
			var input = document.createElement("textarea");
			input.value = events[i].characters[name].text;
			
			input.addEventListener("change", personalStoryChangeDelegateCreator(events[i].characters[name]));
			td.appendChild(input);
			tr.appendChild(td);
		}
	}
}

personalStoryChangeDelegateCreator = function(story){
	return function(event){
		story.text = event.target.value;
	}
}

saveAll = function() {
	var storyArea = document.getElementById("masterStoryArea");
	CurrentStory.story = storyArea.value;

	CurrentStory.characters = {};

	var characterBlock = document.getElementById("characterBlock");

	var children = characterBlock.childNodes;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.value && child.value.trim() != "") {
			CurrentStory.characters[child.value.trim()] = true;
			// Database.characters.push(child.value.trim());
		}
	}

	var oldEvents = CurrentStory.events;
	CurrentStory.events = [];
	
	for (var i = 0; i < oldEvents.length; i++) {
		if(oldEvents[i].text.trim() != ""){
			CurrentStory.events.push(oldEvents[i]);
		}
	}

	onLoad();
}

function appendCharacterInput(characterBlock, name) {
	var input = document.createElement("input");
	input.value = name;
	characterBlock.appendChild(input);
	characterBlock.appendChild(document.createElement("br"));
}

createEvent = function() {
	var input = document.getElementById("eventInput");
	var eventText = input.value.trim();

	if (eventText == "") {
		alert("Событие пусто");
		return;
	}
	
	var event = {
		text : eventText,
		time : "",
		characters : {}
	}
	
	var positionSelector = document.getElementById("positionSelector");
	
	var position = positionSelector.value;
	if(position == "В конец"){
		CurrentStory.events.push(event);
	} else {
		CurrentStory.events.splice(positionSelector.selectedIndex, 0, event);
//		CurrentStory.events.push(event);
	}
//	removeChildren(positionSelector);

	
	onLoad();

//	var table = document.getElementById("eventBlock");
//	appendEventInput(table, event, CurrentStory.events.length);
	
//	updatePositionSelector();
}

updateSwapSelector = function(){
	var selector1 = document.getElementById("firstEvent");
	var selector2 = document.getElementById("secondEvent");
	
	removeChildren(selector1);
	removeChildren(selector2);
	
	for (var i = 0; i < CurrentStory.events.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode((i+1)));
		selector1.appendChild(option);
		var option = document.createElement("option");
		option.appendChild(document.createTextNode((i+1)));
		selector2.appendChild(option);
	}
}

updatePositionSelector = function(){
	var positionSelector = document.getElementById("positionSelector");
	removeChildren(positionSelector);
	
	for (var i = 0; i < CurrentStory.events.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode("Перед " + (i+1)));
		positionSelector.appendChild(option);
	}
	
	var option = document.createElement("option");
	option.appendChild(document.createTextNode("В конец"));
	positionSelector.appendChild(option);
	
	positionSelector.selectedIndex = CurrentStory.events.length;
	
}

createCharacter = function() {
	var characterNameInput = document.getElementById("characterNameInput");
	var name = characterNameInput.value.trim();
	
	if(name == ""){
		alert("Имя персонажа не указано");
		return;
	}

	// for(var i=0;i<Database.characters.length;++i){
	// if(Database.characters[i] == name){
	if (CurrentStory.characters[name]) {
		alert("Такой персонаж уже существует");
		return;
	}
	// }

	// Database.characters.push(name);
	CurrentStory.characters[name] = true;

	var input = document.getElementById("characterBlock");
	appendCharacterInput(input, name);
}

function appendEventInput(table, event, index) {
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var td = document.createElement("td");
	tr.appendChild(td);
	 var span=document.createElement("span");
	 span.appendChild(document.createTextNode(index));
	 td.appendChild(span);
	var td = document.createElement("td");
	tr.appendChild(td);
	var input = document.createElement("textarea");
	input.className = "eventText";
	input.value = event.text;
	input.eventInfo = event;
	input.addEventListener("change", updateEventText);
	td.appendChild(input);

	// for(var i=0;i<Database.characters.length;++i){
	for ( var name in CurrentStory.characters) {
		var td = document.createElement("td");
		tr.appendChild(td);
		var input = document.createElement("input");
		input.type = "checkbox";
		if(event.characters[name]){
			input.checked = true;
		}
		input.addEventListener("change", characterCheckboxDelegateCreator(name, event));
		td.appendChild(input);
	}
	var td = document.createElement("td");
	tr.appendChild(td);
	var input = document.createElement("input");
	input.value = event.time;
	input.className = "eventTime";
	
	input.eventInfo = event;
	
//	input.addEventListener("change", myAlert);
	input.addEventListener("change", updateTime);
	// input.type = "checkbox";
	td.appendChild(input);
}

characterCheckboxDelegateCreator = function(name, eventInfo){
	return function(event){
		if(event.target.checked){
			eventInfo.characters[name] = {text:""};
		} else {
			delete eventInfo.characters[name];
		}
	}
}

updateEventText = function(event){
	event.target.eventInfo.text = event.target.value;
}

updateTime = function(event){
	event.target.eventInfo.time = event.target.value;
}

myAlert = function(event){
	alert("myAlert");
}

function appendEventHeader(table) {
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var td = document.createElement("th");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("№"));	
	var td = document.createElement("th");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("Событие"));

	for ( var name in CurrentStory.characters) {
		var td = document.createElement("td");
		tr.appendChild(td);
		td.appendChild(document.createTextNode(name));
	}
	var td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode("Время"));
}