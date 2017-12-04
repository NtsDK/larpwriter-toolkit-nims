/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

(function (exports) {
    exports.makeProfileEditorCore = function () {
        const innerExports = {};

        const state = {
            character: {},
            player: {}
        };

        innerExports.initProfileStructure = function (profileDiv, type, profileStructure, callback) {
            const tbody = makeEl('tbody');
            addEl(clearEl(queryEl(profileDiv)), addEl(addClasses(makeEl('table'), ['table', 'table-striped']), tbody));

            state[type].inputItems = {};
            state[type].profileStructure = profileStructure;
            try {
                addEls(tbody, profileStructure.map(appendInput(type)));
            } catch (err) {
                Utils.handleError(err); return;
            }

            if (callback) callback();
        };

        var appendInput = R.curry((type, profileItemConfig) => {
            const itemInput = new ProfileItemInput(type, profileItemConfig);
            state[type].inputItems[profileItemConfig.name] = itemInput;
            return addEls(makeEl('tr'), [addEl(makeEl('td'), makeText(profileItemConfig.name)), addEl(makeEl('td'), itemInput.dom)]);
        });

        innerExports.fillProfileInformation = function (profileDiv, type, profile, isEditable) {
            removeClass(queryEl(profileDiv), 'hidden');
            R.values(state[type].inputItems).forEach((itemInput) => {
                if (itemInput.type === 'multiEnum') {
                    itemInput.multiEnumSelect.prop('disabled', !isEditable(itemInput.name, state[type].profileStructure));
                } else {
                    Utils.enableEl(itemInput.dom, isEditable(itemInput.name, state[type].profileStructure));
                }
            });

            state[type].name = profile.name;
            Object.values(state[type].inputItems).forEach((item) => {
                item.showFieldValue(profile);
            });
        };

        function ProfileItemInput(profileType, profileItemConfig) {
            let input;
            switch (profileItemConfig.type) {
            case 'text':
                input = makeEl('textarea');
                addClass(input, 'profileTextInput');
                break;
            case 'string':
                input = makeEl('input');
                addClass(input, 'profileStringInput');
                break;
            case 'enum':
                input = makeEl('select');
                addClass(input, 'profileSelectInput');
                fillSelector(input, profileItemConfig.value.split(',').map(R.compose(R.zipObj(['name']), R.append(R.__, []))));
                break;
            case 'number':
                input = makeEl('input');
                input.type = 'number';
                break;
            case 'checkbox':
                input = makeEl('input');
                input.type = 'checkbox';
                break;
            case 'multiEnum':
                this.multiEnumSelect = $('<select></select>');
                setAttr(this.multiEnumSelect[0], 'style', 'width: 400px;');
                addClass(this.multiEnumSelect[0], 'common-select');
                addClass(this.multiEnumSelect[0], 'profileStringInput');
                input = $('<span></span>').append(this.multiEnumSelect)[0];
                setAttr(this.multiEnumSelect[0], 'multiple', 'multiple');

                var sel = this.multiEnumSelect.select2(arr2Select2(profileItemConfig.value.split(',')));

                sel.on('change', this.updateFieldValue.bind(this));
                break;
            default:
                throw new Errors.InternalError('errors-unexpected-switch-argument', [profileItemConfig.type]);
            }

            if (profileItemConfig.type !== 'multiEnum') {
                listen(input, 'change', this.updateFieldValue.bind(this));
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
                return; // we need to trigger change event on multiEnumSelect to update selection. It may be disabled so it has false positive call.
            }

            let value;
            switch (this.type) {
            case 'text':
            case 'string':
            case 'enum':
                value = this.dom.value;
                break;
            case 'number':
                if (isNaN(this.dom.value)) {
                    Utils.alert(getL10n('profiles-not-a-number'));
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
                Utils.handleError(new Errors.InternalError('errors-unexpected-switch-argument', [this.type]));
                return;
            }
            DBMS.updateProfileField(this.profileType, profileName, fieldName, this.type, value, Utils.processError());
        };

        return innerExports;
    };
}(this.ProfileEditorCore = {}));
