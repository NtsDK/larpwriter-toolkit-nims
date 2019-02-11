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

//const R = require('ramda');
// const Constants = require('common/constants');
const CallNotificator = require('./callNotificator');

/* eslint-disable func-names,prefer-rest-params */


exports.makeDBMS = function () {
    const showNotification = true;
    const notificationTimeout = 2000;
    //const notificationTimeout = 10000;
    const url = '/api';

    function RemoteDBMS() {
    }

    RemoteDBMS._simpleGet = function (name, params) {
        return new Promise((resolve, reject) => {
            let paramStr = '';
            if (params) {
                paramStr = `params=${encodeURIComponent(JSON.stringify(params))}`;
            }

            const request = $.ajax({
                url: `${url}/${name}?${paramStr}`,
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

    RemoteDBMS._simplePut = function (name, data) {
        return new Promise((resolve, reject) => {
            const request = $.ajax({
                url: `${url}/${name}`,
                dataType: 'text',
                method: 'PUT',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data),
                timeout: Constants.httpTimeout
            });

            request.done((data2) => {
                resolve();
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

    const dbms = new RemoteDBMS();

    const proxy = new Proxy(dbms, {
        get(target, prop) {
            let func;
            if (R.startsWith('get', prop) || R.startsWith('is', prop)) {
                func = RemoteDBMS._simpleGet;
            } else {
                func = RemoteDBMS._simplePut;
            }
            return new Proxy(func, {
                apply(target2, thisArg, argumentsList) {
                    const arr = [];
                    for (let i = 0; i < argumentsList.length; i++) {
                        arr.push(argumentsList[i]);
                    }
                    return target2.apply(thisArg, [prop, arr]);
                }
            });
        },
    });

    // return proxy;
    return CallNotificator.applyCallNotificatorProxy(proxy);
};
