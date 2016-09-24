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

function FilterConfiguration(profileSettings, characterNames, profiles, charactersSummary){
    this.profiles = profiles;
    this.profileNames = Object.keys(profiles);
    this.charactersSummary = charactersSummary;
    
    this.characterNames = {};
    var that = this;
    characterNames.forEach(function(elem){
        that.characterNames[elem.value] = elem.displayName;
    });
    
    this.innerProfileSettings = [ {
        name : Constants.CHAR_NAME,
        type : "text",
        canHide : false,
        displayName : getL10n("character-filter-character"),
        value: ""
    } ];
    
    this.innerProfileSettings = this.innerProfileSettings.concat(profileSettings.map(function(element){
        return {
            name: 'profile-' + element.name,
            type: element.type,
            canHide: true,
            displayName: element.name,
            value: element.value
        }
    }));
    
    var summaryStats = [
        ['active'     ,getL10n("constant-active")],
        ['follower'   ,getL10n("constant-follower") ],
        ['defensive'  ,getL10n("constant-defensive")  ],
        ['passive'    ,getL10n("constant-passive")  ],
        ['completeness', getL10n("character-filter-completeness")],
        ['totalStories', getL10n("character-filter-totalStories")]
    ];
    
    var that = this;
    summaryStats.forEach(function(stat){
        that.innerProfileSettings.push({
            name: 'summary-' + stat[0],
            type: 'number',
            canHide: true,
            displayName: stat[1],
            value: ""
        });
    });
    
    this.innerProfileSettingsMap = arr2map(this.innerProfileSettings, 'name');
};

FilterConfiguration.makeFilterConfiguration = function(callback){
    PermissionInformer.getCharacterNamesArray(false, function(err, names){
        if(err) {Utils.handleError(err); return;}
        DBMS.getAllProfiles(function(err, profiles){
            if(err) {Utils.handleError(err); return;}
            DBMS.getCharactersSummary(function(err, charactersSummary){
                if(err) {Utils.handleError(err); return;}
                DBMS.getAllProfileSettings(function(err, allProfileSettings){
                    if(err) {Utils.handleError(err); return;}
                    var filterConfiguration = new FilterConfiguration(allProfileSettings, names, profiles, charactersSummary);
                    callback(null, filterConfiguration);
                });
            });
        });
    });
};

FilterConfiguration.prototype.getAllProfileSettings = function(){
    return this.innerProfileSettings;
};

FilterConfiguration.prototype.getShowProfileItemNames = function(){
    return R.map(R.prop('displayName'), this.innerProfileSettings.filter(R.prop('canHide')));
};

FilterConfiguration.prototype.getHeaderProfileItemNames = function(){
    return R.map(R.pick(['name', 'displayName']), this.innerProfileSettings);
};

FilterConfiguration.prototype.getHeaderDisplayName = function(name){
    return this.innerProfileSettingsMap[name].displayName;
};

FilterConfiguration.prototype.getProfileItemType = function(itemName){
    return this.innerProfileSettings.filter(function (element) {
        return element.name === itemName;
      })[0].type;
};

FilterConfiguration.prototype.getValue = function(characterName, profileItemName){
    if(profileItemName == Constants.CHAR_NAME){
        return this.characterNames[characterName];
    } else if(CommonUtils.startsWith(profileItemName, 'summary-') ){
        return this.charactersSummary[characterName][profileItemName.substring('summary-'.length)];
    } else {
        return this.profiles[characterName][profileItemName.substring('profile-'.length)];
    }
};

FilterConfiguration.prototype.filter = function(filterModel){
    return this.profileNames.filter(FilterConfiguration.acceptDataRow(this, filterModel));
};

FilterConfiguration.acceptDataRow = R.curry(function (filterConfiguration, model, element) {
    "use strict";
    var result = true;
    var value, regex;
    model.forEach(function(filterItem){
        if (!result) {
            return;
        }
        value = filterConfiguration.getValue(element, filterItem.name);
        switch (filterItem.type) {
        case "enum":
        case "checkbox":
            if (!filterItem.selectedOptions[value]) {
                result = false;
            }
            break;
        case "number":
            switch (filterItem.condition) {
            case "greater":
                result = value > filterItem.num;
                break;
            case "equal":
                result = value === filterItem.num;
                break;
            case "lesser":
                result = value < filterItem.num;
                break;
            }
            break;
        case "text":
        case "string":
            regex = Utils.globStringToRegex(filterItem.regexString);
            result = value.toLowerCase().match(regex);
            break;
        }
    });
    return result;
});

FilterConfiguration.sortDataRows = R.curry(function (filterConfiguration, type, sortKey, sortDir, a, b) {
    "use strict";
    a = filterConfiguration.getValue(a, sortKey);
    b = filterConfiguration.getValue(b, sortKey);

    switch (type) {
    case "text":
    case "string":
    case "enum":
        a = a.toLowerCase();
        b = b.toLowerCase();
        break;
    }
    if (a > b) {
        return sortDir === "asc" ? 1 : -1;
    }
    if (a < b) {
        return sortDir === "asc" ? -1 : 1;
    }
    return 0;
});