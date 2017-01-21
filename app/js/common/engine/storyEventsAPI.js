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

    function storyEventsAPI(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var Errors        = opts.Errors      ;
        
        //story events, event presence
        LocalDBMS.prototype.getStoryEvents = function(storyName, callback){
            CU.precondition(CU.entityExistsCheck(storyName, R.keys(this.database.Stories)), callback, () => {
                callback(null,  CU.clone(this.database.Stories[storyName].events));
            });
        };
        
        //story events
        LocalDBMS.prototype.createEvent = function(storyName, eventName, eventText, selectedIndex, callback){
            var chain = [CU.entityExistsCheck(storyName, R.keys(this.database.Stories)), CU.isNumber(selectedIndex), 
                         CU.isString(eventName), CU.isNotEmptyString(eventName), CU.isString(eventText), CU.isNotEmptyString(eventText)];
            CU.precondition(CU.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                CU.precondition(CU.isInRange(selectedIndex, 0, story.events.length), callback, () => {
                    var event = {
                        name : eventName,
                        text : eventText,
                        time : "",
                        characters : {}
                    };
                    story.events.splice(selectedIndex, 0, event);
                    callback();
                });
            });
        };
    
        //story events
        LocalDBMS.prototype.moveEvent = function(storyName, index, newIndex, callback){
            var chain = [CU.entityExistsCheck(storyName, R.keys(this.database.Stories)),CU.isNumber(index),CU.isNumber(newIndex)];
            CU.precondition(CU.chainCheck(chain), callback, () => {
                var events = this.database.Stories[storyName].events;
                chain = [CU.isInRange(index, 0, events.length-1), CU.isInRange(newIndex, 0, events.length)];
                CU.precondition(CU.chainCheck(chain), callback, () => {
                    if(newIndex > index){
                        newIndex--;
                    }
                    var tmp = events[index];
                    events.splice(index, 1);
                    events.splice(newIndex, 0, tmp);
                    callback();
                });
            });
        };
    
        //story events
        LocalDBMS.prototype.cloneEvent = function(storyName, index, callback){
            var chain = [CU.entityExistsCheck(storyName, R.keys(this.database.Stories)),CU.isNumber(index)];
            CU.precondition(CU.chainCheck(chain), callback, () => {
                var events = this.database.Stories[storyName].events;
                chain = [CU.isInRange(index, 0, events.length-1)];
                CU.precondition(CU.chainCheck(chain), callback, () => {
                    events.splice(index, 0, CU.clone(events[index]));
                    callback();
                });
            });
        };
    
        //story events
        LocalDBMS.prototype.mergeEvents = function(storyName, index, callback){
            var chain = [CU.entityExistsCheck(storyName, R.keys(this.database.Stories)),CU.isNumber(index)];
            CU.precondition(CU.chainCheck(chain), callback, () => {
                var events = this.database.Stories[storyName].events;
                chain = [CU.isInRange(index, 0, events.length-2)];
                CU.precondition(CU.chainCheck(chain), callback, () => {
                    var event1 = events[index];
                    var event2 = events[index + 1];
                    
                    event1.name += '/' + event2.name;
                    event1.text += '\n\n' + event2.text;
                    for ( var characterName in event2.characters) {
                        if (event1.characters[characterName]) {
                            event1.characters[characterName].text += '\n\n' + event2.characters[characterName].text;
                            event1.characters[characterName].time += '/' + event2.characters[characterName].time;
                            event1.characters[characterName].ready = false;
                        } else {
                            event1.characters[characterName] = event2.characters[characterName];
                        }
                    }
                    CU.removeFromArrayByIndex(events, index + 1);
                    
                    callback();
                });
            });
        };
    
        //story events
        LocalDBMS.prototype.removeEvent = function(storyName, index, callback){
            var chain = [CU.entityExistsCheck(storyName, R.keys(this.database.Stories)),CU.isNumber(index)];
            CU.precondition(CU.chainCheck(chain), callback, () => {
                var events = this.database.Stories[storyName].events;
                chain = [CU.isInRange(index, 0, events.length-1)];
                CU.precondition(CU.chainCheck(chain), callback, () => {
                    CU.removeFromArrayByIndex(events, index);
                    callback();
                });
            });
        };
    
        // story events, preview, adaptations
        LocalDBMS.prototype.setEventOriginProperty = function(storyName, index, property, value, callback){
            var chain = [CU.entityExistsCheck(storyName, R.keys(this.database.Stories)), CU.isNumber(index), 
                         CU.isString(property), CU.elementFromEnum(property, Constants.originProperties), CU.isString(value)];
            CU.precondition(CU.chainCheck(chain), callback, () => {
                var story = this.database.Stories[storyName];
                chain = [CU.isInRange(index, 0, story.events.length-1)];
                CU.precondition(CU.chainCheck(chain), callback, () => {
                    story.events[index][property] = value;
                    callback();
                });
            });
        };
    };
    callback(storyEventsAPI);

})(function(api){
    typeof exports === 'undefined'? this['storyEventsAPI'] = api: module.exports = api;
}.bind(this));

