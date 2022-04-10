import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC, CU, Errors } from "nims-dbms-core";
import * as PU from "../db-utils/projectUtils";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function groupsAPI(LocalDBMS, opts) {
//         const {
//             addListener
//         } = opts;

export function getGroupNamesArray (this: ILocalDBMS) {
    return Promise.resolve(Object.keys(this.database.Groups).sort(CU.charOrdA));
};
// DBMS.groups.names.get()
const groupCheck = (groupName, database) => PC.chainCheck([PC.isString(groupName),
    PC.entityExists(groupName, R.keys(database.Groups))]);

//        [
//            {
//                name: 'groupName',
//                check: [{
//                    type: 'isString'
//                }, {
//                    type: 'entityExists',
//                    arr: (db) => R.keys(db.Groups)
//                }]
//            }
//        ]
// DBMS.groups[].get()
export function getGroup(this: ILocalDBMS, { groupName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(groupCheck(groupName, this.database), reject, () => {
            resolve(R.clone(this.database.Groups[groupName]));
        });
    });
};

const _getCharacterGroupTexts = (groups, info, profileId) => {
    const dataArray = PU.getDataArray(info, profileId);
    const array = R.values(groups)
        .filter(group => group.doExport && PU.acceptDataRow(group.filterModel, dataArray)).map(group => ({
            groupName: group.name,
            text: group.characterDescription
        }));
    array.sort(CU.charOrdAFactory(R.prop('groupName')));
    return array;
};

// preview
// DBMS.groups.find({characterName}).get({characterText})
export function getCharacterGroupTexts(this: ILocalDBMS, { characterName }: any = {}) {
    return new Promise((resolve, reject) => {
        Promise.all([
            // @ts-ignore
            this.getProfileBinding({ type: 'character', name: characterName }),
            // @ts-ignore
            this.getProfileFilterInfo()
        ]).then((results) => {
            const [profileId, info] = results;
            resolve(_getCharacterGroupTexts(this.database.Groups, info, profileId));
        }).catch(reject);
    });
};

// export
// DBMS.group.groupBy({characterName}).map({characterText})
export function getAllCharacterGroupTexts (this: ILocalDBMS) {
    return new Promise((resolve, reject) => {
        const that = this;
        Promise.all([
            // @ts-ignore
            this.getProfileFilterInfo(),
            // @ts-ignore
            this.getProfileBindings()
        ]).then((results) => {
            const [info, bindings] = results;
            const texts = Object.keys(that.database.Characters).reduce((result, characterName) => {
                const profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
                result[characterName] = _getCharacterGroupTexts(that.database.Groups, info, profileId);
                return result;
            }, {});
            resolve(texts);
        }).catch(reject);
    });
};

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'stringIsNotEmpty'
//          }, {
//              type: 'entityIsNotUsed',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      }
//  ]
// DBMS.groups.create({name})
export function createGroup (this: ILocalDBMS, { groupName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.createEntityCheck2(groupName, R.keys(this.database.Groups), 'entity-lifeless-name', 'entity-of-group'), reject, () => {
            const newGroup = {
                name: groupName,
                masterDescription: '',
                characterDescription: '',
                filterModel: [],
                doExport: true
            };

            this.database.Groups[groupName] = newGroup;
            this.ee.emit('createGroup', arguments);
            resolve();
        });
    });
};

