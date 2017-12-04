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

    function storyAdaptationsAPI(LocalDBMS, opts) {

        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var dbmsUtils     = opts.dbmsUtils   ;
        var Constants     = opts.Constants   ;

        //events
        LocalDBMS.prototype.getFilteredStoryNames = function (showOnlyUnfinishedStories, callback){
            PC.precondition(PC.isBoolean(showOnlyUnfinishedStories), callback, () => {
                var storyArray = Object.keys(this.database.Stories).sort(CU.charOrdA);
                var that = this;
                storyArray = storyArray.map(function(elem){
                    return {
                        storyName: elem,
                        isFinished: _isStoryFinished(that.database, elem),
                        isEmpty: _isStoryEmpty(that.database, elem)
                    }
                });

                if(showOnlyUnfinishedStories){
                    storyArray = storyArray.filter(function(elem){
                        return !elem.isFinished || elem.isEmpty;
                    });
                }
                callback(null, storyArray);
            });
        };

        var _isStoryEmpty = function (database, storyName) {
            return database.Stories[storyName].events.length == 0;
        };

        dbmsUtils._isStoryEmpty = _isStoryEmpty;

        var _isStoryFinished = function (database, storyName) {
            return database.Stories[storyName].events.every(event => !R.isEmpty(event.characters) && R.values(event.characters).every(adaptation => adaptation.ready));
        };

        dbmsUtils._isStoryFinished = _isStoryFinished;

        //adaptations
        LocalDBMS.prototype.getStory = function(storyName, callback){
            var chain = [PC.isString(storyName), PC.entityExists(storyName, R.keys(this.database.Stories))];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                callback(null, CU.clone(this.database.Stories[storyName]));
            });
        };

        var getValueCheck = function(type, value){
            switch(type){
            case 'text':
            case 'time':
                return PC.isString(value);
            case 'ready':
                return PC.isBoolean(value);
            };
            throw new Error('Unexpected type ' + type);
        };

        // preview, events
        LocalDBMS.prototype.setEventAdaptationProperty = function(storyName, eventIndex, characterName, type, value, callback){
            var chain = [PC.isString(storyName), PC.entityExists(storyName, R.keys(this.database.Stories)), PC.isNumber(eventIndex),
                        PC.isString(type), PC.elementFromEnum(type, Constants.adaptationProperties), PC.isString(characterName)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                chain = [PC.entityExists(characterName, R.keys(story.characters)), PC.isInRange(eventIndex, 0, story.events.length-1), getValueCheck(type, value)];
                PC.precondition(PC.chainCheck(chain), callback, () => {
                    var event = story.events[eventIndex];
                    PC.precondition(PC.entityExists(characterName, R.keys(event.characters)), callback, () => {
                        event.characters[characterName][type] = value;
                        callback();
                    });
                });
            });
        };

    };
    callback(storyAdaptationsAPI);

})(function(api){
    typeof exports === 'undefined'? this['storyAdaptationsAPI'] = api: module.exports = api;
}.bind(this));
