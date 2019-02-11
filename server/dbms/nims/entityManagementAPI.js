const { PermissionError } = require('../../error');
const config = require('../../config');

module.exports = function (LocalDBMS, opts) {
    const {
        R, addListener, Errors, Constants, CU, PC
    } = opts;

    const getEntityConsistencyCheck = function (type, arr, database) {
        switch (type) {
        case 'characters':
            return PC.entitiesExist(arr, R.keys(database.Characters));
        case 'players':
            return PC.entitiesExist(arr, R.keys(database.Players));
        case 'stories':
            return PC.entitiesExist(arr, R.keys(database.Stories));
        case 'groups':
            return PC.entitiesExist(arr, R.keys(database.Groups));
        default:
            throw new Error(`Unexpected type ${type}`);
        }
    };

    // This call prevent user to assign permission for not user objects.
    // 1. Possibly user is a hacker so it tries to make more than it can.
    // 2. User web page has not relevant information so he see that object is available but actually it is not.
    // This call is filter so it can't be listener because it modifies original data.
    LocalDBMS.prototype.removePermission = function ({ userName, names } = {}, user) {
        return new Promise((resolve, reject) => {
            const usersInfo = this.database.ManagementInfo.UsersInfo;
            const chain = [PC.entityExistsCheck(user.name, R.keys(usersInfo)),
                PC.entityExistsCheck(userName, R.keys(usersInfo)),
                PC.isObject(names), PC.elementsFromEnum(R.keys(names), Constants.ownedEntityTypes2)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const chain2 = R.toPairs(names).map(pair => getEntityConsistencyCheck(pair[0], pair[1], this.database));
                PC.precondition(PC.chainCheck(chain2), reject, () => {
                    const isAdmin = this.database.ManagementInfo.admin === user.name;
                    if (!isAdmin) {
                        const userInfo = this.database.ManagementInfo.UsersInfo[user.name];
                        R.keys(names).forEach((entity) => {
                            names[entity] = R.intersection(names[entity], userInfo[entity]);
                        });
                    }
                    const { ManagementInfo } = this.database;
                    Object.keys(names).forEach((entity) => {
                        if (names[entity].length !== 0) {
                            ManagementInfo.UsersInfo[userName][entity] = ManagementInfo.UsersInfo[userName][entity]
                                .filter(charName => names[entity].indexOf(charName) === -1);
                        }
                    });
                    this.publishPermissionsUpdate();
                    resolve();
                });
            });
        });
    };

    // This call prevent user to assign permission for not user objects.
    // 1. Possibly user is a hacker so it tries to make more than it can.
    // 2. User web page has not relevant information so he see that object is available but actually it is not.
    // This call is filter so it can't be listener because it modifies original data.
    LocalDBMS.prototype.assignPermission = function ({ userName, names } = {}, user) {
        return new Promise((resolve, reject) => {
            const usersInfo = this.database.ManagementInfo.UsersInfo;
            const chain = [PC.entityExistsCheck(user.name, R.keys(usersInfo)),
                PC.entityExistsCheck(userName, R.keys(usersInfo)), PC.isObject(names), PC.elementsFromEnum(
                    R.keys(names),
                    Constants.ownedEntityTypes2
                )];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const chain2 = R.toPairs(names).map(pair => getEntityConsistencyCheck(pair[0], pair[1], this.database));
                PC.precondition(PC.chainCheck(chain2), reject, () => {
                    const isAdmin = this.database.ManagementInfo.admin === user.name;
                    if (!isAdmin) {
                        const userInfo = this.database.ManagementInfo.UsersInfo[user.name];
                        R.keys(names).forEach((entity) => {
                            names[entity] = R.intersection(names[entity], userInfo[entity]);
                        });
                    }
                    const { ManagementInfo } = this.database;
                    Object.keys(names).forEach((entity) => {
                        if (names[entity].length !== 0) {
                            names[entity].forEach((charName) => {
                                if (ManagementInfo.UsersInfo[userName][entity].indexOf(charName) === -1) {
                                    ManagementInfo.UsersInfo[userName][entity].push(charName);
                                }
                            });

                            Object.keys(ManagementInfo.UsersInfo).forEach((name) => {
                                if (name === userName) {
                                    return;
                                }

                                ManagementInfo.UsersInfo[name][entity] = ManagementInfo.UsersInfo[name][entity]
                                    .filter(charName => names[entity].indexOf(charName) === -1);
                            });
                        }
                    });
                    this.publishPermissionsUpdate();
                    resolve();
                });
            });
        });
    };

    const _addProfileToUser = function ([args, user] = []) {
        if (user === undefined) return;
        let collectionName = args.type;
        const objectName = args.characterName;
        if (collectionName === 'character') collectionName = 'characters';
        if (collectionName === 'player') collectionName = 'players';
        this.database.ManagementInfo.UsersInfo[user.name][collectionName].push(objectName);
        this.publishPermissionsUpdate();
    };

    addListener('createProfile', _addProfileToUser);

    const _addObjectToUser = (collectionName, pickName) => function ([args, user] = []) {
        if (user === undefined) return;
        // throw new Error(JSON.stringify({collectionName, objectName}));
        const objectName = args[pickName];
        // if (collectionName === 'character') collectionName = 'characters';
        // if (collectionName === 'player') collectionName = 'players';
        this.database.ManagementInfo.UsersInfo[user.name][collectionName].push(objectName);
        this.publishPermissionsUpdate();
    };

    addListener('createStory', _addObjectToUser('stories', 'storyName'));
    addListener('createGroup', _addObjectToUser('groups', 'groupName'));

    const _renameProfile = function ([args, user] = []) {
        let collectionName = args.type;
        const { fromName, toName } = args;

        if (collectionName === 'character') collectionName = 'characters';
        if (collectionName === 'player') collectionName = 'players';
        const userName = _getObjectOwnerName(collectionName, fromName, this.database.ManagementInfo.UsersInfo);
        if (userName) {
            const collection = this.database.ManagementInfo.UsersInfo[userName][collectionName];
            const index = collection.indexOf(fromName);
            collection[index] = toName;
        }
        this.publishPermissionsUpdate();
    };

    addListener('renameProfile', _renameProfile);

    const _renameObject = collectionName => function ([args, user] = []) {
        const { fromName, toName } = args;
        const userName = _getObjectOwnerName(collectionName, fromName, this.database.ManagementInfo.UsersInfo);
        if (userName) {
            const collection = this.database.ManagementInfo.UsersInfo[userName][collectionName];
            const index = collection.indexOf(fromName);
            collection[index] = toName;
        }
        this.publishPermissionsUpdate();
    };
    addListener('renameStory', _renameObject('stories'));
    addListener('renameGroup', _renameObject('groups'));

    const _removeProfile = function ([args, user] = []) {
        let collectionName = args.type;
        const objectName = args.characterName;
        if (collectionName === 'character') collectionName = 'characters';
        if (collectionName === 'player') collectionName = 'players';
        const userName = _getObjectOwnerName(collectionName, objectName, this.database.ManagementInfo.UsersInfo);
        if (userName) {
            const collection = this.database.ManagementInfo.UsersInfo[userName][collectionName];
            collection.splice(collection.indexOf(objectName), 1);
        }
        this.publishPermissionsUpdate();
    };
    addListener('removeProfile', _removeProfile);

    const _removeObject = (collectionName, pickName) => function ([args, user] = []) {
        const objectName = args[pickName];
        const userName = _getObjectOwnerName(collectionName, objectName, this.database.ManagementInfo.UsersInfo);
        if (userName) {
            const collection = this.database.ManagementInfo.UsersInfo[userName][collectionName];
            collection.splice(collection.indexOf(objectName), 1);
        }
        this.publishPermissionsUpdate();
    };

    addListener('removeStory', _removeObject('stories', 'storyName'));
    addListener('removeGroup', _removeObject('groups', 'groupName'));

    // eslint-disable-next-line no-var,vars-on-top
    var _getObjectOwnerName = R.curry((collectionName, objectName, usersInfo) => {
        const owners = R.keys(usersInfo).filter(key => R.contains(objectName, usersInfo[key][collectionName]));
        if (owners.length > 0) {
            return owners[0];
        }
        //        for (const key in usersInfo) {
        //            if (usersInfo[key][collectionName].indexOf(objectName) !== -1) {
        //                return key;
        //            }
        //        }
        return null;
    });
};
