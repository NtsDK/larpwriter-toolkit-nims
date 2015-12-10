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
LocalDBMS.prototype.getMasterStory = function(storyName, callback){
    "use strict";
    callback(this.database.Stories[storyName].story);
};
//stories
LocalDBMS.prototype.updateMasterStory = function(storyName, value){
    "use strict";
    this.database.Stories[storyName].story = value;
};

//stories
LocalDBMS.prototype.isStoryExist = function(storyName, onTrue, onFalse){
    "use strict";
    if(this.database.Stories[storyName]){
        if(onTrue)onTrue();
    } else {
        if(onFalse)onFalse();
    }
};
// stories
LocalDBMS.prototype.createStory = function(storyName, callback){
    "use strict";
    this.database.Stories[storyName] = {
            name : storyName,
            story : "",
            characters : {},
            events : []
    };
    callback();
};
// stories
LocalDBMS.prototype.renameStory = function(fromName, toName, callback){
    "use strict";
    var data = this.database.Stories[fromName];
    data.name = toName;
    this.database.Stories[toName] = data;
    delete this.database.Stories[fromName];
    callback();
};

// stories
LocalDBMS.prototype.removeStory = function(name, callback){
    "use strict";
    delete this.database.Stories[name];
    callback();
};

//event presence
LocalDBMS.prototype.addCharacterToEvent = function(storyName, eventIndex, characterName){
    "use strict";
    this.database.Stories[storyName].events[eventIndex].characters[characterName] = {
        text : ""
    };
};

// event presence
LocalDBMS.prototype.removeCharacterFromEvent = function(storyName, eventIndex, characterName){
    "use strict";
    delete this.database.Stories[storyName].events[eventIndex].characters[characterName];
};

//event presence
LocalDBMS.prototype.getStoryCharacterNamesArray = function (storyName) {
    "use strict";
    
    var localCharacters;
    localCharacters = this.database.Stories[storyName].characters;
    
    return Object.keys(localCharacters).sort(Utils.charOrdA);
};

//story events, event presence
LocalDBMS.prototype.getStoryEvents = function(storyName, callback){
    "use strict";
    callback(this.database.Stories[storyName].events);
};

//story characters
LocalDBMS.prototype.getStoryCharacters = function(storyName, callback){
    "use strict";
    callback(this.database.Stories[storyName].characters);
};


//story characters
LocalDBMS.prototype.addStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    
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
    
    var story = this.database.Stories[storyName];
    story.characters[toName] = story.characters[fromName];
    story.characters[toName].name = toName;
    delete story.characters[fromName];
    story.events.forEach(function (event) {
        if (event.characters[fromName]) {
            event.characters[fromName].name = toName;
            event.characters[toName] = event.characters[fromName];
            delete event.characters[fromName];
        }
    });
    
    callback();
};

//story characters
LocalDBMS.prototype.removeStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    
    var story = this.database.Stories[storyName];
    delete story.characters[characterName];
    story.events.forEach(function (event) {
        delete event.characters[characterName];
    });
    
    callback();
};

//story characters
LocalDBMS.prototype.updateCharacterInventory = function(storyName, characterName, inventory){
    "use strict";
    this.database.Stories[storyName].characters[characterName].inventory = inventory;
};

//story characters
LocalDBMS.prototype.onChangeCharacterActivity = function(storyName, characterName, activityType, checked){
    "use strict";
    var character = this.database.Stories[storyName].characters[characterName];
    if (checked) {
        character.activity[activityType] = true;
    } else {
        delete character.activity[activityType];
    }
};

//story events
LocalDBMS.prototype.createEvent = function(storyName, eventName, eventText, toEnd, selectedIndex, callback){
    "use strict";
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
LocalDBMS.prototype.swapEvents = function(storyName, index1, index2, callback){
    "use strict";
    var story = this.database.Stories[storyName];
    var tmp = story.events[index1];
    story.events[index1] = story.events[index2];
    story.events[index2] = tmp;
    
    callback();
};

//story events
LocalDBMS.prototype.cloneEvent = function(storyName, index, callback){
    "use strict";
    var story = this.database.Stories[storyName];
    var event = story.events[index];
    var copy = Utils.clone(event);
    
    story.events.splice(index, 0, copy);
    
    callback();
};

//story events
LocalDBMS.prototype.mergeEvents = function(storyName, index, callback){
    "use strict";
    var story = this.database.Stories[storyName];

    var event1 = story.events[index];
    var event2 = story.events[index + 1];
    
    event1.name += event2.name;
    event1.text += event2.text;
    for ( var characterName in event2.characters) {
        if (event1.characters[characterName]) {
            event1.characters[characterName].text += event2.characters[characterName].text;
            event1.characters[characterName].ready = false;
        } else {
            event1.characters[characterName] = event2.characters[characterName];
        }
    }
    story.events.remove(index + 1);
    
    callback();
};

//story events
LocalDBMS.prototype.removeEvent = function(storyName, index, callback){
    "use strict";
    var story = this.database.Stories[storyName];
    story.events.remove(index);
    callback();
};

// story events
LocalDBMS.prototype.updateEventProperty = function(storyName, index, property, value, callback){
    "use strict";
    var story = this.database.Stories[storyName].events[index][property] = value;
    if(callback)callback();
};
