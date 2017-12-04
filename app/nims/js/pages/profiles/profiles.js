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
 Utils, ProfileEditor, ProfileConfigurer, DBMS
 */

'use strict';

(function (exports) {
    const state = {};
    const root = '.profiles-tab ';
    const characterRoot = `${root}.character-profile-panel `;
    const playerRoot = `${root}.player-profile-panel `;

    exports.init = function () {
        state.views = {};
        const nav = `${root}.sub-tab-navigation`;
        const content = `${root}.sub-tab-content`;
        const containers = {
            root: state,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
        Utils.addView(containers, 'profile-editor', ProfileEditor, { mainPage: true });
        Utils.addView(containers, 'profile-constructor', ProfileConfigurer);
        Utils.addView(containers, 'profile-binding', ProfileBinding);

        listen(queryEl(`${characterRoot}.create-entity-button`), 'click', createProfile('character', characterRoot));
        listen(queryEl(`${characterRoot}.rename-entity-button`), 'click', renameProfile('character', characterRoot));
        listen(queryEl(`${characterRoot}.remove-entity-button`), 'click', removeProfile('character', characterRoot));

        listen(queryEl(`${playerRoot}.create-entity-button`), 'click', createProfile('player', playerRoot));
        listen(queryEl(`${playerRoot}.rename-entity-button`), 'click', renameProfile('player', playerRoot));
        listen(queryEl(`${playerRoot}.remove-entity-button`), 'click', removeProfile('player', playerRoot));

        exports.content = queryEl(root);
    };

    exports.refresh = function () {
        PermissionInformer.getEntityNamesArray('character', true, (err, characterNames) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray('player', true, (err, playerNames) => {
                if (err) { Utils.handleError(err); return; }
                rebuildInterface(characterRoot, characterNames);
                rebuildInterface(playerRoot, playerNames);
                state.currentView.refresh();
            });
        });
    };

    var rebuildInterface = function (root, names) {
        const data = getSelect2Data(names);

        clearEl(queryEl(`${root}.rename-entity-select`));
        $(`${root}.rename-entity-select`).select2(data);

        clearEl(queryEl(`${root}.remove-entity-select`));
        $(`${root}.remove-entity-select`).select2(data);
    };

    var createProfile = function (type, root) {
        return function () {
            const input = queryEl(`${root}.create-entity-input`);
            const name = input.value.trim();

            DBMS.createProfile(type, name, (err) => {
                if (err) { Utils.handleError(err); return; }
                PermissionInformer.refresh((err) => {
                    if (err) { Utils.handleError(err); return; }
                    if (state.currentView.updateSettings) {
                        state.currentView.updateSettings(name);
                    }
                    input.value = '';
                    exports.refresh();
                });
            });
        };
    };

    var renameProfile = function (type, root) {
        return function () {
            const toInput = queryEl(`${root}.rename-entity-input`);
            const fromName = queryEl(`${root}.rename-entity-select`).value.trim();
            const toName = toInput.value.trim();

            DBMS.renameProfile(type, fromName, toName, (err) => {
                if (err) { Utils.handleError(err); return; }
                PermissionInformer.refresh((err) => {
                    if (err) { Utils.handleError(err); return; }
                    toInput.value = '';
                    if (state.currentView.updateSettings) {
                        state.currentView.updateSettings(type, toName);
                    }
                    exports.refresh();
                });
            });
        };
    };

    var removeProfile = function (type, root) {
        return function () {
            const name = queryEl(`${root}.remove-entity-select`).value.trim();

            Utils.confirm(strFormat(getL10n('profiles-are-you-sure-about-character-removing'), [name]), () => {
                DBMS.removeProfile(type, name, (err) => {
                    if (err) { Utils.handleError(err); return; }
                    PermissionInformer.refresh((err) => {
                        if (err) { Utils.handleError(err); return; }
                        exports.refresh();
                    });
                });
            });
        };
    };
}(this.Profiles = {}));
