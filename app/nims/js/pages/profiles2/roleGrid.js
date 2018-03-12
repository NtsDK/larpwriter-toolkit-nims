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
    var groupingOrder;
    var profilesData;
    var buttons;

    exports.init = function() {
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        DBMS.getRoleGridInfo(function(err, data2){
            if(err) {Utils.handleError(err); return;}
            groupingOrder = [];
            buttons = [];
            
            // hack - dynamically replace checkbox with enum
            const checkboxes = data2.characterProfileStructure.filter(el => el.type === 'checkbox').map(R.prop('name'));
            data2.characterProfileStructure = data2.characterProfileStructure.map(el => {
                if(el.type === 'checkbox'){
                    return {
                        doExport: el.doExport, 
                        name: el.name, 
                        playerAccess: el.playerAccess, 
                        showInRoleGrid: el.showInRoleGrid, 
                        type: 'enum', 
                        value: [L10n.get('constant','yes'),L10n.get('constant','no')].join(','), 
                    }
                }
                return el;
            });
            profilesData = data2;
            data2.profileData.forEach(el => {
                checkboxes.forEach(name => {
                    el.character[name] = L10n.get('constant',el.character[name] === true ? 'yes' : 'no');
                });
            });
            
            var sorter = CommonUtils.charOrdAFactory((a) => a.toLowerCase());
            var filter = el => el.type === 'enum';
            var groupingItems = profilesData.characterProfileStructure.filter(filter).map(R.prop('name')).sort(sorter);
            
            addEls(clearEl(queryEl(root + '.button-container')), groupingItems.map((item, i) => {
                const button = addEl(makeEl('a'), makeText(item));
                button.item = item;
                setAttr(button, 'draggable', 'true');
                setAttr(button, 'role', 'button');
                setAttr(button, 'href', '#');
                setAttr(button, 'order', i+1);
                setStyle(button, 'order', i+1);
                addClasses(button, ['btn', 'btn-default']);
                listen(button, 'dragstart', onDragStart);
                listen(button, 'drop', onDrop);
                listen(button, 'dragover', allowDrop);
                listen(button, 'dragenter', handleDragEnter);
                listen(button, 'dragleave', handleDragLeave);
                listen(button, 'click', () => {
                    toggleClass(button, 'btn-primary');
                    drawList();
                });
                buttons.push(button);
                return button;
            }));
            
            drawList();
//            drawPlainPanelList();
        });
    };
    
    var onDragStart = function(event){
        console.log('onDragStart ' + this.item);
        event.dataTransfer.setData('data', JSON.stringify({ item: this.item, order: getAttr(this, 'order')}));
        event.dataTransfer.effectAllowed = 'move';
    };
    var onDrop = function(event){
        console.log('onDrop ' + this.item + event.dataTransfer.getData('data'));
        if (event.stopPropagation) {
            event.stopPropagation(); // stops the browser from redirecting.
        }
        updateButtons(JSON.parse(event.dataTransfer.getData('data')), { item: this.item, order: getAttr(this, 'order')});
    };
    var allowDrop = function(event){
        console.log('allowDrop ' + this.item);
        event.preventDefault();
    };
    
    function handleDragEnter(event) {
        addClass(this, 'over');
    }

    function handleDragLeave(event) {
        removeClass(this, 'over');
    }
    
    var updateButtons = (dragStarter, dragReceiver) => {
        const startOrder = Number(dragStarter.order)-1;
        const receiveOrder = Number(dragReceiver.order)-1;
        const button = buttons.splice(startOrder, 1)[0];
        buttons = R.insert(receiveOrder, button, buttons);
        buttons.forEach( (button, i) => {
            setAttr(button, 'order', i+1);
            setStyle(button, 'order', i+1);
        });
        drawList();
    };
    
    var drawList = () => {
        groupingOrder = buttons.filter(hasClass(R.__, 'btn-primary')).map(R.prop('item'));
        drawGroupedList((groupingOrder.length > 0) ? getTreeByUserSelect() : getTreeByAlphabet());
//        (groupingOrder.length > 0) ? drawGroupedList() : drawPlainPanelList();
    };
    
    var getTreeByAlphabet = () => {
//        var groups = R.groupBy((profile) => {
//            return profile.characterName[0];
//        }, profilesData.profileData);
//        
//        var structures = R.toPairs(groups).map(pair => ({
//            key: pair[0],
//            lastKeyPart: pair[0],
//            groups: pair[1]
//        }));
//        
//        structures.sort(CommonUtils.charOrdAFactory(R.prop('key')));
//        return structures;
        return [{
            "key": "Все персонажи",
            "lastKeyPart": "Все персонажи",
            "groups": profilesData.profileData
        }];
    };
    
    var getTreeByUserSelect = () => {
        var groups = R.groupBy((profile) => {
            return groupingOrder.map(name => profile.character[name]).join('/');
        }, profilesData.profileData);
        
        var groupingItemInfo = R.indexBy(R.prop('name'), profilesData.characterProfileStructure.filter(el => R.contains(el.name, groupingOrder)));
        
        return [{
            "key": "Все персонажи",
            "lastKeyPart": "Все персонажи",
            "children": makeGroupTree(groups, groupingItemInfo, 0, [])
        }];
    };
    
