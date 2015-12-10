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

//characters
LocalDBMS.prototype.isCharacterNameUsed = function(name, callback){
    "use strict";
    callback(this.database.Characters[name] !== undefined);
};
//characters
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
//characters
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

//characters
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


// profile
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