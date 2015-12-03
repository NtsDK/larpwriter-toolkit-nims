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
    callback(Database.Characters[name]);
};

DBMS.createCharacter = function (name) {
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
};

DBMS.renameCharacter = function (fromName, toName) {
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
};

DBMS.removeCharacter = function (name) {
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
};

DBMS.getCharacterNamesArray = function () {
    "use strict";
    return Object.keys(Database.Characters).sort(Utils.charOrdA);
};

DBMS.getStoryCharacterNamesArray = function (storyName) {
    "use strict";

    var localCharacters;
    if (storyName === undefined) {
        localCharacters = Stories.CurrentStory.characters;
    } else {
        localCharacters = Database.Stories[storyName].characters;
    }

    return Object.keys(localCharacters).sort(Utils.charOrdA);
};

DBMS.getStoryNamesArray = function () {
    "use strict";
    return Object.keys(Database.Stories).sort(Utils.charOrdA);
};