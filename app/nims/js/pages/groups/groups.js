/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
 Utils, CharacterFilter, DBMS
 */

'use strict';

((exports) => {
    const state = {};

    exports.init = () => {
        const root = state;
        root.views = {};
        const nav = '.groups-tab .sub-tab-navigation';
        const content = '.groups-tab .sub-tab-content';
        const containers = {
            root,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
        Utils.addView(containers, 'group-profile', GroupProfile, { mainPage: true });
        Utils.addView(containers, 'group-schema', GroupSchema);
        Utils.addView(containers, 'investigation-board', InvestigationBoard);

        listen(queryEl('.groups-tab .create-entity-button'), 'click', exports.createGroup('.groups-tab', exports.refresh));
        listen(queryEl('.groups-tab .rename-entity-button'), 'click', exports.renameGroup('.groups-tab', exports.refresh));
        listen(queryEl('.groups-tab .remove-entity-button'), 'click', exports.removeGroup('.groups-tab', exports.refresh));

        exports.content = queryEl('.groups-tab');
    };

    exports.refresh = () => {
        PermissionInformer.getEntityNamesArray('group', true, Utils.processError((names) => {
            exports.rebuildInterface('.groups-tab', names);
            state.currentView.refresh();
        }));
    };

    exports.rebuildInterface = (selector, names) => {
        const data = getSelect2Data(names);

        clearEl(queryEl(`${selector} .rename-entity-select`));
        $(`${selector} .rename-entity-select`).select2(data);

        clearEl(queryEl(`${selector} .remove-entity-select`));
        $(`${selector} .remove-entity-select`).select2(data);
    }

    exports.createGroup = (selector, refresh) => () => {
        const input = queryEl(`${selector} .create-entity-input`);

        DBMS.createGroup(input.value.trim(), (err) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.refresh((err2) => {
                if (err2) { Utils.handleError(err2); return; }
                //                    if(Groups.currentView.updateSettings){
                //                        Groups.currentView.updateSettings(name);
                //                    }
                input.value = '';
                refresh();
            });
        });
    };

    exports.renameGroup = (selector, refresh) => () => {
        const toInput = queryEl(`${selector} .rename-entity-input`);
        const fromName = queryEl(`${selector} .rename-entity-select`).value.trim();
        DBMS.renameGroup(fromName, toInput.value.trim(), (err) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.refresh((err2) => {
                if (err2) { Utils.handleError(err2); return; }
                //                        if(Groups.currentView.updateSettings){
                //                            Groups.currentView.updateSettings(toName);
                //                        }
                toInput.value = '';
                refresh();
            });
        });
    };

    exports.removeGroup = (selector, refresh) => () => {
        const name = queryEl(`${selector} .remove-entity-select`).value.trim();
        Utils.confirm(strFormat(getL10n('groups-are-you-sure-about-group-removing'), [name]), () => {
            DBMS.removeGroup(name, (err) => {
                if (err) { Utils.handleError(err); return; }
                PermissionInformer.refresh((err2) => {
                    if (err2) { Utils.handleError(err2); return; }
                    refresh();
                });
            });
        });
    };
})(this.Groups = {});
