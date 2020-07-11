import PermissionInformer from "permissionInformer";


const state = {};

state.entities = ['characters', 'stories', 'groups', 'players'];

const root = '.organizer-management-tab ';

let removePermission, assignPermission;

let content;
function getContent(){
    return content;
}
export default {
    init, refresh, getContent
}

function init(){
    const createUserDialog = UI.createModalDialog(root, createUser, {
        bodySelector: 'create-organizer-body',
        dialogTitle: 'admins-creating-user',
        actionButtonTitle: 'common-create',
    });
    U.listen(U.qe(`${root}.create.user`), 'click', () => createUserDialog.showDlg());

    const changePasswordDialog = UI.createModalDialog(root, changePassword, {
        bodySelector: 'modal-prompt-body',
        dialogTitle: 'admins-enter-new-password',
        actionButtonTitle: 'common-replace',
    });
    U.listen(U.qe(`${root}.user.change-password`), 'click', () => {
        U.qee(changePasswordDialog, '.entity-input').value = '';
        changePasswordDialog.showDlg();
    });

    U.listen(U.queryEl(`${root}.remove-user-button`), 'click', removeOrganizer);

    U.listen(U.queryEl(`${root}.assign-permission-button`), 'click', assignPermission);
    U.listen(U.queryEl(`${root}.remove-permission-button`), 'click', removePermission);
    U.listen(U.queryEl(`${root}.assign-admin-button`), 'click', assignNewAdmin);
    U.listen(U.queryEl(`${root}.remove-editor-button`), 'click', removeEditor);
    U.listen(U.queryEl(`${root}.assign-editor-button`), 'click', assignEditor);

    state.entities.forEach((type) => {
        U.listen(U.queryEl(`${root} .entity-filter.${type}`), 'input', filterList(`.entity-list.${type}`));
    });

    U.queryElEls(U.queryEl(root), '.adaptationRights').map(U.listen(R.__, 'click', changeAdaptationRightsMode));

    content = U.queryEl(root);
};

function refresh(){
    PermissionInformer.refresh().then(() => {
        Promise.all([
            DBMS.getManagementInfo(),
            PermissionInformer.isAdmin(),
            PermissionInformer.isEditor(),
            PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
            PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }),
            PermissionInformer.getEntityNamesArray({ type: 'group', editableOnly: false }),
            PermissionInformer.getEntityNamesArray({ type: 'player', editableOnly: false }),
        ]).then((results) => {
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
            UI.enable(content, 'adminOnly', isAdmin);
            UI.enable(content, 'editorOrAdmin', isAdmin || isEditor);
        }).catch(UI.handleError);
    }).catch(UI.handleError);
};

function rebuildInterface(names, managementInfo, isAdmin) {
    const { usersInfo } = managementInfo;

    const userNames = Object.keys(usersInfo).sort(CU.charOrdA);

    const selectors = [];
    selectors.push(U.queryEl(`${root}.change-password-user-select`));
    //        selectors.push(U.queryEl(`${root}.user-permission-select`));
    //        selectors.push(U.queryEl(`${root}.assign-editor-select`));

    const data = U.arr2Select2(userNames);
    selectors.forEach((selector) => {
        U.clearEl(selector);
        $(selector).select2(data);
        //            UI.rebuildSelectorArr(selector, userNames);
    });

    UI.rebuildSelectorArr(U.queryEl(`${root}.user-permission-select`), userNames);

    const clone = userNames.slice(0);
    clone.splice(userNames.indexOf(managementInfo.admin), 1);
    //        let selector = U.queryEl(`${root}.assign-admin-select`);
    //        UI.rebuildSelectorArr(selector, clone);

    //        const data = UI.getSelect2Data(allGroupNames);
    //        U.clearEl(U.queryEl(`${root}.save-entity-select`));
    //        $(`${root}.save-entity-select`).select2(data);

    //        selector = U.queryEl(`${root}.remove-user-select`);
    //        UI.rebuildSelectorArr(selector, clone);

    state.entities.forEach((entity) => {
        UI.rebuildSelector(U.queryEl(`${root}.permission-selector__${entity}`), names[entity]);
    });

    U.addEl(U.clearEl(U.queryEl(`${root}.current-admin-label`)), U.makeText(managementInfo.admin));

    const span = U.clearEl(U.queryEl(`${root}.current-editor-label`));
    if (managementInfo.editor) {
        U.addEl(span, U.makeText(managementInfo.editor));
    }

    U.queryEl(`#adaptationRights${managementInfo.adaptationRights}`).checked = true;

    state.entities.forEach((entity) => {
        //            UI.rebuildSelector(U.queryEl(`${root}.permission-selector__${entity}`), names[entity]);
        U.addEls(
            U.clearEl(U.queryEl(`${root} .entity-list.${entity}`)),
            names[entity].map(entity2el(isAdmin, entity))
        );
    });

    U.addEls(
        U.clearEl(U.queryEl(`${root} .entity-list.users`)),
        userNames.map(user2el)
    );
    buildPermissionList(names, usersInfo);
}

