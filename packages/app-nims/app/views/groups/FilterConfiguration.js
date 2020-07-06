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

/* eslint-disable func-names */

//const Constants = require('dbms/constants');
// const ProjectUtils = require('db-utils/projectUtils');
// const ProjectUtils = require('../../../../dbms_nims/db-utils/projectUtils');
const ProjectUtils = require('dbms-nims/db-utils/projectUtils');
//const R = require('ramda');

function FilterConfiguration(info) {
    this.info = info;
    function populateProfileItems(item) {
        if (!R.startsWith(Constants.CHAR_PREFIX, item.name)
            && !R.startsWith(Constants.PLAYER_PREFIX, item.name)) {
            item.displayName = L10n.getValue(item.displayName);
            item.value = '';
        }
    }
    this.groupedProfileFilterItems = R.clone(info.groupedProfileFilterItems);
    this.groupedProfileFilterItems.map(R.prop('profileFilterItems')).map(R.map(populateProfileItems));
}

FilterConfiguration.makeFilterConfiguration = function () {
    return new Promise((resolve, reject) => {
        DBMS.getProfileFilterInfo().then((info) => {
            const filterConfiguration = new FilterConfiguration(info);
            resolve(filterConfiguration);
        }).catch(reject);
    });
};

FilterConfiguration.prototype.getProfileFilterItems = function () {
    return R.flatten(this.groupedProfileFilterItems.map(R.prop('profileFilterItems')));
};

FilterConfiguration.prototype.getProfileItemSource = function (name) {
    let source;
    this.groupedProfileFilterItems.forEach((el) => {
        const arr = el.profileFilterItems.map(R.prop('name'));
        if (R.contains(name, arr)) {
            source = el.name;
        }
    });
    return source;
};

FilterConfiguration.prototype.getName2SourceMapping = function () {
    return this.groupedProfileFilterItems.reduce((acc, group) => {
        group.profileFilterItems.forEach((item) => (acc[item.name] = group.name));
        return acc;
    }, {});
};

FilterConfiguration.prototype.getName2DisplayNameMapping = function () {
    return this.groupedProfileFilterItems.reduce((acc, group) => {
        group.profileFilterItems.forEach((item) => (acc[item.name] = item.displayName));
        return acc;
    }, {});
};

FilterConfiguration.prototype.getGroupedProfileFilterItems = function () {
    return this.groupedProfileFilterItems;
};

FilterConfiguration.prototype.getGroupsForSelect = function () {
    return this.groupedProfileFilterItems.map((group) => ({
        displayName: L10n.getValue(`profile-filter-${group.name}`),
        array: group.profileFilterItems
    }));
};

FilterConfiguration.prototype.getBaseProfileSettings = function () {
    return {
        characters: this.info.characters.profileStructure,
        players: this.info.players.profileStructure
    };
};

FilterConfiguration.prototype.getDataArrays = function (filterModel) {
    return ProjectUtils.getDataArrays(this.info, filterModel);
};

FilterConfiguration.prototype.haveProfiles = function () {
    return R.keys(this.info.characters.profiles).length > 0 || R.keys(this.info.players.profiles).length > 0;
};

FilterConfiguration.prototype.haveProfileStructures = function () {
    return this.info.characters.profileStructure.length > 0 || this.info.players.profileStructure.length > 0;
};

FilterConfiguration.prototype.haveData = function () {
    return this.haveProfiles() && this.haveProfileStructures();
};

FilterConfiguration.prototype.getProfileIds = function (filterModel) {
    const offset = this.groupedProfileFilterItems[0].profileFilterItems.length;
    return this.getDataArrays(filterModel).map((dataArray) => `${dataArray[0].value || ''}/${dataArray[offset].value || ''}`).sort();
};

module.exports = FilterConfiguration;
