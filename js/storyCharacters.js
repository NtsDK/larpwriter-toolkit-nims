/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

/*global
 Utils, DBMS
 */

"use strict";

var StoryCharacters = {};

StoryCharacters.init = function () {
    "use strict";
    var button = getEl("storyCharactersAddButton");
    button.addEventListener("click", StoryCharacters.addCharacter);

    button = getEl("storyCharactersSwitchButton");
    button.addEventListener("click", StoryCharacters.switchCharacters);

    button = getEl("storyCharactersRemoveButton");
    button.addEventListener("click", StoryCharacters.removeCharacter);

    StoryCharacters.addSelector = getEl("storyCharactersAddSelector");
    StoryCharacters.removeSelector = getEl("storyCharactersRemoveSelector");
    StoryCharacters.fromSelector = getEl("storyCharactersFromSelector");
    StoryCharacters.toSelector = getEl("storyCharactersToSelector");

    StoryCharacters.content = getEl("storyCharactersDiv");
};

StoryCharacters.refresh = function () {
    "use strict";

    clearEl(StoryCharacters.addSelector);
    clearEl(StoryCharacters.removeSelector);
    clearEl(StoryCharacters.fromSelector);
    clearEl(StoryCharacters.toSelector);
    
    if(!Stories.CurrentStoryName){
        return;
    }
    
    PermissionInformer.isStoryEditable(Stories.CurrentStoryName, function(err, isStoryEditable){
    	if(err) {Utils.handleError(err); return;}
    	PermissionInformer.getCharacterNamesArray(false, function(err, allCharacters){
	    	if(err) {Utils.handleError(err); return;}
	        DBMS.getStoryCharacters(Stories.CurrentStoryName, function(err, localCharacters){
	        	if(err) {Utils.handleError(err); return;}
	            StoryCharacters.rebuildInterface(allCharacters, localCharacters);
	            Utils.enable(StoryCharacters.content, "isStoryEditable", isStoryEditable);
	            Stories.chainRefresh();
	        });
	    });
    });
};

StoryCharacters.rebuildInterface = function (allCharacters, localCharacters) {
    "use strict";
    	
	var addArray = [];
	var removeArray = [];
	
	allCharacters.filter(function(nameInfo){
		return !localCharacters[nameInfo.value];
	}).forEach(function(nameInfo){
		addArray.push(nameInfo);
	});
	
	allCharacters.filter(function(nameInfo){
		return localCharacters[nameInfo.value];
	}).forEach(function(nameInfo){
		removeArray.push(nameInfo);
	});
	
	addArray.sort(Utils.charOrdAObject);
	removeArray.sort(Utils.charOrdAObject);
	
	var option;
	
	addArray.forEach(function (addValue) {
		option = makeEl("option");
		option.appendChild(makeText(addValue.displayName));
		option.value = addValue.value;
		StoryCharacters.addSelector.appendChild(option);
		option = makeEl("option");
		option.appendChild(makeText(addValue.displayName));
		option.value = addValue.value;
		StoryCharacters.toSelector.appendChild(option);
	});
	removeArray.forEach(function (removeValue) {
		option = makeEl("option");
		option.appendChild(makeText(removeValue.displayName));
		option.value = removeValue.value;
		StoryCharacters.removeSelector.appendChild(option);
		option = makeEl("option");
		option.appendChild(makeText(removeValue.displayName));
		option.value = removeValue.value;
		StoryCharacters.fromSelector.appendChild(option);
	});
	
	var tableHead = clearEl(getEl("story-characterActivityTableHead"));
	var table = clearEl(getEl("story-characterActivityTable"));
	addEl(tableHead, StoryCharacters.getCharacterHeader([getL10n("stories-name")].concat(Constants.characterActivityTypes.map(R.prop('displayName')))));
	removeArray.forEach(function (removeValue) {
		StoryCharacters.appendCharacterActivity(table, removeValue, localCharacters[removeValue.value]);
	});
	
	tableHead = clearEl(getEl("storyCharactersTableHead"));
	table = clearEl(getEl("storyCharactersTable"));
	addEl(tableHead, StoryCharacters.getCharacterHeader([getL10n("stories-name"), getL10n("stories-inventory")]));
	removeArray.forEach(function (removeValue) {
		StoryCharacters.appendCharacterInput(table, removeValue, localCharacters[removeValue.value]);
	});
};

