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

//stories
RemoteDBMS.prototype.getMasterStory = function(storyName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getMasterStory", [storyName],  callback);
};
//stories
RemoteDBMS.prototype.updateMasterStory = function(storyName, value){
    "use strict";
    RemoteDBMS._simplePut("updateMasterStory", [storyName, value]);
};

//stories
RemoteDBMS.prototype.isStoryExist = function(storyName, callback){
    "use strict";
    RemoteDBMS._simpleGet("isStoryExist", [storyName],  callback);
};
// stories
RemoteDBMS.prototype.createStory = function(storyName, callback){
    "use strict";
    RemoteDBMS._simplePut("createStory", [storyName], callback);
};
// stories
RemoteDBMS.prototype.renameStory = function(fromName, toName, callback){
    "use strict";
    RemoteDBMS._simplePut("renameStory", [fromName, toName], callback);
};

// stories
RemoteDBMS.prototype.removeStory = function(name, callback){
    "use strict";
    RemoteDBMS._simplePut("removeStory", [name], callback);
};

//event presence
RemoteDBMS.prototype.addCharacterToEvent = function(storyName, eventIndex, characterName){
    "use strict";
    RemoteDBMS._simplePut("addCharacterToEvent", [storyName, eventIndex, characterName]);
};

// event presence
RemoteDBMS.prototype.removeCharacterFromEvent = function(storyName, eventIndex, characterName){
    "use strict";
    RemoteDBMS._simplePut("removeCharacterFromEvent", [storyName, eventIndex, characterName]);
};

//event presence
RemoteDBMS.prototype.getStoryCharacterNamesArray = function (storyName, callback) {
    "use strict";
    RemoteDBMS._simpleGet("getStoryCharacterNamesArray", [storyName],  callback);
};

//story events, event presence
RemoteDBMS.prototype.getStoryEvents = function(storyName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getStoryEvents", [storyName],  callback);
};

//story characters
RemoteDBMS.prototype.getStoryCharacters = function(storyName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getStoryCharacters", [storyName],  callback);
};


//story characters
RemoteDBMS.prototype.addStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    RemoteDBMS._simplePut("addStoryCharacter", [storyName, characterName], callback);
};

//story characters
RemoteDBMS.prototype.switchStoryCharacters = function(storyName, fromName, toName, callback){
    "use strict";
    RemoteDBMS._simplePut("switchStoryCharacters", [storyName, fromName, toName], callback);
};

//story characters
RemoteDBMS.prototype.removeStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    RemoteDBMS._simplePut("removeStoryCharacter", [storyName, characterName], callback);
};

//story characters
RemoteDBMS.prototype.updateCharacterInventory = function(storyName, characterName, inventory){
    "use strict";
    RemoteDBMS._simplePut("updateCharacterInventory", [storyName, characterName, inventory]);
};

//story characters
RemoteDBMS.prototype.onChangeCharacterActivity = function(storyName, characterName, activityType, checked){
    "use strict";
    RemoteDBMS._simplePut("onChangeCharacterActivity", [storyName, characterName, activityType, checked]);
};

//story events
RemoteDBMS.prototype.createEvent = function(storyName, eventName, eventText, toEnd, selectedIndex, callback){
    "use strict";
    RemoteDBMS._simplePut("createEvent", [storyName, eventName, eventText, toEnd, selectedIndex], callback);
};

//story events
RemoteDBMS.prototype.swapEvents = function(storyName, index1, index2, callback){
    "use strict";
    RemoteDBMS._simplePut("swapEvents", [storyName, index1, index2], callback);
};

//story events
RemoteDBMS.prototype.cloneEvent = function(storyName, index, callback){
    "use strict";
    RemoteDBMS._simplePut("cloneEvent", [storyName, index], callback);
};

//story events
RemoteDBMS.prototype.mergeEvents = function(storyName, index, callback){
    "use strict";
    RemoteDBMS._simplePut("mergeEvents", [storyName, index], callback);
};

//story events
RemoteDBMS.prototype.removeEvent = function(storyName, index, callback){
    "use strict";
    RemoteDBMS._simplePut("removeEvent", [storyName, index], callback);
};

// story events
RemoteDBMS.prototype.updateEventProperty = function(storyName, index, property, value, callback){
    "use strict";
    RemoteDBMS._simplePut("updateEventProperty", [storyName, index, property, value], callback);
};
