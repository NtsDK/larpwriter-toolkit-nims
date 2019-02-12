// const { PermissionError } = require('../../error');
// const config = require('../../config');

module.exports = function (LocalDBMS, opts) {
    const {
        R, addListener, Errors, Constants, CU, PC, serverSpecific
    } = opts;

    LocalDBMS.prototype.getManagementInfo = function () {
        return new Promise((resolve, reject) => {
            const { ManagementInfo } = this.database;
            const usersInfo = R.clone(R.keys(ManagementInfo.UsersInfo).reduce((result, user) => {
                result[user] = R.pick(['characters', 'groups', 'stories', 'players'], ManagementInfo.UsersInfo[user]);
                return result;
            }, {}));
            resolve({
                usersInfo,
                admin: ManagementInfo.admin,
                editor: ManagementInfo.editor,
                adaptationRights: ManagementInfo.adaptationRights
            });
        });
    };

    LocalDBMS.prototype.createOrganizer = function ({ name, password } = {}) {
        return new Promise((resolve, reject) => {
            const usersInfo = this.database.ManagementInfo.UsersInfo;
            const chain = [PC.createEntityCheck2(name, R.keys(usersInfo), 'entity-living-name', 'entity-of-organizer'), PC.isString(password),
                PC.isNotEmptyString(password)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                this.database.ManagementInfo.UsersInfo[name] = {
                    name,
                    stories: [],
                    characters: [],
                    players: [],
                    groups: [],
                };
                this.setPassword({ username: name, type: 'organizer', password })
                    .then(res => resolve()).catch(reject);
            });
        });
    };

    LocalDBMS.prototype.changeOrganizerPassword = function ({ userName, newPassword } = {}) {
        return new Promise((resolve, reject) => {
            const usersInfo = this.database.ManagementInfo.UsersInfo;
            const chain = [PC.entityExistsCheck(userName, R.keys(usersInfo)), PC.isString(newPassword),
                PC.isNotEmptyString(newPassword)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const that = this;
                this.getUser({ username: userName, type: 'organizer' }).then((user) => {
                    if (user === undefined) { reject(new Errors.ValidationError('errors-user-is-not-found')); return; }
                    that.setPassword({ username: userName, type: 'organizer', password: newPassword })
                        .then(res => resolve()).catch(reject);
                }, reject);
            });
        });
    };

    LocalDBMS.prototype.assignAdmin = function ({ name } = {}) {
        return new Promise((resolve, reject) => {
            PC.precondition(
                PC.entityExistsCheck(name, R.keys(this.database.ManagementInfo.UsersInfo)), reject,
                () => {
                    this.database.ManagementInfo.admin = name;
                    this.publishPermissionsUpdate();
                    resolve();
                }
            );
        });
    };


    LocalDBMS.prototype.assignEditor = function ({ name } = {}) {
        return new Promise((resolve, reject) => {
            PC.precondition(
                PC.entityExistsCheck(name, R.keys(this.database.ManagementInfo.UsersInfo)), reject,
                () => {
                    this.database.ManagementInfo.editor = name;
                    this.publishPermissionsUpdate();
                    resolve();
                }
            );
        });
    };
    LocalDBMS.prototype.removeEditor = function () {
        return new Promise((resolve, reject) => {
            this.database.ManagementInfo.editor = null;
            this.publishPermissionsUpdate();
            resolve();
        });
    };
    LocalDBMS.prototype.changeAdaptationRightsMode = function ({ mode } = {}) {
        return new Promise((resolve, reject) => {
            const chain = [PC.isString(mode), PC.elementFromEnum(mode, Constants.adaptationRightsModes)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                this.database.ManagementInfo.adaptationRights = mode;
                this.publishPermissionsUpdate();
                resolve();
            });
        });
    };

    LocalDBMS.prototype.removeOrganizer = function ({ name } = {}) {
        return new Promise((resolve, reject) => {
            const chain = [PC.isString(name),
                PC.entityExistsCheck(name, R.keys(this.database.ManagementInfo.UsersInfo)),
                PC.notEquals(name, this.database.ManagementInfo.admin)];
            PC.precondition(
                PC.chainCheck(chain), reject,
                () => {
                    delete this.database.ManagementInfo.UsersInfo[name];
                    if (this.database.ManagementInfo.editor === name) {
                        this.database.ManagementInfo.editor = null;
                    }
                    this.publishPermissionsUpdate();
                    resolve();
                }
            );
        });
    };


    const _setDatabase = function ([{ database, reject }] = []) {
        if (!this.database.ManagementInfo) {
            this.database.ManagementInfo = {};
            const { ManagementInfo } = this.database;
            ManagementInfo.UsersInfo = {};

            const { adminLogin, adminPass } = serverSpecific;
            this.createOrganizer({ name: adminLogin, password: adminPass }).then(() => {
                ManagementInfo.admin = adminLogin;
                ManagementInfo.editor = null;
                ManagementInfo.adaptationRights = 'ByStory';
                ManagementInfo.PlayersInfo = {};
                ManagementInfo.WelcomeText = '';
                ManagementInfo.PlayersOptions = {
                    allowPlayerCreation: false,
                    allowCharacterCreation: false,
                };
                if (serverSpecific.createOrganizer) {
                    this.createOrganizer({ name: 'user', password: 'user' }).catch(reject);
                }
            }, reject);
        }
        this.publishPermissionsUpdate();
    };

    addListener('setDatabase', _setDatabase);
};
