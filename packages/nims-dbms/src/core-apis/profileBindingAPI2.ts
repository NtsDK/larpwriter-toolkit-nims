import * as R from "ramda";
import * as Constants from "../nimsConstants";
import { PC } from "nims-dbms-core";
import * as dbmsUtils from "./dbmsUtils";
import { ILocalDBMS, ProfileBindings } from "../domain";
import { ProfileTypes } from "../nimsConstants";

// ((callback2) => {
//   function profileBindingAPI(LocalDBMS, opts) {
// const {
//   R, Constants, Errors, addListener, dbmsUtils, CU, PC
// } = opts;

export function getProfileBindings(this: ILocalDBMS): Promise<ProfileBindings> {
  return Promise.resolve(R.clone(this.database.ProfileBindings));
}

export function getExtendedProfileBindings(this: ILocalDBMS) {
  let characters = R.keys(this.database.Characters);
  let players = R.keys(this.database.Players);
  const bindings = R.clone(this.database.ProfileBindings);
  characters = R.difference(characters, R.keys(bindings));
  players = R.difference(players, R.values(bindings));

  const bindingData = R.reduce(
    R.concat,
    [],
    [
      R.toPairs(bindings),
      R.zip(characters, R.repeat("", characters.length)),
      R.zip(R.repeat("", players.length), players),
    ]
  );
  return Promise.resolve(bindingData);
}

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
export function getProfileBinding(this: ILocalDBMS, { type, name }: { type: ProfileTypes, name: string }) {
  return new Promise((resolve, reject) => {
    const conditions = [
      PC.isString(type),
      PC.elementFromEnum(type, Constants.profileTypes),
      PC.isString(name),
      PC.entityExists(name, R.keys(this.database[type === "character" ? "Characters" : "Players"])),
    ];
    PC.precondition(PC.chainCheck(conditions), reject, () => {
      resolve(dbmsUtils._getProfileBinding(type, name, this.database));
    });
  });
}

export function createBinding(this: ILocalDBMS, { characterName, playerName }: { characterName: string, playerName: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const bindings = this.database.ProfileBindings;
    const invertBinding = R.invertObj(bindings);
    const conditions = [
      PC.isString(characterName),
      PC.entityExists(characterName, R.keys(this.database.Characters)),
      PC.isString(playerName),
      PC.entityExists(playerName, R.keys(this.database.Players)),
      //   PC.entityIsNotUsed(characterName, R.keys(bindings)),
      //   PC.entityIsNotUsed(playerName, R.keys(R.invertObj(bindings)))
    ];
    PC.precondition(PC.chainCheck(conditions), reject, () => {
      if (invertBinding[playerName] !== undefined) {
        delete bindings[invertBinding[playerName]];
      }
      bindings[characterName] = playerName;
      resolve();
    });
  });
}

export function removeBinding(this: ILocalDBMS, { characterName, playerName }: { characterName: string, playerName: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const bindingArr = R.toPairs(this.database.ProfileBindings).map((pair) => `${pair[0]}/${pair[1]}`);
    const conditions = [
      PC.isString(characterName),
      PC.entityExists(characterName, R.keys(this.database.Characters)),
      PC.isString(playerName),
      PC.entityExists(playerName, R.keys(this.database.Players)),
      PC.entityExists(`${characterName}/${playerName}`, bindingArr),
    ];
    PC.precondition(PC.chainCheck(conditions), reject, () => {
      delete this.database.ProfileBindings[characterName];
      resolve();
    });
  });
}

function _renameProfile(this: ILocalDBMS, [{ type, fromName, toName }] = []) {
  const bindings = this.database.ProfileBindings;
  if (type === "character") {
    // @ts-ignore
    const playerName = bindings[fromName];
    if (playerName !== undefined) {
      // @ts-ignore
      bindings[toName] = playerName;
      // @ts-ignore
      delete bindings[fromName];
    }
  } else if (type === "player") {
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
  const bindings = this.database.ProfileBindings;
  if (type === "character") {
    // @ts-ignore
    delete bindings[characterName];
  } else if (type === "player") {
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
