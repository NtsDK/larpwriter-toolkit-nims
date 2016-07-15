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

(function(callback){

    function briefingExportAPI(LocalDBMS, CommonUtils, R, Constants) {
    
        LocalDBMS.prototype.getBriefingData = function(selectedCharacters, callback) {
            "use strict";
            var data = {};
    
            var charArray = [];
    
            for ( var charName in this.database.Characters) {
              if(selectedCharacters && !selectedCharacters[charName]){
                continue;
              }
              
                var inventory = [];
                for ( var storyName in this.database.Stories) {
                    var story = this.database.Stories[storyName];
                    if (story.characters[charName] && 
                            story.characters[charName].inventory && 
                            story.characters[charName].inventory !== "") {
                        inventory = inventory.concat(story.characters[charName].inventory);
                    }
                }
                inventory = inventory.join(", ");
    
                var profileInfo = _getProfileInfoObject(this.database, charName);
                var profileInfoArray = _getProfileInfoArray(this.database, charName);
    
                var storiesInfo = _getStoriesInfo(this.database, charName);
                var eventsInfo = _getEventsInfo(this.database, charName);
                var dataObject = {
                    "gameName" : this.database.Meta.name,
                    "name" : charName,
                    "inventory" : inventory,
                    "storiesInfo" : storiesInfo,
                    "eventsInfo" : eventsInfo,
                    "profileInfoArray" : profileInfoArray
                };
    
                for ( var element in profileInfo) {
                    dataObject["profileInfo-" + element] = profileInfo[element];
                }
    
                charArray.push(dataObject);
            }
            
            charArray.sort(CommonUtils.charOrdAFactory(R.prop('name')));
    
            data.briefings = charArray;
            data.gameName = this.database.Meta.name;
            callback(null, data);
        };
    
        var _getProfileInfoObject = function(database, charName) {
            "use strict";
            var character = database.Characters[charName];
            var profileInfo = {};
    
            database.ProfileSettings.forEach(function(element) {
                switch (element.type) {
                case "text":
                case "string":
                case "enum":
                case "number":
                    profileInfo[element.name] = character[element.name];
                    break;
                case "checkbox":
                    profileInfo[element.name] = character[element.name];
                    break;
                }
            });
            return profileInfo;
        };
    
        var _getProfileInfoArray = function(database, charName) {
            "use strict";
            var character = database.Characters[charName];
            var value, splittedText;
            var filter = R.compose(R.equals(true), R.prop('doExport'));
            var profileInfoArray = database.ProfileSettings.filter(filter).map(function(element) {
                switch (element.type) {
                case "text":
                    value = character[element.name];
                    splittedText = _splitText(value);
                    break;
                case "enum":
                case "string":
                case "number":
                    splittedText = value = character[element.name];
                    break;
                case "checkbox":
                    splittedText= value = character[element.name];
                    break;
                }
                return {
                    name : element.name,
                    value : value,
                    splittedText : splittedText
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
