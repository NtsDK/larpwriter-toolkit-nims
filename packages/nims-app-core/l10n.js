import { Dictionaries, defaultLang } from 'nims-resources/translations';
import U from './utils';

import { i18n } from "./i18n";
import { times } from 'ramda';

const l10nModulesList = R.keys(Dictionaries[defaultLang]);

class L10nManager {
    initialized = false;
    l10nDelegates = [];
    dictionaries = {};
    lang = defaultLang;
    foundStatistics = {};
    notFoundStatistics = {};
    cache = {};
    constructor(){
        this.checkDictionaryCompleteness = this.checkDictionaryCompleteness.bind(this);
        this.checkDictionaryInsertCount = this.checkDictionaryInsertCount.bind(this);
        this.localizeStatic = this.localizeStatic.bind(this);
        this.getValue = this.getValue.bind(this);
    }

    init(){
        if (this.initialized) {
            return;
        }
        //        console.log(navigator.language);

        this.dictionaries = R.map(this.processDictionary, Dictionaries);

        this.dictIterator(this.checkDictionaryCompleteness.bind(this));
        this.dictIterator(this.checkDictionaryInsertCount.bind(this));
        this.showDuplicates();

        if (this.dictionaries[defaultLang]) {
            this.dict = this.dictionaries[defaultLang];
        } else {
            this.dict = this.dictionaries.en;
        }
        this.setHtmlLang(defaultLang);
        this.onL10nChange(this.localizeStatic.bind(this));
        this.initialized = true;
    };

    dictIterator(callback) {
        const dictNames = R.keys(this.dictionaries);
        if (dictNames.length < 2) {
            return;
        }
        const base = R.head(dictNames);
        R.tail(dictNames).forEach((dictName) => {
            callback(base, dictName);
        });
    }

    checkDictionaryCompleteness(base, dictName) {
        const baseToDict = R.difference(R.keys(this.dictionaries[base]), R.keys(this.dictionaries[dictName]));
        if (baseToDict.length > 0) {
            console.log(`L10N: ${base} to ${dictName} difference is not empty `, baseToDict);
        } else {
            console.log(`L10N: ${base} to ${dictName} difference is empty (OK)`);
        }
        const dictToBase = R.difference(R.keys(this.dictionaries[dictName]), R.keys(this.dictionaries[base]));
        if (dictToBase.length > 0) {
            console.log(`L10N: ${dictName} to ${base} difference is not empty `, dictToBase);
        } else {
            console.log(`L10N: ${dictName} to ${base} difference is empty (OK)`);
        }
    }

    checkDictionaryInsertCount(base, dictName) {
        const baseInst = this.dictionaries[base];
        const dictInst = this.dictionaries[dictName];
        const intersection = R.intersection(R.keys(baseInst), R.keys(this.dictionaries[dictName]));
        const notEqual = intersection.filter((key) => CU.strFormatInsertsCount(baseInst[key]) !== CU.strFormatInsertsCount(dictInst[key]));
        if (notEqual.length > 0) {
            console.log(`L10N: insert counts for ${dictName} and ${base} are not equal`, notEqual);
        } else {
            console.log(`L10N: insert counts for ${dictName} and ${base} are equal (OK)`);
        }
    }

    showDuplicates() {
        R.keys(this.dictionaries).forEach((key) => {
            const map = R.filter((arr) => arr.length > 1, R.invert(this.dictionaries[key]));
            console.log(`L10N: Duplicates ${key} `, map);
        });
    }

    processDictionary(dictionary){
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

    setHtmlLang(lang) {
        U.setAttr(document.getElementsByTagName('html')[0], 'lang', lang);
    }

    getLocale() {
        return this.lang;
    }

    toggleL10n(){
        if (this.lang === 'ru') {
            this.dict = this.dictionaries.en;
            this.lang = 'en';
        } else {
            this.dict = this.dictionaries.ru;
            this.lang = 'ru';
        }
        this.foundStatistics.clear();
        this.notFoundStatistics.clear();

        this.setHtmlLang(this.lang);
        this.l10nDelegates.forEach((delegate) => {
            delegate();
        });
    };

    getLang() {
        return this.lang.toLowerCase();
    }

    format = R.curry((namespace, name, args) => CU.strFormat(this.get(namespace, name), args));

    parseKey(name) {
        const parsedName = this.cache[name];
        if (parsedName !== undefined) {
            return parsedName;
        }

        const moduleName = l10nModulesList.find(moduleName => name.startsWith(moduleName));
        if(moduleName === undefined) {
            this.cache[name] = null;
            return null;
        }
        const parsedName2 = {
            namespace: moduleName,
            name: name.substring(moduleName.length + 1)
        }

        this.cache[name] = parsedName2;
        // console.log(name, parsedName2);
        return parsedName2;
    }

    getValue(name){
        // const value = this.dict[name];
        const parsedName = this.parseKey(name);
        if (parsedName === null) {
            console.log('Name is not parsed:', name);
            return `${name}:NOT PARSED`;
        }
        const value2 = i18n.t(`${parsedName.namespace}.${parsedName.name}`);

        if (value2 === undefined) {
            console.log(`Value is not found: ${name}`);
            this.notFoundStatistics[name] = (this.notFoundStatistics[name] || 0) + 1;
        } else {
            this.foundStatistics[name] = (this.foundStatistics[name] || 0) + 1;
        }
        return value2 || `${name}:RA RA-AH-AH-AH ROMA ROMA-MA GAGA OH LA-LA`;
    };

    getValue2(namespace, name) {
        return i18n.t(`${namespace}.${name}`);
        // return this.getValue(`${namespace}-${name}`)
    }

    get = R.curry((namespace, name) => this.getValue2(namespace, name));

    const(key) {
        return this.getValue2('constant', key);
    }
    // const(key) {
    //     return this.getValue(`constant-${key}`);
    // }

    hasValue(name){
        const value = this.dict[name];
        return value !== undefined;
    };

    onL10nChange(delegate){
        this.l10nDelegates.push(delegate);
    };

    localizeStatic(el){
        el = el || document;
        U.nl2array(U.qees(el, '[l10n-id]')).map((el2) => U.addEl(U.clearEl(el2), U.makeText(this.getValue(U.getAttr(el2, 'l10n-id')))));
        U.nl2array(U.qees(el, '[l10n-placeholder-id]')).map((el2) => U.setAttr(el2, 'placeholder', this.getValue(U.getAttr(el2, 'l10n-placeholder-id'))));
        U.nl2array(U.qees(el, '[l10n-title]')).map((el2) => U.setAttr(el2, 'title', this.getValue(U.getAttr(el2, 'l10n-title'))));
    };

    getFoundStatistics(){
        return R.clone(this.foundStatistics);
    }
    getNotFoundStatistics(){
        return R.clone(this.notFoundStatistics);
    }
    getNotUsedByStatistics(){
        return R.difference(R.keys(this.dict), R.keys(this.foundStatistics));
    }
}

const l10nManager = new L10nManager();

export default l10nManager;
