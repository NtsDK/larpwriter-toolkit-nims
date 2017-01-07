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

(function(exports){
    
    exports.init = function () {
        listen(getEl('events-storySelector'), "change", updateAdaptationSelectorDelegate);
        listen(getEl('events-characterSelector'), "change", showPersonalStoriesByCharacters);
        listen(getEl('events-eventSelector'), "change", showPersonalStoriesByEvents);
        listen(getEl('finishedStoryCheckbox'), "change", exports.refresh);
        queryEls('#eventsDiv input[name=adaptationFilter]').map(listen(R.__, "change", updateFilter));
        exports.content = getEl("eventsDiv");
    };
    
    exports.refresh = function() {
        var selector = clearEl(getEl("events-storySelector"));
        clearEl(getEl("events-characterSelector"));
        clearEl(getEl("events-eventSelector"));
        clearEl(getEl("personalStories"));
    
        PermissionInformer.getEntityNamesArray('story', false, function(err, allStoryNames) {
            if (err) {Utils.handleError(err);return;}
            DBMS.getFilteredStoryNames(getEl("finishedStoryCheckbox").checked, function(err, storyNames) {
                if (err) {Utils.handleError(err);return;}
                if (storyNames.length <= 0) {return;}
    
                var selectedStoryName = getSelectedStoryName(storyNames);
    
                var map = R.indexBy(R.prop('value'), allStoryNames);
    
                storyNames.forEach(function(elem) {
                    elem.displayName = map[elem.storyName].displayName;
                    elem.value = map[elem.storyName].value;
                });
    
                storyNames.sort(Utils.charOrdAObject);
    
                var option;
                storyNames.forEach(function(storyName) {
                    option = addEl(makeEl("option"), (makeText(storyName.displayName + getSuffix(storyName))));
                    setProp(option, 'selected', storyName.value === selectedStoryName);
                    setProp(option, 'storyInfo', storyName.value);
                    addEl(selector, option);
                });
                showPersonalStories(selectedStoryName);
            });
        });
    };
    
    var updateAdaptationSelectorDelegate = function (event) {
        clearEl(getEl("personalStories"));
        var storyName = event.target.selectedOptions[0].storyInfo;
        updateSettings("storyName", storyName);
        updateSettings("characterNames", []);
        updateSettings("eventIndexes", []);
        showPersonalStories(storyName);
    };
    
    var updateAdaptationSelector = function (story, allCharacters) {
        var characterSelector = clearEl(getEl("events-characterSelector"));
        var eventSelector = clearEl(getEl("events-eventSelector"));
        
        var characterArray = getStoryCharacterCompleteness(story);
        var eventArray = getStoryEventCompleteness(story);
        
        var showOnlyUnfinishedStories = getEl("finishedStoryCheckbox").checked;
        if(showOnlyUnfinishedStories){
            characterArray = characterArray.filter((elem) => !elem.isFinished || elem.isEmpty);
            eventArray = eventArray.filter((elem) => !elem.isFinished || elem.isEmpty);
        }
        
        var characterNames = getCharacterNames(characterArray);
        var eventIndexes = getEventIndexes(eventArray);
        
        var map = CommonUtils.arr2map(allCharacters, 'value');

        characterArray.forEach(function(elem) {
            elem.displayName = map[elem.characterName].displayName;
            elem.value = map[elem.characterName].value;
        });

        characterArray.sort(Utils.charOrdAObject);
        
        var option;
        characterArray.forEach(function (elem) {
            option = addEl(makeEl("option"), (makeText(elem.displayName + getSuffix(elem))));
            setProp(option, 'selected', characterNames.indexOf(elem.value) !== -1);
            setProp(option, 'storyInfo', story.name);
            setProp(option, 'characterName', elem.value);
            addEl(characterSelector, option);
        });
        setAttr(characterSelector, "size", characterArray.length);
        
        eventArray.forEach(function (elem) {
            option = addEl(makeEl("option"), (makeText(elem.name + getSuffix(elem))));
            setProp(option, 'selected', eventIndexes.indexOf(elem.index) !== -1);
            setProp(option, 'storyInfo', story.name);
            setProp(option, 'eventIndex222', elem.index);
            addEl(eventSelector, option);
        });
        setAttr(eventSelector, "size", eventArray.length);
        
        var selectedFilter = DBMS.getSettings()["Adaptations"].selectedFilter;
        getEl(selectedFilter).checked = true;
        updateFilter({
            target : {
                id : selectedFilter
            }
        });
    };
    
    var updateFilter = function (event) {
        updateSettings('selectedFilter', event.target.id);
        var byCharacter = event.target.id === 'adaptationFilterByCharacter';
        setClassByCondition(getEl("events-characterSelectorDiv"), "hidden", !byCharacter);
        setClassByCondition(getEl("events-eventSelectorDiv"), "hidden", byCharacter);
        if(byCharacter){
            showPersonalStoriesByCharacters();
        } else {
            showPersonalStoriesByEvents();
        }
    };
    
    var showPersonalStoriesByCharacters = function () {
        var eventRows = nl2array(queryElEls(exports.content, '.eventRow-dependent'));
        eventRows.map(removeClass(R.__,"hidden"));
        nl2array(queryElEls(exports.content, 'div[dependent-on-character]')).map(addClass(R.__,"hidden"));
        
        var characterNames = nl2array(getEl('events-characterSelector').selectedOptions).map(opt => opt.characterName);
        characterNames.forEach( name => nl2array(queryElEls(exports.content, 'div[dependent-on-character="' + name + '"]')).map(removeClass(R.__,"hidden")));
        eventRows.map( row => setClassByCondition(row, 'hidden', R.intersection(row.dependsOnCharacters,characterNames).length === 0));
        
        updateSettings("characterNames", characterNames);
    };
    
    var showPersonalStoriesByEvents = function () {
        nl2array(queryElEls(exports.content, 'div[dependent-on-character]')).map(removeClass(R.__,"hidden"));
        nl2array(queryElEls(exports.content, '.eventRow-dependent')).map(addClass(R.__,"hidden"));
        
        var eventIndexes = nl2array(getEl('events-eventSelector').selectedOptions).map(opt => opt.eventIndex222);
        eventIndexes.forEach( index => removeClass(getEls(index+"-dependent")[0],"hidden"));
        updateSettings("eventIndexes", eventIndexes);
    };
    
    var getStoryCharacterCompleteness = function (story){
        return R.keys(story.characters).map(function(elem){
            return {
                characterName: elem,
                isFinished: _isStoryFinishedForCharacter(story, elem),
                isEmpty: _isStoryEmptyForCharacter(story, elem)
            }
        });
    };
    
    var _isStoryEmptyForCharacter = function (story, characterName) {
        return story.events.every((event) => event.characters[characterName] === undefined);
    };
    
    var _isStoryFinishedForCharacter = function (story, characterName) {
        return story.events.filter(event => event.characters[characterName] !== undefined).every(event => event.characters[characterName].ready === true);
    };
    
    var getStoryEventCompleteness = function (story){
        return story.events.map(function(event,i){
            return {
                name: event.name,
                index: i,
                isFinished: _isEventReady(event),
                isEmpty: Object.keys(event.characters).length === 0
            };
        });
    };

    var _isEventReady = function(event){
        return R.values(event.characters).every(character => character.ready);
    }
    
    var showPersonalStories = function (storyName) {
        DBMS.getMetaInfo(function(err, metaInfo){
            if(err) {Utils.handleError(err); return;}
            DBMS.getStory(storyName, function(err, story){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.isEntityEditable('story', storyName, function(err, isStoryEditable){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.getEntityNamesArray('character', false, function(err, allCharacters){
                        if(err) {Utils.handleError(err); return;}
                    
                        var characterNames = R.keys(story.characters);
                        var adaptations = characterNames.map(function(characterName){
                            return {
                                characterName: characterName,
                                storyName: storyName
                            };
                        });
                        PermissionInformer.areAdaptationsEditable(adaptations, function(err, areAdaptationsEditable){
                            if(err) {Utils.handleError(err); return;}
                            story.events.forEach( (item, i) => item.index = i);
                            buildAdaptationInterface(storyName, characterNames, story.events, areAdaptationsEditable, metaInfo);
                            updateAdaptationSelector(story, allCharacters);
                            Utils.enable(exports.content, "isStoryEditable", isStoryEditable);
                            Utils.enable(exports.content, "notEditable", false);
                        });
                    });
                });
            });
        });
    };
    
    var buildAdaptationInterface = function (storyName, characterNames, events, areAdaptationsEditable, metaInfo) {
        var tr, td, div, divContainer, isEditable;
        var divMain, divLeft, divRight;
        
        addEls(clearEl(getEl("personalStories")), events.map(function (event) {
            tr = makeEl("div");
            addClasses(tr, ["eventMainPanelRow", event.index + "-dependent", "eventRow-dependent"]);
            
            tr.dependsOnCharacters = R.keys(event.characters);
            
            td = addClass(makeEl("div"), "eventMainPanelRow-left");
            
            divMain =  addClass(makeEl("div"), "story-events-div-main");
            divLeft =  addClass(makeEl("div"), "story-events-div-left");
            divRight = addClass(makeEl("div"), "story-events-div-right");
            addEl(td, addEls(divMain, [divLeft, divRight]));
            
            addEl(divLeft, addEl(makeEl("div"), makeText(event.name)));
            addEl(divRight, UI.makeEventTimePicker({
                eventTime : event.time,
                index : event.index,
                preGameDate : metaInfo.preGameDate,
                date : metaInfo.date,
                extraClasses : ["isStoryEditable"],
                onChangeDateTimeCreator : onChangeDateTimeCreator(storyName)
            }));
            addEl(td, makeOriginTextInput(storyName, event));
            addEl(tr, td);
            
            td = addClass(makeEl("div"), "eventMainPanelRow-right");
            divContainer = addClass(makeEl("div"), "events-eventsContainer");
            
            addEls(divContainer, characterNames.filter(function(characterName){
                return event.characters[characterName];
            }).map(function(characterName){
                div = addClass(makeEl("div"), "events-singleEventAdaptation");
                setAttr(div, 'dependent-on-character', characterName);
                divMain =  addClass(makeEl("div"), "story-events-div-main");
                divLeft =  addClass(makeEl("div"), "story-events-div-left");
                divRight = addClass(makeEl("div"), "story-events-div-right");
                addEl(div, addEls(divMain, [divLeft, divRight]));
                isEditable = areAdaptationsEditable[storyName + "-" + characterName];
                
                addEl(divLeft, makeText(characterName));
                addEl(divRight, UI.makeAdaptationTimeInput(storyName, event, characterName, isEditable));
                addEl(div, makeAdaptationTextInput(storyName, event, characterName, isEditable));
                addEl(div, UI.makeAdaptationReadyInput(storyName, event, characterName, isEditable));
                return div;
            }));
            
            addEl(tr, addEl(td, divContainer));
            return tr;
        }));
    };
    
    var onChangeDateTimeCreator = R.curry(function (storyName, myInput) {
        return function (dp, input) {
            DBMS.updateEventProperty(storyName, myInput.eventIndex, "time", input.val(), Utils.processError());
            removeClass(myInput, "defaultDate");
        }
    });
    
    var makeOriginTextInput = function(storyName, event){
        var input = makeEl("textarea");
        addClass(input,"isStoryEditable");
        addClass(input,"eventPersonalStory");
        input.value = event.text;
        input.dataKey = JSON.stringify([storyName, event.index]);
        listen(input, "change", onChangeOriginText);
        return input;
    };
    
    var makeAdaptationTextInput = function(storyName, event, characterName, isEditable){
        var input = makeEl("textarea");
        setClassByCondition(input, "notEditable", !isEditable);
        addClass(input,"eventPersonalStory");
        input.value = event.characters[characterName].text;
        input.dataKey = JSON.stringify([storyName, event.index, characterName]);
        listen(input, "change", onChangeAdaptationText);
        return input;
    };
    
    var onChangeOriginText = function (event) {
        var dataKey = JSON.parse(event.target.dataKey);
        var text = event.target.value;
        DBMS.setOriginEventText(dataKey[0], dataKey[1], text, Utils.processError());
    };
    
    var onChangeAdaptationText = function (event) {
        var dataKey = JSON.parse(event.target.dataKey);
        var text = event.target.value;
        DBMS.setAdaptationEventText(dataKey[0], dataKey[1], dataKey[2], text, Utils.processError());
    };
    
    var getSuffix = function(object){
        if(object.isEmpty) return constL10n(Constants.emptySuffix);
        if(object.isFinished) return constL10n(Constants.finishedSuffix);
        return "";
    };
    
    var updateSettings = function (name, value) {
        var settings = DBMS.getSettings();
        settings["Adaptations"][name] = value;
    };
    
    var getSelectedStoryName = function(storyNames){
        var storyNamesOnly = storyNames.map(R.prop('storyName'));
        
        var settings = DBMS.getSettings();
        if(!settings["Adaptations"]){
            settings["Adaptations"] = {
                storyName : storyNamesOnly[0],
                characterNames : [],
                eventIndexes : [],
                selectedFilter : "adaptationFilterByCharacter"
            };
        }
        var storyName = settings["Adaptations"].storyName;
        if(storyNamesOnly.indexOf(storyName) === -1){
            settings["Adaptations"].storyName = storyNamesOnly[0];
            storyName = storyNamesOnly[0];
        }
        return storyName;
    };
        
    var getNames = function(nameObjectArray, nameObjectProperty, settingsProperty){
        var namesOnly = nameObjectArray.map(R.prop(nameObjectProperty));
        var names = DBMS.getSettings()["Adaptations"][settingsProperty];
        var existingNames = names.filter(function(name){
            return namesOnly.indexOf(name) !== -1;
        });
        
        updateSettings(settingsProperty, existingNames);
        return existingNames;
    };
    
    var getCharacterNames = function(characterArray){
        return getNames(characterArray, 'characterName', "characterNames");
    };
    
    var getEventIndexes = function(eventArray){
        return getNames(eventArray, 'index', "eventIndexes");
    };

})(this['Adaptations']={});