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

// const ProjectUtils = require('../../../../dbms_nims/db-utils/projectUtils');
const ProjectUtils = require('dbms-nims/db-utils/projectUtils');
// const ProjectUtils = require('../db-utils/projectUtils');
//const Constants = require('dbms/constants');
//const R = require('ramda');

const relationTableHeader = ['character-name', 'direct-relation', 'relation-origin', 'reverse-relation'];
const partialTableHeader = ['character-name', 'direct-relation'];

let makeNewRow;
const l10n = L10n.get('briefings');

const findRel = R.curry((fromCharacter, toCharacter, relations) => {
    const findFunc = R.curry((fromCharacter2, toCharacter2, rel) => rel[fromCharacter2] !== undefined && rel[toCharacter2] !== undefined);
    return R.find(findFunc(fromCharacter, toCharacter), relations);
});

exports.makeRelationsContent = (data, isAdaptationsMode, profileSettings, externalRefresh) => {
    const {
        characterName, relationsSummary, profiles, profileBindings
    } = data;
    let { characterNamesArray } = data;

    characterNamesArray = characterNamesArray.filter(R.compose(R.not, R.equals(characterName), R.prop('value')));

    const get2ndCharName = ProjectUtils.get2ndRelChar(characterName);
    const showCharacters = relationsSummary.relations.map(get2ndCharName).sort(CU.charOrdA);
    const noRelsList = characterNamesArray.filter(R.compose(R.not, R.contains(R.__, showCharacters), R.prop('value')));
    const predicate = R.compose(R.contains(R.__, R.keys(relationsSummary.knownCharacters)), R.prop('value'));
    const [knownNoRels, unknownNoRels] = R.partition(predicate, noRelsList);

    const relationTmpl = U.wrapEl('div', U.qte('.relation-tmpl'));
    const tmplQe = U.qee(relationTmpl);
    const content = tmplQe('.relation-content');
    const getProfileItemSelect = () => tmplQe('.profile-item-select');

    makeProfileItemSelector(tmplQe('.profile-item-select'), profileSettings, refreshProfileItem(content, profiles));

    const makeRow = makeNewRow(
        profiles, getProfileItemSelect, isAdaptationsMode, relationsSummary.knownCharacters, profileBindings,
        externalRefresh, characterName
    );

    // filling header - need table body for callbacks
    const makeRowCallback = R.compose(U.addEl(content), makeRow);
    U.addEl(tmplQe('.known-characters-label'), U.makeText(l10n('known-characters')));
    const knownBtn = U.addEl(tmplQe('.add-known-character-relation'), U.makeText(L10n.getValue('common-add')));
    U.addEl(tmplQe('.unknown-characters-label'), U.makeText(l10n('unknown-characters')));
    const unknownBtn = U.addEl(tmplQe('.add-unknown-character-relation'), U.makeText(L10n.getValue('common-add')));
    U.addEl(tmplQe('.profile-item-label'), U.makeText(l10n('profile-item')));
    fillCharSelector(tmplQe('.known-characters-select'), knownBtn, knownNoRels, characterName, makeRowCallback);
    fillCharSelector(tmplQe('.unknown-characters-select'), unknownBtn, unknownNoRels, characterName, makeRowCallback);

    // filling table
    const toCharacterFilter = (toCharacter) => (isAdaptationsMode ? true
        : !R.isEmpty(findRel(characterName, toCharacter, relationsSummary.relations)[characterName]));
    const findRelTmp = findRel(characterName, R.__, relationsSummary.relations);
    U.addEls(content, showCharacters.filter(toCharacterFilter).map((toChar) => makeRow(toChar, findRelTmp(toChar))));
    return relationTmpl;
};

function refreshProfileItem(content, profiles) {
    return (event) => {
        const dataArr = U.queryElEls(content, '[toCharacter]');
        dataArr.forEach((el) => {
            const char = U.getAttr(el, 'toCharacter');
            const selectedName = event.target.value;
            fillProfileItemContent(el, selectedName, profiles[char][selectedName]);
        });
    };
}

