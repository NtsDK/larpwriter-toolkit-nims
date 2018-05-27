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
    
    
})(this.CallNotificator = {});
