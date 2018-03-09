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
    
    const root = '.characters-tab ';
    const state = {};
    const settingsPath = 'Characters';
    const l10n = L10n.get('profiles');
    let profileEditorCore;
    const characterProfileDiv = `${root}.character-profile-div`;
    const characterReportDiv = `${root}.character-report-div tbody`;
    
    exports.init = () => {
        listen(queryEl(`${root} .entity-filter`), 'input', filterOptions);
        listen(queryEl(`${root} .create`), 'click', () => Utils.prompt(l10n('enter-character-name'), createProfile));
        profileEditorCore = ProfileEditorCore.makeProfileEditorCore();
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        PermissionInformer.getEntityNamesArray('character', true, (err, characterNames) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray('player', true, (err2, playerNames) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getProfileBindings((err3, profileBindings) => {
                    if (err3) { Utils.handleError(err3); return; }
                    rebuildInterface(characterNames, playerNames, profileBindings);
//                    rebuildInterface(characterRoot, characterNames);
//                    rebuildInterface(playerRoot, playerNames);
//                    state.currentView.refresh();
                });
            });
        });
    };
    
    function rebuildInterface(characterNames, playerNames, profileBindings){
        addEls(clearEl(queryEl(`${root} .entity-list`)), characterNames.map( name => {
            const el = wrapEl('div', qte(`${root} .entity-item-tmpl` ));
            addEl(qee(el, '.primary-name'), makeText(name.value));
            setAttr(el, 'primary-name', name.value);
            if(profileBindings[name.value] !== undefined){
                addEl(qee(el, '.secondary-name'), makeText(profileBindings[name.value]));
                setAttr(el, 'secondary-name', profileBindings[name.value]);
            }
            listen(qee(el, '.select-button'), 'click', () => selectCharacter(name.value));
            listen(qee(el, '.rename'), 'click', () => {
                Utils.prompt(l10n('enter-new-character-name'), renameProfile(name.value), {
                    value: name.value
                })
            });
            listen(qee(el, '.remove'), 'click', removeProfile('character', name.value));
            return el;
        }));
        
        const callback = () => {
            const characterName = UI.checkAndGetEntitySetting(settingsPath, characterNames);
            selectCharacter(characterName);
        }
        DBMS.getProfileStructure('character', (err2, allProfileSettings) => {
            if (err2) { Utils.handleError(err2); return; }
            profileEditorCore.initProfileStructure(characterProfileDiv, 'character', allProfileSettings, callback);
        });
        
    }
    
    function selectCharacter(characterName){
        UI.updateEntitySetting(settingsPath, characterName);
        queryEls(`${root} [primary-name] .select-button`).map(removeClass(R.__, 'btn-primary'));
        addClass(queryEl(`${root} [primary-name="${characterName}"] .select-button`), 'btn-primary');
        
        DBMS.getProfile('character', characterName, (err, profile) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.isEntityEditable('character', characterName, (err2, isCharacterEditable) => {
                if (err2) { Utils.handleError(err2); return; }
                profileEditorCore.fillProfileInformation(characterProfileDiv, 'character', profile, () => isCharacterEditable);

//                if (type === 'character') {
                    DBMS.getCharacterReport(characterName, (err3, characterReport) => {
                        if (err3) { Utils.handleError(err3); return; }
                        removeClass(queryEl(characterReportDiv), 'hidden');
                        addEls(clearEl(queryEl(characterReportDiv)), characterReport.map(ProfileEditor.makeReportRow));
                    });
//                }
            });
        });
    }
    
    function filterOptions(event){
        const str = event.target.value.toLowerCase();
        
        const els = queryEls(`${root} [primary-name]`);
        els.forEach(el => {
            let isVisible = getAttr(el, 'primary-name').toLowerCase().search(str) !== -1;
            if(!isVisible && getAttr(el, 'secondary-name') !== null){
                isVisible = getAttr(el, 'secondary-name').toLowerCase().search(str) !== -1;
            }
            setClassByCondition(el, 'hidden', !isVisible);
        });
        
        if(queryEl(`${root} .hidden[primary-name] .select-button.btn-primary`) !== null || 
            queryEl(`${root} [primary-name] .select-button.btn-primary`) === null) {
            const els = queryEls(`${root} [primary-name]`).filter(R.pipe(hasClass(R.__, 'hidden'), R.not));
            selectCharacter(els.length > 0 ? getAttr(els[0], 'primary-name') : null);
        }
    }
    
    function createProfile (value, onOk, onError){
        DBMS.createProfile('character', value, (err) => {
            if (err) {
                onError(err);
            } else {
                onOk();
                UI.updateEntitySetting(settingsPath, value);
                exports.refresh();
            }
        });
    };
    
    var renameProfile = R.curry((fromName, toName, onOk, onError) => {
        DBMS.renameProfile('character', fromName, toName, (err) => {
            if (err) {
                onError(err);
            } else {
                onOk();
                UI.updateEntitySetting(settingsPath, toName);
                exports.refresh();
            }
        });
    });
    
    function removeProfile(type, name) {
        return () => {
            Utils.confirm(strFormat(getL10n('profiles-are-you-sure-about-character-removing'), [name]), () => {
                DBMS.removeProfile(type, name, (err) => {
                    if (err) { Utils.handleError(err); return; }
                    PermissionInformer.refresh((err2) => {
                        if (err2) { Utils.handleError(err2); return; }
                        exports.refresh();
                    });
                });
            });
        };
    }
})(this.Characters = {});
