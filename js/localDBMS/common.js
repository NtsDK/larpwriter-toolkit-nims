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
    
};

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
// overview
LocalDBMS.prototype.setMetaInfo = function(name, value){
    "use strict";
    this.database.Meta[name] = value;
};

LocalDBMS.prototype.getSettings = function(){
    "use strict";
    return this.database.Settings;
};

LocalDBMS.prototype.getCharacterNamesArray = function (callback) {
    "use strict";
    callback(Object.keys(this.database.Characters).sort(Utils.charOrdA));
};

// stories, timeline
LocalDBMS.prototype.getStoryNamesArray = function (callback) {
    "use strict";
    callback(Object.keys(this.database.Stories).sort(Utils.charOrdA));
};

LocalDBMS.prototype.getAllProfileSettings = function(callback){
    "use strict";
    callback(this.database.ProfileSettings);
};

