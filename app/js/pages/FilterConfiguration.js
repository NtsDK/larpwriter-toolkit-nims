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

function FilterConfiguration(info){
    this.info = info;
    this.innerProfileSettings = CommonUtils.clone(info.innerProfileSettings);
    this.innerProfileSettings.forEach(function(item){
        if(!CommonUtils.startsWith(item.name, 'profile-')){
            item.displayName = getL10n(item.displayName);
            item.value = "";
        }
        item.canHide = item.name != Constants.CHAR_NAME;
    });
};

FilterConfiguration.makeFilterConfiguration = function(callback){
    DBMS.getCharacterFilterInfo(function(err, info){
        if(err) {Utils.handleError(err); return;}
        var filterConfiguration = new FilterConfiguration(info);
        callback(null, filterConfiguration);
    });
};

FilterConfiguration.prototype.getAllProfileSettings = function(){
    return this.innerProfileSettings;
};

FilterConfiguration.prototype.getBaseProfileSettings = function(){
    return this.info.profileSettings;
};

FilterConfiguration.prototype.getDataArrays = function(filterModel) {
    return CommonUtils.getDataArrays(this.info, filterModel);
};