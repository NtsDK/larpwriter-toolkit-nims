//const R = require('ramda');
// const Constants = require('common/constants');
const CallNotificator = require('./callNotificator');
// const CallNotificator = require('dbms-core/callNotificator');

/* eslint-disable func-names,prefer-rest-params */

module.exports = function () {
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
    return CallNotificator(proxy);
};
