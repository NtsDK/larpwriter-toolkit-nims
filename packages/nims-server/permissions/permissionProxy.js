/* eslint-disable no-unused-expressions, prefer-promise-reject-errors */
'use strict';

const R = require('ramda');

const open = () => Promise.resolve();
const forbidden = () => Promise.reject(['errors-forbidden']);
const unknownCommand = ['errors-unknown-command'];

const or = function (promise1, promise2) {
    return new Promise((resolve, reject) => {
        promise1.then(() => {
            promise2.catch(() => {});
            resolve();
        }).catch((err) => {
            promise2.then(() => {
                resolve();
            }).catch((err2) => {
                reject([err, err2]);
            });
        });
    });
};

function getEditorsList(res) {
    if (Array.isArray(res.editors)) return res.editors.filter(Boolean);
    return res.editor ? [res.editor] : [];
}

function getAdminsList(res) {
    if (Array.isArray(res.admins)) return res.admins.filter(Boolean);
    return res.admin ? [res.admin] : [];
}

const userIsLogged = (args, user) => new Promise((resolve, reject) => {
    user ? resolve() : reject(['errors-user-is-not-logged']);
});
const roleIsOrganizer = (args, user) => new Promise((resolve, reject) => {
    user && user.role === 'organizer' ? resolve() : reject(['errors-forbidden-for-role', [user && user.role]]);
});
const organizerIsAdmin = (args, user, db) => new Promise((resolve, reject) => {
    db.getManagementInfo().then((res) => (
        getAdminsList(res).includes(user.name) ? resolve() : reject(['errors-forbidden-for-non-admin'])
    )).catch(reject);
});
const organizerIsEditor = (args, user, db) => new Promise((resolve, reject) => {
    db.getManagementInfo().then((res) => (
        getEditorsList(res).includes(user.name) ? resolve() : reject(['errors-forbidden-for-non-editor'])
    )).catch(reject);
});
const canPlayerCreateChar = (args, user, db) => new Promise((resolve, reject) => {
    db.getPlayersOptions().then((res) => (
        res.allowCharacterCreation ? resolve() : reject(['errors-forbidden-to-create-char'])
    )).catch(reject);
});
const checkEditorMode = (args, user, db) => new Promise((resolve, reject) => {
    db.getManagementInfo().then((res) => {
        const editors = getEditorsList(res);
        if (editors.length === 0) {
            resolve();
        } else if (editors.includes(user.name)) {
            resolve();
        } else {
            reject(['errors-forbidden-for-non-editor']);
        }
    }).catch(reject);
});

function userOwnedList(res, userName, type) {
    const info = res.usersInfo && res.usersInfo[userName];
    if (!info) return [];
    return info[type] || [];
}

const isProfileOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
    let { type } = args;
    const profile = args[property];
    if (type === 'character') type = 'characters';
    if (type === 'player' || type === 'questionnaire') type = 'players';
    db.getManagementInfo().then((res) => {
        R.contains(profile, userOwnedList(res, user.name, type))
            ? resolve()
            : reject(['errors-organizer-is-not-an-owner', [profile]]);
    }).catch(reject);
}));
const isGroupOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
    const group = args[property];
    db.getManagementInfo().then((res) => {
        R.contains(group, userOwnedList(res, user.name, 'groups'))
            ? resolve()
            : reject(['errors-organizer-is-not-an-owner', [group]]);
    }).catch(reject);
}));
const isStoryOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
    const story = args[property];
    db.getManagementInfo().then((res) => {
        R.contains(story, userOwnedList(res, user.name, 'stories'))
            ? resolve()
            : reject(['errors-organizer-is-not-an-owner', [story]]);
    }).catch(reject);
}));
const isCharacterOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
    const character = args[property];
    db.getManagementInfo().then((res) => {
        R.contains(character, userOwnedList(res, user.name, 'characters'))
            ? resolve()
            : reject(['errors-organizer-is-not-an-owner', [character]]);
    }).catch(reject);
}));

const isAdaptationOwner = (args, user, db) => new Promise((resolve, reject) => {
    db.getManagementInfo().then((res) => {
        if (res.adaptationRights === 'ByStory') {
            isStoryOwner('storyName', args, user, db).then(resolve, reject);
        } else if (res.adaptationRights === 'ByCharacter') {
            isCharacterOwner('characterName', args, user, db).then(resolve, reject);
        } else {
            // default / empty: treat as by story
            isStoryOwner('storyName', args, user, db).then(resolve, reject);
        }
    }).catch(reject);
});

