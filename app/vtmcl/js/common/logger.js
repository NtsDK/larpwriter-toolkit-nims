/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

/* eslint-disable func-names */

((exports) => {
    // argument description
    // add function name to log it
    // ignoreParams - make true if you don't need params in log.
    //     Example - createMaster params include password.
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
            setMetaInfo: {}
        },
        consistencyCheckAPI: {
            getConsistencyCheckResult: null
        },
        logAPI: {
            log: null,
            getLog: null
        },
        charlistAPI: {
            getProfileItem: null,
            setProfileItem: {},
            getAttribute: null,
            setAttribute: {},
            getAbility: null,
            setAbility: {},
            getVirtue: null,
            setVirtue: {},
            getState: null,
            setState: {},
            getHealth: null,
            setHealth: {},
            setBackground: {},
            setDiscipline: {},

            getBackstory: null,
            setBackstory: {},
            getAdvantages: null,
            renameAdvantage: {},
            getNotes: null,
            setNotes: {},
        },
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
                LocalDBMS.prototype[funcName] = function (...args) {
                    let accept = true;
                    if (filteredApi[funcName].filter) {
                        accept = filteredApi[funcName].filter(args);
                    }

                    if (accept) {
                        let userName = 'user';
                        if (isServer) {
                            userName = args[args.length - 1].name;
                        }

                        this.log(
                            userName, funcName, !!filteredApi[funcName].rewrite,
                            filteredApi[funcName].ignoreParams ? [] : args
                        );
                    }

                    return oldFun.apply(this, args);
                };
            });
    };
})(typeof exports === 'undefined' ? this.Logger = {} : exports);
