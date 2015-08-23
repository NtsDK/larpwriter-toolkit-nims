// Профиль игрока уже содержит поле name. 
// У меня был выбор: 
// 1. убрать это поле в принципе, 
// 2. добавить уровень вложенности для данных профиля,
// 3. запретить называть так поля профиля.
// 1 уже используется в ряде мест
// 2 - на мой взгляд усложнит формат данных
// 3 просто и без усложнений, выбран 3 вариант

CharacterProfileConfigurer = {};

CharacterProfileConfigurer.mapping = {
	"text" : {
		displayName : "Текст",
		value : ""
	},
	"enum" : {
		displayName : "Перечисление",
		value : "_"
	},
	"number" : {
		displayName : "Число",
		value : 0
	},
	"checkbox" : {
		displayName : "Галочка",
		value : false
	}
};

CharacterProfileConfigurer.init = function(){
	var selector = document.getElementById("profileItemTypeSelector");
	removeChildren(selector);
	CharacterProfileConfigurer.fillSelector(selector);
	
	var button = document.getElementById("createProfileItemButton");
	button.addEventListener("click", CharacterProfileConfigurer.createProfileItem);

	var button = document.getElementById("swapProfileFieldsButton");
	button.addEventListener("click", CharacterProfileConfigurer.swapProfileItems);

	var button = document.getElementById("removeProfileItemButton");
	button.addEventListener("click", CharacterProfileConfigurer.removeProfileItem);
	
	CharacterProfileConfigurer.content = document.getElementById("characterProfileConfigurer");
};

CharacterProfileConfigurer.refresh = function(){
	var positionSelector = document.getElementById("profileItemPositionSelector");
	removeChildren(positionSelector);
	
	for (var i = 0; i < Database.ProfileSettings.length; i++) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode("Перед " + (i+1)));
		positionSelector.appendChild(option);
	}
	
	var option = document.createElement("option");
	option.appendChild(document.createTextNode("В конец"));
	positionSelector.appendChild(option);
	
	positionSelector.selectedIndex = Database.ProfileSettings.length;


	var table = document.getElementById("profileConfigBlock");
	removeChildren(table);

	CharacterProfileConfigurer.appendHeader(table);

	for (var i = 0; i < Database.ProfileSettings.length; ++i) {
		CharacterProfileConfigurer.appendInput(table, Database.ProfileSettings[i], i + 1);
	}
	
	var selectorArr = [];

	selectorArr.push(document.getElementById("firstProfileField"));
	selectorArr.push(document.getElementById("secondProfileField"));
	selectorArr.push(document.getElementById("removeProfileItemSelector"));
	
	for (var i = 0; i < selectorArr.length; i++) {
		removeChildren(selectorArr[i]);
	}
	
	for (var i = 0; i < Database.ProfileSettings.length; i++) {
		for (var j = 0; j < selectorArr.length; j++) {
			var option = document.createElement("option");
			option.appendChild(document.createTextNode((i+1)));
			selectorArr[j].appendChild(option);
		}
	}
};

CharacterProfileConfigurer.createProfileItem = function(){
	var name = document.getElementById("profileItemNameInput").value.trim();
	
	if(!CharacterProfileConfigurer.validateProfileItemName(name)){
		return;
	}
	
	var type = document.getElementById("profileItemTypeSelector").value.trim();
	
	if(!CharacterProfileConfigurer.mapping[type]){
		alert("Неизвестный тип поля: " + type);
		return;
	}
	
	var profileItem = {
		name: name,
		type: type,
		value: CharacterProfileConfigurer.mapping[type].value
	};
	
	for(var characterName in Database.Characters){
		Database.Characters[characterName][name] = CharacterProfileConfigurer.mapping[type].value;
	}
	
	var positionSelector = document.getElementById("profileItemPositionSelector");
	
	var position = positionSelector.value;
	if(position == "В конец"){
		Database.ProfileSettings.push(profileItem);
	} else {
		Database.ProfileSettings.splice(positionSelector.selectedIndex, 0, profileItem);
	}
	
	CharacterProfileConfigurer.refresh();
};

CharacterProfileConfigurer.swapProfileItems = function() {
	var index1 = document.getElementById("firstProfileField").selectedIndex;
	var index2 = document.getElementById("secondProfileField").selectedIndex;
	if(index1 == index2){
		alert("Позиции совпадают");
		return;
	}
	
	var tmp = Database.ProfileSettings[index1];
	Database.ProfileSettings[index1] = Database.ProfileSettings[index2];
	Database.ProfileSettings[index2] = tmp;
	
	CharacterProfileConfigurer.refresh();
};

CharacterProfileConfigurer.removeProfileItem = function() {
	var index = document.getElementById("removeProfileItemSelector").selectedIndex;
	
	if (confirm("Вы уверены, что хотите удалить поле профиля " + Database.ProfileSettings[index].name + "? Все данные связанные с этим полем будут удалены безвозвратно.")) {
		var name = Database.ProfileSettings[index].name;
		for(var characterName in Database.Characters){
			delete Database.Characters[characterName][name];
		}
		Database.ProfileSettings.remove(index);
		CharacterProfileConfigurer.refresh();
	}
};

CharacterProfileConfigurer.appendHeader = function(table) {
	var tr = document.createElement("tr");
	
		var td = document.createElement("th");
			td.appendChild(document.createTextNode("№"));	
		tr.appendChild(td);
		
		var td = document.createElement("th");
			td.appendChild(document.createTextNode("Название поля"));
		tr.appendChild(td);
	
		var td = document.createElement("th");
			td.appendChild(document.createTextNode("Тип"));
		tr.appendChild(td);

		var td = document.createElement("th");
			td.appendChild(document.createTextNode("Значения"));
		tr.appendChild(td);
	table.appendChild(tr);
};

