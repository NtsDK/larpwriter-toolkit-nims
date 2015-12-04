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

/*global
 Utils, Database, Stories
 */
// БД зависит от Stories - это нехорошо

"use strict";

var DBMS = {};

DBMS.getMetaInfo = function(callback){
    "use strict";
    callback(Database.Meta);
};

DBMS.setMetaInfo = function(name, value){
    "use strict";
    Database.Meta[name] = value;
};

DBMS.isCharacterNameUsed = function(name, callback){
    "use strict";
    callback(Database.Characters[name] !== undefined);
};

DBMS.createCharacter = function (name, callback) {
    "use strict";
    var newCharacter = {
        name : name
    };

    Database.ProfileSettings.forEach(function (profileSettings) {
        if (profileSettings.type === "enum") {
            newCharacter[profileSettings.name] = profileSettings.value.split(",")[0];
        } else {
            newCharacter[profileSettings.name] = profileSettings.value;
        }
    });

    Database.Characters[name] = newCharacter;
    callback();
};

DBMS.renameCharacter = function (fromName, toName, callback) {
    "use strict";
    var data = Database.Characters[fromName];
    data.name = toName;
    Database.Characters[toName] = data;
    delete Database.Characters[fromName];

    var storyName, story;

    var renameEventCharacter = function (event) {
        if (event.characters[fromName]) {
            data = event.characters[fromName];
            event.characters[toName] = data;
            delete event.characters[fromName];
        }
    };

    for (storyName in Database.Stories) {
        story = Database.Stories[storyName];
        if (story.characters[fromName]) {
            data = story.characters[fromName];
            data.name = toName;
            story.characters[toName] = data;
            delete story.characters[fromName];

            story.events.forEach(renameEventCharacter);
        }
    }
    callback();
};

DBMS.removeCharacter = function (name, callback) {
    "use strict";
    delete Database.Characters[name];
    var storyName, story;

    var cleanEvent = function (event) {
        if (event.characters[name]) {
            delete event.characters[name];
        }
    };

    for (storyName in Database.Stories) {
        story = Database.Stories[storyName];
        if (story.characters[name]) {
            delete story.characters[name];
            story.events.forEach(cleanEvent);
        }
    }
    callback();
};



DBMS.getProfile = function(name, callback){
    "use strict";
    callback(name, Database.Characters[name]);
};

DBMS.getAllProfileSettings = function(callback){
    "use strict";
    callback(Database.ProfileSettings);
};

DBMS.updateProfileField = function(characterName, fieldName, type, event){
    "use strict";
    var profileInfo = Database.Characters[characterName];
    switch(type){
    case "text":
    case "string":
    case "enum":
        profileInfo[fieldName] = event.target.value;
        break;
    case "number":
        if (isNaN(event.target.value)) {
            Utils.alert("Введенное значение не является числом.");
            event.target.value = profileInfo[fieldName];
            return;
        }
        profileInfo[fieldName] = Number(event.target.value);
        break;
    case "checkbox":
        profileInfo[fieldName] = event.target.checked;
        break;
    }
};

DBMS.createProfileItem= function(name, type, value, toEnd, selectedIndex, callback){
    "use strict";
    var profileItem = {
        name : name,
        type : type,
        value : value
    };
    
    Object.keys(Database.Characters).forEach(function (characterName) {
        Database.Characters[characterName][name] = value;
    });
    
    if (toEnd) {
        Database.ProfileSettings.push(profileItem);
    } else {
        Database.ProfileSettings.splice(selectedIndex, 0, profileItem);
    }
    callback();
};


DBMS.swapProfileItems = function(index1,index2, callback){
    "use strict";
    var tmp = Database.ProfileSettings[index1];
    Database.ProfileSettings[index1] = Database.ProfileSettings[index2];
    Database.ProfileSettings[index2] = tmp;
    callback();
};

DBMS.removeProfileItem = function(index, name, callback){
    "use strict";
    Object.keys(Database.Characters).forEach(function (characterName) {
        delete Database.Characters[characterName][name];
    });
    Database.ProfileSettings.remove(index);
    callback();
};

