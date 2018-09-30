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
    const relationTableHeader = ['character-name', 'direct-relation', 'relation-origin', 'reverse-relation'];
    const partialTableHeader = ['character-name', 'direct-relation'];

    let makeNewRow;
    const l10n = L10n.get('briefings');

    const findRel = R.curry((fromCharacter, toCharacter, relations) => {
        const findFunc = R.curry((fromCharacter2, toCharacter2, rel) =>
            rel[fromCharacter2] !== undefined && rel[toCharacter2] !== undefined);
        return R.find(findFunc(fromCharacter, toCharacter), relations);
    });

    exports.makeRelationsContent = (data, isAdaptationsMode, profileSettings, externalRefresh) => {
        const {
            characterName, relationsSummary, profiles, profileBindings
        } = data;
        let { characterNamesArray } = data;

        characterNamesArray = characterNamesArray.filter(R.compose(R.not, R.equals(characterName), R.prop('value')));

        const get2ndCharName = ProjectUtils.get2ndRelChar(characterName);
        const showCharacters = relationsSummary.relations.map(get2ndCharName).sort(CommonUtils.charOrdA);
        const noRelsList = characterNamesArray.filter(R.compose(R.not, R.contains(R.__, showCharacters), R.prop('value')));
        const predicate = R.compose(R.contains(R.__, R.keys(relationsSummary.knownCharacters)), R.prop('value'));
        const [knownNoRels, unknownNoRels] = R.partition(predicate, noRelsList);

        const relationTmpl = wrapEl('div', qte('.relation-tmpl'));
        const qe = qee(relationTmpl);
        const content = qe('.relation-content');
        const getProfileItemSelect = () => qe('.profile-item-select');

        makeProfileItemSelector(qe('.profile-item-select'), profileSettings, refreshProfileItem(content, profiles));

        const makeRow = makeNewRow(
            profiles, getProfileItemSelect, isAdaptationsMode, relationsSummary.knownCharacters, profileBindings,
            externalRefresh, characterName
        );

        // filling header - need table body for callbacks
        const makeRowCallback = R.compose(addEl(content), makeRow);
        addEl(qe('.known-characters-label'), makeText(l10n('known-characters')));
        const knownBtn = addEl(qe('.add-known-character-relation'), makeText(getL10n('common-add')));
        addEl(qe('.unknown-characters-label'), makeText(l10n('unknown-characters')));
        const unknownBtn = addEl(qe('.add-unknown-character-relation'), makeText(getL10n('common-add')));
        addEl(qe('.profile-item-label'), makeText(l10n('profile-item')));
        fillCharSelector(qe('.known-characters-select'), knownBtn, knownNoRels, characterName, makeRowCallback);
        fillCharSelector(qe('.unknown-characters-select'), unknownBtn, unknownNoRels, characterName, makeRowCallback);

        // filling table
        const toCharacterFilter = toCharacter => (isAdaptationsMode ? true :
            !R.isEmpty(findRel(characterName, toCharacter, relationsSummary.relations)[characterName]));
        const findRelTmp = findRel(characterName, R.__, relationsSummary.relations);
        addEls(content, showCharacters.filter(toCharacterFilter).map(toChar => makeRow(toChar, findRelTmp(toChar))));
        return relationTmpl;
    };

    function refreshProfileItem(content, profiles) {
        return (event) => {
            const dataArr = queryElEls(content, '[toCharacter]');
            dataArr.forEach((el) => {
                const char = getAttr(el, 'toCharacter');
                const selectedName = event.target.value;
                fillProfileItemContent(el, selectedName, profiles[char][selectedName]);
            });
        };
    }

    function makeProfileItemSelector(select1, profileSettings, refresh) {
        select1 = $(select1);
        const tmpSelect = select1.select2(arr2Select2(profileSettings.map(R.prop('name')).sort()));

        select1.select2({ width: 'style' });
        tmpSelect.on('change', refresh);
        if (profileSettings[0]) {
            tmpSelect.val(profileSettings[0].name).trigger('change');
        }
    }

    makeNewRow = R.curry((
        profiles, getProfileItemSelect, isAdaptationsMode, knownCharacters, profileBindings,
        externalRefresh, fromCharacter, toCharacter, rel
    ) => {
        const stories = knownCharacters[toCharacter];
        const row = qmte('.relation-row-tmpl');
        const qe = qee(row);
        addEl(qe('.to-character-name'), makeText(`${toCharacter}/${profileBindings[toCharacter]}`));
        addEl(qe('.where-meets-label'), makeText(l10n('where-meets')));
        addEl(qe('.where-meets-content'), makeText(stories === undefined ? '' : R.keys(stories).join(', ')));
        setAttr(qe('[toCharacter]'), 'toCharacter', toCharacter);
        fillProfileItemContent(row, getProfileItemSelect().value, profiles[toCharacter][getProfileItemSelect().value]);
        listen(qe('button.remove'), 'click', (event) => {
            Utils.confirm(strFormat(l10n('are-you-sure-about-relation-removing'), [`${`${fromCharacter}-${toCharacter}`}`]), () => {
                DBMS.removeCharacterRelationNew({fromCharacter, toCharacter}).then(externalRefresh).catch(Utils.handleError);
            });
        });

        const directText = qe('.direct textarea');
        directText.value = rel[fromCharacter];
        setAttr(directText, 'placeholder', L10n.format('briefings', 'relation-from-to', [fromCharacter, toCharacter]));
        listen(directText, 'change', (event) => {
            DBMS.setCharacterRelationTextNew({
                fromCharacter, 
                toCharacter, 
                character: fromCharacter, 
                text:event.target.value
            }).catch(Utils.handleError);
        });

        Constants.relationEssences.forEach((name) => {
            const btn = qe(`.${name}`);
            $(btn).tooltip({
                title: L10n.format('briefings', `${name}`, [fromCharacter, toCharacter]),
                placement: 'top'
            });
            let attrName = name;
            if (rel.starter !== fromCharacter) {
                if (name === 'starterToEnder') attrName = 'enderToStarter';
                if (name === 'enderToStarter') attrName = 'starterToEnder';
            }
            setClassByCondition(btn, 'btn-primary', rel.essence.indexOf(attrName) !== -1);
            listen(btn, 'click', (event) => {
                DBMS.setRelationEssenceStatusNew({
                    fromCharacter, 
                    toCharacter, 
                    essence: attrName, 
                    flag: !hasClass(event.target, 'btn-primary')
                }).then(() => {
                    toggleClass(event.target, 'btn-primary');
                }).catch(Utils.handleError);
            });
        });

        const originText = qe('.origin textarea');
        originText.value = rel.origin;
        setAttr(originText, 'placeholder', l10n('relation-origin'));
        listen(originText, 'change', (event) => {
            DBMS.setOriginRelationTextNew({
                fromCharacter, 
                toCharacter, 
                text: event.target.value
            }).catch(Utils.handleError);
        });

        const reverseText = qe('.reverse textarea');
        reverseText.value = rel[toCharacter];
        setAttr(reverseText, 'placeholder', L10n.format('briefings', 'relation-from-to', [toCharacter, fromCharacter]));
        listen(reverseText, 'change', (event) => {
            DBMS.setCharacterRelationTextNew({
                fromCharacter, 
                toCharacter, 
                character: toCharacter,
                text: event.target.value
            }).catch(Utils.handleError);
        });

        const directChecked = rel.starter === fromCharacter ? rel.starterTextReady : rel.enderTextReady;
        fillFinishedButton(
            qe('.direct .finished'), JSON.stringify([fromCharacter, toCharacter]), fromCharacter,
            toCharacter, fromCharacter, directChecked, directText
        );

        const reverseChecked = rel.starter === toCharacter ? rel.starterTextReady : rel.enderTextReady;
        fillFinishedButton(
            qe('.reverse .finished'), JSON.stringify([toCharacter, fromCharacter]), fromCharacter,
            toCharacter, toCharacter, reverseChecked, reverseText
        );

        if (!isAdaptationsMode) {
            removeClass(qe('.direct'), 'col-xs-3');
            addClass(qe('.direct'), 'col-xs-9');
            addClass(qe('.origin'), 'hidden');
            addClass(qe('.reverse'), 'hidden');
        }
        L10n.localizeStatic(row);

        return row;
    });

    function fillFinishedButton(button, id, fromCharacter, toCharacter, character, checked, textarea) {
        setClassIf(button, 'btn-primary', checked);
        Utils.enableEl(textarea, !checked);
        button.id = id;
        listen(button, 'click', (event) => {
            const newValue = !hasClass(button, 'btn-primary');
            setClassByCondition(button, 'btn-primary', newValue);
            Utils.enableEl(textarea, !newValue);

            DBMS.setRelationReadyStatusNew({
                fromCharacter, 
                toCharacter, 
                character, 
                ready: newValue
            }).catch(Utils.handleError);
        });
    }

    function fillProfileItemContent(el, profileItemName, profileItemValue) {
        addEl(clearEl(qee(el, '.profile-item-name')), makeText(profileItemName));
        addEl(clearEl(qee(el, '.profile-item-value')), makeText(profileItemValue));
    }

    function fillCharSelector(select1, button, data, fromCharacter, makeRowCallback) {
        select1 = $(select1);
        const tmpSelect = select1.select2(getSelect2Data(data));
        select1.select2({ width: 'style' });
        listen(button, 'click', () => {
            const toCharacter = select1[0].value;
            DBMS.createCharacterRelationNew({fromCharacter, toCharacter}).then(() => {
                DBMS.getCharacterRelationNew({fromCharacter, toCharacter}).then((rel) => {
                    makeRowCallback(select1[0].value, rel);
                    data = data.filter(R.compose(R.not, R.equals(select1[0].value), R.prop('value')));
                    clearEl(select1[0]);
                    select1.select2(getSelect2Data(data));
                }).catch(Utils.handleError);
            }).catch(Utils.handleError);
        });
    }
})(this.RelationsPreview = {});
