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
    const tabRoot = `.profile-configurer2-tab.${tabType + '-type'} `;
    const profilePanel = `${tabRoot}.profile-panel `;

    exports.init = () => {
        const el = queryEl(tmplRoot).cloneNode(true);
        
        addClasses(el, ['profile-configurer2-tab', `${tabType + '-type'}`]);
        removeClass(el, 'profile-configurer2-tab-tmpl');
        addEl(queryEl('.tab-container'), el);
        
        setAttr(qee(el, '.panel h3'), 'l10n-id', 'profiles-' + opts.panelName);
        L10n.localizeStatic(el);
        
        setAttr(qee(el,'.panel a') , 'panel-toggler', tabRoot + ".profile-panel");
        UI.initPanelTogglers(el);
        
        const sel = clearEl(qee(el, `${profilePanel}.create-entity-type-select`));
        const fillMainSel = () => { fillItemTypesSel(clearEl(sel)); };
        fillMainSel();
        L10n.onL10nChange(fillMainSel);

        listen(qee(el, `${profilePanel}.create-entity-button`), 'click', createProfileItem(tabType, profilePanel));
        listen(qee(el, `${profilePanel}.move-entity-button`), 'click', moveProfileItem(tabType, profilePanel));
        listen(qee(el, `${profilePanel}.remove-entity-button`), 'click', removeProfileItem(tabType, profilePanel));

        exports.content = el;
    };

    exports.refresh = () => {
        refreshPanel(tabType, profilePanel);
    };

    function refreshPanel(type, root) {
        DBMS.getProfileStructure(type, (err, allProfileSettings) => {
            if (err) { Utils.handleError(err); return; }

            const arr = allProfileSettings.map(R.compose(strFormat(getL10n('common-set-item-before')), R.append(R.__, []), R.prop('name')));
            arr.push(getL10n('common-set-item-as-last'));
            const positionSelectors = [queryEl(`${root}.create-entity-position-select`),
                queryEl(`${root}.move-entity-position-select`)];
            positionSelectors.map(clearEl).map(fillSelector(R.__, arr2Select(arr))).map(setProp(R.__, 'selectedIndex', allProfileSettings.length));

            const table = clearEl(queryEl(`${root}.profile-config-container`));

            try {
                addEls(table, allProfileSettings.map(getInput(type)));
            } catch (err1) {
                Utils.handleError(err1); return;
            }

            PermissionInformer.isAdmin((err2, isAdmin) => {
                if (err2) { Utils.handleError(err2); return; }
                Utils.enable(exports.content, 'adminOnly', isAdmin);
            });

            const selectorArr = [queryEl(`${root}.move-entity-select`), queryEl(`${root}.remove-entity-select`)];
            selectorArr.map(clearEl).map(fillSelector(R.__, arr2Select(allProfileSettings.map(R.prop('name')))));
        });
    }

    function createProfileItem(type, root) {
        return () => {
            const input = queryEl(`${root}.create-entity-input`);
            const name = input.value.trim();
            const itemType = queryEl(`${root}.create-entity-type-select`).value.trim();
            const positionSelector = queryEl(`${root}.create-entity-position-select`);

            DBMS.createProfileItem(type, name, itemType, positionSelector.selectedIndex, Utils.processError(() => {
                input.value = '';
                exports.refresh();
            }));
        };
    }

    function moveProfileItem(type, root) {
        return () => {
            const { index } = queryEl(`${root}.move-entity-select`).selectedOptions[0];
            const newIndex = queryEl(`${root}.move-entity-position-select`).selectedIndex;
            DBMS.moveProfileItem(type, index, newIndex, Utils.processError(exports.refresh));
        };
    }

    function removeProfileItem(type, root) {
        return () => {
            const selector = queryEl(`${root}.remove-entity-select`);
            const index = selector.selectedIndex;
            const name = selector.value;

            Utils.confirm(strFormat(getL10n('profiles-are-you-sure-about-removing-profile-item'), [name]), () => {
                DBMS.removeProfileItem(type, index, name, Utils.processError(exports.refresh));
            });
        };
    }

    // eslint-disable-next-line no-var,vars-on-top
    var fillItemTypesSel = sel => fillSelector(sel, constArr2Select(R.keys(Constants.profileFieldTypes)));
    const fillPlayerAccessSel = sel => fillSelector(sel, constArr2Select(Constants.playerAccessTypes));

    // eslint-disable-next-line no-var,vars-on-top
    var getInput = R.curry((type, profileSettings, index) => { // throws InternalError
        index++;
        const els = [];

        els.push(addEl(makeEl('span'), makeText(index)));

        let input = setProps(makeEl('input'), {
            value: profileSettings.name,
            info: profileSettings.name
        });
        listen(input, 'change', renameProfileItem(type));
        addClass(input, 'itemNameInput');
        els.push(input);

        let sel = makeEl('select');
        fillItemTypesSel(sel);
        setProps(sel, {
            value: profileSettings.type,
            info: profileSettings.name,
            oldType: profileSettings.type
        });
        listen(sel, 'change', changeProfileItemType(type));
        els.push(sel);

        switch (profileSettings.type) {
        case 'text':
        case 'enum':
        case 'multiEnum':
            input = makeEl('textarea');
            input.value = profileSettings.value;
            break;
        case 'string':
            input = makeEl('input');
            input.value = profileSettings.value;
            break;
        case 'number':
            input = makeEl('input');
            input.type = 'number';
            input.value = profileSettings.value;
            break;
        case 'checkbox':
            input = makeEl('input');
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
        addClass(input, `profile-configurer-${profileSettings.type}`);
        listen(input, 'change', updateDefaultValue(type));
        els.push(input);

        input = setProps(makeEl('input'), {
            checked: profileSettings.doExport,
            info: profileSettings.name,
            type: 'checkbox'
        });
        listen(input, 'change', doExportChange(type));
        els.push(input);

        sel = makeEl('select');
        fillPlayerAccessSel(sel);
        setProps(sel, {
            value: profileSettings.playerAccess,
            info: profileSettings.name,
            oldValue: profileSettings.playerAccess,
        });
        listen(sel, 'change', changeProfileItemPlayerAccess(type));
        els.push(sel);

        input = setProps(makeEl('input'), {
            checked: profileSettings.showInRoleGrid,
            info: profileSettings.name,
            type: 'checkbox'
        });
        listen(input, 'change', showInRoleGridChange(type));
        els.push(input);

        return addEls(makeEl('tr'), els.map(el => addEl(makeEl('td'), addClass(el, 'adminOnly'))));
    });

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
                DBMS.updateDefaultValue(type, name, value, Utils.processError());
                break;
            case 'number':
                if (Number.isNaN(value)) {
                    Utils.alert(getL10n('profiles-not-a-number'));
                    event.target.value = oldValue;
                    return;
                }
                DBMS.updateDefaultValue(type, name, Number(value), Utils.processError());
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
                    DBMS.updateDefaultValue(type, name, newValue, Utils.processError());
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

    function doExportChange(type) {
        return (event) => {
            DBMS.doExportProfileItemChange(type, event.target.info, event.target.checked, Utils.processError());
        };
    }

    function showInRoleGridChange(type) {
        return (event) => {
            DBMS.showInRoleGridProfileItemChange(type, event.target.info, event.target.checked, Utils.processError());
        };
    }

    function renameProfileItem(type) {
        return (event) => {
            const newName = event.target.value.trim();
            const oldName = event.target.info;

            DBMS.renameProfileItem(type, newName, oldName, (err) => {
                if (err) {
                    event.target.value = event.target.info;
                    Utils.handleError(err);
                    return;
                }
                exports.refresh();
            });
        };
    }

    function changeProfileItemType(type) {
        return (event) => {
            Utils.confirm(strFormat(getL10n('profiles-are-you-sure-about-changing-profile-item-type'), [event.target.info]), () => {
                const newType = event.target.value;
                const name = event.target.info;
                DBMS.changeProfileItemType(type, name, newType, Utils.processError(exports.refresh));
            }, () => {
                event.target.value = event.target.oldType;
            });
        };
    }

    function changeProfileItemPlayerAccess(type) {
        return (event) => {
            const playerAccessType = event.target.value;
            const name = event.target.info;
            DBMS.changeProfileItemPlayerAccess(type, name, playerAccessType, (err) => {
                if (err) {
                    event.target.value = event.target.oldValue;
                    Utils.processError()(err);
                }
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
