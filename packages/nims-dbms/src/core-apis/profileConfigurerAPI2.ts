import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC, CU, Errors } from "nims-dbms-core";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//   function profileConfigurerAPI(LocalDBMS, opts) {
//     const {
//       R, Constants, Errors, CU, PC
//     } = opts;

function getPath(type) {
  if (type === 'character') return ['CharacterProfileStructure'];
  if (type === 'player') return ['PlayerProfileStructure'];
  return null;
}

const typeCheck = (type) => PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes)]);
const itemTypeCheck = (type) => PC.chainCheck([PC.isString(type),
  PC.elementFromEnum(type, R.keys(Constants.profileFieldTypes))]);
const playerAccessCheck = (type) => PC.chainCheck([PC.isString(type),
  PC.elementFromEnum(type, Constants.playerAccessTypes)]);

export function getProfileStructure (this: ILocalDBMS, { type }: any = {}) {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      // @ts-ignore
      resolve(R.clone(R.path(getPath(type), this.database)));
    });
  });
};
// profile configurer
export function createProfileItem (
  this: ILocalDBMS,
  { type, name, itemType, selectedIndex }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    let chain = [typeCheck(type), PC.isString(name), PC.notEquals(name, 'name'),
      PC.isNumber(selectedIndex), itemTypeCheck(itemType)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
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

        // @ts-ignore
        container.splice(selectedIndex, 0, profileItem);
        this.ee.emit('createProfileItem', [{
          type, name, itemType, value
        }]);
        resolve();
      });
    });
  });
};

//profile configurer
export function moveProfileItem(
  this: ILocalDBMS, 
  { type, index, newIndex }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    let chain = [typeCheck(type), PC.isNumber(index), PC.isNumber(newIndex)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      chain = [PC.isInRange(index, 0, container.length - 1), PC.isInRange(newIndex, 0, container.length)];
      PC.precondition(PC.chainCheck(chain), reject, () => {
        // if (newIndex > index) {
        //     newIndex--;
        // }
        // @ts-ignore
        const tmp = container[index];
        // @ts-ignore
        container.splice(index, 1);
        // @ts-ignore
        container.splice(newIndex, 0, tmp);
        resolve();
      });
    });
  });
};
// profile configurer
export function removeProfileItem(
  this: ILocalDBMS, 
  { type, index, profileItemName }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const chain = [typeCheck(type), PC.isNumber(index), PC.isString(profileItemName)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      const els = container.map((item, i) => `${i}/${item.name}`);
      PC.precondition(PC.entityExists(`${index}/${profileItemName}`, els), reject, () => {
        // @ts-ignore
        CU.removeFromArrayByIndex(container, index);
        this.ee.emit('removeProfileItem', arguments);
        resolve();
      });
    });
  });
};
// profile configurer
export function changeProfileItemType (
  this: ILocalDBMS,
  { type, profileItemName, newType }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const chain = [typeCheck(type), PC.isString(profileItemName), itemTypeCheck(newType)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
        // @ts-ignore
        const profileItem = container.filter((elem) => elem.name === profileItemName)[0];
        profileItem.type = newType;
        profileItem.value = Constants.profileFieldTypes[newType].value;
        this.ee.emit('changeProfileItemType', arguments);
        resolve();
      });
    });
  });
};

export function changeProfileItemPlayerAccess (
  this: ILocalDBMS,
  { type, profileItemName, playerAccessType }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const chain = [typeCheck(type), PC.isString(profileItemName), playerAccessCheck(playerAccessType)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
        // @ts-ignore
        const profileStructure = R.path(getPath(type), this.database);
        // @ts-ignore
        const profileItem = R.find(R.propEq('name', profileItemName), profileStructure);
        // @ts-ignore
        profileItem.playerAccess = playerAccessType;
        resolve();
      });
    });
  });
};

// profile configurer
export function renameProfileItem (
  this: ILocalDBMS, 
  { type, newName, oldName }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    PC.precondition(typeCheck(type), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      PC.precondition(PC.renameEntityCheck(oldName, newName, container.map(R.prop('name'))), reject, () => {
        this.ee.emit('renameProfileItem', arguments);
        // @ts-ignore
        container.filter((elem) => elem.name === oldName)[0].name = newName;
        resolve();
      });
    });
  });
};

export function doExportProfileItemChange (
  this: ILocalDBMS,
  { type, profileItemName, checked }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const chain = [typeCheck(type), PC.isString(profileItemName), PC.isBoolean(checked)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
        // @ts-ignore
        const profileItem = container.filter((elem) => elem.name === profileItemName)[0];

        profileItem.doExport = checked;
        resolve();
      });
    });
  });
};

export function showInRoleGridProfileItemChange (
  this: ILocalDBMS, 
  { type, profileItemName, checked }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const chain = [typeCheck(type), PC.isString(profileItemName), PC.isBoolean(checked)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
        // @ts-ignore
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
export function updateDefaultValue (
  this: ILocalDBMS, 
  { type, profileItemName, value }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    let chain = [typeCheck(type), PC.isString(profileItemName)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
        // @ts-ignore
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
              this.ee.emit(info.type === 'enum' ? 'replaceEnumValue' : 'replaceMultiEnumValue', [{
                type, profileItemName, defaultValue: newOptions[0], newOptionsMap
              }]);
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

export function renameEnumValue (
  this: ILocalDBMS, 
  { type, profileItemName, fromValue, toValue }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    let chain = [typeCheck(type), PC.isString(profileItemName),
      PC.isString(fromValue), PC.isString(toValue),
      PC.isNotEmptyString(fromValue), PC.isNotEmptyString(toValue)];
    PC.precondition(PC.chainCheck(chain), reject, () => {
      // @ts-ignore
      const container = R.path(getPath(type), this.database);
      // @ts-ignore
      PC.precondition(PC.entityExists(profileItemName, container.map(R.prop('name'))), reject, () => {
        // @ts-ignore
        const info = container.filter(R.compose(R.equals(profileItemName), R.prop('name')))[0];
        chain = [PC.elementFromEnum(info.type, ['enum', 'multiEnum'])];
        PC.precondition(PC.chainCheck(chain), reject, () => {
          const list = info.value.trim() === '' ? [] : info.value.split(',');
          chain = [PC.elementFromEnum(fromValue, list), PC.createEntityCheck(toValue, list)];
          PC.precondition(PC.chainCheck(chain), reject, () => {
            list[R.indexOf(fromValue, list)] = toValue;
            info.value = list.join(',');
            this.ee.emit(info.type === 'enum' ? 'renameEnumValue' : 'renameMultiEnumValue', arguments);
            resolve();
          });
        });
      });
    });
  });
};
//   }
//   callback2(profileConfigurerAPI);
// })((api) => (typeof exports === 'undefined' ? (this.profileConfigurerAPI = api) : (module.exports = api)));
