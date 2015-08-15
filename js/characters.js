
Characters = {};

Characters.init = function() {
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

Characters.refresh = function() {
	var names = [];
	for ( var name in Database.Characters) {
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
};

Characters.createCharacter = function() {
	var characterNameInput = document.getElementById("characterNameInput");
	var name = characterNameInput.value.trim();

	if (name == "") {
		alert("Имя персонажа не указано");
		return;
	}

	if (Database.Characters[name]) {
		alert("Такой персонаж уже существует");
		return;
	}

	DBMS.createCharacter(name);
	Characters.refresh();
};

Characters.renameCharacter = function() {
	var fromName = document.getElementById("fromName").value.trim();
	var toName = document.getElementById("toName").value.trim();

	if (toName == "") {
		alert("Новое имя не указано.");
		return;
	}

	if (fromName == toName) {
		alert("Имена совпадают.");
		return;
	}

	if (Database.Characters[toName]) {
		alert("Имя " + toName + " уже используется.");
		return;
	}

	DBMS.renameCharacter(fromName, toName);

	Characters.refresh();
};

Characters.removeCharacter = function() {
	var name = document.getElementById("characterRemoveSelector").value.trim();

	if (confirm("Вы уверены, что хотите удалить " + name
			+ "? Все данные связанные с персонажем будут удалены безвозвратно.")) {
		DBMS.removeCharacter(name);
		Characters.refresh();
	}
};

Characters.showBioDelegate = function(event) {
	var name = event.target.value.trim();
	Characters.showBio(name);
};

Characters.showBio = function(name) {
	var editor = document.getElementById("bioEditor");
	editor.name = name;
	editor.value = Database.Characters[name].bio;
};

Characters.updateBio = function(event) {
	var name = event.target.name;
	if (name) {
		if (!Database.Characters[name]) {
			alert("Такого персонажа нет в базе");
			return;
		}
		Database.Characters[name].bio = event.target.value;
	}
};
