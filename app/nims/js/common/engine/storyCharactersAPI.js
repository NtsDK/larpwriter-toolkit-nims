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

    function storyCharactersAPI(LocalDBMS, opts) {

        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var Errors        = opts.Errors      ;
        var listeners     = opts.listeners   ;
        var Constants     = opts.Constants   ;

        //event presence
        LocalDBMS.prototype.getStoryCharacterNamesArray = function (storyName, callback) {
            PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), callback, () => {
                var localCharacters = this.database.Stories[storyName].characters;
                callback(null,  Object.keys(localCharacters).sort(CU.charOrdA));
            });
        };

        //story characters
        LocalDBMS.prototype.getStoryCharacters = function(storyName, callback){
            PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), callback, () => {
                callback(null,  CU.clone(this.database.Stories[storyName].characters));
            });
        };

        //story characters
        LocalDBMS.prototype.addStoryCharacter = function(storyName, characterName, callback){
            var chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.entityExistsCheck(characterName, R.keys(this.database.Characters))];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                PC.precondition(PC.entityIsNotUsed(characterName, R.keys(story.characters)), callback, () => {
                    story.characters[characterName] = {
                            name : characterName,
                            inventory : "",
                            activity: {}
                    };

                    callback();
                });
            });
        };

        //story characters
        LocalDBMS.prototype.switchStoryCharacters = function(storyName, fromName, toName, callback){
            var cond = PC.entityExistsCheck(storyName, R.keys(this.database.Stories));
            PC.precondition(cond, callback, () => {
                var story = this.database.Stories[storyName];
                cond = PC.switchEntityCheck(fromName, toName, R.keys(this.database.Characters), R.keys(story.characters))
                PC.precondition(cond, callback, () => {

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
                });
            });
        };

        //story characters
        LocalDBMS.prototype.removeStoryCharacter = function(storyName, characterName, callback){
            var cond = PC.entityExistsCheck(storyName, R.keys(this.database.Stories));
            PC.precondition(cond, callback, () => {
                var story = this.database.Stories[storyName];
                PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), callback, () => {
                    delete story.characters[characterName];
                    story.events.forEach(function (event) {
                        delete event.characters[characterName];
                    });
                    callback();
                });
            });
        };

        // story characters
        LocalDBMS.prototype.updateCharacterInventory = function(storyName, characterName, inventory, callback){
            var chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(inventory)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), callback, () => {
                    story.characters[characterName].inventory = inventory;
                    callback();
                });
            });
        };

        //story characters
        LocalDBMS.prototype.onChangeCharacterActivity = function(storyName, characterName, activityType, checked, callback){
            var chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(activityType),
                        PC.elementFromEnum(activityType, Constants.characterActivityTypes) , PC.isBoolean(checked)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), callback, () => {
                    var character = story.characters[characterName];
                    if (checked) {
                        character.activity[activityType] = true;
                    } else {
                        delete character.activity[activityType];
                    }
                    callback();
                });
            });
        };

        //event presence
        LocalDBMS.prototype.addCharacterToEvent = function(storyName, eventIndex, characterName, callback){
            var chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(eventIndex)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                chain = [PC.entityExistsCheck(characterName, R.keys(story.characters)), PC.isInRange(eventIndex, 0, story.events.length - 1)];
                PC.precondition(PC.chainCheck(chain), callback, () => {
                    var event = story.events[eventIndex];
                    PC.precondition(PC.entityIsNotUsed(characterName, R.keys(event.characters)), callback, () => {
                        event.characters[characterName] = {
                            text : "",
                            time : ""
                        };
                        callback();
                    });
                });
            });
        };

        // event presence
        LocalDBMS.prototype.removeCharacterFromEvent = function(storyName, eventIndex, characterName, callback){
            var chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(eventIndex)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                chain = [PC.entityExistsCheck(characterName, R.keys(story.characters)), PC.isInRange(eventIndex, 0, story.events.length - 1)];
                PC.precondition(PC.chainCheck(chain), callback, () => {
                    var event = story.events[eventIndex];
                    PC.precondition(PC.entityExists(characterName, R.keys(event.characters)), callback, () => {
                        delete this.database.Stories[storyName].events[eventIndex].characters[characterName];
                        callback();
                    });
                });
            });
        };

        var _renameCharacterInStories = function(type, fromName, toName){
            if(type === 'player') return;
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

        listeners.renameProfile = listeners.renameProfile || [];
        listeners.renameProfile.push(_renameCharacterInStories);

        var _removeCharacterFromStories = function(type, characterName){
            if(type === 'player') return;
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

        listeners.removeProfile = listeners.removeProfile || [];
        listeners.removeProfile.push(_removeCharacterFromStories);
    };
    callback(storyCharactersAPI);

})(function(api){
    typeof exports === 'undefined'? this['storyCharactersAPI'] = api: module.exports = api;
}.bind(this));
