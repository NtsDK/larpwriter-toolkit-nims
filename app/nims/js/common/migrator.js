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
 // Utils
 */

'use strict';

((callback) => {
    function Migrator(exports, R) {
        exports.migrate = (data) => {
            if (!data.Version) {
                data.Settings = {};
    
                let story, storyCharacters;
                Object.keys(data.Stories).forEach((storyName) => {
                    story = data.Stories[storyName];
                    storyCharacters = Object.keys(story.characters);
                    storyCharacters.forEach((character) => {
                        story.characters[character].activity = {};
                    });
                });
    
                data.Version = '0.0.4';
            }
            if (data.Version === '0.0.4') { // new versioning rule
                data.Version = '0.4.1';
            }
            if (data.Version === '0.4.1') { // new
                delete data.Settings.Events;
                data.Version = '0.4.3';
            }
            if (data.Version === '0.4.3') {
                data.Log = [];
                data.Version = '0.4.4';
                data.Meta.saveTime = new Date();
            }
            if (data.Version === '0.4.4') {
                // see #3
                Object.keys(data.Characters).forEach((charName) => {
                    const char = data.Characters[charName];
                    delete char.displayName;
                });
                Object.keys(data.Stories).forEach((storyName) => {
                    const story = data.Stories[storyName];
                    delete story.displayName;
                });
                data.Version = '0.4.4u1';
            }
            if (data.Version === '0.4.4u1') {
                // see #12
                data.ProfileSettings.forEach((item) => {
                    item.doExport = true;
                });
                data.Meta.saveTime = new Date().toString();
                // see #13
                Object.keys(data.Stories).forEach((storyName) => {
                    const story = data.Stories[storyName];
                    story.events.forEach((event) => {
                        delete event.index;
                        delete event.storyName;
                    });
                });
                // see #17
                Object.keys(data.Stories).forEach((storyName) => {
                    const story = data.Stories[storyName];
                    story.events.forEach((event) => {
                        Object.keys(event.characters).forEach((character) => {
                            delete event.characters[character].name;
                            event.characters[character].time = '';
                        });
                    });
                });
                data.Version = '0.4.4u2';
            }
            if (data.Version === '0.4.4u2') {
                // see #17 - reopened
                Object.keys(data.Stories).forEach((storyName) => {
                    const story = data.Stories[storyName];
                    story.events.forEach((event) => {
                        Object.keys(event.characters).forEach((character) => {
                            delete event.characters[character].name;
                        });
                    });
                });
                data.Version = '0.4.4u3';
            }
            if (data.Version === '0.4.4u3') {
                data.Groups = {};
                if (data.ManagementInfo) {
                    Object.keys(data.ManagementInfo.UsersInfo).forEach((userName) => {
                        data.ManagementInfo.UsersInfo[userName].groups = [];
                    });
                }
    
                data.Version = '0.5.0';
            }
            if (data.Version === '0.5.0') {
                data.InvestigationBoard = {
                    groups: {},
                    resources: {},
                    relations: {}
                };
                data.Version = '0.5.1';
            }
            if (data.Version === '0.5.1') {
                data.Relations = {};
                data.Version = '0.5.2';
            }
            if (data.Version === '0.5.2') {
                if (data.Meta.date === '') {
                    data.Meta.date = '1970/01/01 00:00';
                }
                if (data.Meta.preGameDate === '') {
                    data.Meta.preGameDate = '1970/01/01 00:00';
                }
                data.Version = '0.5.2u1';
            }
            if (data.Version === '0.5.2u1') {
                data.CharacterProfileStructure = data.ProfileSettings;
                delete data.ProfileSettings;
                data.PlayerProfileStructure = [];
                data.Players = {};
                data.ProfileBindings = {};
                if (data.ManagementInfo) {
                    Object.keys(data.ManagementInfo.UsersInfo).forEach((userName) => {
                        data.ManagementInfo.UsersInfo[userName].players = [];
                    });
                }
                data.Version = '0.5.3';
            }
            if (data.Version === '0.5.3') {
                if (data.ManagementInfo) {
                    data.ManagementInfo.PlayersInfo = {};
                    data.ManagementInfo.WelcomeText = '';
                    data.ManagementInfo.PlayersOptions = {
                        allowPlayerCreation: false,
                        allowCharacterCreation: false,
                    };
                }
                data.Version = '0.6.0';
            }
            if (data.Version === '0.6.0') {
                data.CharacterProfileStructure.forEach((item) => {
                    item.playerAccess = 'hidden';
                });
                data.PlayerProfileStructure.forEach((item) => {
                    item.playerAccess = 'hidden';
                });
                data.Version = '0.6.1';
            }
            if (data.Version === '0.6.1') {
                data.CharacterProfileStructure.forEach((item) => {
                    item.showInRoleGrid = false;
                });
                data.PlayerProfileStructure.forEach((item) => {
                    item.showInRoleGrid = false;
                });
                const beginStr = JSON.stringify(['begin']);
                data.Log = data.Log.map((el) => { el.push(beginStr); return el; });
                const oldRelations = data.Relations;
                const triplets = R.toPairs(oldRelations).map(pair => R.toPairs(pair[1]).map(R.prepend(pair[0])));
                const acc = R.unnest(triplets).reduce((acc, triplet) => {
                    const key = JSON.stringify([triplet[0], triplet[1]].sort());
                    if(acc[key] === undefined){
                        acc[key] = {
                            [triplet[0]] : triplet[2],
                            [triplet[1]] : '',
                        }
                    } else {
                        acc[key][triplet[0]] = triplet[2];
                    }
                    return acc;
                }, {})
    
                data.Relations = R.values(acc).map(R.merge({
                    origin: '',
                    ready: false,
                    essence: 'known'
                }));
                
                data.Version = '0.6.2';
            }
            console.log('data ' + data);
    
    
            return data;
        };
    };
    callback(Migrator);
})(api => ((typeof exports === 'undefined') ? api((this.Migrator = {}), R) : (module.exports = api)));