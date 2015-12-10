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
 Utils, Database, Migrator
 */
"use strict";


function LocalDBMS(){
    
}

LocalDBMS.prototype.getDatabase = function(callback){
    "use strict";
    callback(this.database);
};

LocalDBMS.prototype.setDatabase = function(database, callback){
    "use strict";
    this.database = Migrator.migrate(database);
    callback();
};
LocalDBMS.prototype.newDatabase = function(callback){
    "use strict";
    this.database = {
            "Meta": {
                "name" : "",
                "date" : "",
                "preGameDate" : "",
                "description" : ""
            },
            "Characters": {},
            "ProfileSettings" : [],
            "Stories": {},
            "Settings" : {
                "Events" : {
                },
                "BriefingPreview" : {
                },
                "Stories" : {
                },
                "CharacterProfile" : {
                }
            },
        };
    callback();
};

LocalDBMS.prototype.getMetaInfo = function(callback){
    "use strict";
    callback(this.database.Meta);
};

LocalDBMS.prototype.setMetaInfo = function(name, value){
    "use strict";
    this.database.Meta[name] = value;
};

LocalDBMS.prototype.isCharacterNameUsed = function(name, callback){
    "use strict";
    callback(this.database.Characters[name] !== undefined);
};

LocalDBMS.prototype.createCharacter = function (name, callback) {
    "use strict";
    var newCharacter = {
        name : name
    };

    this.database.ProfileSettings.forEach(function (profileSettings) {
        if (profileSettings.type === "enum") {
            newCharacter[profileSettings.name] = profileSettings.value.split(",")[0];
        } else {
            newCharacter[profileSettings.name] = profileSettings.value;
        }
    });

    this.database.Characters[name] = newCharacter;
    callback();
};

LocalDBMS.prototype.renameCharacter = function (fromName, toName, callback) {
    "use strict";
    var data = this.database.Characters[fromName];
    data.name = toName;
    this.database.Characters[toName] = data;
    delete this.database.Characters[fromName];

    var storyName, story;

    var renameEventCharacter = function (event) {
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
    callback();
};

LocalDBMS.prototype.removeCharacter = function (name, callback) {
    "use strict";
    delete this.database.Characters[name];
    var storyName, story;

    var cleanEvent = function (event) {
        if (event.characters[name]) {
            delete event.characters[name];
        }
    };

    for (storyName in this.database.Stories) {
        story = this.database.Stories[storyName];
        if (story.characters[name]) {
            delete story.characters[name];
            story.events.forEach(cleanEvent);
        }
    }
    callback();
};



LocalDBMS.prototype.getProfile = function(name, callback){
    "use strict";
    callback(name, this.database.Characters[name]);
};

LocalDBMS.prototype.getAllProfiles = function(callback){
    "use strict";
    callback(this.database.Characters);
};

LocalDBMS.prototype.getAllStories = function(callback){
    "use strict";
    callback(this.database.Stories);
};

LocalDBMS.prototype.getAllProfileSettings = function(callback){
    "use strict";
    callback(this.database.ProfileSettings);
};

LocalDBMS.prototype.updateProfileField = function(characterName, fieldName, type, event){
    "use strict";
    var profileInfo = this.database.Characters[characterName];
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

LocalDBMS.prototype.createProfileItem= function(name, type, value, toEnd, selectedIndex, callback){
    "use strict";
    var profileItem = {
        name : name,
        type : type,
        value : value
    };
    
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        that.database.Characters[characterName][name] = value;
    });
    
    if (toEnd) {
        this.database.ProfileSettings.push(profileItem);
    } else {
        this.database.ProfileSettings.splice(selectedIndex, 0, profileItem);
    }
    callback();
};


LocalDBMS.prototype.swapProfileItems = function(index1,index2, callback){
    "use strict";
    var tmp = this.database.ProfileSettings[index1];
    this.database.ProfileSettings[index1] = this.database.ProfileSettings[index2];
    this.database.ProfileSettings[index2] = tmp;
    callback();
};