DBMS.changeProfileItemType = function(name, newType, callback){
    "use strict";
    
    var profileItem = Database.ProfileSettings.filter(function(elem){
        return elem.name === name;
    })[0];
    
    profileItem.type = newType;
    profileItem.value = CharacterProfileConfigurer.mapping[newType].value;
    
    Object.keys(Database.Characters).forEach(function (characterName) {
        Database.Characters[characterName][name] = CharacterProfileConfigurer.mapping[newType].value;
    });
    callback();
};


DBMS.isProfileItemNameUsed = function(name, onUsed, onUnused){
    "use strict";
    var nameUsedTest = function (profile) {
      return name === profile.name;
    };
    
    if (Database.ProfileSettings.some(nameUsedTest)) {
        if(onUsed) onUsed();
        return;
    } else {
        onUnused();
    }
};

DBMS.renameProfileItem = function(newName, oldName, callback){
    "use strict";
    Object.keys(Database.Characters).forEach(function (characterName) {
        var tmp = Database.Characters[characterName][oldName];
        delete Database.Characters[characterName][oldName];
        Database.Characters[characterName][newName] = tmp;
    });
    
    Database.ProfileSettings.filter(function(elem){
        return elem.name === oldName;
    })[0].name = newName;
    callback();
};

DBMS.updateDefaultValue = function(name, value, callback){
    "use strict";
    
    var info = Database.ProfileSettings.filter(function(elem){
        return elem.name === name;
    })[0];
    
    var oldOptions, newOptions, newOptionsMap, missedValues;
    
    switch (info.type) {
    case "text":
    case "string":
    case "checkbox":
        info.value = value;
        break;
    case "number":
        if (isNaN(value)) {
            Utils.alert("Введено не число");
            callback(info.value);
            return;
        }
        info.value = Number(value);
        break;
    case "enum":
        if (value === "") {
            Utils.alert("Значение поля с единственным выбором не может быть пустым");
            callback(info.value);
            return;
        }
        oldOptions = info.value.split(",");
        newOptions = value.split(",");
        
        newOptions = newOptions.map(function(elem){
            return elem.trim();
        });
        
        newOptionsMap = [{}].concat(newOptions).reduce(function (a, b) {
            a[b] = true;
            return a;
        });
        
        missedValues = oldOptions.filter(function (oldOption) {
            return !newOptionsMap[oldOption];
        });
        
        if (missedValues.length !== 0) {
            if (Utils.confirm("Новое значение единственного выбора удаляет предыдущие значения: "
                    + missedValues.join(",")
                    + ". Это приведет к обновлению существующих профилей. Вы уверены?")) {
                callback(newOptions.join(","));
                info.value = newOptions.join(",");
                
                Object.keys(Database.Characters).forEach(function (characterName) {
                    var enumValue = Database.Characters[characterName][name];
                    if (!newOptionsMap[enumValue]) {
                        Database.Characters[characterName][name] = newOptions[0];
                    }
                });
                
                return;
            } else {
                callback(info.value);
                return;
            }
        }
        
        callback(newOptions.join(","));
        info.value = newOptions.join(",");
        break;
    }
};



DBMS.getMasterStory = function(storyName, callback){
    "use strict";
    callback(Database.Stories[storyName].story);
};

DBMS.updateMasterStory = function(storyName, value){
    "use strict";
    Database.Stories[storyName].story = value;
}

DBMS.addCharacterToEvent = function(storyName, eventIndex, characterName){
    "use strict";
    Database.Stories[storyName].events[eventIndex].characters[characterName] = {
        text : ""
    };
};

DBMS.removeCharacterFromEvent = function(storyName, eventIndex, characterName){
    "use strict";
    delete Database.Stories[storyName].events[eventIndex].characters[characterName];
};

DBMS.getStoryEvents = function(storyName, callback){
    "use strict";
    callback(Database.Stories[storyName].events);
};

DBMS.getStoryCharacters = function(storyName, callback){
    "use strict";
    callback(Database.Stories[storyName].characters);
};


DBMS.addStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    
    Database.Stories[storyName].characters[characterName] = {
            name : characterName,
            inventory : "",
            activity: {}
    };
    
    callback();
};

