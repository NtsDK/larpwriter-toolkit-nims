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


//events
RemoteDBMS.prototype.getFilteredStoryNames = function (showOnlyUnfinishedStories, callback){
    "use strict";
    RemoteDBMS._simpleGet("getFilteredStoryNames", [showOnlyUnfinishedStories],  callback);
};

//events
RemoteDBMS.prototype.getFilteredCharacterNames = function (storyName, showOnlyUnfinishedStories, callback){
    "use strict";
    RemoteDBMS._simpleGet("getFilteredCharacterNames", [storyName, showOnlyUnfinishedStories],  callback);
};

//events
RemoteDBMS.prototype.getEvents = function(storyName, characterNames, callback){
    "use strict";
    RemoteDBMS._simpleGet("getEvents", [storyName, characterNames], callback);
};

// preview, events
RemoteDBMS.prototype.setEventText = function(storyName, eventIndex, characterName, text){
    "use strict";
    RemoteDBMS._simplePut("setEventText", [storyName, eventIndex, characterName, text]);
};

// events
RemoteDBMS.prototype.changeAdaptationReadyStatus = function(storyName, eventIndex, characterName, value){
    "use strict";
    RemoteDBMS._simplePut("changeAdaptationReadyStatus", [storyName, eventIndex, characterName, value]);
};
