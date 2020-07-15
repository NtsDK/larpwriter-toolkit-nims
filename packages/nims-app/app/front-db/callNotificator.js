// import { U, L10n } from 'nims-app-core';
const { L10n, U } = require('nims-app-core');

// ((exports) => {
const showNotification = true;
const notificationTimeout = 2000;

function onCallStart() {
    if (!showNotification) return;
    const notificationBox = U.clearEl(U.queryEl('#debugNotification'));
    U.removeClass(notificationBox, 'hidden');
    U.removeClass(notificationBox, 'operationOK');
    U.removeClass(notificationBox, 'operationFail');
    U.addEl(notificationBox, U.makeText(L10n.get('constant', 'saving')));
}

function onCallFinished(err) {
    if (!showNotification) return;
    if (err) {
        onCallFail();
    } else {
        onCallSuccess();
    }
}

function onCallSuccess() {
    const notificationBox = U.queryEl('#debugNotification');
    U.addClass(notificationBox, 'operationOK');
    U.addEl(U.clearEl(notificationBox), U.makeText(L10n.get('constant', 'saving-success')));
    setTimeout(() => {
        U.addClass(notificationBox, 'hidden');
    }, notificationTimeout);
}

function onCallFail() {
    const notificationBox = U.queryEl('#debugNotification');
    U.addClass(notificationBox, 'operationFail');
    U.addEl(U.clearEl(notificationBox), U.makeText(L10n.get('constant', 'saving-fail')));
    setTimeout(() => {
        U.addClass(notificationBox, 'hidden');
    }, notificationTimeout);
}

module.exports = function (dbms) {
    return new Proxy(dbms, {
        get(target, prop) {
            function isFunction(obj) {
                return typeof obj === 'function';
            }

            if (target[prop] === undefined || !isFunction(target[prop])) {
                return target[prop];
            }

            if (R.startsWith('get', prop) || R.startsWith('is', prop)) {
                return target[prop];
            }
            return new Proxy(target[prop], {
                apply(target2, thisArg, argumentsList) {
                    onCallStart();
                    const promise = target2.apply(thisArg, argumentsList);
                    promise.then(() => {
                        onCallFinished();
                    }, err => onCallFinished(err));
                    return promise;
                }
            });
        },
    });
};


// })(window.CallNotificator = {});
