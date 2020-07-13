import PermissionInformer from "permissionInformer";
import FilterConfiguration from "./FilterConfiguration";
import GroupProfile from "./groupProfile";
import ProjectUtils from 'nims-dbms/db-utils/projectUtils';
import ReactDOM from 'react-dom';
import {
    getCommonEnumFilter,
    getFilterItem,
    getMultiEnumFilter,
    getNumberFilter,
    getProfileFilterTemplate,
    getTextFilter
} from "./ProfileFilterTemplate.jsx";

// ((exports) => {
const state = {};
const root = '.profile-filter-tab ';

let content;
function getContent(){
    return content;
}
export default {
    init, refresh, getContent
}

function init(){
    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getProfileFilterTemplate(), content);
    L10n.localizeStatic(content);

    const createGroupDialog = UI.createModalDialog(root, GroupProfile.createGroup(false, refresh), {
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
    //        U.listen(U.qe(`${root}.create.filter-condition`), 'click', onAddFilterCondition);

    U.listen(U.queryEl(`${root}#profile-filter-columns .profile-item-selector`), 'change', UI.showSelectedEls3(root, 'dependent', 'dependent-index'));

    //        UI.enable(content, 'isGroupEditable', isGroupEditable);
    //        listen U.queryEl(`${root}.save-entity-select`)

    $(`${root}.save-entity-select`).select2().on('change', (event) => {
        const group = event.target.value;
        const userGroups = state.userGroupNames.map(R.prop('value'));
        const isGroupEditable = R.contains(group, userGroups);
        UI.enable(content, 'isGroupEditable', isGroupEditable);
    });

    U.listen(U.queryEl(`${root}.show-entity-button`), 'click', loadFilterFromGroup);
    U.listen(U.queryEl(`${root}.save-entity-button`), 'click', saveFilterToGroup);
    U.listen(U.queryEl(`${root}.download-filter-table`), 'click', downloadFilterTable);

    U.listen(U.qe(`${root}.create.group`), 'click', () => createGroupDialog.showDlg());
    U.listen(U.qe(`${root}.rename.group`), 'click', () => {
        U.qee(renameGroupDialog, '.entity-input').value = U.queryEl(`${root}.save-entity-select`).value;
        renameGroupDialog.showDlg();
    });
    U.listen(U.queryEl(`${root}.remove.group`), 'click', GroupProfile.removeGroup(() => U.queryEl(`${root}.save-entity-select`).value, refresh));

    content = U.queryEl(root);
};

function refresh(){
    state.sortKey = Constants.CHAR_NAME;
    state.sortDir = 'asc';
    state.inputItems = {};
    state.checkboxes = {};
    state.curFilterModel = [];

    const filterSettingsDiv = U.clearEl(U.queryEl(`${root}.filter-settings-panel`));
    U.addEl(filterSettingsDiv, U.addClass(U.makeEl('div'), 'separator'));

    groupAreaRefresh();

    FilterConfiguration.makeFilterConfiguration().then((filterConfiguration) => {
        state.filterConfiguration = filterConfiguration;

        U.showEl(U.qe(`${root} .alert.no-characters`), !filterConfiguration.haveProfiles());
        U.showEl(U.qe(`${root} .alert.no-players`), !filterConfiguration.haveProfiles());
        U.showEl(U.qe(`${root} .alert.no-character-profile`), !filterConfiguration.haveProfileStructures());
        U.showEl(U.qe(`${root} .alert.no-player-profile`), !filterConfiguration.haveProfileStructures());
        U.showEl(U.qe(`${root} .profile-filter-container .panel`), filterConfiguration.haveData());

        const groupedProfileFilterItems = filterConfiguration.getGroupedProfileFilterItems();
        U.addEls(filterSettingsDiv, R.flatten(groupedProfileFilterItems.map((item) => R.concat(item.profileFilterItems.map(makeInput), [U.addClass(U.makeEl('div'), 'filterSeparator')]))));

        UI.fillShowItemSelector2(
            U.clearEl(U.queryEl(`${root}#profile-filter-columns .profile-item-selector`)),
            filterConfiguration.getGroupsForSelect(),
            true
        );

        U.addEl(
            U.clearEl(U.queryEl(`${root}.filter-head`)),
            makeContentHeader(getHeaderProfileItemNames(filterConfiguration.getProfileFilterItems()))
        );

        rebuildContent();
    }).catch(UI.handleError);
};

function onAddFilterCondition() {
    state.addFilterConditionDialog.showDlg(state.filterConfiguration.getGroupsForSelect(), setFilterModelItem);
}

function setFilterModelItem(filterModelItem) {
    const index = R.findIndex(R.propEq('name', filterModelItem.name), state.curFilterModel);
    if (index === -1) {
        state.curFilterModel.push(filterModelItem);
    } else {
        state.curFilterModel[index] = filterModelItem;
    }
}

function groupAreaRefresh() {
    Promise.all([
        PermissionInformer.getEntityNamesArray({ type: 'group', editableOnly: true }),
        PermissionInformer.getEntityNamesArray({ type: 'group', editableOnly: false })
    ]).then((results) => {
        const [userGroupNames, allGroupNames] = results;
        UI.enableEl(U.qe(`${root}.rename.group`), allGroupNames.length > 0);
        UI.enableEl(U.qe(`${root}.remove.group`), allGroupNames.length > 0);
        UI.enableEl(U.qe(`${root}.show-entity-button`), allGroupNames.length > 0);
        UI.enableEl(U.qe(`${root}.save-entity-button`), allGroupNames.length > 0);
        UI.enableEl(U.qe(`${root}.save-entity-select`), allGroupNames.length > 0);

        state.userGroupNames = userGroupNames;
        state.allGroupNames = allGroupNames;
        const data = UI.getSelect2Data(allGroupNames);
        U.clearEl(U.queryEl(`${root}.save-entity-select`));
        $(`${root}.save-entity-select`).select2(data);
    }).catch(UI.handleError);
}

function getHeaderProfileItemNames(profileSettings) {
    return R.map(R.pick(['name', 'displayName', 'type']), profileSettings);
}

function makePrintData() {
    const dataArrays = state.filterConfiguration.getDataArrays(makeFilterModel());

    const sortFunc = CU.charOrdAFactoryBase(state.sortDir, (a, b) => a > b, (a) => {
        const map = R.indexBy(R.prop('itemName'), a);
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
    U.addEl(U.clearEl(U.queryEl(`${root}.filter-result-size`)), U.makeText(dataArrays.length));
    U.addEls(U.clearEl(U.queryEl(`${root}.filter-content`)), dataArrays.map(makeDataString));
    UI.showSelectedEls3(root, 'dependent', 'dependent-index')({ target: U.queryEl(`${root}#profile-filter-columns .profile-item-selector`) });
}

function saveFilterToGroup() {
    const groupName = U.queryEl(`${root}.save-entity-select`).value;
    PermissionInformer.isEntityEditable({ type: 'group', name: groupName }).then((isGroupEditable) => {
        if (!isGroupEditable) {
            UI.alert(CU.strFormat(L10n.getValue('groups-group-editing-forbidden'), [groupName]));
            return;
        }
        DBMS.saveFilterToGroup({
            groupName,
            filterModel: makeFilterModel()
        }).catch(UI.handleError);
    }).catch(UI.handleError);
}

function loadFilterFromGroup() {
    const groupName = U.queryEl(`${root}.save-entity-select`).value;
    DBMS.getGroup({ groupName }).then((group) => {
        const conflictTypes = ProjectUtils.isFilterModelCompatibleWithProfiles(
            state.filterConfiguration.getBaseProfileSettings(),
            group.filterModel
        );
        if (conflictTypes.length !== 0) {
            UI.alert(CU.strFormat(L10n.getValue('groups-base-filter-is-incompatible-with-page-profiles'), [conflictTypes.join(',')]));
            return;
        }
        applyFilterModel(group.filterModel);
        rebuildContent();
    }).catch(UI.handleError);
}

function downloadFilterTable() {
    const el = U.queryEl(`${root}#profile-filter-columns .profile-item-selector`);
    const selected = [];
    for (let i = 0; i < el.options.length; i += 1) {
        selected[i] = el.options[i].selected;
    }

    const dataArrays = makePrintData();
    const cleanArrays = dataArrays.map((dataArray) => dataArray.filter((item, index) => selected[index]).map(R.prop('value')));

    FileUtils.arr2d2Csv(cleanArrays, 'profileFilter');
}

function applyFilterModel(filterModel) {
    filterModel = R.indexBy(R.prop('name'), filterModel);

    Object.keys(state.inputItems).forEach((inputItemName) => {
        if (R.endsWith(':numberInput', inputItemName) || R.endsWith(':multiEnumInput', inputItemName)) {
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
        if (R.endsWith(':numberInput', inputItemName) || R.endsWith(':multiEnumInput', inputItemName)) {
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
            arr = U.nl2array(inputItem.selectedOptions).map(R.prop('value'));
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
            arr = U.nl2array(select2.selectedOptions).map(R.prop('value'));
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
    return U.addEls(U.makeEl('tr'), dataArray.map((valueInfo, i) => {
        let regex, pos, displayValue;
        const { value } = valueInfo;
        if (value === undefined) {
            displayValue = L10n.const('notAvailable');
        } else if (valueInfo.type === 'checkbox') {
            displayValue = L10n.const(Constants[value]);
        } else if (valueInfo.type === 'text') {
            pos = value.toLowerCase().indexOf(inputItems[valueInfo.itemName].value.toLowerCase());
            displayValue = value.substring(pos - 5, pos + 15);
        } else if (R.contains(valueInfo.type, ['number', 'enum', 'multiEnum', 'string'])) {
            displayValue = value;
        } else {
            throw new Error(`Unexpected valueInfo.type: ${valueInfo.type}`);
        }
        const td = U.addEl(U.setClassByCondition(U.makeEl('td'), 'lightGrey', value === undefined), U.makeText(displayValue));
        U.addClasses(td, [`dependent-${i}`, 'dependent', valueInfo.type === 'number' ? 'text-align-right' : 'text-align-left']);
        U.setAttr(td, 'dependent-index', i);
        return td;
    }));
}

function makeContentHeader(profileItemNames) {
    return U.addEls(U.makeEl('tr'), profileItemNames.map((elem, i) => {
        const td = U.addEls(U.makeEl('th'), [U.makeText(`${elem.displayName} `)]);
        td.info = elem.name;
        U.addClasses(td, [`dependent-${i}`, 'dependent', 'sorting', elem.type === 'number' ? 'text-align-right' : 'text-align-left']);
        U.setAttr(td, 'dependent-index', i);
        U.listen(td, 'click', onSortChange);
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
        U.setClassByCondition(target, 'sortDesc', state.sortDir === 'desc');
        U.setClassByCondition(target, 'sortAsc', state.sortDir === 'asc');
    } else {
        const filterHead = U.queryEl(`${root}.filter-head`);
        U.nl2array(filterHead.getElementsByClassName('sortAsc')).forEach(U.removeClass(R.__, 'sortAsc'));
        U.nl2array(filterHead.getElementsByClassName('sortDesc')).forEach(U.removeClass(R.__, 'sortDesc'));

        state.sortKey = target.info;
        state.sortDir = 'asc';
        U.addClass(target, 'sortAsc');
    }
    rebuildContent();
}

function makeInput(profileItemConfig) {
    const content = U.makeEl('div');
    ReactDOM.render(getFilterItem(), content);
    const el = U.qee(content, '.FilterItem');

    // const el = U.qmte(`${root} .filter-item-tmpl`);
    const checkbox = U.qee(el, 'input[type="checkbox"]');
    const id = `filter-item-${profileItemConfig.displayName}`;
    checkbox.checked = false;
    checkbox.id = id;
    U.addEl(U.qee(el, '.filter-item-name'), U.makeText(profileItemConfig.displayName));
    U.setAttr(U.qee(el, 'label'), 'for', id);

    const inputContainer = U.qee(el, '.filter-item-container');
    U.listen(checkbox, 'click', toggleContent(el, inputContainer));
    state.checkboxes[profileItemConfig.name] = checkbox;

    U.addEl(inputContainer, makeFilter(profileItemConfig));
    return el;
}

function toggleContent(itemContainer, inputContainer) {
    return (event) => {
        U.hideEl(inputContainer, !event.target.checked);
        U.setClassByCondition(itemContainer, 'flex-front-element', event.target.checked);
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
    const content = U.makeEl('div');
    ReactDOM.render(getTextFilter(), content);
    const input = U.qee(content, '.TextFilter');

    // const input = U.qmte(`${root} .text-filter-tmpl`);
    input.selfInfo = profileItemConfig;
    input.value = '';
    input.addEventListener('input', rebuildContent);
    state.inputItems[profileItemConfig.name] = input;
    return input;
}

function makeCommonEnumFilter(profileItemConfig, values) {
    const content = U.makeEl('div');
    ReactDOM.render(getCommonEnumFilter(), content);
    const selector = U.qee(content, '.CommonEnumFilter');

    // const selector = U.qmte(`${root} .common-enum-filter-tmpl`);
    selector.selfInfo = profileItemConfig;
    selector.size = values.length;

    U.fillSelector(selector, values.map((value) => {
        value.selected = true;
        return value;
    }));
    selector.addEventListener('change', rebuildContent);
    state.inputItems[profileItemConfig.name] = selector;
    return selector;
}

function makeEnumFilter(profileItemConfig) {
    const values = U.arr2Select(profileItemConfig.value.split(','));
    return makeCommonEnumFilter(profileItemConfig, values);
}

function makeCheckboxFilter(profileItemConfig) {
    const values = [{
        value: Constants.true,
        name: L10n.const(Constants.true)
    }, {
        value: Constants.false,
        name: L10n.const(Constants.false)
    }];
    return makeCommonEnumFilter(profileItemConfig, values);
}

function makeMultiEnumFilter(profileItemConfig) {
    const content = U.makeEl('div');
    ReactDOM.render(getMultiEnumFilter(), content);
    const filter = U.qee(content, '.MultiEnumFilter');

    // const filter = U.qmte(`${root} .multi-enum-filter-tmpl`);
    const selector = U.qee(filter, '.multi-enum-filter-type');
    selector.selfInfo = profileItemConfig;

    Constants.multiEnumFilter.forEach((value) => {
        const option = U.makeEl('option');
        option.appendChild(U.makeText(L10n.const(value)));
        option.value = value;
        selector.appendChild(option);
    });
    selector.selectedIndex = 0;
    state.inputItems[profileItemConfig.name] = selector;
    selector.addEventListener('change', rebuildContent);

    const selector2 = U.qee(filter, '.multi-enum-filter-content');
    const values = U.arr2Select(profileItemConfig.value.split(','));
    U.fillSelector(selector2, values.map((value) => {
        value.selected = true;
        return value;
    }));
    selector2.size = values.length;

    state.inputItems[`${profileItemConfig.name}:multiEnumInput`] = selector2;
    selector2.addEventListener('change', rebuildContent);
    return filter;
}

function makeNumberFilter(profileItemConfig) {
    const content = U.makeEl('div');
    ReactDOM.render(getNumberFilter(), content);
    const filter = U.qee(content, '.NumberFilter');

    // const filter = U.qmte(`${root} .number-filter-tmpl`);
    const selector = U.qee(filter, 'select');
    selector.selfInfo = profileItemConfig;

    Constants.numberFilter.forEach((value) => {
        const option = U.makeEl('option');
        option.appendChild(U.makeText(L10n.const(value)));
        option.value = value;
        selector.appendChild(option);
    });
    selector.selectedIndex = 0;
    state.inputItems[profileItemConfig.name] = selector;
    selector.addEventListener('change', rebuildContent);

    const input = U.qee(filter, 'input');
    input.value = 0;
    state.inputItems[`${profileItemConfig.name}:numberInput`] = input;
    input.addEventListener('input', rebuildContent);
    return filter;
}

function renameGroup(selector) {
    return (dialog) => () => {
        const toInput = U.qee(dialog, '.entity-input');
        const fromName = U.queryEl(selector).value;
        const toName = toInput.value.trim();

        DBMS.renameGroup({ fromName, toName }).then(() => {
            PermissionInformer.refresh().then(() => {
                toInput.value = '';
                dialog.hideDlg();
                refresh();
            }).catch(UI.handleError);
        }).catch((err) => UI.setError(dialog, err));
    };
}
// })(window.ProfileFilter = {});
