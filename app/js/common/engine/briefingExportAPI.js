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
"use strict";

(function(callback){

    function briefingExportAPI(LocalDBMS, CommonUtils, R, Constants) {
    
        LocalDBMS.prototype.getBriefingData = function(selectedCharacters, callback) {
            var that = this;
            that.getAllCharacterGroupTexts(function(err, groupTexts){
                if(err) {callback(err); return;}
                if(R.isNil(selectedCharacters)){
                    selectedCharacters = R.keys(that.database.Characters);
                } else {
                    selectedCharacters = R.keys(selectedCharacters);
                }
                _getBriefingData(that._getKnownCharacters, that.database, selectedCharacters, groupTexts, callback);
            });
        };
        
        var _getBriefingData = function(getKnownCharacters, database, selectedCharacters, groupTexts, callback) {
            var charArray = selectedCharacters.map(function(charName){
                var dataObject = {
                    "gameName" : database.Meta.name,
                    "name" : charName,
                    "inventory" : _makeCharInventory(database, charName),
                    "storiesInfo" : _getStoriesInfo(database, charName),
                    "eventsInfo" : _getEventsInfo(database, charName),
                    "profileInfoArray" : _getProfileInfoArray(database, charName),
                    "groupTexts" : groupTexts[charName],
                    "relations" : _makeRelationsInfo(getKnownCharacters(database, charName), database, charName)
                };
                
                dataObject = R.merge(dataObject, _getProfileInfoObject("profileInfo-", database, charName, false));
                dataObject = R.merge(dataObject, _getProfileInfoObject("profileInfo-splitted-", database, charName, true));
                dataObject = R.merge(dataObject, _getProfileInfoNotEmpty("profileInfo-notEmpty-", database, charName));
                
                return dataObject;
            });
            
            charArray.sort(CommonUtils.charOrdAFactory(R.prop('name')));
            callback(null, {
                briefings : charArray,
                gameName : database.Meta.name
            });
        };
        
        var _makeRelationsInfo = function(knownCharacters, database, charName){
            var relations = database.Relations[charName];
            var profiles = database.Characters;
            //var storyMeets = '';
            return R.keys(relations).map(function(toCharacter){
                return {
                    toCharacter: toCharacter, 
                    text: relations[toCharacter],
                    splittedText: _splitText(relations[toCharacter]),
                    profile: profiles[toCharacter],
                    stories: R.keys(knownCharacters[toCharacter] || {}).join(', ')
                }
            }).sort(CommonUtils.charOrdAFactory(R.prop('toCharacter')));
        };
        
        var _makeCharInventory = function(database, charName){
            var inventory = [];
            R.values(database.Stories).forEach(function(story){
                if (story.characters[charName] && 
                        story.characters[charName].inventory && 
                        story.characters[charName].inventory !== "") {
                    inventory = inventory.concat(story.characters[charName].inventory);
                }
            });
            inventory = inventory.join(", ");
            return inventory;
        };
    
        var _getProfileInfoNotEmpty = function(prefix, database, charName) {
            var character = database.Characters[charName];
            var profileInfo = {};
            
            database.ProfileSettings.forEach(function(element) {
                profileInfo[prefix + element.name] = String(character[element.name]).length !== 0;
            });
            return profileInfo;
        };
        
        var _getProfileInfoObject = function(prefix, database, charName, returnSplitted) {
            var character = database.Characters[charName];
            var profileInfo = {};
    
            database.ProfileSettings.forEach(function(element) {
                profileInfo[prefix + element.name] = returnSplitted ? _splitText(String(character[element.name])) : character[element.name];
            });
            return profileInfo;
        };
    
        var _getProfileInfoArray = function(database, charName) {
            var character = database.Characters[charName];
            var value, splittedText;
            var filter = R.compose(R.equals(true), R.prop('doExport'));
            var profileInfoArray = database.ProfileSettings.filter(filter).map(function(element) {
                value = character[element.name];
                splittedText = _splitText(String(value));
                return {
                    name : element.name,
                    value : value,
                    splittedText : splittedText,
                    notEmpty : String(value).length !== 0
                };
            });
            return profileInfoArray;
        };
        
        var _getStoriesInfo = function(database, charName) {
            "use strict";
            return R.values(database.Stories).filter(function(story){
                return story.characters[charName];
            }).map(function(story){
                return {
                    name: story.name,
                    eventsInfo: _getStoryEventsInfo(story, charName, database.Meta.date)
                };
            }).sort(CommonUtils.charOrdAFactory(function(a){
                return a.name.toLowerCase();
            }));
        };
        
        var _getEventsInfo = function(database, charName) {
            "use strict";
            var eventsInfo = R.values(database.Stories).filter(function(story){
                return story.characters[charName];
            }).map(function(story){
                return _getStoryEventsInfo(story, charName, database.Meta.date);
            });
                
            eventsInfo = eventsInfo.reduce(function(result, array){
                return result.concat(array);
            }, []);

            eventsInfo.sort(CommonUtils.eventsByTime);
    
            return eventsInfo;
        };
        
        var _getStoryEventsInfo = function(story, charName, defaultTime){
            "use strict";
            return story.events.filter(function(event) {
                return event.characters[charName];
            }).map(_makeEventInfo(charName, story.name, defaultTime));
        }
        
        var _makeEventInfo = R.curry(function(charName, storyName, defaultTime, event) {
            "use strict";
            var eventInfo = {};
            if (event.characters[charName].text !== "") {
                eventInfo.text = event.characters[charName].text;
            } else {
                eventInfo.text = event.text;
            }
            eventInfo.splittedText = _splitText(eventInfo.text);
            eventInfo.time = event.time === '' ? defaultTime : event.time;
            if (event.characters[charName].time !== "") {
                eventInfo.displayTime = event.characters[charName].time;
            } else {
                eventInfo.displayTime = eventInfo.time;
            }
            eventInfo.name = event.name;
            eventInfo.storyName = storyName;
            return eventInfo;
        });
        
        var _splitText = function(text){
            return text.split("\n").map(function(string){
                return {string:string}
            });
        };
    };
    callback(briefingExportAPI);

})(function(api){
    typeof exports === 'undefined'? this['briefingExportAPI'] = api: module.exports = api;
}.bind(this));
