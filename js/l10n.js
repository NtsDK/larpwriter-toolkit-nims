/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
PageManager, Utils, Overview, Characters, Stories, Events, Briefings, Timeline, SocialNetwork, FileUtils
 */

"use strict";

var L10n = {};

L10n.initialized = false;
L10n.l10nDelegates = [];

L10n.init = function(){
    "use strict";
    if(L10n.initialized){
        return;
    }
    L10n.dictionaries = {};
    console.log(navigator.language);
    
    var processDictionary = function(dictionary){
        var processedDictionary = {};
        for(var sectionName in dictionary){
            for(var name in dictionary[sectionName]){
                processedDictionary[sectionName+"-"+name] = dictionary[sectionName][name];
            }
        } 
        return processedDictionary;
    };
    
    for(var name in Dictionaries){
        L10n.dictionaries[name] = processDictionary(Dictionaries[name]);
    }
    
    //var lang = (navigator.languages ? navigator.languages[0] : navigator.browserLanguage).split('-')[0];
    var lang = 'ru';
    console.log(lang);
    
    if(L10n.dictionaries[lang]){
        L10n.dict = L10n.dictionaries[lang];
    } else {
        L10n.dict = L10n.dictionaries['en'];
    }
    L10n.initialized = true;
};

var lang = "RU";
L10n.toggleL10n = function(){
    "use strict";
    if(lang === "RU"){
        L10n.dict = L10n.dictionaries['en'];
        lang = "EN";
    } else {
        L10n.dict = L10n.dictionaries['ru'];
        lang = "RU";
    }
    L10n.localizeStatic();
    L10n.l10nDelegates.forEach(function(delegate){
        delegate();
    });
    PageManager.currentView.refresh();
};

L10n.getValue = function(name){
    "use strict";
    var value = L10n.dict[name];
    return value ? value : name + ":RA RA-AH-AH-AH ROMA ROMA-MA GAGA OH LA-LA";
};

L10n.getFixedValue = function(name){
    "use strict";
    return function(){
        return L10n.getValue(name);
    };
};

L10n.onL10nChange = function(delegate){
    "use strict";
    L10n.l10nDelegates.push(delegate);
};

L10n.localizeStatic = function(){
    "use strict";
    L10n.init();
    
    var elems = document.querySelectorAll("[l10n-id]");
    
    var el;
//    var sum = {};
    for (var i = 0; i < elems.length; i++) {
        el = elems[i];
//        if(el.innerHTML !== ""){
//            sum[getAttr(el,"l10n-id")] = el.innerHTML;
//        }
        addEl(clearEl(el), makeText(L10n.getValue(getAttr(el,"l10n-id"))));
    }
    
//    addEl(document.getElementsByTagName('body')[0],makeText(JSON.stringify(sum)));
    
    elems = document.querySelectorAll("[l10n-placeholder-id]");
    for (var i = 0; i < elems.length; i++) {
        el = elems[i];
        setAttr(el,"placeholder", L10n.getValue(getAttr(el,"l10n-placeholder-id")))
    }
};