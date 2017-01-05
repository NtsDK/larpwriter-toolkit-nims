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

    function storyEventsAPI(LocalDBMS, R, CommonUtils, Errors) {
        
        //story events, event presence
        LocalDBMS.prototype.getStoryEvents = function(storyName, callback){
            "use strict";
            callback(null,  CommonUtils.clone(this.database.Stories[storyName].events));
        };
        
        //story events
        LocalDBMS.prototype.createEvent = function(storyName, eventName, eventText, toEnd, selectedIndex, callback){
            "use strict";
            if (eventName === "") {
                callback(new Errors.ValidationError("stories-event-name-is-not-specified"));
                return;
            }
            if (eventText === "") {
                callback(new Errors.ValidationError("stories-event-text-is-empty"));
                return;
            }
            
            var event = {
                name : eventName,
                text : eventText,
                time : "",
                characters : {}
            };
            if (toEnd) {
                this.database.Stories[storyName].events.push(event);
            } else {
                this.database.Stories[storyName].events.splice(selectedIndex, 0, event);
            }
            callback();
        };
    
        //story events
        LocalDBMS.prototype.moveEvent = function(storyName, index, newIndex, callback){
            "use strict";
            if(newIndex > index){
                newIndex--;
            }
            var events = this.database.Stories[storyName].events;
            var tmp = events[index];
            events.splice(index, 1);
            events.splice(newIndex, 0, tmp);
            
            callback();
        };
    
        //story events
        LocalDBMS.prototype.cloneEvent = function(storyName, index, callback){
            "use strict";
            var story = this.database.Stories[storyName];
            var event = story.events[index];
            var copy = CommonUtils.clone(event);
            
            story.events.splice(index, 0, copy);
            
            callback();
        };
    
        //story events
        LocalDBMS.prototype.mergeEvents = function(storyName, index, callback){
            "use strict";
            var story = this.database.Stories[storyName];
            if (story.events.length === index + 1) {
                callback(new Errors.ValidationError("stories-cant-merge-last-event"));
                return;
            }
    
            var event1 = story.events[index];
            var event2 = story.events[index + 1];
            
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
            CommonUtils.removeFromArrayByIndex(story.events, index + 1);
            
            callback();
        };
    
        //story events
        LocalDBMS.prototype.removeEvent = function(storyName, index, callback){
            "use strict";
            var story = this.database.Stories[storyName];
            CommonUtils.removeFromArrayByIndex(story.events, index);
            callback();
        };
    
        // story events
        LocalDBMS.prototype.updateEventProperty = function(storyName, index, property, value, callback){
            "use strict";
            if(property === "name" && value.trim() === ""){
                callback(new Errors.ValidationError("stories-event-name-is-not-specified"));
                return;
            }
            if(property === "text" && value.trim() === ""){
                callback(new Errors.ValidationError("stories-event-text-is-empty"));
                return;
            }
            var story = this.database.Stories[storyName].events[index][property] = value;
            callback();
        };
        
//      // timeline
//      // disabled for this moment
//      LocalDBMS.prototype.setEventTime = function(storyName, eventIndex, time, callback) {
//          "use strict";
//  
//          var event = this.database.Stories[storyName].events[eventIndex];
//          event.time = dateFormat(time, "yyyy/mm/dd h:MM");
//          callback();
//      };

     

    };
    callback(storyEventsAPI);

})(function(api){
    typeof exports === 'undefined'? this['storyEventsAPI'] = api: module.exports = api;
}.bind(this));

