import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC } from "nims-dbms-core";
import * as dbmsUtils from "./dbmsUtils";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//   function profileBindingAPI(LocalDBMS, opts) {
    // const {
    //   R, Constants, Errors, addListener, dbmsUtils, CU, PC
    // } = opts;

const path = ['ProfileBindings'];
const charPath = ['Characters'];
const playerPath = ['Players'];

export function getProfileBindings(this: ILocalDBMS) {
  return Promise.resolve(R.clone(R.path(path, this.database)));
};

export function getExtendedProfileBindings(this: ILocalDBMS) {
  let characters = R.keys(R.path(charPath, this.database));
  let players = R.keys(R.path(playerPath, this.database));
  const bindings = R.clone(R.path(path, this.database));
  characters = R.difference(characters, R.keys(bindings));
  // @ts-ignore
  players = R.difference(players, R.values(bindings));
  
  // @ts-ignore
  const bindingData = R.reduce(R.concat, [], [R.toPairs(bindings),
    R.zip(characters, R.repeat('', characters.length)),
    R.zip(R.repeat('', players.length), players)]);
  return Promise.resolve(bindingData);
};

// const _getProfileBinding = (type, name, db) => {
//   let arr;
//   if (type === 'character') {
//     const bindings = R.path(path, db);
//     arr = [name, bindings[name] || ''];
//   } else {
//     const bindings = R.invertObj(R.path(path, db));
//     arr = [bindings[name] || '', name];
//   }
//   return arr;
// };

// dbmsUtils._getProfileBinding = _getProfileBinding;

// DBMS.profileBindings.characters[name].get()
export function getProfileBinding(this: ILocalDBMS, { type, name }: any = {}) {
  return new Promise((resolve, reject) => {
    const conditions = [PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes), PC.isString(name),
      PC.entityExists(name, R.keys(this.database[type === 'character' ? 'Characters' : 'Players']))];
    PC.precondition(PC.chainCheck(conditions), reject, () => {
      resolve(dbmsUtils._getProfileBinding(type, name, this.database));
    });
  });
};

export function createBinding(
  this: ILocalDBMS, 
  { characterName, playerName }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const bindings = R.path(path, this.database);
    // @ts-ignore
    const invertBinding = R.invertObj(bindings);
    const conditions = [PC.isString(characterName),
      PC.entityExists(characterName, R.keys(this.database.Characters)), PC.isString(playerName),
      PC.entityExists(playerName, R.keys(this.database.Players)),
      //   PC.entityIsNotUsed(characterName, R.keys(bindings)),
      //   PC.entityIsNotUsed(playerName, R.keys(R.invertObj(bindings)))
    ];
    PC.precondition(PC.chainCheck(conditions), reject, () => {
      if (invertBinding[playerName] !== undefined) {
        // @ts-ignore
        delete bindings[invertBinding[playerName]];
      }
      // @ts-ignore
      bindings[characterName] = playerName;
      resolve();
    });
  });
};

export function removeBinding(
  this: ILocalDBMS, 
  { characterName, playerName }: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const bindingArr = R.toPairs(R.path(path, this.database)).map((pair) => `${pair[0]}/${pair[1]}`);
    const conditions = [PC.isString(characterName),
      PC.entityExists(characterName, R.keys(this.database.Characters)),
      PC.isString(playerName), PC.entityExists(playerName, R.keys(this.database.Players)),
      PC.entityExists(`${characterName}/${playerName}`, bindingArr)];
      PC.precondition(PC.chainCheck(conditions), reject, () => {
      // @ts-ignore
      delete R.path(path, this.database)[characterName];
      resolve();
    });
  });
};

function _renameProfile(this: ILocalDBMS, [{ type, fromName, toName }] = []) {
  const bindings = R.path(path, this.database);
  if (type === 'character') {
    // @ts-ignore
    const playerName = bindings[fromName];
    if (playerName !== undefined) {
      // @ts-ignore
      bindings[toName] = playerName;
      // @ts-ignore
      delete bindings[fromName];
    }
  } else if (type === 'player') {
    // @ts-ignore
    const invertedBindings = R.invertObj(bindings);
    const characterName = invertedBindings[fromName];
    if (characterName !== undefined) {
      // @ts-ignore
      bindings[characterName] = toName;
    }
  } else {
    console.log(`binding._renameProfile: Unexpected type ${type}`);
  }
}

// addListener('renameProfile', _renameProfile);

function _removeProfile(this: ILocalDBMS, [{ type, characterName }] = []) {
  const bindings = R.path(path, this.database);
  if (type === 'character') {
    // @ts-ignore
    delete bindings[characterName];
  } else if (type === 'player') {
    // @ts-ignore
    const invertedBindings = R.invertObj(bindings);
    const characterName2 = invertedBindings[characterName];
    if (characterName2 !== undefined) {
      // @ts-ignore
      delete bindings[characterName2];
    }
  } else {
    console.log(`binding._removeProfile: Unexpected type ${type}`);
  }
}

// addListener('removeProfile', _removeProfile);

export const listeners = {
  renameProfile: _renameProfile,
  removeProfile: _removeProfile,
};
//   }

//   callback2(profileBindingAPI);
// })((api) => (typeof exports === 'undefined' ? (this.profileBindingAPI = api) : (module.exports = api)));
