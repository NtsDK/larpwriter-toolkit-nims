import PermissionInformer from "permissionInformer";
import FilterConfiguration from "./FilterConfiguration";
import { createGroup, removeGroup } from "./groupProfile";
import ProjectUtils from 'nims-dbms/db-utils/projectUtils';
import ReactDOM from 'react-dom';
import { createModalDialog } from "../commons/uiCommons";
import * as FileUtils from 'nims-app-core/fileUtils';
import { UI, U, L10n } from 'nims-app-core';
import { getModalPromptBody } from '../commons/uiCommons2.jsx';

import {
    getCommonEnumFilter,
    getFilterItem,
    getMultiEnumFilter,
    getNumberFilter,
    getProfileFilterTemplate,
    getTextFilter
} from "./ProfileFilterTemplate.jsx";

const root = '.profile-filter-tab ';


export class ProfileFilter {

    state = {};
    content;

    constructor() {
        this.setFilterModelItem = this.setFilterModelItem.bind(this);
        this.rebuildContent = this.rebuildContent.bind(this);
        this.saveFilterToGroup = this.saveFilterToGroup.bind(this);
        this.loadFilterFromGroup = this.loadFilterFromGroup.bind(this);
        this.downloadFilterTable = this.downloadFilterTable.bind(this);
        this.makeDataString = this.makeDataString.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.makeInput = this.makeInput.bind(this);
        this.toggleContent = this.toggleContent.bind(this);
        this.refresh = this.refresh.bind(this);
        // this.L10nObj = L10n;
        // this.DBMSObj = DBMS;
        // this.l10n = L10n.get('groups');
    }

    getContent(){
        return this.content;
    }

