Briefings = {};

Briefings.init = function(){
	var button = document.getElementById("makeBriefings");
	button.addEventListener("click", Briefings.makeTextBriefings);

	var button = document.getElementById("docxBriefings");
	button.addEventListener("change", Briefings.readTemplateFile);
	
	var button = document.getElementById("briefingCharacter");
	button.addEventListener("change", Briefings.buildContentDelegate);

	var button = document.getElementById("eventGroupingByStoryRadio");
	button.addEventListener("change", Briefings.refresh);
	
	var button = document.getElementById("eventGroupingByTimeRadio");
	button.addEventListener("change", Briefings.refresh);
	
	document.getElementById("eventGroupingByStoryRadio").checked = true;
	
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
	
//	content.appendChild(document.createTextNode("Биография"));
//	content.appendChild(document.createElement("br"));
//
////	content.appendChild(document.createTextNode(Database.Characters[characterName].bio));
//		var bioInput = document.createElement("textarea");
//		bioInput.value = Database.Characters[characterName].bio;
//		bioInput.className = "bioInput";
//		bioInput.bioObject = Database.Characters[characterName];
//		bioInput.addEventListener("change", Briefings.updateBio);
////	Database.Characters[name].bio = event.target.value;
//	content.appendChild(bioInput);
	var character = Database.Characters[characterName];
	
	Database.ProfileSettings.forEach(function(element){
		content.appendChild(document.createTextNode(element.name + ": "));
		switch(element.type){
		case "text":
			content.appendChild(document.createElement("br"));
			content.appendChild(document.createTextNode(character[element.name]));
			content.appendChild(document.createElement("br"));
			break;
		case "enum":
		case "number":
			content.appendChild(document.createTextNode(character[element.name]));
			content.appendChild(document.createElement("br"));
			break;
		case "checkbox":
			content.appendChild(document.createTextNode(character[element.name] ? "Да" : "Нет"));
			content.appendChild(document.createElement("br"));
			break;
		}
	});
	
	
	content.appendChild(document.createElement("br"));
	content.appendChild(document.createElement("br"));

	content.appendChild(document.createTextNode("Инвентарь"));
	content.appendChild(document.createElement("br"));
	
	for(var storyName in Database.Stories){
		var story = Database.Stories[storyName];
		if(story.characters[characterName] && story.characters[characterName].inventory && 
				story.characters[characterName].inventory != ""){
//			content.appendChild(document.createTextNode(storyName + ":" + story.characters[characterName].inventory));
			content.appendChild(document.createTextNode(storyName + ":"));
			var input = document.createElement("input");
			input.value = story.characters[characterName].inventory;
			input.characterInfo = story.characters[characterName];
			input.className = "inventoryInput";
			input.addEventListener("change", Briefings.updateCharacterInventory);
			content.appendChild(input);
			
			content.appendChild(document.createElement("br"));
		}
	}
	content.appendChild(document.createElement("br"));
	content.appendChild(document.createElement("br"));
	
	
	content.appendChild(document.createTextNode("События"));
	content.appendChild(document.createElement("br"));
	
	var groupingByStory = document.getElementById("eventGroupingByStoryRadio").checked;
	if(groupingByStory){
		Briefings.showEventsByStory(content, characterName);
	} else {
		Briefings.showEventsByTime(content, characterName);
	}

	
};

Briefings.showEventsByTime = function(content, characterName){
	var allStories = [];
	for(var storyName in Database.Stories){
		if(!Database.Stories[storyName].characters[characterName]){
			continue;
		}
		
		var events = Database.Stories[storyName].events;
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			if(event.characters[characterName]){
				allStories.push(event);
			}
		}
	}
	
	allStories.sort(eventsByTime);
	
	for (var i = 0; i < allStories.length; i++) {
		var event = allStories[i];
		var type;
		if(event.characters[characterName].text == ""){
			type = "История";
		} else {
			type = "Персонаж";
		}
		
		content.appendChild(document.createTextNode(event.time + " " + event.name + ": " + type));
		content.appendChild(document.createElement("br"));
		
		var input = document.createElement("textarea");
		input.className = "eventPersonalStory";
		
		if(event.characters[characterName].text == ""){
			input.value = event.text;
			input.eventInfo = event;
		} else {
			input.value = event.characters[characterName].text;
			input.eventInfo = event.characters[characterName];
		}
		
		input.addEventListener("change", Briefings.onChangePersonalStory);
		content.appendChild(input);
		
		content.appendChild(document.createElement("br"));
		content.appendChild(document.createElement("br"));
		
	}
	
	
};

