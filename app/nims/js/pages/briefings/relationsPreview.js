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
    const relationTableHeader = ['character-name', 'direct-relation', 'relation-origin', 'reverse-relation', 'extra-info', ''];
    const partialTableHeader = ['character-name', 'direct-relation', 'extra-info', ''];
    const displayedEssences = ['enderToStarter', 'allies', 'starterToEnder'];

    let makeNewRow;
    const l10n = L10n.get('briefings');

    exports.makeRelationsContent = (data, flags, profileSettings) => {
        const {
            characterName, relationsSummary, profiles, profileBindings
        } = data;
        let { characterNamesArray } = data;

        characterNamesArray = characterNamesArray.filter(R.compose(R.not, R.equals(characterName), R.prop('value')));
        const get2ndCharName = R.compose(el => R.keys(el)[0], R.omit(R.concat(Constants.relationFields, characterName)));
        const showCharacters = relationsSummary.relations.map(get2ndCharName).sort(CommonUtils.charOrdA);
        const noRelsList = characterNamesArray.filter(R.compose(R.not, R.contains(R.__, showCharacters), R.prop('value')));
        const predicate = R.compose(R.contains(R.__, R.keys(relationsSummary.knownCharacters)), R.prop('value'));
        const [knownNoRels, unknownNoRels] = R.partition(predicate, noRelsList);
        const { isAdaptationsMode } = flags;

        const body = makeEl('tbody');
        const selectInfo = makeProfileItemSelector(profileSettings, (event) => {
            const dataArr = queryElEls(body, '[toCharacter]');
            dataArr.map(clearEl).forEach((el) => {
                const char = getAttr(el, 'toCharacter');
                const selectedName = event.target.value;
                addEls(el, makeProfileItemContent(selectedName, profiles[char][selectedName]));
            });
        });
        const makeRow = makeNewRow(
            profiles, selectInfo.select, isAdaptationsMode, relationsSummary, profileBindings,
            characterName
        );

        // filling header - need table body for callbacks
        const makeRowCallback = R.compose(addEl(body), makeRow);
        const charSelectors = addEls(
            addClass(makeEl('div'), 'entity-management relations-management'),
            [makeSelector(l10n('known-characters'), knownNoRels, makeRowCallback),
                makeSelector(l10n('unknown-characters'), unknownNoRels, makeRowCallback),
                selectInfo.el]
        );

        // making table
        const array = isAdaptationsMode ? relationTableHeader : partialTableHeader;
        const headThs = R.map(R.pipe(l10n, makeText, wrapEl('th')), array);
        const head = R.compose(wrapEl('thead'), wrapEls('tr'))(headThs);

//        const table = addEls(addClasses(makeEl('table'), ['table']), [head, body]);
        const table = addClasses(wrapEls('table', [head, body]), ['table']);

        // filling table
        const toCharacterFilter = toCharacter => (isAdaptationsMode ? true : 
            !R.isEmpty(findRel(characterName, toCharacter, relationsSummary.relations)[characterName]));
        addEls(body, showCharacters.filter(toCharacterFilter).map(makeRow));
        return addEls(makeEl('div'), [charSelectors, table]);
    };

    function makeProfileItemSelector(profileSettings, refresh) {
        const select1 = $('<select></select>');
        const tmpContainer1 = $('<span></span>').append(select1);
        addClasses(select1[0], ['common-select', 'profile-item-select']);
        const tmpSelect = select1.select2(arr2Select2(profileSettings.map(R.prop('name')).sort()));

        tmpSelect.on('change', refresh);
        if (profileSettings[0]) {
            tmpSelect.val(profileSettings[0].name).trigger('change');
        }

        return {
            el: addEls(
                makeEl('div'),
                [addEl(makeEl('span'), makeText(l10n('profile-item'))), tmpContainer1[0]]
            ),
            select: select1[0]
        };
    }
    
    function findRel(fromCharacter, toCharacter, relations){
        const findFunc = R.curry((fromCharacter, toCharacter, rel) => 
        rel[fromCharacter] !== undefined && rel[toCharacter] !== undefined);
        return R.find(findFunc(fromCharacter, toCharacter), relations);
    }

    makeNewRow = R.curry((
        profiles, profileItemSelect, isAdaptationsMode, relationsSummary, profileBindings,
        fromCharacter, toCharacter
    ) => {
        const direct = addClass(makeEl('textarea'), 'briefing-relation-area');
        const rel = findRel(fromCharacter, toCharacter, relationsSummary.relations);
        direct.value = rel[fromCharacter];
        listen(direct, 'change', (event) => {
            DBMS.setCharacterRelation(fromCharacter, toCharacter, event.target.value, Utils.processError());
        });
        
        const arr = [ makeText(`${toCharacter}/${profileBindings[toCharacter]}`), direct];
        if(isAdaptationsMode){
            const origin = addClass(makeEl('textarea'), 'briefing-relation-area');
            origin.value = rel.origin;
            
            const btns = displayedEssences.map(name => addClasses(makeEl('button'), ['btn', 'btn-default', name] ));
            const group = addClass(wrapEls('div', btns), 'btn-group');
//            <div class="btn-group" role="group">
//            <button type="button" class="btn btn-default">Thailand</button>
//            <button type="button" class="btn btn-default">Cambodia</button>
//            <button type="button" class="btn btn-default">Vietnam</button>
//            </div>
            
            const reverse = addClass(makeEl('textarea'), 'briefing-relation-area');
            reverse.value = rel[toCharacter];
            listen(reverse, 'change', (event) => {
                DBMS.setCharacterRelation(toCharacter, fromCharacter, event.target.value, Utils.processError());
            });
//            arr.push(setClassByCondition(addEl(makeEl('td'), reverse), 'hidden', !isAdaptationsMode));
            arr.push(wrapEls('div', [group, origin]));
            arr.push(reverse);
        }
        
        const stories = relationsSummary.knownCharacters[toCharacter];
        const subArr = [addClass(addEl(makeEl('div'), makeText(l10n('where-meets'))), 'bold-cursive'),
            addEl(makeEl('div'), makeText(stories === undefined ? '' : R.keys(stories).join(', '))),
            makeEl('br'),
            addEls(
                setAttr(makeEl('div'), 'toCharacter', toCharacter),
                makeProfileItemContent(profileItemSelect.value, profiles[toCharacter][profileItemSelect.value])
            ),
        ];

        arr.push(addEls(makeEl('div'), subArr));

        return addEls(makeEl('tr'), arr.map(el => addEl(makeEl('td'), el)));
    });

    function makeProfileItemContent(profileItemName, profileItemValue) {
        return [addEl(addClass(makeEl('div'), 'bold-cursive'), makeText(profileItemName)), makeText(profileItemValue)];
    }

    function makeSelector(text, data, makeRowCallback) {
        const select1 = $('<select></select>');
        const tmpContainer1 = $('<span></span>').append(select1);
        addClass(select1[0], 'common-select');
        const tmpSelect = select1.select2(getSelect2Data(data));
        const button = addEl(makeEl('button'), makeText(getL10n('common-add')));
        listen(button, 'click', () => {
            makeRowCallback(select1[0].value);
            data = data.filter(R.compose(R.not, R.equals(select1[0].value), R.prop('value')));
            clearEl(select1[0]);
            select1.select2(getSelect2Data(data));
        });

        return addEls(makeEl('div'), [addEl(makeEl('span'), makeText(text)), tmpContainer1[0], button]);
    }
})(this.RelationsPreview = {});
