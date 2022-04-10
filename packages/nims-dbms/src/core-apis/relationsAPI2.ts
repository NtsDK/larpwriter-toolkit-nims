import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC, CU } from "nims-dbms-core";
import * as dbmsUtils from "./dbmsUtils";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function relationsAPI(LocalDBMS, opts) {
//         const {
//             R, Constants, Errors, addListener, dbmsUtils, CU, PC
//         } = opts;

const relationsPath = ['Relations'];

// const rel2RelKey = R.pipe(R.props(['starter', 'ender']), R.sort(CU.charOrdA), JSON.stringify);
// dbmsUtils._rel2RelKey = rel2RelKey;
// const arr2RelKey = R.pipe(R.sort(CU.charOrdA), JSON.stringify);
// dbmsUtils._arr2RelKey = arr2RelKey;

const findRel = R.curry((fromCharacter, toCharacter, relations) => {
    const findFunc = R.curry((fromCharacter2, toCharacter2, rel) => rel[fromCharacter2] !== undefined && rel[toCharacter2] !== undefined);
    return R.find(findFunc(fromCharacter, toCharacter), relations);
});

// dbmsUtils._getKnownCharacters = (database, characterName) => {
//     const stories = database.Stories;
//     const knownCharacters = {};
//     R.values(stories).forEach((story) => {
//         const filter = R.compose(R.not, R.isNil, R.prop(characterName), R.prop('characters'));
//         story.events.filter(filter).forEach((event) => {
//             R.keys(event.characters).forEach((charName) => {
//                 knownCharacters[charName] = knownCharacters[charName] || {};
//                 knownCharacters[charName][story.name] = true;
//             });
//         });
//     });
//     delete knownCharacters[characterName];
//     return knownCharacters;
// };

const characterCheck = (characterName, database) => PC.chainCheck([PC.isString(characterName),
    PC.entityExists(characterName, R.keys(database.Characters))]);

// @ts-ignore
const charFilter = R.curry((char, data) => R.filter(rel => rel[char] !== undefined, data));

export function getRelations(this: ILocalDBMS) {
    return Promise.resolve(R.clone(R.path(relationsPath, this.database)));
};

export function getRelationsSummary(this: ILocalDBMS, { characterName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(characterCheck(characterName, this.database), reject, () => {
            const relData = R.clone(R.path(relationsPath, this.database));
            const relations = charFilter(characterName, relData);

            resolve({
                relations,
                knownCharacters: dbmsUtils._getKnownCharacters(this.database, characterName)
            });
        });
    });
};

export function getCharacterRelation(this: ILocalDBMS, { fromCharacter, toCharacter }: any = {}) {
    return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
            characterCheck(toCharacter, this.database),
            // @ts-ignore
            PC.entityExistsCheck(dbmsUtils._arr2RelKey([fromCharacter, toCharacter]), relData.map(dbmsUtils._rel2RelKey))]);
        PC.precondition(chain, reject, () => {
            resolve(R.clone(findRel(fromCharacter, toCharacter, relData)));
        });
    });
};

export function createCharacterRelation(
  this: ILocalDBMS, 
  { fromCharacter, toCharacter }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
            characterCheck(toCharacter, this.database),
            // @ts-ignore
            PC.createEntityCheck(dbmsUtils._arr2RelKey([fromCharacter, toCharacter]), relData.map(dbmsUtils._rel2RelKey))]);
          PC.precondition(chain, reject, () => {
          // @ts-ignore
            relData.push({
                origin: '',
                starterTextReady: false,
                enderTextReady: false,
                essence: [],
                [fromCharacter]: '',
                [toCharacter]: '',
                starter: fromCharacter,
                ender: toCharacter
            });
            resolve();
        });
    });
};

export function removeCharacterRelation(
  this: ILocalDBMS, 
  { fromCharacter, toCharacter }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
            characterCheck(toCharacter, this.database),
            // @ts-ignore
            PC.entityExistsCheck(dbmsUtils._arr2RelKey([fromCharacter, toCharacter]), relData.map(dbmsUtils._rel2RelKey))]);
        PC.precondition(chain, reject, () => {
            const rel = findRel(fromCharacter, toCharacter, relData);
            // @ts-ignore
            relData.splice(R.indexOf(rel, relData), 1);
            resolve();
        });
    });
};

