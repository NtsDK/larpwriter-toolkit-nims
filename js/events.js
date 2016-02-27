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

var Events = {};

Events.headers = [ "Оригинал", "Адаптация"];
Events.finishedText = "Описание завершено";
Events.finishedSuffix = "(завершено)";
Events.emptySuffix = "(пусто)";


Events.init = function () {
    "use strict";
    listen(getEl('events-storySelector'), "change", Events.updateAdaptationSelectorDelegate);
    listen(getEl('events-characterSelector'), "change", Events.showPersonalStoriesDelegate);
    listen(getEl('events-eventSelector'), "change", Events.showPersonalStoriesDelegate2);
    listen(getEl('finishedStoryCheckbox'), "change", Events.refresh);
    listen(getEl("adaptationFilterByCharacter"), "change", Events.updateFilter);
    listen(getEl("adaptationFilterByEvent"), "change", Events.updateFilter);
    Events.content = document.getElementById("eventsDiv");
};

Events.getSelectedStoryName = function(storyNames){
    "use strict";
    var storyNamesOnly = storyNames.map(R.prop('storyName'));
    
    var settings = DBMS.getSettings();
    if(!settings["Events"]){
        settings["Events"] = {
            storyName : storyNamesOnly[0],
            characterNames : [],
            eventIndexes : [],
            selectedFilter : "adaptationFilterByCharacter"
        };
    }
    var storyName = settings["Events"].storyName;
    if(storyNamesOnly.indexOf(storyName) === -1){
        settings["Events"].storyName = storyNamesOnly[0];
        storyName = storyNamesOnly[0];
    }
    return storyName;
};
    
Events.getNames = function(nameObjectArray, nameObjectProperty, settingsProperty){
    "use strict";
    var namesOnly = nameObjectArray.map(R.prop(nameObjectProperty));
    var names = DBMS.getSettings()["Events"][settingsProperty];
    var existingNames = names.filter(function(name){
        return namesOnly.indexOf(name) !== -1;
    });
    
    Events.updateSettings(settingsProperty, existingNames);
    return existingNames;
};

Events.getCharacterNames = function(characterArray){
    "use strict";
    return Events.getNames(characterArray, 'characterName', "characterNames");
};

Events.getEventIndexes = function(eventArray){
    "use strict";
    return Events.getNames(eventArray, 'index', "eventIndexes");
};

Events.refresh = function() {
    "use strict";
    var selector = clearEl(getEl("events-storySelector"));
    clearEl(getEl("events-characterSelector"));
    clearEl(getEl("events-eventSelector"));
    clearEl(getEl("personalStories"));

    PermissionInformer.getStoryNamesArray(false, function(err, allStoryNames) {
        if (err) {Utils.handleError(err);return;}
        DBMS.getFilteredStoryNames(getEl("finishedStoryCheckbox").checked, function(err, storyNames) {
            if (err) {Utils.handleError(err);return;}
            if (storyNames.length <= 0) {return;}

            var selectedStoryName = Events.getSelectedStoryName(storyNames);

            var map = arr2map(allStoryNames, 'value');

            storyNames.forEach(function(elem) {
                elem.displayName = map[elem.storyName].displayName;
                elem.value = map[elem.storyName].value;
            });

            storyNames.sort(Utils.charOrdAObject);

            var option;
            storyNames.forEach(function(storyName) {
                option = addEl(makeEl("option"), (makeText(storyName.displayName + Events.getSuffix(storyName))));
                setProp(option, 'selected', storyName.value === selectedStoryName);
                setProp(option, 'storyInfo', storyName.value);
                addEl(selector, option);
            });
            Events.updateAdaptationSelector(selectedStoryName);
        });
    });
};

Events.updateAdaptationSelectorDelegate = function (event) {
    "use strict";
    var storyName = event.target.selectedOptions[0].storyInfo;
    Events.updateSettings("storyName", storyName);
    Events.updateSettings("characterNames", []);
    Events.updateAdaptationSelector(storyName);
};

