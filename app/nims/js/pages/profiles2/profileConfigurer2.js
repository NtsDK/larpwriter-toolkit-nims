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

const Constants = require('common/constants');
const PermissionInformer = require('permissionInformer');
const R = require('ramda');


// Character/Player profiles already have field 'name'
// I had some choices:
// 1. remove this field at all
// 2. Add one more object to divide special values (name) and user defined values
// 3. Prohibit to make field - name
// 1. This field is used in many places
// 2. - too complex way
// 3. simple and lesser complexity, I choose this way

function ProfileConfigurerTmpl(opts) {
    const exports = {};
    const { tabType } = opts;

    const tmplRoot = '.profile-configurer2-tab-tmpl';
    const tabRoot = `.profile-configurer2-tab.${`${tabType}-type`} `;
    const profilePanel = `${tabRoot}.profile-panel `;
    const l10n = L10n.get('profiles');
    const state = {};

    exports.init = () => {
        const el = U.queryEl(tmplRoot).cloneNode(true);

        U.addClasses(el, ['profile-configurer2-tab', `${`${tabType}-type`}`]);
        U.removeClass(el, 'profile-configurer2-tab-tmpl');
        U.addEl(U.queryEl('.tab-container'), el);

        const createProfileItemDialog = UI.createModalDialog(
            `.profile-configurer2-tab.${`${tabType}-type`}`,
            createProfileItem, {
                bodySelector: 'create-profile-item-body',
                dialogTitle: 'profiles-create-profile-item',
                actionButtonTitle: 'common-create',
                initBody: (body) => {
                    const sel = U.clearEl(U.qee(body, '.create-entity-type-select'));
                    const fillMainSel = () => { fillItemTypesSel(U.clearEl(sel)); };
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
                    const renameSelect = U.clearEl(U.qee(body, '.renamed-value-select'));
                    const renameInput = U.clearEl(U.qee(body, '.enum-value-name-input'));
                    U.listen(renameSelect, 'change', () => {
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
                    const addedValuesArea = U.qee(body, '.new-enum-values');
                    const removedValuesArea = U.qee(body, '.removed-enum-values');
                    const inputArea = U.qee(body, '.enum-value-input');
                    const defaultValueSelect = U.qee(body, '.default-value-select');
                    U.listen(inputArea, 'input', () => {
                        const newVals = inputArea.value.split(',').map(R.trim).filter(R.pipe(R.equals(''), R.not));
                        const addedValues = R.sort(CU.charOrdA, R.difference(newVals, inputArea.srcList));
                        U.addEls(U.clearEl(addedValuesArea), enumList2Els(addedValues));
                        const removedValues = R.sort(CU.charOrdA, R.difference(inputArea.srcList, newVals));
                        U.addEls(U.clearEl(removedValuesArea), enumList2Els(removedValues));

                        let defaultValue = defaultValueSelect.value;
                        U.clearEl(defaultValueSelect);

                        if (newVals.length === 0) {
                            return;
                        }

                        if (!R.contains(defaultValue, newVals)) {
                            defaultValue = newVals[0];
                        }
                        U.fillSelector(defaultValueSelect, U.arr2Select(newVals));
                        U.qee(defaultValueSelect, `[value="${defaultValue}"]`).selected = true;
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
                    const addedValuesArea = U.qee(body, '.new-enum-values');
                    const removedValuesArea = U.qee(body, '.removed-enum-values');
                    const inputArea = U.qee(body, '.enum-value-input');
                    U.listen(inputArea, 'input', () => {
                        const newVals = inputArea.value.split(',').map(R.trim).filter(R.pipe(R.equals(''), R.not));
                        const addedValues = R.sort(CU.charOrdA, R.difference(newVals, inputArea.srcList));
                        U.addEls(U.clearEl(addedValuesArea), enumList2Els(addedValues));
                        const removedValues = R.sort(CU.charOrdA, R.difference(inputArea.srcList, newVals));
                        U.addEls(U.clearEl(removedValuesArea), enumList2Els(removedValues));
                    });
                }
            }
        );

        U.setAttr(U.qee(el, '.panel h3'), 'l10n-id', `profiles-${opts.panelName}`);
        U.setAttr(U.qee(el, '.alert'), 'l10n-id', `advices-empty-${tabType}-profile-structure`);
        L10n.localizeStatic(el);

        U.setAttr(U.qee(el, '.panel a'), 'panel-toggler', `${tabRoot}.profile-panel`);
        UI.initPanelTogglers(el);

        U.listen(U.qe(`${tabRoot}.create`), 'click', () => createProfileItemDialog.showDlg());
        exports.content = el;
    };

    exports.refresh = () => {
        refreshPanel(tabType, profilePanel);
    };

    function refreshPanel(type, root) {
        Promise.all([
            DBMS.getProfileStructure({ type }),
            PermissionInformer.isAdmin()
        ]).then((results) => {
            const [allProfileSettings, isAdmin] = results;
            U.hideEl(U.queryEl(`${tabRoot} .alert`), allProfileSettings.length !== 0);
            U.hideEl(U.queryEl(`${tabRoot} table`), allProfileSettings.length === 0);

            const arr = allProfileSettings.map(R.compose(CU.strFormat(L10n.getValue('common-set-item-before')), R.append(R.__, []), R.prop('name')));
            arr.push(L10n.getValue('common-set-item-as-last'));

            const positionSelectors = [U.queryEl(`${tabRoot} .create-entity-position-select`),
                U.queryEl(`${tabRoot} .move-entity-position-select`)];
            positionSelectors.map(U.clearEl).map(U.fillSelector(R.__, U.arr2Select(arr))).map(U.setProp(R.__, 'selectedIndex', allProfileSettings.length));

            const table = U.clearEl(U.queryEl(`${root}.profile-config-container`));

            try {
                U.addEls(table, allProfileSettings.map(getInput(type)));
            } catch (err1) {
                UI.handleError(err1); return;
            }
            UI.enable(exports.content, 'adminOnly', isAdmin);
        }).catch(UI.handleError);
    }

    function createProfileItem(dialog) {
        return () => {
            const input = U.qee(dialog, '.create-entity-name-input');
            const name = input.value.trim();
            const itemType = U.qee(dialog, '.create-entity-type-select').value.trim();
            const { selectedIndex } = U.qee(dialog, '.create-entity-position-select');

            DBMS.createProfileItem({
                type: tabType, name, itemType, selectedIndex
            }).then(() => {
                input.value = '';
                dialog.hideDlg();
                exports.refresh();
            }).catch(err => UI.setError(dialog, err));
        };
    }

    // eslint-disable-next-line no-var,vars-on-top
    var fillItemTypesSel = sel => U.fillSelector(sel, UI.constArr2Select(R.keys(Constants.profileFieldTypes)));
    const fillPlayerAccessSel = sel => U.fillSelector(sel, UI.constArr2Select(Constants.playerAccessTypes));

    // eslint-disable-next-line no-var,vars-on-top
    var getInput = R.curry((type, profileSettings, index) => { // throws InternalError
        const row = U.qte(`${tabRoot} .profile-configurer-row-tmpl`);
        L10n.localizeStatic(row);
        U.addEl(U.qee(row, '.item-position'), U.makeText(index + 1));
        U.addEl(U.qee(row, '.item-name'), U.makeText(profileSettings.name));

        const itemType = U.qee(row, '.item-type');
        fillItemTypesSel(itemType);
        itemType.value = profileSettings.type;
        itemType.info = profileSettings.name;
        itemType.oldType = profileSettings.type;
        U.listen(itemType, 'change', changeProfileItemType(type));

        let input, addDefaultListener = true, list, defaultValue, list2;
        switch (profileSettings.type) {
        case 'text':
            input = U.makeEl('textarea');
            U.addClass(input, 'hidden');
            input.value = profileSettings.value;
            break;
        case 'enum':
            input = U.qmte(`${tabRoot} .enum-value-editor-tmpl`);
            list = profileSettings.value.split(',');
            defaultValue = list[0];
            list.sort(CU.charOrdA);

            U.addEls(U.qee(input, '.text'), enumList2Els(list, defaultValue));

            U.listen(U.qee(input, '.btn.add'), 'click', () => {
                U.addEls(U.clearEl(U.qee(state.enumEditorDialog, '.initial-value')), enumList2Els(list, defaultValue));
                const inputArea = U.qee(state.enumEditorDialog, '.enum-value-input');
                inputArea.value = list.join(',');
                inputArea.srcList = list;
                inputArea.defaultValue = defaultValue;

                const defaultValueSelect = U.clearEl(U.qee(state.enumEditorDialog, '.default-value-select'));
                U.fillSelector(defaultValueSelect, U.arr2Select(list));
                U.qee(defaultValueSelect, `[value="${defaultValue}"]`).selected = true;
                state.enumEditorDialog.itemName = profileSettings.name;
                state.enumEditorDialog.showDlg();
            });

            U.listen(U.qee(input, '.btn.rename'), 'click', () => {
                const renameSelect = U.clearEl(U.qee(state.renameEnumItemDialog, '.renamed-value-select'));
                U.fillSelector(renameSelect, U.arr2Select(list));

                if (list.length > 0) {
                    U.qee(state.renameEnumItemDialog, '.enum-value-name-input').value = list[0];
                }

                state.renameEnumItemDialog.itemName = profileSettings.name;
                state.renameEnumItemDialog.showDlg();
            });

            L10n.localizeStatic(input);
            addDefaultListener = false;
            break;
        case 'multiEnum':
            input = U.qmte(`${tabRoot} .enum-value-editor-tmpl`);
            list2 = profileSettings.value.split(',');
            list2.sort(CU.charOrdA);

            U.addEls(U.qee(input, '.text'), enumList2Els(list2));

            U.listen(U.qee(input, '.btn.add'), 'click', () => {
                U.addEls(U.clearEl(U.qee(state.multiEnumEditorDialog, '.initial-value')), enumList2Els(list2));
                const inputArea = U.qee(state.multiEnumEditorDialog, '.enum-value-input');
                inputArea.value = list2.join(',');
                inputArea.srcList = list2;
                state.multiEnumEditorDialog.itemName = profileSettings.name;
                state.multiEnumEditorDialog.showDlg();
            });

            U.listen(U.qee(input, '.btn.rename'), 'click', () => {
                const renameSelect = U.clearEl(U.qee(state.renameEnumItemDialog, '.renamed-value-select'));
                U.fillSelector(renameSelect, U.arr2Select(list2));

                if (list2.length > 0) {
                    U.qee(state.renameEnumItemDialog, '.enum-value-name-input').value = list2[0];
                }

                state.renameEnumItemDialog.itemName = profileSettings.name;
                state.renameEnumItemDialog.showDlg();
            });

            L10n.localizeStatic(input);
            addDefaultListener = false;
            break;
        case 'string':
            input = U.makeEl('input');
            U.addClass(input, 'hidden');
            input.value = profileSettings.value;
            break;
        case 'number':
            input = U.makeEl('input');
            input.type = 'number';
            U.addClass(input, 'hidden');
            input.value = profileSettings.value;
            break;
        case 'checkbox':
            input = U.makeEl('input');
            U.setAttr(input, 'title', l10n('default-value'));
            input.type = 'checkbox';
            input.checked = profileSettings.value;
            break;
        default:
            throw new Errors.InternalError('errors-unexpected-switch-argument', [profileSettings.type]);
        }

        U.setProps(input, {
            info: profileSettings.name,
            infoType: profileSettings.type,
            oldValue: profileSettings.value
        });
        if (addDefaultListener) {
            U.addClasses(input, [`profile-configurer-${profileSettings.type}`, 'adminOnly', 'form-control']);
            U.listen(input, 'change', updateDefaultValue(type));
        }
        U.addEl(U.qee(row, '.item-default-value-container'), input);

        U.setClassIf(U.qee(row, '.print'), 'btn-primary', profileSettings.doExport);
        U.listen(U.qee(row, '.print'), 'click', (e) => {
            DBMS.doExportProfileItemChange({
                type,
                profileItemName: profileSettings.name,
                checked: !U.hasClass(e.target, 'btn-primary')
            }).then(() => {
                U.toggleClass(e.target, 'btn-primary');
            }).catch(UI.handleError);
        });

        const playerAccess = U.qee(row, '.player-access');
        fillPlayerAccessSel(playerAccess);
        playerAccess.value = profileSettings.playerAccess;
        playerAccess.info = profileSettings.name;
        playerAccess.oldValue = profileSettings.playerAccess;
        U.listen(playerAccess, 'change', changeProfileItemPlayerAccess(type));

        const showInRoleGrid = U.qee(row, '.show-in-role-grid');
        showInRoleGrid.checked = profileSettings.showInRoleGrid;
        showInRoleGrid.info = profileSettings.name;
        U.listen(showInRoleGrid, 'change', showInRoleGridChange(type));

        U.listen(U.qee(row, '.move'), 'click', () => {
            state.currentIndex = index;
            state.moveProfileItemDialog.showDlg();
        });

        U.listen(U.qee(row, '.rename-profile-item'), 'click', () => {
            U.qee(state.renameProfileItemDialog, '.entity-input').value = profileSettings.name;
            state.renameProfileItemDialog.fromName = profileSettings.name;
            state.renameProfileItemDialog.showDlg();
        });

        U.listen(U.qee(row, '.remove'), 'click', () => {
            UI.confirm(L10n.format('profiles', 'are-you-sure-about-removing-profile-item', [profileSettings.name]), () => {
                DBMS.removeProfileItem({
                    type,
                    index,
                    profileItemName: profileSettings.name
                }).then(exports.refresh, UI.handleError);
            });
        });

        return row;
    });

    function enumList2Els(list, defaultValue) {
        return R.splitEvery(4, list.map((val) => {
            const span = U.addEl(U.makeEl('span'), U.makeText(val));
            if (defaultValue !== undefined && val === defaultValue) {
                U.addClass(span, 'bold');
                U.setAttr(span, 'title', l10n('default-value'));
            }
            U.addClass(span, 'margin-right-16 enum-item');
            return span;
        })).map(arr => U.addEls(U.makeEl('div'), arr));
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
                }).catch(UI.handleError);
                break;
            case 'number':
                if (Number.isNaN(value)) {
                    UI.alert(L10n.getValue('profiles-not-a-number'));
                    event.target.value = oldValue;
                    return;
                }
                DBMS.updateDefaultValue({
                    type,
                    profileItemName: name,
                    value: Number(value)
                }).catch(UI.handleError);
                break;
            case 'multiEnum':
            case 'enum':
                if (value === '' && itemType === 'enum') {
                    UI.alert(L10n.getValue('profiles-enum-item-cant-be-empty'));
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
                    }).catch(UI.handleError);
                };

                if (missedValues.length !== 0) {
                    UI.confirm(CU.strFormat(L10n.getValue('profiles-new-enum-values-remove-some-old-values'), [missedValues.join(',')]), updateEnum, () => {
                        event.target.value = oldValue;
                    });
                } else {
                    updateEnum();
                }
                break;
            default:
                UI.handleError(new Errors.InternalError('errors-unexpected-switch-argument', [itemType]));
            }
        };
    }

    function showInRoleGridChange(type) {
        return (event) => {
            DBMS.showInRoleGridProfileItemChange({
                type,
                profileItemName: event.target.info,
                checked: event.target.checked
            }).catch(UI.handleError);
        };
    }

    function renameProfileItem(dialog) {
        return () => {
            const toInput = U.qee(dialog, '.entity-input');
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
            }).catch(err => UI.setError(dialog, err));
        };
    }

    function moveProfileItem(dialog) {
        return () => {
            const index = state.currentIndex;
            const newIndex = U.queryEl(`${tabRoot}.move-entity-position-select`).selectedIndex;
            DBMS.moveProfileItem({
                type: tabType,
                index,
                newIndex
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }, err => UI.setError(dialog, err));
        };
    }

    function updateEnumValues(dialog) {
        return () => {
            const name = dialog.itemName;
            const inputArea = U.qee(dialog, '.enum-value-input');
            const defaultValueSelect = U.qee(dialog, '.default-value-select');

            if (inputArea.value.trim() === '') {
                UI.alert(L10n.getValue('profiles-enum-item-cant-be-empty'));
                return;
            }
            let newVals = inputArea.value.split(',').map(R.trim).filter(R.pipe(R.equals(''), R.not));
            if (defaultValueSelect) {
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
            }, err => UI.setError(dialog, err));
        };
    }

    function renameEnumValue(dialog) {
        return () => {
            const name = dialog.itemName;
            const renameSelect = U.qee(dialog, '.renamed-value-select');
            const renameInput = U.qee(dialog, '.enum-value-name-input');

            DBMS.renameEnumValue({
                type: tabType,
                profileItemName: name,
                fromValue: renameSelect.value.trim(),
                toValue: renameInput.value.trim()
            }).then(() => {
                dialog.hideDlg();
                exports.refresh();
            }, err => UI.setError(dialog, err));
        };
    }

    function changeProfileItemType(type) {
        return (event) => {
            UI.confirm(CU.strFormat(L10n.getValue('profiles-are-you-sure-about-changing-profile-item-type'), [event.target.info]), () => {
                const newType = event.target.value;
                const name = event.target.info;
                DBMS.changeProfileItemType({
                    type,
                    profileItemName: name,
                    newType
                }).then(exports.refresh, UI.handleError);
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
                UI.processError()(err);
            });
        };
    }
    return exports;
}

exports.CharacterConfigurer = ProfileConfigurerTmpl({
    tabType: 'character',
    panelName: 'characters-profile-structure',
});

exports.PlayerConfigurer = ProfileConfigurerTmpl({
    tabType: 'player',
    panelName: 'players-profile-structure',
});

// ProfileConfigurerTmpl(this.CharacterConfigurer = {}, {
//     tabType: 'character',
//     panelName: 'characters-profile-structure',
// });

// ProfileConfigurerTmpl(this.PlayerConfigurer = {}, {
//     tabType: 'player',
//     panelName: 'players-profile-structure',
// });
