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

"use strict";

(function(exports){

    var root = '.player-tab ';
    var characterProfileDiv = root + ".character-profile-div";
    var playerProfileDiv = root + ".player-profile-div";
    var playerHeader = root + '.player-profile-header';
    var characterHeader = root + '.character-profile-header';
    
    var profileEditorCore;
    
    exports.init = function() {
        profileEditorCore = ProfileEditorCore.makeProfileEditorCore();
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        DBMS.getWelcomeText(function(err, text){
            if(err) {Utils.handleError(err); return;}
            DBMS.getPlayerProfileInfo(function(err, profileInfo){
                if(err) {Utils.handleError(err); return;}
                DBMS.getPlayersOptions(function(err, playersOptions){
                    if(err) {Utils.handleError(err); return;}
                    buildInterface(text, profileInfo, playersOptions);
                });
            });
        });
    };
    
    var isEditable = function(profileName, profileStructure){
        return R.find(R.propEq('name', profileName), profileStructure).playerAccess === 'write';
    };
    
    var buildInterface = function(text, profileInfo, playersOptions){
        profileEditorCore.initProfileStructure(playerProfileDiv, 'player', profileInfo.player.profileStructure);
        profileEditorCore.fillProfileInformation(playerProfileDiv, 'player', profileInfo.player.profile, isEditable);
        addEl(clearEl(queryEl(playerHeader)), makeText(strFormat(getL10n('briefings-player-profile'), [profileInfo.player.profile.name])));
        
        if(profileInfo.character === undefined){
            addEl(clearEl(queryEl(characterHeader)), makeText(strFormat(getL10n('briefings-character-profile'), [''])));
            var el = clearEl(queryEl(characterProfileDiv));
            if(playersOptions.allowCharacterCreation){
                var label = addEl(makeEl('div'), makeText(getL10n('profiles-player-has-no-character-and-can-create-it')));
                var input = setAttr(makeEl('input'), 'placeholder', getL10n('profiles-character-name'));
                var button = addEl(makeEl('button'), makeText(getL10n('common-create')));
                listen(button, 'click', function(){
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
        
        queryEl(root + '.welcome-text-area'     ).value = text;
    };
    
})(this['Player']={});