    init(){
        this.content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), this.content);
        ReactDOM.render(getProfileFilterTemplate(), this.content);
        L10n.localizeStatic(this.content);

        const createGroupDialog = createModalDialog(root, createGroup(false, this.refresh), {
            // bodySelector: 'modal-prompt-body',
            dialogTitle: 'groups-enter-group-name',
            actionButtonTitle: 'common-create',
            getComponent: getModalPromptBody,
            componentClass: 'ModalPromptBody'
        });

        const renameGroupDialog = createModalDialog(root, this.renameGroup(`${root}.save-entity-select`), {
            // bodySelector: 'modal-prompt-body',
            dialogTitle: 'groups-enter-new-group-name',
            actionButtonTitle: 'common-rename',
            getComponent: getModalPromptBody,
            componentClass: 'ModalPromptBody'
        });

        //        this.state.addFilterConditionDialog = new AddFilterConditionDialog(root);
        //        U.listen(U.qe(`${root}.create.filter-condition`), 'click', onAddFilterCondition);

        U.listen(U.queryEl(`${root}#profile-filter-columns .profile-item-selector`), 'change', UI.showSelectedEls3(root, 'dependent', 'dependent-index'));

        //        UI.enable(content, 'isGroupEditable', isGroupEditable);
        //        listen U.queryEl(`${root}.save-entity-select`)

        $(`${root}.save-entity-select`).select2().on('change', (event) => {
            const group = event.target.value;
            const userGroups = this.state.userGroupNames.map(R.prop('value'));
            const isGroupEditable = R.contains(group, userGroups);
            UI.enable(this.content, 'isGroupEditable', isGroupEditable);
        });

        U.listen(U.queryEl(`${root}.show-entity-button`), 'click', this.loadFilterFromGroup);
        U.listen(U.queryEl(`${root}.save-entity-button`), 'click', this.saveFilterToGroup);
        U.listen(U.queryEl(`${root}.download-filter-table`), 'click', this.downloadFilterTable);

        U.listen(U.qe(`${root}.create.group`), 'click', () => createGroupDialog.showDlg());
        U.listen(U.qe(`${root}.rename.group`), 'click', () => {
            U.qee(renameGroupDialog, '.entity-input').value = U.queryEl(`${root}.save-entity-select`).value;
            renameGroupDialog.showDlg();
        });
        U.listen(U.queryEl(`${root}.remove.group`), 'click', removeGroup(() => U.queryEl(`${root}.save-entity-select`).value, this.refresh));

        this.content = U.queryEl(root);
    };

    refresh(){
        this.state.sortKey = Constants.CHAR_NAME;
        this.state.sortDir = 'asc';
        this.state.inputItems = {};
        this.state.checkboxes = {};
        this.state.curFilterModel = [];

        const filterSettingsDiv = U.clearEl(U.queryEl(`${root}.filter-settings-panel`));
        U.addEl(filterSettingsDiv, U.addClass(U.makeEl('div'), 'separator'));

        this.groupAreaRefresh();

        FilterConfiguration.makeFilterConfiguration().then((filterConfiguration) => {
            this.state.filterConfiguration = filterConfiguration;

            U.showEl(U.qe(`${root} .alert.no-characters`), !filterConfiguration.haveProfiles());
            U.showEl(U.qe(`${root} .alert.no-players`), !filterConfiguration.haveProfiles());
            U.showEl(U.qe(`${root} .alert.no-character-profile`), !filterConfiguration.haveProfileStructures());
            U.showEl(U.qe(`${root} .alert.no-player-profile`), !filterConfiguration.haveProfileStructures());
            U.showEl(U.qe(`${root} .profile-filter-container .panel`), filterConfiguration.haveData());

            const groupedProfileFilterItems = filterConfiguration.getGroupedProfileFilterItems();
            U.addEls(filterSettingsDiv, R.flatten(groupedProfileFilterItems.map((item) => R.concat(item.profileFilterItems.map(this.makeInput), [U.addClass(U.makeEl('div'), 'filterSeparator')]))));

            UI.fillShowItemSelector2(
                U.clearEl(U.queryEl(`${root}#profile-filter-columns .profile-item-selector`)),
                filterConfiguration.getGroupsForSelect(),
                true
            );

            U.addEl(
                U.clearEl(U.queryEl(`${root}.filter-head`)),
                this.makeContentHeader(this.getHeaderProfileItemNames(filterConfiguration.getProfileFilterItems()))
            );

            this.rebuildContent();
        }).catch(UI.handleError);
    };

    onAddFilterCondition() {
        this.state.addFilterConditionDialog.showDlg(this.state.filterConfiguration.getGroupsForSelect(), this.setFilterModelItem);
    }

    setFilterModelItem(filterModelItem) {
        const index = R.findIndex(R.propEq('name', filterModelItem.name), this.state.curFilterModel);
        if (index === -1) {
            this.state.curFilterModel.push(filterModelItem);
        } else {
            this.state.curFilterModel[index] = filterModelItem;
        }
    }

    groupAreaRefresh() {
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

            this.state.userGroupNames = userGroupNames;
            this.state.allGroupNames = allGroupNames;
            const data = UI.getSelect2Data(allGroupNames);
            U.clearEl(U.queryEl(`${root}.save-entity-select`));
            $(`${root}.save-entity-select`).select2(data);
        }).catch(UI.handleError);
    }

    getHeaderProfileItemNames(profileSettings) {
        return R.map(R.pick(['name', 'displayName', 'type']), profileSettings);
    }

    makePrintData() {
        const dataArrays = this.state.filterConfiguration.getDataArrays(this.makeFilterModel());

        const sortFunc = CU.charOrdAFactoryBase(this.state.sortDir, (a, b) => a > b, (a) => {
            const map = R.indexBy(R.prop('itemName'), a);
            const item = map[this.state.sortKey];
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

    rebuildContent() {
        const dataArrays = this.makePrintData();
        U.addEl(U.clearEl(U.queryEl(`${root}.filter-result-size`)), U.makeText(dataArrays.length));
        U.addEls(U.clearEl(U.queryEl(`${root}.filter-content`)), dataArrays.map(this.makeDataString));
        UI.showSelectedEls3(root, 'dependent', 'dependent-index')({ target: U.queryEl(`${root}#profile-filter-columns .profile-item-selector`) });
    }

    saveFilterToGroup() {
        const groupName = U.queryEl(`${root}.save-entity-select`).value;
        PermissionInformer.isEntityEditable({ type: 'group', name: groupName }).then((isGroupEditable) => {
            if (!isGroupEditable) {
                UI.alert(CU.strFormat(L10n.getValue('groups-group-editing-forbidden'), [groupName]));
                return;
            }
            DBMS.saveFilterToGroup({
                groupName,
                filterModel: this.makeFilterModel()
            }).catch(UI.handleError);
        }).catch(UI.handleError);
    }

    loadFilterFromGroup() {
        const groupName = U.queryEl(`${root}.save-entity-select`).value;
        DBMS.getGroup({ groupName }).then((group) => {
            const conflictTypes = ProjectUtils.isFilterModelCompatibleWithProfiles(
                this.state.filterConfiguration.getBaseProfileSettings(),
                group.filterModel
            );
            if (conflictTypes.length !== 0) {
                UI.alert(CU.strFormat(L10n.getValue('groups-base-filter-is-incompatible-with-page-profiles'), [conflictTypes.join(',')]));
                return;
            }
            this.applyFilterModel(group.filterModel);
            this.rebuildContent();
        }).catch(UI.handleError);
    }

    downloadFilterTable() {
        const el = U.queryEl(`${root}#profile-filter-columns .profile-item-selector`);
        const selected = [];
        for (let i = 0; i < el.options.length; i += 1) {
            selected[i] = el.options[i].selected;
        }

        const dataArrays = this.makePrintData();
        const cleanArrays = dataArrays.map((dataArray) => dataArray.filter((item, index) => selected[index]).map(R.prop('value')));

        FileUtils.arr2d2Csv(cleanArrays, 'profileFilter');
    }

    applyFilterModel(filterModel) {
        filterModel = R.indexBy(R.prop('name'), filterModel);

        Object.keys(this.state.inputItems).forEach((inputItemName) => {
            if (R.endsWith(':numberInput', inputItemName) || R.endsWith(':multiEnumInput', inputItemName)) {
                return;
            }

            const inputItem = this.state.inputItems[inputItemName];
            let selectedOptions, regex, num, i, counter;

            if (this.state.checkboxes[inputItemName].checked !== (filterModel[inputItemName] !== undefined)) {
                this.state.checkboxes[inputItemName].click();
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
                    this.state.inputItems[`${inputItem.selfInfo.name}:numberInput`].value = 0;
                    inputItem.value = 'ignore';
                    break;
                case 'multiEnum':
                    select = this.state.inputItems[`${inputItem.selfInfo.name}:multiEnumInput`];
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
                    this.state.inputItems[`${inputItem.selfInfo.name}:numberInput`].value = modelItem.num;
                    break;
                case 'multiEnum':
                    inputItem.value = modelItem.condition;
                    select = this.state.inputItems[`${inputItem.selfInfo.name}:multiEnumInput`];
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

    makeFilterModel() {
        const model = [];
        Object.keys(this.state.inputItems).forEach((inputItemName) => {
            if (R.endsWith(':numberInput', inputItemName) || R.endsWith(':multiEnumInput', inputItemName)) {
                return;
            }
            if (this.state.checkboxes[inputItemName].checked === false) {
                return;
            }
            const inputItem = this.state.inputItems[inputItemName];
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
                num = Number(this.state.inputItems[`${inputItem.selfInfo.name}:numberInput`].value);
                model.push({
                    type, name: inputItemName, num, condition: inputItem.value
                });
                break;
            case 'multiEnum':
                if (inputItem.value === 'ignore') { return; }
                selectedOptions = {};
                select2 = this.state.inputItems[`${inputItem.selfInfo.name}:multiEnumInput`];
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

    makeDataString(dataArray) {
        const { inputItems } = this.state;
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

    makeContentHeader(profileItemNames) {
        return U.addEls(U.makeEl('tr'), profileItemNames.map((elem, i) => {
            const td = U.addEls(U.makeEl('th'), [U.makeText(`${elem.displayName} `)]);
            td.info = elem.name;
            U.addClasses(td, [`dependent-${i}`, 'dependent', 'sorting', elem.type === 'number' ? 'text-align-right' : 'text-align-left']);
            U.setAttr(td, 'dependent-index', i);
            U.listen(td, 'click', this.onSortChange);
            return td;
        }));
    }

    onSortChange(event) {
        let { target } = event;
        if (target.tagName.toLowerCase() === 'span') {
            target = target.parentElement;
        }

        if (this.state.sortKey === target.info) {
            this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
            U.setClassByCondition(target, 'sortDesc', this.state.sortDir === 'desc');
            U.setClassByCondition(target, 'sortAsc', this.state.sortDir === 'asc');
        } else {
            const filterHead = U.queryEl(`${root}.filter-head`);
            U.nl2array(filterHead.getElementsByClassName('sortAsc')).forEach(U.removeClass(R.__, 'sortAsc'));
            U.nl2array(filterHead.getElementsByClassName('sortDesc')).forEach(U.removeClass(R.__, 'sortDesc'));

            this.state.sortKey = target.info;
            this.state.sortDir = 'asc';
            U.addClass(target, 'sortAsc');
        }
        this.rebuildContent();
    }

    makeInput(profileItemConfig) {
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
        U.listen(checkbox, 'click', this.toggleContent(el, inputContainer));
        this.state.checkboxes[profileItemConfig.name] = checkbox;

        U.addEl(inputContainer, this.makeFilter(profileItemConfig));
        return el;
    }

    toggleContent(itemContainer, inputContainer) {
        return (event) => {
            U.hideEl(inputContainer, !event.target.checked);
            U.setClassByCondition(itemContainer, 'flex-front-element', event.target.checked);
            this.rebuildContent();
        };
    }

    makeFilter(profileItemConfig) {
        switch (profileItemConfig.type) {
        case 'text':
        case 'string':
            return this.makeTextFilter(profileItemConfig);
        case 'enum':
            return this.makeEnumFilter(profileItemConfig);
        case 'multiEnum':
            return this.makeMultiEnumFilter(profileItemConfig);
        case 'number':
            return this.makeNumberFilter(profileItemConfig);
        case 'checkbox':
            return this.makeCheckboxFilter(profileItemConfig);
        default:
            throw new Error(`Unexpected type ${profileItemConfig.type}`);
        }
    }

    makeTextFilter(profileItemConfig) {
        const content = U.makeEl('div');
        ReactDOM.render(getTextFilter(), content);
        const input = U.qee(content, '.TextFilter');

        // const input = U.qmte(`${root} .text-filter-tmpl`);
        input.selfInfo = profileItemConfig;
        input.value = '';
        input.addEventListener('input', this.rebuildContent);
        this.state.inputItems[profileItemConfig.name] = input;
        return input;
    }

    makeCommonEnumFilter(profileItemConfig, values) {
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
        selector.addEventListener('change', this.rebuildContent);
        this.state.inputItems[profileItemConfig.name] = selector;
        return selector;
    }

    makeEnumFilter(profileItemConfig) {
        const values = U.arr2Select(profileItemConfig.value.split(','));
        return this.makeCommonEnumFilter(profileItemConfig, values);
    }

    makeCheckboxFilter(profileItemConfig) {
        const values = [{
            value: Constants.true,
            name: L10n.const(Constants.true)
        }, {
            value: Constants.false,
            name: L10n.const(Constants.false)
        }];
        return this.makeCommonEnumFilter(profileItemConfig, values);
    }

    makeMultiEnumFilter(profileItemConfig) {
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
        this.state.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener('change', this.rebuildContent);

        const selector2 = U.qee(filter, '.multi-enum-filter-content');
        const values = U.arr2Select(profileItemConfig.value.split(','));
        U.fillSelector(selector2, values.map((value) => {
            value.selected = true;
            return value;
        }));
        selector2.size = values.length;

        this.state.inputItems[`${profileItemConfig.name}:multiEnumInput`] = selector2;
        selector2.addEventListener('change', this.rebuildContent);
        return filter;
    }

    makeNumberFilter(profileItemConfig) {
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
        this.state.inputItems[profileItemConfig.name] = selector;
        selector.addEventListener('change', this.rebuildContent);

        const input = U.qee(filter, 'input');
        input.value = 0;
        this.state.inputItems[`${profileItemConfig.name}:numberInput`] = input;
        input.addEventListener('input', this.rebuildContent);
        return filter;
    }

    renameGroup(selector) {
        return (dialog) => () => {
            const toInput = U.qee(dialog, '.entity-input');
            const fromName = U.queryEl(selector).value;
            const toName = toInput.value.trim();

            DBMS.renameGroup({ fromName, toName }).then(() => {
                PermissionInformer.refresh().then(() => {
                    toInput.value = '';
                    dialog.hideDlg();
                    this.refresh();
                }).catch(UI.handleError);
            }).catch((err) => UI.setError(dialog, err));
        };
    }
}
