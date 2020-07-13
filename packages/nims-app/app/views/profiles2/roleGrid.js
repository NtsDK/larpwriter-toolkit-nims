
import ReactDOM from 'react-dom';
import { getRoleGridTemplate } from "./RoleGridTemplate.jsx";
import { makeProfileTable } from "../commons/uiCommons";

const root = '.role-grid-tab ';
let groupingOrder;
let profilesData;
let buttons;
const l10n = L10n.get('role-grid');

let content;

function getContent(){
    return content;
}

function init(){
    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getRoleGridTemplate(), content);
    L10n.localizeStatic(content);
    content = U.queryEl(root);
};

function refresh(){
    DBMS.getRoleGridInfo().then((data2) => {
        groupingOrder = [];
        buttons = [];

        U.showEl(U.qe(`${root} .alert.no-character-profile`), data2.characterProfileStructure.length === 0);
        U.showEl(U.qe(`${root} .alert.no-characters`), data2.profileData.length === 0);

        U.showEl(U.qe(`${root} > .container-fluid`), data2.profileData.length !== 0 && data2.characterProfileStructure.length !== 0);

        // hack - dynamically replace checkbox with enum
        const checkboxes = data2.characterProfileStructure.filter(el => el.type === 'checkbox').map(R.prop('name'));
        data2.characterProfileStructure = data2.characterProfileStructure.map((el) => {
            if (el.type === 'checkbox') {
                return {
                    doExport: el.doExport,
                    name: el.name,
                    playerAccess: el.playerAccess,
                    showInRoleGrid: el.showInRoleGrid,
                    type: 'enum',
                    value: [L10n.get('constant', 'yes'), L10n.get('constant', 'no')].join(','),
                };
            }
            return el;
        });
        profilesData = data2;
        data2.profileData.forEach((el) => {
            checkboxes.forEach((name) => {
                el.character[name] = L10n.get('constant', el.character[name] === true ? 'yes' : 'no');
            });
        });

        const sorter = CU.charOrdAFactory(a => a.toLowerCase());
        const filter = el => el.type === 'enum';
        const groupingItems = profilesData.characterProfileStructure.filter(filter).map(R.prop('name')).sort(sorter);

        U.addEls(U.clearEl(U.queryEl(`${root}.button-container`)), groupingItems.map((item, i) => {
            const button = U.addEl(U.makeEl('a'), U.makeText(item));
            button.item = item;
            U.setAttr(button, 'draggable', 'true');
            U.setAttr(button, 'role', 'button');
            U.setAttr(button, 'href', '#');
            U.setAttr(button, 'order', i + 1);
            U.setStyle(button, 'order', i + 1);
            U.addClasses(button, ['btn', 'btn-default']);
            U.listen(button, 'dragstart', onDragStart);
            U.listen(button, 'drop', onDrop);
            U.listen(button, 'dragover', allowDrop);
            U.listen(button, 'dragenter', handleDragEnter);
            U.listen(button, 'dragleave', handleDragLeave);
            U.listen(button, 'click', () => {
                U.toggleClass(button, 'btn-primary');
                drawList();
            });
            buttons.push(button);
            return button;
        }));

        drawList();
        //            drawPlainPanelList();
    }).catch(UI.handleError);
};

// eslint-disable-next-line no-var,vars-on-top
var onDragStart = function (event) {
    console.log(`onDragStart ${this.item}`);
    event.dataTransfer.setData('data', JSON.stringify({ item: this.item, order: U.getAttr(this, 'order') }));
    event.dataTransfer.effectAllowed = 'move';
};

// eslint-disable-next-line no-var,vars-on-top
var onDrop = function (event) {
    console.log(`onDrop ${this.item}${event.dataTransfer.getData('data')}`);
    if (event.stopPropagation) {
        event.stopPropagation(); // stops the browser from redirecting.
    }
    updateButtons(JSON.parse(event.dataTransfer.getData('data')), { item: this.item, order: U.getAttr(this, 'order') });
};

// eslint-disable-next-line no-var,vars-on-top
var allowDrop = function (event) {
    console.log(`allowDrop ${this.item}`);
    event.preventDefault();
};

function handleDragEnter(event) {
    U.addClass(this, 'over');
}

function handleDragLeave(event) {
    U.removeClass(this, 'over');
}

