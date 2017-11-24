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
    exports.migrate = (data) => {
        if (!data.Version) {
            data.Meta = {
                name: '',
                date: '',
                preGameDate: '',
                description: '',
                saveTime: new Date().toString()
            };
            data.Version = '0.1.0';
            data.Log = [];
            data.Charsheet = {
                profile: {
                    name: '',
                    player: '',
                    chronicle: '',
                    nature: '',
                    age: '',
                    sex: '',
                    demeanor: '',
                    concept: '',
                    clan: '',
                    generation: '',
                    sire: '',
                },
                attributes: {
                    //                        'physical' : {
                    strength: 1,
                    dexterity: 1,
                    stamina: 1,
                    //                        'social' : {
                    charisma: 1,
                    manipulation: 1,
                    appearance: 1,
                    //                        'mental' : {
                    perception: 1,
                    intelligence: 1,
                    wits: 1,
                },
                abilities: {
                    //                        'talents' : {
                    alertness: 0,
                    athletics: 0,
                    brawl: 0,
                    //                    'dodge' : 0,
                    empathy: 0,
                    expression: 0,
                    intimidation: 0,
                    leadership: 0,
                    streetwise: 0,
                    subterfuge: 0,
                    awareness: 0,
                    //                        'skills' : {
                    animalken: 0,
                    crafts: 0,
                    drive: 0,
                    etiquette: 0,
                    firearms: 0,
                    melee: 0,
                    performance: 0,
                    //                    'security' : 0,
                    stealth: 0,
                    survival: 0,
                    larceny: 0,
                    //                        'knowledges' : {
                    academics: 0,
                    computer: 0,
                    finance: 0,
                    investigation: 0,
                    law: 0,
                    //                    'linguistics' : 0,
                    medicine: 0,
                    occult: 0,
                    politics: 0,
                    science: 0,
                    technology: 0,
                },
                //                    'advantages' : {
                disciplines: {},
                backgrounds: {},
                virtues: {
                    conscience: 1,
                    self_control: 1,
                    courage: 1,
                },
                // backstory
                merits: {},
                flaws: {},
                state: {
                    humanity: 0,
                    willpower: 0,
                    bloodpool: 0,
                    health: {
                        bruised: 0,
                        hurt: 0,
                        injured: 0,
                        wounded: 0,
                        mauled: 0,
                        crippled: 0,
                        incapacitated: 0
                    },
                    willpower2: 0
                },
                notes: ''
            };
        }
        if (data.Version === '0.1.0') {
            data.Settings = {
                backgroundColor: '#ababab',
                charsheetBackColor: '#ffffff',
                charsheetBackImage: Constants.defaultImg,
                charsheetBackMode: 'charsheet-image'
            };
            data.Version = '0.1.1';
        }

        return data;
    };
})(typeof exports === 'undefined' ? this.Migrator = {} : exports);
