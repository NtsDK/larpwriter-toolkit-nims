/* eslint-disable func-names */

((callback2) => {
  function profileBindingAPI(LocalDBMS, opts) {
    const {
      R, Constants, Errors, addListener, dbmsUtils, CU, PC
    } = opts;

    const path = ['ProfileBindings'];
    const charPath = ['Characters'];
    const playerPath = ['Players'];

    LocalDBMS.prototype.getProfileBindings = function () {
      return Promise.resolve(R.clone(R.path(path, this.database)));
    };

    LocalDBMS.prototype.getExtendedProfileBindings = function () {
      let characters = R.keys(R.path(charPath, this.database));
      let players = R.keys(R.path(playerPath, this.database));
      const bindings = R.clone(R.path(path, this.database));
      characters = R.difference(characters, R.keys(bindings));
      players = R.difference(players, R.values(bindings));

      const bindingData = R.reduce(R.concat, [], [R.toPairs(bindings),
        R.zip(characters, R.repeat('', characters.length)),
        R.zip(R.repeat('', players.length), players)]);
      return Promise.resolve(bindingData);
    };

    const _getProfileBinding = (type, name, db) => {
      let arr;
      if (type === 'character') {
        const bindings = R.path(path, db);
        arr = [name, bindings[name] || ''];
      } else {
        const bindings = R.invertObj(R.path(path, db));
        arr = [bindings[name] || '', name];
      }
      return arr;
    };

    dbmsUtils._getProfileBinding = _getProfileBinding;

    // DBMS.profileBindings.characters[name].get()
    LocalDBMS.prototype.getProfileBinding = function ({ type, name } = {}) {
      return new Promise((resolve, reject) => {
        const conditions = [PC.isString(type), PC.elementFromEnum(type, Constants.profileTypes), PC.isString(name),
          PC.entityExists(name, R.keys(this.database[type === 'character' ? 'Characters' : 'Players']))];
        PC.precondition(PC.chainCheck(conditions), reject, () => {
          resolve(_getProfileBinding(type, name, this.database));
        });
      });
    };

    LocalDBMS.prototype.createBinding = function ({ characterName, playerName } = {}) {
      return new Promise((resolve, reject) => {
        const bindings = R.path(path, this.database);
        const invertBinding = R.invertObj(bindings);
        const conditions = [PC.isString(characterName),
          PC.entityExists(characterName, R.keys(this.database.Characters)), PC.isString(playerName),
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
    };

    LocalDBMS.prototype.removeBinding = function ({ characterName, playerName } = {}) {
      return new Promise((resolve, reject) => {
        const bindingArr = R.toPairs(R.path(path, this.database)).map((pair) => `${pair[0]}/${pair[1]}`);
        const conditions = [PC.isString(characterName),
          PC.entityExists(characterName, R.keys(this.database.Characters)),
          PC.isString(playerName), PC.entityExists(playerName, R.keys(this.database.Players)),
          PC.entityExists(`${characterName}/${playerName}`, bindingArr)];
        PC.precondition(PC.chainCheck(conditions), reject, () => {
          delete R.path(path, this.database)[characterName];
          resolve();
        });
      });
    };

    function _renameProfile([{ type, fromName, toName }] = []) {
      const bindings = R.path(path, this.database);
      if (type === 'character') {
        const playerName = bindings[fromName];
        if (playerName !== undefined) {
          bindings[toName] = playerName;
          delete bindings[fromName];
        }
      } else if (type === 'player') {
        const invertedBindings = R.invertObj(bindings);
        const characterName = invertedBindings[fromName];
        if (characterName !== undefined) {
          bindings[characterName] = toName;
        }
      } else {
        console.log(`binding._renameProfile: Unexpected type ${type}`);
      }
    }

    addListener('renameProfile', _renameProfile);

    function _removeProfile([{ type, characterName }] = []) {
      const bindings = R.path(path, this.database);
      if (type === 'character') {
        delete bindings[characterName];
      } else if (type === 'player') {
        const invertedBindings = R.invertObj(bindings);
        const characterName2 = invertedBindings[characterName];
        if (characterName2 !== undefined) {
          delete bindings[characterName2];
        }
      } else {
        console.log(`binding._removeProfile: Unexpected type ${type}`);
      }
    }

    addListener('removeProfile', _removeProfile);
  }

  callback2(profileBindingAPI);
})((api) => (typeof exports === 'undefined' ? (this.profileBindingAPI = api) : (module.exports = api)));
