/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

/* eslint-disable func-names */

((callback2) => {
    function relationsAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, addListener, dbmsUtils, CU, PC
        } = opts;

        const relationsPath = ['Relations'];

        dbmsUtils._getKnownCharacters = (database, characterName) => {
            const stories = database.Stories;
            const knownCharacters = {};
            R.values(stories).forEach((story) => {
                const filter = R.compose(R.not, R.isNil, R.prop(characterName), R.prop('characters'));
                story.events.filter(filter).forEach((event) => {
                    R.keys(event.characters).forEach((charName) => {
                        knownCharacters[charName] = knownCharacters[charName] || {};
                        knownCharacters[charName][story.name] = true;
                    });
                });
            });
            delete knownCharacters[characterName];
            return knownCharacters;
        };

        const characterCheck = (characterName, database) => PC.chainCheck([PC.isString(characterName),
            PC.entityExists(characterName, R.keys(database.Characters))]);

        LocalDBMS.prototype.getRelationsSummary = function (characterName, callback) {
            PC.precondition(characterCheck(characterName, this.database), callback, () => {
                const relData = R.clone(R.path(relationsPath, this.database));
                const relations = R.filter(rel => rel[characterName] !== undefined, relData);

                callback(null, {
                    relations,
                    knownCharacters: dbmsUtils._getKnownCharacters(this.database, characterName)
                });
            });
        };

        LocalDBMS.prototype.setCharacterRelation = function (fromCharacter, toCharacter, text, callback) {
            const chain = PC.chainCheck([characterCheck(fromCharacter, this.database),
                characterCheck(toCharacter, this.database), PC.isString(text)]);
            PC.precondition(chain, callback, () => {
//                const relData = R.path(relationsPath, this.database);
//                text = text.trim();
//                if (text === '') {
//                    if (relData[fromCharacter] !== undefined) {
//                        delete relData[fromCharacter][toCharacter];
//                    }
//                } else {
//                    relData[fromCharacter] = relData[fromCharacter] || {};
//                    relData[fromCharacter][toCharacter] = text;
//                }
                if (callback) callback();
            });
        };

        function _renameCharacter(type, fromName, toName) {
            if (type === 'player') return;
            const relData = R.path(relationsPath, this.database);
            if (relData[fromName] !== undefined) {
                relData[toName] = relData[fromName];
                delete relData[fromName];
            }
            R.values(relData).forEach((rels) => {
                if (rels[fromName] !== undefined) {
                    rels[toName] = rels[fromName];
                    delete rels[fromName];
                }
            });
        }

        addListener('renameProfile', _renameCharacter);

        function _removeCharacter(type, characterName) {
            if (type === 'player') return;
            const relData = R.path(relationsPath, this.database);
            if (relData[characterName] !== undefined) {
                delete relData[characterName];
            }
            R.values(relData).forEach((rels) => {
                if (rels[characterName] !== undefined) {
                    delete rels[characterName];
                }
            });
        }

        addListener('removeProfile', _removeCharacter);
    }

    callback2(relationsAPI);
})(api => (typeof exports === 'undefined' ? (this.relationsAPI = api) : (module.exports = api)));
