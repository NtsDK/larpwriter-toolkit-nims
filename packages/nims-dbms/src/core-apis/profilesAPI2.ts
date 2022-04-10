import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC, CU, Errors } from "nims-dbms-core";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function profilesAPI(LocalDBMS, opts) {
//         const {
//             R, Constants, Errors, addListener, CU, PC
//         } = opts;

function getPath(type) {
    if (type === 'character') return ['Characters'];
    if (type === 'player') return ['Players'];
    return null;
}
function getStructurePath(type) {
    if (type === 'character') return ['CharacterProfileStructure'];
    if (type === 'player') return ['PlayerProfileStructure'];
    return null;
}

const typeCheck = type => PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes)]);

export function getProfileNamesArray(this: ILocalDBMS, { type }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(typeCheck(type), reject, () => {
          // @ts-ignore
            resolve(Object.keys(R.path(getPath(type), this.database)).sort(CU.charOrdA));
        });
    });
};

// profile, preview
export function getProfile(this: ILocalDBMS, { type, name }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(typeCheck(type), reject, () => {
          // @ts-ignore
            const container = R.path(getPath(type), this.database);
            PC.precondition(PC.entityExistsCheck(name, R.keys(container)), reject, () => {
              // @ts-ignore  
              resolve(R.clone(container[name]));
            });
        });
    });
};
// social network, character filter
export function getAllProfiles(this: ILocalDBMS, { type }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(typeCheck(type), reject, () => {
          // @ts-ignore
            resolve(R.clone(R.path(getPath(type), this.database)));
        });
    });
};

// profiles
export function createProfile(this: ILocalDBMS, { type, characterName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(typeCheck(type), reject, () => {
          // @ts-ignore
            const container = R.path(getPath(type), this.database);
            PC.precondition(PC.createEntityCheck2(characterName, R.keys(container), 'entity-living-name', `entity-of-${type}`), reject, () => {
                const newCharacter = {
                    name: characterName
                };
                // @ts-ignore
                R.path(getStructurePath(type), this.database).forEach((profileSettings) => {
                    if (profileSettings.type === 'enum') {
                        newCharacter[profileSettings.name] = profileSettings.value.split(',')[0];
                    } else if (profileSettings.type === 'multiEnum') {
                        newCharacter[profileSettings.name] = '';
                    } else {
                        newCharacter[profileSettings.name] = profileSettings.value;
                    }
                });
                // @ts-ignore
                R.path(getPath(type), this.database)[characterName] = newCharacter;
                this.ee.emit('createProfile', arguments);
                resolve();
            });
        });
    });
};
// profiles
export function renameProfile(this: ILocalDBMS, { type, fromName, toName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(typeCheck(type), reject, () => {
          // @ts-ignore
            const container = R.path(getPath(type), this.database);
            PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container)), reject, () => {
              // @ts-ignore  
              const data = container[fromName];
                data.name = toName;
                // @ts-ignore
                container[toName] = data;
                // @ts-ignore
                delete container[fromName];
                this.ee.emit('renameProfile', arguments);
                resolve();
            });
        });
    });
};

// profiles
export function removeProfile(
  this: ILocalDBMS, 
  { type, characterName }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(typeCheck(type), reject, () => {
          // @ts-ignore
            const container = R.path(getPath(type), this.database);
            PC.precondition(PC.removeEntityCheck(characterName, R.keys(container)), reject, () => {
              // @ts-ignore  
              delete container[characterName];
                this.ee.emit('removeProfile', arguments);
                resolve();
            });
        });
    });
};

const typeSpecificPreconditions = (itemType, itemDesc, value) => {
    switch (itemType) {
    case 'text':
    case 'string':
    case 'checkbox':
    case 'number':
        return PC.nil();
    case 'enum':
        return PC.elementFromEnum(value, itemDesc.value.split(','));
    case 'multiEnum':
        return PC.eitherCheck(
            PC.elementsFromEnum(value.split(','), itemDesc.value.split(',')),
            PC.isEmptyString(value)
        );
    default:
        throw new Error(`Unexpected itemType ${itemType}`);
    }
};

// profile editor
export function updateProfileField(this: ILocalDBMS, {
    type, characterName, fieldName, itemType, value
}: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(typeCheck(type), reject, () => {
          // @ts-ignore
            const container = R.path(getPath(type), this.database);
            // @ts-ignore
            const containerStructure = R.path(getStructurePath(type), this.database);
            const arr = [PC.entityExistsCheck(characterName, R.keys(container)),
                PC.entityExistsCheck(
                    `${fieldName}/${itemType}`,
                    // @ts-ignore
                    containerStructure.map(item => `${item.name}/${item.type}`)
                ),
                PC.getValueCheck(itemType)(value)];
            PC.precondition(PC.chainCheck(arr), reject, () => {
              // @ts-ignore
                const itemDesc = R.find(R.propEq('name', fieldName), containerStructure);
                PC.precondition(typeSpecificPreconditions(itemType, itemDesc, value), reject, () => {
                  // @ts-ignore  
                  const profileInfo = container[characterName];
                    switch (itemType) {
                    case 'text':
                    case 'string':
                    case 'enum':
                    case 'multiEnum':
                    case 'checkbox':
                        profileInfo[fieldName] = value;
                        break;
                    case 'number':
                        profileInfo[fieldName] = Number(value);
                        break;
                    default:
                        reject(new Errors.InternalError('errors-unexpected-switch-argument', [itemType]));
                    }
                    resolve();
                });
            });
        });
    });
};