Briefings.showEventsByStory = function(content, characterName){
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
				var type;
				if(event.characters[characterName].text == ""){
					type = "История";
				} else {
					type = "Персонаж";
				}
				
				content.appendChild(document.createTextNode(event.time + " " + event.name + ": " + type));
				content.appendChild(document.createElement("br"));
				
					var input = document.createElement("textarea");
					input.className = "eventPersonalStory";
					
					if(event.characters[characterName].text == ""){
						input.value = event.text;
						input.eventInfo = event;
	//					content.appendChild(document.createTextNode(event.text));
					} else {
						input.value = event.characters[characterName].text;
						input.eventInfo = event.characters[characterName];
	//					content.appendChild(document.createTextNode(event.characters[characterName].text));
					}
					
					input.addEventListener("change", Briefings.onChangePersonalStory);
				content.appendChild(input);
				
				content.appendChild(document.createElement("br"));
				content.appendChild(document.createElement("br"));
			}
		}
	
	}
};

//Briefings.updateBio = function(event){
//	event.target.bioObject.bio = event.target.value;
//};

Briefings.updateCharacterInventory = function(event){
	event.target.characterInfo.inventory = event.target.value;
};

Briefings.onChangePersonalStory = function(event){
	var eventObject = event.target.eventInfo;
	var text = event.target.value;
	eventObject.text = text;
};

Briefings.makeTextBriefings = function(){
	
	var data = Briefings.getBriefingData();
	
	var characterList = {};
	
	for (var i = 0; i < data.briefings.length; i++) {
		var briefingData = data.briefings[i];
		
		var briefing = "";
		
		briefing += briefingData.name + "\n\n";
		
		var regex = new RegExp('^profileInfo');
		
		Object.keys(briefingData).filter(function(element){
			return regex.test(element);
		}).forEach(function(element){
			briefing += "----------------------------------\n";
			briefing += element.substring("profileInfo.".length, element.length) + "\n";
			briefing += briefingData[element] + "\n";
			briefing += "----------------------------------\n\n";
		});
		
//		briefing += "----------------------------------\n";
//		briefing += "Биография\n";
//		briefing += briefingData.bio + "\n";
//		briefing += "----------------------------------\n\n";
		
		briefing += "----------------------------------\n";
		briefing += "Инвентарь\n";
		briefing += briefingData.inventory + "\n";
		briefing += "----------------------------------\n\n";
		
		if(briefingData.storiesInfo){
			for (var j = 0; j < briefingData.storiesInfo.length; j++) {
				var storyInfo = briefingData.storiesInfo[j];
				briefing += "----------------------------------\n";
				briefing += storyInfo.name + "\n\n";
				
				for (var k = 0; k < storyInfo.eventsInfo.length; k++) {
					var event = storyInfo.eventsInfo[k];
					briefing += event.time + ": " + event.text + "\n\n";
				}
				
				briefing += "----------------------------------\n\n";
			}
		}
		
		if(briefingData.eventsInfo){
			briefing += "----------------------------------\n";
			
			for (var k = 0; k < briefingData.eventsInfo.length; k++) {
				var event = briefingData.eventsInfo[k];
				briefing += event.time + ": " + event.text + "\n\n";
			}
			
			briefing += "----------------------------------\n\n";
		}
		
		characterList[briefingData.name] = briefing;
	}
	
	var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;
	
	if(toSeparateFiles){
		for(var charName in characterList){
			var blob = new Blob([characterList[charName]], {type: "text/plain;charset=utf-8"});
			saveAs(blob, charName + ".txt");
		}
	} else {
		var result = "";
		for(var charName in characterList){
			result += characterList[charName];
		}
		var blob = new Blob([result], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "briefings.txt");
	}
	
};

