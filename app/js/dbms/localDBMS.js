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

function makeLocalDBMS(){
    var listeners = {};
    var dbmsUtils = {};
    
    function LocalDBMS(){
        this._init(listeners);
    };
    
    LocalDBMS.prototype.getSettings = function(){
        "use strict";
        return this.database.Settings;
    };
    
    baseAPI(LocalDBMS, Migrator, CommonUtils, EventEmitter);
    statisticsAPI(LocalDBMS, R, CommonUtils);
    consistencyCheckAPI(LocalDBMS, R, CommonUtils, Ajv, Schema);
    profilesAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners);
    profileBindingAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners);
    
    groupsAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners);
    groupSchemaAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners);
    investigationBoardAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners);
    relationsAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners);
    briefingExportAPI(LocalDBMS, CommonUtils, R, Constants, dbmsUtils);
    
    profileConfigurerAPI(LocalDBMS, Constants, R, CommonUtils, Errors);
    entityAPI(LocalDBMS, Constants, R, CommonUtils, Errors);
    storyBaseAPI(LocalDBMS, R, CommonUtils, Errors);
    storyEventsAPI(LocalDBMS, R, CommonUtils, Errors);
    storyCharactersAPI(LocalDBMS, R, CommonUtils, Errors, listeners);
    
    storyViewAPI(LocalDBMS, R, CommonUtils, dateFormat);
    storyAdaptationsAPI(LocalDBMS, CommonUtils, dbmsUtils);
    accessManagerAPI(LocalDBMS, CommonUtils, R);
    
    logAPI(LocalDBMS, R, CommonUtils);
    
    Logger.attachLogCalls(LocalDBMS, R, false);
    return LocalDBMS;
}

var LocalDBMS = makeLocalDBMS();
