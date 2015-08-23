CharacterProfile = {};

CharacterProfile.init = function(){
	var button = document.getElementById("bioEditorSelector");
//	button.addEventListener("change", CharacterProfile.showBioDelegate);
	button.addEventListener("change", CharacterProfile.showProfileInfoDelegate);

//	var button = document.getElementById("bioEditor");
//	button.addEventListener("change", CharacterProfile.updateBio);
	
	CharacterProfile.content = document.getElementById("characterProfile");
};

CharacterProfile.refresh = function(){
	var names = [];
	for ( var name in Database.Characters) {
		names.push(name);
	}
	names.sort(charOrdA);
	
	selector = document.getElementById("bioEditorSelector");
	removeChildren(selector);
	for (var i = 0; i < names.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(names[i]));
		selector.appendChild(option);
	}
	
	var profileContentDiv = document.getElementById("profileContentDiv");
	removeChildren(profileContentDiv);
	profileContentDiv.inputItems = {};
	
	for (var i = 0; i < Database.ProfileSettings.length; ++i) {
		CharacterProfile.appendInput(profileContentDiv, Database.ProfileSettings[i]);
	}
	

//	var editor = document.getElementById("bioEditor");
	if(names.length > 0){
		CharacterProfile.showProfileInfo(names[0]);
		selector.value = names[0];
	}
};

CharacterProfile.appendInput = function(root, profileItemConfig){
	root.appendChild(document.createTextNode(profileItemConfig.name));
	
	switch (profileItemConfig.type) {
	case "text":
		var textarea = document.createElement("textarea");
		textarea.className = "profileTextInput";
		textarea.selfName = profileItemConfig.name;
		root.appendChild(document.createElement("br"));
		root.appendChild(textarea);
		root.inputItems[profileItemConfig.name] = textarea;
		
		textarea.addEventListener("change", function(event){
			var profileContentDiv = document.getElementById("profileContentDiv");
			profileContentDiv.profileInfo[event.target.selfName] = event.target.value;
		});
		
		break;
	case "enum":
		var selector = document.createElement("select");
		selector.selfName = profileItemConfig.name;
		
		var values = profileItemConfig.value.split(",");
		for (var i = 0; i < values.length; i++) {
			var option = document.createElement("option");
			option.appendChild(document.createTextNode(values[i]));
			selector.appendChild(option);
		}
		root.appendChild(selector);
		root.inputItems[profileItemConfig.name] = selector;
		
		selector.addEventListener("change", function(event){
			var profileContentDiv = document.getElementById("profileContentDiv");
			profileContentDiv.profileInfo[event.target.selfName] = event.target.value;
		});
		
		break;
	case "number":
		var input = document.createElement("input");
		input.selfName = profileItemConfig.name;
		input.type = "number";
		root.appendChild(input);
		root.inputItems[profileItemConfig.name] = input;
		
		input.addEventListener("change", function(event){
			var profileContentDiv = document.getElementById("profileContentDiv");
			if(isNaN(event.target.value)){
				alert("Введенное значение не является числом.");
				event.target.value = profileContentDiv.profileInfo[event.target.selfName];
				return;
			}
			
			profileContentDiv.profileInfo[event.target.selfName] = new Number(event.target.value);
		});
		
		break;
	case "checkbox":
		var input = document.createElement("input");
		input.selfName = profileItemConfig.name;
		input.type = "checkbox";
		root.appendChild(input);
		root.inputItems[profileItemConfig.name] = input;
		
		input.addEventListener("change", function(event){
			var profileContentDiv = document.getElementById("profileContentDiv");
			profileContentDiv.profileInfo[event.target.selfName] = event.target.checked;
		});
		
		break;
	}
	
	root.appendChild(document.createElement("br"));
};

CharacterProfile.showProfileInfoDelegate = function(event) {
	var name = event.target.value.trim();
	CharacterProfile.showProfileInfo(name);
};
//CharacterProfile.showBioDelegate = function(event) {
//	var name = event.target.value.trim();
//	CharacterProfile.showBio(name);
//};
//
CharacterProfile.showProfileInfo = function(name) {
	var profileContentDiv = document.getElementById("profileContentDiv");
	var profile = Database.Characters[name];
	profileContentDiv.profileInfo = profile;
	var inputNames = profileContentDiv.inputItems;
	
	for(var name in inputNames){
		if(inputNames[name].type == "checkbox"){
			inputNames[name].checked = profile[name];
		} else {
			inputNames[name].value = profile[name];
		}
	}
	
//	var editor = document.getElementById("bioEditor");
//	editor.name = name;
//	editor.value = Database.Characters[name].bio;
};
//CharacterProfile.showBio = function(name) {
//	var editor = document.getElementById("bioEditor");
//	editor.name = name;
//	editor.value = Database.Characters[name].bio;
//};
//
//CharacterProfile.updateBio = function(event) {
//	var name = event.target.name;
//	if (name) {
//		if (!Database.Characters[name]) {
//			alert("Такого персонажа нет в базе");
//			return;
//		}
//		Database.Characters[name].bio = event.target.value;
//	}
//};