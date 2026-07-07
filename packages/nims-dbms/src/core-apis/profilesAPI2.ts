import * as R from "ramda";
import * as Constants from "../nimsConstants";
import { PC, CU, Errors } from "nims-dbms-core";
import { Database, ILocalDBMS, ProfileItem, Profiles, ProfileStructure, ProfileStructureItem } from "../domain";
import { ProfileFieldTypesNames, ProfileTypes } from "../nimsConstants";

// ((callback2) => {
//     function profilesAPI(LocalDBMS, opts) {
//         const {
//             R, Constants, Errors, addListener, CU, PC
//         } = opts;

function getPath(type: ProfileTypes) {
  if (type === "character") return ["Characters"];
  if (type === "player") return ["Players"];
  return null;
}
function getStructurePath(type) {
  if (type === "character") return ["CharacterProfileStructure"];
  if (type === "player") return ["PlayerProfileStructure"];
  return null;
}

function getProfiles(database: Database, type: ProfileTypes): Profiles {
  if (type === "character") {
    return database.Characters;
  }
  if (type === "player") {
    return database.Players;
  }
  throw new Error("unexpected type " + type);
}
function getProfileStructure(database: Database, type: ProfileTypes): ProfileStructure {
  if (type === "character") {
    return database.CharacterProfileStructure;
  }
  if (type === "player") {
    return database.PlayerProfileStructure;
  }
  throw new Error("unexpected type " + type);
}

const typeCheck = (type) => PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes)]);

export function getProfileNamesArray(this: ILocalDBMS, { type }: { type: ProfileTypes }) {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      resolve(Object.keys(getProfiles(this.database, type)).sort(CU.charOrdA));
    });
  });
}

// profile, preview
export function getProfile(this: ILocalDBMS, { type, name }: { type: ProfileTypes, name: string }): Promise<ProfileItem> {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      const container = getProfiles(this.database, type);
      PC.precondition(PC.entityExistsCheck(name, R.keys(container)), reject, () => {
        resolve(R.clone(container[name]));
      });
    });
  });
}
// social network, character filter
export function getAllProfiles(this: ILocalDBMS, { type }: { type: ProfileTypes }): Promise<Profiles> {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      resolve(R.clone(getProfiles(this.database, type)));
    });
  });
}

// profiles
export function createProfile(this: ILocalDBMS, { type, characterName }: { type: ProfileTypes, characterName: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      const container = getProfiles(this.database, type);
      PC.precondition(
        PC.createEntityCheck2(characterName, R.keys(container), "entity-living-name", `entity-of-${type}`),
        reject,
        () => {
          const newCharacter = {
            name: characterName,
          };
          getProfileStructure(this.database, type).forEach((profileSettings) => {
            if (profileSettings.type === "enum") {
              newCharacter[profileSettings.name] = profileSettings.value.split(",")[0];
            } else if (profileSettings.type === "multiEnum") {
              newCharacter[profileSettings.name] = "";
            } else {
              newCharacter[profileSettings.name] = profileSettings.value;
            }
          });
          getProfiles(this.database, type)[characterName] = newCharacter;
          this.ee.emit("createProfile", arguments);
          resolve();
        }
      );
    });
  });
}
// profiles
export function renameProfile(this: ILocalDBMS, { type, fromName, toName }: { type: ProfileTypes, fromName: string, toName: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      const container = getProfiles(this.database, type);
      PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container)), reject, () => {
        const data = container[fromName];
        data.name = toName;
        container[toName] = data;
        delete container[fromName];
        this.ee.emit("renameProfile", arguments);
        resolve();
      });
    });
  });
}

// profiles
export function removeProfile(this: ILocalDBMS, { type, characterName }: { type: ProfileTypes, characterName: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      const container = getProfiles(this.database, type);
      PC.precondition(PC.removeEntityCheck(characterName, R.keys(container)), reject, () => {
        delete container[characterName];
        this.ee.emit("removeProfile", arguments);
        resolve();
      });
    });
  });
}

const typeSpecificPreconditions = (itemType: ProfileFieldTypesNames, itemDesc: ProfileStructureItem, value) => {
  switch (itemType) {
    case "text":
    case "string":
    case "checkbox":
    case "number":
      return PC.nil();
    case "enum":
      // @ts-ignore
      return PC.elementFromEnum(value, itemDesc.value.split(","));
    case "multiEnum":
      // @ts-ignore
      return PC.eitherCheck(PC.elementsFromEnum(value.split(","), itemDesc.value.split(",")), PC.isEmptyString(value));
    default:
      throw new Error(`Unexpected itemType ${itemType}`);
  }
};