CharacterProfileConfigurer.fillSelector = function(selector){
	for (var name in CharacterProfileConfigurer.mapping) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(CharacterProfileConfigurer.mapping[name].displayName));
		option.value = name;
		selector.appendChild(option);
	}
};



CharacterProfileConfigurer.appendInput = function(table, profileSettings, index) {
	var tr = document.createElement("tr");
	
		var td = document.createElement("td");
			var span=document.createElement("span");
			span.appendChild(document.createTextNode(index));
			td.appendChild(span);
		tr.appendChild(td);
		
		var td = document.createElement("td");
			var input = document.createElement("input");
			input.value = profileSettings.name;
			input.info = profileSettings;
			input.addEventListener("change", CharacterProfileConfigurer.renameProfileItem);
			td.appendChild(input);
		tr.appendChild(td);
		
		var td = document.createElement("td");
			var selector = document.createElement("select");
			CharacterProfileConfigurer.fillSelector(selector);
			selector.value = profileSettings.type;
			selector.info = profileSettings;
			td.appendChild(selector);
			selector.addEventListener("change", CharacterProfileConfigurer.changeProfileItemType);
		tr.appendChild(td);
		
		var td = document.createElement("td");
			var input = document.createElement("input");
			input.info = profileSettings;
			switch (profileSettings.type) {
			case "text":
			case "enum":
				input.value = profileSettings.value;
				break;
			case "number":
				input.type = "number";
				input.value = profileSettings.value;
				break;
			case "checkbox":
				input.type = "checkbox";
				input.checked = profileSettings.value;
				break;
			}
			
			input.addEventListener("change", CharacterProfileConfigurer.updateDefaultValue);
			td.appendChild(input);
		tr.appendChild(td);
	table.appendChild(tr);
};

CharacterProfileConfigurer.updateDefaultValue = function(event){
	var type = event.target.info.type;
	
	switch (type) {
	case "text":
		event.target.info.value = event.target.value;
		break;
	case "enum":
		if(event.target.value == ""){
			alert("Значение перечислимого поля не может быть пустым");
			event.target.value = event.target.info.value;
			return;
		}
//		var oldOptions = event.target.info.value == "" ? [] : event.target.info.value.split(",");
//		var newOptions = event.target.value == "" ? [] : event.target.value.split(",");
		var oldOptions = event.target.info.value.split(",");
		var newOptions = event.target.value.split(",");
		
		var newOptionsMap = [{}].concat(newOptions).reduce(function(a,b){
			a[b]=true;
			return a;
		});
		
		var missedValues = [];
		for (var i = 0; i < oldOptions.length; i++) {
			var oldOption = oldOptions[i];
			if(!newOptionsMap[oldOption]){
				missedValues.push(oldOption);
			}
//			var valueStillHere = false; 
//			for (var j = 0; j < newOptions.length; j++) {
//				var newOption = newOptions[j];
//				if(oldOption == newOption){
//					valueStillHere = true;
//					break;
//				}
//			}
//			if(!valueStillHere){
//				missedValues.push(oldOption);
//			}
		}
		
		if(missedValues.length != 0){
			if(confirm("Новое значение перечисления удаляет предыдущие значения: " + missedValues.join(",") + 
			". Это приведет к обновлению существующих профилей. Вы уверены?" )){
				event.target.info.value = event.target.value;
				var name = event.target.info.name;
				
				
				for(var characterName in Database.Characters){
					var enumValue = Database.Characters[characterName][name];
					if(!newOptionsMap[enumValue]){
						Database.Characters[characterName][name] = newOptions[0];
					}
				}
				
				return;
			} else {
				event.target.value = event.target.info.value;
				return;
			}
		} 
	
		event.target.info.value = event.target.value;
		break;
	case "number":
		if(isNaN(event.target.value)){
			alert("Введено не число");
			event.target.value = event.target.info.value;
			return;
		} else {
			event.target.info.value = new Number(event.target.value);
		}
		break;
	case "checkbox":
		event.target.info.value = event.target.checked;
		break;
	}
	
};

CharacterProfileConfigurer.renameProfileItem = function(event){
	var newName = event.target.value.trim();
	var oldName = event.target.info.name;
	
	if(!CharacterProfileConfigurer.validateProfileItemName(newName)){
		event.target.value = event.target.info.name;
		return;
	}
	
	for(var characterName in Database.Characters){
		var tmp = Database.Characters[characterName][oldName];
		delete Database.Characters[characterName][oldName];
		Database.Characters[characterName][newName] = tmp;
	}
	
	event.target.info.name = newName;
};

CharacterProfileConfigurer.validateProfileItemName = function(name){
	if(name == ""){
		alert("Название поля не указано");
		return false;
	}
	
	if(name == "name"){
		alert("Название поля не может быть name");
		return false;
	}
	
	for (var i = 0; i < Database.ProfileSettings.length; ++i) {
		if(name == Database.ProfileSettings[i].name){
			alert("Такое имя уже используется.");
			return false;
		}
	}
	return true;
};

CharacterProfileConfigurer.changeProfileItemType = function(event){
	if (confirm("Вы уверены, что хотите изменить тип поля профиля " + event.target.info.name + "? Все заполнение данного поле в досье будет потеряно.")) {
		event.target.info.type = event.target.value;
		event.target.info.value = CharacterProfileConfigurer.mapping[event.target.value].value;
		
		for(var characterName in Database.Characters){
			Database.Characters[characterName][event.target.info.name] = CharacterProfileConfigurer.mapping[event.target.value].value;
		}
	} else {
		event.target.value = event.target.info.type;
	}
	CharacterProfileConfigurer.refresh();
};