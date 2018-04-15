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

((exports) => {
    const root = '.player-tab ';
    const characterProfileDiv = `${root}.character-profile-div`;
    const playerProfileDiv = `${root}.player-profile-div`;
    const playerHeader = `${root}.player-profile-header`;
    const characterHeader = `${root}.character-profile-header`;

    let profileEditorCore;

    exports.init = () => {
        profileEditorCore = ProfileEditorCore.makeProfileEditorCore();
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        DBMS.getWelcomeText((err, text) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getPlayerProfileInfo((err2, profileInfo) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getPlayersOptions((err3, playersOptions) => {
                    if (err3) { Utils.handleError(err3); return; }
                    buildInterface(text, profileInfo, playersOptions);
                });
            });
        });
    };

    function isEditable(profileName, profileStructure) {
        return R.find(R.propEq('name', profileName), profileStructure).playerAccess === 'write';
    }

    function buildInterface(text, profileInfo, playersOptions) {
        profileEditorCore.initProfileStructure(playerProfileDiv, 'player', profileInfo.player.profileStructure);
        profileEditorCore.fillProfileInformation(playerProfileDiv, 'player', profileInfo.player.profile, isEditable);
        addEl(clearEl(queryEl(playerHeader)), makeText(strFormat(getL10n('briefings-player-profile'), [profileInfo.player.profile.name])));

        if (profileInfo.character === undefined) {
            addEl(clearEl(queryEl(characterHeader)), makeText(strFormat(getL10n('briefings-character-profile'), [''])));
            const el = clearEl(queryEl(characterProfileDiv));
            if (playersOptions.allowCharacterCreation) {
                const label = addEl(makeEl('div'), makeText(getL10n('profiles-player-has-no-character-and-can-create-it')));
                addClass(label, 'margin-bottom-8');
                const input = setAttr(makeEl('input'), 'placeholder', getL10n('profiles-character-name'));
                addClass(input, 'form-control margin-bottom-8');
                const button = addEl(makeEl('button'), makeText(getL10n('common-create')));
                addClass(button, 'btn btn-default');
                listen(button, 'click', () => {
                    DBMS.createCharacterByPlayer(input.value.trim(), Utils.processError(exports.refresh));
                });
                addEls(el, [label, input, button]);
            } else {
                addEl(el, addEl(makeEl('span'), makeText(getL10n('profiles-player-has-no-character-and-cant-create-it'))));
            }
        } else {
            profileEditorCore.initProfileStructure(characterProfileDiv, 'character', profileInfo.character.profileStructure);
            profileEditorCore.fillProfileInformation(characterProfileDiv, 'character', profileInfo.character.profile, isEditable);
            addEl(clearEl(queryEl(characterHeader)), makeText(strFormat(getL10n('briefings-character-profile'), [profileInfo.character.profile.name])));
        }

        queryEl(`${root}.welcome-text-area`).value = text;
    }
})(this.Player = {});