Events.updateAdaptationSelector = function (storyName) {
    "use strict";
    
    var characterSelector = clearEl(getEl("events-characterSelector"));
    var eventSelector = clearEl(getEl("events-eventSelector"));
    
    PermissionInformer.getCharacterNamesArray(false, function(err, allCharacters){
        if(err) {Utils.handleError(err); return;}
        DBMS.getFilteredCharacterNames(storyName, getEl("finishedStoryCheckbox").checked, function(err, characterArray){
            if(err) {Utils.handleError(err); return;}
            DBMS.getFilteredEventNames(storyName, getEl("finishedStoryCheckbox").checked, function(err, eventArray){
                if(err) {Utils.handleError(err); return;}
                
                var characterNames = Events.getCharacterNames(characterArray);
                var eventIndexes = Events.getEventIndexes(eventArray);
                
                var map = arr2map(allCharacters, 'value');
    
                characterArray.forEach(function(elem) {
                    elem.displayName = map[elem.characterName].displayName;
                    elem.value = map[elem.characterName].value;
                });
    
                characterArray.sort(Utils.charOrdAObject);
                
                var option;
                characterArray.forEach(function (elem) {
                    option = addEl(makeEl("option"), (makeText(elem.displayName + Events.getSuffix(elem))));
                    setProp(option, 'selected', characterNames.indexOf(elem.value) !== -1);
                    setProp(option, 'storyInfo', storyName);
                    setProp(option, 'characterName', elem.value);
                    addEl(characterSelector, option);
                });
                setAttr(characterSelector, "size", characterArray.length);
                
                eventArray.forEach(function (elem) {
                    option = addEl(makeEl("option"), (makeText(elem.name + Events.getSuffix(elem))));
                    setProp(option, 'selected', eventIndexes.indexOf(elem.index) !== -1);
                    setProp(option, 'storyInfo', storyName);
                    setProp(option, 'eventIndex222', elem.index);
                    addEl(eventSelector, option);
                });
                setAttr(eventSelector, "size", eventArray.length);
                
                var selectedFilter = DBMS.getSettings()["Events"].selectedFilter;
                getEl(selectedFilter).checked = true;
                Events.updateFilter({
                    target : {
                        id : selectedFilter
                    }
                });
            });
        });
    });
};

Events.updateFilter = function (event) {
    "use strict";
    Events.updateSettings('selectedFilter', event.target.id);
    var byCharacter = event.target.id === 'adaptationFilterByCharacter';
    setClassByCondition(getEl("events-characterSelectorDiv"), "hidden", !byCharacter);
    setClassByCondition(getEl("events-eventSelectorDiv"), "hidden", byCharacter);
    if(!byCharacter){
        var i, charSelector = getEl('events-characterSelector');
        if(charSelector.options.length === 0) return;
        var characterNames = [];
        for (i = 0; i < charSelector.options.length; i +=1) {
            characterNames.push(charSelector.options[i].characterName);
        }
        Events.showPersonalStories(charSelector.options[0].storyInfo, characterNames, function(){
            Events.showPersonalStoriesDelegate2({target:getEl('events-eventSelector')});
        });
    } else {
        Events.showPersonalStoriesDelegate({target:getEl('events-characterSelector')});
    }
};

Events.showPersonalStoriesDelegate = function (event) {
    "use strict";
    
    if(event.target.selectedOptions.length == 0){
        return;
    }
    
    var option = event.target.selectedOptions[0];
    var storyName = option.storyInfo;
    var characterNames = [];
    
    var i, charSelector = event.target;
    for (i = 0; i < charSelector.selectedOptions.length; i +=1) {
        characterNames.push(charSelector.selectedOptions[i].characterName);
    }
    
    Events.updateSettings("characterNames", characterNames);
    Events.showPersonalStories(storyName, characterNames);
};

Events.showPersonalStoriesDelegate2 = function (event) {
    "use strict";
    var eventIndexes = [];
    
    var i, eventSelector = getEl('events-eventSelector'), eventIndex;
    var eventRows = getEls('eventRow-dependent');
    for (i = 0; i < eventRows.length; i +=1) {
        addClass(eventRows[i],"hidden");
    }
    for (i = 0; i < eventSelector.selectedOptions.length; i +=1) {
        eventIndex = eventSelector.selectedOptions[i].eventIndex222;
        removeClass(getEls(eventIndex+"-dependent")[0],"hidden");
        eventIndexes.push(eventIndex);
    }
    Events.updateSettings("eventIndexes", eventIndexes);
};