const isPlayerProfileOwner = (args, user, db) => new Promise((resolve, reject) => {
    const profileType = args.type;
    const profileName = args.characterName;
    const { fieldName } = args;
    Promise.all([
        db.getProfileStructure({ type: 'character' }),
        db.getProfileStructure({ type: 'player' }),
        db.getProfileStructure({ type: 'questionnaire' }),
        db.getProfileBindings(),
        db.getResolvedPlayerProfileName({ userName: user.name }),
    ]).then((results) => {
        const [characterPs, playerPs, questionnairePs, bindings, resolvedName] = results;
        let profileItem;
        if (profileType === 'player' || profileType === 'questionnaire') {
            if (!resolvedName || resolvedName !== profileName) {
                reject(['errors-player-cant-write-to-other-player']);
                return;
            }
            profileItem = R.find(
                R.propEq('name', fieldName),
                profileType === 'questionnaire' ? questionnairePs : playerPs,
            );
        } else if (profileType === 'character') {
            if (!resolvedName || bindings[profileName] !== resolvedName) {
                reject(['errors-character-is-not-bonded-to-player']);
                return;
            }
            profileItem = R.find(R.propEq('name', fieldName), characterPs);
        } else {
            reject(['errors-player-cant-write-profile-item']);
            return;
        }
        if (!profileItem) {
            reject(['errors-player-cant-write-profile-item']);
            return;
        }
        profileItem.playerAccess === 'write'
            ? resolve()
            : reject(['errors-player-cant-write-profile-item']);
    }).catch(reject);
});

const canUpdateProfileField = (property, args, user, db) => new Promise((resolve, reject) => {
    if (user.role === 'organizer') {
        isProfileOwner(property, args, user, db).then(resolve, reject);
    } else {
        isPlayerProfileOwner(args, user, db).then(resolve, reject);
    }
});

const roleIsOrganizerCheck = (args, user, db) => Promise.all([
    userIsLogged(args, user, db),
    roleIsOrganizer(args, user, db),
]);
const organizerIsAdminCheck = (args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    organizerIsAdmin(args, user, db),
]);
const organizerIsAdminOrEditorCheck = (args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    or(organizerIsAdmin(args, user, db), organizerIsEditor(args, user, db)),
]);
const canPlayerCreateCharCheck = (args, user, db) => Promise.all([
    userIsLogged(args, user, db),
    canPlayerCreateChar(args, user, db),
]);

/** Players may only resolve their own login; organizers may resolve any. */
const canResolvePlayerProfileName = (args, user, db) => Promise.all([
    userIsLogged(args, user, db),
    new Promise((resolve, reject) => {
        const target = args && args.userName;
        if (!target) {
            reject(['errors-user-is-not-found']);
            return;
        }
        if (user.role === 'organizer' || user.name === target) {
            resolve();
            return;
        }
        reject(['errors-forbidden']);
    }),
]);
// After checkEditorMode: if editors are assigned, caller is already an editor → allow.
// If editor mode is off → admin or entity owner (prefer owner error message).
const contentMutateOr = (ownerCheck) => (args, user, db) => db.getManagementInfo().then((res) => {
    if (getEditorsList(res).length > 0) {
        return Promise.resolve();
    }
    return organizerIsAdmin(args, user, db).catch(() => ownerCheck(args, user, db));
});

const isProfileOwnerCheck = R.curry((property, args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    checkEditorMode(args, user, db),
    contentMutateOr(isProfileOwner(property))(args, user, db),
]));
const isGroupOwnerCheck = R.curry((property, args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    checkEditorMode(args, user, db),
    contentMutateOr(isGroupOwner(property))(args, user, db),
]));
const isStoryOwnerCheck = R.curry((property, args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    checkEditorMode(args, user, db),
    contentMutateOr(isStoryOwner(property))(args, user, db),
]));
const isAdaptationOwnerCheck = (args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    checkEditorMode(args, user, db),
    contentMutateOr(isAdaptationOwner)(args, user, db),
]);
const canUpdateProfileFieldCheck = R.curry((property, args, user, db) => {
    // Players may edit their own writeable fields regardless of editor mode.
    if (user && user.role === 'player') {
        return Promise.all([
            userIsLogged(args, user, db),
            canUpdateProfileField(property, args, user, db),
        ]);
    }
    return Promise.all([
        userIsLogged(args, user, db),
        checkEditorMode(args, user, db),
        contentMutateOr(canUpdateProfileField.bind(null, property))(args, user, db),
    ]);
});

