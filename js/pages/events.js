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

Events.init = function () {
    "use strict";
    listen(getEl('events-storySelector'), "change", Events.updateAdaptationSelectorDelegate);
    listen(getEl('events-characterSelector'), "change", Events.showPersonalStoriesDelegate);
    listen(getEl('events-eventSelector'), "change", Events.showPersonalStoriesDelegate2);
    listen(getEl('finishedStoryCheckbox'), "change", Events.refresh);
    listen(getEl("adaptationFilterByCharacter"), "change", Events.updateFilter);
    listen(getEl("adaptationFilterByEvent"), "change", Events.updateFilter);
    Events.content = getEl("eventsDiv");
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
    DBMS.getMetaInfo(function(err, metaInfo){
        if(err) {Utils.handleError(err); return;}
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
    	    		Events.buildAdaptationInterface(storyName, characterNames, events, areAdaptationsEditable, metaInfo);
    	    		Utils.enable(Events.content, "isStoryEditable", isStoryEditable);
    	    		Utils.enable(Events.content, "notEditable", false);
    	    		if(delegate)delegate();
    	    	});
    	    });
    	});
    });
};

Events.buildAdaptationInterface = function (storyName, characterNames, events, areAdaptationsEditable, metaInfo) {
    "use strict";
    
    var table = clearEl(getEl("personalStories"));

    var tr, td, div, divContainer, isEditable;
    var divMain, divLeft, divRight;
    
    R.ap([addEl(table)], events.map(function (event) {
        tr = makeEl("div");
        R.ap([addClass(tr)], ["eventMainPanelRow", event.index + "-dependent", "eventRow-dependent"]);
        
        td = addClass(makeEl("div"), "eventMainPanelRow-left");
        
        divMain =  addClass(makeEl("div") ,"story-events-div-main");
        divLeft =  addClass(makeEl("div") ,"story-events-div-left");
        divRight = addClass(makeEl("div"),"story-events-div-right");
        addEl(divMain, divLeft);
        addEl(divMain, divRight);
        addEl(td, divMain);
        
        addEl(divLeft, addEl(makeEl("div"), makeText(event.name)));
        addEl(divRight, UI.makeEventTimePicker({
            eventTime : event.time,
            index : event.index,
            preGameDate : metaInfo.preGameDate,
            date : metaInfo.date,
            extraClasses : ["isStoryEditable"],
            onChangeDateTimeCreator : Events.onChangeDateTimeCreator(storyName)
        }));
        addEl(td, Events.makeOriginTextInput(storyName, event));
        addEl(tr, td);
        
        td = addClass(makeEl("div"), "eventMainPanelRow-right");
        divContainer = addClass(makeEl("div"), "events-eventsContainer");
        
        R.ap([addEl(divContainer)], characterNames.filter(function(characterName){
            return event.characters[characterName];
        }).map(function(characterName){
            div = addClass(makeEl("div"), "events-singleEventAdaptation");
            divMain =  addClass(makeEl("div") ,"story-events-div-main");
            divLeft =  addClass(makeEl("div") ,"story-events-div-left");
            divRight = addClass(makeEl("div"),"story-events-div-right");
            addEl(divMain, divLeft);
            addEl(divMain, divRight);
            addEl(div, divMain);
            isEditable = areAdaptationsEditable[storyName + "-" + characterName];
            
            addEl(divLeft, makeText(characterName));
            addEl(divRight, UI.makeAdaptationTimeInput(storyName, event, characterName, isEditable));
            addEl(div, Events.makeAdaptationTextInput(storyName, event, characterName, isEditable));
            addEl(div, Events.makeAdaptationReadyInput(storyName, event, characterName, isEditable));
            return div;
        }));
        
        addEl(tr, addEl(td, divContainer));
        return tr;
    }));
};

Events.onChangeDateTimeCreator = R.curry(function (storyName, myInput) {
    "use strict";
    return function (dp, input) {
        DBMS.updateEventProperty(storyName, myInput.eventIndex, "time", input.val(), Utils.processError());
        StoryEvents.lastDate = input.val();
        removeClass(myInput, "defaultDate");
    }
});

Events.makeOriginTextInput = function(storyName, event){
    "use strict";
    var input = makeEl("textarea");
    addClass(input,"isStoryEditable");
    addClass(input,"eventPersonalStory");
    input.value = event.text;
    input.dataKey = JSON.stringify([storyName, event.index]);
    listen(input, "change", Events.onChangePersonalStoryDelegate);
    return input;
};

Events.makeAdaptationTextInput = function(storyName, event, characterName, isEditable){
    "use strict";
    var input = makeEl("textarea");
    setClassByCondition(input, "notEditable", !isEditable);
    addClass(input,"eventPersonalStory");
    input.value = event.characters[characterName].text;
    input.dataKey = JSON.stringify([storyName, event.index, characterName]);
    listen(input, "change", Events.onChangePersonalStoryDelegate);
    return input;
};

Events.makeAdaptationReadyInput = function(storyName, event, characterName, isEditable){
    "use strict";
    var div = makeEl("div");
    var input = makeEl("input");
    setClassByCondition(input, "notEditable", !isEditable);
    input.type = "checkbox";
    input.checked = event.characters[characterName].ready;
    input.dataKey = JSON.stringify([storyName, event.index, characterName]);
    input.id = event.index + "-" + storyName + "-" + characterName;
    listen(input, "change", Events.onChangeReadyStatus);
    addEl(div, input);
    
    addEl(div, setAttr(addEl(makeEl("label"), makeText(constL10n(Constants.finishedText))), "for", input.id));
    return div;
};

Events.onChangeReadyStatus = function (event) {
    "use strict";
    var dataKey = JSON.parse(event.target.dataKey);
    var value = event.target.checked;
    DBMS.changeAdaptationReadyStatus(dataKey[0], dataKey[1], dataKey[2], value, Utils.processError());
};

Events.onChangePersonalStoryDelegate = function (event) {
    "use strict";
    var dataKey = JSON.parse(event.target.dataKey);
    var text = event.target.value;
    DBMS.setEventText(dataKey[0], dataKey[1], dataKey[2], text, Utils.processError());
};

Events.getSuffix = function(object){
    "use strict";
    if(object.isEmpty) return constL10n(Constants.emptySuffix);
    if(object.isFinished) return constL10n(Constants.finishedSuffix);
    return "";
};

Events.updateSettings = function (name, value) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["Events"][name] = value;
};