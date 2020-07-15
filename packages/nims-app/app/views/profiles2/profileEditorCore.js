import ReactDOM from 'react-dom';
import { getProfileEditorContainer, getProfileEditorRow } from "./ProfileEditorCoreTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';
import { getAlertBlock } from '../commons/uiCommons2.jsx'

// ((exports) => {
export default {
    makeProfileEditorCore
}
function makeProfileEditorCore(){
    const innerExports = {};

    const root = '.profile-editor-core-tmpl';

    const state = {
        character: {},
        player: {}
    };

    innerExports.initProfileStructure = (profileDiv, type, profileStructure, callback) => {
        // const container = U.qte(`${root} .profile-editor-container-tmpl`);

        const content = U.makeEl('div');
        ReactDOM.render(getProfileEditorContainer(), content);
        const container =  U.qee(content, '.ProfileEditorContainer');

        U.addEl(U.clearEl(U.queryEl(profileDiv)), container);
        state[type].inputItems = {};
        state[type].profileStructure = profileStructure;

        if (profileStructure.length === 0) {
            const content = U.makeEl('div');
            ReactDOM.render(getAlertBlock(), content);
            const alert = U.qee(content, '.AlertBlock');

            // const alert = U.qmte('.alert-block-tmpl');
            U.addEl(alert, U.makeText(L10n.get('advices', `empty-${type}-profile-structure`)));
            U.addEl(U.queryEl(profileDiv), alert);
            if (callback) callback();
            return;
        }
        try {
            U.addEls(U.qee(U.queryEl(profileDiv), '.insertion-point'), profileStructure.map(appendInput(type)));
        } catch (err) {
            UI.handleError(err); return;
        }

        if (callback) callback();
    };

    // eslint-disable-next-line no-var,vars-on-top
    var appendInput = R.curry((type, profileItemConfig) => {
        const itemInput = new ProfileItemInput(type, profileItemConfig);
        state[type].inputItems[profileItemConfig.name] = itemInput;
        // const row = U.qte(`${root} .profile-editor-row-tmpl`);

        const content = U.makeEl('div');
        ReactDOM.render(getProfileEditorRow(), content);
        const row =  U.qee(content, '.ProfileEditorRow');

        U.addEl(U.qee(row, '.profile-item-name'), U.makeText(profileItemConfig.name));
        U.addEl(U.qee(row, '.profile-item-input'), itemInput.dom);
        return row;
    });

    innerExports.fillProfileInformation = (profileDiv, type, profile, isEditable) => {
        U.removeClass(U.queryEl(profileDiv), 'hidden');
        R.values(state[type].inputItems).forEach((itemInput) => {
            if (itemInput.type === 'multiEnum') {
                itemInput.multiEnumSelect.prop('disabled', !isEditable(itemInput.name, state[type].profileStructure));
            } else {
                UI.enableEl(itemInput.dom, isEditable(itemInput.name, state[type].profileStructure));
            }
        });

        state[type].name = profile.name;
        Object.values(state[type].inputItems).forEach((item) => {
            item.showFieldValue(profile);
        });
    };

    function ProfileItemInput(profileType, profileItemConfig) {
        let input, sel, toNameObj;
        switch (profileItemConfig.type) {
        case 'text':
            input = U.makeEl('textarea');
            U.addClass(input, 'profileTextInput');
            break;
        case 'string':
            input = U.makeEl('input');
            U.addClass(input, 'profileStringInput');
            break;
        case 'enum':
            input = U.makeEl('select');
            U.addClass(input, 'profileSelectInput');
            toNameObj = R.compose(R.zipObj(['name']), R.append(R.__, []));
            U.fillSelector(input, R.sort(CU.charOrdA, profileItemConfig.value.split(',')).map(toNameObj));
            break;
        case 'number':
            input = U.makeEl('input');
            input.type = 'number';
            break;
        case 'checkbox':
            input = U.makeEl('input');
            input.type = 'checkbox';
            break;
        case 'multiEnum':
            this.multiEnumSelect = $('<select></select>');
            U.setAttr(this.multiEnumSelect[0], 'style', 'width: 100%;');
            U.addClass(this.multiEnumSelect[0], 'common-select');
            U.addClass(this.multiEnumSelect[0], 'profileStringInput');
            [input] = $('<span></span>').append(this.multiEnumSelect);
            U.setAttr(this.multiEnumSelect[0], 'multiple', 'multiple');

            sel = this.multiEnumSelect.select2(U.arr2Select2(R.sort(CU.charOrdA, profileItemConfig.value.split(','))));
            sel.on('change', this.updateFieldValue.bind(this));
            break;
        default:
            throw new Errors.InternalError('errors-unexpected-switch-argument', [profileItemConfig.type]);
        }

        if (profileItemConfig.type !== 'multiEnum') {
            U.listen(input, 'change', this.updateFieldValue.bind(this));
            U.addClass(input, 'form-control');
        }

        this.dom = input;
        this.type = profileItemConfig.type;
        this.profileType = profileType;
        this.name = profileItemConfig.name;
    }

    ProfileItemInput.prototype.showFieldValue = function (profile) {
        if (this.type === 'checkbox') {
            this.dom.checked = profile[this.name];
        } else if (this.type === 'multiEnum') {
            this.multiEnumSelect.val(profile[this.name] === '' ? null : profile[this.name].split(',')).trigger('change');
        } else {
            this.dom.value = profile[this.name];
        }
        this.oldValue = profile[this.name];
    };

    ProfileItemInput.prototype.updateFieldValue = function (event) {
        const fieldName = this.name;
        const profileName = state[this.profileType].name;
        if (this.multiEnumSelect && this.multiEnumSelect.prop('disabled')) {
            return; // we need to trigger change event on multiEnumSelect to update selection.
            // It may be disabled so it has false positive call.
        }

        let value, val;
        switch (this.type) {
        case 'text':
        case 'string':
        case 'enum':
            val = this.dom.value;
            value = val;
            break;
        case 'number':
            if (Number.isNaN(this.dom.value)) {
                UI.alert(L10n.getValue('profiles-not-a-number'));
                this.dom.value = this.oldValue;
                return;
            }
            value = Number(this.dom.value);
            break;
        case 'checkbox':
            value = this.dom.checked;
            break;
        case 'multiEnum':
            value = this.multiEnumSelect.val().join(',');
            break;
        default:
            UI.handleError(new Errors.InternalError('errors-unexpected-switch-argument', [this.type]));
            return;
        }
        DBMS.updateProfileField({
            type: this.profileType,
            characterName: profileName,
            fieldName,
            itemType: this.type,
            value
        }).catch(UI.processError());
    };

    return innerExports;
};
