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

function ProfileEditorTmpl(exports, opts) {
    
    const { firstType, secondType, settingsPath } = opts; 
    
    const tmplRoot = '.profile-editor2-tab-tmpl';
    const root = `.profile-editor2-tab.${firstType + '-type'} `;
    const state = {};
    const l10n = L10n.get('profiles');
    let profileEditorCore;
    const profileDiv = `${root}.profile-div`;
    const reportDiv = `${root}.report-div tbody`;
    
    exports.init = () => {
        profileEditorCore = ProfileEditorCore.makeProfileEditorCore();
        const el = queryEl(tmplRoot).cloneNode(true);
        addClasses(el, ['profile-editor2-tab', `${firstType + '-type'}`]);
        removeClass(el, 'profile-editor2-tab-tmpl');
        addEl(queryEl('.tab-container'), el);
        setClassByCondition(qee(el, '.report'), 'hidden', firstType === 'player');
        setAttr(qee(el, '.entity-filter'), 'l10n-placeholder-id', 'profiles-' + opts.filterPlaceholder);
        setAttr(qee(el, '.entity-filter'), 'placeholder', l10n(opts.filterPlaceholder));
        setAttr(qee(el, '.profile-panel h3'), 'l10n-id', 'profiles-' + opts.panelName);
        addEl(qee(el, '.profile-panel h3'), makeText(l10n(opts.panelName)));
        let a = qee(el,'.report a');
        setAttr(a , 'panel-toggler', root + ".report-div");
        UI.initPanelToggler(a);
        a = qee(el,'.profile-panel a');
        setAttr(a , 'panel-toggler', root + ".profile-div");
        UI.initPanelToggler(a);
        
        exports.content = el;
        listen(queryEl(`${root} .entity-filter`), 'input', filterOptions);
        listen(queryEl(`${root} .create`), 'click', () => Utils.prompt(l10n(opts.createMsg), createProfile));
    };

    exports.refresh = () => {
        PermissionInformer.getEntityNamesArray(firstType, true, (err, primaryNames) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray(secondType, true, (err2, secondaryNames) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getProfileBindings((err3, profileBindings) => {
                    if (err3) { Utils.handleError(err3); return; }
                    profileBindings = opts.processBindings(profileBindings);
                    rebuildInterface(primaryNames, secondaryNames, profileBindings);
                });
            });
        });
    };
    
    function rebuildInterface(primaryNames, secondaryNames, profileBindings){
        addEls(clearEl(queryEl(`${root} .entity-list`)), primaryNames.map( name => {
            const el = wrapEl('div', qte(`${root} .entity-item-tmpl` ));
            addEl(qee(el, '.primary-name'), makeText(name.value));
            setAttr(el, 'primary-name', name.value);
            if(profileBindings[name.value] !== undefined){
                addEl(qee(el, '.secondary-name'), makeText(profileBindings[name.value]));
                setAttr(el, 'secondary-name', profileBindings[name.value]);
            }
            listen(qee(el, '.select-button'), 'click', () => selectProfile(name.value));
            listen(qee(el, '.rename'), 'click', () => {
                Utils.prompt(l10n(opts.renameMsg), renameProfile(name.value), {
                    value: name.value
                })
            });
            listen(qee(el, '.remove'), 'click', removeProfile(firstType, name.value));
            return el;
        }));
        
        const callback = () => {
            selectProfile(UI.checkAndGetEntitySetting(settingsPath, primaryNames));
        }
        DBMS.getProfileStructure(firstType, (err2, allProfileSettings) => {
            if (err2) { Utils.handleError(err2); return; }
            profileEditorCore.initProfileStructure(profileDiv, firstType, allProfileSettings, callback);
        });
        
    }
    
    function selectProfile(name){
        UI.updateEntitySetting(settingsPath, name);
        queryEls(`${root} [primary-name] .select-button`).map(removeClass(R.__, 'btn-primary'));
        addClass(queryEl(`${root} [primary-name="${name}"] .select-button`), 'btn-primary');
        
        DBMS.getProfile(firstType, name, (err, profile) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.isEntityEditable(firstType, name, (err2, isProfileEditable) => {
                if (err2) { Utils.handleError(err2); return; }
                profileEditorCore.fillProfileInformation(profileDiv, firstType, profile, () => isProfileEditable);

                if (firstType === 'character') {
                    DBMS.getCharacterReport(name, (err3, characterReport) => {
                        if (err3) { Utils.handleError(err3); return; }
                        removeClass(queryEl(reportDiv), 'hidden');
                        addEls(clearEl(queryEl(reportDiv)), characterReport.map(ProfileEditor.makeReportRow));
                    });
                }
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
            selectProfile(els.length > 0 ? getAttr(els[0], 'primary-name') : null);
        }
    }
    
    function createProfile (value, onOk, onError){
        DBMS.createProfile(firstType, value, (err) => {
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
        DBMS.renameProfile(firstType, fromName, toName, (err) => {
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
            Utils.confirm(strFormat(l10n(opts.removeMsg), [name]), () => {
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
}

ProfileEditorTmpl(this.CharacterEditor = {}, {
    firstType: 'character', 
    secondType: 'player',
    settingsPath: 'Characters',
    processBindings: R.identity,
    createMsg: 'enter-character-name',
    renameMsg: 'enter-new-character-name',
    removeMsg: 'are-you-sure-about-character-removing',
    filterPlaceholder: 'find-character',
    panelName: 'character-profile',
});

ProfileEditorTmpl(this.PlayerEditor = {}, {
    firstType:  'player',
    secondType: 'character',
    settingsPath: 'Players',
    processBindings: R.invertObj,
    createMsg: 'enter-player-name',
    renameMsg: 'enter-new-player-name',
    removeMsg: 'are-you-sure-about-player-removing',
    filterPlaceholder: 'find-player',
    panelName: 'player-profile',
});