/** Create entities / project-wide content: organizers only, respect editor lock. */
const organizerContentCreateCheck = (args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    checkEditorMode(args, user, db),
]);

/** Bind/unbind character↔player: editor lock + character owner (or admin when unlocked). */
const bindCharacterCheck = (args, user, db) => Promise.all([
    roleIsOrganizerCheck(args, user, db),
    checkEditorMode(args, user, db),
    contentMutateOr(isCharacterOwner('characterName'))(args, user, db),
]);

const apiInfo = {
    baseAPI: {
        _init: forbidden,
        getDatabase: organizerIsAdminCheck,
        setDatabase: organizerIsAdminCheck,
        getMetaInfo: roleIsOrganizerCheck,
        setMetaInfoString: organizerIsAdminCheck,
        setMetaInfoDate: organizerIsAdminCheck,
        ensureAdminExists: forbidden,
    },
    consistencyCheckAPI: {
        getConsistencyCheckResult: roleIsOrganizerCheck,
    },
    statisticsAPI: {
        getStatistics: roleIsOrganizerCheck,
    },
    profilesAPI: {
        getProfileNamesArray: roleIsOrganizerCheck,
        getProfile: roleIsOrganizerCheck,
        getAllProfiles: roleIsOrganizerCheck,
        createProfile: organizerContentCreateCheck,
        renameProfile: isProfileOwnerCheck('fromName'),
        removeProfile: isProfileOwnerCheck('characterName'),
        updateProfileField: canUpdateProfileFieldCheck('characterName'),
        getProfileStructure: roleIsOrganizerCheck,
        getProfileBindings: roleIsOrganizerCheck,
        bindCharacterToPlayer: bindCharacterCheck,
        unbindCharacterFromPlayer: bindCharacterCheck,
        createProfileItem: organizerIsAdminCheck,
        moveProfileItem: organizerIsAdminCheck,
        removeProfileItem: organizerIsAdminCheck,
        changeProfileItemType: organizerIsAdminCheck,
        changeProfileItemPlayerAccess: organizerIsAdminCheck,
        renameProfileItem: organizerIsAdminCheck,
        doExportProfileItemChange: organizerIsAdminCheck,
        showInRoleGridProfileItemChange: organizerIsAdminCheck,
        updateDefaultValue: organizerIsAdminCheck,
    },
    profileViewAPI: {
        getRoleGridInfo: roleIsOrganizerCheck,
        getCharactersSummary: roleIsOrganizerCheck,
        getExtendedProfileBindings: roleIsOrganizerCheck,
        getProfileFilterInfo: roleIsOrganizerCheck,
        applyProfileFilter: roleIsOrganizerCheck,
    },
    groupsAPI: {
        getGroupNamesArray: roleIsOrganizerCheck,
        getGroup: roleIsOrganizerCheck,
        getAllCharacterGroupTexts: roleIsOrganizerCheck,
        createGroup: organizerContentCreateCheck,
        renameGroup: isGroupOwnerCheck('fromName'),
        removeGroup: isGroupOwnerCheck('groupName'),
        saveFilterToGroup: isGroupOwnerCheck('groupName'),
        updateGroupProfileField: isGroupOwnerCheck('groupName'),
        getGroupMembers: roleIsOrganizerCheck,
        addCharacterToGroup: isGroupOwnerCheck('groupName'),
        removeCharacterFromGroup: isGroupOwnerCheck('groupName'),
        getGroupProfile: roleIsOrganizerCheck,
        getGroupProfileStructure: roleIsOrganizerCheck,
    },
    relationsAPI: {
        getRelationsSummary: roleIsOrganizerCheck,
        getRelations: roleIsOrganizerCheck,
        getCharacterRelation: roleIsOrganizerCheck,
        createCharacterRelation: organizerContentCreateCheck,
        removeCharacterRelation: organizerContentCreateCheck,
        setCharacterRelationText: organizerContentCreateCheck,
        setRelationReadyStatus: organizerContentCreateCheck,
        setRelationEssence: organizerContentCreateCheck,
        setRelationOrigin: organizerContentCreateCheck,
        getCharacterRelationText: roleIsOrganizerCheck,
    },
    briefingExportAPI: {
        getBriefingData: roleIsOrganizerCheck,
        getCharacterReport: roleIsOrganizerCheck,
    },
    entityAPI: {
        getEntityNamesArray: roleIsOrganizerCheck,
    },
    storyBaseAPI: {
        getStoryNamesArray: roleIsOrganizerCheck,
        getAllStories: roleIsOrganizerCheck,
        getWriterStory: roleIsOrganizerCheck,
        setWriterStory: isStoryOwnerCheck('storyName'),
        createStory: organizerContentCreateCheck,
        renameStory: isStoryOwnerCheck('fromName'),
        removeStory: isStoryOwnerCheck('storyName'),
    },
    storyEventsAPI: {
        getStoryEvents: roleIsOrganizerCheck,
        createEvent: isStoryOwnerCheck('storyName'),
        moveEvent: isStoryOwnerCheck('storyName'),
        cloneEvent: isStoryOwnerCheck('storyName'),
        mergeEvents: isStoryOwnerCheck('storyName'),
        removeEvent: isStoryOwnerCheck('storyName'),
        setEventOriginProperty: isStoryOwnerCheck('storyName'),
    },
    storyCharactersAPI: {
        getStoryCharacterNamesArray: roleIsOrganizerCheck,
        getStoryCharacters: roleIsOrganizerCheck,
        addStoryCharacter: isStoryOwnerCheck('storyName'),
        switchStoryCharacters: isStoryOwnerCheck('storyName'),
        removeStoryCharacter: isStoryOwnerCheck('storyName'),
        updateCharacterInventory: isStoryOwnerCheck('storyName'),
        onChangeCharacterActivity: isStoryOwnerCheck('storyName'),
        addCharacterToEvent: isStoryOwnerCheck('storyName'),
        removeCharacterFromEvent: isStoryOwnerCheck('storyName'),
    },
    storyAdaptationsAPI: {
        getFilteredStoryNames: roleIsOrganizerCheck,
        getStory: roleIsOrganizerCheck,
        setEventAdaptationProperty: isAdaptationOwnerCheck,
    },
    accessManagerAPI: {
        getManagementInfo: roleIsOrganizerCheck,
        assignAdmin: organizerIsAdminCheck,
        revokeAdmin: organizerIsAdminCheck,
        assignEditor: organizerIsAdminCheck,
        revokeEditor: organizerIsAdminCheck,
        removeEditor: organizerIsAdminCheck,
        changeAdaptationRightsMode: organizerIsAdminCheck,
        createOrganizer: organizerIsAdminCheck,
        changeOrganizerPassword: organizerIsAdminCheck,
        removeOrganizer: organizerIsAdminCheck,
        assignCharactersToOrganizer: organizerIsAdminCheck,
        assignStoriesToOrganizer: organizerIsAdminCheck,
        assignGroupsToOrganizer: organizerIsAdminCheck,
        assignPlayersToOrganizer: organizerIsAdminCheck,
        getEntityOwners: roleIsOrganizerCheck,
        createPlayer: organizerIsAdminCheck,
        createPlayerLogin: organizerIsAdminCheck,
        removePlayerLogin: organizerIsAdminCheck,
        changePlayerPassword: organizerIsAdminCheck,
        promotePlayerToOrganizer: organizerIsAdminCheck,
        linkPlayerLoginToProfile: organizerIsAdminCheck,
        unlinkPlayerLoginFromProfile: organizerIsAdminCheck,
        getResolvedPlayerProfileName: canResolvePlayerProfileName,
        getPlayerProfileInfo: userIsLogged,
        getWelcomeText: userIsLogged,
        getPlayersOptions: roleIsOrganizerCheck,
        setPlayerOption: organizerIsAdminCheck,
        setWelcomeText: organizerIsAdminCheck,
        createCharacterByPlayer: canPlayerCreateCharCheck,
        login: forbidden,
        signUp: forbidden,
        getUser: forbidden,
        setPassword: forbidden,
        checkPassword: forbidden,
    },
    textSearchAPI: {
        getTexts: roleIsOrganizerCheck,
    },
    gearsAPI: {
        getAllGearsData: roleIsOrganizerCheck,
        setGearsData: organizerContentCreateCheck,
        setGearsPhysicsEnabled: organizerContentCreateCheck,
        setGearsShowNotesEnabled: organizerContentCreateCheck,
    },
    slidersAPI: {
        getSliderData: roleIsOrganizerCheck,
        moveSlider: organizerContentCreateCheck,
        createSlider: organizerContentCreateCheck,
        updateSliderNaming: organizerContentCreateCheck,
        updateSliderValue: organizerContentCreateCheck,
        removeSlider: organizerContentCreateCheck,
    },
};

