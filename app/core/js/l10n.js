const {Dictionaries, defaultLang } = require('resources/translations');
const CU = require("./common/commonUtils.js");
const U  = require('./utils.js');
// import { setAttr } from "./utils.js";
// const R = require("ramda");
/*Copyright 2015-2017 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

/* eslint-disable no-var,vars-on-top */

// ((exports, Dictionaries) => {
    const state = {};

    state.initialized = false;
    state.l10nDelegates = [];
    state.dictionaries = {};
    state.lang = defaultLang;
    state.foundStatistics = {};
    state.notFoundStatistics = {};

    exports.init = () => {
        if (state.initialized) {
            return;
        }
        //        console.log(navigator.language);

        state.dictionaries = R.map(processDictionary, Dictionaries);
        
        dictIterator(checkDictionaryCompleteness);
        dictIterator(checkDictionaryInsertCount);
        showDuplicates();

        //    var lang = (navigator.languages ? navigator.languages[0] : navigator.browserLanguage).split('-')[0];
        //    var lang = 'ru';
        //        var lang = defaultLang;
        //        console.log(lang);

        if (state.dictionaries[defaultLang]) {
            state.dict = state.dictionaries[defaultLang];
        } else {
            state.dict = state.dictionaries.en;
        }
        setHtmlLang(defaultLang);
        exports.onL10nChange(exports.localizeStatic);
        state.initialized = true;
    };
    
    function dictIterator(callback){
        const dictNames = R.keys(state.dictionaries);
        if(dictNames.length < 2) {
            return;
        }
        const base = R.head(dictNames);
        R.tail(dictNames).forEach( dictName => {
            callback(base, dictName);
        });
    }
    
    function checkDictionaryCompleteness(base, dictName){
        const baseToDict = R.difference(R.keys(state.dictionaries[base]), R.keys(state.dictionaries[dictName]));
        if(baseToDict.length > 0){
            console.log(`L10N: ${base} to ${dictName} difference is not empty `, baseToDict);
        } else {
            console.log(`L10N: ${base} to ${dictName} difference is empty (OK)`);
        }
        const dictToBase = R.difference(R.keys(state.dictionaries[dictName]), R.keys(state.dictionaries[base]));
        if(dictToBase.length > 0){
            console.log(`L10N: ${dictName} to ${base} difference is not empty `, dictToBase);
        } else {
            console.log(`L10N: ${dictName} to ${base} difference is empty (OK)`);
        }
    }
    
    function checkDictionaryInsertCount(base, dictName){
        const baseInst = state.dictionaries[base];
        const dictInst = state.dictionaries[dictName];
        const intersection = R.intersection(R.keys(baseInst), R.keys(state.dictionaries[dictName]));
        const notEqual = intersection.filter(key => {
            return CU.strFormatInsertsCount(baseInst[key]) !== CU.strFormatInsertsCount(dictInst[key])
        });
        if(notEqual.length > 0) {
            console.log(`L10N: insert counts for ${dictName} and ${base} are not equal`, notEqual);
        } else {
            console.log(`L10N: insert counts for ${dictName} and ${base} are equal (OK)`);
        }
    }
    
    function showDuplicates(){
        R.keys(state.dictionaries).forEach(key => {
            const map = R.filter(arr => arr.length > 1, R.invert(state.dictionaries[key]));
            console.log(`L10N: Duplicates ${key} `, map);
        });
    }

    var processDictionary = (dictionary) => {
        const processedDictionary = {};
        R.toPairs(dictionary).forEach(([sectionName, section]) => {
            R.toPairs(section).forEach(([key, value]) => {
                processedDictionary[`${sectionName}-${key}`] = value;
            });
        });
        //        for (const sectionName in dictionary) {
        //            for (const name in dictionary[sectionName]) {
        //                processedDictionary[`${sectionName}-${name}`] = dictionary[sectionName][name];
        //            }
        //        }
        return processedDictionary;
    };

    var setHtmlLang = lang => U.setAttr(document.getElementsByTagName('html')[0], 'lang', lang);
    
    exports.getLocale = () => state.lang;

    exports.toggleL10n = () => {
        if (state.lang === 'ru') {
            state.dict = state.dictionaries.en;
            state.lang = 'en';
        } else {
            state.dict = state.dictionaries.ru;
            state.lang = 'ru';
        }
        state.foundStatistics.clear();
        state.notFoundStatistics.clear();
        
        setHtmlLang(state.lang);
        state.l10nDelegates.forEach((delegate) => {
            delegate();
        });
        
    };

    exports.getLang = () => state.lang.toLowerCase();

    exports.format = R.curry((namespace, name, args) => CU.strFormat(exports.get(namespace, name), args));

    // function getL10n(key) {
    //     return L10n.getValue(key);
    // }
    
    // function constL10n(key) {
    //     return L10n.getValue(`constant-${key}`);
    // }

    exports.getValue = (name) => {
        const value = state.dict[name];
        if (value === undefined) {
            console.log(`Value is not found: ${name}`);
            state.notFoundStatistics[name] = (state.notFoundStatistics[name] || 0) + 1;
        } else {
            state.foundStatistics[name] = (state.foundStatistics[name] || 0) + 1;
        }
        return value || `${name}:RA RA-AH-AH-AH ROMA ROMA-MA GAGA OH LA-LA`;
    };

    exports.get = R.curry((namespace, name) => exports.getValue(`${namespace}-${name}`));

    exports.const = key => exports.getValue(`constant-${key}`);
    
    exports.hasValue = (name) => {
        const value = state.dict[name];
        return value !== undefined;
    };

    exports.onL10nChange = (delegate) => {
        state.l10nDelegates.push(delegate);
    };

    exports.localizeStatic = (el) => {
        el = el || document;
        U.nl2array(U.qees(el, '[l10n-id]')).map(el2 =>
            U.addEl(U.clearEl(el2), U.makeText(exports.getValue(U.getAttr(el2, 'l10n-id')))));
        U.nl2array(U.qees(el, '[l10n-placeholder-id]')).map(el2 =>
            U.setAttr(el2, 'placeholder', exports.getValue(U.getAttr(el2, 'l10n-placeholder-id'))));
        U.nl2array(U.qees(el, '[l10n-title]')).map(el2 =>
            U.setAttr(el2, 'title', exports.getValue(U.getAttr(el2, 'l10n-title'))));
    };
    
    exports.getFoundStatistics = () => R.clone(state.foundStatistics);
    exports.getNotFoundStatistics = () => R.clone(state.notFoundStatistics);
    
    exports.getNotUsedByStatistics = () => R.difference(R.keys(state.dict), R.keys(state.foundStatistics));
    
// })(window.L10n = {}, Dictionaries);
