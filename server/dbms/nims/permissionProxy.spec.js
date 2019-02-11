const R = require('ramda');

const profiles = {
    // nobody
    noUser: {
        userData: undefined
    },
    // player
    player: {
        userData: { name: 'player', role: 'player' },
        beforeAll: ['createPlayer', {
            userName: 'player',
            password: 'player'
        }],
        afterAll: ['removeProfile', {
            type: 'player',
            characterName: 'player'
        }],
    },
    // org, not admin not editor
    organizer: {
        userData: { name: 'organizer', role: 'organizer' },
        beforeAll: ['createOrganizer', {
            name: 'organizer',
            password: 'organizer'
        }],
        afterAll: ['removeOrganizer', {
            name: 'organizer'
        }],
    },
    // org editor
    editor: {
        userData: { name: 'editor', role: 'organizer' },
        beforeAll: ['createOrganizer', {
            name: 'editor',
            password: 'editor'
        }],
        afterAll: ['removeOrganizer', {
            name: 'editor'
        }],
        before: ['assignEditor', { name: 'editor' }],
        after: ['removeEditor'],
    },
    // org admin
    admin: {
        userData: { name: 'admin', role: 'organizer' }
    },
    // org admin editor
    adminEditor: {
        userData: { name: 'admin', role: 'organizer' },
        before: ['assignEditor', { name: 'admin' }],
        after: ['removeEditor'],
    }
};

const behaviors = {
    roleIsOrganizerCheck: {
        accept: ['organizer', 'editor', 'admin', 'adminEditor'],
        reject: ['noUser', 'player']
    },
    userIsLogged: {
        accept: ['organizer', 'editor', 'admin', 'adminEditor', 'player'],
        reject: ['noUser']
    },
    open: {
        accept: [
            'organizer',
            'editor',
            'admin',
            'adminEditor',
            'player',
            'noUser'
        ],
        reject: []
    }
};

