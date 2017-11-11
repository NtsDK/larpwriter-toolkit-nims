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

    function briefingExportAPI(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var Constants     = opts.Constants   ;
        var dbmsUtils     = opts.dbmsUtils   ;
        
        var check = function(selChars, selStories, exportOnlyFinishedStories, database){
            var charsCheck = PC.eitherCheck(PC.chainCheck([PC.isArray(selChars), PC.entitiesExist(selChars, R.keys(database.Characters))]), PC.isNil(selChars));
            var storiesCheck = PC.eitherCheck(PC.chainCheck([PC.isArray(selStories), PC.entitiesExist(selStories, R.keys(database.Stories))]), PC.isNil(selStories));
            return PC.chainCheck([charsCheck, storiesCheck, PC.isBoolean(exportOnlyFinishedStories)]);
        };
        
        LocalDBMS.prototype.getBriefingData = function(selCharacters, selStories, exportOnlyFinishedStories, callback) {
            PC.precondition(check(selCharacters, selStories, exportOnlyFinishedStories, this.database), callback, () => {
                var that = this;
                selCharacters = selCharacters || R.keys(this.database.Characters);
                selStories = selStories || R.keys(this.database.Stories);
                that.getAllCharacterGroupTexts(function(err, groupTexts){
                    if(err) {callback(err); return;}
                    _getBriefingData(that.database, selCharacters, selStories, groupTexts, exportOnlyFinishedStories, callback);
                });
            });
        };
        
        var _getBriefingData = function(database, selectedCharacters, selectedStories, groupTexts, exportOnlyFinishedStories, callback) {
            var charArray = selectedCharacters.map(function(charName){
                groupTexts[charName].forEach(function(groupText){
                    groupText.splittedText = _splitText(groupText.text);
                });
                var dataObject = {
                    "gameName" : database.Meta.name,
                    "charName" : charName,
                    "inventory" : _makeCharInventory(database, charName),
                    "storiesInfo" : _getStoriesInfo(database, charName, selectedStories, exportOnlyFinishedStories),
                    "eventsInfo" : _getEventsInfo(database, charName, selectedStories, exportOnlyFinishedStories),
                    "groupTexts" : groupTexts[charName],
                    "relations" : _makeRelationsInfo(dbmsUtils._getKnownCharacters(database, charName), database, charName)
                };
                
                dataObject = R.merge(dataObject, _makeProfileInfo(charName, 'character', database));
                
                let playerName = database.ProfileBindings[charName];
                if(playerName !== undefined){
                    dataObject = R.merge(dataObject, _makeProfileInfo(playerName, 'player', database));
                }
                
                return dataObject;
            });
            
            charArray.sort(CU.charOrdAFactory(R.prop('charName')));
            callback(null, {
                briefings : charArray,
                gameName : database.Meta.name
            });
        };
        
        var _makeProfileInfo = function(profileName, profileType, database){
            var profileStructure, prefix, profile;
            if(profileType === 'character'){
                profileStructure = database.CharacterProfileStructure;
                prefix = 'profileInfo';
                profile = database.Characters[profileName];
            } else if(profileType === 'player'){
                profileStructure = database.PlayerProfileStructure;
                prefix = 'playerInfo';
                profile = database.Players[profileName];
            } else {
                throw new Error('Unexpected profile type ' + profileType)
            }
            var dataObject = {};
            dataObject[prefix + 'Array'] = _getProfileInfoArray(profile, profileStructure);
            dataObject = R.merge(dataObject, _getSimpleProfileInfoObject(prefix + "-", profile, profileStructure));
            dataObject = R.merge(dataObject, _getSplittedProfileInfoObject(prefix + "-splitted-", profile, profileStructure));
            dataObject = R.merge(dataObject, _getProfileInfoNotEmpty(prefix + "-notEmpty-", profile, profileStructure));
            return dataObject;
        };
        
        var _makeRelationsInfo = function(knownCharacters, database, charName){
            var relations = database.Relations[charName];
            var profiles = database.Characters;
            return R.keys(relations).map(function(toCharacter){
                var obj = {
                    toCharacter: toCharacter, 
                    text: relations[toCharacter],
                    splittedText: _splitText(relations[toCharacter]),
                    stories: R.keys(knownCharacters[toCharacter] || {}).join(', ')
                };
                obj = R.merge(obj, _makeProfileInfo(toCharacter, 'character', database));
                return obj;
            }).sort(CU.charOrdAFactory(R.prop('toCharacter')));
        };
        
        var _makeCharInventory = function(database, charName){
            return R.values(database.Stories).filter(story => !R.isNil(story.characters[charName]) && !R.isEmpty(story.characters[charName].inventory))
                .map(story => story.characters[charName].inventory).join(", ");
        };
    
        var _processProfileInfo = R.curry(function(processor, prefix, profile, profileStructure) {
            return R.fromPairs(profileStructure.map((element) => {
                return [prefix + element.name, processor(profile[element.name])];
            }));
        });
        
        var _getProfileInfoNotEmpty = _processProfileInfo((el) => String(el).length !== 0);
        var _getSimpleProfileInfoObject = _processProfileInfo((el) => (el));
        var _getSplittedProfileInfoObject = _processProfileInfo((el) => (_splitText(String(el))));
        
        var _getProfileInfoArray = function(profile, profileStructure) {
            var value, splittedText;
            var filter = R.compose(R.equals(true), R.prop('doExport'));
            return profileStructure.filter(filter).map(function(element) {
                value = profile[element.name];
                return {
                    itemName : element.name,
                    value : value,
                    splittedText : _splitText(String(value)),
                    notEmpty : String(value).length !== 0
                };
            });
        };
        
        var _getStoriesInfo = function(database, charName, selectedStories, exportOnlyFinishedStories) {
            return R.values(database.Stories).filter(function(story){
                if(!R.contains(story.name, selectedStories)) return false;
                if(exportOnlyFinishedStories){
                    if(!dbmsUtils._isStoryFinished(database, story.name) || dbmsUtils._isStoryEmpty(database, story.name)){
                        return false;
                    }
                }
                return story.characters[charName];
            }).map(function(story){
                return {
                    storyName: story.name,
                    eventsInfo: _getStoryEventsInfo(story, charName, database.Meta.date)
                };
            }).sort(CU.charOrdAFactory(function(a){
                return a.storyName.toLowerCase();
            }));
        };
        
        var _getEventsInfo = function(database, charName, selectedStories, exportOnlyFinishedStories) {
            var eventsInfo = R.values(database.Stories).filter(function(story){
                if(!R.contains(story.name, selectedStories)) return false;
                if(exportOnlyFinishedStories){
                    if(!dbmsUtils._isStoryFinished(database, story.name) || dbmsUtils._isStoryEmpty(database, story.name)){
                        return false;
                    }
                }
                return story.characters[charName];
            }).map(function(story){
                return _getStoryEventsInfo(story, charName, database.Meta.date);
            });
                
            eventsInfo = eventsInfo.reduce(function(result, array){
                return result.concat(array);
            }, []);

            eventsInfo.sort(CU.eventsByTime);
    
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
            eventInfo.eventName = event.name;
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
