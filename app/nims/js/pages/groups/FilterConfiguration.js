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
    function populateProfileItems(item){
        if(!CommonUtils.startsWith(item.name, Constants.CHAR_PREFIX) &&
            !CommonUtils.startsWith(item.name, Constants.PLAYER_PREFIX)){
            item.displayName = getL10n(item.displayName);
            item.value = "";
        }
        item.canHide = item.name != Constants.CHAR_NAME && item.name != Constants.PLAYER_NAME;
    }
    this.groupedProfileFilterItems = CommonUtils.clone(info.groupedProfileFilterItems);
    this.groupedProfileFilterItems.map(R.prop('profileFilterItems')).map(R.map(populateProfileItems));
};

FilterConfiguration.makeFilterConfiguration = function(callback){
    DBMS.getProfileFilterInfo(function(err, info){
        if(err) {Utils.handleError(err); return;}
        var filterConfiguration = new FilterConfiguration(info);
        callback(null, filterConfiguration);
    });
};

FilterConfiguration.prototype.getProfileFilterItems = function(){
    return R.flatten(this.groupedProfileFilterItems.map(R.prop('profileFilterItems')));
};

FilterConfiguration.prototype.getGroupedProfileFilterItems = function(){
    return this.groupedProfileFilterItems;
};

FilterConfiguration.prototype.getBaseProfileSettings = function(){
    return {
        characters: this.info.characters.profileStructure,
        players: this.info.players.profileStructure
    }
};

FilterConfiguration.prototype.getDataArrays = function(filterModel) {
    return ProjectUtils.getDataArrays(this.info, filterModel);
};

FilterConfiguration.prototype.getProfileIds = function(filterModel) {
    var offset = this.groupedProfileFilterItems[0].profileFilterItems.length;
    return this.getDataArrays(filterModel).map(function(dataArray){
        return (dataArray[0].value || '') + '/' + (dataArray[offset].value || '');
    }).sort();
};
