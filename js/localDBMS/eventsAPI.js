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
LocalDBMS.prototype.getFilteredStoryNames = function (showOnlyUnfinishedStories, callback){
    "use strict";
    var storyArray = Object.keys(this.database.Stories).sort(CommonUtils.charOrdA);
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

//events
LocalDBMS.prototype.getFilteredCharacterNames = function (storyName, showOnlyUnfinishedStories, callback){
    "use strict";
    
    var localCharacters;
    localCharacters = this.database.Stories[storyName].characters;
    
    localCharacters = Object.keys(localCharacters).sort(CommonUtils.charOrdA);
    
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

//events
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

// preview, events
LocalDBMS.prototype.setEventText = function(storyName, eventIndex, characterName, text){
    "use strict";
    
    var event = this.database.Stories[storyName].events[eventIndex];
    if(characterName !== undefined){
        event.characters[characterName].text = text;
    } else {
        event.text = text;
    }
};

// events
LocalDBMS.prototype.changeAdaptationReadyStatus = function(storyName, eventIndex, characterName, value){
    "use strict";
    var event = this.database.Stories[storyName].events[eventIndex];
    event.characters[characterName].ready = value;
};
