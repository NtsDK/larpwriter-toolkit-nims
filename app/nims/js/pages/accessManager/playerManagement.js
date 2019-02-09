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

const R = require('ramda');
const PermissionInformer = require('permissionInformer');

// ((exports) => {
const state = {};

const root = '.player-management-tab ';

exports.init = () => {
    const createUserDialog = UI.createModalDialog(root, createUser, {
        bodySelector: 'create-organizer-body',
        dialogTitle: 'admins-creating-player',
        actionButtonTitle: 'common-create',
    });
    U.listen(U.qe(`${root}.create.player`), 'click', () => createUserDialog.showDlg());

    const createPlayerAccountDialog = UI.createModalDialog(root, createUserAccount, {
        bodySelector: 'create-player-account-body',
        dialogTitle: 'admins-creating-player-account',
        actionButtonTitle: 'common-create',
    });
    U.listen(U.qe(`${root}.create.player-account`), 'click', () => createPlayerAccountDialog.showDlg());

    const changePasswordDialog = UI.createModalDialog(root, changePassword, {
        bodySelector: 'modal-prompt-body',
        dialogTitle: 'admins-enter-new-password',
        actionButtonTitle: 'common-replace',
    });
    U.listen(U.qe(`${root}.user.change-password`), 'click', () => {
        U.qee(changePasswordDialog, '.entity-input').value = '';
        changePasswordDialog.showDlg();
    });


    //        U.listen(U.queryEl(`${root}.create-user-button`), 'click', createUser);
    //        U.listen(U.queryEl(`${root}.create-login-button`), 'click', createLogin);
    //        U.listen(U.queryEl(`${root}.change-password-button`), 'click', changePassword);
    U.listen(U.queryEl(`${root}.remove-user-button`), 'click', removeUser);
    U.listen(U.queryEl(`${root}.welcome-text-area`), 'change', setWelcomeText);
    U.queryElEls(U.queryEl(root), '.playerOptions').map(U.listen(R.__, 'change', setPlayerOption));

    $(`${root}.change-password-user-select`).select2().on('change', (event) => {
        const player = event.target.value;
        const yourPlayers = state.playerNames.filter(R.prop('isOwner')).map(R.prop('value'));
        const isPlayerEditable = R.contains(player, yourPlayers);
        UI.enableEl(U.qe(`${root}.user.change-password`), isPlayerEditable);
        UI.enableEl(U.qe(`${root}.remove-user-button`), isPlayerEditable);
    });


    exports.content = U.queryEl(root);
};

exports.refresh = () => {
    Promise.all([
        PermissionInformer.getEntityNamesArray({ type: 'player', editableOnly: false }),
        DBMS.getPlayerLoginsArray(),
        DBMS.getWelcomeText(),
        DBMS.getPlayersOptions(),
        PermissionInformer.isAdmin()
    ]).then((results) => {
        const [playerNames, playerLogins, text, playersOptions, isAdmin] = results;
        // eslint-disable-next-line prefer-destructuring
        R.toPairs(playersOptions).map(pair => (U.queryEl(`#${pair[0]}`).checked = pair[1]));

        U.queryEl(`${root}.welcome-text-area`).value = text;
        const playerHasLogin = R.compose(R.contains(R.__, playerLogins), R.prop('value'));
        const hasLoginObj = R.groupBy(playerHasLogin, playerNames);

        state.playerNames = playerNames;

        const noAccounts = (hasLoginObj.false || []);
        noAccounts.sort(CU.charOrdAObject);
        $(U.clearEl(U.queryEl(`${root}.create-login-name-select`))).select2(UI.getSelect2Data(noAccounts));
        //                        U.fillSelector(U.clearEl(U.queryEl(`${root}.create-login-name-select`)), (hasLoginObj.false || [])
        //                            .sort(CU.charOrdAObject).map(UI.remapProps4Select));
        const hasAccounts = (hasLoginObj.true || []);
        //                            hasAccounts.sort(CU.charOrdAObject);
        $(U.clearEl(U.queryEl(`${root}.change-password-user-select`))).select2(UI.getSelect2Data(hasAccounts));

        UI.enable(exports.content, 'adminOnly', isAdmin);

        UI.enableEl(U.qe(`${root}.change-password-user-select`), hasAccounts.length > 0);
        UI.enableEl(U.qe(`${root}.user.change-password`), hasAccounts.length > 0);
        UI.enableEl(U.qe(`${root}.remove-user-button`), hasAccounts.length > 0);
    //                        U.fillSelector(U.clearEl(U.queryEl(`${root}.change-password-user-select`)), (hasLoginObj.true || [])
    //                            .sort(CU.charOrdAObject).map(UI.remapProps4Select);
    //                        U.fillSelector(U.clearEl(U.queryEl(`${root}.remove-user-select`)), (hasLoginObj.true || [])
    //                            .sort(CU.charOrdAObject).map(UI.remapProps4Select));
    }).catch(UI.handleError);
};

function createUser(dialog) {
    return () => {
        const userNameInput = U.qee(dialog, '.create-user-name-input');
        const userPasswordInput = U.qee(dialog, '.create-user-password-input');
        DBMS.createPlayer({ userName: userNameInput.value.trim(), password: userPasswordInput.value }).then(() => {
            PermissionInformer.refresh().then(() => {
                userNameInput.value = '';
                userPasswordInput.value = '';
                dialog.hideDlg();
                exports.refresh();
            }, UI.handleError);
        }).catch(err => UI.setError(dialog, err));
    };
}

function createUserAccount(dialog) {
    return () => {
        const userNameSelect = U.qee(dialog, '.create-login-name-select');
        const passwordInput = U.qee(dialog, '.create-login-password-input');
        DBMS.createPlayerLogin({ userName: userNameSelect.value, password: passwordInput.value }).then(() => {
            passwordInput.value = '';
            dialog.hideDlg();
            exports.refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function changePassword(dialog) {
    return () => {
        const toInput = U.qee(dialog, '.entity-input');
        const newPassword = toInput.value;
        const userName = U.queryEl(`${root}.change-password-user-select`).value.trim();
        DBMS.changePlayerPassword({ userName, newPassword }).then(() => {
            dialog.hideDlg();
            exports.refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function removeUser() {
    const name = U.queryEl(`${root}.change-password-user-select`).value.trim();
    UI.confirm(CU.strFormat(L10n.getValue('admins-confirm-user-account-remove'), [name]), () => {
        DBMS.removePlayerLogin({ userName: name }).then(exports.refresh, UI.handleError);
    });
}

function setWelcomeText(event) {
    DBMS.setWelcomeText({ text: event.target.value }).catch(UI.handleError);
}

function setPlayerOption(event) {
    DBMS.setPlayerOption({ name: event.target.value, value: event.target.checked }).catch(UI.handleError);
}
// })(window.PlayerManagement = {});