function makeProfileItemSelector(select1, profileSettings, refresh) {
    select1 = $(select1);
    const tmpSelect = select1.select2(U.arr2Select2(profileSettings.map(R.prop('name')).sort()));

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
    const row = U.qmte('.relation-row-tmpl');
    const tmplQe = U.qee(row);
    U.addEl(tmplQe('.to-character-name'), U.makeText(`${toCharacter}/${profileBindings[toCharacter]}`));
    U.addEl(tmplQe('.where-meets-label'), U.makeText(l10n('where-meets')));
    U.addEl(tmplQe('.where-meets-content'), U.makeText(stories === undefined ? '' : R.keys(stories).join(', ')));
    U.setAttr(tmplQe('[toCharacter]'), 'toCharacter', toCharacter);
    fillProfileItemContent(row, getProfileItemSelect().value, profiles[toCharacter][getProfileItemSelect().value]);
    U.listen(tmplQe('button.remove'), 'click', (event) => {
        UI.confirm(CU.strFormat(l10n('are-you-sure-about-relation-removing'), [`${`${fromCharacter}-${toCharacter}`}`]), () => {
            DBMS.removeCharacterRelation({ fromCharacter, toCharacter }).then(externalRefresh).catch(UI.handleError);
        });
    });

    const directText = tmplQe('.direct textarea');
    directText.value = rel[fromCharacter];
    U.setAttr(directText, 'placeholder', L10n.format('briefings', 'relation-from-to', [fromCharacter, toCharacter]));
    U.listen(directText, 'change', (event) => {
        DBMS.setCharacterRelationText({
            fromCharacter,
            toCharacter,
            character: fromCharacter,
            text: event.target.value
        }).catch(UI.handleError);
    });

    Constants.relationEssences.forEach((name) => {
        const btn = tmplQe(`.${name}`);
        $(btn).tooltip({
            title: L10n.format('briefings', `${name}`, [fromCharacter, toCharacter]),
            placement: 'top'
        });
        let attrName = name;
        if (rel.starter !== fromCharacter) {
            if (name === 'starterToEnder') attrName = 'enderToStarter';
            if (name === 'enderToStarter') attrName = 'starterToEnder';
        }
        U.setClassByCondition(btn, 'btn-primary', rel.essence.indexOf(attrName) !== -1);
        U.listen(btn, 'click', (event) => {
            DBMS.setRelationEssenceStatus({
                fromCharacter,
                toCharacter,
                essence: attrName,
                flag: !U.hasClass(event.target, 'btn-primary')
            }).then(() => {
                U.toggleClass(event.target, 'btn-primary');
            }).catch(UI.handleError);
        });
    });

    const originText = tmplQe('.origin textarea');
    originText.value = rel.origin;
    U.setAttr(originText, 'placeholder', l10n('relation-origin'));
    U.listen(originText, 'change', (event) => {
        DBMS.setOriginRelationText({
            fromCharacter,
            toCharacter,
            text: event.target.value
        }).catch(UI.handleError);
    });

    const reverseText = tmplQe('.reverse textarea');
    reverseText.value = rel[toCharacter];
    U.setAttr(reverseText, 'placeholder', L10n.format('briefings', 'relation-from-to', [toCharacter, fromCharacter]));
    U.listen(reverseText, 'change', (event) => {
        DBMS.setCharacterRelationText({
            fromCharacter,
            toCharacter,
            character: toCharacter,
            text: event.target.value
        }).catch(UI.handleError);
    });

    const directChecked = rel.starter === fromCharacter ? rel.starterTextReady : rel.enderTextReady;
    fillFinishedButton(
        tmplQe('.direct .finished'), JSON.stringify([fromCharacter, toCharacter]), fromCharacter,
        toCharacter, fromCharacter, directChecked, directText
    );

    const reverseChecked = rel.starter === toCharacter ? rel.starterTextReady : rel.enderTextReady;
    fillFinishedButton(
        tmplQe('.reverse .finished'), JSON.stringify([toCharacter, fromCharacter]), fromCharacter,
        toCharacter, toCharacter, reverseChecked, reverseText
    );

    if (!isAdaptationsMode) {
        U.removeClass(tmplQe('.direct'), 'col-xs-3');
        U.addClass(tmplQe('.direct'), 'col-xs-9');
        U.addClass(tmplQe('.origin'), 'hidden');
        U.addClass(tmplQe('.reverse'), 'hidden');
    }
    L10n.localizeStatic(row);

    return row;
});

function fillFinishedButton(button, id, fromCharacter, toCharacter, character, checked, textarea) {
    U.setClassIf(button, 'btn-primary', checked);
    UI.enableEl(textarea, !checked);
    button.id = id;
    U.listen(button, 'click', (event) => {
        const newValue = !U.hasClass(button, 'btn-primary');
        U.setClassByCondition(button, 'btn-primary', newValue);
        UI.enableEl(textarea, !newValue);

        DBMS.setRelationReadyStatus({
            fromCharacter,
            toCharacter,
            character,
            ready: newValue
        }).catch(UI.handleError);
    });
}

function fillProfileItemContent(el, profileItemName, profileItemValue) {
    U.addEl(U.clearEl(U.qee(el, '.profile-item-name')), U.makeText(profileItemName));
    U.addEl(U.clearEl(U.qee(el, '.profile-item-value')), U.makeText(profileItemValue));
}

function fillCharSelector(select1, button, data, fromCharacter, makeRowCallback) {
    select1 = $(select1);
    const tmpSelect = select1.select2(UI.getSelect2Data(data));
    select1.select2({ width: 'style' });
    U.listen(button, 'click', () => {
        const toCharacter = select1[0].value;
        DBMS.createCharacterRelation({ fromCharacter, toCharacter }).then(() => {
            DBMS.getCharacterRelation({ fromCharacter, toCharacter }).then((rel) => {
                makeRowCallback(select1[0].value, rel);
                data = data.filter(R.compose(R.not, R.equals(select1[0].value), R.prop('value')));
                U.clearEl(select1[0]);
                select1.select2(UI.getSelect2Data(data));
            }).catch(UI.handleError);
        }).catch(UI.handleError);
    });
}
// })(window.RelationsPreview = {});
