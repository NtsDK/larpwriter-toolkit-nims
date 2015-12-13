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
    RemoteDBMS._simpleGet("getMasterStory", {
        storyName:storyName
    },  callback);
//    callback(this.database.Stories[storyName].story);
};
//stories
RemoteDBMS.prototype.updateMasterStory = function(storyName, value){
    "use strict";
    RemoteDBMS._simplePut("updateMasterStory", {
        storyName: storyName, 
        value:value
    });
//    this.database.Stories[storyName].story = value;
};

//stories
RemoteDBMS.prototype.isStoryExist = function(storyName, callback){
    "use strict";
    RemoteDBMS._simpleGet("isStoryExist", {
        storyName:storyName
    },  callback);
//    callback(this.database.Stories[storyName]);
};
// stories
RemoteDBMS.prototype.createStory = function(storyName, callback){
    "use strict";
    RemoteDBMS._simplePut("createStory", {
        storyName: storyName
    }, callback);
//    this.database.Stories[storyName] = {
//            name : storyName,
//            story : "",
//            characters : {},
//            events : []
//    };
//    callback();
};
// stories
RemoteDBMS.prototype.renameStory = function(fromName, toName, callback){
    "use strict";
    RemoteDBMS._simplePut("renameStory", {
        fromName: fromName,
        toName: toName
    }, callback);
//    var data = this.database.Stories[fromName];
//    data.name = toName;
//    this.database.Stories[toName] = data;
//    delete this.database.Stories[fromName];
//    callback();
};

// stories
RemoteDBMS.prototype.removeStory = function(name, callback){
    "use strict";
    RemoteDBMS._simplePut("removeStory", {
        name: name
    }, callback);
//    delete this.database.Stories[name];
//    callback();
};

//event presence
RemoteDBMS.prototype.addCharacterToEvent = function(storyName, eventIndex, characterName){
    "use strict";
    RemoteDBMS._simplePut("addCharacterToEvent", {
        storyName: storyName,
        eventIndex: eventIndex,
        characterName: characterName
    });
//    this.database.Stories[storyName].events[eventIndex].characters[characterName] = {
//        text : ""
//    };
};

// event presence
RemoteDBMS.prototype.removeCharacterFromEvent = function(storyName, eventIndex, characterName){
    "use strict";
    RemoteDBMS._simplePut("removeCharacterFromEvent", {
        storyName: storyName,
        eventIndex: eventIndex,
        characterName: characterName
    });
//    delete this.database.Stories[storyName].events[eventIndex].characters[characterName];
};

//event presence
RemoteDBMS.prototype.getStoryCharacterNamesArray = function (storyName, callback) {
    "use strict";
    RemoteDBMS._simpleGet("getStoryCharacterNamesArray", {
        storyName:storyName
    },  callback);
//    var localCharacters;
//    localCharacters = this.database.Stories[storyName].characters;
//    
//    callback(Object.keys(localCharacters).sort(Utils.charOrdA));
};

//story events, event presence
RemoteDBMS.prototype.getStoryEvents = function(storyName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getStoryEvents", {
        storyName:storyName
    },  callback);
//    callback(this.database.Stories[storyName].events);
};

//story characters
RemoteDBMS.prototype.getStoryCharacters = function(storyName, callback){
    "use strict";
    RemoteDBMS._simpleGet("getStoryCharacters", {
        storyName:storyName
    },  callback);
//    callback(this.database.Stories[storyName].characters);
};


//story characters
RemoteDBMS.prototype.addStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    RemoteDBMS._simplePut("addStoryCharacter", {
        storyName: storyName,
        characterName: characterName
    }, callback);
    
//    this.database.Stories[storyName].characters[characterName] = {
//            name : characterName,
//            inventory : "",
//            activity: {}
//    };
//    
//    callback();
};

//story characters
RemoteDBMS.prototype.switchStoryCharacters = function(storyName, fromName, toName, callback){
    "use strict";
    RemoteDBMS._simplePut("switchStoryCharacters", {
        storyName: storyName,
        fromName: fromName,
        toName: toName
    }, callback);
    
//    var story = this.database.Stories[storyName];
//    story.characters[toName] = story.characters[fromName];
//    story.characters[toName].name = toName;
//    delete story.characters[fromName];
//    story.events.forEach(function (event) {
//        if (event.characters[fromName]) {
//            event.characters[fromName].name = toName;
//            event.characters[toName] = event.characters[fromName];
//            delete event.characters[fromName];
//        }
//    });
//    
//    callback();
};

