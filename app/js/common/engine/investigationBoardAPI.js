/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

(function(callback){

    function investigationBoardAPI(LocalDBMS, R, Constants, CommonUtils, Errors, listeners) {
        
        LocalDBMS.prototype.getInvestigationBoardData = function(callback) {
            "use strict";
            callback(null, CommonUtils.clone(Object.keys(this.database.InvestigationBoard)));
        };
    };
    
    callback(investigationBoardAPI);

})(function(api){
    typeof exports === 'undefined'? this['investigationBoardAPI'] = api: module.exports = api;
}.bind(this));