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


// Character/Player profiles already have field 'name'
// I had some choices:
// 1. remove this field at all
// 2. Add one more object to divide special values (name) and user defined values
// 3. Prohibit to make field - name
// 1. This field is used in many places
// 2. - too complex way
// 3. simple and lesser complexity, I choose this way

function ProfileConfigurerTmpl(exports, opts) {
    const { tabType } = opts;

    const tmplRoot = '.profile-configurer2-tab-tmpl';
    const tabRoot = `.profile-configurer2-tab.${`${tabType}-type`} `;
    const profilePanel = `${tabRoot}.profile-panel `;
    const l10n = L10n.get('profiles');
    const state = {};

    exports.init = () => {
        const el = queryEl(tmplRoot).cloneNode(true);

        addClasses(el, ['profile-configurer2-tab', `${`${tabType}-type`}`]);
        removeClass(el, 'profile-configurer2-tab-tmpl');
        addEl(queryEl('.tab-container'), el);

        const createProfileItemDialog = UI.createModalDialog(
            `.profile-configurer2-tab.${`${tabType}-type`}`,
            createProfileItem, {
                bodySelector: 'create-profile-item-body',
                dialogTitle: 'profiles-create-profile-item',
                actionButtonTitle: 'common-create',
                initBody: (body) => {
                    const sel = clearEl(qee(body, '.create-entity-type-select'));
                    const fillMainSel = () => { fillItemTypesSel(clearEl(sel)); };
                    fillMainSel();
                    L10n.onL10nChange(fillMainSel);
                }
            }
        );

        state.renameProfileItemDialog = UI.createModalDialog(
            `.profile-configurer2-tab.${`${tabType}-type`}`,
            renameProfileItem, {
                bodySelector: 'modal-prompt-body',
                dialogTitle: 'profiles-enter-new-profile-item-name',
                actionButtonTitle: 'common-rename',
            }
        );

        state.moveProfileItemDialog = UI.createModalDialog(
            `.profile-configurer2-tab.${`${tabType}-type`}`,
            moveProfileItem, {
                bodySelector: 'move-profile-item-body',
                dialogTitle: 'profiles-new-profile-item-position',
                actionButtonTitle: 'common-move',
            }
        );

        state.renameEnumItemDialog = UI.createModalDialog(
            `.profile-configurer2-tab.${`${tabType}-type`}`,
            renameEnumValue, {
                bodySelector: 'rename-enum-value-tmpl',
                dialogTitle: 'profiles-rename-enum-item',
                actionButtonTitle: 'common-rename',
                initBody: (body) => {
                    const renameSelect = clearEl(qee(body, '.renamed-value-select'));
                    const renameInput = clearEl(qee(body, '.enum-value-name-input'));
                    listen(renameSelect, 'change', () => {
                        renameInput.value = renameSelect.value;
                    });
                }
            }
        );

        state.enumEditorDialog = UI.createModalDialog(
            `.profile-configurer2-tab.${`${tabType}-type`}`,
            updateEnumValues, {
                bodySelector: 'enum-dialog-editor-tmpl',
                dialogTitle: 'profiles-enum-editor',
                actionButtonTitle: 'common-save',
                initBody: (body) => {
                    const addedValuesArea = qee(body, '.new-enum-values');
                    const removedValuesArea = qee(body, '.removed-enum-values');
                    const inputArea = qee(body, '.enum-value-input');
                    const defaultValueSelect = qee(body, '.default-value-select');
                    listen(inputArea, 'input', () => {
                        const newVals = inputArea.value.split(',').map(R.trim).filter(R.pipe(R.equals(''), R.not));
                        const addedValues = R.sort(CommonUtils.charOrdA, R.difference(newVals, inputArea.srcList));
                        addEls(clearEl(addedValuesArea), enumList2Els(addedValues));
                        const removedValues = R.sort(CommonUtils.charOrdA, R.difference(inputArea.srcList, newVals));
                        addEls(clearEl(removedValuesArea), enumList2Els(removedValues));

                        let defaultValue = defaultValueSelect.value;
                        clearEl(defaultValueSelect);

                        if(newVals.length === 0){
                            return;
                        }

                        if(!R.contains(defaultValue, newVals)){
                            defaultValue = newVals[0];
                        }
                        fillSelector(defaultValueSelect, arr2Select(newVals));
                        qee(defaultValueSelect, `[value="${defaultValue}"]`).selected = true;
                    });
                }
            }
        );

        state.multiEnumEditorDialog = UI.createModalDialog(
            `.profile-configurer2-tab.${`${tabType}-type`}`,
            updateEnumValues, {
                bodySelector: 'multi-enum-dialog-editor-tmpl',
                dialogTitle: 'profiles-multi-enum-editor',
                actionButtonTitle: 'common-save',
                initBody: (body) => {
                    const addedValuesArea = qee(body, '.new-enum-values');
                    const removedValuesArea = qee(body, '.removed-enum-values');
                    const inputArea = qee(body, '.enum-value-input');
                    listen(inputArea, 'input', () => {
                        const newVals = inputArea.value.split(',').map(R.trim).filter(R.pipe(R.equals(''), R.not));
                        const addedValues = R.sort(CommonUtils.charOrdA, R.difference(newVals, inputArea.srcList));
                        addEls(clearEl(addedValuesArea), enumList2Els(addedValues));
                        const removedValues = R.sort(CommonUtils.charOrdA, R.difference(inputArea.srcList, newVals));
                        addEls(clearEl(removedValuesArea), enumList2Els(removedValues));
                    });
                }
            }
        );

        setAttr(qee(el, '.panel h3'), 'l10n-id', `profiles-${opts.panelName}`);
        setAttr(qee(el, '.alert'), 'l10n-id', `advices-empty-${tabType}-profile-structure`);
        L10n.localizeStatic(el);

        setAttr(qee(el, '.panel a'), 'panel-toggler', `${tabRoot}.profile-panel`);
        UI.initPanelTogglers(el);

        listen(qe(`${tabRoot}.create`), 'click', () => createProfileItemDialog.showDlg());
        exports.content = el;
    };

    exports.refresh = () => {
        refreshPanel(tabType, profilePanel);
    };

    function refreshPanel(type, root) {
        Promise.all([
            DBMS.getProfileStructure({type}),
            PermissionInformer.isAdmin()
        ]).then(results => {
            const [allProfileSettings, isAdmin] = results;
            hideEl(queryEl(`${tabRoot} .alert`), allProfileSettings.length !== 0);
            hideEl(queryEl(`${tabRoot} table`), allProfileSettings.length === 0);

            const arr = allProfileSettings.map(R.compose(strFormat(getL10n('common-set-item-before')), R.append(R.__, []), R.prop('name')));
            arr.push(getL10n('common-set-item-as-last'));

            const positionSelectors = [queryEl(`${tabRoot} .create-entity-position-select`),
                queryEl(`${tabRoot} .move-entity-position-select`)];
            positionSelectors.map(clearEl).map(fillSelector(R.__, arr2Select(arr))).map(setProp(R.__, 'selectedIndex', allProfileSettings.length));

            const table = clearEl(queryEl(`${root}.profile-config-container`));

            try {
                addEls(table, allProfileSettings.map(getInput(type)));
            } catch (err1) {
                Utils.handleError(err1); return;
            }
            Utils.enable(exports.content, 'adminOnly', isAdmin);
        }).catch(Utils.handleError);
    }

    function createProfileItem(dialog) {
        return () => {
            const input = qee(dialog, '.create-entity-name-input');
            const name = input.value.trim();
            const itemType = qee(dialog, '.create-entity-type-select').value.trim();
            const { selectedIndex } = qee(dialog, '.create-entity-position-select');

            DBMS.createProfileItem({type: tabType, name, itemType, selectedIndex}).then(() => {
                input.value = '';
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    // eslint-disable-next-line no-var,vars-on-top
    var fillItemTypesSel = sel => fillSelector(sel, constArr2Select(R.keys(Constants.profileFieldTypes)));
    const fillPlayerAccessSel = sel => fillSelector(sel, constArr2Select(Constants.playerAccessTypes));

    // eslint-disable-next-line no-var,vars-on-top
    var getInput = R.curry((type, profileSettings, index) => { // throws InternalError
        const row = qte(`${tabRoot} .profile-configurer-row-tmpl`);
        L10n.localizeStatic(row);
        addEl(qee(row, '.item-position'), makeText(index + 1));
        addEl(qee(row, '.item-name'), makeText(profileSettings.name));

        const itemType = qee(row, '.item-type');
        fillItemTypesSel(itemType);
        itemType.value = profileSettings.type;
        itemType.info = profileSettings.name;
        itemType.oldType = profileSettings.type;
        listen(itemType, 'change', changeProfileItemType(type));

        let input, addDefaultListener = true;
        switch (profileSettings.type) {
        case 'text':
            input = makeEl('textarea');
            addClass(input, 'hidden');
            input.value = profileSettings.value;
            break;
        case 'enum':
            input = qmte(`${tabRoot} .enum-value-editor-tmpl`);
            const list = profileSettings.value.split(',');
            const defaultValue = list[0];
            list.sort(CommonUtils.charOrdA);

            addEls(qee(input, '.text'), enumList2Els(list, defaultValue));

            listen(qee(input, '.btn.add'), 'click', () => {
                addEls(clearEl(qee(state.enumEditorDialog, '.initial-value')), enumList2Els(list, defaultValue));
                const inputArea = qee(state.enumEditorDialog, '.enum-value-input');
                inputArea.value = list.join(',');
                inputArea.srcList = list;
                inputArea.defaultValue = defaultValue;

                const defaultValueSelect = clearEl(qee(state.enumEditorDialog, '.default-value-select'));
                fillSelector(defaultValueSelect, arr2Select(list));
                qee(defaultValueSelect, `[value="${defaultValue}"]`).selected = true;
                state.enumEditorDialog.itemName = profileSettings.name;
                state.enumEditorDialog.showDlg();
            });

            listen(qee(input, '.btn.rename'), 'click', () => {
                const renameSelect = clearEl(qee(state.renameEnumItemDialog, '.renamed-value-select'));
                fillSelector(renameSelect, arr2Select(list));

                if(list.length > 0){
                    qee(state.renameEnumItemDialog, '.enum-value-name-input').value = list[0];
                }

                state.renameEnumItemDialog.itemName = profileSettings.name;
                state.renameEnumItemDialog.showDlg();
            });

            L10n.localizeStatic(input);
            addDefaultListener = false;
            break;
        case 'multiEnum':
            input = qmte(`${tabRoot} .enum-value-editor-tmpl`);
            const list2 = profileSettings.value.split(',');
            list2.sort(CommonUtils.charOrdA);

            addEls(qee(input, '.text'), enumList2Els(list2));

            listen(qee(input, '.btn.add'), 'click', () => {
                addEls(clearEl(qee(state.multiEnumEditorDialog, '.initial-value')), enumList2Els(list2));
                const inputArea = qee(state.multiEnumEditorDialog, '.enum-value-input');
                inputArea.value = list2.join(',');
                inputArea.srcList = list2;
                state.multiEnumEditorDialog.itemName = profileSettings.name;
                state.multiEnumEditorDialog.showDlg();
            });

            listen(qee(input, '.btn.rename'), 'click', () => {
                const renameSelect = clearEl(qee(state.renameEnumItemDialog, '.renamed-value-select'));
                fillSelector(renameSelect, arr2Select(list2));

                if(list2.length > 0){
                    qee(state.renameEnumItemDialog, '.enum-value-name-input').value = list2[0];
                }

                state.renameEnumItemDialog.itemName = profileSettings.name;
                state.renameEnumItemDialog.showDlg();
            });

            L10n.localizeStatic(input);
            addDefaultListener = false;
            break;
        case 'string':
            input = makeEl('input');
            addClass(input, 'hidden');
            input.value = profileSettings.value;
            break;
        case 'number':
            input = makeEl('input');
            input.type = 'number';
            addClass(input, 'hidden');
            input.value = profileSettings.value;
            break;
        case 'checkbox':
            input = makeEl('input');
            setAttr(input, 'title', l10n('default-value'));
            input.type = 'checkbox';
            input.checked = profileSettings.value;
            break;
        default:
            throw new Errors.InternalError('errors-unexpected-switch-argument', [profileSettings.type]);
        }

        setProps(input, {
            info: profileSettings.name,
            infoType: profileSettings.type,
            oldValue: profileSettings.value
        });
        if(addDefaultListener){
            addClasses(input, [`profile-configurer-${profileSettings.type}`, 'adminOnly', 'form-control']);
            listen(input, 'change', updateDefaultValue(type));
        }
        addEl(qee(row, '.item-default-value-container'), input);

        setClassIf(qee(row, '.print'), 'btn-primary', profileSettings.doExport);
        listen(qee(row, '.print'), 'click', (e) => {
            DBMS.doExportProfileItemChange({
                type,
                profileItemName: profileSettings.name,
                checked: !hasClass(e.target, 'btn-primary')
            }).then(() => {
                toggleClass(e.target, 'btn-primary');
            }).catch(Utils.handleError);
        });

        const playerAccess = qee(row, '.player-access');
        fillPlayerAccessSel(playerAccess);
        playerAccess.value = profileSettings.playerAccess;
        playerAccess.info = profileSettings.name;
        playerAccess.oldValue = profileSettings.playerAccess;
        listen(playerAccess, 'change', changeProfileItemPlayerAccess(type));

        const showInRoleGrid = qee(row, '.show-in-role-grid');
        showInRoleGrid.checked = profileSettings.showInRoleGrid;
        showInRoleGrid.info = profileSettings.name;
        listen(showInRoleGrid, 'change', showInRoleGridChange(type));

        listen(qee(row, '.move'), 'click', () => {
            state.currentIndex = index;
            state.moveProfileItemDialog.showDlg();
        });

        listen(qee(row, '.rename-profile-item'), 'click', () => {
            qee(state.renameProfileItemDialog, '.entity-input').value = profileSettings.name;
            state.renameProfileItemDialog.fromName = profileSettings.name;
            state.renameProfileItemDialog.showDlg();
        });

        listen(qee(row, '.remove'), 'click', () => {
            Utils.confirm(L10n.format('profiles', 'are-you-sure-about-removing-profile-item', [profileSettings.name]), () => {
                DBMS.removeProfileItem({
                    type,
                    index,
                    profileItemName: profileSettings.name
                }).then(exports.refresh, Utils.handleError);
            });
        });

        return row;
    });

    function enumList2Els(list, defaultValue){
        return R.splitEvery(4, list.map(val => {
            const span = addEl(makeEl('span'), makeText(val));
            if(defaultValue !== undefined && val === defaultValue){
                addClass(span, 'bold');
                setAttr(span, 'title', l10n('default-value'));
            }
            addClass(span, 'margin-right-16 enum-item');
            return span;
        })).map(arr => addEls(makeEl('div'), arr));
    }

    function updateDefaultValue(type) {
        return (event) => {
            const name = event.target.info;
            const itemType = event.target.infoType;
            const { oldValue } = event.target;

            const value = itemType === 'checkbox' ? event.target.checked : event.target.value;

            let newOptions, missedValues, newValue, updateEnum;

            switch (itemType) {
            case 'text':
            case 'string':
            case 'checkbox':
                DBMS.updateDefaultValue({
                    type,
                    profileItemName: name,
                    value
                }).catch(Utils.handleError);
                break;
            case 'number':
                if (Number.isNaN(value)) {
                    Utils.alert(getL10n('profiles-not-a-number'));
                    event.target.value = oldValue;
                    return;
                }
                DBMS.updateDefaultValue({
                    type,
                    profileItemName: name,
                    value: Number(value)
                }).catch(Utils.handleError);
                break;
            case 'multiEnum':
            case 'enum':
                if (value === '' && itemType === 'enum') {
                    Utils.alert(getL10n('profiles-enum-item-cant-be-empty'));
                    event.target.value = oldValue;
                    return;
                }
                newOptions = value.split(',').map(R.trim);
                missedValues = oldValue.trim() === '' ? [] : R.difference(oldValue.split(','), newOptions);

                updateEnum = () => {
                    newValue = newOptions.join(',');
                    event.target.value = newValue;
                    event.target.oldValue = newValue;

                    DBMS.updateDefaultValue({
                        type,
                        profileItemName: name,
                        value: newValue
                    }).catch(Utils.handleError);
                };

                if (missedValues.length !== 0) {
                    Utils.confirm(strFormat(getL10n('profiles-new-enum-values-remove-some-old-values'), [missedValues.join(',')]), updateEnum, () => {
                        event.target.value = oldValue;
                    });
                } else {
                    updateEnum();
                }
                break;
            default:
                Utils.handleError(new Errors.InternalError('errors-unexpected-switch-argument', [itemType]));
            }
        };
    }

    function showInRoleGridChange(type) {
        return (event) => {
            DBMS.showInRoleGridProfileItemChange({
                type,
                profileItemName: event.target.info,
                checked: event.target.checked
            }).catch(Utils.handleError);
        };
    }

    function renameProfileItem(dialog) {
        return () => {
            const toInput = qee(dialog, '.entity-input');
            const oldName = dialog.fromName;
            const newName = toInput.value.trim();

            DBMS.renameProfileItem({
                type: tabType,
                newName,
                oldName
            }).then(() => {
                toInput.value = '';
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => setError(dialog, err));
        };
    }

    function moveProfileItem(dialog) {
        return () => {
            const index = state.currentIndex;
            const newIndex = queryEl(`${tabRoot}.move-entity-position-select`).selectedIndex;
            DBMS.moveProfileItem({
                type: tabType,
                index,
                newIndex
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }, err => setError(dialog, err));
        };
    }

    function updateEnumValues(dialog) {
        return () => {
            const name = dialog.itemName;
            const inputArea = qee(dialog, '.enum-value-input');
            const defaultValueSelect = qee(dialog, '.default-value-select');

            if (inputArea.value.trim() === '') {
                Utils.alert(getL10n('profiles-enum-item-cant-be-empty'));
                return;
            }
            let newVals = inputArea.value.split(',').map(R.trim).filter(R.pipe(R.equals(''), R.not));
            if(defaultValueSelect){
                const defaultValue = defaultValueSelect.value;
                newVals = R.without([defaultValue], newVals);
                newVals = R.prepend(defaultValue, newVals);
            }

            DBMS.updateDefaultValue({
                type: tabType,
                profileItemName: name,
                value: newVals.join(',')
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }, err => setError(dialog, err));
        };
    }

    function renameEnumValue(dialog) {
        return () => {
            const name = dialog.itemName;
            const renameSelect = qee(dialog, '.renamed-value-select');
            const renameInput = qee(dialog, '.enum-value-name-input');

            DBMS.renameEnumValue({
                type: tabType,
                profileItemName: name,
                fromValue: renameSelect.value.trim(),
                toValue: renameInput.value.trim()
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }, err => setError(dialog, err));
        };
    }

    function changeProfileItemType(type) {
        return (event) => {
            Utils.confirm(strFormat(getL10n('profiles-are-you-sure-about-changing-profile-item-type'), [event.target.info]), () => {
                const newType = event.target.value;
                const name = event.target.info;
                DBMS.changeProfileItemType({
                    type,
                    profileItemName: name,
                    newType
                }).then(exports.refresh, Utils.handleError);
            }, () => {
                event.target.value = event.target.oldType;
            });
        };
    }

    function changeProfileItemPlayerAccess(type) {
        return (event) => {
            const playerAccessType = event.target.value;
            const name = event.target.info;
            DBMS.changeProfileItemPlayerAccess({
                type,
                profileItemName: name,
                playerAccessType
            }).catch((err) => {
                event.target.value = event.target.oldValue;
                Utils.processError()(err);
            });
        };
    }
}

ProfileConfigurerTmpl(this.CharacterConfigurer = {}, {
    tabType: 'character',
    panelName: 'characters-profile-structure',
});

ProfileConfigurerTmpl(this.PlayerConfigurer = {}, {
    tabType: 'player',
    panelName: 'players-profile-structure',
});
