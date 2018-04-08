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
        const {
            R, CommonUtils, Constants, dbmsUtils
        } = opts;
        const CU = CommonUtils;
        const validatorLib = opts.Ajv;
        const schemaBuilder = opts.Schema;

        LocalDBMS.prototype.getConsistencyCheckResult = function (callback) {
            let errors = [];

            let errors2 = [
                checkProfileStructureConsistency(this.database, 'character', 'CharacterProfileStructure'),
                checkProfileStructureConsistency(this.database, 'player', 'PlayerProfileStructure'),
                checkProfileConsistency(this.database, 'Characters', 'CharacterProfileStructure'),
                checkProfileConsistency(this.database, 'Players', 'PlayerProfileStructure'),
                checkProfileValueConsistency(this.database, 'Characters', 'CharacterProfileStructure'),
                checkProfileValueConsistency(this.database, 'Players', 'PlayerProfileStructure'),
                checkStoryCharactersConsistency(this.database),
                checkEventsCharactersConsistency(this.database),
                checkBindingsConsistency(this.database),
                checkRelationsConsistency(this.database)
            ];
            if (this.database.ManagementInfo) {
                errors2.push(checkObjectRightsConsistency(this.database));
                errors2.push(checkPlayerLoginConsistency(this.database));
            }

            errors2.forEach((module) => {
                module.errors = module.errors.map(R.apply(CU.strFormat));
            });
            errors = errors.concat(R.flatten(errors2.map(R.prop('errors'))));

            const schema = schemaBuilder.getSchema(this.database);
            const validator = validatorLib({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
            const validate = validator.compile(schema);
            const valid = validate(this.database);
            if (!valid) {
                errors = errors.concat(validate.errors);

                errors2 = R.concat(errors2, schema.required.map((moduleName) => {
                    const validate2 = validator.compile(schema.properties[moduleName]);
                    const valid2 = validate2(this.database[moduleName]);
                    return {
                        module: moduleName,
                        errors: valid2 ? [] : validate2.errors
                    };
                }));
            }

            const details = R.mapObjIndexed(arr => R.flatten(arr.map(R.prop('errors'))), R.groupBy(R.prop('module'), errors2));

            callback(null, {
                errors,
                details,
                nodes: R.clone(schema.moduleList),
                edges: R.clone(schema.moduleDeps),
            });
        };

        const getErrorProcessor = callback => R.curry(R.compose(callback, CommonUtils.strFormat));

        function checkObjectRightsConsistency(data) {
            const errors = [];
            const entities = {
                characters: R.keys(data.Characters),
                stories: R.keys(data.Stories),
                groups: R.keys(data.Groups),
                players: R.keys(data.Players)
            };
            const types = R.keys(entities);

            R.values(data.ManagementInfo.UsersInfo).forEach((user) => {
                types.forEach((type) => {
                    const difference = R.difference(user[type], entities[type]);
                    if (difference.length !== 0) {
                        const msg = 'Object rights inconsistent, user entity is not exist: user {0}, entity {1}, type {2}';
                        errors.push([msg, [user.name, difference, type]]);
                    }
                });
            });
            return {
                module: 'ManagementInfo',
                errors
            };
        }

        function checkPlayerLoginConsistency(data) {
            const errors = [];
            const playerNames = R.values(data.Players).map(R.prop('name'));
            const loginNames = R.keys(data.ManagementInfo.PlayersInfo);

            const difference = R.difference(loginNames, playerNames);
            if (difference.length !== 0) {
                const msg = 'Player logins inconsistent, logins which have no player: logins {0}';
                errors.push([msg, [difference]]);
            }
            return {
                module: 'ManagementInfo',
                errors
            };
        }

        function checkEventsCharactersConsistency(data) {
            const errors = [];
            R.values(data.Stories).forEach((story) => {
                const storyCharacters = R.values(story.characters).map(R.prop('name'));
                story.events.forEach((event, i) => {
                    const eventCharacters = R.keys(event.characters);
                    const difference = R.difference(eventCharacters, storyCharacters);
                    if (difference.length !== 0) {
                        const msg = 'Event characters inconsistent, some character is not exist: story {0}, character {1}';
                        errors.push([msg, [`${story.name}-${i}-${event.name}`, difference]]);
                    }
                });
            });
            return {
                module: 'Stories',
                errors
            };
        }

        function checkBindingsConsistency(data) {
            const errors = [];
            R.toPairs(R.invert(data.ProfileBindings)).filter(pair => pair[1].length > 1).forEach((pair) => {
                const msg = 'Profile bindings inconsistent, player has multiple characters: player {0}, characters {1}';
                errors.push([msg, [pair[0], JSON.stringify(pair[1])]]);
            });
            return {
                module: 'ProfileBindings',
                errors
            };
        }

        function checkRelationsConsistency(data, callback) {
            const errors = [];
            data.Relations.filter(rel => rel[rel.starter] === undefined).forEach((rel) => {
                const msg = 'Relation inconsistent, starter is not from relation: starter {0}, relation {1}';
                errors.push([msg, [rel.starter, JSON.stringify(rel)]]);
            });
            data.Relations.filter(rel => rel[rel.ender] === undefined).forEach((rel) => {
                const msg = 'Relation inconsistent, ender is not from relation: ender {0}, relation {1}';
                errors.push([msg, [rel.ender, JSON.stringify(rel)]]);
            });

            const keys = data.Relations.map(dbmsUtils._rel2RelKey);
            const groups = R.groupBy(str => str, keys);
            R.values(groups).filter(R.pipe(R.length, R.gt(R.__, 1))).forEach((group) => {
                const msg = 'Relations inconsistent, duplicated relations with key: key {0}';
                errors.push([msg, [group[0]]]);
            });
            return {
                module: 'Relations',
                errors
            };
        }

        function checkStoryCharactersConsistency(data, callback) {
            const charNames = R.values(data.Characters).map(R.prop('name'));
            const errors = [];

            R.values(data.Stories).forEach((story) => {
                const storyCharactersInner = R.values(story.characters).map(R.prop('name'));
                const differenceInner = R.difference(storyCharactersInner, charNames);
                if (differenceInner.length !== 0) {
                    const msg = 'Story characters inconsistent, some character is not exist: story {0}, character {1}';
                    errors.push([msg, [story.name, differenceInner]]);
                }
                const storyCharactersOuter = R.keys(story.characters);
                const differenceOuter = R.symmetricDifference(storyCharactersInner, storyCharactersOuter);
                if (differenceOuter.length !== 0) {
                    const msg = 'Story characters inconsistent, inner and outer character name are inconsistent: story {0}, character {1}';
                    errors.push([msg, [story.name, differenceOuter]]);
                }
            });
            return {
                module: 'Stories',
                errors
            };
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
            const msg = 'Profile value inconsistency, item type is inconsistent: char {0}, item {1}, value {2}';
            const errors = [];

            R.values(data[profiles]).forEach((character) => {
                data[structure].forEach((profileItem) => {
                    if (isInconsistent(character[profileItem.name], profileItem.type, profileItem.value)) {
                        errors.push([msg, [character.name, profileItem.name, character[profileItem.name]]]);
                    }
                });
            });
            return {
                module: profiles,
                errors
            };
        }

        function checkProfileConsistency(data, profiles, structure) {
            const profileItems = data[structure].map(R.prop('name'));
            const errors = [];

            R.values(data[profiles]).forEach((profile) => {
                const charItems = R.keys(profile).filter(R.compose(R.not, R.equals('name')));
                const difference = R.symmetricDifference(charItems, profileItems);
                if (difference.length !== 0) {
                    if (charItems.length !== profileItems.length) {
                        const msg = 'Character profile inconsistent, lengths are different: char {0}, difference [{1}]';
                        errors.push([msg, [profile.name, difference]]);
                        return;
                    }
                    if (!R.all(R.contains(R.__, profileItems))(charItems)) {
                        const msg = 'Character profile inconsistent, item name inconsistency: char {0}, difference [{1}]';
                        errors.push([msg, [profile.name, difference]]);
                    }
                }
            });
            return {
                module: profiles,
                errors
            };
        }

        function checkProfileStructureConsistency(data, type, structure) {
            const profileItems = data[structure].map(R.prop('name'));
            const errors = [];
            if (profileItems.length !== R.uniq(profileItems).length) {
                const diff = R.toPairs(R.groupBy(name => name, profileItems))
                    .filter(pair => pair[1].length > 1).map(pair => pair[0]);
                const msg = 'Profile structure inconsistent, item names are repeated: type {0}, values {1}';
                errors.push([msg, [type, diff]]);
            }
            return {
                module: structure,
                errors
            };
        }
    }

    callback2(consistencyCheckAPI);
})(api => (typeof exports === 'undefined' ? (this.consistencyCheckAPI = api) : (module.exports = api)));
