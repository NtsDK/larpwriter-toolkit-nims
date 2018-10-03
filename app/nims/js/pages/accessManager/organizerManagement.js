/*Copyright 2015-2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

    state.entities = ['characters', 'stories', 'groups', 'players'];

    const root = '.organizer-management-tab ';

    let removePermission, assignPermission;

    exports.init = () => {
        const createUserDialog = UI.createModalDialog(root, createUser, {
            bodySelector: 'create-organizer-body',
            dialogTitle: 'admins-creating-user',
            actionButtonTitle: 'common-create',
        });
        listen(qe(`${root}.create.user`), 'click', () => createUserDialog.showDlg());

        const changePasswordDialog = UI.createModalDialog(root, changePassword, {
            bodySelector: 'modal-prompt-body',
            dialogTitle: 'admins-enter-new-password',
            actionButtonTitle: 'common-replace',
        });
        listen(qe(`${root}.user.change-password`), 'click', () => {
            qee(changePasswordDialog, '.entity-input').value = '';
            changePasswordDialog.showDlg();
        });

        listen(queryEl(`${root}.remove-user-button`), 'click', removeOrganizer);

        listen(queryEl(`${root}.assign-permission-button`), 'click', assignPermission);
        listen(queryEl(`${root}.remove-permission-button`), 'click', removePermission);
        listen(queryEl(`${root}.assign-admin-button`), 'click', assignNewAdmin);
        listen(queryEl(`${root}.remove-editor-button`), 'click', removeEditor);
        listen(queryEl(`${root}.assign-editor-button`), 'click', assignEditor);

        state.entities.forEach(type => {
            listen(queryEl(`${root} .entity-filter.${type}`), 'input', filterList(`.entity-list.${type}`));
        });

        queryElEls(queryEl(root), '.adaptationRights').map(listen(R.__, 'click', changeAdaptationRightsMode));

        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        Promise.all([
            DBMS.getManagementInfoNew(),
            PermissionInformer.isAdminNew(),
            PermissionInformer.isEditorNew(),
            PermissionInformer.getEntityNamesArrayNew({type: 'character', editableOnly: false}),
            PermissionInformer.getEntityNamesArrayNew({type: 'story', editableOnly: false}),
            PermissionInformer.getEntityNamesArrayNew({type: 'group', editableOnly: false}),
            PermissionInformer.getEntityNamesArrayNew({type: 'player', editableOnly: false}),
        ]).then(results => {
            const [managementInfo, isAdmin, isEditor, characterNames, storyNames, groupNames, playerNames] = results;
            const names = {
                characters: characterNames,
                groups: groupNames,
                stories: storyNames,
                players: playerNames,
            };
            if (!isAdmin && isEditor) {
                R.keys(names).forEach((entity) => {
                    names[entity] = names[entity].filter(R.prop('isOwner'));
                });
            }
            rebuildInterface(names, managementInfo, isAdmin);
            Utils.enable(exports.content, 'adminOnly', isAdmin);
            Utils.enable(exports.content, 'editorOrAdmin', isAdmin || isEditor);
        }).catch(Utils.handleError);
    };

    function rebuildInterface(names, managementInfo, isAdmin) {
        const { usersInfo } = managementInfo;

        const userNames = Object.keys(usersInfo).sort(CommonUtils.charOrdA);

        const selectors = [];
        selectors.push(queryEl(`${root}.change-password-user-select`));
//        selectors.push(queryEl(`${root}.user-permission-select`));
//        selectors.push(queryEl(`${root}.assign-editor-select`));

        const data = arr2Select2(userNames)
        selectors.forEach((selector) => {
            clearEl(selector);
            $(selector).select2(data);
//            Utils.rebuildSelectorArr(selector, userNames);
        });

        Utils.rebuildSelectorArr(queryEl(`${root}.user-permission-select`), userNames);

        const clone = userNames.slice(0);
        clone.splice(userNames.indexOf(managementInfo.admin), 1);
//        let selector = queryEl(`${root}.assign-admin-select`);
//        Utils.rebuildSelectorArr(selector, clone);

//        const data = getSelect2Data(allGroupNames);
//        clearEl(queryEl(`${root}.save-entity-select`));
//        $(`${root}.save-entity-select`).select2(data);

//        selector = queryEl(`${root}.remove-user-select`);
//        Utils.rebuildSelectorArr(selector, clone);

        state.entities.forEach((entity) => {
            Utils.rebuildSelector(queryEl(`${root}.permission-selector__${entity}`), names[entity]);
        });

        addEl(clearEl(queryEl(`${root}.current-admin-label`)), makeText(managementInfo.admin));

        const span = clearEl(queryEl(`${root}.current-editor-label`));
        if (managementInfo.editor) {
            addEl(span, makeText(managementInfo.editor));
        }

        getEl(`adaptationRights${managementInfo.adaptationRights}`).checked = true;

        state.entities.forEach((entity) => {
//            Utils.rebuildSelector(queryEl(`${root}.permission-selector__${entity}`), names[entity]);
            addEls(
                clearEl(queryEl(`${root} .entity-list.${entity}`)),
                names[entity].map(entity2el(isAdmin, entity))
            );
        });

        addEls(
            clearEl(queryEl(`${root} .entity-list.users`)),
            userNames.map(user2el)
        );
        buildPermissionList(names, usersInfo);
    }

    const entity2el = R.curry((isAdmin, type, name) => {
        const el = qmte(`.profile-item-tmpl`);
        el.profileName = name.value;
        addEl(qee(el, '.primary-name'), makeText(name.displayName));
        const btn = qee(el, '[role=button]');
        setAttr(btn, 'profile-name', name.value);
        setAttr(btn, 'primary-name', name.displayName);
        setAttr(btn, 'button-type', 'entity');
        setAttr(btn, 'profile-type', type);
        if(name.isOwner || isAdmin){
            listen(btn, 'dragstart', onDragStart);
            listen(btn, 'drop', onDrop);
            listen(btn, 'dragover', allowDrop);
            listen(btn, 'dragenter', handleDragEnter);
            listen(btn, 'dragleave', handleDragLeave);
            listen(btn, 'click', e => toggleClass(btn, 'btn-primary'));
        } else {
            Utils.enableEl(btn, false);
        }
        return el;
    });

    const user2el = R.curry((name) => {
        const el = wrapEl('div', qte(`.profile-item-tmpl`));
//        el.profileName = name.value;
        addEl(qee(el, '.primary-name'), makeText(name));
        setAttr(el, 'profile-name', name);
        setAttr(el, 'button-type', 'user');
//        setAttr(el, 'primary-name', name.displayName);
//        setAttr(el, 'profile-type', type);
        listen(el, 'dragstart', onDragStart);
        listen(el, 'drop', onDrop);
        listen(el, 'dragover', allowDrop);
        listen(el, 'dragenter', handleDragEnter);
        listen(el, 'dragleave', handleDragLeave);
        return el;
    });

    // eslint-disable-next-line no-var,vars-on-top
    var onDragStart = function(event) {
        if(getAttr(this, 'button-type') === 'entity'){
            addClass(this, 'btn-primary');
        }
        console.log(`onDragStart ${this.profileName}`);
        event.dataTransfer.setData('data', JSON.stringify({
            name: getAttr(this, 'profile-name'),
            type: getAttr(this, 'profile-type'),
            buttonType: getAttr(this, 'button-type'),
        }));
        event.dataTransfer.effectAllowed = 'move';
    };

    // eslint-disable-next-line no-var,vars-on-top
    var onDrop = function(event) {
        removeClass(this, 'over');
        console.log(`onDrop ${this.profileName}${event.dataTransfer.getData('data')}`);
        if (event.stopPropagation) {
            event.stopPropagation(); // stops the browser from redirecting.
        }
        const thatData = JSON.parse(event.dataTransfer.getData('data'));
        if (thatData.type === getAttr(this, 'profile-type')) {
            return;
        }
        const type1 = getAttr(this, 'button-type');
        const type2 = thatData.buttonType;

        if(type1 !== type2){
            const userName = type1 === 'user' ? getAttr(this, 'profile-name') : thatData.name;
//            const entityBtn =  type1 === 'user' ?

//            console.log(user);
            const btns = qes(`${root} .rights-panel .btn-primary[role=button]`);
            const selected = btns.map( btn => ({
                type: getAttr(btn, 'profile-type'),
                name: getAttr(btn, 'profile-name'),
            }));
            const names = R.mapObjIndexed(arr => arr.map(R.prop('name')), R.groupBy(R.prop('type'), selected));
            btns.forEach(btn => removeClass(btn, 'btn-primary'))

            DBMS['assignPermissionNew']({userName, names}).then(exports.refresh, Utils.handleError);
//            DBMS[action](userName, names, Utils.processError(exports.refresh));
//        };
//    }
//
//    removePermission = permissionAction('removePermission');
//    assignPermission = permissionAction('assignPermission');
        }

//        createBinding([thatData, {
//            name: getAttr(this, 'profile-name'),
//            type: getAttr(this, 'profile-type'),
//        }]);
    };

    // eslint-disable-next-line no-var,vars-on-top
    var allowDrop = function(event) {
        console.log(`allowDrop ${this.profileName}`);
        event.preventDefault();
    };

    function handleDragEnter(event) {
        addClass(this, 'over');
    }

    function handleDragLeave(event) {
        removeClass(this, 'over');
    }

    function buildPermissionList(names, usersInfo) {
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
    }

    function createUser(dialog) {
        return () => {
            const userNameInput = qee(dialog,`.create-user-name-input`);
            const userPasswordInput = qee(dialog,`.create-user-password-input`);
            DBMS.createOrganizerNew({
                name: userNameInput.value.trim(),
                password: userPasswordInput.value
            }).then(() => {
                userNameInput.value = '';
                userPasswordInput.value = '';
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    function changePassword(dialog) {
        return () => {
            const toInput = qee(dialog, '.entity-input');
            const newPassword = toInput.value;
            const userName = queryEl(`${root}.change-password-user-select`).value.trim();

            DBMS.changeOrganizerPasswordNew({userName, newPassword}).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    function removeOrganizer() {
//        const name = queryEl(`${root}.remove-user-select`).value.trim();
        const name = queryEl(`${root}.change-password-user-select`).value.trim();
        Utils.confirm(strFormat(getL10n('admins-confirm-user-remove'), [name]), () => {
            DBMS.removeOrganizerNew({name}).then(exports.refresh, Utils.handleError);
        });
    }

    const getSelectedOptions = sel => nl2array(queryEl(sel).selectedOptions).map(opt => opt.value);

    function permissionAction(action) {
        return () => {
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

            DBMS[action]({userName, names}).then(exports.refresh, Utils.handleError);
        };
    }

    removePermission = permissionAction('removePermissionNew');
    assignPermission = permissionAction('assignPermissionNew');

    function assignNewAdmin() {
        const userName = queryEl(`${root}.change-password-user-select`).value.trim();
        Utils.confirm(strFormat(getL10n('admins-confirm-admin-assignment'), [userName]), () => {
            DBMS.assignAdminNew({userName}).then(exports.refresh, Utils.handleError);
        });
    }
    function removeEditor() {
        DBMS.removeEditorNew().then(exports.refresh, Utils.handleError);
    }
    function assignEditor() {
        const userName = queryEl(`${root}.change-password-user-select`).value.trim();
        Utils.confirm(strFormat(getL10n('admins-confirm-editor-assignment'), [userName]), () => {
            DBMS.assignEditorNew({name: userName}).then(exports.refresh, Utils.handleError);
        });
    }
    function changeAdaptationRightsMode(event) {
        DBMS.changeAdaptationRightsModeNew({mode:event.target.value}).catch(Utils.handleError);
    }

    // eslint-disable-next-line no-var,vars-on-top
    var filterList = sel => (event) => {
        const str = event.target.value.toLowerCase();

        const els = queryEls(`${root} ${sel} [primary-name]`);
        els.forEach((el) => {
            const isVisible = getAttr(el, 'primary-name').toLowerCase().indexOf(str) !== -1;
            hideEl(el, !isVisible);
        });
    };
})(this.OrganizerManagement = {});
