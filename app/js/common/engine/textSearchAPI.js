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

"use strict";

(function(callback){
    
    function textSearchAPI(LocalDBMS, opts) {

        var R             = opts.R           ;
        var CommonUtils   = opts.CommonUtils ;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;

        var searchers = {};
        
        LocalDBMS.prototype.getTexts = function(searchStr, textTypes, caseSensitive, callback) {
            var diff = R.difference(textTypes, R.keys(searchers));
            var test;
            if(caseSensitive){
                test = (text) => (text.indexOf(searchStr) != -1);
            } else {
                searchStr = searchStr.toLowerCase();
                test = (text) => (text.toLowerCase().indexOf(searchStr) != -1);
            }
            if(diff.length != 0){
                callback(new Errors.ValidationError('text-search-unsupported-text-types', [JSON.stringify(diff)]));
                return;
            }
            callback(null, textTypes.map(textType => {return {
                textType: textType,
                result: searchers[textType](textType, test, this.database)
            };}));
        };
        
        var format = (name, type, text) => {
            return {
                name: name,
                type: type,
                text: text
            };
        };
        
        searchers['masterStory'] = function(textType, test, database){
            return R.values(database.Stories).filter(story => test(story.story)).map(story => format(story.name, 'text', story.story));
        };

        searchers['eventOrigins'] = function(textType, test, database){
            return R.flatten(R.values(database.Stories).map(story => {
                return story.events.filter(event => test(event.text)).map(event => format(story.name + '/' + event.name, 'text', event.text));
            }));
        };
        
        searchers['eventAdaptations'] = function(textType, test, database){
            return R.flatten(R.values(database.Stories).map(story => {
                return story.events.map(event => {
                    return R.keys(event.characters).filter(char => test(event.characters[char].text)).map(char => 
                        format(story.name + '/' + event.name + '/' + char, 'text', event.characters[char].text));
                });
            }));
        };
        
        var profileSearch = R.curry(function(profiles, structure, textType, test, database){
            var items = database[structure].filter(item => item.type === 'string' || item.type === 'text');
            return R.flatten(R.values(database[profiles]).map(profile => {
                return items.filter(item => test(profile[item.name])).map(item => format(profile.name + '/' + item.name, item.type, profile[item.name]));
            }));
        });
        searchers['characterProfiles'] = profileSearch('Characters', 'CharacterProfileStructure');
        searchers['playerProfiles'] = profileSearch('Players', 'PlayerProfileStructure');
        
        searchers['relations'] = function(textType, test, database){
            var relations = database.Relations;
            return R.flatten(R.keys(relations).map(name1 => {
                return R.keys(relations[name1]).filter(name2 => test(relations[name1][name2]) ).map(name2 => 
                    format(name1 + '/' + name2, 'text', relations[name1][name2]));
            }));
        };
        
        searchers['groups'] = function(textType, test, database){
            var groups = database.Groups;
            return R.flatten(R.values(groups).map(group => {
                var arr = [];
                if(test(group.masterDescription)){
                    arr.push(format(group.name + '/master', 'text', group.masterDescription));
                }
                if(test(group.characterDescription)){
                    arr.push(format(group.name + '/character', 'text', group.characterDescription));
                }
                return arr;
            }));
        };
    
    };
    callback(textSearchAPI);

})(function(api){
    typeof exports === 'undefined'? this['textSearchAPI'] = api: module.exports = api;
}.bind(this));
