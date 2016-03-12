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
 Utils, DBMS
 */

"use strict";

var Tests = {};

//Tests.list.push(list = [ "emptyProfileItem", 'profileItemNameUsed', 'profileItemNameCantBeName', 'renamedProfileItemNameUsed', 'enterNonNumberToNumberField', 'enterEmptyEnum', "enterStoryName",
//        "storyNameUsed", "enterStoryName", "storyNamesAreSame", "renamedStoryNameUsed", "addCharacterNameIsNotSpecified", "firstSwichCharacterNameIsNotSpecified",
//        "secondSwichCharacterNameIsNotSpecified", "removeCharacterNameIsNotSpecified", "eventNameIsEmpty", "eventTextIsEmpty", "mergeLastEvent", "eventNameUpdateIsEmpty", "eventTextUpdateIsEmpty", 
//        'callGetBriefingData'];

Tests.list = [];

Tests.run = function() {
    "use strict";
    Tests.startNext();
    
//    Tests.list.forEach(function(test, i) {
//        test(test.name);
////        try {
////            console.log(test + " started...");
////            Tests[test]();
////        } catch (e) {
////            console.log(test + " failed: " + e);
////        }
//    });
};

Tests.startNext = function(name){
    if(!name){
        Tests.list[0](Tests.list[0].name);
    } else {
        var index = Tests.list.map(R.prop('name')).indexOf(name) + 1;
        if(Tests.list[index]){
            Tests.list[index](Tests.list[index].name);
        }
    }
};

var errorMsgCheck = R.curry(function(name, predicate, err) {
    if (err) {
        if (!predicate(err)) {
            console.log(name + " assertion failed: " + JSON.stringify(err));
        }
    } else {
        console.log(name + " command was accepted");
    }
    console.log(name + " OK");
    Tests.startNext(name);
});

Tests.list.push(function emptyProfileItem(name) {
    var type = "text";
    DBMS.createProfileItem("", type, Constants.profileFieldTypes[type].value, true, -1, errorMsgCheck(name, R.whereEq({
        messageId : "characters-profile-item-name-is-not-specified"
    })));
});
Tests.list.push(function profileItemNameUsed(name) {
    var type = "text";
    DBMS.createProfileItem("Игрок", type, Constants.profileFieldTypes[type].value, true, -1, errorMsgCheck(name, R.whereEq({
        messageId : "characters-such-name-already-used"
    })));
});
Tests.list.push(function profileItemNameCantBeName(name) {
    var type = "text";
    DBMS.createProfileItem("name", type, Constants.profileFieldTypes[type].value, true, -1, errorMsgCheck(name, R.whereEq({
        messageId : "characters-profile-item-name-cant-be-name"
    })));
});
Tests.list.push(function renamedProfileItemNameUsed(name) {
    DBMS.renameProfileItem('Пол', "Игрок", errorMsgCheck(name, R.whereEq({
        messageId : "characters-such-name-already-used"
    })));
});
Tests.list.push(function enterNonNumberToNumberField(name) {
    DBMS.updateDefaultValue('Возраст', "Игрок", errorMsgCheck(name, R.whereEq({
        messageId : "characters-not-a-number"
    })));
});
Tests.list.push(function enterEmptyEnum(name) {
    DBMS.updateDefaultValue('Пол', "", errorMsgCheck(name, R.whereEq({
        messageId : "characters-enum-item-cant-be-empty"
    })));
});

Tests.list.push(function enterStoryName(name) {
    DBMS.createStory('', errorMsgCheck(name, R.whereEq({
        messageId : "stories-story-name-is-not-specified"
    })));
});
Tests.list.push(function storyNameUsed(name) {
    DBMS.createStory('Репка', errorMsgCheck(name, R.whereEq({
        messageId : "stories-story-name-already-used",
        parameters: ["Репка"]
    })));
});

Tests.list.push(function enterRenamedStoryName(name) {
    DBMS.renameStory('Репка', '', errorMsgCheck(name, R.whereEq({
        messageId : "stories-story-name-is-not-specified"
    })));
});
Tests.list.push(function storyNamesAreSame(name) {
    DBMS.renameStory('Репка', 'Репка', errorMsgCheck(name, R.whereEq({
        messageId : "stories-names-are-the-same"
    })));
});
Tests.list.push(function renamedStoryNameUsed(name) {
    DBMS.renameStory('Репка', 'Колобок', errorMsgCheck(name, R.whereEq({
        messageId : "stories-story-name-already-used",
        parameters: ["Колобок"]
    })));
});

Tests.list.push(function addCharacterNameIsNotSpecified(name) {
    DBMS.addStoryCharacter('Репка', '', errorMsgCheck(name, R.whereEq({
        messageId : "stories-character-name-is-not-specified"
    })));
});

Tests.list.push(function firstSwichCharacterNameIsNotSpecified(name) {
    DBMS.switchStoryCharacters('Репка', '', 'Колобок', errorMsgCheck(name, R.whereEq({
        messageId : "stories-one-of-switch-characters-is-not-specified"
    })));
});
Tests.list.push(function secondSwichCharacterNameIsNotSpecified(name) {
    DBMS.switchStoryCharacters('Репка', 'Колобок', '', errorMsgCheck(name, R.whereEq({
        messageId : "stories-one-of-switch-characters-is-not-specified"
    })));
});

Tests.list.push(function removeCharacterNameIsNotSpecified(name) {
    DBMS.removeStoryCharacter('Репка', '', errorMsgCheck(name, R.whereEq({
        messageId : "stories-character-name-is-not-specified"
    })));
});

Tests.list.push(function eventNameIsEmpty(name) {
    DBMS.createEvent('Репка', '', '123', true, -1, errorMsgCheck(name, R.whereEq({
        messageId : "stories-event-name-is-not-specified"
    })));
});
Tests.list.push(function eventTextIsEmpty(name) {
    DBMS.createEvent('Репка', '123', '', true, -1, errorMsgCheck(name, R.whereEq({
        messageId : "stories-event-text-is-empty"
    })));
});

Tests.list.push(function mergeLastEvent(name) {
    DBMS.mergeEvents('Репка', 11, errorMsgCheck(name, R.whereEq({
        messageId : "stories-cant-merge-last-event"
    })));
});

Tests.list.push(function eventNameUpdateIsEmpty(name) {
    DBMS.updateEventProperty('Репка', 0, 'name', '', errorMsgCheck(name, R.whereEq({
        messageId : "stories-event-name-is-not-specified"
    })));
});
Tests.list.push(function eventTextUpdateIsEmpty(name) {
    DBMS.updateEventProperty('Репка', 0, 'text', '', errorMsgCheck(name, R.whereEq({
        messageId : "stories-event-text-is-empty"
    })));
});

Tests.list.push(function callGetBriefingData(name) {
    DBMS.getBriefingData({'Колобок': true}, function(err){
        if (err) {
//            if (!predicate(err)) {
            console.log(name + " assertion failed: " + JSON.stringify(err));
//            }
        }
        console.log(name + " OK");
        Tests.startNext(name);
    });
});