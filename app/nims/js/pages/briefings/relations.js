/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
    const root = '.relations-tab ';
    const state = {};
    const settingsPath = 'Relations';

    exports.init = () => {
        $(`${root} .character-select`).select2().on('change', buildContent);
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        clearEl(queryEl(`${root} .character-select`));
        clearEl(queryEl(`${root} .panel-body`));

        Promise.all([
            DBMS.getProfileStructure({type: 'character'}),
            PermissionInformer.getEntityNamesArray({type: 'character', editableOnly: false})
        ]).then(results => {
            const [characterProfileStructure, names] = results;
            state.characterProfileStructure = characterProfileStructure;

            showEl(qe(`${root} .alert`), names.length < 2);
            showEl(qe(`${root} > .panel`), names.length > 1);

            if (names.length > 0) {
                const characterName = UI.checkAndGetEntitySetting(settingsPath, names);
                const data = getSelect2Data(names);
                // this call trigger buildContent
                $(`${root} .character-select`).select2(data).val(characterName).trigger('change');
            }
        }).catch(Utils.handleError);
    };

    function buildContent(event) {
        clearEl(queryEl(`${root} .panel-body`));
        const characterName = event.target.value;
        UI.updateEntitySetting(settingsPath, characterName);
        state.data = {};
        state.data.characterName = characterName;
        exports.load(state.data, buildContentInner);
    }

    function buildContentInner() {
        const content = RelationsPreview.makeRelationsContent(
            state.data, true, state.characterProfileStructure,
            exports.refresh
        );
        addEl(queryEl(`${root} .panel-body`), content);
        UI.initTextAreas(`${root} .panel-body textarea`);
        UI.refreshTextAreas(`${root} .panel-body textarea`);
    }

    exports.load = (data, callback) => {
        Promise.all([
            DBMS.getAllProfiles({type:'character'}),
            DBMS.getRelationsSummary({characterName: data.characterName}),
            DBMS.getExtendedProfileBindings(),
            PermissionInformer.getEntityNamesArray({type: 'character', editableOnly: false})
        ]).then(results => {
            const [profiles, relationsSummary, profileBindings, characterNamesArray] = results;
            data.relationsSummary = relationsSummary;
            data.characterNamesArray = characterNamesArray;
            data.profiles = profiles;
            data.profileBindings = R.fromPairs(profileBindings);
            callback();
        }).catch(Utils.handleError);
    };
})(this.Relations = {});
