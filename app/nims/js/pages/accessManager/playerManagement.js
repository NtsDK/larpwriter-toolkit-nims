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
        const createUserDialog = UI.createModalDialog(root, createUser, {
            bodySelector: 'create-master-body',
            dialogTitle: 'admins-creating-player',
            actionButtonTitle: 'common-create',
        });
        listen(qe(`${root}.create.player`), 'click', () => createUserDialog.showDlg());
        
        const createPlayerAccountDialog = UI.createModalDialog(root, createUserAccount, {
            bodySelector: 'create-player-account-body',
            dialogTitle: 'admins-creating-player-account',
            actionButtonTitle: 'common-create',
        });
        listen(qe(`${root}.create.player-account`), 'click', () => createPlayerAccountDialog.showDlg());
        
        const changePasswordDialog = UI.createModalDialog(root, changePassword, {
            bodySelector: 'modal-prompt-body',
            dialogTitle: 'admins-enter-new-password',
            actionButtonTitle: 'common-replace',
        });
        listen(qe(`${root}.user.change-password`), 'click', () => {
            qee(changePasswordDialog, '.entity-input').value = '';
            changePasswordDialog.showDlg();
        });
        
        
//        listen(queryEl(`${root}.create-user-button`), 'click', createUser);
//        listen(queryEl(`${root}.create-login-button`), 'click', createLogin);
//        listen(queryEl(`${root}.change-password-button`), 'click', changePassword);
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
                        PermissionInformer.isAdmin((err5, isAdmin) => {
                            if (err5) { Utils.handleError(err5); return; }
                            // eslint-disable-next-line prefer-destructuring
                            R.toPairs(playersOptions).map(pair => (getEl(pair[0]).checked = pair[1]));
    
                            queryEl(`${root}.welcome-text-area`).value = text;
                            const playerHasLogin = R.compose(R.contains(R.__, playerLogins), R.prop('value'));
                            const hasLoginObj = R.groupBy(playerHasLogin, playerNames);
                            
                            const noAccounts = (hasLoginObj.false || []);
                            noAccounts.sort(Utils.charOrdAObject);
                            $(clearEl(queryEl(`${root}.create-login-name-select`))).select2(getSelect2Data(noAccounts));
    //                        fillSelector(clearEl(queryEl(`${root}.create-login-name-select`)), (hasLoginObj.false || [])
    //                            .sort(Utils.charOrdAObject).map(remapProps4Select));
                            const hasAccounts = (hasLoginObj.true || []);
                            hasAccounts.sort(Utils.charOrdAObject);
                            $(clearEl(queryEl(`${root}.change-password-user-select`))).select2(getSelect2Data(hasAccounts));
                            Utils.enable(exports.content, 'adminOnly', isAdmin);
    //                        fillSelector(clearEl(queryEl(`${root}.change-password-user-select`)), (hasLoginObj.true || [])
    //                            .sort(Utils.charOrdAObject).map(remapProps4Select));
    //                        fillSelector(clearEl(queryEl(`${root}.remove-user-select`)), (hasLoginObj.true || [])
//                            .sort(Utils.charOrdAObject).map(remapProps4Select));
                        });
                    });
                });
            });
        });
    };

    function createUser(dialog) {
        return () => {
            const userNameInput = qee(dialog,`.create-user-name-input`);
            const userPasswordInput = qee(dialog,`.create-user-password-input`);
            DBMS.createPlayer(userNameInput.value.trim(), userPasswordInput.value, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    PermissionInformer.refresh((err2) => {
                        if (err2) { Utils.handleError(err2); return; }
                        userNameInput.value = '';
                        userPasswordInput.value = '';
                        dialog.hideDlg();
                        exports.refresh();
                    });
                }
            });
        };
    }
    
    function createUserAccount(dialog) {
        return () => {
            const userNameSelect = qee(dialog,`.create-login-name-select`);
            const passwordInput = qee(dialog,`.create-login-password-input`);
            DBMS.createPlayerLogin(userNameSelect.value, passwordInput.value, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    passwordInput.value = '';
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        };
    }

    function createLogin() {
        const userNameSelect = queryEl(`${root}.create-login-name-select`);
        const passwordInput = queryEl(`${root}.create-login-password-input`);
        DBMS.createPlayerLogin(userNameSelect.value, passwordInput.value, Utils.processError(() => {
            passwordInput.value = '';
            exports.refresh();
        }));
    }

//    function changePassword() {
//        const userNameSelect = queryEl(`${root}.change-password-user-select`);
//        const passwordInput = queryEl(`${root}.change-password-password-input`);
//        DBMS.changePlayerPassword(userNameSelect.value, passwordInput.value, Utils.processError(() => {
//            passwordInput.value = '';
//            exports.refresh();
//        }));
//    }
    
    function changePassword(dialog) {
        return () => {
            const toInput = qee(dialog, '.entity-input');
            const newPassword = toInput.value;
            const userName = queryEl(`${root}.change-password-user-select`).value.trim();
            DBMS.changePlayerPassword(userName, newPassword, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        };
    }

    function removeUser() {
        const name = queryEl(`${root}.change-password-user-select`).value.trim();
        Utils.confirm(strFormat(getL10n('admins-confirm-user-account-remove'), [name]), () => {
            DBMS.removePlayerLogin(name, Utils.processError(exports.refresh));
        });
//        const userNameSelect = queryEl(`${root}.change-password-user-select`);
//        DBMS.removePlayerLogin(userNameSelect.value, Utils.processError(exports.refresh));
    }

    function setWelcomeText(event) {
        DBMS.setWelcomeText(event.target.value, Utils.processError());
    }

    function setPlayerOption(event) {
        DBMS.setPlayerOption(event.target.value, event.target.checked, Utils.processError());
    }
})(this.PlayerManagement = {});
