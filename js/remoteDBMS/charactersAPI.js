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
RemoteDBMS.prototype.isCharacterNameUsed = function(name, callback){
    "use strict";
    RemoteDBMS._simpleGet("isCharacterNameUsed", [name],  callback);
};
//characters
RemoteDBMS.prototype.createCharacter = function (name, callback) {
    "use strict";
    RemoteDBMS._simplePut("createCharacter", [name], callback);
};
//characters
RemoteDBMS.prototype.renameCharacter = function (fromName, toName, callback) {
    "use strict";
    RemoteDBMS._simplePut("renameCharacter", [fromName, toName], callback);
};

//characters
RemoteDBMS.prototype.removeCharacter = function (name, callback) {
    "use strict";
    RemoteDBMS._simplePut("removeCharacter", [name], callback);
};


// profile
RemoteDBMS.prototype.updateProfileField = function(characterName, fieldName, type, value){
    "use strict";
    RemoteDBMS._simplePut("updateProfileField", [characterName, fieldName, type, value]);
};