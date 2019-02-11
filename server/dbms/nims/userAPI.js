const crypto = require('crypto');
const util = require('util');
const R = require('ramda');
const config = require('../../config');
const log = require('../../libs/log')(module);

module.exports = function (LocalDBMS, opts) {
    const { Errors } = opts;

    const typePrecondition = function (type) {
        if (type !== 'organizer' && type !== 'player') {
            return [null, 'errors-unexpected-user-type', [type]];
        }
        return null;
    };

    const signUpPrecondition = function (password, confirmPassword, database) {
        if (!config.get('playerAccess:enabled')) {
            return [null, 'errors-sign-up-operation-is-forbidden'];
        } if (!database.ManagementInfo.PlayersOptions.allowPlayerCreation) {
            return [null, 'errors-sign-up-operation-is-forbidden'];
        } if (password === '') {
            return [null, 'errors-password-is-not-specified'];
        } if (password !== confirmPassword) {
            return [null, 'errors-passwords-not-match'];
        }
        return null;
    };

    LocalDBMS.prototype.getUser = function ({ username, type } = {}) {
        return new Promise((resolve, reject) => {
            const err = typePrecondition(type);
            if (err) { reject(new (Function.prototype.bind.apply(Errors.ValidationError, err))()); return; }
            resolve(getUserInner(this.database, username, type));
        });
    };

    function getUserInner(database, username, type) {
        if (type === 'organizer') {
            return database.ManagementInfo.UsersInfo[username];
        } if (type === 'player') {
            return database.ManagementInfo.PlayersInfo[username];
        }
        throw new Error(`Unexpected type ${type}`);
    }

    const encryptPassword = function (user, password) {
        return crypto.createHmac('sha1', user.salt).update(password).digest('hex');
    };

    LocalDBMS.prototype.setPassword = function ({ username, type, password } = {}) {
        return new Promise((resolve, reject) => {
            const err = typePrecondition(type);
            if (err) { reject(new (Function.prototype.bind.apply(Errors.ValidationError, err))()); return; }
            const user = getUserInner(this.database, username, type);
            if (user === undefined) { reject(new Errors.ValidationError('errors-user-is-not-found')); return; }
            user.salt = `${Math.random()}`;
            user.hashedPassword = encryptPassword(user, password);
            resolve();
        });
    };

    LocalDBMS.prototype.checkPassword = function ({ username, type, password } = {}) {
        return new Promise((resolve, reject) => {
            const err = typePrecondition(type);
            if (err) { reject(new (Function.prototype.bind.apply(Errors.ValidationError, err))()); return; }
            const user = getUserInner(this.database, username, type);
            if (user === undefined) { reject(new Errors.ValidationError('errors-user-is-not-found')); return; }
            resolve(encryptPassword(user, password) === user.hashedPassword);
        });
    };

    const checkUser = function ({
        username, type, password, userStorage
    } = {}) {
        return new Promise((resolve, reject) => {
            userStorage.getUser({ username, type })
                .then((user) => {
                    if (user !== undefined) {
                        log.info(`CheckUser: ${JSON.stringify(user)}`);
                        userStorage.checkPassword({ username, type, password })
                            .then((isValid) => {
                                if (isValid) {
                                    user = R.clone(user);
                                    user.role = type;
                                    resolve(user);
                                }
                                reject(new Errors.ValidationError('errors-password-is-incorrect'));
                            })
                            .catch(err => reject(err));
                    } else {
                        resolve();
                    }
                })
                .catch(err => reject(err));
        });
    };

    LocalDBMS.prototype.login = function ({ username, password } = {}) {
        return new Promise((resolve, reject) => {
            const that = this;
            log.info(`Login: ${username}:${password}`);
            checkUser({
                username, type: 'organizer', password, userStorage: that
            })
                .then((user) => {
                    if (user !== undefined) {
                        resolve(user);
                    } else if (config.get('playerAccess:enabled')) {
                        checkUser({
                            username, type: 'player', password, userStorage: that
                        })
                            .then((user2) => {
                                if (user2 !== undefined) {
                                    resolve(user2);
                                } else {
                                    reject(new Errors.ValidationError('errors-user-is-not-found'));
                                }
                            })
                            .catch(reject);
                    } else {
                        reject(new Errors.ValidationError('errors-user-is-not-found'));
                    }
                })
                .catch(reject);
        });
    };

    LocalDBMS.prototype.signUp = function ({ userName, password, confirmPassword } = {}) {
        return new Promise((resolve, reject) => {
            const err = signUpPrecondition(password, confirmPassword, this.database);
            if (err) { reject(new (Function.prototype.bind.apply(Errors.ValidationError, err))()); return; }
            this.createPlayer({ userName, password }).then(resolve, reject);
        });
    };
};
