import { createModalDialog } from "../commons/uiCommons";
import { UI, U, L10n } from 'nims-app-core';

function AddFilterConditionDialog(root) {
    this.dialog = createModalDialog(root, this.onAction.bind(this), {
        bodySelector: 'add-filter-condition-body',
        dialogTitle: 'groups-add-filter-condition',
        actionButtonTitle: 'common-ok',
    });
    U.listen(U.qee(this.dialog, '.profile-item-selector'), 'change', this.onProfileItemSelect.bind(this));
}

AddFilterConditionDialog.prototype.showDlg = function (groups, callback) {
    this.callback = callback;
    this.items = R.indexBy(R.prop('name'), R.unnest(groups.map(R.prop('array'))));

    const selector = U.qee(this.dialog, '.profile-item-selector');
    UI.fillShowItemSelector2(
        U.clearEl(selector),
        groups,
        false
    );
    selector.options[0].selected = true;

    this.onProfileItemSelect({ target: selector });

    this.dialog.showDlg();
    // to set dialog title
    //    U.setAttr(U.qee(el, '.modal-title'), 'l10n-id', opts.dialogTitle);
};

AddFilterConditionDialog.prototype.onAction = function (dialog) {
    return function () {
        console.log(this.getFilterModelItem());
        this.callback(this.getFilterModelItem());
        dialog.hideDlg();
    }.bind(this);
};

AddFilterConditionDialog.prototype.getFilterModelItem = function () {
    const opt = U.qee(this.dialog, '.profile-item-selector').selectedOptions[0];
    const item = this.items[opt.value];

    const filterItem = {
        type: item.type,
        name: item.name
    };

    const conditionContainer = (U.qee(this.dialog, '.condition'));
    const valueContainer = (U.qee(this.dialog, '.value'));

    let arr;
    switch (item.type) {
    case 'enum':
    case 'checkbox':
        arr = U.nl2array(U.qee(valueContainer, 'select').selectedOptions).map(R.prop('value'));
        filterItem.selectedOptions = R.zipObj(arr, R.repeat(true, arr.length));
        break;
    case 'number':
        filterItem.condition = U.qee(conditionContainer, 'select').value;
        filterItem.num = Number(U.qee(valueContainer, 'input').value);

        //        if (inputItem.value === 'ignore') { return; }
        //        num = Number(state.inputItems[`${inputItem.selfInfo.name}:numberInput`].value);
        //        model.push({
        //            type, name: inputItemName, num, condition: inputItem.value
        //        });
        break;
    case 'multiEnum':
        filterItem.condition = U.qee(conditionContainer, 'select').value;
        arr = U.nl2array(U.qee(valueContainer, 'select').selectedOptions).map(R.prop('value'));
        filterItem.selectedOptions = R.zipObj(arr, R.repeat(true, arr.length));
        //        if (inputItem.value === 'ignore') { return; }
        //        selectedOptions = {};
        //        select2 = state.inputItems[`${inputItem.selfInfo.name}:multiEnumInput`];
        //        arr = U.nl2array(select2.selectedOptions).map(R.prop('value'));
        //        model.push({
        //            type,
        //            name: inputItemName,
        //            condition: inputItem.value,
        //            selectedOptions: R.zipObj(arr, R.repeat(true, arr.length))
        //        });
        break;
    case 'text':
    case 'string':
        filterItem.regexString = U.qee(valueContainer, 'input').value.toLowerCase();
        //        model.push({ type, name: inputItemName, regexString: inputItem.value.toLowerCase() });
        break;
    default:
        throw new Error(`Unexpected type ${item.type}`);
    }
    return filterItem;
};

AddFilterConditionDialog.prototype.onProfileItemSelect = function (event) {
    const opt = event.target.selectedOptions[0];
    const item = this.items[opt.value];
    console.log(item);

    const conditionContainer = U.clearEl(U.qee(this.dialog, '.condition'));
    switch (item.type) {
    case 'text':
    case 'string':
        U.addEl(conditionContainer, U.qmte('.text-condition-tmpl'));
        break;
    case 'enum':
    case 'checkbox':
        U.addEl(conditionContainer, U.qmte('.enum-condition-tmpl'));
        break;
    case 'multiEnum':
        U.addEl(conditionContainer, U.qmte('.multienum-condition-tmpl'));
        break;
    case 'number':
        U.addEl(conditionContainer, U.qmte('.number-condition-tmpl'));
        break;
    default:
        throw new Error(`Unexpected type ${item.type}`);
    }

    const valueContainer = U.clearEl(U.qee(this.dialog, '.value'));
    let valueInput, values;
    switch (item.type) {
    case 'text':
    case 'string':
        U.addEl(valueContainer, U.qmte('.text-value-tmpl'));
        break;
    case 'checkbox':
        U.addEl(valueContainer, U.qmte('.checkbox-value-tmpl'));
        break;
    case 'enum':
    case 'multiEnum':
        valueInput = U.qmte('.enum-value-tmpl');
        values = item.value.split(',');
        values.sort(CU.charOrdA);
        values = U.arr2Select(values);
        valueInput.size = values.length;

        U.fillSelector(valueInput, values.map((value) => {
            value.selected = true;
            return value;
        }));
        U.addEl(valueContainer, valueInput);
        break;
    case 'number':
        U.addEl(valueContainer, U.qmte('.number-value-tmpl'));
        break;
    default:
        throw new Error(`Unexpected type ${item.type}`);
    }
    L10n.localizeStatic(this.dialog);
//    console.log(item);
};
