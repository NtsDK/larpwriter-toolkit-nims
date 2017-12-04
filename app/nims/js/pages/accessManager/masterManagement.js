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

(function (exports) {
    const state = {};

    state.entities = ['characters', 'stories', 'groups', 'players'];

    const root = '.master-management-tab ';

    exports.init = function () {
        listen(queryEl(`${root}.create-user-button`), 'click', createMaster);
        listen(queryEl(`${root}.change-password-button`), 'click', changeMasterPassword);
        listen(queryEl(`${root}.remove-user-button`), 'click', removeMaster);

        listen(queryEl(`${root}.assign-permission-button`), 'click', assignPermission);
        listen(queryEl(`${root}.remove-permission-button`), 'click', removePermission);
        listen(queryEl(`${root}.assign-admin-button`), 'click', assignNewAdmin);
        listen(queryEl(`${root}.remove-editor-button`), 'click', removeEditor);
        listen(queryEl(`${root}.assign-editor-button`), 'click', assignEditor);

        queryElEls(queryEl(root), '.adaptationRights').map(listen(R.__, 'click', changeAdaptationRightsMode));

        exports.content = queryEl(root);
    };

    exports.refresh = function () {
        DBMS.getManagementInfo((err, managementInfo) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.isAdmin((err, isAdmin) => {
                if (err) { Utils.handleError(err); return; }
                PermissionInformer.isEditor((err, isEditor) => {
                    if (err) { Utils.handleError(err); return; }
                    PermissionInformer.getEntityNamesArray('character', !isAdmin, (err, characterNames) => {
                        if (err) { Utils.handleError(err); return; }
                        PermissionInformer.getEntityNamesArray('story', !isAdmin, (err, storyNames) => {
                            if (err) { Utils.handleError(err); return; }
                            PermissionInformer.getEntityNamesArray('group', !isAdmin, (err, groupNames) => {
                                if (err) { Utils.handleError(err); return; }
                                PermissionInformer.getEntityNamesArray('player', !isAdmin, (err, playerNames) => {
                                    if (err) { Utils.handleError(err); return; }
                                    const names = {
                                        characters: characterNames,
                                        groups: groupNames,
                                        stories: storyNames,
                                        players: playerNames,
                                    };
                                    if (!isAdmin && isEditor) {
                                        for (const entity in names) {
                                            names[entity] = names[entity].filter(R.prop('isOwner'));
                                        }
                                    }
                                    rebuildInterface(names, managementInfo);
                                    Utils.enable(exports.content, 'adminOnly', isAdmin);
                                    Utils.enable(exports.content, 'editorOrAdmin', isAdmin || isEditor);
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    var rebuildInterface = function (names, managementInfo) {
        const usersInfo = managementInfo.usersInfo;

        const userNames = Object.keys(usersInfo).sort(CommonUtils.charOrdA);

        const selectors = [];
        selectors.push(queryEl(`${root}.change-password-user-select`));
        selectors.push(queryEl(`${root}.user-permission-select`));
        selectors.push(queryEl(`${root}.assign-editor-select`));

        selectors.forEach((selector) => {
            Utils.rebuildSelectorArr(selector, userNames);
        });

        const clone = userNames.slice(0);
        clone.splice(userNames.indexOf(managementInfo.admin), 1);
        let selector = queryEl(`${root}.assign-admin-select`);
        Utils.rebuildSelectorArr(selector, clone);

        selector = queryEl(`${root}.remove-user-select`);
        Utils.rebuildSelectorArr(selector, clone);

        state.entities.forEach((entity) => {
            Utils.rebuildSelector(queryEl(`${root}.permission-selector__${entity}`), names[entity]);
        });

        addEl(clearEl(queryEl(`${root}.current-admin-label`)), makeText(managementInfo.admin));

        const span = clearEl(queryEl(`${root}.current-editor-label`));
        if (managementInfo.editor) {
            addEl(span, makeText(managementInfo.editor));
        }

        getEl(`adaptationRights${managementInfo.adaptationRights}`).checked = true;

        buildPermissionList(names, usersInfo);
    };

    var buildPermissionList = function (names, usersInfo) {
        const permissionTable = clearEl(queryEl(`${root}.permission-table`));
        const treeRoot = makeEl('ul');
        addEl(permissionTable, treeRoot);

        R.keys(names).forEach((entity) => {
            names[entity] = names[entity].map(R.prop('value'));
        });

        R.values(usersInfo).forEach((userInfo) => {
            R.keys(userInfo).forEach((entity) => {
                names[entity] = R.difference(names[entity], userInfo[entity]);
            });
        });

        usersInfo[getL10n('admins-have-not-owner')] = names;

        const headers = {
            characters: getL10n('admins-characters'),
            stories: getL10n('admins-stories'),
            groups: getL10n('admins-groups'),
            players: getL10n('admins-players'),
        };

        function liMaker(text) {
            return addEl(makeEl('li'), makeText(text));
        }

        function makeEntityLists(userInfo) {
            return state.entities.reduce((result, entity) => {
                result.push(liMaker(headers[entity]));
                result.push(addEls(makeEl('ol'), userInfo[entity].sort(CommonUtils.charOrdA).map(liMaker)));
                return result;
            }, []);
        }

        const userNames = Object.keys(usersInfo).sort(CommonUtils.charOrdA);
        addEls(treeRoot, userNames.reduce((result, userName) => {
            result.push(liMaker(userName));
            result.push(addEls(makeEl('ol'), makeEntityLists(usersInfo[userName])));
            return result;
        }, []));
    };

    var createMaster = function () {
        const userNameInput = queryEl(`${root}.create-user-name-input`);
        const userPasswordInput = queryEl(`${root}.create-user-password-input`);
        DBMS.createMaster(userNameInput.value.trim(), userPasswordInput.value, Utils.processError(() => {
            userNameInput.value = '';
            userPasswordInput.value = '';
            exports.refresh();
        }));
    };


    var changeMasterPassword = function () {
        const userName = queryEl(`${root}.change-password-user-select`).value.trim();
        const passwordInput = queryEl(`${root}.change-password-password-input`);
        DBMS.changeMasterPassword(userName, passwordInput.value, Utils.processError(() => {
            queryEl(`${root}.change-password-password-input`).value = '';
            exports.refresh();
        }));
    };

    var removeMaster = function () {
        const name = queryEl(`${root}.remove-user-select`).value.trim();
        Utils.confirm(strFormat(getL10n('admins-confirm-user-remove'), [name]), () => {
            DBMS.removeMaster(name, Utils.processError(exports.refresh));
        });
    };

    const getSelectedOptions = sel => nl2array(queryEl(sel).selectedOptions).map(opt => opt.value);

    const permissionAction = function (action) {
        return function () {
            const userName = queryEl(`${root}.user-permission-select`).value.trim();

            // TODO remove this check
            if (userName === '') {
                Utils.alert(getL10n('admins-user-is-not-selected'));
                return;
            }

            const names = {};
            state.entities.forEach((entity) => {
                names[entity] = getSelectedOptions(`${root}.permission-selector__${entity}`);
            });

            DBMS[action](userName, names, Utils.processError(exports.refresh));
        };
    };

    var removePermission = permissionAction('removePermission');
    var assignPermission = permissionAction('assignPermission');

    var assignNewAdmin = function () {
        const userName = queryEl(`${root}.assign-admin-select`).value.trim();
        Utils.confirm(strFormat(getL10n('admins-confirm-admin-assigment'), [userName]), () => {
            DBMS.assignAdmin(userName, Utils.processError(exports.refresh));
        });
    };
    var removeEditor = function () {
        DBMS.removeEditor(Utils.processError(exports.refresh));
    };
    var assignEditor = function () {
        const userName = queryEl(`${root}.assign-editor-select`).value.trim();
        Utils.confirm(strFormat(getL10n('admins-confirm-editor-assigment'), [userName]), () => {
            DBMS.assignEditor(userName, Utils.processError(exports.refresh));
        });
    };
    var changeAdaptationRightsMode = function (event) {
        DBMS.changeAdaptationRightsMode(event.target.value, Utils.processError());
    };
}(this.MasterManagement = {}));
