CharacterFilter = {};

CharacterFilter.init = function(){
	
	CharacterFilter.content = document.getElementById("characterFilterDiv");
};

CharacterFilter.refresh = function(){
	CharacterFilter.sortKey = "name";
	CharacterFilter.sortDir = "asc";
	
	var filterSettingsDiv = document.getElementById("filterSettingsDiv");
	removeChildren(filterSettingsDiv);
	filterSettingsDiv.inputItems = {};
	
	filterSettingsDiv.appendChild(document.createTextNode("Персонаж"));
	filterSettingsDiv.appendChild(document.createElement("br"));
	
	var input = document.createElement("input");
	input.selfInfo = {
		name : "name",
		type : "text"
	};
	input.value = "";
	filterSettingsDiv.appendChild(input);
	filterSettingsDiv.inputItems["name"] = input;
	input.addEventListener("change",CharacterFilter.rebuildContent);
	
	filterSettingsDiv.appendChild(document.createElement("br"));
	
	for (var i = 0; i < Database.ProfileSettings.length; ++i) {
		CharacterFilter.appendInput(filterSettingsDiv, Database.ProfileSettings[i]);
	}
	
	CharacterFilter.rebuildContent();
	
};

CharacterFilter.rebuildContent = function() {
	var filterContent = document.getElementById("filterContent");
	removeChildren(filterContent);
//
//	var profileSettings = Database.ProfileSettings.filter(function(value) {
//		return value.type != "text";
//	});
	var profileSettings = Database.ProfileSettings.filter(function(value) {
		return true;
	});

	CharacterFilter.appendContentHeader(filterContent, profileSettings);

	profileSettings.unshift({
		name : "name",
		type : "text"
	});

	Object.keys(Database.Characters).filter(CharacterFilter.acceptDataRow)
			.sort(CharacterFilter.sortDataRows).forEach(
					function(name) {
						CharacterFilter.appendDataString(filterContent,
								Database.Characters[name], profileSettings);
					});
};

CharacterFilter.acceptDataRow = function(element){
	element = Database.Characters[element];
	var filterSettingsDiv = document.getElementById("filterSettingsDiv");
	var result = true;
	Object.keys(filterSettingsDiv.inputItems).forEach(function(inputItemName){
		if(inputItemName.endsWith(":numberInput")){
			return;
		}
		if(!result){
			return;
		}
		var inputItem = filterSettingsDiv.inputItems[inputItemName];
		switch(inputItem.selfInfo.type){
		case "enum":
			var selectedOptions = {}; 
				
			for (var i = 0; i < inputItem.options.length; i++) {
				if(inputItem.options[i].selected){
					selectedOptions[inputItem.options[i].value] = true;
				}
			}
			
			if(!selectedOptions[element[inputItem.selfInfo.name]]){
				result = false;
			}
			
			break;
		case "checkbox":
			var selectedOptions = {}; 
			
			if(inputItem.options[0].selected){
				selectedOptions[inputItem.options[0].value == "Да" ? "true" : "false"] = true;
			} 
			if(inputItem.options[1].selected){
				selectedOptions[inputItem.options[1].value == "Да" ? "true" : "false"] = true;
			} 
			
			if(!selectedOptions[element[inputItem.selfInfo.name]]){
				result = false;
			}
			
			break;
		case "number":
			var num = new Number(filterSettingsDiv.inputItems[inputItem.selfInfo.name + ":numberInput"].value);
			
			switch(inputItem.value){
			case "Не важно":
				break;
			case "Больше":
				result = element[inputItem.selfInfo.name] > num;
				break;
			case "Равно":
				result = element[inputItem.selfInfo.name] == num;
				break;
			case "Меньше":
				result = element[inputItem.selfInfo.name] < num;
				break;
			}
			
			break;
		case "text":
		case "string":
			var regex = Utils.globStringToRegex(inputItem.value); 
			result = element[inputItem.selfInfo.name].match(regex);
			break;
		}
		
	});
	
	return result;
};

CharacterFilter.sortDataRows = function(a,b){
	a = Database.Characters[a];
	b = Database.Characters[b];
	
	var type = CharacterFilter.sortKey == "name" ? "text":
	Database.ProfileSettings.filter(function(element){
		return element.name == CharacterFilter.sortKey;
	})[0].type;
	
	switch(type){
	case "text":
	case "string":
	case "enum":
		a = a[CharacterFilter.sortKey].toLowerCase();
		b = b[CharacterFilter.sortKey].toLowerCase();
		break;
	case "checkbox":
		a = a[CharacterFilter.sortKey];
		b = b[CharacterFilter.sortKey];
		break;
	case "number":
		a = a[CharacterFilter.sortKey];
		b = b[CharacterFilter.sortKey];
		break;
	}
	if (a > b)
		return CharacterFilter.sortDir == "asc" ? 1 : -1;
	if (a < b)
		return CharacterFilter.sortDir == "asc" ? -1 : 1;
	return 0;
};