// eslint-disable-next-line no-var,vars-on-top
var updateButtons = (dragStarter, dragReceiver) => {
    const startOrder = Number(dragStarter.order) - 1;
    const receiveOrder = Number(dragReceiver.order) - 1;
    const button = buttons.splice(startOrder, 1)[0];
    buttons = R.insert(receiveOrder, button, buttons);
    buttons.forEach((button2, i) => {
        U.setAttr(button2, 'order', i + 1);
        U.setStyle(button2, 'order', i + 1);
    });
    drawList();
};

// eslint-disable-next-line no-var,vars-on-top
var drawList = () => {
    groupingOrder = buttons.filter(U.hasClass(R.__, 'btn-primary')).map(R.prop('item'));
    drawGroupedList((groupingOrder.length > 0) ? getTreeByUserSelect() : getTreeByAlphabet());
    //        (groupingOrder.length > 0) ? drawGroupedList() : drawPlainPanelList();
};

// eslint-disable-next-line no-var,vars-on-top
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
//        structures.sort(CU.charOrdAFactory(R.prop('key')));
//        return structures;
// eslint-disable-next-line no-var,vars-on-top
var getTreeByAlphabet = () => [{
    key: l10n('all-characters'),
    lastKeyPart: l10n('all-characters'),
    groups: profilesData.profileData
}];

// eslint-disable-next-line no-var,vars-on-top
var getTreeByUserSelect = () => {
    const groups = R.groupBy(profile => groupingOrder.map(name => profile.character[name]).join('/'), profilesData.profileData);

    const groupingItemInfo = R.indexBy(R.prop('name'), profilesData.characterProfileStructure.filter(el => R.contains(el.name, groupingOrder)));

    return [{
        key: l10n('all-characters'),
        lastKeyPart: l10n('all-characters'),
        children: makeGroupTree(groups, groupingItemInfo, 0, [])
    }];
};

//            var filter = el => el.type === 'enum' || el.type === 'checkbox';

// eslint-disable-next-line no-var,vars-on-top
var drawGroupedList = (structures) => {
    //        structures = [{
    //            "key": l10n('all-characters'),
    //            "lastKeyPart": l10n('all-characters'),
    //            "children": structures
    //        }];
    //        console.log(JSON.stringify(structures));

    structures.forEach(calcSize);

    // U.addEl(U.queryEl(root + '.group-content'), U.addEls(U.addClasses(U.makeEl('ul'), ['remove-ul-dots', 'zero-padding']),
    // makeGroupTree(groups, groupingItemInfo, 0, [])));
    U.addEl(U.clearEl(U.queryEl(`${root}.group-content`)), U.addEls(U.addClasses(
        U.makeEl('ul'),
        ['remove-ul-dots', 'zero-padding']
    ), R.flatten(structures.map(renderGroupStructure))));
};

const makeHeader = (text, characterNum, playerNum) => {
    const characterBadge = U.addEl(U.addClass(U.makeEl('span'), 'badge'), U.makeText(`${characterNum} / ${playerNum}`));
    U.setAttr(characterBadge, 'title', L10n.format('role-grid', 'badge-title', [characterNum, playerNum]));
    //        const playerBadge = U.addEl(U.addClass(U.makeEl('span'), 'badge'), U.makeText(playerNum));

    const h3 = U.addEls(U.addClass(U.makeEl('h3'), 'panel-title'), [U.makeText(` ${text} `), characterBadge]);
    const a = U.setAttr(U.makeEl('a'), 'href', '#/');
    U.setAttr(a, 'tree-panel-toggler', '');
    const heading = U.addEl(U.addClass(U.makeEl('div'), 'panel-heading'), U.addEls(a, [h3]));
    return U.addEl(U.addClasses(U.makeEl('div'), ['panel', 'panel-default', 'inline-panel']), heading);
    // var heading = U.addEl(U.addClass(U.makeEl('div'), 'panel-heading'),
    //      U.addEl(U.addClass(U.makeEl('h3'), 'panel-title'), U.makeText(text)));
    // return U.addEl(U.addClasses(U.makeEl('div'), ['panel', 'panel-default']), heading);
};

// eslint-disable-next-line no-var,vars-on-top
var calcSize = (el) => {
    if (el.children) {
        el.children.forEach(calcSize);
        el.characterNum = R.sum(el.children.map(R.prop('characterNum')));
        el.playerNum = R.sum(el.children.map(R.prop('playerNum')));
    } else { // groups
        el.characterNum = el.groups.length;
        el.playerNum = el.groups.filter(R.pipe(R.prop('playerName'), R.isNil, R.not)).length;
    }
};