Events.showPersonalStories = function (storyName, characterNames, delegate) {
    "use strict";
    
	DBMS.getEvents(storyName, characterNames, function(err, events){
		if(err) {Utils.handleError(err); return;}
	    PermissionInformer.isStoryEditable(storyName, function(err, isStoryEditable){
	    	if(err) {Utils.handleError(err); return;}
	    	var adaptations = characterNames.map(function(characterName){
	    		return {
	    			characterName: characterName,
	    			storyName: storyName
	    		};
	    	});
	    	PermissionInformer.areAdaptationsEditable(adaptations, function(err, areAdaptationsEditable){
	    		if(err) {Utils.handleError(err); return;}
	    		Events.buildAdaptationInterface(storyName, characterNames, events, areAdaptationsEditable);
	    		Utils.enable(Events.content, "isStoryEditable", isStoryEditable);
	    		Utils.enable(Events.content, "notEditable", false);
	    		if(delegate)delegate();
	    	});
	    });
	});
};
	
Events.buildAdaptationInterface = function (storyName, characterNames, events, areAdaptationsEditable) {
    "use strict";
    
    var table = document.getElementById("personalStories");
    Utils.removeChildren(table);

    var tr;
    var td, span, input, i, div, divContainer;
    
    events.forEach(function (event, i) {
        tr = document.createElement("div");
        addClass(tr, "eventMainPanelRow");
        addClass(tr, event.index + "-dependent");
        addClass(tr, "eventRow-dependent");
        table.appendChild(tr);
        
        td = document.createElement("div");
        addClass(td, "eventMainPanelRow-left");
        span = document.createElement("div");
        span.appendChild(document.createTextNode(event.name));
        td.appendChild(span);
        
        input = document.createElement("textarea");
        addClass(input,"isStoryEditable");
        addClass(input,"eventPersonalStory");
        input.value = event.text;
        input.eventIndex = event.index;
        input.storyName = storyName;
        
        input.addEventListener("change", Events.onChangePersonalStoryDelegate);
        td.appendChild(input);
        tr.appendChild(td);
        
        td = document.createElement("div");
        addClass(td, "eventMainPanelRow-right");
        
        divContainer = document.createElement("div");
        addClass(divContainer, "events-eventsContainer");
        
        for (var i = 0; i < characterNames.length; i++) {
            var characterName = characterNames[i];
            
            if(!event.characters[characterName]){
                continue;
            }
            div = document.createElement("div");
            addClass(div, "events-singleEventAdaptation");
            div.appendChild(document.createTextNode(characterName));
            
            input = document.createElement("textarea");
            if(!areAdaptationsEditable[storyName + "-" + characterName]){
            	addClass(input,"notEditable");
            }
            addClass(input,"eventPersonalStory");
            input.value = event.characters[characterName].text;
            input.eventIndex = event.index;
            input.storyName = storyName;
            input.characterName = characterName;
            
            input.addEventListener("change", Events.onChangePersonalStoryDelegate);
            div.appendChild(input);
            
            input = document.createElement("input");
            if(!areAdaptationsEditable[storyName + "-" + characterName]){
            	addClass(input,"notEditable");
            }
            input.type = "checkbox";
            input.checked = event.characters[characterName].ready;
            input.eventIndex = event.index;
            input.storyName = storyName;
            input.characterName = characterName;
            input.id = event.index + "-" + storyName + "-" + characterName;
            
            input.addEventListener("change", Events.onChangeReadyStatus);
            div.appendChild(input);
            addEl(div, setAttr(addEl(makeEl("label"), makeText(Events.finishedText)), "for", input.id));
            
            divContainer.appendChild(div);
        }
        
        td.appendChild(divContainer);
        
        tr.appendChild(td);
    });
};

Events.onChangeReadyStatus = function (event) {
    "use strict";
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var characterName = event.target.characterName;
    var value = event.target.checked;
    DBMS.changeAdaptationReadyStatus(storyName, eventIndex, characterName, value, Utils.processError());
};

Events.onChangePersonalStoryDelegate = function (event) {
    "use strict";
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var characterName = event.target.characterName;
    var text = event.target.value;
    DBMS.setEventText(storyName, eventIndex, characterName, text, Utils.processError());
};

Events.getSuffix = function(object){
    "use strict";
    if(object.isEmpty) return Events.emptySuffix;
    if(object.isFinished) return Events.finishedSuffix;
    return "";
};

Events.updateSettings = function (name, value) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["Events"][name] = value;
};