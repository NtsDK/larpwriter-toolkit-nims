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

/*
 */
"use strict";

(function(exports) {

    // exports.profileCols = [ [ 'name', 'player', 'chronicle', 'age', 'sex' ],
    // [ 'nature', 'demeanor', 'concept', 'clan', 'generation', 'sire' ] ];
    exports.profileCols = [ [ 'name', 'age', 'sex' ], [ 'nature', 'demeanor', 'concept' ] ];

    exports.attributeCols = [ {
        name : 'physical',
        arr : [ 'strength', 'dexterity', 'stamina' ]
    }, {
        name : 'social',
        arr : [ 'charisma', 'manipulation', 'appearance' ]
    }, {
        name : 'mental',
        arr : [ 'perception', 'intelligence', 'wits' ]
    } ];

    exports.abilityCols = [
    {
        name : 'talents',
        arr : [ 'athletics', 'alertness', 'brawl', 'dodge', 'empathy', 'intimidation', 'leadership',
                'streetwise', 'expression', 'subterfuge' ]
    },
    {
        name : 'skills',
        arr : [ 'animalken', 'drive', 'etiquette', 'firearms', 'melee', 'survival', 'crafts', 'stealth',
                'security', 'performance', ]
    },
    {
        name : 'knowledges',
        arr : [ 'science', 'politics', 'occult', 'medicine', 'linguistics', 'law', 'investigation', 'finance',
                'computer', 'academics', ]
    } ];

    exports.healthCols = [ {
        name : 'health',
        arr : [ {
            name : 'bruised',
            penalty : ''
        }, {
            name : 'hurt',
            penalty : '-1'
        }, {
            name : 'injured',
            penalty : '-1'
        }, {
            name : 'wounded',
            penalty : '-2'
        }, {
            name : 'mauled',
            penalty : '-2'
        }, {
            name : 'crippled',
            penalty : '-5'
        }, {
            name : 'incapacitated',
            penalty : ''
        }, ]
    } ];

    exports.virtues = [ "conscience", "self_control", "courage" ];

    exports.disciplines = [ 'animalism', 'bardo', 'valeren', 'visceratika', 'obtenebration', 'daimoinon', 'dominate',
            'obfuscate', 'vicissitude', 'kineticism', 'melpominee', 'mytherceria', 'potence', 'nihilistics', 'obeah',
            'gargoyle flight', 'dementation', 'protean', 'presence', 'auspex', 'sanguinus', 'serpentis', 'quietus',
            'mortis', 'fortitude', 'celerity', 'thanatosis', 'temporis', 'chimerstry', 'spiritus' ];

    exports.themeList = [ 'nims-theme', 'des-light-theme', 'des-dark-theme' ];

    // exports.assetTypes = ["local","global"];
    //    
    // exports.shopDataTypes = ["corporation","sellerLogin","sellerPassword"];
    //    
    // exports.ownedEntityTypes = ['shop','asset'];
    //
    // exports.assetProfileStructure = [{
    // name: "displayString",
    // type: "string",
    // },{
    // name: "isPhysical",
    // type: "checkbox",
    // },{
    // name: "resourceCost",
    // type: "number",
    // },{
    // name: "apiKey",
    // type: "string",
    // },{
    // name: "description",
    // type: "text",
    // }];
    //    
    // exports.assetEditableItems =
    // ['displayString','isPhysical','resourceCost','apiKey','description'];
    // exports.localAssetEditableItems = ['displayString','description'];
    //    
    // exports.localAssetProfileStructure = [{
    // name: "displayString",
    // type: "string",
    // },{
    // name: "description",
    // type: "text",
    // }];

    exports.httpTimeout = 5000;

})(typeof exports === 'undefined' ? this['Constants'] = {} : exports);
