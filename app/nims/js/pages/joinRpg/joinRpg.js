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
    const root = '.joinrpg-tab ';
    const state = {
        profileMetaFixes: [],
        characterListFixes: [],
        characterProfilesFixes: [],
    };

    exports.init = () => {
        state.usernameInput = qe(`${root} .username`);
        state.passwordInput = qe(`${root} .password`);
        state.gameIdInput = qe(`${root} .gameId`);
        state.isValidSpan = qe(`${root} .isValid`);
        state.getDataBtn = qe(`${root} .get-data`);
        state.getDataForceBtn = qe(`${root} .get-data-force`);
        state.spendTimeSpan = qe(`${root} .spendTime`);

        state.fixProfileStructureBtn = qe(`${root} .fix-profile-structure`);
        state.fixCharacterListBtn = qe(`${root} .fix-character-list`);
        state.fixCharacterProfilesBtn = qe(`${root} .fix-character-profiles`);

        listen(state.usernameInput, 'input', onSettingsChange);
        listen(state.passwordInput, 'input', onSettingsChange);
        listen(state.gameIdInput, 'input', onSettingsChange);
        listen(state.getDataBtn, 'click', onGetData);
        listen(state.getDataForceBtn, 'click', onGetDataForce);
        listen(state.fixProfileStructureBtn, 'click', fixProfileStructure);
        listen(state.fixCharacterListBtn, 'click', fixCharacterList);
        listen(state.fixCharacterProfilesBtn, 'click', fixCharacterProfiles);

        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        DBMS.getJoinRpgSettings( (err, settings) => {
            if (err) { Utils.handleError(err); return; }
            state.usernameInput.value = settings.username; 
            state.passwordInput.value = settings.password; 
            state.gameIdInput.value = settings.gameId; 
            DBMS.isJoinRpgCredentialsValid( (err, isValid) => {
                if (err) { Utils.handleError(err); return; }
                addEl(clearEl(state.isValidSpan), makeText(isValid));
                // console.log('isValid' + isValid);
            });
        });
    };

    function processReceivedData(data) {
        state.externalProfileMeta = extractProfileMeta(data);
        console.log(state.externalProfileMeta);
        Promise.all([
            processProfileStructure(data),
            processCharacterList(data),
        ]).then( res => {
            processCharacterProfiles(data);
        }).catch(err =>{
            hideEl(state.fixCharacterProfilesBtn, true);
            addEl(clearEl(qe(`${root} .character-profiles-panel .errors`)), 
                makeText('Невозможно выполнить операцию до устранения ошибок в досье и списке персонажей.'));
            console.log(err);
        });
    }


    function processCharacterProfiles(data) {
        state.characterProfilesFixes = [];
        DBMS.getAllProfiles('character', (err, nimsProfiles) => {
            if (err) { Utils.handleError(err); return; }
            const charId2NameMap = data.waData.charId2NameMap;
            const id2Charname = id => charId2NameMap[String(id)] + '-' + String(id);
            const joinId2ItemName = data.profileMeta.Fields.reduce( (acc, item) => {
                acc[(item.ProjectFieldId)] = item.FieldName;
                return acc;
            }, {});
            const joinMetaIndex = R.indexBy(R.prop('ProjectFieldId'), data.profileMeta.Fields);
            console.log(joinId2ItemName);
            const errors = [];
            const errorsDiv = clearEl(qe(`${root} .character-profiles-panel .notes`));
            data.characterData.forEach( joinCharacter => {
                const characterName = id2Charname(joinCharacter.CharacterId);
                const nimsCharacter = nimsProfiles[characterName];
                joinCharacter.Fields.forEach(field => {
                    // dont process dropdown-enums this moment
                    const joinItemType = joinMetaIndex[field.ProjectFieldId].FieldType;
                    if(joinItemType === 'Dropdown'){
                        return;
                    }

                    const joinItemName = joinId2ItemName[field.ProjectFieldId];
                    if(nimsCharacter[joinItemName] !== field.DisplayString) {
                        // errors.push(`Персонаж ${characterName}, поле ${joinItemName}, в НИМСе "${nimsCharacter[joinItemName].substring(0,20)}", в JoinRpg "${field.DisplayString.substring(0,20)}"`);
                        errors.push({
                            characterName,
                            joinItemName,
                            nimsContent: nimsCharacter[joinItemName].substring(0,40),
                            joinContent: field.DisplayString.substring(0,40)
                        });
                        state.characterProfilesFixes.push({
                            func: 'updateProfileField',
                            args: ['character', characterName, joinItemName, joinItemType.toLowerCase(), field.DisplayString]
                        });
                        // updateProfileField = function (type, characterName, fieldName, itemType, value
                    }
                })
            });

            showEl(state.fixCharacterProfilesBtn, errors.length > 0);
            const errorsBody = clearEl(qe(`${root} .character-profiles-panel tbody`));
            if(errors.length > 0) {
                addEls(errorsBody, errors.map(error => {
                    const row = qmte(`${root} .character-profiles-row-tmpl`);
                    addEl(qee(row, '.character-name'), makeText(error.characterName));
                    addEl(qee(row, '.join-item-name'), makeText(error.joinItemName));
                    addEl(qee(row, '.nims-content'), makeText(error.nimsContent));
                    addEl(qee(row, '.join-content'), makeText(error.joinContent));
                    return row;
                }));
            } else {
                addEl(errorsDiv, makeText('Данные персонажей актуальны.'));
            }
        });
    }

    function processCharacterList(data) {
        return new Promise((resolve, reject) => {
            state.characterListFixes = [];
            PermissionInformer.getEntityNamesArray('character', false, (err, nimsCharacterNames) => {
                if (err) { Utils.handleError(err); return; }
                nimsCharacterNames = nimsCharacterNames.map(R.prop('value'));
                const charId2NameMap = data.waData.charId2NameMap;
                const joinCharacterNames = data.characterList.map(R.prop('CharacterId')).map(id => charId2NameMap[String(id)] + '-' + String(id));
                const characterDiff = R.difference(joinCharacterNames, nimsCharacterNames);
                const errorsDiv = clearEl(qe(`${root} .character-list-panel .errors`));
                showEl(state.fixCharacterListBtn, characterDiff.length > 0);
                if(characterDiff.length > 0){
                    addEls(errorsDiv, characterDiff.map(char => {
                        state.characterListFixes.push({
                            func: 'createProfile',
                            args: ['character', String(char)]
                        });
                        return addEl(makeEl('div'), makeText(`Персонажа ${char} не существует.`));
                    }));
                    reject();
                } else {
                    addEl(errorsDiv, makeText('Список персонажей совместим.'));
                    resolve();
                }
                
            });
        })
    }

    function processProfileStructure(data) {
        return new Promise((resolve, reject) => {
            DBMS.getProfileStructure('character', (err, characterProfileStructure) => {
                if (err) { Utils.handleError(err); return; }
                const nimsMeta = R.indexBy(R.prop('name'), characterProfileStructure);
                const joinMeta = R.indexBy(R.prop('name'), state.externalProfileMeta);
                // console.log(nimsMeta, joinMeta);
                const diff = [];
                state.profileMetaFixes = [];
                let itemCounter = characterProfileStructure.length;
                R.keys(joinMeta).forEach(joinFieldName => {
                    const joinField = joinMeta[joinFieldName];
                    if(nimsMeta[joinFieldName] === undefined) {
                        diff.push({
                            item: joinFieldName,
                            problem: 'Отсутствует в досье персонажа НИМС'
                        });
                        state.profileMetaFixes.push({
                            func: 'createProfileItem',
                            args: ['character', joinFieldName, joinField.type, itemCounter]
                        });
                        if(joinField.type === 'enum'){
                            state.profileMetaFixes.push({
                                func: 'updateDefaultValue',
                                args: ['character', joinFieldName, joinField.value]
                            });
                        }
                        itemCounter++;
                    } else if(joinField.type === 'enum') {
                        // TODO enum process
                        const joinEnumValues = joinField.value.split(',').map(R.trim);
                        const nimsEnumValues = nimsMeta[joinFieldName].value.split(',').map(R.trim);
                        const enumDiff = R.difference(joinEnumValues, nimsEnumValues);
                        if(enumDiff.length > 0) {
                            diff.push({
                                item: joinFieldName,
                                problem: `Выбор не содержит следующих элементов "${enumDiff.join(',')}".`
                            });
                            state.profileMetaFixes.push({
                                func: 'updateDefaultValue',
                                args: ['character', joinFieldName, nimsEnumValues.concat(enumDiff).join(',')]
                            });
                        }
                    }
                });

                const notesDiv = clearEl(qe(`${root} .profile-structure-panel .notes`));

                const delta = R.difference(R.keys(nimsMeta), R.keys(joinMeta));
                if(delta.length > 0) {
                    const text = 'Следующие поля есть в НИМСе, но нет в JoinRpg: ' + delta.join(', ');
                    addEl(notesDiv, addEl(makeEl('div'), makeText(text)));
                }

                showEl(state.fixProfileStructureBtn, diff.length > 0);
                showEl(qe(`${root} .profile-structure-panel table`), diff.length > 0);
                const errorsBody = clearEl(qe(`${root} .profile-structure-panel tbody`));
                if(diff.length > 0){
                    addEls(errorsBody, diff.map(error => {
                        const row = qmte(`${root} .profile-structure-row-tmpl`);
                        addEl(qee(row, '.item-name'), makeText(error.item));
                        addEl(qee(row, '.problem-description'), makeText(error.problem));
                        return row;
                    }));
                    reject();
                } else {
                    addEl(notesDiv, addEl(makeEl('div'), makeText('Структура досье совместима.')));
                    resolve();
                }
            })
        });
    }

    var applyFixes = R.curry(function (fixesList) {
        let index = 0;
        function applyFix() {
            if(index < state[fixesList].length) {
                const fix = state[fixesList][index];
                const args = fix.args.concat(function(err){
                    if (err) { Utils.handleError(err); return; }
                    index++;
                    applyFix();
                })
                DBMS[fix.func].apply(null, args);
            } else {
                onGetData();
            }
        }
        applyFix();
    });

    var fixCharacterList = () => applyFixes('characterListFixes');
    var fixCharacterProfiles = () => applyFixes('characterProfilesFixes');
    var fixProfileStructure = () => applyFixes('profileMetaFixes');

    function extractProfileMeta(data) {
        return data.profileMeta.Fields.map( item => {
            const localItem = {
                name: item.FieldName,
                doExport: true
            };
            switch(item.FieldType) {
                case 'Text':
                    localItem.value = '';
                    localItem.type = 'text';
                    break;
                case 'String':
                    localItem.value = '';
                    localItem.type = 'string';
                    break;
                case 'Dropdown':
                    localItem.value = R.concat(['ничего не выбрано'], item.ValueList.map(R.prop('Label'))
                        .map(R.trim).map(R.replace(/,/, ''))).join(',');
                    localItem.type = 'enum';
                    break;
                default:
                    console.log('Unknown', item);
            }
            return localItem;
        });
    }

    function onGetData () {
        startTimer();
        DBMS.getJoinRpgData(true, (err, data) => {
            clearInterval(state.dataLoadTimer);
            if (err) { Utils.handleError(err); return; }
            console.log(data);
            processReceivedData(data);
        });
    }
    function onGetDataForce () {
        startTimer();
        DBMS.getJoinRpgData(false, (err, data) => {
            clearInterval(state.dataLoadTimer);
            if (err) { Utils.handleError(err); return; }
            console.log(data);
            processReceivedData(data);
        });
    }

    function startTimer() {
        // clearEl(state.spendTimeSpan);
        addEl(clearEl(state.spendTimeSpan), makeText('0 сек.'));
        let counter = 0;
        state.dataLoadTimer = setInterval(function(){
            counter++;
            addEl(clearEl(state.spendTimeSpan), makeText((counter/10) + ' сек.'))
        }, 100);
    }

    function onSettingsChange() {
        clearEl(state.isValidSpan);
        clearTimeout(state.timeMark);
        state.timeMark = setTimeout(() => {
            DBMS.setJoinRpgSettings({
                username: state.usernameInput.value,
                password: state.passwordInput.value,
                gameId: state.gameIdInput.value,
            }, (err) => {
                if (err) { Utils.handleError(err); return; }
                DBMS.isJoinRpgCredentialsValid( (err, isValid) => {
                    if (err) { Utils.handleError(err); return; }
                    // console.log('isValid' + isValid);
                    addEl(clearEl(state.isValidSpan), makeText(isValid));
                });
            });
            // console.log('sdfsfd')
        }, 200);
    }
})(this.JoinRpg = {});
