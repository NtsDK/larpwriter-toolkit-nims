// const { PermissionError } = require('../../error');
// const config = require('../../config');

module.exports = function (LocalDBMS, opts) {
    const {
        R, addListener, Errors, Constants, CU, PC
    } = opts;

    LocalDBMS.prototype.createPlayer = function ({ userName, password } = {}, user) {
        return new Promise((resolve, reject) => {
            const playersInfo = this.database.ManagementInfo.PlayersInfo;
            const chain = [PC.createEntityCheck2(userName, R.keys(playersInfo), 'entity-living-name', 'entity-of-player'), PC.isString(password),
                PC.isNotEmptyString(password)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const that = this;

                this.createProfile({ type: 'player', characterName: userName }, user).then(() => {
                    that.database.ManagementInfo.PlayersInfo[userName] = {
                        name: userName,
                    };
                    that.setPassword({ username: userName, type: 'player', password })
                        .then(res => resolve(), reject);
                }, reject);
            });
        });
    };

    LocalDBMS.prototype.changePlayerPassword = function ({ userName, newPassword } = {}) {
        return new Promise((resolve, reject) => {
            const playersInfo = this.database.ManagementInfo.PlayersInfo;
            const chain = [PC.entityExistsCheck(userName, R.keys(playersInfo)), PC.isString(newPassword),
                PC.isNotEmptyString(newPassword)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const that = this;
                this.getUser({ username: userName, type: 'player' }).then((user) => {
                    if (user === undefined) { reject(new Errors.ValidationError('errors-user-is-not-found')); return; }
                    that.setPassword({ username: userName, type: 'player', password: newPassword })
                        .then(res => resolve()).catch(reject);
                }, reject);
            });
        });
    };

    LocalDBMS.prototype.createPlayerLogin = function ({ userName, password } = {}) {
        return new Promise((resolve, reject) => {
            const playersInfo = this.database.ManagementInfo.PlayersInfo;
            const players = this.database.Players;
            const chain = [PC.entityExistsCheck(userName, R.keys(players)),
                PC.entityIsNotUsed(userName, R.keys(playersInfo)),
                PC.isString(password), PC.isNotEmptyString(password)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                this.database.ManagementInfo.PlayersInfo[userName] = {
                    name: userName,
                };
                this.setPassword({ username: userName, type: 'player', password })
                    .then(res => resolve()).catch(reject);
            });
        });
    };

    const prepareInfo = function (profile, profileStructure) {
        const hiddenItems = profileStructure.filter(item => item.playerAccess === 'hidden').map(item => item.name);
        profileStructure = profileStructure.filter(item => item.playerAccess !== 'hidden');
        return {
            profile: R.omit(hiddenItems, profile),
            profileStructure,
        };
    };

    LocalDBMS.prototype.getPlayerProfileInfo = function (user) {
        return new Promise((resolve, reject) => {
            const playersInfo = this.database.ManagementInfo.PlayersInfo;
            PC.precondition(PC.entityExistsCheck(user.name, R.keys(playersInfo)), reject, () => {
                const that = this;
                Promise.all([
                    that.getProfileStructure({ type: 'player' }),
                    that.getProfile({ type: 'player', name: user.name }),
                    that.getProfileBinding({ type: 'player', name: user.name })
                ]).then((results) => {
                    const [playerProfileStructure, playerProfile, binding] = results;
                    const playerInfo = prepareInfo(playerProfile, playerProfileStructure);
                    if (binding[0] === '') {
                        resolve({ player: playerInfo });
                    } else {
                        Promise.all([
                            that.getProfileStructure({ type: 'character' }),
                            that.getProfile({ type: 'character', name: binding[0] }),
                        ]).then((results2) => {
                            const [characterProfileStructure, characterProfile] = results2;
                            resolve({
                                player: playerInfo,
                                character: prepareInfo(characterProfile, characterProfileStructure)
                            });
                        }).catch(reject);
                    }
                }).catch(reject);
            });
        });
    };

    LocalDBMS.prototype.createCharacterByPlayer = function ({ characterName } = {}, user) {
        return new Promise((resolve, reject) => {
            const playersInfo = this.database.ManagementInfo.PlayersInfo;
            PC.precondition(PC.entityExistsCheck(user.name, R.keys(playersInfo)), reject, () => {
                const that = this;
                // calling createProfile with user will cause assigning owner.
                // But in this case player registered itself so there is no defualt owner.
                that.createProfile({ type: 'character', characterName }).then(() => {
                    that.createBinding({ characterName, playerName: user.name }).then(resolve, reject);
                }, reject);
            });
        });
    };

    LocalDBMS.prototype.getPlayerLoginsArray = function () {
        return Promise.resolve(R.keys(this.database.ManagementInfo.PlayersInfo));
    };

    LocalDBMS.prototype.removePlayerLogin = function ({ userName } = {}) {
        return new Promise((resolve, reject) => {
            PC.precondition(
                PC.entityExistsCheck(userName, R.keys(this.database.ManagementInfo.PlayersInfo)), reject,
                () => {
                    delete this.database.ManagementInfo.PlayersInfo[userName];
                    resolve();
                }
            );
        });
    };

    LocalDBMS.prototype.getWelcomeText = function () {
        return Promise.resolve(this.database.ManagementInfo.WelcomeText);
    };

    LocalDBMS.prototype.setWelcomeText = function ({ text } = {}) {
        return new Promise((resolve, reject) => {
            PC.precondition(PC.isString(text), reject, () => {
                this.database.ManagementInfo.WelcomeText = text;
                resolve();
            });
        });
    };

    LocalDBMS.prototype.getPlayersOptions = function () {
        return Promise.resolve(R.clone(this.database.ManagementInfo.PlayersOptions));
    };

    LocalDBMS.prototype.setPlayerOption = function ({ name, value } = {}) {
        return new Promise((resolve, reject) => {
            const chain = [PC.isString(name), PC.elementFromEnum(name, Constants.playersOptionTypes),
                PC.isBoolean(value)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                this.database.ManagementInfo.PlayersOptions[name] = value;
                resolve();
            });
        });
    };

    function _renameProfile([{ type, fromName, toName }] = []) {
        if (type === 'character') return;
        if (this.database.ManagementInfo !== undefined) {
            const playersInfo = this.database.ManagementInfo.PlayersInfo;
            if (playersInfo[fromName] !== undefined) {
                playersInfo[toName] = playersInfo[fromName];
                playersInfo[toName].name = toName;
                delete playersInfo[fromName];
            }
        }
    }

    addListener('renameProfile', _renameProfile);

    function _removeProfile([{ type, characterName }] = []) {
        if (type === 'character') return;
        if (this.database.ManagementInfo !== undefined) {
            const playersInfo = this.database.ManagementInfo.PlayersInfo;
            if (playersInfo[characterName] !== undefined) {
                delete playersInfo[characterName];
            }
        }
    }

    addListener('removeProfile', _removeProfile);
};