// profile editor
export function updateProfileField(
  this: ILocalDBMS,
  { type, characterName, fieldName, itemType, value }:
    { type: ProfileTypes, characterName: string, fieldName: string, itemType: ProfileFieldTypesNames, value }
): Promise<void> {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      const container = getProfiles(this.database, type);
      const containerStructure = getProfileStructure(this.database, type);
      const arr = [
        PC.entityExistsCheck(characterName, R.keys(container)),
        PC.entityExistsCheck(
          `${fieldName}/${itemType}`,
          containerStructure.map((item) => `${item.name}/${item.type}`)
        ),
        PC.getValueCheck(itemType)(value),
      ];
      PC.precondition(PC.chainCheck(arr), reject, () => {
        const itemDesc = containerStructure.find(((el) => el.name === fieldName))!;
        PC.precondition(typeSpecificPreconditions(itemType, itemDesc, value), reject, () => {
          const profileInfo = container[characterName];
          switch (itemType) {
            case "text":
            case "string":
            case "enum":
            case "multiEnum":
            case "checkbox":
              profileInfo[fieldName] = value;
              break;
            case "number":
              profileInfo[fieldName] = Number(value);
              break;
            default:
              reject(new Errors.InternalError("errors-unexpected-switch-argument", [itemType]));
          }
          resolve();
        });
      });
    });
  });
}

function _createProfileItem(this: ILocalDBMS, [{ type, name, itemType, value }] = []) {
  // throw new Error(arguments);
  const profileSet = getProfiles(this.database, type);
  // @ts-ignore
  Object.keys(profileSet).forEach((characterName) => {
    // @ts-ignore
    profileSet[characterName][name] = value;
  });
}

// addListener('createProfileItem', _createProfileItem);

function _removeProfileItem(this: ILocalDBMS, [{ type, index, profileItemName }] = []) {
  const profileSet = getProfiles(this.database, type);
  Object.keys(profileSet).forEach((characterName) => {
    delete profileSet[characterName][profileItemName];
  });
}

// addListener('removeProfileItem', _removeProfileItem);

function _changeProfileItemType(this: ILocalDBMS, [{ type, profileItemName, newType }] = []) {
  const profileSet = getProfiles(this.database, type);
  Object.keys(profileSet).forEach((characterName) => {
    profileSet[characterName][profileItemName] = Constants.profileFieldTypes[newType].value;
  });
}

// addListener('changeProfileItemType', _changeProfileItemType);

function _renameProfileItem(this: ILocalDBMS, [{ type, newName, oldName }] = []) {
  const profileSet = getProfiles(this.database, type);
  Object.keys(profileSet).forEach((characterName) => {
    const tmp = profileSet[characterName][oldName];
    delete profileSet[characterName][oldName];
    profileSet[characterName][newName] = tmp;
  });
}

// addListener('renameProfileItem', _renameProfileItem);

function _replaceEnumValue(this: ILocalDBMS, [{ type, profileItemName, defaultValue, newOptionsMap }] = []) {
  const profileSet = getProfiles(this.database, type);
  Object.keys(profileSet).forEach((characterName) => {
    const enumValue = profileSet[characterName][profileItemName];
    // @ts-ignore
    if (!newOptionsMap[enumValue]) {
      profileSet[characterName][profileItemName] = defaultValue;
    }
  });
}

// addListener('replaceEnumValue', _replaceEnumValue);

function _replaceMultiEnumValue(this: ILocalDBMS, [{ type, profileItemName, defaultValue, newOptionsMap }] = []) {
  const profileSet = getProfiles(this.database, type);
  Object.keys(profileSet).forEach((characterName) => {
    let value = profileSet[characterName][profileItemName];
    if (typeof value === "string" && value !== "") {
      const value2 = R.intersection(value.split(","), R.keys(newOptionsMap));
      profileSet[characterName][profileItemName] = value2.join(",");
    }
  });
}

// addListener('replaceMultiEnumValue', _replaceMultiEnumValue);

function _renameEnumValue(this: ILocalDBMS, [{ type, profileItemName, fromValue, toValue }] = []) {
  const profileSet = getProfiles(this.database, type);
  Object.keys(profileSet).forEach((characterName) => {
    const enumValue = profileSet[characterName][profileItemName];
    if (enumValue === fromValue) {
      profileSet[characterName][profileItemName] = toValue;
    }
  });
}
// addListener('renameEnumValue', _renameEnumValue);

function _renameMultiEnumValue(this: ILocalDBMS, [{ type, profileItemName, fromValue, toValue }] = []) {
  const profileSet = getProfiles(this.database, type);
  Object.keys(profileSet).forEach((characterName) => {
    const value = profileSet[characterName][profileItemName];
    if (typeof value === "string" && value !== "") {
      const list = value.split(",");
      if (R.includes(fromValue, list)) {
        list[R.indexOf(fromValue, list)] = toValue;
        profileSet[characterName][profileItemName] = list.join(",");
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