Briefings.getBriefingData = function(){
	var data = {};
	
	var charArray = [];
	
	for(var charName in Database.Characters){
		var inventory = "";
		for(var storyName in Database.Stories){
			var story = Database.Stories[storyName];
			if(story.characters[charName] && story.characters[charName].inventory && 
					story.characters[charName].inventory != ""){
				inventory += story.characters[charName].inventory + ", ";
			}
		}
		
		var groupingByStory = document.getElementById("eventGroupingByStoryRadio").checked;
		var profileInfo = Briefings.getProfileInfo(charName);
		
		if(groupingByStory){
			var storiesInfo = Briefings.getStoriesInfo(charName);
		} else {
			var eventsInfo = Briefings.getEventsInfo(charName);
		}
		var dataObject = {
			"name":charName,
			"inventory":inventory,
			"storiesInfo":storiesInfo,
			"eventsInfo":eventsInfo
		};
		
		Object.keys(profileInfo).forEach(function(element){
			dataObject["profileInfo." + element] = profileInfo[element];
		});
		
		charArray.push(dataObject);
	}
	
	data["briefings"] = charArray;
	return data;
};

Briefings.getProfileInfo = function(charName) {
	var character = Database.Characters[charName];
	var profileInfo = {};
	
	Database.ProfileSettings.forEach(function(element){
		switch(element.type){
		case "text":
		case "enum":
		case "number":
			profileInfo[element.name] = character[element.name];
			break;
		case "checkbox":
			profileInfo[element.name] = character[element.name] ? "Да" : "Нет";
			break;
		}
	});
	return profileInfo;
};

Briefings.getEventsInfo = function(charName) {
	var eventsInfo = [];
	for(var storyName in Database.Stories){
		var storyInfo = {};
		
		var story = Database.Stories[storyName];
		if(!story.characters[charName]){
			continue;
		}
		
		storyInfo.name = storyName;
		
		for(var i=0;i<story.events.length; ++i){
			var event = story.events[i];
			var eventInfo = {};
			if(event.characters[charName]){
				if(event.characters[charName].text != ""){
					eventInfo.text = event.characters[charName].text;
				} else {
					eventInfo.text = event.text;
				}
				eventInfo.time = event.time;
				eventsInfo.push(eventInfo);
			}
		}
	}
	eventsInfo.sort(eventsByTime);
	
	return eventsInfo;
};


Briefings.getStoriesInfo = function(charName) {
	var storiesInfo = [];
	for(var storyName in Database.Stories){
		var storyInfo = {};
		
		var story = Database.Stories[storyName];
		if(!story.characters[charName]){
			continue;
		}
		
		storyInfo.name = storyName;
		var eventsInfo = [];
		
		for(var i=0;i<story.events.length; ++i){
			var event = story.events[i];
			var eventInfo = {};
			if(event.characters[charName]){
				if(event.characters[charName].text != ""){
					eventInfo.text = event.characters[charName].text;
				} else {
					eventInfo.text = event.text;
				}
				eventInfo.time = event.time;
				eventsInfo.push(eventInfo);
			}
		}
		storyInfo.eventsInfo = eventsInfo;
		
		storiesInfo.push(storyInfo);
	}
	return storiesInfo;
};

Briefings.readTemplateFile = function(evt) {
	// Retrieve the first (and only!) File from the FileList object
	var f = evt.target.files[0];

	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			Briefings.generateDocxBriefings(contents);
		}
		r.readAsBinaryString(f);
	} else {
		alert("Failed to load file");
	}
};

Briefings.generateDocxBriefings = function(contents){
	
	var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;
	
	var briefingData=Briefings.getBriefingData();
	if(toSeparateFiles){
		var zip = new JSZip();
		content = zip.generate();
		
		for (var i = 0; i < briefingData.briefings.length; i++) {
			var doc = new window.Docxgen(contents);
			var briefing = briefingData.briefings[i];
			var tmpData = {
				briefings : [ briefing ]
			};
			doc.setData(tmpData);
			doc.render() //apply them (replace all occurences of {first_name} by Hipp, ...)
			out = doc.getZip().generate({
				type : "Uint8Array"
			});
			zip.file(briefing.name + ".docx", out);
		}
		saveAs(zip.generate({type : "blob"}), "briefings.zip");
	} else {
		var doc = new window.Docxgen(contents);
		doc.setData(briefingData);
		doc.render() //apply them (replace all occurences of {first_name} by Hipp, ...)
		out = doc.getZip().generate({
			type : "blob"
		});
		saveAs(out, "briefings.docx");
	}
};