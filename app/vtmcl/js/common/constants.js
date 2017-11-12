/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

((exports) => {
    exports.maxPoints = 5;
    exports.extrasMaxPoints = 10;
    exports.bloodpoolMax = 20;

    exports.allProfileCols = [['name', 'player', 'chronicle', 'age', 'sex'],
        ['nature', 'demeanor', 'concept', 'clan', 'generation', 'sire']];
    //    exports.profileCols = [ [ 'name', 'age', 'sex' ], [ 'nature', 'demeanor', 'concept' ] ];
    exports.profileCols = exports.allProfileCols;

    exports.profileItemList = R.flatten(exports.allProfileCols);

    exports.attributeCols = [{
        name: 'physical',
        arr: ['strength', 'dexterity', 'stamina']
    }, {
        name: 'social',
        arr: ['charisma', 'manipulation', 'appearance']
    }, {
        name: 'mental',
        arr: ['perception', 'intelligence', 'wits']
    }];

    exports.attributeList = R.flatten(exports.attributeCols.map(R.prop('arr')));

    //    'dodge',
    //    'security',
    //    'linguistics',
    exports.abilityCols = [
        {
            name: 'talents',
            arr: ['alertness', 'athletics', 'awareness', 'brawl', 'empathy',
                'expression', 'intimidation', 'leadership', 'streetwise', 'subterfuge']
        },
        {
            name: 'skills',
            arr: ['animalken', 'crafts', 'drive', 'etiquette', 'firearms',
                'larceny', 'melee', 'performance', 'stealth', 'survival']
        },
        {
            name: 'knowledges',
            arr: ['academics', 'computer', 'finance', 'investigation', 'law',
                'medicine', 'occult', 'politics', 'science', 'technology']
        }];

    exports.abilityList = R.flatten(exports.abilityCols.map(R.prop('arr')));

    exports.healthCols = [{
        name: 'health',
        arr: [{
            name: 'bruised',
            penalty: ''
        }, {
            name: 'hurt',
            penalty: '-1'
        }, {
            name: 'injured',
            penalty: '-1'
        }, {
            name: 'wounded',
            penalty: '-2'
        }, {
            name: 'mauled',
            penalty: '-2'
        }, {
            name: 'crippled',
            penalty: '-5'
        }, {
            name: 'incapacitated',
            penalty: ''
        }]
    }];

    exports.virtues = ['conscience', 'self_control', 'courage'];

    exports.basicStateList = ['humanity', 'willpower', 'willpower2', 'bloodpool'];

    exports.advantagesList = ['backgrounds', 'disciplines'];

    exports.backstoryList = ['merits', 'flaws'];


    exports.healthList = exports.healthCols[0].arr.map(R.prop('name'));

    //exports.disciplines = [ 'animalism', 'bardo', 'valeren', 'visceratika', 'obtenebration', 'daimoinon', 'dominate',
    //        'obfuscate', 'vicissitude', 'kineticism', 'melpominee', 'mytherceria', 'potence', 'nihilistics', 'obeah',
    //        'gargoyle flight', 'dementation', 'protean', 'presence', 'auspex', 'sanguinus', 'serpentis', 'quietus',
    //        'mortis', 'fortitude', 'celerity', 'thanatosis', 'temporis', 'chimerstry', 'spiritus' ];

    //    exports.themeList = [ 'nims-theme', 'des-light-theme', 'des-dark-theme' ];

    //    exports.httpTimeout = 5000;
    exports.charsheetBackModes = ['charsheet-image', 'charsheet-none', 'charsheet-color'];

    exports.defaultImg = '../images/back.png';
})(typeof exports === 'undefined' ? this.Constants = {} : exports);