const apiInfoObj = R.mergeAll(R.values(apiInfo));

function claimOwnership(rawDb, user, collection, objectName) {
    if (!user || user.role !== 'organizer' || !objectName) return;
    const usersInfo = rawDb.database && rawDb.database.ManagementInfo && rawDb.database.ManagementInfo.UsersInfo;
    if (!usersInfo || !usersInfo[user.name]) return;
    const list = usersInfo[user.name][collection];
    if (!Array.isArray(list)) return;
    if (!list.includes(objectName)) list.push(objectName);
}

function findOwner(rawDb, collection, objectName) {
    const usersInfo = rawDb.database && rawDb.database.ManagementInfo && rawDb.database.ManagementInfo.UsersInfo;
    if (!usersInfo) return null;
    for (const [name, info] of Object.entries(usersInfo)) {
        if (info[collection] && info[collection].includes(objectName)) return name;
    }
    return null;
}

function renameOwned(rawDb, collection, fromName, toName) {
    const owner = findOwner(rawDb, collection, fromName);
    if (!owner) return;
    const list = rawDb.database.ManagementInfo.UsersInfo[owner][collection];
    const idx = list.indexOf(fromName);
    if (idx !== -1) list[idx] = toName;
}

function removeOwned(rawDb, collection, objectName) {
    const owner = findOwner(rawDb, collection, objectName);
    if (!owner) return;
    const list = rawDb.database.ManagementInfo.UsersInfo[owner][collection];
    const idx = list.indexOf(objectName);
    if (idx !== -1) list.splice(idx, 1);
}