DBMS.switchStoryCharacters = function(storyName, fromName, toName, callback){
    "use strict";
    
    var story = Database.Stories[storyName];
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

DBMS.removeStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    
    var story = Database.Stories[storyName];
    delete story.characters[characterName];
    story.events.forEach(function (event) {
        delete event.characters[characterName];
    });
    
    callback();
};

DBMS.updateCharacterInventory = function(storyName, characterName, inventory){
    "use strict";
    Database.Stories[storyName].characters[characterName].inventory = inventory;
};

DBMS.onChangeCharacterActivity = function(storyName, characterName, activityType, checked){
    "use strict";
    var character = Database.Stories[storyName].characters[characterName];
    if (checked) {
        character.activity[activityType] = true;
    } else {
        delete character.activity[activityType];
    }
};


DBMS.createEvent = function(storyName, eventName, eventText, toEnd, selectedIndex, callback){
    "use strict";
    var event = {
        name : eventName,
        text : eventText,
        time : "",
        characters : {}
    };
    if (toEnd) {
        Database.Stories[storyName].events.push(event);
    } else {
        Database.Stories[storyName].events.splice(selectedIndex, 0, event);
    }
    callback();
};

DBMS.swapEvents = function(storyName, index1, index2, callback){
    "use strict";
    var story = Database.Stories[storyName];
    var tmp = story.events[index1];
    story.events[index1] = story.events[index2];
    story.events[index2] = tmp;
    
    callback();
};

DBMS.cloneEvent = function(storyName, index, callback){
    "use strict";
    var story = Database.Stories[storyName];
    var event = story.events[index];
    var copy = Utils.clone(event);
    
    story.events.splice(index, 0, copy);
    
    callback();
};

DBMS.mergeEvents = function(storyName, index, callback){
    "use strict";
    var story = Database.Stories[storyName];

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

DBMS.removeEvent = function(storyName, index, callback){
    "use strict";
    var story = Database.Stories[storyName];
    story.events.remove(index);
    callback();
};

DBMS.updateEventProperty = function(storyName, index, property, value, callback){
    "use strict";
    var story = Database.Stories[storyName].events[index][property] = value;
    if(callback)callback();
};

DBMS.isStoryExist = function(storyName, onTrue, onFalse){
    "use strict";
    if(Database.Stories[storyName]){
        if(onTrue)onTrue();
    } else {
        if(onFalse)onFalse();
    }
};
DBMS.createStory = function(storyName, callback){
    "use strict";
    Database.Stories[storyName] = {
            name : storyName,
            story : "",
            characters : {},
            events : []
    };
    callback();
};
DBMS.renameStory = function(fromName, toName, callback){
    "use strict";
    var data = Database.Stories[fromName];
    data.name = toName;
    Database.Stories[toName] = data;
    delete Database.Stories[fromName];
    callback();
};
DBMS.removeStory = function(name, callback){
    "use strict";
    delete Database.Stories[name];
    callback();
};





DBMS.getSettings = function(){
    "use strict";
    return Database.Settings;
};


DBMS.getCharacterNamesArray = function () {
    "use strict";
    return Object.keys(Database.Characters).sort(Utils.charOrdA);
};

DBMS.getCharacterNamesArray2 = function (callback) {
    "use strict";
    callback(Object.keys(Database.Characters).sort(Utils.charOrdA));
};

DBMS.getCharacterNamesArray3 = function () {
    "use strict";
    return new Promise(function(resolve, reject) {
        var names = Object.keys(Database.Characters).sort(Utils.charOrdA);
        resolve(names);
    });
    
//    callback(Object.keys(Database.Characters).sort(Utils.charOrdA));
};


DBMS.getStoryCharacterNamesArray = function (storyName) {
    "use strict";
    
    var localCharacters;
    localCharacters = Database.Stories[storyName].characters;
    
    return Object.keys(localCharacters).sort(Utils.charOrdA);
};

DBMS.getStoryNamesArray = function () {
    "use strict";
    return Object.keys(Database.Stories).sort(Utils.charOrdA);
};

DBMS.getStoryNamesArray2 = function (callback) {
    "use strict";
    callback(Object.keys(Database.Stories).sort(Utils.charOrdA));
};