const getChecks = {
    baseAPI: [
        {
            func: 'getMetaInfo',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getDatabase',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    briefingExportAPI: [
        {
            func: 'getBriefingData',
            args: {
                selCharacters: null,
                selStories: null,
                exportOnlyFinishedStories: false
            },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    consistencyCheckAPI: [
        {
            func: 'getConsistencyCheckResult',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    entityAPI: [
        {
            func: 'getEntityNamesArray',
            args: { type: 'character' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    groupsAPI: [
        {
            func: 'getGroupNamesArray',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getAllCharacterGroupTexts',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getProfileFilterInfo',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getGroupCharacterSets',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getGroup',
            args: { groupName: 'Эльфы' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getCharacterGroupTexts',
            args: { characterName: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    groupSchemaAPI: [
        {
            func: 'getGroupSchemas',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    logAPI: [
        {
            func: 'getLog',
            args: { pageNumber: 0, filter: {} },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    profileBindingAPI: [
        {
            func: 'getProfileBindings',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getExtendedProfileBindings',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getProfileBinding',
            args: { type: 'character', name: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    profileConfigurerAPI: [
        {
            func: 'getProfileStructure',
            args: { type: 'character' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    profilesAPI: [
        {
            func: 'getProfileNamesArray',
            args: { type: 'character' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getProfile',
            args: { type: 'character', name: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getAllProfiles',
            args: { type: 'character' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    profileViewAPI: [
        {
            func: 'getRoleGridInfo',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    relationsAPI: [
        {
            func: 'getRelationsSummary',
            args: { characterName: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getRelations',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    statisticsAPI: [
        {
            func: 'getStatistics',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    storyAdaptationsAPI: [
        {
            func: 'getFilteredStoryNames',
            args: { showOnlyUnfinishedStories: true },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getStory',
            args: { storyName: 'Начало пути' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    storyBaseAPI: [
        {
            func: 'getStoryNamesArray',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getAllStories',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getWriterStory',
            args: { storyName: 'Начало пути' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    storyCharactersAPI: [
        {
            func: 'getStoryCharacterNamesArray',
            args: { storyName: 'Начало пути' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getStoryCharacters',
            args: { storyName: 'Начало пути' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    storyEventsAPI: [
        {
            func: 'getStoryEvents',
            args: { storyName: 'Начало пути' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    storyViewAPI: [
        {
            func: 'getAllInventoryLists',
            args: { characterName: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getCharacterEventGroupsByStory',
            args: { characterName: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getCharacterEventsByTime',
            args: { characterName: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getEventsTimeInfo',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getCharactersSummary',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getCharacterReport',
            args: { characterName: 'Арагорн' },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    textSearchAPI: [
        {
            func: 'getTexts',
            args: {
                searchStr: 'Арагорн',
                textTypes: [
                    'characterProfiles',
                    'playerProfiles',
                    'groups',
                    'relations',
                    'writerStory',
                    'eventOrigins',
                    'eventAdaptations'
                ],
                caseSensitive: false
            },
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    gearsAPI: [
        {
            func: 'getAllGearsData',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    slidersAPI: [
        {
            func: 'getSliderData',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        }
    ],
    accessManagerAPI: [
        {
            func: 'getManagementInfo',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getPlayerLoginsArray',
            args: {},
            behavior: 'roleIsOrganizerCheck'
        },
        {
            func: 'getWelcomeText',
            args: {},
            behavior: 'userIsLogged'
        },
        {
            func: 'getPlayersOptions',
            args: {},
            behavior: 'open'
        }
    ]
};

const testProfile = R.curry((permissionProxy, db, check, okExpected, profileName) => new Promise((resolve, reject) => {
    // console.log(profileName);
    const profile = profiles[profileName];
    let before;
    if (profile.before) {
        before = db[profile.before[0]](profile.before[1], { name: 'admin' });
        // console.log('before');
    } else {
        before = Promise.resolve();
    }

    before.then(() => {
        permissionProxy[check.func](check.args, profile.userData)
            .then((res) => {
                console.log(okExpected ? 'OK' : 'FAILED', 'accepted', check.func, profileName);
                if (profile.after) {
                    db[profile.after[0]](profile.after[1], { name: 'admin' }).then(resolve, reject);
                    // console.log('after');
                } else {
                    // eslint-disable-next-line no-lonely-if
                    if (okExpected) {
                        resolve();
                    } else {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject('testProfile expected OK');
                    }
                }
            })
            .catch((err) => {
                console.log(!okExpected ? 'OK' : 'FAILED', 'rejected', check.func, profileName);
                if (!okExpected) {
                    resolve();
                } else {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject('testProfile expected FAILED');
                }
            });
    });
    // const okExpected = R.contains(profileName, behavior.accept) ? true :
    //     (R.contains(profileName, behavior.reject) ? false : null);
    // if(okExpected === null) throw new Error(`Unexpected profile ${profileName}, ${behavior}`);
}));

exports.test = function (permissionProxy, db) {
    // db.getConsistencyCheckResult().then(checkResult => {
    //     console.log('initial consistency check')
    //     if(checkResult.length === 0) {
    //         console.log('no errors');
    //     } else {
    //         checkResult.errors.forEach(CommonUtils.consoleErr);
    //     }
    // });

    Promise.all(
        R.values(profiles).filter(R.has('beforeAll')).map(profile => db[profile.beforeAll[0]](profile.beforeAll[1], { name: 'admin' })
            // console.log('executing', profile);
        )
    ).then(() => {
        R.flatten(R.values(getChecks)).forEach((check) => {
            // console.log(check);
            const behavior = behaviors[check.behavior];
            if (behavior === undefined) throw new Error(`Behavior not found ${check.behavior} ${check.func}`);
            behavior.accept.forEach(testProfile(permissionProxy, db, check, true));
            behavior.reject.forEach(testProfile(permissionProxy, db, check, false));

            // R.keys(profiles).forEach(profileName => {
            // })
        });

        Promise.all(
            R.values(profiles).filter(R.has('afterAll')).map(profile => db[profile.afterAll[0]](profile.afterAll[1], { name: 'admin' }))
        ).catch((err) => {
            console.error(err);
            process.exit(1);
        });
    }).catch((err) => {
        console.error(err);
        process.exit(1);
    });
};
