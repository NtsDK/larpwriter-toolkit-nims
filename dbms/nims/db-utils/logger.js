/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/*global
 // Utils
 */


//const R = require('ramda');

/* eslint-disable func-names,prefer-rest-params */

// ((exports) => {
exports.offlineIgnoreList = ['getUser',
    'setPassword',
    'checkPassword',
    'login',
    'signUp',
    // 'hasPermission',
    '_getOwnerMap',
    'getPermissionsSummary',
    'subscribeOnPermissionsUpdate',

    'createOrganizer',
    'changeOrganizerPassword',
    'removePermission',
    'assignPermission',
    'publishPermissionsUpdate',
    'createPlayer',
    'createPlayerLogin',
    'changePlayerPassword',
    'getPlayerProfileInfo',
    'createCharacterByPlayer',

    'getManagementInfo',
    'assignAdmin',
    'assignEditor',
    'removeEditor',
    'changeAdaptationRightsMode',
    'removeOrganizer',
    'getPlayerLoginsArray',
    'removePlayerLogin',
    'getWelcomeText',
    'setWelcomeText',
    'getPlayersOptions',
    'setPlayerOption'
];

// argument description
// add function name to log it
// ignoreParams - make true if you don't need params in log.
//     Example - createOrganizer params include password.
// filter - add this function to filter out unnecessary calls.
//     Example - we need all meta info calls except description.
// rewrite - make true if you don't want to flood log with some repeated call.
//     For example auto call of getDatabase will flood everything.
exports.apiInfo = {
    baseAPI: {
        _init: null,
        getDatabase: { rewrite: true },
        setDatabase: { ignoreParams: true },
        getMetaInfo: null,
        setMetaInfoString: {},
        setMetaInfoDate: {}
    },
    consistencyCheckAPI: {
        getConsistencyCheckResult: null
    },
    statisticsAPI: {
        getStatistics: null
    },
    profilesAPI: {
        getProfileNamesArray: null,
        getProfile: null,
        getAllProfiles: null,
        createProfile: {},
        renameProfile: {},
        removeProfile: {},
        updateProfileField: {} // text
    },
    profileBindingAPI: {
        getProfileBindings: null,
        getExtendedProfileBindings: null,
        getProfileBinding: null,
        createBinding: {},
        removeBinding: {}
    },
    profileViewAPI: {
        getRoleGridInfo: null,
    },
    groupsAPI: {
        getGroupNamesArray: null,
        getGroup: null,
        getCharacterGroupTexts: null,
        getAllCharacterGroupTexts: null,
        createGroup: {},
        renameGroup: {},
        removeGroup: {},
        saveFilterToGroup: {},
        updateGroupField: {}, // text
        doExportGroup: {},
        getProfileFilterInfo: null,
        getGroupCharacterSets: null
    },
    groupSchemaAPI: {
        getGroupSchemas: null
    },
    relationsAPI: {
        getCharacterRelation: null,
        getRelations: null,
        createCharacterRelation: {},
        removeCharacterRelation: {},
        setCharacterRelationText: {}, // text
        setRelationReadyStatus: {},
        setRelationEssenceStatus: {},
        setOriginRelationText: {}, // text
        getRelationsSummary: null,
    },
    briefingExportAPI: {
        getBriefingData: {}
    },
    profileConfigurerAPI: {
        getProfileStructure: null,
        createProfileItem: {},
        moveProfileItem: {},
        removeProfileItem: {},
        changeProfileItemType: {},
        changeProfileItemPlayerAccess: {},
        renameProfileItem: {},
        doExportProfileItemChange: {},
        showInRoleGridProfileItemChange: {},
        updateDefaultValue: {},
        renameEnumValue: {}
    },
    entityAPI: {
        getEntityNamesArray: null
    },
    storyBaseAPI: {
        getStoryNamesArray: null,
        getAllStories: null,
        getWriterStory: null,
        setWriterStory: {}, // text
        createStory: {},
        renameStory: {},
        removeStory: {}
    },
    storyEventsAPI: {
        getStoryEvents: null,
        createEvent: {},
        moveEvent: {},
        cloneEvent: {},
        mergeEvents: {},
        removeEvent: {},
        setEventOriginProperty: {} // text
    },
    storyCharactersAPI: {
        getStoryCharacterNamesArray: null,
        getStoryCharacters: null,
        addStoryCharacter: {},
        switchStoryCharacters: {},
        removeStoryCharacter: {},
        updateCharacterInventory: {}, // text+-
        onChangeCharacterActivity: {},
        addCharacterToEvent: {},
        removeCharacterFromEvent: {}
    },
    storyViewAPI: {
        getAllInventoryLists: null,
        getCharacterEventGroupsByStory: null,
        getCharacterEventsByTime: null,
        getEventsTimeInfo: null,
        getCharactersSummary: null,
        getCharacterReport: null
    },
    storyAdaptationsAPI: {
        getFilteredStoryNames: null,
        getStory: null,
        setEventAdaptationProperty: {} // text
    },
    organizerManagementAPI: {
        getManagementInfo: null,
        assignAdmin: {},
        assignEditor: {},
        removeEditor: {},
        changeAdaptationRightsMode: {},
        createOrganizer: { ignoreParams: true },
        changeOrganizerPassword: { ignoreParams: true },
        removeOrganizer: {},
    },
    playerManagementAPI: {
        getPlayerLoginsArray: null,
        createPlayer: { ignoreParams: true },
        createPlayerLogin: { ignoreParams: true },
        changePlayerPassword: { ignoreParams: true },
        removePlayerLogin: {},
        getWelcomeText: null,
        setWelcomeText: {}, // text
        getPlayersOptions: null,
        setPlayerOption: {},
        getPlayerProfileInfo: null,
        createCharacterByPlayer: {}
    },
    entityManagementAPI: {
        removePermission: {},
        assignPermission: {},
    },
    textSearchAPI: {
        getTexts: null
    },
    userAPI: {
        getUser: null,
        setPassword: null,
        checkPassword: null,
        login: null,
        signUp: null
    },
    // permissionAPI: {
    //     hasPermission: null
    // },
    permissionSummaryAPI: {
        _getOwnerMap: null,
        publishPermissionsUpdate: null,
        getPermissionsSummary: null, // special case
        subscribeOnPermissionsUpdate: null // special case
    },
    logAPI: {
        log: null,
        getLog: null
    },
    gearsAPI: {
        getAllGearsData: null,
        setGearsData: null,
        setGearsPhysicsEnabled: {},
        setGearsShowNotesEnabled: {}
    },
    slidersAPI: {
        getSliderData: null,
        updateSliderNaming: {},
        updateSliderValue: {},
        createSlider: {},
        removeSlider: {},
        moveSlider: {},
    }
};

