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

((exports) => {
    const showNotification = true;
    const notificationTimeout = 2000;

    exports.onCallStart = () => {
        if (!showNotification) return;
        const notificationBox = clearEl(getEl('debugNotification'));
        removeClass(notificationBox, 'hidden');
        removeClass(notificationBox, 'operationOK');
        removeClass(notificationBox, 'operationFail');
        addEl(notificationBox, makeText(L10n.get('constant', 'saving')));
    };

    exports.onCallFinished = (err) => {
        if (!showNotification) return;
        if(err) {
            onCallFail();
        } else {
            onCallSuccess();
        }
    };

    function onCallSuccess(){
        const notificationBox = getEl('debugNotification');
        addClass(notificationBox, 'operationOK');
        addEl(clearEl(notificationBox), makeText(L10n.get('constant', 'saving-success')));
        setTimeout(() => {
            addClass(notificationBox, 'hidden');
        }, notificationTimeout);
    }

    function onCallFail(){
        const notificationBox = getEl('debugNotification');
        addClass(notificationBox, 'operationFail');
        addEl(clearEl(notificationBox), makeText(L10n.get('constant', 'saving-fail')));
        setTimeout(() => {
            addClass(notificationBox, 'hidden');
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

                if (CommonUtils.startsWith(prop, 'get') || CommonUtils.startsWith(prop, 'is')) {
                    return target[prop];
                } else {
                    return new Proxy(target[prop], {
                        apply: function(target, thisArg, argumentsList) {
                            CallNotificator.onCallStart();
                            const promise = target.apply(thisArg, argumentsList);
                            promise.then( () => {
                                CallNotificator.onCallFinished()
                            }, err => CallNotificator.onCallFinished(err));
                            return promise;
                        }
                    });
                }
            },
        });
    }



})(this.CallNotificator = {});
