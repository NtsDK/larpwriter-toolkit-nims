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

((exports, Dictionaries) => {
    const state = {};

    state.initialized = false;
    state.l10nDelegates = [];
    state.dictionaries = {};
    state.lang = defaultLang;

    exports.init = () => {
        if (state.initialized) {
            return;
        }
        //        console.log(navigator.language);

        state.dictionaries = R.map(processDictionary, Dictionaries);

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

    var setHtmlLang = lang => setAttr(document.getElementsByTagName('html')[0], 'lang', lang);

    exports.toggleL10n = () => {
        if (state.lang === 'ru') {
            state.dict = state.dictionaries.en;
            state.lang = 'en';
        } else {
            state.dict = state.dictionaries.ru;
            state.lang = 'ru';
        }
        setHtmlLang(state.lang);
        state.l10nDelegates.forEach((delegate) => {
            delegate();
        });
    };

    exports.getLang = () => state.lang.toLowerCase();

    exports.format = R.curry((namespace, name, args) => strFormat(exports.get(namespace, name), args));

    exports.get = R.curry((namespace, name) => L10n.getValue(`${namespace}-${name}`));

    exports.getValue = (name) => {
        const value = state.dict[name];
        if (value === undefined) console.log(`Value is not found: ${name}`);
        return value || `${name}:RA RA-AH-AH-AH ROMA ROMA-MA GAGA OH LA-LA`;
    };
    
    exports.hasValue = (name) => {
        const value = state.dict[name];
        return value !== undefined;
    };

    exports.onL10nChange = (delegate) => {
        state.l10nDelegates.push(delegate);
    };

    exports.localizeStatic = (el) => {
        el = el || document;
        nl2array(qees(el, '[l10n-id]')).map(el2 =>
            addEl(clearEl(el2), makeText(exports.getValue(getAttr(el2, 'l10n-id')))));
        nl2array(qees(el, '[l10n-placeholder-id]')).map(el2 =>
            setAttr(el2, 'placeholder', exports.getValue(getAttr(el2, 'l10n-placeholder-id'))));
        nl2array(qees(el, '[l10n-title]')).map(el2 =>
            setAttr(el2, 'title', exports.getValue(getAttr(el2, 'l10n-title'))));
    };
})(this.L10n = {}, Dictionaries);
