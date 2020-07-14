//const R = require('ramda');

// const { d3, klay } = require('core/libs/klay-adapter');
const dateFormat = require('dateformat');

const JsDiff = require('diff');
const U = require('./utils.js');
const UI = require('./uiUtils.js');
const L10n = require('./l10n.js');

exports.JsDiff = JsDiff;

// ((exports) => {
exports.runTests = () => {
    U.queryEl('body').style.overflow = 'auto';
    window.RunTests();
};

exports.showConsistencyCheckAlert = (checkRes) => {
    if (checkRes === undefined || checkRes.errors.length === 0) {
        UI.alert(L10n.getValue('overview-consistency-is-ok'));
    } else {
        UI.alert(L10n.getValue('overview-consistency-problem-detected'));
    }
};

exports.clickThroughtHeaders = () => {
    let tabs = U.queryEls('#navigation .navigation-button');

    let index = 0;
    let subTabsNum = 0;
    function runClicker() {
        if (index <= tabs.length - 1) {
            tabs[index].click();
            if (subTabsNum === 0) {
                const subTabs = U.queryEls('#contentArea .navigation-button');
                tabs = R.insertAll(index + 1, subTabs, tabs);
                subTabsNum = subTabs.length;
            } else {
                subTabsNum--;
            }
            index++;
            setTimeout(runClicker, 500);
        }
    }
    runClicker();
};



const getAllSubsets = (theArray) => theArray.reduce((subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])), [[]]);

exports.addGroupTestingData = () => {
    DBMS.createProfileItem({
        type: 'character', name: 'text', itemType: 'text', selectedIndex: 0
    });
    DBMS.createProfileItem({
        type: 'character', name: 'string', itemType: 'string', selectedIndex: 0
    });
    DBMS.createProfileItem({
        type: 'character', name: 'checkbox', itemType: 'checkbox', selectedIndex: 0
    });
    DBMS.createProfileItem({
        type: 'character', name: 'number', itemType: 'number', selectedIndex: 0
    });
    DBMS.createProfileItem({
        type: 'character', name: 'enum', itemType: 'enum', selectedIndex: 0
    });
    DBMS.createProfileItem({
        type: 'character', name: 'multiEnum', itemType: 'multiEnum', selectedIndex: 0
    });

    DBMS.updateDefaultValue({ type: 'character', profileItemName: 'enum', value: '1,2,3' });
    DBMS.updateDefaultValue({ type: 'character', profileItemName: 'multiEnum', value: '1,2,3,4' });

    const makeChar = (name, profileItem, value) => {
        DBMS.createProfile({ type: 'character', characterName: name });
        DBMS.updateProfileField({
            type: 'character', characterName: name, fieldName: profileItem, itemType: profileItem, value
        });
    };

    const makeGroup = (name, profileItem, obj) => {
        DBMS.createGroup({ groupName: name });
        DBMS.saveFilterToGroup({ groupName: name, filterModel: [R.merge(obj, { type: profileItem, name: `profile-${profileItem}` })] });
    };
    //
    //
    //        const enumValues = [1,2,3];
    //        enumValues.map(value => makeChar('char enum ' + value, 'enum', String(value)));
    //        getAllSubsets(enumValues).map( arr => {
    //            const obj = arr.reduce( (acc, val) => {
    //                acc[String(val)] = true;
    //                return acc;
    //            }, {});
    //            makeGroup('group enum ' + arr.join(','), 'enum', {selectedOptions: obj});
    //        });
    //
    //        const multiEnumConditions = ['every','equal','some'];
    // bug in condition combination
    //        ['every']
    //        ['every','equal']
    //        ['every','some'] ...
    const multiEnumValues = [1, 2, 3];
    const multiEnumValues2 = [1, 2, 3, 4];
    const multiEnumConditions = ['every', 'equal'];
    getAllSubsets(multiEnumValues2).map((value) => makeChar(`char multiEnum ${value.join(',')}`, 'multiEnum', String(value.join(','))));

    multiEnumConditions.forEach((condition) => {
        getAllSubsets(multiEnumValues).forEach((arr) => {
            const obj = arr.reduce((acc, val) => {
                acc[String(val)] = true;
                return acc;
            }, {});
            makeGroup(`group multiEnum ${condition} ${arr.join(',')}`, 'multiEnum', { selectedOptions: obj, condition });
        });
    });
//
//
//        const numbers = [0,1,2,3,4];
//        const subNumbers = [1,2,3];
//        const numberConditions = ['greater','equal','lesser'];
//        numbers.map(value => makeChar('char number ' + value, 'number', (value)));
//        numberConditions.map(condition => {
//            subNumbers.map( num => {
//                makeGroup('group number ' + condition + ' ' + num, 'number', {num, condition});
//            });
//        });
//
//        const checkboxes = [true, false];
//        checkboxes.map(value => makeChar('char checkbox ' + value, 'checkbox', value));
//        getAllSubsets(checkboxes).map( arr => {
//            const obj = arr.reduce( (acc, val) => {
//                acc[String(val)] = true;
//                return acc;
//            }, {});
//            makeGroup('group checkbox ' + arr.join(','), 'checkbox', {selectedOptions: obj});
//        });
//
//        const chars = ['a','b','c','d'];
//        const subChars = ['a','b','c'];
//        getAllSubsets(chars).map(value => makeChar('char string ' + value.join(''), 'string', String(value.join(''))));
//        getAllSubsets(chars).map(value => makeChar('char text ' + value.join(''), 'text', String(value.join(''))));
//
//        getAllSubsets(subChars).map( arr => {
//            makeGroup('group string ' + arr.join(''), 'string', {regexString: arr.join('')});
//        });
//        getAllSubsets(subChars).map( arr => {
//            makeGroup('group text ' + arr.join(''), 'text', {regexString: arr.join('')});
//        });
};
// })(window.TestUtils = {});