const entity2el = R.curry((isAdmin, type, name) => {
    const el = U.qmte('.profile-item-tmpl');
    el.profileName = name.value;
    U.addEl(U.qee(el, '.primary-name'), U.makeText(name.displayName));
    const btn = U.qee(el, '[role=button]');
    U.setAttr(btn, 'profile-name', name.value);
    U.setAttr(btn, 'primary-name', name.displayName);
    U.setAttr(btn, 'button-type', 'entity');
    U.setAttr(btn, 'profile-type', type);
    if (name.isOwner || isAdmin) {
        U.listen(btn, 'dragstart', onDragStart);
        U.listen(btn, 'drop', onDrop);
        U.listen(btn, 'dragover', allowDrop);
        U.listen(btn, 'dragenter', handleDragEnter);
        U.listen(btn, 'dragleave', handleDragLeave);
        U.listen(btn, 'click', e => U.toggleClass(btn, 'btn-primary'));
    } else {
        UI.enableEl(btn, false);
    }
    return el;
});

const user2el = R.curry((name) => {
    const el = U.wrapEl('div', U.qte('.profile-item-tmpl'));
    //        el.profileName = name.value;
    U.addEl(U.qee(el, '.primary-name'), U.makeText(name));
    U.setAttr(el, 'profile-name', name);
    U.setAttr(el, 'button-type', 'user');
    //        U.setAttr(el, 'primary-name', name.displayName);
    //        U.setAttr(el, 'profile-type', type);
    U.listen(el, 'dragstart', onDragStart);
    U.listen(el, 'drop', onDrop);
    U.listen(el, 'dragover', allowDrop);
    U.listen(el, 'dragenter', handleDragEnter);
    U.listen(el, 'dragleave', handleDragLeave);
    return el;
});

// eslint-disable-next-line no-var,vars-on-top
var onDragStart = function (event) {
    if (U.getAttr(this, 'button-type') === 'entity') {
        U.addClass(this, 'btn-primary');
    }
    console.log(`onDragStart ${this.profileName}`);
    event.dataTransfer.setData('data', JSON.stringify({
        name: U.getAttr(this, 'profile-name'),
        type: U.getAttr(this, 'profile-type'),
        buttonType: U.getAttr(this, 'button-type'),
    }));
    event.dataTransfer.effectAllowed = 'move';
};

// eslint-disable-next-line no-var,vars-on-top
var onDrop = function (event) {
    U.removeClass(this, 'over');
    console.log(`onDrop ${this.profileName}${event.dataTransfer.getData('data')}`);
    if (event.stopPropagation) {
        event.stopPropagation(); // stops the browser from redirecting.
    }
    const thatData = JSON.parse(event.dataTransfer.getData('data'));
    if (thatData.type === U.getAttr(this, 'profile-type')) {
        return;
    }
    const type1 = U.getAttr(this, 'button-type');
    const type2 = thatData.buttonType;

    if (type1 !== type2) {
        const userName = type1 === 'user' ? U.getAttr(this, 'profile-name') : thatData.name;
        //            const entityBtn =  type1 === 'user' ?

        //            console.log(user);
        const btns = U.qes(`${root} .rights-panel .btn-primary[role=button]`);
        const selected = btns.map(btn => ({
            type: U.getAttr(btn, 'profile-type'),
            name: U.getAttr(btn, 'profile-name'),
        }));
        const names = R.mapObjIndexed(arr => arr.map(R.prop('name')), R.groupBy(R.prop('type'), selected));
        btns.forEach(btn => U.removeClass(btn, 'btn-primary'));

        DBMS.assignPermission({ userName, names }).then(refresh, UI.handleError);
        //            DBMS[action](userName, names, UI.processError(refresh));
        //        };
        //    }
        //
        //    removePermission = permissionAction('removePermission');
        //    assignPermission = permissionAction('assignPermission');
    }

//        createBinding([thatData, {
//            name: U.getAttr(this, 'profile-name'),
//            type: U.getAttr(this, 'profile-type'),
//        }]);
};

// eslint-disable-next-line no-var,vars-on-top
var allowDrop = function (event) {
    console.log(`allowDrop ${this.profileName}`);
    event.preventDefault();
};

function handleDragEnter(event) {
    U.addClass(this, 'over');
}

function handleDragLeave(event) {
    U.removeClass(this, 'over');
}

