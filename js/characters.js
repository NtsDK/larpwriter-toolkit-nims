

Characters = {};

Characters.init = function(){
	var button = document.getElementById("createCharacterButton");
	button.addEventListener("click", Characters.createCharacter);
	
	var button = document.getElementById("renameCharacter");
	button.addEventListener("click", Characters.renameCharacter);

	var button = document.getElementById("removeCharacterButton");
	button.addEventListener("click", Characters.removeCharacter);

	var button = document.getElementById("bioEditorSelector");
	button.addEventListener("change", Characters.showBioDelegate);
	
	var button = document.getElementById("bioEditor");
	button.addEventListener("change", Characters.updateBio);
	
	Characters.content = document.getElementById("charactersDiv");
	
};



Characters.refresh = function(){
	var names = [];
	for(var name in Database.Characters){
		names.push(name);
	}
	names.sort(charOrdA);
	
	var selector = document.getElementById("fromName");
	removeChildren(selector);
	for (var i = 0; i < names.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(names[i]));
		selector.appendChild(option);
	}
	
	selector = document.getElementById("characterRemoveSelector");
	removeChildren(selector);
	for (var i = 0; i < names.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(names[i]));
		selector.appendChild(option);
	}
	
	selector = document.getElementById("bioEditorSelector");
	removeChildren(selector);
	for (var i = 0; i < names.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(names[i]));
		selector.appendChild(option);
	}
	
	var editor = document.getElementById("bioEditor");
	Characters.showBio(names[0]);
//	editor.name = null;
//	editor.value = "";
//	editor.name = null;
//	editor.value = "";
};

Characters.createCharacter = function() {
	var characterNameInput = document.getElementById("characterNameInput");
	var name = characterNameInput.value.trim();
	
	if(name == ""){
		alert("Имя персонажа не указано");
		return;
	}

	// for(var i=0;i<Database.characters.length;++i){
	// if(Database.characters[i] == name){
	if (Database.Characters[name]) {
		alert("Такой персонаж уже существует");
		return;
	}
	// }

	// Database.characters.push(name);
	Database.Characters[name] = {name: name, bio:""};
	Characters.refresh();

//	var input = document.getElementById("characterBlock");
//	appendCharacterInput(input, name);
};

Characters.renameCharacter = function(){
	var fromName = document.getElementById("fromName").value.trim();
	var toName = document.getElementById("toName").value.trim();
	
	if(toName == ""){
		alert("Новое имя не указано.");
		return;
	}
	
	if(fromName ==  toName){
		alert("Имена совпадают.");
		return;
	}
	
	if(Database.Characters[toName]){
		alert("Имя " + toName + " уже используется.");
		return;
	}

	//	if(!Database.Characters[fromName]){
//		alert("Персонажа " + fromName + " не существует.");
//		return;
//	}
	
	var data = Database.Characters[fromName];
	data.name = toName;
	Database.Characters[toName] = data;
	delete Database.Characters[fromName];
	Characters.refresh();
	
//	var events = CurrentStory.events;
//	
//	for (var i = 0; i < events.length; i++) {
//		if(events[i].characters[fromName]){
//			events[i].characters[toName] = events[i].characters[fromName];
//			delete events[i].characters[fromName];
//		}
//	}
//	
//	onLoad();
};

Characters.removeCharacter = function(){
	var name = document.getElementById("characterRemoveSelector").value.trim();
	
	if (confirm("Вы уверены, что хотите удалить " + name + "? Все данные связанные с персонажем будут удалены безвозвратно.")) {
		delete Database.Characters[name];
		Characters.refresh();
	}
};

Characters.showBioDelegate = function(event){
//	var name = document.getElementById("bioEditorSelector").value.trim();
	var name = event.target.value.trim();
	Characters.showBio(name);
//	var editor = document.getElementById("bioEditor");
//	editor.name = name;
//	editor.value = Database.Characters[name].bio;
};

Characters.showBio = function(name){
////	var name = document.getElementById("bioEditorSelector").value.trim();
//	var name = event.target.value.trim();
	var editor = document.getElementById("bioEditor");
	editor.name = name;
	editor.value = Database.Characters[name].bio;
};

Characters.updateBio = function(event){
	var name = event.target.name;
	if(name){
		if(!Database.Characters[name]){
			alert("Такого персонажа нет в базе");
			return;
		}
		Database.Characters[name].bio = event.target.value;
	}
};

