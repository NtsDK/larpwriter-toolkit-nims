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
    eventsInfo.sort(CommonUtils.eventsByTime);

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


