import { Dictionaries, defaultLang } from 'nims-resources/translations';
import U from './utils';

class L10nManager {
    state = {
        initialized: false,
        l10nDelegates: [],
        dictionaries: {},
        lang: defaultLang,
        foundStatistics: {},
        notFoundStatistics: {}
    };
    constructor(){
        this.checkDictionaryCompleteness = this.checkDictionaryCompleteness.bind(this);
        this.checkDictionaryInsertCount = this.checkDictionaryInsertCount.bind(this);
        this.localizeStatic = this.localizeStatic.bind(this);
        this.getValue = this.getValue.bind(this);
    }

    init(){
        if (this.state.initialized) {
            return;
        }
        //        console.log(navigator.language);

        this.state.dictionaries = R.map(this.processDictionary, Dictionaries);

        this.dictIterator(this.checkDictionaryCompleteness.bind(this));
        this.dictIterator(this.checkDictionaryInsertCount.bind(this));
        this.showDuplicates();

        //    var lang = (navigator.languages ? navigator.languages[0] : navigator.browserLanguage).split('-')[0];
        //    var lang = 'ru';
        //        var lang = defaultLang;
        //        console.log(lang);

        if (this.state.dictionaries[defaultLang]) {
            this.state.dict = this.state.dictionaries[defaultLang];
        } else {
            this.state.dict = this.state.dictionaries.en;
        }
        this.setHtmlLang(defaultLang);
        this.onL10nChange(this.localizeStatic.bind(this));
        this.state.initialized = true;
    };

    dictIterator(callback) {
        const dictNames = R.keys(this.state.dictionaries);
        if (dictNames.length < 2) {
            return;
        }
        const base = R.head(dictNames);
        R.tail(dictNames).forEach((dictName) => {
            callback(base, dictName);
        });
    }

    checkDictionaryCompleteness(base, dictName) {
        const baseToDict = R.difference(R.keys(this.state.dictionaries[base]), R.keys(this.state.dictionaries[dictName]));
        if (baseToDict.length > 0) {
            console.log(`L10N: ${base} to ${dictName} difference is not empty `, baseToDict);
        } else {
            console.log(`L10N: ${base} to ${dictName} difference is empty (OK)`);
        }
        const dictToBase = R.difference(R.keys(this.state.dictionaries[dictName]), R.keys(this.state.dictionaries[base]));
        if (dictToBase.length > 0) {
            console.log(`L10N: ${dictName} to ${base} difference is not empty `, dictToBase);
        } else {
            console.log(`L10N: ${dictName} to ${base} difference is empty (OK)`);
        }
    }

    checkDictionaryInsertCount(base, dictName) {
        const baseInst = this.state.dictionaries[base];
        const dictInst = this.state.dictionaries[dictName];
        const intersection = R.intersection(R.keys(baseInst), R.keys(this.state.dictionaries[dictName]));
        const notEqual = intersection.filter((key) => CU.strFormatInsertsCount(baseInst[key]) !== CU.strFormatInsertsCount(dictInst[key]));
        if (notEqual.length > 0) {
            console.log(`L10N: insert counts for ${dictName} and ${base} are not equal`, notEqual);
        } else {
            console.log(`L10N: insert counts for ${dictName} and ${base} are equal (OK)`);
        }
    }

    showDuplicates() {
        R.keys(this.state.dictionaries).forEach((key) => {
            const map = R.filter((arr) => arr.length > 1, R.invert(this.state.dictionaries[key]));
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
        return this.state.lang;
    }

    toggleL10n(){
        if (this.state.lang === 'ru') {
            this.state.dict = this.state.dictionaries.en;
            this.state.lang = 'en';
        } else {
            this.state.dict = this.state.dictionaries.ru;
            this.state.lang = 'ru';
        }
        this.state.foundStatistics.clear();
        this.state.notFoundStatistics.clear();

        this.setHtmlLang(this.state.lang);
        this.state.l10nDelegates.forEach((delegate) => {
            delegate();
        });
    };

    getLang() {
        return this.state.lang.toLowerCase();
    }

    format = R.curry((namespace, name, args) => CU.strFormat(this.get(namespace, name), args));

    getValue(name){
        const value = this.state.dict[name];
        if (value === undefined) {
            console.log(`Value is not found: ${name}`);
            this.state.notFoundStatistics[name] = (this.state.notFoundStatistics[name] || 0) + 1;
        } else {
            this.state.foundStatistics[name] = (this.state.foundStatistics[name] || 0) + 1;
        }
        return value || `${name}:RA RA-AH-AH-AH ROMA ROMA-MA GAGA OH LA-LA`;
    };

    get = R.curry((namespace, name) => this.getValue(`${namespace}-${name}`));

    const(key) {
        return this.getValue(`constant-${key}`);
    }

    hasValue(name){
        const value = this.state.dict[name];
        return value !== undefined;
    };

    onL10nChange(delegate){
        this.state.l10nDelegates.push(delegate);
    };

    localizeStatic(el){
        el = el || document;
        U.nl2array(U.qees(el, '[l10n-id]')).map((el2) => U.addEl(U.clearEl(el2), U.makeText(this.getValue(U.getAttr(el2, 'l10n-id')))));
        U.nl2array(U.qees(el, '[l10n-placeholder-id]')).map((el2) => U.setAttr(el2, 'placeholder', this.getValue(U.getAttr(el2, 'l10n-placeholder-id'))));
        U.nl2array(U.qees(el, '[l10n-title]')).map((el2) => U.setAttr(el2, 'title', this.getValue(U.getAttr(el2, 'l10n-title'))));
    };

    getFoundStatistics(){
        return R.clone(this.state.foundStatistics);
    }
    getNotFoundStatistics(){
        return R.clone(this.state.foundStanotFoundStatisticstistics);
    }
    getNotUsedByStatistics(){
        return R.difference(R.keys(this.state.dict), R.keys(this.state.foundStatistics));
    }
}

const l10nManager = new L10nManager();

export default l10nManager;
