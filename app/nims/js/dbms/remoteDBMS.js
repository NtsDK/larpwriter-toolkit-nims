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

    RemoteDBMS._simpleGet = function (name, params, callback) {
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
            callback(null, JSON.parse(data));
        });

        request.fail((errorInfo, textStatus, errorThrown) => {
            try {
                callback(JSON.parse(errorInfo.responseText));
            } catch (err) {
                callback(errorInfo.responseText || textStatus || 'error');
            }
        });
    };

    RemoteDBMS._simplePut = function (name, data, callback) {
        const request = $.ajax({
            url: url + name,
            dataType: 'text',
            method: 'PUT',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data),
            timeout: Constants.httpTimeout
        });

        let notificationBox;

        if (showNotification) {
            notificationBox = clearEl(getEl('debugNotification'));
            removeClass(notificationBox, 'hidden');
            removeClass(notificationBox, 'operationOK');
            removeClass(notificationBox, 'operationFail');
//            addEl(notificationBox, makeText(`${name} ${JSON.stringify(data)}`));
            addEl(notificationBox, makeText(L10n.get('constant', 'saving')));
        }

        request.done((data2) => {
            if (showNotification) {
                addClass(notificationBox, 'operationOK');
                addEl(clearEl(notificationBox), makeText(L10n.get('constant', 'saving-success')));
                setTimeout(() => {
                    addClass(notificationBox, 'hidden');
                }, notificationTimeout);
            }
            if (callback) callback();
        });

        request.fail((errorInfo, textStatus, errorThrown) => {
            if (showNotification) {
                addClass(notificationBox, 'operationFail');
                addEl(clearEl(notificationBox), makeText(L10n.get('constant', 'saving-fail')));
                setTimeout(() => {
                    addClass(notificationBox, 'hidden');
                }, notificationTimeout);
            }
            try {
                callback(JSON.parse(errorInfo.responseText));
            } catch (err) {
                callback(errorInfo.responseText || textStatus || 'error');
            }
        });
    };


    Object.keys(LocalDBMS.prototype).forEach((name) => {
        RemoteDBMS.prototype[name] = function () {
            const arr = [];
            for (let i = 0; i < arguments.length - 1; i++) {
                arr.push(arguments[i]);
            }
            //            if(CommonUtils.startsWith(name, "_")){
            //                // do nothing for inner functions
            //            } else
            if (CommonUtils.startsWith(name, 'get') || CommonUtils.startsWith(name, 'is')) {
                RemoteDBMS._simpleGet(name, arr, arguments[arguments.length - 1]);
            } else {
                RemoteDBMS._simplePut(name, arr, arguments[arguments.length - 1]);
            }
        };
    });


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