//            var filter = el => el.type === 'enum' || el.type === 'checkbox';
    
    var drawGroupedList = (structures) => {
//        structures = [{
//            "key": "Все персонажи",
//            "lastKeyPart": "Все персонажи",
//            "children": structures
//        }];
//        console.log(JSON.stringify(structures));
        
        structures.forEach(calcSize);
        
//        addEl(queryEl(root + '.group-content'), addEls(addClasses(makeEl('ul'), ['remove-ul-dots', 'zero-padding']), makeGroupTree(groups, groupingItemInfo, 0, [])));
        addEl(clearEl(queryEl(root + '.group-content')), addEls(addClasses(makeEl('ul'), ['remove-ul-dots', 'zero-padding']), R.flatten(structures.map(renderGroupStructure))));
    };
    
    var makeHeader = (text, characterNum, playerNum) => {
        const characterBadge = addEl(addClass(makeEl('span'), 'badge'), makeText(characterNum + ' / ' + playerNum));
//        const playerBadge = addEl(addClass(makeEl('span'), 'badge'), makeText(playerNum));
        
        const h3 = addEls(addClass(makeEl('h3'), 'panel-title'), [makeText(' ' + text + ' '), characterBadge]);
        const a = setAttr(makeEl('a'), 'href', '#/');
        setAttr(a, 'tree-panel-toggler', '');
        var heading = addEl(addClass(makeEl('div'), 'panel-heading'), addEls(a, [h3]));
        return addEl(addClasses(makeEl('div'), ['panel', 'panel-default', 'inline-panel']), heading);
//        var heading = addEl(addClass(makeEl('div'), 'panel-heading'), addEl(addClass(makeEl('h3'), 'panel-title'), makeText(text)));
//        return addEl(addClasses(makeEl('div'), ['panel', 'panel-default']), heading);
    };
    
    var calcSize = (el) => {
        if(el.children){
            el.children.forEach(calcSize);
            el.characterNum = R.sum(el.children.map(R.prop('characterNum')));
            el.playerNum = R.sum(el.children.map(R.prop('playerNum')));
        } else { // groups
            el.characterNum = el.groups.length;
            el.playerNum = el.groups.filter(R.pipe(R.prop('playerName'), R.isNil, R.not)).length;
        }
    }
    
    var renderGroupStructure = (el) => {
//        return R.flatten(structure.map(el => {
        var domChildren, header;
        if(el.children){
            domChildren = addEls(addClass(makeEl('ul'), 'remove-ul-dots'), R.flatten(el.children.map(renderGroupStructure)));
            header = makeHeader(el.lastKeyPart, el.characterNum, el.playerNum);
            UI.attachPanelToggler(queryElEl(header, 'a'), domChildren);
            return R.concat([addEl(makeEl('li'), header)], [domChildren]);
        } else { // groups
//            var panelList = makePanelList(el.groups).map(addClasses(R.__,['inline-panel']));
            var panelList = makePanelList(el.groups).map(addClasses(R.__,['inline-panel', 'col-xs-6']));
//            var panelList = makePanelList(el.groups).map(addClasses(R.__,['inline-panel', 'col-xs-4']));
            var row = addClass(makeEl('div'), 'row');
            var container = addEl(addClass(makeEl('div'), 'list-content-padding container-fluid'), row);
            domChildren = addEls(row, panelList);
            header = makeHeader(el.key, el.characterNum, el.playerNum);
            UI.attachPanelToggler(queryElEl(header, 'a'), container);
            return R.concat([addEl(makeEl('li'), header)], [container]);
//            var container = addClass(makeEl('div'), 'list-content-padding container-fluid');
//            domChildren = addEls(container, panelList);
//            return R.concat([addEl(makeEl('li'), makeHeader(el.key, el.characterNum, el.playerNum))], [domChildren]);
        }
        
//        }));
    };
    
    var makeGroupTree = (groups, groupingItemInfo, index, key) => {
        var arr = groupingItemInfo[groupingOrder[index]].value.split(',').map(name => {
            var nextKey = R.concat(key, [name]);
//            var nextKey = R.concat(key, [groupingOrder[index] + ': ' + name]);
            var lastKeyPart = groupingOrder[index] + ': ' + name;
//            var domChildren;
            if(groupingOrder.length !== index+1){
                var children = makeGroupTree(groups, groupingItemInfo, index+1, nextKey);
                if(children === null){
                    return null;
                }
//                domChildren = [addEls(addClass(makeEl('ul'), 'remove-ul-dots'), children)];
                return {
                    key: nextKey.join(' / '),
                    lastKeyPart,
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
                    lastKeyPart,
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
            UI.attachPanelToggler(panelInfo.a, panelInfo.contentDiv, (event, togglePanel) => {
                queryEls(root + '.group-content .expanded[panel-toggler]').filter(el => !el.contains(event.target)).forEach(el => el.click());
                togglePanel();
            });
            panelInfo.a.click();
            
            return panelInfo.panel;
        });
    };

})(this['RoleGrid']={});