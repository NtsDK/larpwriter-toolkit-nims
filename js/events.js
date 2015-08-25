Events = {};

Events.init = function(){
	var selector = document.getElementById("personalStoriesCharacter");
	selector.addEventListener("change", Events.showPersonalStoriesDelegate);
	
	var selector = document.getElementById("finishedStoryCheckbox");
	selector.addEventListener("change", Events.refresh);
	
	Events.content = document.getElementById("eventsDiv");
};

Events.refresh = function(){
	var selector = document.getElementById("personalStoriesCharacter");
	removeChildren(selector);
	
	var showOnlyFinishedStory = document.getElementById("finishedStoryCheckbox").checked;
	
	var storyNames = DBMS.getStoryNamesArray();
	var isFirst = true;
	for (var i = 0; i < storyNames.length; i++) {
		var storyName = storyNames[i];
		var characterArray = DBMS.getStoryCharacterNamesArray(storyName);
		for (var j = 0; j < characterArray.length; j++) {
			var characterName = characterArray[j];
			var storyFinishedForCharacter=Events.isStoryFinishedForCharacter(storyName,characterName);
			if(showOnlyFinishedStory && storyFinishedForCharacter){
				continue;
			}

			if(isFirst){
				Events.showPersonalStories(storyName, characterName);
				isFirst = false;
			}
			var suffix = storyFinishedForCharacter ? "(завершено)" : "";
			var option = document.createElement("option");
			option.appendChild(document.createTextNode(storyName + ":" + characterName + " " + suffix));
			option.storyInfo = storyName;
			option.characterInfo = characterName;
			selector.appendChild(option);
		}
	}
};

Events.isStoryFinishedForCharacter = function(storyName,characterName){
	var story = Database.Stories[storyName];
	for (var i = 0; i < story.events.length; i++) {
		var event = story.events[i];
		if(event.characters[characterName] && !event.characters[characterName].ready){
			return false;
		}
	}
	return true;
	
};

Events.showPersonalStoriesDelegate = function(event){
	var option = event.target.selectedOptions[0];
	var storyName = option.storyInfo;
	var characterName = option.characterInfo;
	Events.showPersonalStories(storyName, characterName);
};

Events.showPersonalStories = function(storyName, characterName){
//	alert(event.target.value);

//	alert(option.extra);
	
	var table = document.getElementById("personalStories");
	removeChildren(table);
	
	var tr = document.createElement("tr");
	table.appendChild(tr);
	var headers = ["Оригинал", "Адаптация", "Описание завершено"];
	
	for (var i = 0; i < headers.length; i++) {
		var th = document.createElement("th");
		th.appendChild(document.createTextNode(headers[i]));
		tr.appendChild(th);
	}
	
	var events = Database.Stories[storyName].events;
	
	for (var i = 0; i < events.length; i++) {
		if(events[i].characters[characterName]){
//			if(showUnfinishedOnly){
//				if(events[i].characters[name].text !== ""){
//					continue;
//				}
//			}
			var tr = document.createElement("tr");
			table.appendChild(tr);
			
			var td = document.createElement("td");
				var span = document.createElement("div");
				span.appendChild(document.createTextNode(events[i].name));
//				span.className = "eventOriginalStory";
			td.appendChild(span);
				
				var input = document.createElement("textarea");
				input.className = "eventPersonalStory";
				input.value = events[i].text;
				input.eventInfo = events[i];
				
				input.addEventListener("change", Events.onChangePersonalStoryDelegate);
			td.appendChild(input);
			tr.appendChild(td);

			
			td = document.createElement("td");
				var span = document.createElement("div");
				span.appendChild(document.createTextNode("\u00A0"));
//			span.className = "eventOriginalStory";
			td.appendChild(span);
			
				var input = document.createElement("textarea");
				input.className = "eventPersonalStory";
				input.value = events[i].characters[characterName].text;
				input.eventInfo = events[i].characters[characterName];
				
				input.addEventListener("change", Events.onChangePersonalStoryDelegate);
			td.appendChild(input);
			tr.appendChild(td);
			
			td = document.createElement("td");
				var input = document.createElement("input");
				input.type = "checkbox";
				input.checked = events[i].characters[characterName].ready;
	////			input.className = "eventPersonalStory";
	//			input.value = events[i].text;
				input.eventInfo = events[i].characters[characterName];
				
				input.addEventListener("change", Events.onChangeReadyStatus);
			td.appendChild(input);
//			
			tr.appendChild(td);
		}
	}
};

Events.onChangeReadyStatus = function(event){
	var eventObject = event.target.eventInfo;
	var value = event.target.checked;
	eventObject.ready = value;
};

Events.onChangePersonalStoryDelegate = function(event){
	var eventObject = event.target.eventInfo;
	var text = event.target.value;
	Events.onChangePersonalStory(eventObject, text);
};

Events.onChangePersonalStory = function(eventObject, text){
	eventObject.text = text;
};