//  [
//      {
//          name: 'fromName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//      {
//          name: 'toName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'stringIsNotEmpty'
//          }, {
//              type: 'entityIsNotUsed',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      }
//  ]
// DBMS.groups[name].rename({newName})
export function renameGroup(this: ILocalDBMS, { fromName, toName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(this.database.Groups)), reject, () => {
            const data = this.database.Groups[fromName];
            data.name = toName;
            this.database.Groups[toName] = data;
            delete this.database.Groups[fromName];
            this.ee.emit('renameGroup', arguments);
            resolve();
        });
    });
};

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//  ]
// DBMS.groups.remove({name})
export function removeGroup(this: ILocalDBMS, { groupName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.removeEntityCheck(groupName, R.keys(this.database.Groups)), reject, () => {
            delete this.database.Groups[groupName];
            this.ee.emit('removeGroup', arguments);
            resolve();
        });
    });
};

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//  ]
// DBMS.groups[name].filter.set({filter})
export function saveFilterToGroup(this: ILocalDBMS, { groupName, filterModel }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(groupCheck(groupName, this.database), reject, () => {
            const conflictTypes = PU.isFilterModelCompatibleWithProfiles({
                characters: this.database.CharacterProfileStructure,
                players: this.database.PlayerProfileStructure
            }, filterModel);
            if (conflictTypes.length !== 0) {
                reject(new Errors.ValidationError('groups-page-filter-is-incompatible-with-base-profiles', [conflictTypes.join(',')]));
                return;
            }
            this.database.Groups[groupName].filterModel = filterModel;
            resolve();
        });
    });
};

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//      {
//          name: 'fieldName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'elementFromEnum',
//              arr: Constants.groupEditableItems
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isString'
//          }]
//      },
//  ]
// DBMS.groups[name][fieldName].set({value})
export function updateGroupField(this: ILocalDBMS, { groupName, fieldName, value }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = PC.chainCheck([groupCheck(groupName, this.database),
            PC.isString(fieldName), PC.elementFromEnum(fieldName, Constants.groupEditableItems),
            PC.isString(value)]);
        PC.precondition(chain, reject, () => {
            const profileInfo = this.database.Groups[groupName];
            profileInfo[fieldName] = value;
            resolve();
        });
    });
};

//  [
//      {
//          name: 'groupName',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'entityExists',
//              arr: (db) => R.keys(db.Groups)
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isBoolean'
//          }]
//      },
//  ]
export function doExportGroup(this: ILocalDBMS, { groupName, value }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = PC.chainCheck([groupCheck(groupName, this.database), PC.isBoolean(value)]);
        PC.precondition(chain, reject, () => {
            const profileInfo = this.database.Groups[groupName];
            profileInfo.doExport = value;
            resolve();
        });
    });
};

const initProfileInfo = (that, type, ownerMapType) => new Promise((resolve, reject) => {
    Promise.all([
        that.getAllProfiles({ type }),
        that.getProfileStructure({ type }),
    ]).then((results) => {
        const [profiles, profileStructure] = results;
        let owners = R.keys(profiles);
        if (that._getOwnerMap) {
            owners = that._getOwnerMap(ownerMapType);
        } else {
            // @ts-ignore
            owners = R.zipObj(owners, R.repeat('user', owners.length));
        }
        resolve({
            profileStructure,
            owners,
            profiles
        });
    }).catch(reject);
});

// DBMS.groups.profileFilterInfo.get()
export function getProfileFilterInfo(this: ILocalDBMS) {
    return new Promise((resolve, reject) => {
        const that = this;
        Promise.all([
            initProfileInfo(that, 'character', 'Characters'),
            initProfileInfo(that, 'player', 'Players'),
            // @ts-ignore
            that.getCharactersSummary(),
            // @ts-ignore
            that.getExtendedProfileBindings(),
        ]).then((results) => {
            const [charactersInfo, playersInfo, charactersSummary, bindingData] = results;
            const info = PU.makeGroupedProfileFilterInfo({
                characters: charactersInfo,
                players: playersInfo,
                charactersSummary,
                bindingData
            });
            resolve(info);
        }).catch(reject);
    });
};

const _getGroupCharacterSets = (groups, characterNames, bindings, info) => {
    const groupNames = R.keys(groups);
    // @ts-ignore
    const groupCharacterSets = R.zipObj(groupNames, R.ap([R.clone], R.repeat({}, groupNames.length)));
    characterNames.forEach((characterName) => {
        const profileId = bindings[characterName] === undefined ? [characterName, ''] : [characterName, bindings[characterName]];
        const dataArray = PU.getDataArray(info, profileId);
        groupNames.forEach((groupName) => {
            if (PU.acceptDataRow(groups[groupName].filterModel, dataArray)) {
                // @ts-ignore
                groupCharacterSets[groupName][characterName] = true;
            }
        });
    });
    return groupCharacterSets;
};