LocalDBMS.prototype.removeProfileItem = function(index, name, callback){
    "use strict";
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        delete that.database.Characters[characterName][name];
    });
    this.database.ProfileSettings.remove(index);
    callback();
};

LocalDBMS.prototype.changeProfileItemType = function(name, newType, callback){
    "use strict";
    
    var profileItem = this.database.ProfileSettings.filter(function(elem){
        return elem.name === name;
    })[0];
    
    profileItem.type = newType;
    profileItem.value = CharacterProfileConfigurer.mapping[newType].value;
    
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        that.database.Characters[characterName][name] = CharacterProfileConfigurer.mapping[newType].value;
    });
    callback();
};


LocalDBMS.prototype.isProfileItemNameUsed = function(name, onUsed, onUnused){
    "use strict";
    var nameUsedTest = function (profile) {
      return name === profile.name;
    };
    
    if (this.database.ProfileSettings.some(nameUsedTest)) {
        if(onUsed) onUsed();
        return;
    } else {
        onUnused();
    }
};

LocalDBMS.prototype.renameProfileItem = function(newName, oldName, callback){
    "use strict";
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        var tmp = that.database.Characters[characterName][oldName];
        delete that.database.Characters[characterName][oldName];
        that.database.Characters[characterName][newName] = tmp;
    });
    
    this.database.ProfileSettings.filter(function(elem){
        return elem.name === oldName;
    })[0].name = newName;
    callback();
};

