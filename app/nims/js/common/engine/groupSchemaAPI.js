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

/* eslint-disable func-names,no-continue */

((callback2) => {
    function groupSchemaAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors
        } = opts;

        const _isGroupsEqualByFilterModel = (fm1, fm2) => {
            const fmMap1 = R.indexBy(R.prop('name'), fm1);
            const fmMap2 = R.indexBy(R.prop('name'), fm2);
            return R.equals(fmMap1, fmMap2);
        };
        const _isGroupsEqualByElements = (els1, els2) => R.symmetricDifference(R.keys(els1), R.keys(els2)).length === 0;
        const _isSuperGroupByElements = (subGroupEls, superGroupEls) => R.difference(R.keys(subGroupEls), R.keys(superGroupEls)).length === 0;
        const _isSuperGroupByFilterModel = (subGroupFm, superGroupFm) => {
            const subMap = R.indexBy(R.prop('name'), subGroupFm);
            const superMap = R.indexBy(R.prop('name'), superGroupFm);
            const subKeys = R.keys(subMap);
            const superKeys = R.keys(superMap);
            if (superKeys.length === 0) {
                return true;
            }
            if (R.difference(superKeys, subKeys).length !== 0) {
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
                    return R.difference(
                        R.keys(subItem.selectedOptions),
                        R.keys(superItem.selectedOptions)
                    ).length === 0;
                case 'number':
                    if (subItem.condition === 'greater' && superItem.condition === 'lesser') {
                        return false;
                    }
                    if (subItem.condition === 'lesser' && superItem.condition === 'greater') {
                        return false;
                    }
                    if (subItem.condition === 'lesser' && superItem.condition === 'equal') {
                        return false;
                    }
                    if (subItem.condition === 'greater' && superItem.condition === 'equal') {
                        return false;
                    }
                    if (subItem.condition === 'equal' && superItem.condition === 'greater') {
                        return subItem.num > superItem.num;
                    }
                    if (subItem.condition === 'equal' && superItem.condition === 'lesser') {
                        return subItem.num < superItem.num;
                    }

                    if (subItem.condition === 'equal' && superItem.condition === 'equal') {
                        return subItem.num === superItem.num;
                    }
                    if (subItem.condition === 'greater' && superItem.condition === 'greater') {
                        return subItem.num >= superItem.num;
                    }
                    if (subItem.condition === 'lesser' && superItem.condition === 'lesser') {
                        return subItem.num <= superItem.num;
                    }
                    break;
                case 'multiEnum':
                    // fix rest problems
                    if (subItem.condition === 'every' && superItem.condition === 'some') {
                        return false;
                    }
                    if (subItem.condition === 'some' && superItem.condition === 'every') {
                        return false;
                    }

                    if (subItem.condition === 'every' && superItem.condition === 'equal') {
                        //                        return R.keys(subItem.selectedOptions).length === 0;
                        //                          if(R.keys(subItem.selectedOptions).length === 0){
                        //                              return true;
                        //                          }
                        //                        return R.difference(
                        //                            R.keys(subItem.selectedOptions),
                        //                            R.keys(superItem.selectedOptions)
                        //                        ).length === 0;
                        return false;
                    }
                    if (subItem.condition === 'equal' && superItem.condition === 'every') {
                        return R.difference(
                            R.keys(superItem.selectedOptions),
                            R.keys(subItem.selectedOptions)
                        ).length === 0;
                        //                        if(R.keys(subItem.selectedOptions).length === 0){
                        //                            return true;
                        //                        }
                        //                        return R.difference(
                        //                            R.keys(subItem.selectedOptions),
                        //                            R.keys(superItem.selectedOptions)
                        //                        ).length === 0;
                        return false;
                    }

                    if (subItem.condition === 'some' && superItem.condition === 'equal') {
                        return false;
                    }
                    if (subItem.condition === 'equal' && superItem.condition === 'some') {
                        return false;
                    }

                    if (subItem.condition === 'every' && superItem.condition === 'every') {
                        if (R.keys(superItem.selectedOptions).length === 0) {
                            return false;
                        }
                        if (R.keys(subItem.selectedOptions).length === 0) {
                            return true;
                        }
                        return R.difference(
                            R.keys(superItem.selectedOptions),
                            R.keys(subItem.selectedOptions)
                        ).length === 0;
                    }
                    if (subItem.condition === 'equal' && superItem.condition === 'equal') {
                        return R.symmetricDifference(
                            R.keys(superItem.selectedOptions),
                            R.keys(subItem.selectedOptions)
                        ).length === 0;
                    }
                    if (subItem.condition === 'some' && superItem.condition === 'some') {
                        return R.difference(
                            R.keys(subItem.selectedOptions),
                            R.keys(superItem.selectedOptions)
                        ).length === 0;
                    }
                    break;
                default:
                    throw new Error(`Unexpected type ${superItem.type}`);
                }
                throw new Error();
            });
        };

        const _removeSuperSuperGroups = (superGroups) => {
            R.values(superGroups).forEach((superGroupSet) => {
                const superGroupKeys = R.keys(superGroupSet);
                for (let i = 0; i < superGroupKeys.length; ++i) {
                    for (let j = 0; j < superGroupKeys.length; ++j) {
                        if (i === j) continue;
                        const subGroup = superGroupKeys[i];
                        const superGroup = superGroupKeys[j];
                        if (superGroups[subGroup][superGroup]) {
                            delete superGroupSet[superGroup];
                        }
                    }
                }
            });
        };

        const _makeGraph = (equalGroups, superGroups, groupCharacterSets) => {
            const levels = {};
            function getLevel(groupName) {
                if (levels[groupName]) {
                    return levels[groupName];
                }
                const supers = R.keys(superGroups[groupName]);
                if (supers.length === 0) {
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

        const _makeGroupSchema = (groups, _isGroupsEqual, _isSuperGroup, _extractKeyInfo, groupCharacterSets) => {
            const groupNames = R.keys(groups);
            const groupNamesSet = R.zipObj(groupNames, R.repeat(true, groupNames.length));
            const equalGroups = {};

            for (let i = 0; i < groupNames.length; ++i) {
                const groupName1 = groupNames[i];
                if (groupNamesSet[groupName1]) {
                    for (let j = i + 1; j < groupNames.length; ++j) {
                        const groupName2 = groupNames[j];
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
            for (let i = 0; i < uniqueGroups.length; ++i) {
                for (let j = 0; j < uniqueGroups.length; ++j) {
                    if (i === j) continue;
                    const groupName1 = uniqueGroups[i];
                    const groupName2 = uniqueGroups[j];
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

        LocalDBMS.prototype.getGroupSchemas = function () {
            return new Promise((resolve, reject) => {
                const that = this;
                this.getGroupCharacterSets().then((groupCharacterSets) => {
                    const schemas = {};
                    const groups = that.database.Groups;

                    schemas.theory = _makeGroupSchema(
                        groups, _isGroupsEqualByFilterModel, _isSuperGroupByFilterModel,
                        groupName => groups[groupName].filterModel, groupCharacterSets
                    );

                    schemas.practice = _makeGroupSchema(
                        groups, _isGroupsEqualByElements, _isSuperGroupByElements,
                        groupName => groupCharacterSets[groupName], groupCharacterSets
                    );

                    resolve(schemas);
                }).catch(reject);
            });
        };
    }

    callback2(groupSchemaAPI);
})(api => (typeof exports === 'undefined' ? (this.groupSchemaAPI = api) : (module.exports = api)));
