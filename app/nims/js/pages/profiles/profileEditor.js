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

((exports) => {
    const state = {
        character: {},
        player: {}
    };
    const root = '.profile-editor-tab ';
    const characterSelector = `${root}.character-profile-selector`;
    const playerSelector = `${root}.player-profile-selector`;
    const characterProfileDiv = `${root}.character-profile-div`;
    const playerProfileDiv = `${root}.player-profile-div`;
    const characterReportDiv = `${root}.character-report-div tbody`;
    let profileEditorCore;

    exports.init = () => {
        $(characterSelector).select2().on('select2:select', showProfileInfoDelegate2('character'));
        $(playerSelector).select2().on('select2:select', showProfileInfoDelegate2('player'));
        profileEditorCore = ProfileEditorCore.makeProfileEditorCore();
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        clearEl(queryEl(characterReportDiv));
        refreshPanel('character', characterSelector, characterProfileDiv, () => {
            refreshPanel('player', playerSelector, playerProfileDiv, () => {
                applySettings('character', characterSelector, characterProfileDiv);
            });
        });
    };

    function refreshPanel(type, selector, profileDiv, callback) {
        PermissionInformer.getEntityNamesArray(type, false, (err, names) => {
            if (err) { Utils.handleError(err); return; }

            names.push({ displayName: '', value: '', editable: false });

            clearEl(queryEl(selector));
            $(selector).select2(getSelect2Data(names));
            state[type].names = names;

            DBMS.getProfileStructure(type, (err2, allProfileSettings) => {
                if (err2) { Utils.handleError(err2); return; }
                profileEditorCore.initProfileStructure(profileDiv, type, allProfileSettings, callback);
            });
        });
    }

    function applySettings(type, selector, profileDiv) {
        const { names } = state[type];
        if (names.length > 0) {
            const name = names[0].value;
            const settings = DBMS.getSettings();
            if (!settings.ProfileEditor) {
                settings.ProfileEditor = {};
                settings.ProfileEditor[type] = name;
            }
            let profileName = settings.ProfileEditor[type];
            if (names.map(nameInfo => nameInfo.value).indexOf(profileName) === -1) {
                settings.ProfileEditor[type] = name;
                profileName = name;
            }
            showProfileInfoDelegate2(type)({ target: { value: profileName } });
        }
    }

    function selectProfiles(charName, playerName) {
        showProfileInfoDelegate('character', characterProfileDiv, charName);
        showProfileInfoDelegate('player', playerProfileDiv, playerName);
        $(characterSelector).select2().val(charName).trigger('change');
        $(playerSelector).select2().val(playerName).trigger('change');
    }

    function showProfileInfoDelegate2(type) {
        return (event) => {
            const name = event.target.value.trim();
            if (name === '') {
                selectProfiles('', '');
                return;
            }
            DBMS.getProfileBinding(type, name, (err, binding) => {
                if (err) { Utils.handleError(err); return; }
                selectProfiles(binding[0], binding[1]);
            });
        };
    }

    function showProfileInfoDelegate(type, profileDiv, name) {
        updateSettings(type, name);
        if (name === '') {
            addClass(queryEl(profileDiv), 'hidden');
            if (type === 'character') {
                addClass(queryEl(characterReportDiv), 'hidden');
            }
            return;
        }
        DBMS.getProfile(type, name, (err, profile) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.isEntityEditable(type, name, (err2, isCharacterEditable) => {
                if (err2) { Utils.handleError(err2); return; }
                profileEditorCore.fillProfileInformation(profileDiv, type, profile, () => isCharacterEditable);

                if (type === 'character') {
                    DBMS.getCharacterReport(name, (err3, characterReport) => {
                        if (err3) { Utils.handleError(err3); return; }
                        removeClass(queryEl(characterReportDiv), 'hidden');
                        addEls(
                            clearEl(queryEl(characterReportDiv)),
                            characterReport.map(CharacterReports.makeStoryReportRow)
                        );
                    });
                }
            });
        });
    }

    function updateSettings(type, name) {
        const settings = DBMS.getSettings();
        settings.ProfileEditor[type] = name;
    }
})(this.ProfileEditor = {});