LocalDBMS.prototype.updateDefaultValue = function(name, value, callback){
    "use strict";
    
    var info = this.database.ProfileSettings.filter(function(elem){
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
                
                var that = this;
                Object.keys(this.database.Characters).forEach(function (characterName) {
                    var enumValue = that.database.Characters[characterName][name];
                    if (!newOptionsMap[enumValue]) {
                        that.database.Characters[characterName][name] = newOptions[0];
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



LocalDBMS.prototype.getMasterStory = function(storyName, callback){
    "use strict";
    callback(this.database.Stories[storyName].story);
};

LocalDBMS.prototype.updateMasterStory = function(storyName, value){
    "use strict";
    this.database.Stories[storyName].story = value;
}

LocalDBMS.prototype.addCharacterToEvent = function(storyName, eventIndex, characterName){
    "use strict";
    this.database.Stories[storyName].events[eventIndex].characters[characterName] = {
        text : ""
    };
};

LocalDBMS.prototype.removeCharacterFromEvent = function(storyName, eventIndex, characterName){
    "use strict";
    delete this.database.Stories[storyName].events[eventIndex].characters[characterName];
};

LocalDBMS.prototype.getStoryEvents = function(storyName, callback){
    "use strict";
    callback(this.database.Stories[storyName].events);
};

LocalDBMS.prototype.getStoryCharacters = function(storyName, callback){
    "use strict";
    callback(this.database.Stories[storyName].characters);
};


LocalDBMS.prototype.addStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    
    this.database.Stories[storyName].characters[characterName] = {
            name : characterName,
            inventory : "",
            activity: {}
    };
    
    callback();
};

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

LocalDBMS.prototype.removeStoryCharacter = function(storyName, characterName, callback){
    "use strict";
    
    var story = this.database.Stories[storyName];
    delete story.characters[characterName];
    story.events.forEach(function (event) {
        delete event.characters[characterName];
    });
    
    callback();
};

LocalDBMS.prototype.updateCharacterInventory = function(storyName, characterName, inventory){
    "use strict";
    this.database.Stories[storyName].characters[characterName].inventory = inventory;
};

LocalDBMS.prototype.onChangeCharacterActivity = function(storyName, characterName, activityType, checked){
    "use strict";
    var character = this.database.Stories[storyName].characters[characterName];
    if (checked) {
        character.activity[activityType] = true;
    } else {
        delete character.activity[activityType];
    }
};


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

LocalDBMS.prototype.swapEvents = function(storyName, index1, index2, callback){
    "use strict";
    var story = this.database.Stories[storyName];
    var tmp = story.events[index1];
    story.events[index1] = story.events[index2];
    story.events[index2] = tmp;
    
    callback();
};

LocalDBMS.prototype.cloneEvent = function(storyName, index, callback){
    "use strict";
    var story = this.database.Stories[storyName];
    var event = story.events[index];
    var copy = Utils.clone(event);
    
    story.events.splice(index, 0, copy);
    
    callback();
};

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

LocalDBMS.prototype.removeEvent = function(storyName, index, callback){
    "use strict";
    var story = this.database.Stories[storyName];
    story.events.remove(index);
    callback();
};

LocalDBMS.prototype.updateEventProperty = function(storyName, index, property, value, callback){
    "use strict";
    var story = this.database.Stories[storyName].events[index][property] = value;
    if(callback)callback();
};

LocalDBMS.prototype.isStoryExist = function(storyName, onTrue, onFalse){
    "use strict";
    if(this.database.Stories[storyName]){
        if(onTrue)onTrue();
    } else {
        if(onFalse)onFalse();
    }
};
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
LocalDBMS.prototype.renameStory = function(fromName, toName, callback){
    "use strict";
    var data = this.database.Stories[fromName];
    data.name = toName;
    this.database.Stories[toName] = data;
    delete this.database.Stories[fromName];
    callback();
};
LocalDBMS.prototype.removeStory = function(name, callback){
    "use strict";
    delete this.database.Stories[name];
    callback();
};


LocalDBMS.prototype.getAllInventoryLists = function(characterName, callback){
    "use strict";
    var array = [];
    
    for ( var storyName in this.database.Stories) {
        var story = this.database.Stories[storyName];
        if (story.characters[characterName]
                && story.characters[characterName].inventory
                && story.characters[characterName].inventory !== "") {
            array.push({
                storyName: storyName,
                inventory:story.characters[characterName].inventory
            });
        }
    }
    callback(array);
};

LocalDBMS.prototype.getCharacterEventGroupsByStory = function(characterName, callback){
    "use strict";
    var eventGroups = [];
    
    var events;
    
    var that = this;
    Object.keys(this.database.Stories).filter(function(storyName){
        return that.database.Stories[storyName].characters[characterName];
    }).forEach(function (storyName) {
        events = [];
        
        var tmpEvents = that.database.Stories[storyName].events;
        tmpEvents.map(function(elem, i){
            elem.index = i;
            elem.storyName = storyName;
            return elem;
        }).filter(function (event) {
            return event.characters[characterName];
        }).forEach(function (event) {
            events.push(event);
        });
        
        eventGroups.push({
            storyName: storyName,
            events: events
        })
    });
    callback(eventGroups);
};

LocalDBMS.prototype.getEventGroupsForStories = function(storyNames, callback){
    "use strict";
    var eventGroups = [];
    
    var events;
    
    var that = this;
    Object.keys(this.database.Stories).filter(function(storyName){
        return storyNames.indexOf(storyName) !== -1;
    }).forEach(function (storyName) {
        events = [];
        
        var tmpEvents = that.database.Stories[storyName].events;
        tmpEvents.map(function(elem, i){
            elem.index = i;
            elem.storyName = storyName;
            return elem;
        }).forEach(function (event) {
            events.push(event);
        });
        
        eventGroups.push({
            storyName: storyName,
            events: events
        })
    });
    callback(eventGroups);
};

LocalDBMS.prototype.getCharacterEventsByTime = function(characterName, callback){
    "use strict";
    var allEvents = [];
    
    var that = this;
    Object.keys(this.database.Stories).filter(function(storyName){
        return that.database.Stories[storyName].characters[characterName];
    }).forEach(function (storyName) {
        var events = that.database.Stories[storyName].events;
        allEvents = allEvents.concat(events.map(function(elem, i){
            elem.index = i;
            elem.storyName = storyName;
            return elem;
        }).filter(function (event) {
            return event.characters[characterName];
        }));
    });
    
    allEvents.sort(eventsByTime);
    callback(allEvents);
};





LocalDBMS.prototype.getSettings = function(){
    "use strict";
    return this.database.Settings;
};


LocalDBMS.prototype.getCharacterNamesArray2 = function (callback) {
    "use strict";
    callback(Object.keys(this.database.Characters).sort(Utils.charOrdA));
};

LocalDBMS.prototype.getCharacterNamesArray3 = function () {
    "use strict";
    return new Promise(function(resolve, reject) {
        var names = Object.keys(this.database.Characters).sort(Utils.charOrdA);
        resolve(names);
    });
    
//    callback(Object.keys(this.database.Characters).sort(Utils.charOrdA));
};


LocalDBMS.prototype.getStoryCharacterNamesArray = function (storyName) {
    "use strict";
    
    var localCharacters;
    localCharacters = this.database.Stories[storyName].characters;
    
    return Object.keys(localCharacters).sort(Utils.charOrdA);
};


LocalDBMS.prototype.getStoryNamesArray2 = function (callback) {
    "use strict";
    callback(Object.keys(this.database.Stories).sort(Utils.charOrdA));
};

LocalDBMS.prototype.getFilteredStoryNames = function (showOnlyUnfinishedStories, callback){
    "use strict";
    var storyArray = Object.keys(this.database.Stories).sort(Utils.charOrdA);
    var that = this;
    storyArray = storyArray.map(function(elem){
        return {
            storyName: elem,
            isFinished: that._isStoryFinished(elem)
        }
    });
    
    if(showOnlyUnfinishedStories){
        storyArray = storyArray.filter(function(elem){
            return !elem.isFinished;
        })
        callback(storyArray);
    } else {
        callback(storyArray);
    }
};

LocalDBMS.prototype._isStoryFinished = function (storyName) {
    "use strict";
    return this.database.Stories[storyName].events.every(function(event){
        for(var characterName in event.characters){
            if(event.characters[characterName]){
                return event.characters[characterName].ready;
            } else {
                return true;
            }
        }
    });
};

LocalDBMS.prototype.getFilteredCharacterNames = function (storyName, showOnlyUnfinishedStories, callback){
    "use strict";
    
    var localCharacters;
    localCharacters = this.database.Stories[storyName].characters;
    
    localCharacters = Object.keys(localCharacters).sort(Utils.charOrdA);
    
    var that = this;
    localCharacters = localCharacters.map(function(elem){
        return {
            characterName: elem,
            isFinished: that._isStoryFinishedForCharacter(storyName, elem)
        }
    });
    
    if(showOnlyUnfinishedStories){
        localCharacters = localCharacters.filter(function(elem){
            return !elem.isFinished;
        })
        callback(localCharacters);
    } else {
        callback(localCharacters);
    }
};

LocalDBMS.prototype._isStoryFinishedForCharacter = function (storyName, characterName) {
    "use strict";
    return this.database.Stories[storyName].events.every(function(event){
        if(event.characters[characterName]){
            return event.characters[characterName].ready;
        } else {
            return true;
        }
    });
};

LocalDBMS.prototype.getEvents = function(storyName, characterNames, callback){
    "use strict";
    
    var i;
    var events = this.database.Stories[storyName].events.map(function(item, i){
        item.index = i;
        return item;
    }).filter(function (event) {
        for (i = 0; i < characterNames.length; i++) {
            if(event.characters[characterNames[i]]){
                return true;
            }
        }
        return false;
    });
    callback(events);
};

LocalDBMS.prototype.setEventText = function(storyName, eventIndex, characterName, text){
    "use strict";
    
    var event = this.database.Stories[storyName].events[eventIndex];
    if(characterName !== undefined){
        event.characters[characterName].text = text;
    } else {
        event.text = text;
    }
};

LocalDBMS.prototype.setEventTime = function(storyName, eventIndex, time){
    "use strict";
    
    var event = this.database.Stories[storyName].events[eventIndex];
    event.time = dateFormat(time, "yyyy/mm/dd h:MM");
};

LocalDBMS.prototype.changeAdaptationReadyStatus = function(storyName, eventIndex, characterName, value){
    "use strict";
    var event = this.database.Stories[storyName].events[eventIndex];
    event.characters[characterName].ready = value;
};



LocalDBMS.prototype.getBriefingData = function (groupingByStory, callback) {
    "use strict";
    var data = {};

    var charArray = [];

    for ( var charName in this.database.Characters) {
        var inventory = [];
        for ( var storyName in this.database.Stories) {
            var story = this.database.Stories[storyName];
            if (story.characters[charName]
                    && story.characters[charName].inventory
                    && story.characters[charName].inventory !== "") {
                inventory = inventory.concat(story.characters[charName].inventory);
            }
        }
        inventory = inventory.join(", ");

        var profileInfo = this._getProfileInfoObject(charName);
        var profileInfoArray = this._getProfileInfoArray(charName);

        if (groupingByStory) {
            var storiesInfo = this._getStoriesInfo(charName);
        } else {
            var eventsInfo = this._getEventsInfo(charName);
        }
        var dataObject = {
            "name" : charName,
            "inventory" : inventory,
            "storiesInfo" : storiesInfo,
            "eventsInfo" : eventsInfo,
            "profileInfoArray" : profileInfoArray
        };

        for ( var element in profileInfo) {
            dataObject["profileInfo." + element] = profileInfo[element];
        }

        charArray.push(dataObject);
    }

    data["briefings"] = charArray;
    callback(data);
};

LocalDBMS.prototype._getProfileInfoObject = function (charName) {
    "use strict";
    var character = this.database.Characters[charName];
    var profileInfo = {};

    this.database.ProfileSettings.forEach(function (element) {
        switch (element.type) {
        case "text":
        case "string":
        case "enum":
        case "number":
            profileInfo[element.name] = character[element.name];
            break;
        case "checkbox":
            profileInfo[element.name] = character[element.name] ? "Да" : "Нет";
            break;
        }
    });
    return profileInfo;
};

LocalDBMS.prototype._getProfileInfoArray = function (charName) {
    "use strict";
    var character = this.database.Characters[charName];
    var profileInfoArray = [];
    
    var value;
    this.database.ProfileSettings.forEach(function (element) {
        switch (element.type) {
        case "text":
        case "string":
        case "enum":
        case "number":
            value = character[element.name];
            break;
        case "checkbox":
            value = character[element.name] ? "Да" : "Нет";
            break;
        }
        profileInfoArray.push({
            name: element.name,
            value: value
        });
    });
    return profileInfoArray;
};

LocalDBMS.prototype._getEventsInfo = function (charName) {
    "use strict";
    var eventsInfo = [];
    for ( var storyName in this.database.Stories) {
        var storyInfo = {};

        var story = this.database.Stories[storyName];
        if (!story.characters[charName]) {
            continue;
        }

        storyInfo.name = storyName;

        story.events.filter(function (event) {
            return event.characters[charName];
        }).forEach(function (event) {
            var eventInfo = {};
            if (event.characters[charName].text !== "") {
                eventInfo.text = event.characters[charName].text;
            } else {
                eventInfo.text = event.text;
            }
            eventInfo.time = event.time;
            eventsInfo.push(eventInfo);
        });
    }
    eventsInfo.sort(eventsByTime);

    return eventsInfo;
};

LocalDBMS.prototype._getStoriesInfo = function (charName) {
    "use strict";
    var storiesInfo = [];
    for ( var storyName in this.database.Stories) {
        var storyInfo = {};

        var story = this.database.Stories[storyName];
        if (!story.characters[charName]) {
            continue;
        }

        storyInfo.name = storyName;
        var eventsInfo = [];

        story.events.filter(function (event) {
            return event.characters[charName];
        }).forEach(function (event) {
            var eventInfo = {};
            if (event.characters[charName].text !== "") {
                eventInfo.text = event.characters[charName].text;
            } else {
                eventInfo.text = event.text;
            }
            eventInfo.time = event.time;
            eventsInfo.push(eventInfo);
        });
        storyInfo.eventsInfo = eventsInfo;

        storiesInfo.push(storyInfo);
    }
    return storiesInfo;
};


