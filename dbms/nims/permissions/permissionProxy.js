/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-promise-reject-errors */
const R = require('ramda');

const open = () => Promise.resolve();
const forbidden = () => Promise.reject(['errors-forbidden']);
const unknownCommand = ['errors-unknown-command'];

const or = function (promise1, promise2) {
  return new Promise((resolve, reject) => {
    promise1.then(() => {
      promise2.catch(err => err);
      resolve();
    }).catch((err) => {
      promise2.then(() => {
        resolve();
      }).catch((err2) => {
        // in theory it should return combined error
        reject([err, err2]);
      });
    });
  });
};

const userIsLogged = (args, user, db) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-unused-expressions
  user ? resolve() : reject(['errors-user-is-not-logged']);
});
const roleIsOrganizer = (args, user, db) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-unused-expressions
  user.role === 'organizer' ? resolve() : reject(['errors-forbidden-for-role', [user.role]]);
});
const organizerIsAdmin = (args, user, db) => new Promise((resolve, reject) => {
  db.getManagementInfo().then(res => (res.admin === user.name ? resolve() : reject(['errors-forbidden-for-non-admin']))).catch(reject);
});
const organizerIsEditor = (args, user, db) => new Promise((resolve, reject) => {
  db.getManagementInfo().then(res => (res.editor === user.name ? resolve() : reject(['errors-forbidden-for-non-editor']))).catch(reject);
});
const canPlayerCreateChar = (args, user, db) => new Promise((resolve, reject) => {
  db.getPlayersOptions().then(res => (res.allowCharacterCreation ? resolve() : reject(['errors-forbidden-to-create-char']))).catch(reject);
});
const checkEditorMode = (args, user, db) => new Promise((resolve, reject) => {
  db.getManagementInfo().then((res) => {
    if (res.editor === null) {
      resolve();
    } else {
      res.editor === user.name ? resolve() : reject(['errors-forbidden-for-non-editor']);
    }
  }).catch(reject);
});
const isProfileOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
  let { type } = args;
  const profile = args[property];
  if (type === 'character') type = 'characters';
  if (type === 'player') type = 'players';
  db.getManagementInfo().then((res) => {
    R.contains(profile, res.usersInfo[user.name][type]) ? resolve() : reject(['errors-organizer-is-not-an-owner', [profile]]);
  }).catch(reject);
}));
const isGroupOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
  const group = args[property];
  db.getManagementInfo().then((res) => {
    R.contains(group, res.usersInfo[user.name].groups) ? resolve() : reject(['errors-organizer-is-not-an-owner', [group]]);
  }).catch(reject);
}));
const isStoryOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
  const story = args[property];
  db.getManagementInfo().then((res) => {
    R.contains(story, res.usersInfo[user.name].stories) ? resolve() : reject(['errors-organizer-is-not-an-owner', [story]]);
  }).catch(reject);
}));
const isCharacterOwner = R.curry((property, args, user, db) => new Promise((resolve, reject) => {
  const story = args[property];
  db.getManagementInfo().then((res) => {
    R.contains(story, res.usersInfo[user.name].characters) ? resolve() : reject(['errors-organizer-is-not-an-owner', [story]]);
  }).catch(reject);
}));

