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
 Utils, Database
 */

'use strict';

/* eslint-disable func-names,prefer-rest-params */


function makeRemoteDBMS(LocalDBMS) {
    const showNotification = true;
    const notificationTimeout = 2000;
    //const notificationTimeout = 10000;
    const url = '/';

    function RemoteDBMS() {
        this.clearSettings();
    }

    RemoteDBMS._simpleGet = function (name, params) {
        return new Promise((resolve, reject) => {
            let paramStr = '';
            if (params) {
                paramStr = `?params=${encodeURIComponent(JSON.stringify(params))}`;
            }

            const request = $.ajax({
                url: url + name + paramStr,
                dataType: 'text',
                method: 'GET',
                contentType: 'application/json;charset=utf-8',
                cache: false,
                timeout: Constants.httpTimeout,
            });

            request.done((data) => {
                resolve(JSON.parse(data));
            });

            request.fail((errorInfo, textStatus, errorThrown) => {
                try {
                    reject(JSON.parse(errorInfo.responseText));
                } catch (err) {
                    reject(errorInfo.responseText || textStatus || 'error');
                }
            });
        });
    };

    // RemoteDBMS._simpleGet = function (name, params, callback) {
    //     let paramStr = '';
    //     if (params) {
    //         paramStr = `?params=${encodeURIComponent(JSON.stringify(params))}`;
    //     }

    //     const request = $.ajax({
    //         url: url + name + paramStr,
    //         dataType: 'text',
    //         method: 'GET',
    //         contentType: 'application/json;charset=utf-8',
    //         cache: false,
    //         timeout: Constants.httpTimeout,
    //     });

    //     request.done((data) => {
    //         callback(null, JSON.parse(data));
    //     });

    //     request.fail((errorInfo, textStatus, errorThrown) => {
    //         try {
    //             callback(JSON.parse(errorInfo.responseText));
    //         } catch (err) {
    //             callback(errorInfo.responseText || textStatus || 'error');
    //         }
    //     });
    // };

    RemoteDBMS._simplePut = function (name, data) {
        return new Promise((resolve, reject) => {
            const request = $.ajax({
                url: url + name,
                dataType: 'text',
                method: 'PUT',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data),
                timeout: Constants.httpTimeout
            });

            CallNotificator.onCallStart();

            request.done((data2) => {
                CallNotificator.onCallFinished();
                resolve();
            });

            request.fail((errorInfo, textStatus, errorThrown) => {
                CallNotificator.onCallFinished(errorInfo);
                try {
                    reject(JSON.parse(errorInfo.responseText));
                } catch (err) {
                    reject(errorInfo.responseText || textStatus || 'error');
                }
            });
        });
    };
    // RemoteDBMS._simplePut = function (name, data, callback) {
    //     const request = $.ajax({
    //         url: url + name,
    //         dataType: 'text',
    //         method: 'PUT',
    //         contentType: 'application/json;charset=utf-8',
    //         data: JSON.stringify(data),
    //         timeout: Constants.httpTimeout
    //     });

    //     CallNotificator.onCallStart();

    //     request.done((data2) => {
    //         CallNotificator.onCallFinished();
    //         if (callback) callback();
    //     });

    //     request.fail((errorInfo, textStatus, errorThrown) => {
    //         CallNotificator.onCallFinished(errorInfo);
    //         try {
    //             callback(JSON.parse(errorInfo.responseText));
    //         } catch (err) {
    //             callback(errorInfo.responseText || textStatus || 'error');
    //         }
    //     });
    // };


    Object.keys(LocalDBMS.prototype).forEach((name) => {
        RemoteDBMS.prototype[name] = function () {
            const arr = [];
            for (let i = 0; i < arguments.length; i++) {
                arr.push(arguments[i]);
            }
            //            if(CommonUtils.startsWith(name, "_")){
            //                // do nothing for inner functions
            //            } else
            if (CommonUtils.startsWith(name, 'get') || CommonUtils.startsWith(name, 'is')) {
                return RemoteDBMS._simpleGet(name, arr);
            } else {
                return RemoteDBMS._simplePut(name, arr);
            }
        };
    });
    // Object.keys(LocalDBMS.prototype).forEach((name) => {
    //     RemoteDBMS.prototype[name] = function () {
    //         const arr = [];
    //         for (let i = 0; i < arguments.length - 1; i++) {
    //             arr.push(arguments[i]);
    //         }
    //         //            if(CommonUtils.startsWith(name, "_")){
    //         //                // do nothing for inner functions
    //         //            } else
    //         if (CommonUtils.startsWith(name, 'get') || CommonUtils.startsWith(name, 'is')) {
    //             RemoteDBMS._simpleGet(name, arr, arguments[arguments.length - 1]);
    //         } else {
    //             RemoteDBMS._simplePut(name, arr, arguments[arguments.length - 1]);
    //         }
    //     };
    // });

    // promisification
    // Object.keys(LocalDBMS.prototype).forEach((name) => {
    //     RemoteDBMS.prototype[name + 'Pm'] = function () {
    //         const arr = [];
    //         for (let i = 0; i < arguments.length; i++) {
    //             arr.push(arguments[i]);
    //         }
    //         //            if(CommonUtils.startsWith(name, "_")){
    //         //                // do nothing for inner functions
    //         //            } else
    //         return new Promise(function(resolve, reject) {
    //             if (CommonUtils.startsWith(name, 'get') || CommonUtils.startsWith(name, 'is')) {
    //                 RemoteDBMS._simpleGet(name, arr, function(err, value) {
    //                     if(err) {reject(err); return;}
    //                     resolve(value);
    //                 });
    //             } else {
    //                 RemoteDBMS._simplePut(name, arr, function(err, value) {
    //                     if(err) {reject(err); return;}
    //                     resolve();
    //                 });
    //             }
    //         }.bind(this));
    //     };
    // });

    RemoteDBMS.prototype.clearSettings = function () {
        this.Settings = {
            BriefingPreview: {},
            Stories: {},
            ProfileEditor: {}
        };
    };

    RemoteDBMS.prototype.getSettings = function () {
        return this.Settings;
    };
    return RemoteDBMS;
}