CharacterFilter.appendDataString = function(table, character, profileSettings){
	var tr = document.createElement("tr");
	
	var inputItems = document.getElementById("filterSettingsDiv").inputItems;
	
	
//	result = element[inputItem.selfInfo.name].match(regex);
	
	profileSettings.forEach(function(profileItemInfo){
		var td = document.createElement("td");
		if(profileItemInfo.type == "checkbox"){
			td.appendChild(document.createTextNode(character[profileItemInfo.name] ? "Да" : "Нет"));
		} else if(profileItemInfo.type == "text" && profileItemInfo.name != "name"){
			var regex = Utils.globStringToRegex(inputItems[profileItemInfo.name].value); 
			var pos = character[profileItemInfo.name].search(regex);
			td.appendChild(document.createTextNode(character[profileItemInfo.name].substring(pos-5,pos+15)));
		} else {
			td.appendChild(document.createTextNode(character[profileItemInfo.name]));
		}
		tr.appendChild(td);
	});
	
	table.appendChild(tr);
};

CharacterFilter.appendContentHeader = function(table, profileSettings){
	var tr = document.createElement("tr");
	
		var td = document.createElement("th");
			td.appendChild(document.createTextNode("Персонаж"));
			td.info = "name";
			td.addEventListener("click", CharacterFilter.onSortChange);
		tr.appendChild(td);
		
		profileSettings.forEach(function(element) {
			var td = document.createElement("th");
			td.appendChild(document.createTextNode(element.name));
			td.info = element.name;
			td.addEventListener("click", CharacterFilter.onSortChange);
			tr.appendChild(td);
		});
		
	table.appendChild(tr);
};

CharacterFilter.onSortChange = function(event){
	if(CharacterFilter.sortKey == event.target.info){
		CharacterFilter.sortDir = CharacterFilter.sortDir == "asc" ? "desc" : "asc";
	} else {
		CharacterFilter.sortKey = event.target.info;
		CharacterFilter.sortDir = "asc";
	}
	CharacterFilter.rebuildContent();
};

CharacterFilter.appendInput = function(root, profileItemConfig){
	root.appendChild(document.createTextNode(profileItemConfig.name));
	root.appendChild(document.createElement("br"));
	
	switch (profileItemConfig.type) {
	case "text":
	case "string":
		var input = document.createElement("input");
		input.selfInfo = profileItemConfig;
		input.value = "";
		root.appendChild(input);
		root.inputItems[profileItemConfig.name] = input;
		
		input.addEventListener("change",CharacterFilter.rebuildContent);
		
		break;
	case "enum":
		var selector = document.createElement("select");
		selector.selfInfo = profileItemConfig;
		selector.multiple="multiple";
		
		var values = profileItemConfig.value.split(",");
		for (var i = 0; i < values.length; i++) {
			var option = document.createElement("option");
			option.selected = true;
			option.appendChild(document.createTextNode(values[i]));
			selector.appendChild(option);
		}
		root.appendChild(selector);
		root.inputItems[profileItemConfig.name] = selector;
		
		selector.addEventListener("change",CharacterFilter.rebuildContent);
		
		break;
	case "number":
		var selector = document.createElement("select");
		selector.selfInfo = profileItemConfig;
		
		var values = ["Не важно","Больше","Равно","Меньше"];
		for (var i = 0; i < values.length; i++) {
			var option = document.createElement("option");
			option.appendChild(document.createTextNode(values[i]));
			selector.appendChild(option);
		}
		selector.selectedIndex = 0;
		root.appendChild(selector);
		root.inputItems[profileItemConfig.name] = selector;
		selector.addEventListener("change",CharacterFilter.rebuildContent);

		var input = document.createElement("input");
		input.value = 0;
		input.type = "number";
		root.appendChild(input);
		root.inputItems[profileItemConfig.name + ":numberInput"] = input;
		input.addEventListener("change",CharacterFilter.rebuildContent);
		
		break;
	case "checkbox":
		var selector = document.createElement("select");
		selector.selfInfo = profileItemConfig;
		selector.multiple="multiple";
		
		var values = ["Да", "Нет"];
		for (var i = 0; i < values.length; i++) {
			var option = document.createElement("option");
			option.selected = true;
			option.appendChild(document.createTextNode(values[i]));
			selector.appendChild(option);
		}
		root.appendChild(selector);
		root.inputItems[profileItemConfig.name] = selector;
		selector.addEventListener("change",CharacterFilter.rebuildContent);
		
		break;
	}
	
	root.appendChild(document.createElement("br"));
};