export function setCharacterRelationText(
  this: ILocalDBMS, 
    {
        fromCharacter, toCharacter, character, text
    }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
            characterCheck(toCharacter, this.database),
            PC.isString(character), PC.elementFromEnum(character, [fromCharacter, toCharacter]),
            PC.isString(text),
            // @ts-ignore
            PC.entityExistsCheck(dbmsUtils._arr2RelKey([fromCharacter, toCharacter]), relData.map(dbmsUtils._rel2RelKey))]);
        PC.precondition(chain, reject, () => {
            const rel = findRel(fromCharacter, toCharacter, relData);
            text = text.trim();
            rel[character] = text;
            resolve();
        });
    });
};

export function setRelationReadyStatus(this: ILocalDBMS, {
    fromCharacter, toCharacter, character, ready
}: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
            characterCheck(toCharacter, this.database),
            PC.isString(character), PC.elementFromEnum(character, [fromCharacter, toCharacter]),
            PC.isBoolean(ready),
            // @ts-ignore
            PC.entityExistsCheck(dbmsUtils._arr2RelKey([fromCharacter, toCharacter]), relData.map(dbmsUtils._rel2RelKey))]);
        PC.precondition(chain, reject, () => {
            const rel = findRel(fromCharacter, toCharacter, relData);
            if (rel.starter === character) {
                rel.starterTextReady = ready;
            } else {
                rel.enderTextReady = ready;
            }
            resolve();
        });
    });
};

export function setRelationEssenceStatus(this: ILocalDBMS, {
    fromCharacter, toCharacter, essence, flag
}: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
            characterCheck(toCharacter, this.database),
            PC.isString(essence), PC.elementFromEnum(essence, Constants.relationEssences),
            PC.isBoolean(flag),
            // @ts-ignore
            PC.entityExistsCheck(dbmsUtils._arr2RelKey([fromCharacter, toCharacter]), relData.map(dbmsUtils._rel2RelKey))]);
        PC.precondition(chain, reject, () => {
            const rel = findRel(fromCharacter, toCharacter, relData);
            if (flag === true) {
                rel.essence = R.uniq(R.append(essence, rel.essence));
            } else {
                rel.essence.splice(R.indexOf(essence, rel.essence), 1);
            }
            resolve();
        });
    });
};

export function setOriginRelationText(
  this: ILocalDBMS, 
  { fromCharacter, toCharacter, text }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
            characterCheck(toCharacter, this.database), PC.isString(text),
            // @ts-ignore
            PC.entityExistsCheck(dbmsUtils._arr2RelKey([fromCharacter, toCharacter]), relData.map(dbmsUtils._rel2RelKey))]);
        PC.precondition(chain, reject, () => {
            const rel = findRel(fromCharacter, toCharacter, relData);
            text = text.trim();
            rel.origin = text;
            resolve();
        });
    });
};

function _renameCharacter(this: ILocalDBMS, [{ type, fromName, toName }] = []) {
    if (type === 'player') return;
    const relData = R.path(relationsPath, this.database);
    // @ts-ignore
    const arrPair = R.partition(R.pipe(R.prop(fromName), R.isNil), relData);
    arrPair[1] = arrPair[1].map((rel) => {
      // @ts-ignore
      rel[toName] = rel[fromName];
      // @ts-ignore
      delete rel[fromName];
      // @ts-ignore
      if (rel.starter === fromName) {
          // @ts-ignore
          rel.starter = toName;
        }
        // @ts-ignore
        if (rel.ender === fromName) {
          // @ts-ignore
            rel.ender = toName;
        }
        return rel;
    });
    this.database.Relations = R.concat(arrPair[0], arrPair[1]);
}

// addListener('renameProfile', _renameCharacter);

function _removeCharacter(this: ILocalDBMS, [{ type, characterName }] = []) {
    if (type === 'player') return;
    const relData = R.path(relationsPath, this.database);
    // @ts-ignore
    this.database.Relations = R.filter(R.pipe(R.prop(characterName), R.isNil), relData);
}

// addListener('removeProfile', _removeCharacter);
//     }

export const listeners = {
  renameProfile: _renameCharacter,
  removeProfile: _removeCharacter,
};

//     callback2(relationsAPI);
// })(api => (typeof exports === 'undefined' ? (this.relationsAPI = api) : (module.exports = api)));
