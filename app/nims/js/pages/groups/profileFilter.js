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
    const root = '.profile-filter-tab ';

    exports.init = () => {
        const createGroupDialog = UI.createModalDialog(root, GroupProfile.createGroup(false, exports.refresh), {
            bodySelector: 'modal-prompt-body',
            dialogTitle: 'groups-enter-group-name',
            actionButtonTitle: 'common-create',
        });

        const renameGroupDialog = UI.createModalDialog(root, renameGroup(`${root}.save-entity-select`), {
            bodySelector: 'modal-prompt-body',
            dialogTitle: 'groups-enter-new-group-name',
            actionButtonTitle: 'common-rename',
        });
        
//        state.addFilterConditionDialog = new AddFilterConditionDialog(root);
//        listen(qe(`${root}.create.filter-condition`), 'click', onAddFilterCondition);

        listen(queryEl(`${root}#profile-filter-columns .profile-item-selector`), 'change', UI.showSelectedEls3(root, 'dependent', 'dependent-index'));
        
//        Utils.enable(exports.content, 'isGroupEditable', isGroupEditable);
//        listen queryEl(`${root}.save-entity-select`)
        
        $(`${root}.save-entity-select`).select2().on('change', (event) => {
            const group = event.target.value;
            const userGroups = state.userGroupNames.map(R.prop('value'));
            const isGroupEditable = R.contains(group, userGroups);
            Utils.enable(exports.content, 'isGroupEditable', isGroupEditable);
        });

        listen(queryEl(`${root}.show-entity-button`), 'click', loadFilterFromGroup);
        listen(queryEl(`${root}.save-entity-button`), 'click', saveFilterToGroup);
        listen(queryEl(`${root}.download-filter-table`), 'click', downloadFilterTable);

        listen(qe(`${root}.create.group`), 'click', () => createGroupDialog.showDlg());
        listen(qe(`${root}.rename.group`), 'click', () => {
            qee(renameGroupDialog, '.entity-input').value = queryEl(`${root}.save-entity-select`).value;
            renameGroupDialog.showDlg();
        });
        listen(queryEl(`${root}.remove.group`), 'click', GroupProfile.removeGroup(() => 
            queryEl(`${root}.save-entity-select`).value, exports.refresh));

        exports.content = queryEl(root);
    };
    
    exports.refresh = () => {
        state.sortKey = Constants.CHAR_NAME;
        state.sortDir = 'asc';
        state.inputItems = {};
        state.checkboxes = {};
        state.curFilterModel = [];

        const filterSettingsDiv = clearEl(queryEl(`${root}.filter-settings-panel`));
        addEl(filterSettingsDiv, addClass(makeEl('div'), 'separator'));

        groupAreaRefresh();

        FilterConfiguration.makeFilterConfiguration((err, filterConfiguration) => {
            if (err) { Utils.handleError(err); return; }

            state.filterConfiguration = filterConfiguration;
            
            showEl(qe(`${root} .alert.no-characters`), !filterConfiguration.haveProfiles());
            showEl(qe(`${root} .alert.no-players`), !filterConfiguration.haveProfiles());
            showEl(qe(`${root} .alert.no-character-profile`), !filterConfiguration.haveProfileStructures());
            showEl(qe(`${root} .alert.no-player-profile`), !filterConfiguration.haveProfileStructures());
            showEl(qe(`${root} .profile-filter-container .panel`), filterConfiguration.haveData());
            
            const groupedProfileFilterItems = filterConfiguration.getGroupedProfileFilterItems();
            addEls(filterSettingsDiv, R.flatten(groupedProfileFilterItems.map(item => R.concat(item.profileFilterItems.map(makeInput), [addClass(makeEl('div'), 'filterSeparator')]))));

            UI.fillShowItemSelector2(
                clearEl(queryEl(`${root}#profile-filter-columns .profile-item-selector`)),
                filterConfiguration.getGroupsForSelect(),
                true
            );

            addEl(
                clearEl(queryEl(`${root}.filter-head`)),
                makeContentHeader(getHeaderProfileItemNames(filterConfiguration.getProfileFilterItems()))
            );

            rebuildContent();
        });
    };
    
    function onAddFilterCondition() {
        state.addFilterConditionDialog.showDlg(state.filterConfiguration.getGroupsForSelect(), setFilterModelItem);
    }
    
    function setFilterModelItem (filterModelItem) {
        const index = R.findIndex(R.propEq('name', filterModelItem.name), state.curFilterModel);
        if(index === -1){
            state.curFilterModel.push(filterModelItem);
        } else {
            state.curFilterModel[index] = filterModelItem;
        }
    }
    
    function groupAreaRefresh() {
        PermissionInformer.getEntityNamesArray('group', true, Utils.processError((userGroupNames) => {
            PermissionInformer.getEntityNamesArray('group', false, Utils.processError((allGroupNames) => {
                
                Utils.enableEl(qe(`${root}.rename.group`), allGroupNames.length > 0);
                Utils.enableEl(qe(`${root}.remove.group`), allGroupNames.length > 0);
                Utils.enableEl(qe(`${root}.show-entity-button`), allGroupNames.length > 0);
                Utils.enableEl(qe(`${root}.save-entity-button`), allGroupNames.length > 0);
                Utils.enableEl(qe(`${root}.save-entity-select`), allGroupNames.length > 0);
                
                state.userGroupNames = userGroupNames;
                state.allGroupNames = allGroupNames;
                const data = getSelect2Data(allGroupNames);
                clearEl(queryEl(`${root}.save-entity-select`));
                $(`${root}.save-entity-select`).select2(data);
            }));
        }));
    }

    function getHeaderProfileItemNames(profileSettings) {
        return R.map(R.pick(['name', 'displayName', 'type']), profileSettings);
    }

    function makePrintData() {
        const dataArrays = state.filterConfiguration.getDataArrays(makeFilterModel());

        const sortFunc = CommonUtils.charOrdAFactoryBase(state.sortDir, (a, b) => a > b, (a) => {
            const map = CommonUtils.arr2map(a, 'itemName');
            const item = map[state.sortKey];
            let { value } = item;
            if (value === undefined) return value;
            switch (item.type) {
            case 'text':
            case 'string':
            case 'enum':
            case 'multiEnum':
                value = value.toLowerCase();
                break;
            case 'checkbox':
            case 'number':
                break;
            default:
                throw new Error(`Unexpected type ${item.type}`);
            }
            return value;
        });
        return dataArrays.sort(sortFunc);
    }

    function rebuildContent() {
        const dataArrays = makePrintData();
        addEl(clearEl(queryEl(`${root}.filter-result-size`)), makeText(dataArrays.length));
        addEls(clearEl(queryEl(`${root}.filter-content`)), dataArrays.map(makeDataString));
        UI.showSelectedEls3(root, 'dependent', 'dependent-index')({ target: queryEl(`${root}#profile-filter-columns .profile-item-selector`) });
    }

    function saveFilterToGroup() {
        const groupName = queryEl(`${root}.save-entity-select`).value;
        PermissionInformer.isEntityEditable('group', groupName, (err, isGroupEditable) => {
            if (err) { Utils.handleError(err); return; }
            if (!isGroupEditable) {
                Utils.alert(strFormat(getL10n('groups-group-editing-forbidden'), [groupName]));
                return;
            }
            DBMS.saveFilterToGroup(groupName, makeFilterModel(), Utils.processError());
        });
    }

    function loadFilterFromGroup() {
        const groupName = queryEl(`${root}.save-entity-select`).value;
        DBMS.getGroup(groupName, (err, group) => {
            if (err) { Utils.handleError(err); return; }
            const conflictTypes =
                ProjectUtils.isFilterModelCompatibleWithProfiles(
                    state.filterConfiguration.getBaseProfileSettings(),
                    group.filterModel
                );
            if (conflictTypes.length !== 0) {
                Utils.alert(strFormat(getL10n('groups-base-filter-is-incompatible-with-page-profiles'), [conflictTypes.join(',')]));
                return;
            }
            applyFilterModel(group.filterModel);
            rebuildContent();
        });
    }

    function downloadFilterTable() {
        const el = queryEl(`${root}#profile-filter-columns .profile-item-selector`);
        const selected = [];
        for (let i = 0; i < el.options.length; i += 1) {
            selected[i] = el.options[i].selected;
        }

        const dataArrays = makePrintData();
        const cleanArrays = dataArrays.map(dataArray => dataArray.filter((item, index) => selected[index]).map(R.prop('value')));

        FileUtils.arr2d2Csv(cleanArrays, 'profileFilter');
    }

    function applyFilterModel(filterModel) {
        filterModel = CommonUtils.arr2map(filterModel, 'name');

        Object.keys(state.inputItems).forEach((inputItemName) => {
            if (inputItemName.endsWith(':numberInput') || inputItemName.endsWith(':multiEnumInput')) {
                return;
            }

            const inputItem = state.inputItems[inputItemName];
            let selectedOptions, regex, num, i, counter;

            if (state.checkboxes[inputItemName].checked !== (filterModel[inputItemName] !== undefined)) {
                state.checkboxes[inputItemName].click();
            }
            if (!filterModel[inputItemName]) {
                let select;
                switch (inputItem.selfInfo.type) {
                case 'enum':
                case 'checkbox':
                    for (i = 0; i < inputItem.options.length; i += 1) {
                        inputItem.options[i].selected = true;
                    }
                    break;
                case 'number':
                    state.inputItems[`${inputItem.selfInfo.name}:numberInput`].value = 0;
                    inputItem.value = 'ignore';
                    break;
                case 'multiEnum':
                    select = state.inputItems[`${inputItem.selfInfo.name}:multiEnumInput`];
                    for (i = 0; i < select.options.length; i += 1) {
                        select.options[i].selected = true;
                    }
                    inputItem.value = 'ignore';
                    break;
                case 'text':
                case 'string':
                    inputItem.value = '';
                    break;
                default:
                    throw new Error(`Unexpected type ${inputItem.selfInfo.type}`);
                }
            } else {
                const modelItem = filterModel[inputItemName];
                let select;
                switch (inputItem.selfInfo.type) {
                case 'enum':
                    for (i = 0; i < inputItem.options.length; i += 1) {
                        inputItem.options[i].selected = !!modelItem.selectedOptions[inputItem.options[i].value];
                    }
                    break;
                case 'checkbox':
                    inputItem.options[0].selected = modelItem.selectedOptions.true;
                    inputItem.options[1].selected = modelItem.selectedOptions.false;
                    break;
                case 'number':
                    inputItem.value = modelItem.condition;
                    state.inputItems[`${inputItem.selfInfo.name}:numberInput`].value = modelItem.num;
                    break;
                case 'multiEnum':
                    inputItem.value = modelItem.condition;
                    select = state.inputItems[`${inputItem.selfInfo.name}:multiEnumInput`];
                    for (i = 0; i < select.options.length; i += 1) {
                        select.options[i].selected = !!modelItem.selectedOptions[select.options[i].value];
                    }
                    break;
                case 'text':
                case 'string':
                    inputItem.value = modelItem.regexString;
                    break;
                default:
                    throw new Error(`Unexpected type ${inputItem.selfInfo.type}`);
                }
            }
        });
    }

    function makeFilterModel() {
        const model = [];
        Object.keys(state.inputItems).forEach((inputItemName) => {
            if (inputItemName.endsWith(':numberInput') || inputItemName.endsWith(':multiEnumInput')) {
                return;
            }
            if (state.checkboxes[inputItemName].checked === false) {
                return;
            }
            const inputItem = state.inputItems[inputItemName];
            let selectedOptions, regex, num, i, arr;
            const { type } = inputItem.selfInfo;

            let select2;
            switch (type) {
            case 'enum':
                arr = nl2array(inputItem.selectedOptions).map(R.prop('value'));
                model.push({ type, name: inputItemName, selectedOptions: R.zipObj(arr, R.repeat(true, arr.length)) });
                break;
            case 'checkbox':
                selectedOptions = {};
                if (inputItem.options[0].selected) { selectedOptions.true = true; }
                if (inputItem.options[1].selected) { selectedOptions.false = true; }
                model.push({ type, name: inputItemName, selectedOptions });
                break;
            case 'number':
                if (inputItem.value === 'ignore') { return; }
                num = Number(state.inputItems[`${inputItem.selfInfo.name}:numberInput`].value);
                model.push({
                    type, name: inputItemName, num, condition: inputItem.value
                });
                break;
            case 'multiEnum':
                if (inputItem.value === 'ignore') { return; }
                selectedOptions = {};
                select2 = state.inputItems[`${inputItem.selfInfo.name}:multiEnumInput`];
                arr = nl2array(select2.selectedOptions).map(R.prop('value'));
                model.push({
                    type,
                    name: inputItemName,
                    condition: inputItem.value,
                    selectedOptions: R.zipObj(arr, R.repeat(true, arr.length))
                });
                break;
            case 'text':
            case 'string':
                model.push({ type, name: inputItemName, regexString: inputItem.value.toLowerCase() });
                break;
            default:
                throw new Error(`Unexpected type ${type}`);
            }
        });
        return model;
    }

    function makeDataString(dataArray) {
        const { inputItems } = state;
        return addEls(makeEl('tr'), dataArray.map((valueInfo, i) => {
            let regex, pos, displayValue;
            const { value } = valueInfo;
            if (value === undefined) {
                displayValue = constL10n('notAvailable');
            } else if (valueInfo.type === 'checkbox') {
                displayValue = constL10n(Constants[value]);
            } else if (valueInfo.type === 'text') {
                pos = value.toLowerCase().indexOf(inputItems[valueInfo.itemName].value.toLowerCase());
                displayValue = value.substring(pos - 5, pos + 15);
            } else if (R.contains(valueInfo.type, ['number', 'enum', 'multiEnum', 'string'])) {
                displayValue = value;
            } else {
                throw new Error(`Unexpected valueInfo.type: ${valueInfo.type}`);
            }
            const td = addEl(setClassByCondition(makeEl('td'), 'lightGrey', value === undefined), makeText(displayValue));
            addClasses(td, [`dependent-${i}`, 'dependent', valueInfo.type === 'number' ? 'text-align-right' : 'text-align-left']);
            setAttr(td, 'dependent-index', i);
            return td;
        }));
    }

    function makeContentHeader(profileItemNames) {
        return addEls(makeEl('tr'), profileItemNames.map((elem, i) => {
            const td = addEls(makeEl('th'), [makeText(`${elem.displayName} `)]);
            td.info = elem.name;
            addClasses(td, [`dependent-${i}`, 'dependent', 'sorting', elem.type === 'number' ? 'text-align-right' : 'text-align-left']);
            setAttr(td, 'dependent-index', i);
            listen(td, 'click', onSortChange);
            return td;
        }));
    }

    function onSortChange(event) {
        let { target } = event;
        if (target.tagName.toLowerCase() === 'span') {
            target = target.parentElement;
        }

        if (state.sortKey === target.info) {
            state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            setClassByCondition(target, 'sortDesc', state.sortDir === 'desc');
            setClassByCondition(target, 'sortAsc', state.sortDir === 'asc');
        } else {
            const filterHead = queryEl(`${root}.filter-head`);
            nl2array(filterHead.getElementsByClassName('sortAsc')).forEach(removeClass(R.__, 'sortAsc'));
            nl2array(filterHead.getElementsByClassName('sortDesc')).forEach(removeClass(R.__, 'sortDesc'));

            state.sortKey = target.info;
            state.sortDir = 'asc';
            addClass(target, 'sortAsc');
        }
        rebuildContent();
    }

    function makeInput(profileItemConfig) {
        const el = qmte(`${root} .filter-item-tmpl`);
        const checkbox = qee(el, 'input[type="checkbox"]');
        const id = "filter-item-" + profileItemConfig.displayName;
        checkbox.checked = false;
        checkbox.id = id;
        addEl(qee(el, '.filter-item-name'), makeText(profileItemConfig.displayName));
        setAttr(qee(el, 'label'), 'for', id);
        
        const inputContainer = qee(el, '.filter-item-container');
        listen(checkbox, 'click', toggleContent(el, inputContainer));
        state.checkboxes[profileItemConfig.name] = checkbox;
        
        addEl(inputContainer, makeFilter(profileItemConfig));
        return el;
    }
    
    function toggleContent(itemContainer, inputContainer) {
        return (event) => {
            hideEl(inputContainer, !event.target.checked);
            setClassByCondition(itemContainer, 'flex-front-element', event.target.checked);
            rebuildContent();
        };
    }

    function makeFilter(profileItemConfig) {
        switch (profileItemConfig.type) {
        case 'text':
        case 'string':
            return makeTextFilter(profileItemConfig);
        case 'enum':
            return makeEnumFilter(profileItemConfig);
        case 'multiEnum':
            return makeMultiEnumFilter(profileItemConfig);
        case 'number':
            return makeNumberFilter(profileItemConfig);
        case 'checkbox':
            return makeCheckboxFilter(profileItemConfig);
        default:
            throw new Error(`Unexpected type ${profileItemConfig.type}`);
        }
    }

    function makeTextFilter(profileItemConfig) {
        const input = qmte(`${root} .text-filter-tmpl`);
        input.selfInfo = profileItemConfig;
        input.value = '';
        input.addEventListener('input', rebuildContent);
        state.inputItems[profileItemConfig.name] = input;
        return input;
    }

    function makeCommonEnumFilter(profileItemConfig, values) {
        const selector = qmte(`${root} .common-enum-filter-tmpl`);
        selector.selfInfo = profileItemConfig;
        selector.size = values.length;

        fillSelector(selector, values.map((value) => {
            value.selected = true;
            return value;
        }));
        selector.addEventListener('change', rebuildContent);
        state.inputItems[profileItemConfig.name] = selector;
        return selector;
    }

    function makeEnumFilter(profileItemConfig) {
        const values = arr2Select(profileItemConfig.value.split(','));
        return makeCommonEnumFilter(profileItemConfig, values);
    }

    function makeCheckboxFilter(profileItemConfig) {
        const values = [{
            value: Constants.true,
            name: constL10n(Constants.true)
        }, {
            value: Constants.false,
            name: constL10n(Constants.false)
        }];
        return makeCommonEnumFilter(profileItemConfig, values);
    }

    function makeMultiEnumFilter(profileItemConfig) {
        const filter = qmte(`${root} .multi-enum-filter-tmpl`);
        const selector = qee(filter, '.multi-enum-filter-type');
        selector.selfInfo = profileItemConfig;

        Constants.multiEnumFilter.forEach((value) => {
            const option = makeEl('option');
            option.appendChild(makeText(constL10n(value)));
            option.value = value;
            selector.appendChild(option);
        });
        selector.selectedIndex = 0;
        state.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener('change', rebuildContent);

        const selector2 = qee(filter, '.multi-enum-filter-content');
        const values = arr2Select(profileItemConfig.value.split(','));
        fillSelector(selector2, values.map((value) => {
            value.selected = true;
            return value;
        }));
        selector2.size = values.length;

        state.inputItems[`${profileItemConfig.name}:multiEnumInput`] = selector2;
        selector2.addEventListener('change', rebuildContent);
        return filter;
    }

    function makeNumberFilter(profileItemConfig) {
        const filter = qmte(`${root} .number-filter-tmpl`);
        const selector = qee(filter, 'select');
        selector.selfInfo = profileItemConfig;

        Constants.numberFilter.forEach((value) => {
            const option = makeEl('option');
            option.appendChild(makeText(constL10n(value)));
            option.value = value;
            selector.appendChild(option);
        });
        selector.selectedIndex = 0;
        state.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener('change', rebuildContent);

        const input = qee(filter, 'input');
        input.value = 0;
        state.inputItems[`${profileItemConfig.name}:numberInput`] = input;
        input.addEventListener('input', rebuildContent);
        return filter;
    }

    function renameGroup(selector) {
        return dialog => () => {
            const toInput = qee(dialog, '.entity-input');
            const fromName = queryEl(selector).value;
            const toName = toInput.value.trim();

            DBMS.renameGroup(fromName, toName, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    PermissionInformer.refresh((err2) => {
                        if (err2) { Utils.handleError(err2); return; }
                        toInput.value = '';
                        dialog.hideDlg();
                        exports.refresh();
                    });
                }
            });
        };
    }
})(this.ProfileFilter = {});
