Briefings = {};

Briefings.init = function(){
	var button = document.getElementById("makeBriefings");
	button.addEventListener("click", Briefings.makeBriefings);

	var button = document.getElementById("briefingCharacter");
	button.addEventListener("change", Briefings.buildContentDelegate);
	
	Briefings.content = document.getElementById("briefingsDiv");
};

Briefings.refresh = function(){
	var selector = document.getElementById("briefingCharacter");
	removeChildren(selector);
	var names = DBMS.getCharacterNamesArray();
	
	for (var i = 0; i < names.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(names[i]));
		selector.appendChild(option);
	}
	
	Briefings.buildContent(names[0]);
	
};

Briefings.buildContentDelegate = function(event){
	Briefings.buildContent(event.target.value);
};

Briefings.buildContent = function(characterName){
	var content = document.getElementById("briefingContent");
	removeChildren(content);
	
	content.appendChild(document.createTextNode("Персонаж: " + characterName));
	content.appendChild(document.createElement("br"));
	content.appendChild(document.createElement("br"));
	
	content.appendChild(document.createTextNode("Биография"));
	content.appendChild(document.createElement("br"));

	content.appendChild(document.createTextNode(Database.Characters[characterName].bio));
	content.appendChild(document.createElement("br"));
	content.appendChild(document.createElement("br"));

	content.appendChild(document.createTextNode("Инвентарь"));
	content.appendChild(document.createElement("br"));
	
	for(var storyName in Database.Stories){
		var story = Database.Stories[storyName];
		if(story.characters[characterName] && story.characters[characterName].inventory && 
				story.characters[characterName].inventory != ""){
			content.appendChild(document.createTextNode(storyName + ":" + story.characters[characterName].inventory));
			content.appendChild(document.createElement("br"));
		}
	}
//	content.appendChild(document.createTextNode(Database.Characters[characterName].bio));
	content.appendChild(document.createElement("br"));
	content.appendChild(document.createElement("br"));
	
	
	content.appendChild(document.createTextNode("События"));
	content.appendChild(document.createElement("br"));
	
	for(var storyName in Database.Stories){
		if(!Database.Stories[storyName].characters[characterName]){
			continue;
		} else {
			content.appendChild(document.createTextNode(storyName));
			content.appendChild(document.createElement("br"));
		}
		var events = Database.Stories[storyName].events;
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			if(event.characters[characterName]){
				content.appendChild(document.createTextNode(event.name));
				content.appendChild(document.createElement("br"));
				
				if(event.characters[characterName].text == ""){
					content.appendChild(document.createTextNode(event.text));
				} else {
					content.appendChild(document.createTextNode(event.characters[characterName].text));
					
				}
				content.appendChild(document.createElement("br"));
				content.appendChild(document.createElement("br"));
			}
		}
	
		if(story.characters[characterName] && story.characters[characterName].inventory && 
				story.characters[characterName].inventory != ""){
			content.appendChild(document.createTextNode(storyName + ":" + story.characters[characterName].inventory));
			content.appendChild(document.createElement("br"));
		}
	}
	
};



Briefings.makeBriefings = function(){
	
	var characterList = {};
	
	for(var charName in Database.Characters){
		characterList[charName] = "";
	}
	
	for(var charName in Database.Characters){
		characterList[charName] += "----------------------------------\n";
		characterList[charName] += "Биография\n";
		characterList[charName] += Database.Characters[charName].bio + "\n";
		characterList[charName] += "----------------------------------\n\n";
		
		characterList[charName] += "----------------------------------\n";
		characterList[charName] += "Инвентарь\n";
		
		for(var storyName in Database.Stories){
			var story = Database.Stories[storyName];
			if(story.characters[charName] && story.characters[charName].inventory && 
					story.characters[charName].inventory != ""){
				
				characterList[charName] += story.characters[charName].inventory + ", ";
			}
		}
		characterList[charName] += "\n";
		
		characterList[charName] += "----------------------------------\n\n";
		
		for(var storyName in Database.Stories){
			var story = Database.Stories[storyName];
			if(!story.characters[charName]){
				continue;
			}
			
			characterList[charName] += "----------------------------------\n";
			characterList[charName] += storyName + "\n\n";
			for(var i=0;i<story.events.length; ++i){
				var event = story.events[i];
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
	
};