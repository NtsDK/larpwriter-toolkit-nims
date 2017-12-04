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
 Utils, DBMS
 */

'use strict';

((exports) => {
    const state = {};

    const root = '.player-management-tab ';

    exports.init = () => {
        listen(queryEl(`${root}.create-user-button`), 'click', createUser);
        listen(queryEl(`${root}.create-login-button`), 'click', createLogin);
        listen(queryEl(`${root}.change-password-button`), 'click', changePassword);
        listen(queryEl(`${root}.remove-user-button`), 'click', removeUser);
        listen(queryEl(`${root}.welcome-text-area`), 'change', setWelcomeText);
        queryElEls(queryEl(root), '.playerOptions').map(listen(R.__, 'change', setPlayerOption));

        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        PermissionInformer.getEntityNamesArray('player', false, (err, playerNames) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getPlayerLoginsArray((err2, playerLogins) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getWelcomeText((err3, text) => {
                    if (err3) { Utils.handleError(err3); return; }
                    DBMS.getPlayersOptions((err4, playersOptions) => {
                        if (err4) { Utils.handleError(err4); return; }
                        // eslint-disable-next-line prefer-destructuring
                        R.toPairs(playersOptions).map(pair => (getEl(pair[0]).checked = pair[1]));

                        queryEl(`${root}.welcome-text-area`).value = text;
                        const playerHasLogin = R.compose(R.contains(R.__, playerLogins), R.prop('value'));
                        const hasLoginObj = R.groupBy(playerHasLogin, playerNames);
                        fillSelector(clearEl(queryEl(`${root}.create-login-name-select`)), (hasLoginObj.false || [])
                            .sort(Utils.charOrdAObject).map(remapProps4Select));
                        fillSelector(clearEl(queryEl(`${root}.change-password-user-select`)), (hasLoginObj.true || [])
                            .sort(Utils.charOrdAObject).map(remapProps4Select));
                        fillSelector(clearEl(queryEl(`${root}.remove-user-select`)), (hasLoginObj.true || [])
                            .sort(Utils.charOrdAObject).map(remapProps4Select));
                    });
                });
            });
        });
    };

    function createUser() {
        const userNameInput = queryEl(`${root}.create-user-name-input`);
        const passwordInput = queryEl(`${root}.create-user-password-input`);
        DBMS.createPlayer(userNameInput.value.trim(), passwordInput.value, Utils.processError(() => {
            userNameInput.value = '';
            passwordInput.value = '';
            exports.refresh();
        }));
    }

    function createLogin() {
        const userNameSelect = queryEl(`${root}.create-login-name-select`);
        const passwordInput = queryEl(`${root}.create-login-password-input`);
        DBMS.createPlayerLogin(userNameSelect.value, passwordInput.value, Utils.processError(() => {
            passwordInput.value = '';
            exports.refresh();
        }));
    }

    function changePassword() {
        const userNameSelect = queryEl(`${root}.change-password-user-select`);
        const passwordInput = queryEl(`${root}.change-password-password-input`);
        DBMS.changePlayerPassword(userNameSelect.value, passwordInput.value, Utils.processError(() => {
            passwordInput.value = '';
            exports.refresh();
        }));
    }

    function removeUser() {
        const userNameSelect = queryEl(`${root}.remove-user-select`);
        DBMS.removePlayerLogin(userNameSelect.value, Utils.processError(exports.refresh));
    }

    function setWelcomeText(event) {
        DBMS.setWelcomeText(event.target.value, Utils.processError());
    }

    function setPlayerOption(event) {
        DBMS.setPlayerOption(event.target.value, event.target.checked, Utils.processError());
    }
})(this.PlayerManagement = {});