function buildPermissionList(names, usersInfo) {
    const permissionTable = U.clearEl(U.queryEl(`${root}.permission-table`));
    const treeRoot = U.makeEl('ul');
    U.addEl(permissionTable, treeRoot);

    R.keys(names).forEach((entity) => {
        names[entity] = names[entity].map(R.prop('value'));
    });

    R.values(usersInfo).forEach((userInfo) => {
        R.keys(userInfo).forEach((entity) => {
            names[entity] = R.difference(names[entity], userInfo[entity]);
        });
    });

    usersInfo[L10n.getValue('admins-have-not-owner')] = names;

    const headers = {
        characters: L10n.getValue('admins-characters'),
        stories: L10n.getValue('admins-stories'),
        groups: L10n.getValue('admins-groups'),
        players: L10n.getValue('admins-players'),
    };

    function liMaker(text) {
        return U.addEl(U.makeEl('li'), U.makeText(text));
    }

    function makeEntityLists(userInfo) {
        return state.entities.reduce((result, entity) => {
            result.push(liMaker(headers[entity]));
            result.push(U.addEls(U.makeEl('ol'), userInfo[entity].sort(CU.charOrdA).map(liMaker)));
            return result;
        }, []);
    }

    const userNames = Object.keys(usersInfo).sort(CU.charOrdA);
    U.addEls(treeRoot, userNames.reduce((result, userName) => {
        result.push(liMaker(userName));
        result.push(U.addEls(U.makeEl('ol'), makeEntityLists(usersInfo[userName])));
        return result;
    }, []));
}

function createUser(dialog) {
    return () => {
        const userNameInput = U.qee(dialog, '.create-user-name-input');
        const userPasswordInput = U.qee(dialog, '.create-user-password-input');
        DBMS.createOrganizer({
            name: userNameInput.value.trim(),
            password: userPasswordInput.value
        }).then(() => {
            userNameInput.value = '';
            userPasswordInput.value = '';
            dialog.hideDlg();
            refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function changePassword(dialog) {
    return () => {
        const toInput = U.qee(dialog, '.entity-input');
        const newPassword = toInput.value;
        const userName = U.queryEl(`${root}.change-password-user-select`).value.trim();

        DBMS.changeOrganizerPassword({ userName, newPassword }).then(() => {
            dialog.hideDlg();
            refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function removeOrganizer() {
//        const name = U.queryEl(`${root}.remove-user-select`).value.trim();
    const name = U.queryEl(`${root}.change-password-user-select`).value.trim();
    UI.confirm(CU.strFormat(L10n.getValue('admins-confirm-user-remove'), [name]), () => {
        DBMS.removeOrganizer({ name }).then(refresh, UI.handleError);
    });
}

const getSelectedOptions = sel => U.nl2array(U.queryEl(sel).selectedOptions).map(opt => opt.value);

function permissionAction(action) {
    return () => {
        const userName = U.queryEl(`${root}.user-permission-select`).value.trim();

        // TODO remove this check
        if (userName === '') {
            UI.alert(L10n.getValue('admins-user-is-not-selected'));
            return;
        }

        const names = {};
        state.entities.forEach((entity) => {
            names[entity] = getSelectedOptions(`${root}.permission-selector__${entity}`);
        });

        DBMS[action]({ userName, names }).then(refresh, UI.handleError);
    };
}

removePermission = permissionAction('removePermission');
assignPermission = permissionAction('assignPermission');

function assignNewAdmin() {
    const userName = U.queryEl(`${root}.change-password-user-select`).value.trim();
    UI.confirm(CU.strFormat(L10n.getValue('admins-confirm-admin-assignment'), [userName]), () => {
        DBMS.assignAdmin({ userName }).then(refresh, UI.handleError);
    });
}
function removeEditor() {
    DBMS.removeEditor().then(refresh, UI.handleError);
}
function assignEditor() {
    const userName = U.queryEl(`${root}.change-password-user-select`).value.trim();
    UI.confirm(CU.strFormat(L10n.getValue('admins-confirm-editor-assignment'), [userName]), () => {
        DBMS.assignEditor({ name: userName }).then(refresh, UI.handleError);
    });
}
function changeAdaptationRightsMode(event) {
    DBMS.changeAdaptationRightsMode({ mode: event.target.value }).catch(UI.handleError);
}

// eslint-disable-next-line no-var,vars-on-top
var filterList = sel => (event) => {
    const str = event.target.value.toLowerCase();

    const els = U.queryEls(`${root} ${sel} [primary-name]`);
    els.forEach((el) => {
        const isVisible = U.getAttr(el, 'primary-name').toLowerCase().indexOf(str) !== -1;
        U.hideEl(el, !isVisible);
    });
};
// })(window.OrganizerManagement = {});
