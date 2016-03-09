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

Tests.list = ["emptyProfileItem", 
    'profileItemNameUsed',
    'profileItemNameCantBeName',
    'renamedProfileItemNameUsed',
    'enterNonNumberToNumberField',
    'enterEmptyEnum',
];

Tests.run = function(){
    "use strict";
    
    Tests.list.forEach(function(test){
        try{
            Tests[test]();
            console.log(test + " OK")
        } catch(e){
            console.log(test + " failed: " + e);
        }
    });
};

var errorMsgCheck = R.curry(function(messageId, err){
    if(err) {
        if(err.messageId !== messageId){
            throw "wrong message id: " + err.messageId;
        }
    } else {
        throw "command was accepted";
    }
});

Tests.emptyProfileItem = function(){
    var type = "text";
    DBMS.createProfileItem("", type, Constants.profileFieldTypes[type].value, true, -1, errorMsgCheck("characters-profile-item-name-is-not-specified"));
};
Tests.profileItemNameUsed = function(){
    var type = "text";
    DBMS.createProfileItem("Игрок", type, Constants.profileFieldTypes[type].value, true, -1, errorMsgCheck("characters-such-name-already-used"));
};
Tests.profileItemNameCantBeName= function(){
    var type = "text";
    DBMS.createProfileItem("name", type, Constants.profileFieldTypes[type].value, true, -1, errorMsgCheck("characters-profile-item-name-cant-be-name"));
};
Tests.renamedProfileItemNameUsed = function(){
    DBMS.renameProfileItem('Пол', "Игрок", errorMsgCheck("characters-such-name-already-used"));
};
Tests.enterNonNumberToNumberField = function(){
    DBMS.updateDefaultValue('Возраст', "Игрок", errorMsgCheck("characters-not-a-number"));
};
Tests.enterEmptyEnum = function(){
    DBMS.updateDefaultValue('Пол', "", errorMsgCheck("characters-enum-item-cant-be-empty"));
};