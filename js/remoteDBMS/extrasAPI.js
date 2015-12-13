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

// preview
RemoteDBMS.prototype.getAllInventoryLists = function(characterName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getAllInventoryLists", {characterName:characterName},  callback);
};

// preview
RemoteDBMS.prototype.getCharacterEventGroupsByStory = function(characterName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getCharacterEventGroupsByStory", {characterName:characterName},  callback);
};

// preview
RemoteDBMS.prototype.getCharacterEventsByTime = function(characterName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getCharacterEventsByTime", {characterName:characterName},  callback);
};

//profile, preview
RemoteDBMS.prototype.getProfile = function(name, callback){
    "use strict";
    RemoteDBMS._simpleGet("getProfile", {name:name},  callback);
//    callback(this.database.Characters[name]);
};
// social network, character filter
RemoteDBMS.prototype.getAllProfiles = function(callback){
    "use strict";
    RemoteDBMS._simpleGet("getAllProfiles", null,  callback);
//    callback(this.database.Characters);
};
// social network
RemoteDBMS.prototype.getAllStories = function(callback){
    "use strict";
    RemoteDBMS._simpleGet("getAllStories", null,  callback);
//    callback(this.database.Stories);
};

// timeline
RemoteDBMS.prototype.getEventGroupsForStories = function(storyNames, callback){
    "use strict";
    RemoteDBMS._simpleGet("getEventGroupsForStories", {storyNames:JSON.stringify(storyNames)},  callback);
};

// timeline
RemoteDBMS.prototype.setEventTime = function(storyName, eventIndex, time){
    "use strict";
    RemoteDBMS._simplePut("setEventTime", {
        storyName: storyName, 
        eventIndex:eventIndex,
        time:time
    });
//    var event = this.database.Stories[storyName].events[eventIndex];
//    event.time = dateFormat(time, "yyyy/mm/dd h:MM");
};
