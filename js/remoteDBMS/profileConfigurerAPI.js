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

//profile configurer
RemoteDBMS.prototype.createProfileItem= function(name, type, value, toEnd, selectedIndex, callback){
    "use strict";
    RemoteDBMS._simplePut("createProfileItem", {
        name: name, 
        value:value,
        type: type,
        toEnd: toEnd,
        selectedIndex:selectedIndex
    }, callback);
};

//profile configurer
RemoteDBMS.prototype.swapProfileItems = function(index1,index2, callback){
    "use strict";
    RemoteDBMS._simplePut("swapProfileItems", {
        index1: index1, 
        index2:index2
    }, callback);
};

//profile configurer
RemoteDBMS.prototype.removeProfileItem = function(index, name, callback){
    "use strict";
    RemoteDBMS._simplePut("removeProfileItem", {
        index: index, 
        name:name
    }, callback);
};

//profile configurer
RemoteDBMS.prototype.changeProfileItemType = function(name, newType, callback){
    "use strict";
    
    RemoteDBMS._simplePut("changeProfileItemType", {
        name: name, 
        newType:newType
    }, callback);
};

// GET
//profile configurer
RemoteDBMS.prototype.isProfileItemNameUsed = function(name, callback){
    "use strict";
    RemoteDBMS._simpleGet("isProfileItemNameUsed", {name:name},  callback);
};

//profile configurer
RemoteDBMS.prototype.renameProfileItem = function(newName, oldName, callback){
    "use strict";
    RemoteDBMS._simplePut("renameProfileItem", {
        newName: newName, 
        oldName:oldName
    }, callback);
};

//profile configurer
RemoteDBMS.prototype.updateDefaultValue = function(name, value){
    "use strict";
    RemoteDBMS._simplePut("updateDefaultValue", {
        name: name, 
        value:value
    });
};