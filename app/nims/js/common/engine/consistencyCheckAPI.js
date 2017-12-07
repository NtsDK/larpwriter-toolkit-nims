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

'use strict';

/* eslint-disable func-names */

((callback2) => {
    function consistencyCheckAPI(LocalDBMS, opts) {
        const { R, CommonUtils } = opts;
        const validatorLib = opts.Ajv;
        const schemaBuilder = opts.Schema;

        LocalDBMS.prototype.getConsistencyCheckResult = function (callback) {
            let errors = [];
            const pushError = str => errors.push(str);

            checkProfileStructureConsistency(this.database, 'character', 'CharacterProfileStructure', pushError);
            checkProfileStructureConsistency(this.database, 'player', 'PlayerProfileStructure', pushError);
            checkProfileConsistency(this.database, 'Characters', 'CharacterProfileStructure', pushError);
            checkProfileConsistency(this.database, 'Players', 'PlayerProfileStructure', pushError);
            checkProfileValueConsistency(this.database, 'Characters', 'CharacterProfileStructure', pushError);
            checkProfileValueConsistency(this.database, 'Players', 'PlayerProfileStructure', pushError);
            checkStoryCharactersConsistency(this.database, pushError);
            checkEventsCharactersConsistency(this.database, pushError);
            checkBindingsConsistency(this.database, pushError);
            if (this.database.ManagementInfo) {
                checkObjectRightsConsistency(this.database, pushError);
                checkPlayerLoginConsistency(this.database, pushError);
            }

            const schema = schemaBuilder.getSchema(this.database);
            const validator = validatorLib({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
            const validate = validator.compile(schema);
            const valid = validate(this.database);
            if (!valid) {
                errors = errors.concat(validate.errors);
            }

            callback(null, errors);
        };

        const getErrorProcessor = callback => R.curry(R.compose(callback, CommonUtils.strFormat));

        function checkObjectRightsConsistency(data, callback) {
            const entities = {
                characters: R.keys(data.Characters),
                stories: R.keys(data.Stories),
                groups: R.keys(data.Groups),
                players: R.keys(data.Players)
            };
            const types = R.keys(entities);
            const processError = getErrorProcessor(callback);

            R.values(data.ManagementInfo.UsersInfo).forEach((user) => {
                types.forEach((type) => {
                    const difference = R.difference(user[type], entities[type]);
                    if (difference.length !== 0) {
                        processError('Object rights inconsistent, user entity is not exist: user {0}, entity {1}, type {2}', [user.name, difference, type]);
                    }
                });
            });
        }

        function checkPlayerLoginConsistency(data, callback) {
            const playerNames = R.values(data.Players).map(R.prop('name'));
            const loginNames = R.keys(data.ManagementInfo.PlayersInfo);
            const processError = getErrorProcessor(callback);

            const difference = R.difference(loginNames, playerNames);
            if (difference.length !== 0) {
                processError('Player logins inconsistent, logins which have no player: logins {0}', [difference]);
            }
        }

        function checkEventsCharactersConsistency(data, callback) {
            const processError = getErrorProcessor(callback);
            R.values(data.Stories).forEach((story) => {
                const storyCharacters = R.values(story.characters).map(R.prop('name'));
                story.events.forEach((event, i) => {
                    const eventCharacters = R.keys(event.characters);
                    const difference = R.difference(eventCharacters, storyCharacters);
                    if (difference.length !== 0) {
                        processError('Event characters inconsistent, some character is not exist: story {0}, character {1}', [`${story.name}:${i}`, difference]);
                    }
                });
            });
        }

        function checkBindingsConsistency(data, callback) {
            const processError = getErrorProcessor(callback);
            R.toPairs(R.invert(data.ProfileBindings)).filter(pair => pair[1].length > 1).forEach((pair) => {
                processError('Profile bindings inconsistent, player has multiple characters: player {0}, characters {1}', [pair[0], JSON.stringify(pair[1])]);
            });
        }

        function checkStoryCharactersConsistency(data, callback) {
            const charNames = R.values(data.Characters).map(R.prop('name'));
            const processError = getErrorProcessor(callback);

            R.values(data.Stories).forEach((story) => {
                const storyCharactersInner = R.values(story.characters).map(R.prop('name'));
                const differenceInner = R.difference(storyCharactersInner, charNames);
                if (differenceInner.length !== 0) {
                    processError('Story characters inconsistent, some character is not exist: story {0}, character {1}', [story.name, differenceInner]);
                }
                const storyCharactersOuter = R.keys(story.characters);
                const differenceOuter = R.symmetricDifference(storyCharactersInner, storyCharactersOuter);
                if (differenceOuter.length !== 0) {
                    processError('Story characters inconsistent, inner and outer character name are inconsistent: story {0}, character {1}', [story.name, differenceOuter]);
                }
            });
        }

        const isInconsistent = (charValue, type, profileItemValue) => {
            let values, charValues;
            switch (type) {
            case 'text':
            case 'string':
                return !R.is(String, charValue);
            case 'enum':
                if (!R.is(String, charValue)) {
                    return true;
                }
                values = profileItemValue.split(',').map(R.trim);
                return !R.contains(charValue.trim(), values);

            case 'multiEnum':
                if (!R.is(String, charValue)) {
                    return true;
                }
                values = profileItemValue === '' ? [] : profileItemValue.split(',').map(R.trim);
                charValues = charValue === '' ? [] : charValue.split(',').map(R.trim);
                return R.difference(charValues, values).length !== 0;

            case 'number':
                return !R.is(Number, charValue);
            case 'checkbox':
                return !R.is(Boolean, charValue);
            default:
                return true;
            }
        };

        function checkProfileValueConsistency(data, profiles, structure, callback) {
            const processError = getErrorProcessor(callback)('Profile value inconsistency, item type is inconsistent: char {0}, item {1}, value {2}');

            R.values(data[profiles]).forEach((character) => {
                data[structure].forEach((profileItem) => {
                    if (isInconsistent(character[profileItem.name], profileItem.type, profileItem.value)) {
                        processError([character.name, profileItem.name, character[profileItem.name]]);
                    }
                });
            });
        }

        function checkProfileConsistency(data, profiles, structure, callback) {
            const profileItems = data[structure].map(R.prop('name'));
            const processError = getErrorProcessor(callback);

            R.values(data[profiles]).forEach((profile) => {
                const charItems = R.keys(profile).filter(R.compose(R.not, R.equals('name')));
                const difference = R.symmetricDifference(charItems, profileItems);
                if (difference.length !== 0) {
                    const processCharacterError = processError(R.__, [profile.name, difference]);
                    if (charItems.length !== profileItems.length) {
                        processCharacterError('Character profile inconsistent, lengths are different: char {0}, difference [{1}]');
                        return;
                    }
                    if (!R.all(R.contains(R.__, profileItems))(charItems)) {
                        processCharacterError('Character profile inconsistent, item name inconsistency: char {0}, difference [{1}]');
                    }
                }
            });
        }

        function checkProfileStructureConsistency(data, type, structure, callback) {
            const profileItems = data[structure].map(R.prop('name'));
            const processError = getErrorProcessor(callback);
            if (profileItems.length !== R.uniq(profileItems).length) {
                const diff = R.toPairs(R.groupBy(name => name, profileItems))
                    .filter(pair => pair[1].length > 1).map(pair => pair[0]);
                processError('Profile structure inconsistent, item names are repeated: type {0}, values {1}', [type, diff]);
            }
        }
    }

    callback2(consistencyCheckAPI);
})(api => (typeof exports === 'undefined' ? (this.consistencyCheckAPI = api) : (module.exports = api)));