// isServer - used in server mode. If false then user in logs will be named "user".
exports.applyLoggerProxy = function (dbms, isServer) {
    const apiInfoObj = R.mergeAll(R.values(exports.apiInfo));
    const filteredApi = R.filter(R.compose(R.not, R.isNil), apiInfoObj);

    return new Proxy(dbms, {
        get(target, prop) {
            function isFunction(obj) {
                return typeof obj === 'function';
            }

            if (target[prop] === undefined || !isFunction(target[prop])) {
                return target[prop];
            }

            const funcName = prop;
            return new Proxy(target[funcName], {
                apply(func, thisArg, arr) {
                    if (filteredApi[funcName] === undefined) {
                        return func.apply(thisArg, arr);
                    }

                    let accept = true;
                    if (filteredApi[funcName].filter) {
                        accept = filteredApi[funcName].filter(arr);
                    }

                    function getArgs(arr2) {
                        return isServer ? R.init(arr2) : arr2;
                    }

                    if (!accept) {
                        // return oldFun.apply(this, arguments);
                        return func.apply(thisArg, arr);
                    }
                    let userName = 'user';
                    if (isServer && arr[arr.length - 1] !== undefined) {
                        userName = arr[arr.length - 1].name;
                    }

                    const beginTime = new Date().toString();
                    const logInfo = {
                        userName,
                        time: beginTime,
                        funcName,
                        rewrite: !!filteredApi[funcName].rewrite,
                        params: filteredApi[funcName].ignoreParams ? [] : getArgs(arr),
                        status: JSON.stringify(['begin'])
                    };

                    thisArg.log(logInfo);

                    return new Promise((resolve, reject) => {
                        func.apply(thisArg, arr).then((result) => {
                            const endTime = new Date().toString();
                            const text = 'OK';
                            logInfo.time = endTime;
                            logInfo.status = JSON.stringify([beginTime, text]);
                            thisArg.log(logInfo);

                            resolve(result);
                        }).catch((err) => {
                            const endTime = new Date().toString();
                            let text = 'ERR: ';
                            if (err.messageId !== undefined) {
                                text += `${err.messageId}, ${JSON.stringify(err.parameters)}`;
                            } else {
                                text += err;
                            }
                            logInfo.time = endTime;
                            logInfo.status = JSON.stringify([beginTime, text]);
                            thisArg.log(logInfo);

                            reject(err);
                        });
                    });
                }
            });
        },
    });
};
// })(typeof exports === 'undefined' ? this.Logger = {} : exports);