// eslint-disable-next-line no-var,vars-on-top
var renderGroupStructure = (el) => {
    //        return R.flatten(structure.map(el => {
    let domChildren, header;
    if (el.children) {
        domChildren = U.addEls(U.addClass(U.makeEl('ul'), 'remove-ul-dots'), R.flatten(el.children.map(renderGroupStructure)));
        header = makeHeader(el.lastKeyPart, el.characterNum, el.playerNum);
        UI.attachPanelToggler(U.queryElEl(header, 'a'), domChildren);
        return R.concat([U.addEl(U.makeEl('li'), header)], [domChildren]);
    } // groups
    //            var panelList = makePanelList(el.groups).map(U.addClasses(R.__,['inline-panel']));
    const panelList = makePanelList(el.groups).map(U.addClasses(R.__, ['inline-panel', 'col-xs-6']));
    //            var panelList = makePanelList(el.groups).map(U.addClasses(R.__,['inline-panel', 'col-xs-4']));
    const row = U.addClass(U.makeEl('div'), 'row');
    const container = U.addEl(U.addClass(U.makeEl('div'), 'list-content-padding container-fluid'), row);
    domChildren = U.addEls(row, panelList);
    header = makeHeader(el.key, el.characterNum, el.playerNum);
    UI.attachPanelToggler(U.queryElEl(header, 'a'), container);
    return R.concat([U.addEl(U.makeEl('li'), header)], [container]);
    // var container = U.addClass(U.makeEl('div'), 'list-content-padding container-fluid');
    // domChildren = U.addEls(container, panelList);
    // return R.concat([U.addEl(U.makeEl('li'), makeHeader(el.key, el.characterNum, el.playerNum))], [domChildren]);


    //        }));
};

// eslint-disable-next-line no-var,vars-on-top
var makeGroupTree = (groups, groupingItemInfo, index, key) => {
    const arr = groupingItemInfo[groupingOrder[index]].value.split(',').map((name) => {
        const nextKey = R.concat(key, [name]);
        //            var nextKey = R.concat(key, [groupingOrder[index] + ': ' + name]);
        const lastKeyPart = `${groupingOrder[index]}: ${name}`;
        //            var domChildren;
        if (groupingOrder.length !== index + 1) {
            const children = makeGroupTree(groups, groupingItemInfo, index + 1, nextKey);
            if (children === null) {
                return null;
            }
            //                domChildren = [U.addEls(U.addClass(U.makeEl('ul'), 'remove-ul-dots'), children)];
            return {
                key: nextKey.join(' / '),
                lastKeyPart,
                children
            };
        }
        const fullKey = nextKey.join('/');
        if (groups[fullKey] === undefined) {
            return null;
        }
        // domChildren = [U.addEls(U.addClass(U.makeEl('div'), 'list-content-padding'), makePanelList(groups[fullKey]))];
        return {
            key: nextKey.join(' / '),
            lastKeyPart,
            groups: groups[fullKey]
        };

        //            return R.concat([U.addEl(U.makeEl('li'), makeHeader(name))], domChildren);
        //            return R.concat([U.addEl(U.makeEl('li'), makeHeader(nextKey.join(' / ')))], domChildren);
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

const drawPlainPanelList = () => {
    U.addEls(U.clearEl(U.queryEl(`${root}.group-content`)), makePanelList(profilesData.profileData));
};

// eslint-disable-next-line no-var,vars-on-top
var makePanelList = profileArray => profileArray.sort(CU.charOrdAFactory(a => a.characterName.toLowerCase())).map((profileData) => {
    const tables = [makeProfileTable(Constants, profilesData.characterProfileStructure, profileData.character)];
    let title = profileData.characterName;
    if (profileData.playerName !== undefined) {
        tables.push(makeProfileTable(Constants, profilesData.playerProfileStructure, profileData.player));
        title += `/${profileData.playerName}`;
    }

    const panelInfo = UI.makePanelCore(U.makeText(title), U.addEls(U.makeEl('div'), tables));
    UI.attachPanelToggler(panelInfo.a, panelInfo.contentDiv, (event, togglePanel) => {
        U.queryEls(`${root}.group-content .expanded[panel-toggler]`).filter(el => !el.contains(event.target)).forEach(el => el.click());
        togglePanel();
    });
    panelInfo.a.click();

    return panelInfo.panel;
});
// })(window.RoleGrid = {});
export default {
    init, refresh, getContent
}
