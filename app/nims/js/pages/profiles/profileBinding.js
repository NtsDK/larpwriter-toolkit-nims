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
    const root = '.profile-binding-tab ';

    exports.init = () => {
        listen(queryEl(`${root}.create-binding-button`), 'click', createBinding);
        listen(queryEl(`${root}.remove-binding-button`), 'click', removeBinding);
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        PermissionInformer.getEntityNamesArray('character', false, (err, characterNames) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray('player', false, (err2, playerNames) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getProfileBindings((err3, profileBindings) => {
                    if (err3) { Utils.handleError(err3); return; }

                    const bondedCharacterList = R.keys(profileBindings);
                    const bondedPlayerList = R.values(profileBindings);
                    const filter = list => R.compose(R.not, R.contains(R.__, list), R.prop('value'));

                    fillSelector(
                        clearEl(queryEl(`${root}.character-selector`)),
                        characterNames.filter(filter(bondedCharacterList)).map(remapProps4Select)
                    );
                    fillSelector(
                        clearEl(queryEl(`${root}.player-selector`)),
                        playerNames.filter(filter(bondedPlayerList)).map(remapProps4Select)
                    );
                    const bindings = R.toPairs(profileBindings).map(binding => ({
                        name: R.join('/', binding),
                        value: JSON.stringify(binding)
                    }));
                    bindings.sort(CommonUtils.charOrdAFactory(R.prop('name')));
                    fillSelector(clearEl(queryEl(`${root}.binding-selector`)), bindings);
                });
            });
        });
    };

    function createBinding() {
        const characterName = queryEl(`${root}.character-selector`).value;
        const playerName = queryEl(`${root}.player-selector`).value;

        if (characterName === '' || playerName === '') {
            Utils.alert(getL10n('binding-character-or-player-not-selected'));
            return;
        }

        DBMS.createBinding(characterName, playerName, Utils.processError(exports.refresh));
    }

    function removeBinding() {
        const bindingVal = queryEl(`${root}.binding-selector`).value;

        if (bindingVal === '') {
            Utils.alert(getL10n('binding-binding-is-not-selected'));
            return;
        }
        const binding = JSON.parse(bindingVal);

        DBMS.removeBinding(binding[0], binding[1], Utils.processError(exports.refresh));
    }
})(this.ProfileBinding = {});
