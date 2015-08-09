Events = {};

Events.init = function(){
	var selector = document.getElementById("personalStoriesCharacter");
	selector.addEventListener("change", Events.showPersonalStoriesDelegate);
	
	Events.content = document.getElementById("eventsDiv");
};

Events.refresh = function(){
	var selector = document.getElementById("personalStoriesCharacter");
	removeChildren(selector);
	
	var storyNames = DBMS.getStoryNamesArray();
	for (var i = 0; i < storyNames.length; i++) {
		var storyName = storyNames[i];
		var characterArray = DBMS.getCharacterNamesArray(storyName);
		for (var j = 0; j < characterArray.length; j++) {
			var characterName = characterArray[j];
			var option = document.createElement("option");
			if(i==0 && j==0){
				Events.showPersonalStories(storyName, characterName);
			}
			option.appendChild(document.createTextNode(storyName + ":" + characterName));
			option.storyInfo = storyName;
			option.characterInfo = characterName;
			selector.appendChild(option);
		}
	}
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
	var headers = ["Оригинал", "Адаптация"];
	
	for (var i = 0; i < headers.length; i++) {
		var th = document.createElement("th");
		th.appendChild(document.createTextNode(headers[i]));
		tr.appendChild(th);
	}
	
	var events = Database.Stories[storyName].events;
	
	for (var i = 0; i < events.length; i++) {
		if(events[i].characters[characterName]){
//			if(showUnfinishedOnly){
//				if(events[i].characters[name].text != ""){
//					continue;
//				}
//			}
			var tr = document.createElement("tr");
			table.appendChild(tr);
			
			var td = document.createElement("td");
			var span = document.createElement("div");
			span.appendChild(document.createTextNode(events[i].text));
			span.className = "eventOriginalStory";
			td.appendChild(span);
			tr.appendChild(td);
			
			td = document.createElement("td");
			var input = document.createElement("textarea");
			input.className = "eventPersonalStory";
			input.value = events[i].characters[characterName].text;
			input.eventInfo = events[i].characters[characterName];
			
			input.addEventListener("change", Events.onChangePersonalStoryDelegate);
			td.appendChild(input);
			tr.appendChild(td);
		}
	}
};

Events.onChangePersonalStoryDelegate = function(event){
	var eventObject = event.target.eventInfo;
	var text = event.target.value;
	Events.onChangePersonalStory(eventObject, text);
};

Events.onChangePersonalStory = function(eventObject, text){
	eventObject.text = text;
};


//updatePersonalStories = function(){
//	
//	
////	var table = document.getElementById("personalStories");
////	removeChildren(table);
////	
////	var selector = document.getElementById("personalStoriesCharacter");
////	var name = selector.value;
////	
////	var showUnfinishedOnly = document.getElementById("showUnfinishedStoriesOnly").checked;
//	
//	var tr = document.createElement("tr");
//	table.appendChild(tr);
//	var headers = ["Оригинал", "Адаптация"];
//	
//	for (var i = 0; i < headers.length; i++) {
//		var th = document.createElement("th");
//		th.appendChild(document.createTextNode(headers[i]));
//		tr.appendChild(th);
//	}
//	
//	var events = CurrentStory.events;
//	
//	for (var i = 0; i < events.length; i++) {
//		if(events[i].characters[name]){
//			if(showUnfinishedOnly){
//				if(events[i].characters[name].text != ""){
//					continue;
//				}
//			}
//			var tr = document.createElement("tr");
//			table.appendChild(tr);
//			
//			var td = document.createElement("td");
//			td.appendChild(document.createTextNode(events[i].text));
//			tr.appendChild(td);
//			
//			td = document.createElement("td");
//			var input = document.createElement("textarea");
//			input.value = events[i].characters[name].text;
//			
//			input.addEventListener("change", personalStoryChangeDelegateCreator(events[i].characters[name]));
//			td.appendChild(input);
//			tr.appendChild(td);
//		}
//	}
//}

//personalStoryChangeDelegateCreator = function(story){
//	return function(event){
//		story.text = event.target.value;
//	}
//}

