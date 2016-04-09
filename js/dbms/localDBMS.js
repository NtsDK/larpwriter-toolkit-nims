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

LocalDBMS.prototype.getSettings = function(){
    "use strict";
    return this.database.Settings;
};

commonAPI(LocalDBMS, Migrator, CommonUtils);
statisticsAPI(LocalDBMS, R, CommonUtils);
consistencyCheckAPI(LocalDBMS, R, CommonUtils);
charactersAPI(LocalDBMS, Errors);
extrasAPI(LocalDBMS, CommonUtils, dateFormat);
briefingExportAPI(LocalDBMS, CommonUtils, R, Constants);
profileConfigurerAPI(LocalDBMS, Constants, CommonUtils, Errors);
storiesAPI(LocalDBMS, CommonUtils, Errors);
eventsAPI(LocalDBMS, CommonUtils);
accessManagerAPI(LocalDBMS, CommonUtils);
logAPI(LocalDBMS, R, CommonUtils, false, MODE); // log function enabled in standalone mode
