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
    
    var relationTableHeader = [ 'character-name', 'direct-relation', 'reverse-relation', 'extra-info' ];
    var partialTableHeader = [ 'character-name', 'direct-relation', 'extra-info' ];
    
    exports.makeRelationsContent = function(data, flags, profileSettings){
        var characterName = data.characterName;
        var relationsSummary = data.relationsSummary;
        var characterNamesArray = data.characterNamesArray;
        var profiles = data.profiles;
        var profileBindings = data.profileBindings;
        
        characterNamesArray = characterNamesArray.filter(R.compose(R.not, R.equals(characterName),R.prop('value')));
        var showCharacters = R.union(R.keys(relationsSummary.directRelations), R.keys(relationsSummary.reverseRelations)).sort();
        var noRelsList = characterNamesArray.filter(R.compose(R.not, R.contains(R.__, showCharacters),R.prop('value')));
        var knownNoRels = noRelsList.filter(R.compose(R.contains(R.__, R.keys(relationsSummary.knownCharacters)),R.prop('value')));
        var unknownNoRels = noRelsList.filter(R.compose(R.not, R.contains(R.__, R.keys(relationsSummary.knownCharacters)),R.prop('value')));
        var isAdaptationsMode = flags.isAdaptationsMode;
        
        var body = makeEl('tbody');
        var selectInfo = makeProfileItemSelector(profileSettings, function(event){
            var dataArr = queryElEls(body, '[toCharacter]');
            dataArr.map(clearEl).forEach(function(el){
                var char = getAttr(el, 'toCharacter');
                var selectedName = event.target.value;
                addEls(el, makeProfileItemContent(selectedName, profiles[char][selectedName]));
            });
        });
        var makeRow = makeNewRow(profiles, selectInfo.select, isAdaptationsMode, relationsSummary, profileBindings, characterName);
        
        // filling header - need table body for callbacks
        var makeRowCallback = R.compose(addEl(body), makeRow);
        var charSelectors = addEls(addClass(makeEl('div'), 'entity-management relations-management'), [makeSelector(getL10n('briefings-known-characters'), knownNoRels, makeRowCallback),
                                                   makeSelector(getL10n('briefings-unknown-characters'), unknownNoRels, makeRowCallback),
                                                   selectInfo.el]); 
        
        // making table
        var array = isAdaptationsMode ? relationTableHeader : partialTableHeader;
        var head = addEl(makeEl('thead'), addEls(makeEl('tr'), array.map(function(name){
            return addEl(makeEl('th'), makeText(getL10n('briefings-' + name)));
        })));
        
        var table = addEls(addClasses(makeEl('table'),['table']), [head,body]);
        
        // filling table
        addEls(body, showCharacters.filter(function(toCharacter){
            return isAdaptationsMode ? true : relationsSummary.directRelations[toCharacter] !== undefined;
        }).map(makeRow));
        return addEls(makeEl('div'), [charSelectors, table]);
    };
    
    var makeProfileItemSelector = function(profileSettings, refresh){
        var select1 = $("<select></select>");
        var tmpContainer1 = $("<span></span>").append(select1);
        addClasses(select1[0],['common-select','profile-item-select']);
        var tmpSelect = select1.select2(arr2Select2(profileSettings.map(R.prop('name')).sort()));
        
        tmpSelect.on('change', refresh);
        if(profileSettings[0]){
            tmpSelect.val(profileSettings[0].name).trigger('change');
        }
        
        return {
            el: addEls(makeEl('div'), [ addEl(makeEl('span'), makeText(getL10n('briefings-profile-item'))), tmpContainer1[0]]),
            select: select1[0]
        }
    };
    
    var makeNewRow = R.curry(function(profiles, profileItemSelect, isAdaptationsMode, relationsSummary, profileBindings, fromCharacter, toCharacter){
        var direct = addClass(makeEl('textarea'), 'briefing-relation-area');
        direct.value = relationsSummary.directRelations[toCharacter] || '';
        listen(direct, 'change', function(event){
            DBMS.setCharacterRelation(fromCharacter, toCharacter, event.target.value, Utils.processError());
        });
        var reverse;
        if(isAdaptationsMode){
            reverse = addClass(makeEl('textarea'), 'briefing-relation-area');
            reverse.value = relationsSummary.reverseRelations[toCharacter] || '';
            listen(reverse, 'change', function(event){
                DBMS.setCharacterRelation(toCharacter, fromCharacter, event.target.value, Utils.processError());
            });
        } else {
            reverse = makeEl('span');
        }
        var stories = relationsSummary.knownCharacters[toCharacter];
        
        var arr = [addEl(makeEl('td'), makeText(toCharacter+'/' + profileBindings[toCharacter])),
                   addEl(makeEl('td'), direct)];
        if(isAdaptationsMode){
            arr.push(addEl(makeEl('td'), reverse));
        }
        var subArr = [addClass(addEl(makeEl('div'), makeText(getL10n('briefings-where-meets'))), 'bold-cursive'),
                      addEl(makeEl('div'), makeText(stories === undefined ? '' : R.keys(stories).join(', '))),
                      makeEl('br'),
                      addEls(setAttr(makeEl('div'), 'toCharacter', toCharacter), 
                              makeProfileItemContent(profileItemSelect.value, profiles[toCharacter][profileItemSelect.value])),
        ];
        
        arr.push(addEls(makeEl('td'), subArr ));
            
        return addEls(makeEl('tr'),arr);
    });
    
    var makeProfileItemContent = function(profileItemName, profileItemValue){
        return [addEl(addClass(makeEl('div'), 'bold-cursive'), makeText(profileItemName)), makeText(profileItemValue)];
    };
    
    var makeSelector = function(text, data, makeRowCallback){
        var select1 = $("<select></select>");
        var tmpContainer1 = $("<span></span>").append(select1);
        addClass(select1[0],'common-select');
        var tmpSelect = select1.select2(getSelect2Data(data));
        var button = addEl(makeEl('button'), makeText(getL10n('common-add')));
        listen(button, 'click', function(){
            makeRowCallback(select1[0].value);
            data = data.filter(R.compose(R.not, R.equals(select1[0].value),R.prop('value')));
            clearEl(select1[0]);
            select1.select2(getSelect2Data(data));
        });
        
        return addEls(makeEl('div'), [ addEl(makeEl('span'),makeText(text)), tmpContainer1[0], button ]);
    };
    

})(this['RelationsPreview']={});
