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
    
    var root = '.role-grid-tab ';
    var sel;
    var groupingOrder;
    var profilesData;

    exports.init = function() {
        
        sel = $(root + '.grouping-select').select2();
        sel.on('select2:select', (event) => {
            var selectedArr = sel.val();
            var diff = R.difference(selectedArr, groupingOrder);
            groupingOrder.push(diff[0]);
            groupingOrder.length === 0 ? drawPlainPanelList() : drawGroupedList();
        });
        sel.on('select2:unselect', (event) => {
            var selectedArr = sel.val();
            var diff = R.difference(groupingOrder, selectedArr);
            groupingOrder = R.difference(groupingOrder, diff);
            groupingOrder.length === 0 ? drawPlainPanelList() : drawGroupedList();
        });
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        DBMS.getRoleGridInfo(function(err, data2){
            if(err) {Utils.handleError(err); return;}
            groupingOrder = [];
            
            profilesData = data2;
            
            var sorter = CommonUtils.charOrdAFactory((a) => a.toLowerCase());
            var filter = el => el.type === 'enum';
            var groupingItems = profilesData.characterProfileStructure.filter(filter).map(R.prop('name')).sort(sorter);
            clearEl(queryEl(root + '.grouping-select'));
            sel.select2(arr2Select2(groupingItems));
            
            drawPlainPanelList();
        });
    };
    
//            var filter = el => el.type === 'enum' || el.type === 'checkbox';
    
    var drawGroupedList = () => {
        clearEl(queryEl(root + '.group-content'));
        
        var groups = R.groupBy((profile) => {
            return groupingOrder.map(name => profile.character[name]).join('/');
        }, profilesData.profileData);
        
        var groupingItemInfo = R.indexBy(R.prop('name'), profilesData.characterProfileStructure.filter(el => R.contains(el.name, groupingOrder)));
        
        var structures = makeGroupTree(groups, groupingItemInfo, 0, []);
        console.log(JSON.stringify(structures));
        
        structures.map(calcSize);
        
//        addEl(queryEl(root + '.group-content'), addEls(addClasses(makeEl('ul'), ['remove-ul-dots', 'zero-padding']), makeGroupTree(groups, groupingItemInfo, 0, [])));
        addEl(queryEl(root + '.group-content'), addEls(addClasses(makeEl('ul'), ['remove-ul-dots', 'zero-padding']), R.flatten(structures.map(renderGroupStructure))));
    };
    
    var makeHeader = (text) => {
        var heading = addEl(addClass(makeEl('div'), 'panel-heading'), addEl(addClass(makeEl('h3'), 'panel-title'), makeText(text)));
        return addEl(addClasses(makeEl('div'), ['panel', 'panel-default', 'inline-panel']), heading);
//        var heading = addEl(addClass(makeEl('div'), 'panel-heading'), addEl(addClass(makeEl('h3'), 'panel-title'), makeText(text)));
//        return addEl(addClasses(makeEl('div'), ['panel', 'panel-default']), heading);
    };
    
    var calcSize = (el) => {
        if(el.children){
            el.size = R.sum(el.children.map(calcSize));
        } else { // groups
            el.size = el.groups.length;
        }
        return el.size;
    }
    
    var renderGroupStructure = (el) => {
//        return R.flatten(structure.map(el => {
        var domChildren;
        if(el.children){
            domChildren = [addEls(addClass(makeEl('ul'), 'remove-ul-dots'), R.flatten(el.children.map(renderGroupStructure)))];
        } else { // groups
            domChildren = [addEls(addClass(makeEl('div'), 'list-content-padding'), makePanelList(el.groups).map(addClass(R.__,'inline-panel')))];
        }
        
        return R.concat([addEl(makeEl('li'), makeHeader(el.key + ' (' + el.size + ')' ))], domChildren);
//        }));
    };
    
    var makeGroupTree = (groups, groupingItemInfo, index, key) => {
        var arr = groupingItemInfo[groupingOrder[index]].value.split(',').map(name => {
            var nextKey = R.concat(key, [name]);
//            var domChildren;
            if(groupingOrder.length !== index+1){
                var children = makeGroupTree(groups, groupingItemInfo, index+1, nextKey);
                if(children === null){
                    return null;
                }
//                domChildren = [addEls(addClass(makeEl('ul'), 'remove-ul-dots'), children)];
                return {
                    key: nextKey.join(' / '),
                    children: children
                }
            } else {
                var fullKey = nextKey.join('/');
                if(groups[fullKey] === undefined){
                    return null;
                }
//                domChildren = [addEls(addClass(makeEl('div'), 'list-content-padding'), makePanelList(groups[fullKey]))];
                return {
                    key: nextKey.join(' / '),
                    groups: groups[fullKey]
                }
            }
//            return R.concat([addEl(makeEl('li'), makeHeader(name))], domChildren);
//            return R.concat([addEl(makeEl('li'), makeHeader(nextKey.join(' / ')))], domChildren);
//            return {
//                name: nextKey.join(' / '),
//                children: 
//            }
        }).filter(el => el !== null);
        return arr.length === 0 ? null : arr;
//        if(arr.length === 0){
//            return null;
//        } else {
//            return R.flatten(arr); 
//        }
    };
//    var makeGroupTree = (groups, groupingItemInfo, index, key) => {
//        var arr = groupingItemInfo[groupingOrder[index]].value.split(',').map(name => {
//            var nextKey = R.concat(key, [name]);
//            var domChildren;
//            if(groupingOrder.length !== index+1){
//                var children = makeGroupTree(groups, groupingItemInfo, index+1, nextKey);
//                if(children === null){
//                    return null;
//                }
//                domChildren = [addEls(addClass(makeEl('ul'), 'remove-ul-dots'), children)];
//            } else {
//                var fullKey = nextKey.join('/');
//                if(groups[fullKey] === undefined){
//                    return null;
//                }
//                domChildren = [addEls(addClass(makeEl('div'), 'list-content-padding'), makePanelList(groups[fullKey]))];
//            }
////            return R.concat([addEl(makeEl('li'), makeHeader(name))], domChildren);
//            return R.concat([addEl(makeEl('li'), makeHeader(nextKey.join(' / ')))], domChildren);
//        }).filter(el => el !== null);
//        if(arr.length === 0){
//            return null;
//        } else {
//            return R.flatten(arr); 
//        }
//    };
    
    var drawPlainPanelList = () => {
        addEls(clearEl(queryEl(root + '.group-content')), makePanelList(profilesData.profileData));
    };
    
    var makePanelList = (profileArray) => {
        return profileArray.sort(CommonUtils.charOrdAFactory((a) => a.characterName.toLowerCase())).map(profileData => {
            var tables = [UI.makeProfileTable(profilesData.characterProfileStructure, profileData.character)];
            var title = profileData.characterName;
            if(profileData.playerName !== undefined){
                tables.push(UI.makeProfileTable(profilesData.playerProfileStructure, profileData.player));
                title += '/' + profileData.playerName;
            }
            
            var panelInfo = UI.makePanelCore(makeText(title), addEls(makeEl('div'), tables));
            addClass(panelInfo.contentDiv, 'hidden');
            var panelToggler = UI.togglePanel(panelInfo.contentDiv);
            listen(panelInfo.a, "click", panelToggler);
            
            return panelInfo.panel;
        });
    };

})(this['RoleGrid']={});