function _createProfileItem(this: ILocalDBMS, [{
    type, name, itemType, value
}] = []) {
    // throw new Error(arguments);
    // @ts-ignore
    const profileSet = R.path(getPath(type), this.database);
    // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        profileSet[characterName][name] = value;
    });
}



// addListener('createProfileItem', _createProfileItem);

function _removeProfileItem(this: ILocalDBMS, [{ type, index, profileItemName }] = []) {
  // @ts-ignore  
  const profileSet = R.path(getPath(type), this.database);
  // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        delete profileSet[characterName][profileItemName];
    });
}

// addListener('removeProfileItem', _removeProfileItem);

function _changeProfileItemType(this: ILocalDBMS, [{ type, profileItemName, newType }] = []) {
  // @ts-ignore
    const profileSet = R.path(getPath(type), this.database);
    // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        profileSet[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
    });
}

// addListener('changeProfileItemType', _changeProfileItemType);

function _renameProfileItem(this: ILocalDBMS, [{ type, newName, oldName }] = []) {
  // @ts-ignore
    const profileSet = R.path(getPath(type), this.database);
    // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        const tmp = profileSet[characterName][oldName];
        // @ts-ignore
        delete profileSet[characterName][oldName];
        // @ts-ignore
        profileSet[characterName][newName] = tmp;
    });
}

// addListener('renameProfileItem', _renameProfileItem);

function _replaceEnumValue(this: ILocalDBMS, [{
    type, profileItemName, defaultValue, newOptionsMap
}] = []) {
  // @ts-ignore
    const profileSet = R.path(getPath(type), this.database);
    // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        const enumValue = profileSet[characterName][profileItemName];
        if (!newOptionsMap[enumValue]) {
          // @ts-ignore
            profileSet[characterName][profileItemName] = defaultValue;
        }
    });
}

// addListener('replaceEnumValue', _replaceEnumValue);

function _replaceMultiEnumValue(this: ILocalDBMS, [{
    type, profileItemName, defaultValue, newOptionsMap
}] = []) {
  // @ts-ignore
    const profileSet = R.path(getPath(type), this.database);
    // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        let value = profileSet[characterName][profileItemName];
        if (value !== '') {
            value = R.intersection(value.split(','), R.keys(newOptionsMap));
            // @ts-ignore
            profileSet[characterName][profileItemName] = value.join(',');
        }
    });
}

// addListener('replaceMultiEnumValue', _replaceMultiEnumValue);

function _renameEnumValue(this: ILocalDBMS, [{
    type, profileItemName, fromValue, toValue
}] = []) {
  // @ts-ignore
    const profileSet = R.path(getPath(type), this.database);
    // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        const enumValue = profileSet[characterName][profileItemName];
        if (enumValue === fromValue) {
          // @ts-ignore
            profileSet[characterName][profileItemName] = toValue;
        }
    });
}
// addListener('renameEnumValue', _renameEnumValue);

function _renameMultiEnumValue(this: ILocalDBMS, [{
    type, profileItemName, fromValue, toValue
}] = []) {
  // @ts-ignore
    const profileSet = R.path(getPath(type), this.database);
    // @ts-ignore
    Object.keys(profileSet).forEach((characterName) => {
      // @ts-ignore
        const value = profileSet[characterName][profileItemName];
        if (value !== '') {
            const list = value.split(',');
            if (R.contains(fromValue, list)) {
                list[R.indexOf(fromValue, list)] = toValue;
                // @ts-ignore
                profileSet[characterName][profileItemName] = list.join(',');
            }
        }
    });
}
// addListener('renameMultiEnumValue', _renameMultiEnumValue);
//     }

//     callback2(profilesAPI);
// })(api => (typeof exports === 'undefined' ? (this.profilesAPI = api) : (module.exports = api)));

export const listeners = {
  createProfileItem: _createProfileItem,
  removeProfileItem: _removeProfileItem,
  changeProfileItemType: _changeProfileItemType,
  renameProfileItem: _renameProfileItem,
  replaceEnumValue: _replaceEnumValue,
  replaceMultiEnumValue: _replaceMultiEnumValue,
  renameEnumValue: _renameEnumValue,
  renameMultiEnumValue: _renameMultiEnumValue,
};