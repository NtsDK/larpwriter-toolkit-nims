/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

// ((exports) => {
    const showNotification = true;
    const notificationTimeout = 2000;

    function onCallStart(){
        if (!showNotification) return;
        const notificationBox = U.clearEl(U.queryEl('#debugNotification'));
        U.removeClass(notificationBox, 'hidden');
        U.removeClass(notificationBox, 'operationOK');
        U.removeClass(notificationBox, 'operationFail');
        U.addEl(notificationBox, U.makeText(L10n.get('constant', 'saving')));
    };

    function onCallFinished(err){
        if (!showNotification) return;
        if(err) {
            onCallFail();
        } else {
            onCallSuccess();
        }
    };

    function onCallSuccess(){
        const notificationBox = U.queryEl('#debugNotification');
        U.addClass(notificationBox, 'operationOK');
        U.addEl(U.clearEl(notificationBox), U.makeText(L10n.get('constant', 'saving-success')));
        setTimeout(() => {
            U.addClass(notificationBox, 'hidden');
        }, notificationTimeout);
    }

    function onCallFail(){
        const notificationBox = U.queryEl('#debugNotification');
        U.addClass(notificationBox, 'operationFail');
        U.addEl(U.clearEl(notificationBox), U.makeText(L10n.get('constant', 'saving-fail')));
        setTimeout(() => {
            U.addClass(notificationBox, 'hidden');
        }, notificationTimeout);
    }

    exports.applyCallNotificatorProxy = function(dbms) {
        return new Proxy(dbms, {
            get(target, prop) {
                function isFunction(obj) {
                    return typeof obj === 'function';
                }

                if(target[prop] === undefined || !isFunction(target[prop])) {
                    return target[prop];
                }

                if (R.startsWith('get', prop) || R.startsWith('is', prop)) {
                    return target[prop];
                } else {
                    return new Proxy(target[prop], {
                        apply: function(target, thisArg, argumentsList) {
                            onCallStart();
                            const promise = target.apply(thisArg, argumentsList);
                            promise.then( () => {
                                onCallFinished()
                            }, err => onCallFinished(err));
                            return promise;
                        }
                    });
                }
            },
        });
    }



// })(window.CallNotificator = {});