//story characters
RemoteDBMS.prototype.removeStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    RemoteDBMS._simplePut("removeStoryCharacter", {
        storyName: storyName,
        characterName: characterName
    }, callback);
    
//    var story = this.database.Stories[storyName];
//    delete story.characters[characterName];
//    story.events.forEach(function (event) {
//        delete event.characters[characterName];
//    });
//    
//    callback();
};

//story characters
RemoteDBMS.prototype.updateCharacterInventory = function(storyName, characterName, inventory){
    "use strict";
    RemoteDBMS._simplePut("updateCharacterInventory", {
        storyName: storyName,
        characterName: characterName,
        inventory: inventory
    });
//    this.database.Stories[storyName].characters[characterName].inventory = inventory;
};

//story characters
RemoteDBMS.prototype.onChangeCharacterActivity = function(storyName, characterName, activityType, checked){
    "use strict";
    RemoteDBMS._simplePut("onChangeCharacterActivity", {
        storyName: storyName,
        characterName: characterName,
        activityType: activityType,
        checked: checked
    });
//    var character = this.database.Stories[storyName].characters[characterName];
//    if (checked) {
//        character.activity[activityType] = true;
//    } else {
//        delete character.activity[activityType];
//    }
};

//story events
RemoteDBMS.prototype.createEvent = function(storyName, eventName, eventText, toEnd, selectedIndex, callback){
    "use strict";
    RemoteDBMS._simplePut("createEvent", {
        storyName: storyName,
        eventName: eventName,
        eventText: eventText,
        toEnd: toEnd,
        selectedIndex:selectedIndex
    }, callback);
//    var event = {
//        name : eventName,
//        text : eventText,
//        time : "",
//        characters : {}
//    };
//    if (toEnd) {
//        this.database.Stories[storyName].events.push(event);
//    } else {
//        this.database.Stories[storyName].events.splice(selectedIndex, 0, event);
//    }
//    callback();
};

//story events
RemoteDBMS.prototype.swapEvents = function(storyName, index1, index2, callback){
    "use strict";
    RemoteDBMS._simplePut("swapEvents", {
        storyName: storyName,
        index1: index1,
        index2: index2
    }, callback);
//    var story = this.database.Stories[storyName];
//    var tmp = story.events[index1];
//    story.events[index1] = story.events[index2];
//    story.events[index2] = tmp;
//    
//    callback();
};

//story events
RemoteDBMS.prototype.cloneEvent = function(storyName, index, callback){
    "use strict";
    RemoteDBMS._simplePut("cloneEvent", {
        storyName: storyName,
        index: index
    }, callback);
//    var story = this.database.Stories[storyName];
//    var event = story.events[index];
//    var copy = Utils.clone(event);
//    
//    story.events.splice(index, 0, copy);
//    
//    callback();
};

//story events
RemoteDBMS.prototype.mergeEvents = function(storyName, index, callback){
    "use strict";
    RemoteDBMS._simplePut("mergeEvents", {
        storyName: storyName,
        index: index
    }, callback);
//    var story = this.database.Stories[storyName];
//
//    var event1 = story.events[index];
//    var event2 = story.events[index + 1];
//    
//    event1.name += event2.name;
//    event1.text += event2.text;
//    for ( var characterName in event2.characters) {
//        if (event1.characters[characterName]) {
//            event1.characters[characterName].text += event2.characters[characterName].text;
//            event1.characters[characterName].ready = false;
//        } else {
//            event1.characters[characterName] = event2.characters[characterName];
//        }
//    }
////    story.events.remove(index + 1);
//    Utils.removeFromArrayByIndex(story.events, index + 1);
//    
//    callback();
};

//story events
RemoteDBMS.prototype.removeEvent = function(storyName, index, callback){
    "use strict";
    RemoteDBMS._simplePut("removeEvent", {
        storyName: storyName,
        index: index
    }, callback);
//    var story = this.database.Stories[storyName];
////    story.events.remove(index);
//    Utils.removeFromArrayByIndex(story.events, index);
//    callback();
};

// story events
RemoteDBMS.prototype.updateEventProperty = function(storyName, index, property, value, callback){
    "use strict";
    RemoteDBMS._simplePut("updateEventProperty", {
        storyName: storyName,
        index: index,
        property: property,
        value: value
    }, callback);
//    var story = this.database.Stories[storyName].events[index][property] = value;
//    if(callback)callback();
};
