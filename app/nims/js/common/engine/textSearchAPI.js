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

'use strict';

(function (callback) {
    function textSearchAPI(LocalDBMS, opts) {
        const R = opts.R;
        const CU = opts.CommonUtils;
        const PC = opts.Precondition;
        const Constants = opts.Constants;
        const Errors = opts.Errors;

        const searchers = {};

        //        LocalDBMS.prototype.getTextsTest = function(searchStr, textTypes, caseSensitive, callback){
        //            var errPrint = function(err){
        //                console.log(err);
        //            };
        //            var okPrint = function(){
        //                console.log('OK');
        //            };
        //            this.getTexts(123, null, null, errPrint, okPrint);
        //            this.getTexts('23', true, null, errPrint, okPrint);
        //            this.getTexts('23', ['window'], null, errPrint, okPrint);
        //            this.getTexts('23', [], '123', errPrint, okPrint);
        //            callback('test result');
        //        };

        LocalDBMS.prototype.getTexts = function (searchStr, textTypes, caseSensitive, callback) {
            const check = PC.chainCheck([PC.isString(searchStr), PC.isArray(textTypes),
                textTypesPrecondition(textTypes), PC.isBoolean(caseSensitive)]);
            PC.precondition(check, callback, () => {
                let test;
                if (caseSensitive) {
                    test = text => (text.indexOf(searchStr) != -1);
                } else {
                    searchStr = searchStr.toLowerCase();
                    test = text => (text.toLowerCase().indexOf(searchStr) != -1);
                }
                callback(null, textTypes.map(textType => ({
                    textType,
                    result: searchers[textType](textType, test, this.database)
                })));
            });
        };

        const format = (name, type, text) => ({
            name,
            type,
            text
        });

        searchers.masterStory = function (textType, test, database) {
            return R.values(database.Stories).filter(story => test(story.story)).map(story => format(story.name, 'text', story.story));
        };

        searchers.eventOrigins = function (textType, test, database) {
            return R.flatten(R.values(database.Stories).map(story => story.events.filter(event => test(event.text)).map(event => format(`${story.name}/${event.name}`, 'text', event.text))));
        };

        searchers.eventAdaptations = function (textType, test, database) {
            return R.flatten(R.values(database.Stories).map(story => story.events.map(event => R.keys(event.characters).filter(char => test(event.characters[char].text)).map(char =>
                format(`${story.name}/${event.name}/${char}`, 'text', event.characters[char].text)))));
        };

        const profileSearch = R.curry((profiles, structure, textType, test, database) => {
            const items = database[structure].filter(item => item.type === 'string' || item.type === 'text');
            return R.flatten(R.values(database[profiles]).map(profile => items.filter(item => test(profile[item.name])).map(item => format(`${profile.name}/${item.name}`, item.type, profile[item.name]))));
        });
        searchers.characterProfiles = profileSearch('Characters', 'CharacterProfileStructure');
        searchers.playerProfiles = profileSearch('Players', 'PlayerProfileStructure');

        searchers.relations = function (textType, test, database) {
            const relations = database.Relations;
            return R.flatten(R.keys(relations).map(name1 => R.keys(relations[name1]).filter(name2 => test(relations[name1][name2])).map(name2 =>
                format(`${name1}/${name2}`, 'text', relations[name1][name2]))));
        };

        searchers.groups = function (textType, test, database) {
            const groups = database.Groups;
            return R.flatten(R.values(groups).map((group) => {
                const arr = [];
                if (test(group.masterDescription)) {
                    arr.push(format(`${group.name}/master`, 'text', group.masterDescription));
                }
                if (test(group.characterDescription)) {
                    arr.push(format(`${group.name}/character`, 'text', group.characterDescription));
                }
                return arr;
            }));
        };

        var textTypesPrecondition = PC.elementsFromEnum(R.__, R.keys(searchers));
    }
    callback(textSearchAPI);
}((api) => {
    typeof exports === 'undefined' ? this.textSearchAPI = api : module.exports = api;
}));