export function getGroupCharacterSets(this: ILocalDBMS) {
    return new Promise((resolve, reject) => {
        const that = this;
        // @ts-ignore
        this.getProfileFilterInfo().then((info) => {
            resolve(_getGroupCharacterSets(
                that.database.Groups, R.keys(that.database.Characters),
                R.clone(that.database.ProfileBindings), info
            ));
        }).catch(reject);
    });
};

function _removeProfileItem(this: ILocalDBMS, [{ type, index, profileItemName }] = []) {
    const prefix = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX);
    const subFilterName = prefix + profileItemName;
    const that = this;
    Object.keys(this.database.Groups).forEach((groupName) => {
        const group = that.database.Groups[groupName];
        group.filterModel = group.filterModel.filter(filterItem => filterItem.name !== subFilterName);
    });
}


// addListener('removeProfileItem', _removeProfileItem);

function _changeProfileItemType(this: ILocalDBMS, [{ type, profileItemName, newType }] = []) {
    _removeProfileItem.call(this, [{ type, index: -1, profileItemName }]);
    // _removeProfileItem.apply(this, [{type, index: -1, profileItemName}]);
}

// addListener('changeProfileItemType', _changeProfileItemType);

function _renameProfileItem(this: ILocalDBMS, [{ type, newName, oldName }] = []) {
    const prefix = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX);
    const subFilterName = prefix + oldName;
    const that = this;
    Object.keys(this.database.Groups).forEach((groupName) => {
        const group = that.database.Groups[groupName];
        group.filterModel = group.filterModel.map((filterItem) => {
            if (filterItem.name === subFilterName) {
                filterItem.name = prefix + newName;
            }
            return filterItem;
        });
    });
}

// addListener('renameProfileItem', _renameProfileItem);

function _replaceEnumValue(this: ILocalDBMS, [{
    type, profileItemName, defaultValue, newOptionsMap
}] = []) {
    const subFilterName = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX)
        + profileItemName;
    const that = this;
    Object.keys(this.database.Groups).forEach((groupName) => {
        const group = that.database.Groups[groupName];
        group.filterModel.forEach((filterItem) => {
            if (filterItem.name === subFilterName) {
                R.keys(filterItem.selectedOptions).forEach((selectedOption) => {
                    if (!newOptionsMap[selectedOption]) {
                        delete filterItem.selectedOptions[selectedOption];
                    }
                });
            }
        });
    });
    Object.keys(this.database.Groups).forEach((groupName) => {
        const group = that.database.Groups[groupName];
        group.filterModel = group.filterModel.filter((filterItem) => {
            if (filterItem.name !== subFilterName) {
                return true;
            }
            return Object.keys(filterItem.selectedOptions).length !== 0;
        });
    });
}

// addListener('replaceEnumValue', _replaceEnumValue);

// addListener('replaceMultiEnumValue', _replaceEnumValue);

function _renameEnumValue(this: ILocalDBMS, [{
    type, profileItemName, fromValue, toValue
}] = []) {
    const subFilterName = (type === 'character' ? Constants.CHAR_PREFIX : Constants.PLAYER_PREFIX)
        + profileItemName;
    const that = this;
    Object.keys(this.database.Groups).forEach((groupName) => {
        const group = that.database.Groups[groupName];
        group.filterModel.forEach((filterItem) => {
            if (filterItem.name === subFilterName) {
                if (filterItem.selectedOptions[fromValue]) {
                    delete filterItem.selectedOptions[fromValue];
                    filterItem.selectedOptions[toValue] = true;
                }
            }
        });
    });
}

// addListener('renameEnumValue', _renameEnumValue);

// addListener('renameMultiEnumValue', _renameEnumValue);


export const listeners = {
  removeProfileItem: _removeProfileItem,
  changeProfileItemType: _changeProfileItemType,
  renameProfileItem: _renameProfileItem,
  replaceEnumValue: _replaceEnumValue,
  replaceMultiEnumValue: _replaceEnumValue,
  renameEnumValue: _renameEnumValue,
  renameMultiEnumValue: _renameEnumValue,
};