const isAdaptationOwner = (args, user, db) => new Promise((resolve, reject) => {
  db.getManagementInfo().then((res) => {
    if (res.adaptationRights === 'ByStory') {
      isStoryOwner('storyName', args, user, db).then(resolve, reject);
    } else if (res.adaptationRights === 'ByCharacter') {
      isCharacterOwner('characterName', args, user, db).then(resolve, reject);
    } else {
      reject(['errors-unknown-adaptation-rights-mode', [res.adaptationRights]]);
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
    db.getProfileBinding({ type: profileType, name: profileName })
  ]).then((results) => {
    const [characterPs, playerPs, binding] = results;
    let profileItem;
    if (profileType === 'player') {
      if (user.name !== profileName) {
        reject(['errors-player-cant-write-to-other-player']);
      }
      profileItem = R.find(R.propEq('name', fieldName), playerPs);
    } else {
      // const binding = dbmsUtils._getProfileBinding('character', profileName, db);
      if (user.name !== binding[1]) {
        reject(['errors-character-is-not-bonded-to-player']);
      }
      profileItem = R.find(R.propEq('name', fieldName), characterPs);
    }
    profileItem.playerAccess === 'write' ? resolve() : reject(['errors-player-cant-write-profile-item']);
  }).catch(reject);
});

const canUpdateProfileField = (property, args, user, db) => new Promise((resolve, reject) => {
  if (user.role === 'organizer') {
    isProfileOwner(property, args, user, db).then(resolve, reject);
  } else {
    isPlayerProfileOwner(args, user, db).then(resolve, reject);
  }
});

// const isPlayerOwner = R.curry((property, args, user, db) => {
//     return new Promise((resolve, reject) => {
//         const player = args[property];
//         db.getManagementInfo().then(res => {
//             R.contains(player, res.usersInfo[user.name].players) ? resolve() : reject(['errors-organizer-is-not-an-owner', [player]]);
//         }).catch(reject);
//     });
// });


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
const isProfileOwnerCheck = R.curry((property, args, user, db) => Promise.all([
  roleIsOrganizerCheck(args, user, db),
  checkEditorMode(args, user, db),
  or(isProfileOwner(property, args, user, db), organizerIsEditor(args, user, db)),
]));
const isGroupOwnerCheck = R.curry((property, args, user, db) => Promise.all([
  roleIsOrganizerCheck(args, user, db),
  checkEditorMode(args, user, db),
  or(isGroupOwner(property, args, user, db), organizerIsEditor(args, user, db)),
]));
const isStoryOwnerCheck = R.curry((property, args, user, db) => Promise.all([
  roleIsOrganizerCheck(args, user, db),
  checkEditorMode(args, user, db),
  or(isStoryOwner(property, args, user, db), organizerIsEditor(args, user, db)),
]));
const isAdaptationOwnerCheck = R.curry((args, user, db) => Promise.all([
  roleIsOrganizerCheck(args, user, db),
  checkEditorMode(args, user, db),
  or(isAdaptationOwner(args, user, db), organizerIsEditor(args, user, db)),
]));
const canUpdateProfileFieldCheck = R.curry((property, args, user, db) => Promise.all([
  userIsLogged(args, user, db),
  checkEditorMode(args, user, db),
  or(canUpdateProfileField(property, args, user, db), organizerIsEditor(args, user, db)),
]));
// const isPlayerOwnerCheck = R.curry((property, args, user, db) => {
//     return Promise.all([
//         roleIsOrganizerCheck(args, user, db),
//         checkEditorMode(args, user, db),
//         isPlayerOwner(property, args, user, db),
//     ]);
// });

const apiInfo = {
  baseAPI: {
    _init: forbidden,
    getDatabase: roleIsOrganizerCheck,
    setDatabase: organizerIsAdminCheck,
    getMetaInfo: roleIsOrganizerCheck,
    setMetaInfoString: organizerIsAdminCheck,
    setMetaInfoDate: organizerIsAdminCheck,
  },
  consistencyCheckAPI: {
    getConsistencyCheckResult: roleIsOrganizerCheck
  },
  statisticsAPI: {
    getStatistics: roleIsOrganizerCheck,
    getStatisticsLevel1: roleIsOrganizerCheck
  },
  profilesAPI: {
    getProfileNamesArray: roleIsOrganizerCheck,
    getProfile: roleIsOrganizerCheck,
    getAllProfiles: roleIsOrganizerCheck,
    createProfile: roleIsOrganizerCheck,
    renameProfile: isProfileOwnerCheck('fromName'),
    removeProfile: isProfileOwnerCheck('characterName'),
    updateProfileField: canUpdateProfileFieldCheck('characterName'),
  },
  profileBindingAPI: {
    getProfileBindings: roleIsOrganizerCheck,
    getExtendedProfileBindings: roleIsOrganizerCheck,
    getProfileBinding: roleIsOrganizerCheck,
    createBinding: roleIsOrganizerCheck,
    removeBinding: roleIsOrganizerCheck
  },
  profileViewAPI: {
    getRoleGridInfo: roleIsOrganizerCheck,
  },
  groupsAPI: {
    getGroupNamesArray: roleIsOrganizerCheck,
    getGroup: roleIsOrganizerCheck,
    getCharacterGroupTexts: roleIsOrganizerCheck,
    getAllCharacterGroupTexts: roleIsOrganizerCheck,
    createGroup: roleIsOrganizerCheck,
    renameGroup: isGroupOwnerCheck('fromName'),
    removeGroup: isGroupOwnerCheck('groupName'),
    saveFilterToGroup: isGroupOwnerCheck('groupName'),
    updateGroupField: isGroupOwnerCheck('groupName'),
    getProfileFilterInfo: roleIsOrganizerCheck,
    getGroupCharacterSets: roleIsOrganizerCheck,
    doExportGroup: roleIsOrganizerCheck
  },
  groupSchemaAPI: {
    getGroupSchemas: roleIsOrganizerCheck
  },
  relationsAPI: {
    getRelationsSummary: roleIsOrganizerCheck,
    getRelations: roleIsOrganizerCheck,
    getCharacterRelation: roleIsOrganizerCheck,
    createCharacterRelation: roleIsOrganizerCheck,
    removeCharacterRelation: roleIsOrganizerCheck,
    setCharacterRelationText: roleIsOrganizerCheck,
    setRelationReadyStatus: roleIsOrganizerCheck,
    setRelationEssenceStatus: roleIsOrganizerCheck,
    setOriginRelationText: roleIsOrganizerCheck
  },
  briefingExportAPI: {
    getBriefingData: roleIsOrganizerCheck
  },
  profileConfigurerAPI: {
    getProfileStructure: roleIsOrganizerCheck,
    createProfileItem: organizerIsAdminCheck,
    moveProfileItem: organizerIsAdminCheck,
    removeProfileItem: organizerIsAdminCheck,
    changeProfileItemType: organizerIsAdminCheck,
    changeProfileItemPlayerAccess: organizerIsAdminCheck,
    renameProfileItem: organizerIsAdminCheck,
    renameEnumValue: organizerIsAdminCheck,
    doExportProfileItemChange: organizerIsAdminCheck,
    showInRoleGridProfileItemChange: organizerIsAdminCheck,
    updateDefaultValue: organizerIsAdminCheck
  },
  entityAPI: {
    getEntityNamesArray: roleIsOrganizerCheck
  },
  storyBaseAPI: {
    getStoryNamesArray: roleIsOrganizerCheck,
    getAllStories: roleIsOrganizerCheck,
    getWriterStory: roleIsOrganizerCheck,
    setWriterStory: isStoryOwnerCheck('storyName'),
    createStory: roleIsOrganizerCheck,
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
    setEventOriginProperty: isStoryOwnerCheck('storyName')
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
    removeCharacterFromEvent: isStoryOwnerCheck('storyName')
  },
  storyViewAPI: {
    getAllInventoryLists: roleIsOrganizerCheck,
    getCharacterEventGroupsByStory: roleIsOrganizerCheck,
    getCharacterEventsByTime: roleIsOrganizerCheck,
    getEventsTimeInfo: roleIsOrganizerCheck,
    getCharactersSummary: roleIsOrganizerCheck,
    getCharacterReport: roleIsOrganizerCheck
  },
  storyAdaptationsAPI: {
    getFilteredStoryNames: roleIsOrganizerCheck,
    getStory: roleIsOrganizerCheck,
    setEventAdaptationProperty: isAdaptationOwnerCheck
  },
  accessManagerAPI: {
    getManagementInfo: roleIsOrganizerCheck,
    assignAdmin: organizerIsAdminCheck,
    assignEditor: organizerIsAdminCheck,
    removeEditor: organizerIsAdminOrEditorCheck,
    changeAdaptationRightsMode: organizerIsAdminCheck,
    createOrganizer: organizerIsAdminCheck,
    changeOrganizerPassword: organizerIsAdminCheck,
    removeOrganizer: organizerIsAdminCheck,
    removePermission: organizerIsAdminCheck,
    assignPermission: roleIsOrganizerCheck,
    publishPermissionsUpdate: forbidden,
    getPlayerLoginsArray: roleIsOrganizerCheck,
    createPlayer: roleIsOrganizerCheck,
    createPlayerLogin: roleIsOrganizerCheck,
    changePlayerPassword: roleIsOrganizerCheck,
    removePlayerLogin: roleIsOrganizerCheck,
    getWelcomeText: userIsLogged,
    setWelcomeText: organizerIsAdminCheck,
    getPlayersOptions: open,
    setPlayerOption: organizerIsAdminCheck,
    getPlayerProfileInfo: userIsLogged,
    createCharacterByPlayer: canPlayerCreateCharCheck
  },
  textSearchAPI: {
    getTexts: roleIsOrganizerCheck
  },
  gearsAPI: {
    getAllGearsData: roleIsOrganizerCheck,
    setGearsData: roleIsOrganizerCheck,
    setGearsPhysicsEnabled: roleIsOrganizerCheck,
    setGearsShowNotesEnabled: roleIsOrganizerCheck
  },
  slidersAPI: {
    getSliderData: roleIsOrganizerCheck,
    moveSlider: roleIsOrganizerCheck,
    createSlider: roleIsOrganizerCheck,
    updateSliderNaming: roleIsOrganizerCheck,
    updateSliderValue: roleIsOrganizerCheck,
    removeSlider: roleIsOrganizerCheck,
  },
  userAPI: {
    getUser: forbidden,
    setPassword: forbidden,
    checkPassword: forbidden,
    login: forbidden,
    signUp: forbidden
  },
  accessManagerOverridesAPI: {},
  overridesAPI: {},
  // permissionAPI: {
  // //     hasPermission: forbidden
  // },
  permissionSummaryAPI: {
    _getOwnerMap: forbidden,
    getPermissionsSummary: forbidden, // special case
    subscribeOnPermissionsUpdate: forbidden // special case
  },
  logAPI: {
    log: forbidden,
    getLog: roleIsOrganizerCheck
  }
};

const apiInfoObj = R.mergeAll(R.values(apiInfo));

exports.permissionAPIList = R.keys(apiInfoObj);

exports.applyPermissionProxy = R.curry((makeValidationError, dbms) => {
    return new Proxy(dbms, {
        get(target, prop) {
            function isFunction(obj) {
                return typeof obj === 'function';
            }

            // if(target[prop] === undefined || !isFunction(target[prop])) {
            //     return target[prop];
            // }
            if (target[prop] === undefined) {
                return () => Promise.reject(makeValidationError(unknownCommand));
            }


            // if (R.startsWith(prop, 'get') || R.startsWith(prop, 'is')) {
            //     return target[prop];
            // } else {
            return new Proxy(target[prop], {
                apply(target2, thisArg, argumentsList) {
                    // onCallStart();
                    return new Promise((resolve, reject) => {
                        // apiInfoObj[prop].apply(thisArg, argumentsList);
                        if (apiInfoObj[prop] === undefined) {
                            reject(makeValidationError(unknownCommand));
                        }

                        const arr = argumentsList.length === 1 ? [{}, argumentsList[0]] : R.clone(argumentsList);
                        arr.push(dbms);


                        apiInfoObj[prop].apply(thisArg, arr).then(() => {
                        // Promise.resolve().then(() => {
                            // target.apply(thisArg, argumentsList).then(resolve, reject);
                            target2.apply(dbms, argumentsList).then(resolve, reject);
                            // target.apply(dbms, argumentsList).then(resolve, reject);
                        }, err => reject(err instanceof Error ? err : makeValidationError(err)));
                    });
                    // apiInfoObj[prop].apply(thisArg, argumentsList).then(() => {
                    //     return target.apply(thisArg, argumentsList);
                    // }, err =>

                    // const promise = target.apply(thisArg, argumentsList);
                    // // promise.then( () => {
                    // //     onCallFinished()
                    // // }, err => onCallFinished(err));
                    // return promise;
                }
            });
            // }
        },
    });
});
