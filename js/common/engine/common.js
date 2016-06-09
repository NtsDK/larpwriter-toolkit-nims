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

(function(callback){
    
    function commonAPI(LocalDBMS, Migrator, CommonUtils) {
    
        LocalDBMS.prototype.getDatabase = function(callback){
            "use strict";
            this.database.Meta.saveTime = new Date().toString();
            callback(null, CommonUtils.clone(this.database));
        };
    
        LocalDBMS.prototype.setDatabase = function(database, callback){
            "use strict";
            this.database = Migrator.migrate(database);
            if(callback) callback();
        };
    
        LocalDBMS.prototype.getMetaInfo = function(callback){
            "use strict";
            callback(null, CommonUtils.clone(this.database.Meta));
        };
    
        // overview
        LocalDBMS.prototype.setMetaInfo = function(name, value, callback){
            "use strict";
            this.database.Meta[name] = value;
            if(callback) callback();
        };
    
        LocalDBMS.prototype.getCharacterNamesArray = function(callback) {
            "use strict";
            callback(null, Object.keys(this.database.Characters).sort(CommonUtils.charOrdA));
        };
    
        // stories, timeline
        LocalDBMS.prototype.getStoryNamesArray = function (callback) {
            "use strict";
            callback(null, Object.keys(this.database.Stories).sort(CommonUtils.charOrdA));
        };
    
        LocalDBMS.prototype.getAllProfileSettings = function(callback){
            "use strict";
            callback(null, CommonUtils.clone(this.database.ProfileSettings));
        };
    };
  
    callback(commonAPI);

})(function(api){
    typeof exports === 'undefined'? this['commonAPI'] = api: module.exports = api;
});