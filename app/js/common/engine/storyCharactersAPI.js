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

    function storyCharactersAPI(LocalDBMS, R, CommonUtils, Errors, listeners) {
        
        //event presence
        LocalDBMS.prototype.getStoryCharacterNamesArray = function (storyName, callback) {
            "use strict";
            var localCharacters = this.database.Stories[storyName].characters;
            callback(null,  Object.keys(localCharacters).sort(CommonUtils.charOrdA));
        };
    
        //story characters
        LocalDBMS.prototype.getStoryCharacters = function(storyName, callback){
            "use strict";
            callback(null,  CommonUtils.clone(this.database.Stories[storyName].characters));
        };
    
    
        //story characters
        LocalDBMS.prototype.addStoryCharacter = function(storyName, characterName, callback){
            "use strict";

            if (characterName === "") {
                callback(new Errors.ValidationError("stories-character-name-is-not-specified"));
                return;
            }
            
            this.database.Stories[storyName].characters[characterName] = {
                    name : characterName,
                    inventory : "",
                    activity: {}
            };
            
            callback();
        };
    
        //story characters
        LocalDBMS.prototype.switchStoryCharacters = function(storyName, fromName, toName, callback){
            "use strict";
            
            if (fromName === "" || toName === "") {
                callback(new Errors.ValidationError("stories-one-of-switch-characters-is-not-specified"));
                return;
            }
            
            var story = this.database.Stories[storyName];
            story.characters[toName] = story.characters[fromName];
            story.characters[toName].name = toName;
            delete story.characters[fromName];
            
            story.events.forEach(function (event) {
                if (event.characters[fromName]) {
                    event.characters[toName] = event.characters[fromName];
                    delete event.characters[fromName];
                }
            });
            
            callback();
        };
    
        //story characters
        LocalDBMS.prototype.removeStoryCharacter = function(storyName, characterName, callback){
            "use strict";
            
            if (characterName === "") {
                callback(new Errors.ValidationError("stories-character-name-is-not-specified"));
                return;
            }
            
            var story = this.database.Stories[storyName];
            delete story.characters[characterName];
            
            story.events.forEach(function (event) {
                delete event.characters[characterName];
            });
            
            callback();
        };
        
        var _renameCharacterInStories = function(fromName, toName){
            "use strict";
            var storyName, story, data;

            var renameEventCharacter = function(event) {
                if (event.characters[fromName]) {
                    data = event.characters[fromName];
                    event.characters[toName] = data;
                    delete event.characters[fromName];
                }
            };

            for (storyName in this.database.Stories) {
                story = this.database.Stories[storyName];
                if (story.characters[fromName]) {
                    data = story.characters[fromName];
                    data.name = toName;
                    story.characters[toName] = data;
                    delete story.characters[fromName];

                    story.events.forEach(renameEventCharacter);
                }
            }
        };
        
        listeners.renameCharacter = listeners.renameCharacter || [];
        listeners.renameCharacter.push(_renameCharacterInStories);
        
        var _removeCharacterFromStories = function(characterName){
            "use strict";
            var storyName, story;

            var cleanEvent = function(event) {
                if (event.characters[characterName]) {
                    delete event.characters[characterName];
                }
            };

            for (storyName in this.database.Stories) {
                story = this.database.Stories[storyName];
                if (story.characters[characterName]) {
                    delete story.characters[characterName];
                    story.events.forEach(cleanEvent);
                }
            }
        };
        
        listeners.removeCharacter = listeners.removeCharacter || [];
        listeners.removeCharacter.push(_removeCharacterFromStories);
    
        // story characters
        LocalDBMS.prototype.updateCharacterInventory = function(storyName, characterName, inventory, callback){
            "use strict";
            this.database.Stories[storyName].characters[characterName].inventory = inventory;
            callback();
        };
    
        //story characters
        LocalDBMS.prototype.onChangeCharacterActivity = function(storyName, characterName, activityType, checked, callback){
            "use strict";
            var character = this.database.Stories[storyName].characters[characterName];
            if (checked) {
                character.activity[activityType] = true;
            } else {
                delete character.activity[activityType];
            }
            callback();
        };
        
        //event presence
        LocalDBMS.prototype.addCharacterToEvent = function(storyName, eventIndex, characterName, callback){
            "use strict";
            this.database.Stories[storyName].events[eventIndex].characters[characterName] = {
                text : "",
                time : ""
            };
            callback();
        };
    
        // event presence
        LocalDBMS.prototype.removeCharacterFromEvent = function(storyName, eventIndex, characterName, callback){
            "use strict";
            delete this.database.Stories[storyName].events[eventIndex].characters[characterName];
            callback();
        };
    };
    callback(storyCharactersAPI);

})(function(api){
    typeof exports === 'undefined'? this['storyCharactersAPI'] = api: module.exports = api;
}.bind(this));