function applyOwnershipSideEffects(prop, args, user, rawDb) {
    switch (prop) {
    case 'createProfile':
        claimOwnership(rawDb, user, args.type === 'player' ? 'players' : 'characters', args.characterName);
        break;
    case 'createStory':
        claimOwnership(rawDb, user, 'stories', args.storyName);
        break;
    case 'createGroup':
        claimOwnership(rawDb, user, 'groups', args.groupName);
        break;
    case 'renameProfile':
        renameOwned(rawDb, args.type === 'player' ? 'players' : 'characters', args.fromName, args.toName);
        break;
    case 'renameStory':
        renameOwned(rawDb, 'stories', args.fromName, args.toName);
        break;
    case 'renameGroup':
        renameOwned(rawDb, 'groups', args.fromName, args.toName);
        break;
    case 'removeProfile':
        removeOwned(rawDb, args.type === 'player' ? 'players' : 'characters', args.characterName);
        break;
    case 'removeStory':
        removeOwned(rawDb, 'stories', args.storyName);
        break;
    case 'removeGroup':
        removeOwned(rawDb, 'groups', args.groupName);
        break;
    default:
        break;
    }
}

function extractCallArgs(argumentsList) {
    if (argumentsList.length === 0) {
        return { args: {}, user: undefined };
    }
    if (argumentsList.length === 1) {
        return { args: {}, user: argumentsList[0] };
    }
    return { args: argumentsList[0] || {}, user: argumentsList[1] };
}

exports.permissionAPIList = R.keys(apiInfoObj);

exports.applyPermissionProxy = R.curry(function applyPermissionProxy(makeValidationError, dbms) {
    return new Proxy(dbms, {
        get(target, prop) {
            if (typeof prop === 'symbol') {
                return Reflect.get(target, prop);
            }
            const value = target[prop];
            if (value === undefined) {
                return () => Promise.reject(makeValidationError(unknownCommand));
            }
            if (typeof value !== 'function') {
                return value;
            }

            return new Proxy(value, {
                apply(target2, thisArg, argumentsList) {
                    return new Promise((resolve, reject) => {
                        if (apiInfoObj[prop] === undefined) {
                            reject(makeValidationError(unknownCommand));
                            return;
                        }

                        const { args, user } = extractCallArgs(argumentsList);
                        const checkArgs = [args, user, dbms];

                        apiInfoObj[prop].apply(thisArg, checkArgs).then(() => {
                            Promise.resolve(target2.apply(target, argumentsList)).then((result) => {
                                applyOwnershipSideEffects(prop, args, user, target);
                                resolve(result);
                            }, reject);
                        }, (err) => reject(err instanceof Error ? err : makeValidationError(err)));
                    });
                },
            });
        },
    });
});