StoryCharacters.addCharacter = function () {
    "use strict";
    var characterName = getEl("storyCharactersAddSelector").value.trim();
    
    if (characterName === "") {
        Utils.alert(getL10n("stories-character-name-is-not-specified"));
        return;
    }
    
    DBMS.addStoryCharacter(Stories.CurrentStoryName, characterName, Utils.processError(StoryCharacters.refresh));
};

StoryCharacters.switchCharacters = function () {
    "use strict";
    var fromName = getEl("storyCharactersFromSelector").value.trim();
    var toName = getEl("storyCharactersToSelector").value.trim();
    
    if (fromName === "" || toName === "") {
        Utils.alert(getL10n("stories-one-of-switch-characters-is-not-specified"));
        return;
    }
    
    DBMS.switchStoryCharacters(Stories.CurrentStoryName, fromName, toName, Utils.processError(StoryCharacters.refresh));
};

StoryCharacters.removeCharacter = function () {
    "use strict";
    var characterName = getEl("storyCharactersRemoveSelector").value.trim();
    
    if (characterName === "") {
        Utils.alert(getL10n("stories-character-name-is-not-specified"));
        return;
    }

    if (Utils.confirm(strFormat(getL10n("stories-remove-character-from-story-warning"),[characterName]))) {
        DBMS.removeStoryCharacter(Stories.CurrentStoryName, characterName, Utils.processError(StoryCharacters.refresh));
    }
};

StoryCharacters.getCharacterHeader = function (values) {
    "use strict";
    var tr = makeEl("tr");
    values.forEach(function(value){
        addEl(tr, addEl(makeEl('th'), makeText(value)));
    });
    return tr;
};

StoryCharacters.appendCharacterInput = function (table, characterMeta, character) {
    "use strict";
    var tr = makeEl("tr");
    var td = makeEl("td");
    td.appendChild(makeText(characterMeta.displayName));
    tr.appendChild(td);

    td = makeEl("td");
    var input = makeEl("input");
    input.value = character.inventory;
    input.characterName = character.name;
    addClass(input, "inventoryInput");
    addClass(input, "isStoryEditable");
    input.addEventListener("change", StoryCharacters.updateCharacterInventory);
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
};

StoryCharacters.updateCharacterInventory = function (event) {
    "use strict";
    DBMS.updateCharacterInventory(Stories.CurrentStoryName, event.target.characterName, event.target.value, Utils.processError());
};

StoryCharacters.appendCharacterActivity = function (table, characterMeta, character) {
    "use strict";
    var tr = makeEl("tr");
    var td = makeEl("td");
    td.appendChild(makeText(characterMeta.displayName));
    tr.appendChild(td);
    
    var input;
    Constants.characterActivityTypes.forEach(function (activityType) {
        td = makeEl("td");
        input = makeEl("input");
        addClass(input, "isStoryEditable");
        input.type = "checkbox";
        if (character.activity[activityType.name]) {
            input.checked = true;
        }
        input.characterName = character.name;
        input.activityType = activityType.name;
        input.addEventListener("change", StoryCharacters.onChangeCharacterActivity);
        td.appendChild(input);
        tr.appendChild(td);
    });
    
    table.appendChild(tr);
};

StoryCharacters.onChangeCharacterActivity = function (event) {
    "use strict";
    DBMS.onChangeCharacterActivity(Stories.CurrentStoryName, event.target.characterName, 
            event.target.activityType, event.target.checked, Utils.processError());
};
