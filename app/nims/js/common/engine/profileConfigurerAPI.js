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

'use strict';

/* eslint-disable func-names,prefer-rest-params */

((callback2) => {
    function profileConfigurerAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, CU, PC
        } = opts;

        function getPath(type) {
            if (type === 'character') return ['CharacterProfileStructure'];
            if (type === 'player') return ['PlayerProfileStructure'];
            return null;
        }

        const typeCheck = type => PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes)]);
        const itemTypeCheck = type => PC.chainCheck([PC.isString(type),
            PC.elementFromEnum(type, R.keys(Constants.profileFieldTypes))]);
        const playerAccessCheck = type => PC.chainCheck([PC.isString(type),
            PC.elementFromEnum(type, Constants.playerAccessTypes)]);

        LocalDBMS.prototype.getProfileStructure = function (type, callback) {
            this.getProfileStructureNew({type}).then(res => callback(null, res)).catch(callback);
        }
        LocalDBMS.prototype.getProfileStructureNew = function ({type}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    resolve(CU.clone(R.path(getPath(type), this.database)));
                });
            });
        };
        // profile configurer
        LocalDBMS.prototype.createProfileItem = function (type, name, itemType, selectedIndex, callback) {
            this.createProfileItemNew({type, name, itemType, selectedIndex}).then(res => callback()).catch(callback);
        };
        LocalDBMS.prototype.createProfileItemNew = function ({type, name, itemType, selectedIndex}={}) {
            return new Promise((resolve, reject) => {
                let chain = [typeCheck(type), PC.isString(name), PC.notEquals(name, 'name'),
                    PC.isNumber(selectedIndex), itemTypeCheck(itemType)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    chain = [PC.createEntityCheck2(name, container.map(R.prop('name')), 'entity-lifeless-name', 'entity-of-profile-item'), PC.isInRange(selectedIndex, 0, container.length)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        const { value } = Constants.profileFieldTypes[itemType];
                        const profileItem = {
                            name,
                            type: itemType,
                            value,
                            doExport: true,
                            playerAccess: 'hidden',
                            showInRoleGrid: false
                        };

                        container.splice(selectedIndex, 0, profileItem);
                        this.ee.trigger('createProfileItem', [{type, name, itemType, value}]);
                        resolve();
                    });
                });
            });
        };

        //profile configurer
        LocalDBMS.prototype.moveProfileItem = function (type, index, newIndex, callback) {
            this.moveProfileItemNew({type, index, newIndex}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.moveProfileItemNew = function ({type, index, newIndex}={}) {
            return new Promise((resolve, reject) => {
                let chain = [typeCheck(type), PC.isNumber(index), PC.isNumber(newIndex)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    chain = [PC.isInRange(index, 0, container.length - 1), PC.isInRange(newIndex, 0, container.length)];
                    PC.precondition(PC.chainCheck(chain), reject, () => {
                        if (newIndex > index) {
                            newIndex--;
                        }
                        const tmp = container[index];
                        container.splice(index, 1);
                        container.splice(newIndex, 0, tmp);
                        resolve();
                    });
                });
            });
        };
        // profile configurer
        LocalDBMS.prototype.removeProfileItem = function (type, index, profileItemName, callback) {
            this.removeProfileItemNew({type, index, profileItemName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.removeProfileItemNew = function ({type, index, profileItemName}={}) {
            return new Promise((resolve, reject) => {
                const chain = [typeCheck(type), PC.isNumber(index), PC.isString(profileItemName)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    const els = container.map((item, i) => `${i}/${item.name}`);
                    PC.precondition(PC.entityExists(`${index}/${profileItemName}`, els), reject, () => {
                        CU.removeFromArrayByIndex(container, index);
                        this.ee.trigger('removeProfileItem', arguments);
                        resolve();
                    });
                });
            });
        };
        // profile configurer
        LocalDBMS.prototype.changeProfileItemType = function (type, profileItemName, newType, callback) {
            this.changeProfileItemTypeNew({type, profileItemName, newType}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.changeProfileItemTypeNew = function ({type, profileItemName, newType}={}) {
            return new Promise((resolve, reject) => {
                const chain = [typeCheck(type), PC.isString(profileItemName), itemTypeCheck(newType)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
                        const profileItem = container.filter(elem => elem.name === profileItemName)[0];
                        profileItem.type = newType;
                        profileItem.value = Constants.profileFieldTypes[newType].value;
                        this.ee.trigger('changeProfileItemType', arguments);
                        resolve();
                    });
                });
            });
        };

        LocalDBMS.prototype.changeProfileItemPlayerAccess = function (
            type, profileItemName, playerAccessType, callback
        ) {
            this.changeProfileItemPlayerAccessNew({type, profileItemName, playerAccessType}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.changeProfileItemPlayerAccessNew = function (
            {type, profileItemName, playerAccessType}={}
        ) {
            return new Promise((resolve, reject) => {
                const chain = [typeCheck(type), PC.isString(profileItemName), playerAccessCheck(playerAccessType)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
                        const profileStructure = R.path(getPath(type), this.database);
                        const profileItem = R.find(R.propEq('name', profileItemName), profileStructure);
                        profileItem.playerAccess = playerAccessType;
                        resolve();
                    });
                });
            });
        };

        // profile configurer
        LocalDBMS.prototype.renameProfileItem = function (type, newName, oldName, callback) {
            this.renameProfileItemNew({type, newName, oldName}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.renameProfileItemNew = function ({type, newName, oldName}={}) {
            return new Promise((resolve, reject) => {
                PC.precondition(typeCheck(type), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.renameEntityCheck(oldName, newName, container.map(R.prop('name'))), reject, () => {
                        this.ee.trigger('renameProfileItem', arguments);
                        container.filter(elem => elem.name === oldName)[0].name = newName;
                        resolve();
                    });
                });
            });
        };

        LocalDBMS.prototype.doExportProfileItemChange = function (type, profileItemName, checked, callback) {
            this.doExportProfileItemChangeNew({type, profileItemName, checked}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.doExportProfileItemChangeNew = function ({type, profileItemName, checked}={}) {
            return new Promise((resolve, reject) => {
                const chain = [typeCheck(type), PC.isString(profileItemName), PC.isBoolean(checked)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
                        const profileItem = container.filter(elem => elem.name === profileItemName)[0];

                        profileItem.doExport = checked;
                        resolve();
                    });
                });
            });
        };

        LocalDBMS.prototype.showInRoleGridProfileItemChange = function (type, profileItemName, checked, callback) {
            this.showInRoleGridProfileItemChangeNew({type, profileItemName, checked}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.showInRoleGridProfileItemChangeNew = function ({type, profileItemName, checked}={}) {
            return new Promise((resolve, reject) => {
                const chain = [typeCheck(type), PC.isString(profileItemName), PC.isBoolean(checked)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
                        container.filter(R.pipe(R.prop('name'), R.equals(profileItemName)))[0].showInRoleGrid = checked;
                        resolve();
                    });
                });
            });
        };

        const typeSpecificPreconditions = (itemType, value) => {
            switch (itemType) {
            case 'text':
            case 'string':
            case 'checkbox':
            case 'number':
            case 'multiEnum':
                return PC.nil();
            case 'enum':
                return PC.isNotEmptyString(value);
            default:
                throw new Error(`Unexpected itemType ${itemType}`);
            }
        };

        // profile configurer
        LocalDBMS.prototype.updateDefaultValue = function (type, profileItemName, value, callback) {
            this.updateDefaultValueNew({type, profileItemName, value}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.updateDefaultValueNew = function ({type, profileItemName, value}={}) {
            return new Promise((resolve, reject) => {
                let chain = [typeCheck(type), PC.isString(profileItemName)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
                        const info = container.filter(R.compose(R.equals(profileItemName), R.prop('name')))[0];
                        chain = [PC.getValueCheck(info.type)(value), typeSpecificPreconditions(info.type, value)];
                        PC.precondition(PC.chainCheck(chain), reject, () => {
                            let newOptions, newOptionsMap, missedValues;

                            switch (info.type) {
                            case 'text':
                            case 'string':
                            case 'checkbox':
                                info.value = value;
                                break;
                            case 'number':
                                info.value = Number(value);
                                break;
                            case 'enum':
                            case 'multiEnum':
                                newOptions = R.uniq(value.split(',').map(R.trim));
                                missedValues = info.value.trim() === '' ? [] : R.difference(info.value.split(','), newOptions);
                                newOptionsMap = R.zipObj(newOptions, R.repeat(true, newOptions.length));

                                if (missedValues.length !== 0) {
                                    this.ee.trigger(info.type === 'enum' ? 'replaceEnumValue' : 'replaceMultiEnumValue', [{type, profileItemName, defaultValue: newOptions[0], newOptionsMap}]);
                                }

                                info.value = newOptions.join(',');
                                break;
                            default:
                                reject(new Errors.InternalError('errors-unexpected-switch-argument', [info.type]));
                            }
                            resolve();
                        });
                    });
                });
            });
        };

        LocalDBMS.prototype.renameEnumValue = function (type, profileItemName, fromValue, toValue, callback) {
            this.renameEnumValueNew({type, profileItemName, fromValue, toValue}).then(res => callback()).catch(callback);
        }
        LocalDBMS.prototype.renameEnumValueNew = function ({type, profileItemName, fromValue, toValue}={}) {
            return new Promise((resolve, reject) => {
                let chain = [typeCheck(type), PC.isString(profileItemName),
                    PC.isString(fromValue), PC.isString(toValue),
                    PC.isNotEmptyString(fromValue), PC.isNotEmptyString(toValue)];
                PC.precondition(PC.chainCheck(chain), reject, () => {
                    const container = R.path(getPath(type), this.database);
                    PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
                        const info = container.filter(R.compose(R.equals(profileItemName), R.prop('name')))[0];
                        chain = [PC.elementFromEnum(info.type, ['enum', 'multiEnum'])];
                        PC.precondition(PC.chainCheck(chain), reject, () => {
                            const list = info.value.trim() === '' ? [] : info.value.split(',');
                            chain = [PC.elementFromEnum(fromValue, list), PC.createEntityCheck(toValue, list)];
                            PC.precondition(PC.chainCheck(chain), reject, () => {
                                list[R.indexOf(fromValue, list)] = toValue;
                                info.value = list.join(',');
                                this.ee.trigger(info.type === 'enum' ? 'renameEnumValue' : 'renameMultiEnumValue', arguments);
                                resolve();
                            });
                        });
                    });
                });
            });
        }
    }
    callback2(profileConfigurerAPI);
})(api => (typeof exports === 'undefined' ? (this.profileConfigurerAPI = api) : (module.exports = api)));
