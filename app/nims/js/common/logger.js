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

'use strict';

/* eslint-disable func-names,prefer-rest-params */

((exports) => {
    exports.offlineIgnoreList = ['getUser',
        'setPassword',
        'checkPassword',
        'login',
        'signUp',
        'hasPermission',
        '_getOwnerMap',
        'getPermissionsSummary',
        'subscribeOnPermissionsUpdate'];

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
            updateProfileField: {}  // text
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
        accessManagerAPI: {
            getManagementInfo: null,
            assignAdmin: {},
            assignEditor: {},
            removeEditor: {},
            changeAdaptationRightsMode: {},
            createOrganizer: { ignoreParams: true },
            changeOrganizerPassword: { ignoreParams: true },
            removeOrganizer: {},
            removePermission: {},
            assignPermission: {},
            publishPermissionsUpdate: null,
            getPlayerLoginsArray: null,
            createPlayer: { ignoreParams: true },
            createPlayerLogin: { ignoreParams: true },
            changePlayerPassword: { ignoreParams: true },
            removePlayerLogin: {},
            getWelcomeText: null,
            setWelcomeText: {},  // text
            getPlayersOptions: null,
            setPlayerOption: {},
            getPlayerProfileInfo: null,
            createCharacterByPlayer: {}
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
        accessManagerOverridesAPI: {},
        overridesAPI: {},
        permissionAPI: {
            hasPermission: null
        },
        permissionSummaryAPI: {
            _getOwnerMap: null,
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
    // environment - used to disable this.log function in thin client in server version.
    //      I agree it is strange.
    exports.attachLogCalls = (LocalDBMS, R, isServer) => {
        const apiInfoObj = R.mergeAll(R.values(exports.apiInfo));
        const filteredApi = R.filter(R.compose(R.not, R.isNil), apiInfoObj);

        Object.keys(LocalDBMS.prototype)
            .filter(R.prop(R.__, filteredApi))
            .forEach((funcName) => {
                const oldFun = LocalDBMS.prototype[funcName];
                LocalDBMS.prototype[funcName] = function () {
                    const arr = [];
                    for (let i = 0; i < arguments.length - 1; i++) {
                        arr.push(arguments[i]);
                    }

                    const { length } = arguments;
                    const callbackPos = length + (typeof arguments[length - 1] === 'function' ? -1 : -2);
                    const callback = arguments[callbackPos];


                    let accept = true;
                    if (filteredApi[funcName].filter) {
                        accept = filteredApi[funcName].filter(arr);
                    }

                    if (accept) {
                        let userName = 'user';
                        if (isServer && arguments[arguments.length - 1] !== undefined) {
                            userName = arguments[arguments.length - 1].name;
                        }

                        const beginTime = new Date().toString();
                        this.logNew({
                            userName, 
                            time: beginTime, 
                            funcName, 
                            rewrite: !!filteredApi[funcName].rewrite, 
                            params: filteredApi[funcName].ignoreParams ? [] : arr, 
                            status: JSON.stringify(['begin'])
                        });
                        // this.log(
                        //     userName, beginTime, funcName, !!filteredApi[funcName].rewrite,
                        //     filteredApi[funcName].ignoreParams ? [] : arr, JSON.stringify(['begin'])
                        // );


                        const callbackOverride = function () {
                            const endTime = new Date().toString();
                            const hasError = (arguments[0] !== null && arguments[0] !== undefined);
                            let text;
                            if (hasError) {
                                text = 'ERR: ';
                                if (arguments[0].messageId !== undefined) {
                                    text += `${arguments[0].messageId}, ${JSON.stringify(arguments[0].parameters)}`;
                                } else {
                                    text += arguments[0];
                                }
                            } else {
                                text = 'OK';
                            }
                            // this.log(
                            //     userName, endTime, funcName, !!filteredApi[funcName].rewrite,
                            //     filteredApi[funcName].ignoreParams ? [] : arr, JSON.stringify([beginTime,
                            //         text])
                            // );
                            this.logNew({
                                userName, 
                                time: endTime, 
                                funcName, 
                                rewrite: !!filteredApi[funcName].rewrite, 
                                params: filteredApi[funcName].ignoreParams ? [] : arr, 
                                status: JSON.stringify([beginTime, text])
                            });
                            callback(...arguments);
                        }.bind(this);
                        arguments[callbackPos] = callbackOverride;
                    }

                    return oldFun.apply(this, arguments);
                };
            });

        const arr = [];
        let timeout;

        Object.keys(LocalDBMS.prototype)
            .forEach((funcName) => {
                const oldFun = LocalDBMS.prototype[funcName];
                LocalDBMS.prototype[funcName] = function () {
                    try {
                        const exclude = ['_init'];
                        if(!funcName.endsWith('New') && !R.contains(funcName, exclude)){
                            console.error('Old API call', funcName, arguments);
                            // console.trace('Old API call', funcName);
                        }
                        return oldFun.apply(this, arguments);
                    } catch (err) {
                        const { length } = arguments;
                        const callbackPos = length + (typeof arguments[length - 1] === 'function' ? -1 : -2);
                        const callback = arguments[callbackPos];
                        console.error(funcName, err);
                        throw err;
                        // return callback(err);
                    }
                };
            });
    };
})(typeof exports === 'undefined' ? this.Logger = {} : exports);
