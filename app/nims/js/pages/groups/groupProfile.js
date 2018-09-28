/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
    const root = '.group-profile-tab ';
    const l10n = L10n.get('groups');
    const settingsPath = 'GroupProfile';

    exports.init = () => {
        const createGroupDialog = UI.createModalDialog(root, exports.createGroup(true, exports.refresh), {
            bodySelector: 'modal-prompt-body',
            dialogTitle: 'groups-enter-group-name',
            actionButtonTitle: 'common-create',
        });
        listen(qe(`${root}.create`), 'click', () => createGroupDialog.showDlg());

        state.renameGroupDialog = UI.createModalDialog(root, renameGroup, {
            bodySelector: 'modal-prompt-body',
            dialogTitle: 'groups-enter-new-group-name',
            actionButtonTitle: 'common-rename',
        });

        const tbody = clearEl(queryEl(`${root} .entity-profile`));

        state.inputItems = {};

        Constants.groupProfileStructure.forEach((profileSettings) => {
            profileSettings.displayName = getL10n(`groups-${profileSettings.name}`);
            addEl(tbody, makeInput(profileSettings));
        });

        listen(queryEl(`${root} .entity-filter`), 'input', filterOptions);

        exports.content = queryEl(`${root}`);
    };

    exports.refresh = () => {
        PermissionInformer.getEntityNamesArrayNew({type: 'group', editableOnly: false}).then((groupNames) => {
            showEl(qe(`${root} .alert`), groupNames.length === 0);
            showEl(qe(`${root} .col-xs-9`), groupNames.length !== 0);
            Utils.enableEl(qe(`${root} .entity-filter`), groupNames.length !== 0);
            
            addEls(clearEl(queryEl(`${root} .entity-list`)), groupNames.map((name, i, arr) => {
                const el = wrapEl('div', qte('.entity-item-tmpl'));
                addEl(qee(el, '.primary-name'), makeText(name.displayName));
                setAttr(el, 'primary-name', name.displayName);
                setAttr(el, 'profile-name', name.value);
                listen(qee(el, '.select-button'), 'click', showProfileInfoDelegate2(name.value));
                setAttr(qee(el, '.rename'), 'title', l10n('rename-entity'));
                const removeBtn = qee(el, '.remove');
                setAttr(removeBtn, 'title', l10n('remove-entity'));
                if(i+1 < arr.length){
                    removeBtn.nextName = arr[i+1].value;
                }
                if(i > 0){
                    removeBtn.prevName = arr[i-1].value;
                }
                if (name.editable) {
                    listen(qee(el, '.rename'), 'click', () => {
                        qee(state.renameGroupDialog, '.entity-input').value = name.value;
                        state.renameGroupDialog.fromName = name.value;
                        state.renameGroupDialog.showDlg();
                    });
                    listen(removeBtn, 'click', GroupProfile.removeGroup(() => name.value, exports.refresh, removeBtn));
                } else {
                    setAttr(qee(el, '.rename'), 'disabled', 'disabled');
                    setAttr(removeBtn, 'disabled', 'disabled');
                }
                return el;
            }));
    
            showProfileInfoDelegate2(UI.checkAndGetEntitySetting(settingsPath, groupNames))();
        }).catch(Utils.handleError)
    };

    function makeInput(profileItemConfig) {
        let input;
        switch (profileItemConfig.type) {
        case 'text':
            input = makeEl('textarea');
            addClass(input, 'profileTextInput form-control');
            input.addEventListener('change', updateFieldValue(profileItemConfig.type));
            break;
        case 'checkbox':
            input = makeEl('input');
            input.type = 'checkbox';
            addClass(input, 'form-control');
            input.addEventListener('change', updateFieldValue(profileItemConfig.type));
            break;
        case 'container':
            input = makeEl('div');
            input.type = 'container';
            break;
        default:
            throw new Error(`Unexpected type ${profileItemConfig.type}`);
        }
        input.selfName = profileItemConfig.name;
        addClass(input, 'isGroupEditable');
        state.inputItems[profileItemConfig.name] = input;

        const row = qmte('.profile-editor-row-tmpl');
        addEl(qee(row, '.profile-item-name'), makeText(profileItemConfig.displayName));
        setAttr(qee(row, '.profile-item-name'), 'l10n-id', `groups-${profileItemConfig.name}`);
        addEl(qee(row, '.profile-item-input'), input);
        return row;
    }

    function updateFieldValue(type) {
        return (event) => {
            const fieldName = event.target.selfName;
            const groupName = state.name;

            let value;
            switch (type) {
            case 'text':
                // eslint-disable-next-line prefer-destructuring
                value = event.target.value;
                DBMS.updateGroupField(groupName, fieldName, value, Utils.processError());
                break;
            case 'checkbox':
                value = event.target.checked;
                DBMS.doExportGroup(groupName, value, Utils.processError());
                break;
            default:
                throw new Error(`Unexpected type ${type}`);
            }
        };
    }

    function showProfileInfoDelegate2(name) {
        return () => {
            queryEls(`${root} [profile-name] .select-button`).map(removeClass(R.__, 'btn-primary'));
            if(name !== null){
                UI.updateEntitySetting(settingsPath, name);
                const el = queryEl(`${root} [profile-name="${name}"] .select-button`);
                addClass(el, 'btn-primary');
                
                const parentEl = el.parentElement.parentElement;
                const entityList = queryEl(`${root} .entity-list`);
                UI.scrollTo(entityList, parentEl);
                
                showProfileInfoCallback(name);
            }
        };
    }
    
    function showProfileInfoCallback(groupName) {
        Promise.all([
            DBMS.getGroupNew({groupName: groupName}),
            FilterConfiguration.makeFilterConfiguration(),
            PermissionInformer.isEntityEditableNew({type: 'group', name: groupName})
        ]).then(results => {
            const [group, filterConfiguration, isGroupEditable] = results;
            const { name } = group;
            updateSettings(name);
            
            const name2DisplayName = filterConfiguration.getName2DisplayNameMapping();
            
            const name2Source = filterConfiguration.getName2SourceMapping();
    
            state.name = name;
            const { inputItems } = state;
            Object.keys(inputItems).forEach((inputName) => {
                if (inputItems[inputName].type === 'checkbox') {
                    inputItems[inputName].checked = group[inputName];
                } else if (inputItems[inputName].type === 'container') {
                    if (inputName === 'filterModel') {
                        const table = qmte(`${root} .group-filter-template`);
                        const datas = group.filterModel.map(exports.makeFilterItemString(name2DisplayName, name2Source));
                        addEls(qee(table, 'tbody'), datas.map(data2row));
                        L10n.localizeStatic(table);
                        addEl(clearEl(inputItems[inputName]), table);
                    } else if (inputName === 'characterList') {
                        const data = filterConfiguration.getProfileIds(group.filterModel);
                        const inputItem = clearEl(inputItems[inputName]);
                        addEls(inputItem, [makeText(data.join(', ')), makeEl('br'), makeText(getL10n('groups-total') + data.length)]);
                    } else {
                        throw new Error(`Unexpected container: ${inputName}`);
                    }
                } else if (inputItems[inputName].type === 'textarea') {
                    inputItems[inputName].value = group[inputName];
                } else {
                    throw new Error(`Unexpected input type: ${inputItems[inputName].type}`);
                }
                inputItems[inputName].oldValue = group[inputName];
                Utils.enable(exports.content, 'isGroupEditable', isGroupEditable);
            });
        }).catch(Utils.handleError);
    }

    // eslint-disable-next-line no-var,vars-on-top
    exports.makeFilterItemString = R.curry((name2DisplayName, name2Source, filterItem) => {
        const displayName = name2DisplayName[filterItem.name];
        const source = name2Source[filterItem.name];
        let condition, arr, value;
        switch (filterItem.type) {
        case 'enum':
            condition = getL10n(`groups-one-from`);
            value = Object.keys(filterItem.selectedOptions).join(', ');
            break;
        case 'checkbox':
            arr = [];
            if (filterItem.selectedOptions.true) { arr.push(getL10n('constant-yes')); }
            if (filterItem.selectedOptions.false) { arr.push(getL10n('constant-no')); }
            condition = getL10n(`groups-one-from`);
            value = arr.join(', ');
            break;
        case 'number':
            condition = getL10n(`constant-${filterItem.condition}`);
            value = filterItem.num;
            break;
        case 'multiEnum':
            condition = getL10n(`constant-${filterItem.condition}`);
            value = Object.keys(filterItem.selectedOptions).join(', ');
            break;
        case 'text':
        case 'string':
            condition = getL10n('groups-text-contains');
            value = filterItem.regexString;
            break;
        default:
            throw new Error(`Unexpected type ${filterItem.type}`);
        }
        const title = getL10n(`profile-filter-${source}`) + ', ' + getL10n(`constant-${filterItem.type}`);
        return {displayName, title, condition, value};
    });
    
    function data2row(data){
        const {displayName, title, condition, value} = data;
        const row = qmte(`${root} .group-filter-row-template`);
        addEl(qee(row, '.profile-item'), makeText(displayName));
        setAttr(qee(row, '.profile-item'), 'title', title);
        addEl(qee(row, '.condition'), makeText(condition));
        addEl(qee(row, '.value'), makeText(value));
        return row;
    }

    function updateSettings(name) {
        const settings = DBMS.getSettings();
        settings.GroupProfile.groupName = name;
    }

    function filterOptions(event) {
        const str = event.target.value.toLowerCase();

        const els = queryEls(`${root} [primary-name]`);
        els.forEach((el) => {
            const isVisible = getAttr(el, 'primary-name').toLowerCase().indexOf(str) !== -1;
            hideEl(el, !isVisible);
        });

        if (queryEl(`${root} .hidden[primary-name] .select-button.btn-primary`) !== null ||
            queryEl(`${root} [primary-name] .select-button.btn-primary`) === null) {
            const els2 = queryEls(`${root} [primary-name]`).filter(R.pipe(hasClass(R.__, 'hidden'), R.not));
            showProfileInfoDelegate2(els2.length > 0 ? getAttr(els2[0], 'profile-name') : null)();
        } else {
            //            queryEl(`${root} [primary-name] .select-button.btn-primary`).scrollIntoView();
        }
    }

    exports.createGroup = (updateSettingsFlag, refresh) => dialog => () => {
        const input = qee(dialog, '.entity-input');
        const name = input.value.trim();

        DBMS.createGroup(name, (err) => {
            if (err) {
                setError(dialog, err);
            } else {
                if (updateSettingsFlag) {
                    UI.updateEntitySetting(settingsPath, name);
                }
                PermissionInformer.refreshNew().then(() => {
                    input.value = '';
                    dialog.hideDlg();
                    refresh();
                }).catch(Utils.handleError);
            }
        });
    };

    function renameGroup(dialog) {
        return () => {
            const toInput = qee(dialog, '.entity-input');
            const { fromName } = dialog;
            const toName = toInput.value.trim();

            DBMS.renameGroup(fromName, toName, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    UI.updateEntitySetting(settingsPath, toName);
                    toInput.value = '';
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        };
    }

    exports.removeGroup = (callback, refresh, btn) => () => {
        const name = callback();

        Utils.confirm(strFormat(getL10n('groups-are-you-sure-about-group-removing'), [name]), () => {
            DBMS.removeGroup(name, (err) => {
                if (err) { Utils.handleError(err); return; }
                PermissionInformer.refreshNew().then(() => {
                    if(btn.nextName !== undefined){
                        UI.updateEntitySetting(settingsPath, btn.nextName);
                    } else if(btn.prevName !== undefined) {
                        UI.updateEntitySetting(settingsPath, btn.prevName);
                    }
                    refresh();
                }).catch(Utils.handleError);
            });
        });
    };
})(this.GroupProfile = {});
