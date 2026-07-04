/* eslint-disable func-names */

((callback2) => {
  function relationsAPI(LocalDBMS, opts) {
    const { R, Constants, Errors, addListener, dbmsUtils, CU, PC } = opts;

    const relationsPath = ["Relations"];

    const rel2RelKey = R.pipe(R.props(["starter", "ender"]), R.sort(CU.charOrdA), JSON.stringify);
    dbmsUtils._rel2RelKey = rel2RelKey;
    const arr2RelKey = R.pipe(R.sort(CU.charOrdA), JSON.stringify);
    dbmsUtils._arr2RelKey = arr2RelKey;

    const findRel = R.curry((fromCharacter, toCharacter, relations) => {
      const findFunc = R.curry(
        (fromCharacter2, toCharacter2, rel) => rel[fromCharacter2] !== undefined && rel[toCharacter2] !== undefined
      );
      return R.find(findFunc(fromCharacter, toCharacter), relations);
    });

    dbmsUtils._getKnownCharacters = (database, characterName) => {
      const stories = database.Stories;
      const knownCharacters = {};
      R.values(stories).forEach((story) => {
        const filter = R.compose(R.not, R.isNil, R.prop(characterName), R.prop("characters"));
        story.events.filter(filter).forEach((event) => {
          R.keys(event.characters).forEach((charName) => {
            knownCharacters[charName] = knownCharacters[charName] || {};
            knownCharacters[charName][story.name] = true;
          });
        });
      });
      delete knownCharacters[characterName];
      return knownCharacters;
    };

    const characterCheck = (characterName, database) =>
      PC.chainCheck([PC.isString(characterName), PC.entityExists(characterName, R.keys(database.Characters))]);

    const charFilter = R.curry((char, data) => R.filter((rel) => rel[char] !== undefined, data));

    LocalDBMS.prototype.getRelations = function (callback) {
      return Promise.resolve(R.clone(R.path(relationsPath, this.database)));
    };

    LocalDBMS.prototype.getRelationsSummary = function ({ characterName } = {}) {
      return new Promise((resolve, reject) => {
        PC.precondition(characterCheck(characterName, this.database), reject, () => {
          const relData = R.clone(R.path(relationsPath, this.database));
          const relations = charFilter(characterName, relData);

          resolve({
            relations,
            knownCharacters: dbmsUtils._getKnownCharacters(this.database, characterName),
          });
        });
      });
    };

    LocalDBMS.prototype.getCharacterRelation = function ({ fromCharacter, toCharacter } = {}) {
      return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([
          characterCheck(fromCharacter, this.database),
          characterCheck(toCharacter, this.database),
          PC.entityExistsCheck(arr2RelKey([fromCharacter, toCharacter]), relData.map(rel2RelKey)),
        ]);
        PC.precondition(chain, reject, () => {
          resolve(R.clone(findRel(fromCharacter, toCharacter, relData)));
        });
      });
    };

    LocalDBMS.prototype.createCharacterRelation = function ({ fromCharacter, toCharacter } = {}) {
      return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([
          characterCheck(fromCharacter, this.database),
          characterCheck(toCharacter, this.database),
          PC.createEntityCheck(arr2RelKey([fromCharacter, toCharacter]), relData.map(rel2RelKey)),
        ]);
        PC.precondition(chain, reject, () => {
          relData.push({
            origin: "",
            starterTextReady: false,
            enderTextReady: false,
            essence: [],
            [fromCharacter]: "",
            [toCharacter]: "",
            starter: fromCharacter,
            ender: toCharacter,
          });
          resolve();
        });
      });
    };

    LocalDBMS.prototype.removeCharacterRelation = function ({ fromCharacter, toCharacter } = {}) {
      return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([
          characterCheck(fromCharacter, this.database),
          characterCheck(toCharacter, this.database),
          PC.entityExistsCheck(arr2RelKey([fromCharacter, toCharacter]), relData.map(rel2RelKey)),
        ]);
        PC.precondition(chain, reject, () => {
          const rel = findRel(fromCharacter, toCharacter, relData);
          relData.splice(R.indexOf(rel, relData), 1);
          resolve();
        });
      });
    };

    LocalDBMS.prototype.setCharacterRelationText = function ({ fromCharacter, toCharacter, character, text } = {}) {
      return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([
          characterCheck(fromCharacter, this.database),
          characterCheck(toCharacter, this.database),
          PC.isString(character),
          PC.elementFromEnum(character, [fromCharacter, toCharacter]),
          PC.isString(text),
          PC.entityExistsCheck(arr2RelKey([fromCharacter, toCharacter]), relData.map(rel2RelKey)),
        ]);
        PC.precondition(chain, reject, () => {
          const rel = findRel(fromCharacter, toCharacter, relData);
          text = text.trim();
          rel[character] = text;
          resolve();
        });
      });
    };

    LocalDBMS.prototype.setRelationReadyStatus = function ({ fromCharacter, toCharacter, character, ready } = {}) {
      return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([
          characterCheck(fromCharacter, this.database),
          characterCheck(toCharacter, this.database),
          PC.isString(character),
          PC.elementFromEnum(character, [fromCharacter, toCharacter]),
          PC.isBoolean(ready),
          PC.entityExistsCheck(arr2RelKey([fromCharacter, toCharacter]), relData.map(rel2RelKey)),
        ]);
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

    LocalDBMS.prototype.setRelationEssenceStatus = function ({ fromCharacter, toCharacter, essence, flag } = {}) {
      return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([
          characterCheck(fromCharacter, this.database),
          characterCheck(toCharacter, this.database),
          PC.isString(essence),
          PC.elementFromEnum(essence, Constants.relationEssences),
          PC.isBoolean(flag),
          PC.entityExistsCheck(arr2RelKey([fromCharacter, toCharacter]), relData.map(rel2RelKey)),
        ]);
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

    LocalDBMS.prototype.setOriginRelationText = function ({ fromCharacter, toCharacter, text } = {}) {
      return new Promise((resolve, reject) => {
        const relData = R.path(relationsPath, this.database);
        const chain = PC.chainCheck([
          characterCheck(fromCharacter, this.database),
          characterCheck(toCharacter, this.database),
          PC.isString(text),
          PC.entityExistsCheck(arr2RelKey([fromCharacter, toCharacter]), relData.map(rel2RelKey)),
        ]);
        PC.precondition(chain, reject, () => {
          const rel = findRel(fromCharacter, toCharacter, relData);
          text = text.trim();
          rel.origin = text;
          resolve();
        });
      });
    };

    function _renameCharacter([{ type, fromName, toName }] = []) {
      if (type === "player") return;
      const relData = R.path(relationsPath, this.database);
      const arrPair = R.partition(R.pipe(R.prop(fromName), R.isNil), relData);
      arrPair[1] = arrPair[1].map((rel) => {
        rel[toName] = rel[fromName];
        delete rel[fromName];
        if (rel.starter === fromName) {
          rel.starter = toName;
        }
        if (rel.ender === fromName) {
          rel.ender = toName;
        }
        return rel;
      });
      this.database.Relations = R.concat(arrPair[0], arrPair[1]);
    }

    addListener("renameProfile", _renameCharacter);

    function _removeCharacter([{ type, characterName }] = []) {
      if (type === "player") return;
      const relData = R.path(relationsPath, this.database);
      this.database.Relations = R.filter(R.pipe(R.prop(characterName), R.isNil), relData);
    }

    addListener("removeProfile", _removeCharacter);
  }

  callback2(relationsAPI);
})((api) => (typeof exports === "undefined" ? (this.relationsAPI = api) : (module.exports = api)));
