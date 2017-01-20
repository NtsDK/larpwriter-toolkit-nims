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

    StoryCharacters.ExternalCharacterSelectors = [getEl("storyCharactersAddSelector"), getEl("storyCharactersToSelector")];
    StoryCharacters.InternalCharacterSelectors = [getEl("storyCharactersRemoveSelector"), getEl("storyCharactersFromSelector")];
    
    StoryCharacters.content = getEl("storyCharactersDiv");
};

StoryCharacters.refresh = function () {
    "use strict";

    StoryCharacters.ExternalCharacterSelectors.forEach(clearEl);
    StoryCharacters.InternalCharacterSelectors.forEach(clearEl);
    
    clearEl(getEl("story-characterActivityTableHead"));
    clearEl(getEl("story-characterActivityTable"));
    clearEl(getEl("storyCharactersTableHead"));
    clearEl(getEl("storyCharactersTable"));
    
    if(!Stories.CurrentStoryName){return;}
    
    PermissionInformer.isEntityEditable('story', Stories.CurrentStoryName, function(err, isStoryEditable){
        if(err) {Utils.handleError(err); return;}
        PermissionInformer.getEntityNamesArray('character', false, function(err, allCharacters){
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
    
    var addData = getSelect2Data(addArray);
    var removeData = getSelect2Data(removeArray);
    
    StoryCharacters.ExternalCharacterSelectors.forEach(function(selector){
        $("#" + selector.id).select2(addData);
    });
    StoryCharacters.InternalCharacterSelectors.forEach(function(selector){
        $("#" + selector.id).select2(removeData);
    });
    
    var tableHead = clearEl(getEl("story-characterActivityTableHead"));
    var table = clearEl(getEl("story-characterActivityTable"));
    addEl(tableHead, StoryCharacters.getCharacterHeader([getL10n("stories-name")].concat(Constants.characterActivityTypes.map(constL10n))));
    removeArray.forEach(function (removeValue) {
        addEl(table, StoryCharacters.getCharacterActivity(removeValue, localCharacters[removeValue.value]));
    });
    
    tableHead = clearEl(getEl("storyCharactersTableHead"));
    table = clearEl(getEl("storyCharactersTable"));
    addEl(tableHead, StoryCharacters.getCharacterHeader([getL10n("stories-name"), getL10n("stories-inventory")]));
    removeArray.forEach(function (removeValue) {
        addEl(table, StoryCharacters.getCharacterInput(removeValue, localCharacters[removeValue.value]));
    });
};

StoryCharacters.addCharacter = function () {
    "use strict";
    var characterName = getEl("storyCharactersAddSelector").value.trim();
    DBMS.addStoryCharacter(Stories.CurrentStoryName, characterName, Utils.processError(StoryCharacters.refresh));
};

StoryCharacters.switchCharacters = function () {
    "use strict";
    var fromName = getEl("storyCharactersFromSelector").value.trim();
    var toName = getEl("storyCharactersToSelector").value.trim();
    DBMS.switchStoryCharacters(Stories.CurrentStoryName, fromName, toName, Utils.processError(StoryCharacters.refresh));
};

StoryCharacters.removeCharacter = function () {
    "use strict";
    var characterName = getEl("storyCharactersRemoveSelector").value.trim();
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

StoryCharacters.getCharacterInput = function (characterMeta, character) {
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
    return tr;
};

StoryCharacters.updateCharacterInventory = function (event) {
    "use strict";
    DBMS.updateCharacterInventory(Stories.CurrentStoryName, event.target.characterName, event.target.value, Utils.processError());
};

StoryCharacters.getCharacterActivity = function (characterMeta, character) {
    "use strict";
    var tr = makeEl("tr");
    var td = makeEl("td");
    td.appendChild(makeText(characterMeta.displayName));
    tr.appendChild(td);
    
    var input;
    addEls(tr, Constants.characterActivityTypes.map(function (activityType) {
        td = addClass(makeEl("td"),'vertical-aligned-td');
        input = makeEl("input");
        addClass(input, "isStoryEditable");
        input.type = "checkbox";
        if (character.activity[activityType]) {
            input.checked = true;
        }
        input.characterName = character.name;
        input.activityType = activityType;
        input.addEventListener("change", StoryCharacters.onChangeCharacterActivity);
        setAttr(input, 'id', character.name + activityType);
        addClass(input, 'hidden')
        addEl(td, input)
        var label = addClass(makeEl('label'),'checkbox-label');
        setAttr(label, 'for', character.name + activityType);
        return addEl(td, label);
    }));
    return tr;
};

StoryCharacters.onChangeCharacterActivity = function (event) {
    "use strict";
    DBMS.onChangeCharacterActivity(Stories.CurrentStoryName, event.target.characterName, 
            event.target.activityType, event.target.checked, Utils.processError());
};
