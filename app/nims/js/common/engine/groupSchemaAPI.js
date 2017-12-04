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

'use strict';

(function (callback) {
    function groupSchemaAPI(LocalDBMS, opts) {
        const R = opts.R;
        const CommonUtils = opts.CommonUtils;
        const Constants = opts.Constants;
        const Errors = opts.Errors;
        const listeners = opts.listeners;

        const _isGroupsEqualByFilterModel = function (fm1, fm2) {
            const fmMap1 = R.indexBy(R.prop('name'), fm1);
            const fmMap2 = R.indexBy(R.prop('name'), fm2);
            return R.equals(fmMap1, fmMap2);
        };
        const _isGroupsEqualByElements = function (els1, els2) {
            return R.symmetricDifference(R.keys(els1), R.keys(els2)).length == 0;
        };
        const _isSuperGroupByElements = function (subGroupEls, superGroupEls) {
            return R.difference(R.keys(subGroupEls), R.keys(superGroupEls)).length == 0;
        };
        const _isSuperGroupByFilterModel = function (subGroupFm, superGroupFm) {
            const subMap = R.indexBy(R.prop('name'), subGroupFm);
            const superMap = R.indexBy(R.prop('name'), superGroupFm);
            const subKeys = R.keys(subMap);
            const superKeys = R.keys(superMap);
            if (superKeys.length == 0) {
                return true;
            }
            if (R.difference(superKeys, subKeys).length != 0) {
                return false;
            }

            return superKeys.every((superKey) => {
                const superItem = superMap[superKey];
                const subItem = subMap[superKey];
                switch (superItem.type) {
                case 'text':
                case 'string':
                    return subItem.regexString.indexOf(superItem.regexString) !== -1;
                case 'enum':
                case 'checkbox':
                    return R.difference(R.keys(superItem.selectedOptions), R.keys(subItem.selectedOptions)).length == 0;
                case 'number':
                    if (subItem.condition === 'greater' && superItem.condition === 'lesser') {
                        return false;
                    }
                    if (subItem.condition === 'lesser' && superItem.condition === 'greater') {
                        return false;
                    }
                    if (subItem.condition === 'equal') {
                        if (superItem.condition !== 'equal') {
                            return false;
                        }
                        return subItem.num == superItem.num;
                    }
                    if (subItem.condition === 'greater') {
                        return subItem.num <= superItem.num;
                    }
                    if (subItem.condition === 'lesser') {
                        return subItem.num >= superItem.num;
                    }
                case 'multiEnum':
                    if (subItem.condition === 'every' && superItem.condition === 'some') {
                        return false;
                    }
                    if (subItem.condition === 'some' && superItem.condition === 'every') {
                        return false;
                    }
                    if (subItem.condition === 'equal') {
                        if (superItem.condition !== 'equal') {
                            return false;
                        }
                        return R.difference(R.keys(superItem.selectedOptions), R.keys(subItem.selectedOptions)).length == 0;
                    }
                    if (subItem.condition === 'every') {
                        return R.difference(R.keys(superItem.selectedOptions), R.keys(subItem.selectedOptions)).length == 0;
                    }
                    if (subItem.condition === 'some') {
                        return R.difference(R.keys(subItem.selectedOptions), R.keys(superItem.selectedOptions)).length == 0;
                    }
                default:
                    throw new Error(`Unexpected type ${superItem.type}`);
                }
            });
        };

        const _removeSuperSuperGroups = function (superGroups) {
            R.values(superGroups).forEach((superGroupSet) => {
                const superGroupKeys = R.keys(superGroupSet);
                for (let i = 0; i < superGroupKeys.length; ++i) {
                    for (let j = 0; j < superGroupKeys.length; ++j) {
                        if (i == j) continue;
                        const subGroup = superGroupKeys[i];
                        const superGroup = superGroupKeys[j];
                        if (superGroups[subGroup][superGroup]) {
                            delete superGroupSet[superGroup];
                        }
                    }
                }
            });
        };

        const _makeGraph = function (equalGroups, superGroups, groupCharacterSets) {
            const levels = {};
            function getLevel(groupName) {
                if (levels[groupName]) {
                    return levels[groupName];
                }
                const supers = R.keys(superGroups[groupName]);
                if (supers.length == 0) {
                    return 1;
                }
                return supers.map(getLevel).reduce((max, cur) => (cur > max ? cur : max), -1) + 1;
            }

            R.keys(superGroups).forEach((subGroup) => {
                if (!levels[subGroup]) {
                    levels[subGroup] = getLevel(subGroup);
                }
            });


            const nodes = R.keys(superGroups).map(subGroup => ({
                id: subGroup,
                label: [subGroup].concat(equalGroups[subGroup] || []).join(', '),
                level: levels[subGroup],
                title: R.keys(groupCharacterSets[subGroup]).join(', ')
            }));
            const edges = R.keys(superGroups).reduce((result, subGroup) => result.concat(R.keys(superGroups[subGroup]).map(superGroup => ({
                from: subGroup,
                to: superGroup,
                arrow: 'to'
            }))), []);
            return {
                nodes,
                edges
            };
        };

        const _makeGroupSchema = function (groups, _isGroupsEqual, _isSuperGroup, _extractKeyInfo, groupCharacterSets) {
            const groupNames = R.keys(groups);
            const groupNamesSet = R.zipObj(groupNames, R.repeat(true, groupNames.length));
            const equalGroups = {};

            for (var i = 0; i < groupNames.length; ++i) {
                var groupName1 = groupNames[i];
                if (groupNamesSet[groupName1]) {
                    for (var j = i + 1; j < groupNames.length; ++j) {
                        var groupName2 = groupNames[j];
                        if (groupNamesSet[groupName2]) {
                            if (_isGroupsEqual(_extractKeyInfo(groupName1), _extractKeyInfo(groupName2))) {
                                groupNamesSet[groupName2] = false;
                                equalGroups[groupName1] = equalGroups[groupName1] || [];
                                equalGroups[groupName1].push(groupName2);
                            }
                        }
                    }
                }
            }
            //            console.log(equalGroups);
            const uniqueGroups = R.toPairs(groupNamesSet).filter(item => item[1]).map(R.head);
            //            console.log(uniqueGroups);
            const superGroups = R.zipObj(uniqueGroups, R.ap([R.clone], R.repeat({}, uniqueGroups.length)));
            for (var i = 0; i < uniqueGroups.length; ++i) {
                for (var j = 0; j < uniqueGroups.length; ++j) {
                    if (i == j) continue;
                    var groupName1 = uniqueGroups[i];
                    var groupName2 = uniqueGroups[j];
                    if (_isSuperGroup(_extractKeyInfo(groupName1), _extractKeyInfo(groupName2))) {
                        superGroups[groupName1][groupName2] = true;
                    }
                }
            }
            //            console.log(superGroups);
            _removeSuperSuperGroups(superGroups);
            //            console.log(superGroups);

            return _makeGraph(equalGroups, superGroups, groupCharacterSets);
        };

        LocalDBMS.prototype.getGroupSchemas = function (callback) {
            const that = this;

            this.getGroupCharacterSets((err, groupCharacterSets) => {
                if (err) { callback(err); return; }
                const schemas = {};
                const groups = that.database.Groups;

                schemas.theory = _makeGroupSchema(groups, _isGroupsEqualByFilterModel, _isSuperGroupByFilterModel, groupName => groups[groupName].filterModel, groupCharacterSets);

                schemas.practice = _makeGroupSchema(groups, _isGroupsEqualByElements, _isSuperGroupByElements, groupName => groupCharacterSets[groupName], groupCharacterSets);

                callback(null, schemas);
            });
        };
    }

    callback(groupSchemaAPI);
}((api) => {
    typeof exports === 'undefined' ? this.groupSchemaAPI = api : module.exports = api;
}));
