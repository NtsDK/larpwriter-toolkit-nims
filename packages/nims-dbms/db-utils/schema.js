const R = require('ramda');
// const CU = require('../../core/commonUtils');
const CU = require('nims-dbms-core/commonUtils');
const Constants = require('../nimsConstants');
// const { CU } = require('core');
// const { CU } = require('js/common');
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

/* eslint-disable func-names */

// ((callback) => {
let makeProfileStructureItemSchema;

exports.getSchema = function (base) {
    const schema = {
        title: 'Larpwriter Toolkit NIMS base',
        description: 'Larpwriter Toolkit base schema.',
        type: 'object',
        definitions: {}
    };

    const Meta = getMetaSchema();
    const CharacterProfileStructure = getProfileSettingsSchema();
    const PlayerProfileStructure = CharacterProfileStructure;
    const Log = getLogSchema();
    const Characters = getProfileSchema(base.CharacterProfileStructure);
    const Players = getProfileSchema(base.PlayerProfileStructure);
    const ProfileBindings = getProfileBindings(base.Characters, base.Players);
    const Stories = getStoriesSchema(base.Characters);
    const Groups = getGroupsSchema(base.CharacterProfileStructure, base.PlayerProfileStructure);
    const InvestigationBoard = getInvestigationBoardSchema(base.Groups, base.InvestigationBoard);
    const Relations = getRelationsSchema(base.Characters, schema.definitions);
    const Gears = getGearsSchema();
    const Sliders = getSlidersSchema();
    let ManagementInfo = {};
    if (base.ManagementInfo) {
        ManagementInfo = getManagementInfoSchema(
            base.ManagementInfo, base.Characters, base.Stories,
            base.Groups, base.Players
        );
    }

    schema.properties = {
        Meta,
        CharacterProfileStructure,
        PlayerProfileStructure,
        Characters,
        Players,
        ProfileBindings,
        Stories,
        Version: {
            type: 'string'
        },
        Log,
        Groups,
        InvestigationBoard,
        Settings: {},
        Gears,
        Sliders,
        Relations,
        ManagementInfo
    };

    schema.required = ['Meta', 'CharacterProfileStructure', 'PlayerProfileStructure', 'Version', 'Characters',
        'Players', 'ProfileBindings', 'Stories', 'Log', 'Groups', 'InvestigationBoard', 'Relations', 'Gears', 'Sliders'];
    schema.additionalProperties = false;

    schema.moduleList = R.keys(schema.properties);
    schema.moduleDeps = [
        ['InvestigationBoard', 'Groups'],
        ['Groups', 'CharacterProfileStructure'],
        ['Groups', 'PlayerProfileStructure'],
        ['Players', 'PlayerProfileStructure'],
        ['Characters', 'CharacterProfileStructure'],

        ['ManagementInfo', 'Groups'],
        ['ManagementInfo', 'Players'],
        ['ManagementInfo', 'Stories'],
        ['ManagementInfo', 'Characters'],
        ['ProfileBindings', 'Players'],

        ['ProfileBindings', 'Characters'],
        ['Relations', 'Characters'],
        ['Stories', 'Characters'],
    ];

    return schema;
};

function getMetaSchema() {
    return {
        title: 'Meta',
        description: 'Contains meta data for game: name, description, dates and saving time.',
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Game name'
            },
            date: {
                type: 'string',
                description: 'Time of starting game in game universe.'
            },
            preGameDate: {
                type: 'string',
                description: 'Time of starting pregame events in game universe.'
            },
            description: {
                type: 'string',
                description: 'Description text for game.'
            },
            saveTime: {
                type: 'string',
                description: 'Stringified date of last database saving.'
            }
        },
        required: ['name', 'date', 'preGameDate', 'description', 'saveTime'],
        additionalProperties: false
    };
}

function getProfileSettingsSchema() {
    return {
        title: 'CharacterProfileStructure',
        description: 'Describes character profile settings.',
        type: 'array',
        items: {
            oneOf: [{
                type: 'object',
                properties: {
                    name: {
                        type: 'string'
                    },
                    type: {
                        type: 'string',
                        enum: ['string', 'text', 'enum', 'multiEnum']
                    },
                    value: {
                        type: ['string']
                    },
                    doExport: {
                        type: 'boolean'
                    },
                    showInRoleGrid: {
                        type: 'boolean'
                    },
                    playerAccess: {
                        type: 'string',
                        enum: ['write', 'readonly', 'hidden']
                    },
                },
                required: ['name', 'type', 'value', 'doExport', 'playerAccess', 'showInRoleGrid'],
                additionalProperties: false
            }, {
                type: 'object',
                properties: {
                    name: {
                        type: 'string'
                    },
                    type: {
                        type: 'string',
                        enum: ['number']
                    },
                    value: {
                        type: ['number']
                    },
                    doExport: {
                        type: 'boolean'
                    },
                    showInRoleGrid: {
                        type: 'boolean'
                    },
                    playerAccess: {
                        type: 'string',
                        enum: ['write', 'readonly', 'hidden']
                    },
                },
                required: ['name', 'type', 'value', 'doExport', 'playerAccess', 'showInRoleGrid'],
                additionalProperties: false
            }, {
                type: 'object',
                properties: {
                    name: {
                        type: 'string'
                    },
                    type: {
                        type: 'string',
                        enum: ['checkbox']
                    },
                    value: {
                        type: ['boolean']
                    },
                    doExport: {
                        type: 'boolean'
                    },
                    showInRoleGrid: {
                        type: 'boolean'
                    },
                    playerAccess: {
                        type: 'string',
                        enum: ['write', 'readonly', 'hidden']
                    },
                },
                required: ['name', 'type', 'value', 'doExport', 'playerAccess', 'showInRoleGrid'],
                additionalProperties: false
            }]
        }
    };
}

function getLogSchema() {
    return {
        type: 'array',
        items: {
            type: 'array',
            items: {
                type: 'string',
            },
            minItems: 5,
            maxItems: 5
        }
    };
}

function getSlidersSchema() {
    return {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                },
                top: {
                    type: 'string'
                },
                bottom: {
                    type: 'string'
                },
                value: {
                    type: 'integer',
                    minimum: -10,
                    maximum: 10,
                },
            },
            required: ['name', 'top', 'bottom', 'value'],
            additionalProperties: false
        }
    };
}

function getGearsSchema() {
    return {
        type: 'object',
        properties: {
            nodes: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        x: {
                            type: 'number'
                        },
                        y: {
                            type: 'number'
                        },
                        label: {
                            type: 'string'
                        },
                        name: {
                            type: 'string'
                        },
                        group: {
                            type: 'string'
                        },
                        notes: {
                            type: 'string'
                        },
                        shape: {
                            type: 'string'
                        },
                    },
                    required: ['id', 'x', 'y', 'label', 'name', 'group', 'notes', 'shape'],
                    additionalProperties: false
                },
            },
            edges: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        from: {
                            type: 'string'
                        },
                        to: {
                            type: 'string'
                        },
                        label: {
                            type: 'string'
                        },
                        arrows: {
                            type: 'string'
                        }
                    },
                    required: ['id', 'from', 'to', 'label', 'arrows'],
                    additionalProperties: false
                },
            },
            settings: {
                type: 'object',
                properties: {
                    physicsEnabled: {
                        type: 'boolean'
                    },
                    showNotes: {
                        type: 'boolean'
                    }
                },
                required: ['physicsEnabled', 'showNotes'],
                additionalProperties: false
            },
        },
        required: ['nodes', 'edges', 'settings'],
        additionalProperties: false
    };
}

function getInvestigationBoardSchema(groups, investigationBoard) {
    const ibGroupNames = Object.keys(investigationBoard.groups);
    const relGroupNames = ibGroupNames.map((groupName) => `group-${groupName}`);
    const resourceNames = Object.keys(investigationBoard.resources);
    const relResourceNames = resourceNames.map((resourceName) => `resource-${resourceName}`);

    const relationSetSchema = {
        type: 'object',
        properties: {},
        additionalProperties: false
    };
    relGroupNames.forEach((relGroupName) => {
        relationSetSchema.properties[relGroupName] = {
            type: 'string'
        };
    });
    relResourceNames.forEach((relResourceName) => {
        relationSetSchema.properties[relResourceName] = {
            type: 'string'
        };
    });

    const relationsSchema = {
        type: 'object',
        properties: {},
        additionalProperties: false
    };
    if (relGroupNames.length !== 0) {
        relationsSchema.required = relGroupNames;
    }

    relGroupNames.forEach((relGroupNames2) => {
        relationsSchema.properties[relGroupNames2] = relationSetSchema;
    });

    const resourcesSchema = {
        type: 'object',
        properties: {},
        additionalProperties: false
    };

    resourceNames.forEach((resourceName) => {
        resourcesSchema.properties[resourceName] = {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    enum: [resourceName]
                }
            },
            required: ['name'],
            additionalProperties: false
        };
    });

    const groupsSchema = {
        type: 'object',
        properties: {},
        additionalProperties: false
    };
    const groupNames = Object.keys(groups);
    groupNames.forEach((groupName) => {
        groupsSchema.properties[groupName] = {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    enum: [groupName]
                },
                notes: {
                    type: 'string'
                }
            },
            required: ['name', 'notes'],
            additionalProperties: false
        };
    });
    const schema = {
        type: 'object',
        properties: {
            groups: groupsSchema,
            resources: resourcesSchema,
            relations: relationsSchema
        },
        required: ['groups', 'resources', 'relations'],
        additionalProperties: false
    };
    return schema;
}

function getGroupsSchema(characterProfileSettings, playerProfileSettings) {
    let filterItems = [];
    const staticStringTemplate = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                enum: [] // enum can't be empty, it is necessary to populate it
            },
            type: {
                type: 'string',
                enum: ['string']
            },
            regexString: {
                type: 'string',
                minLength: 0
            }
        },
        required: ['name', 'type', 'regexString'],
        additionalProperties: false
    };

    const assocFunc = R.assocPath(['properties', 'name', 'enum']);
    filterItems.push(assocFunc([Constants.CHAR_NAME], R.clone(staticStringTemplate)));
    filterItems.push(assocFunc([Constants.CHAR_OWNER], R.clone(staticStringTemplate)));
    filterItems.push(assocFunc([Constants.PLAYER_NAME], R.clone(staticStringTemplate)));
    filterItems.push(assocFunc([Constants.PLAYER_OWNER], R.clone(staticStringTemplate)));

    filterItems = filterItems.concat(characterProfileSettings
        .map(makeProfileStructureItemSchema(Constants.CHAR_PREFIX)));
    filterItems = filterItems.concat(playerProfileSettings
        .map(makeProfileStructureItemSchema(Constants.PLAYER_PREFIX)));

    R.keys(R.fromPairs(Constants.summaryStats)).forEach((item) => {
        filterItems.push({
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    enum: [Constants.SUMMARY_PREFIX + item]
                },
                type: {
                    type: 'string',
                    enum: ['number']
                },
                num: {
                    type: 'number'
                },
                condition: {
                    type: 'string',
                    enum: ['greater', 'lesser', 'equal']
                }
            },
            required: ['name', 'type', 'num', 'condition'],
            additionalProperties: false
        });
    });

    const groupProperties = {
        name: {
            type: 'string'
        },
        masterDescription: {
            type: 'string'
        },
        characterDescription: {
            type: 'string'
        },
        filterModel: {
            type: 'array',
            items: {
                oneOf: filterItems
            }
        },
        doExport: {
            type: 'boolean'
        }
    };
    const schema = {
        type: 'object',
        additionalProperties: {
            type: 'object',
            properties: groupProperties,
            required: Object.keys(groupProperties),
            additionalProperties: false
        }
    };
    return schema;
}

makeProfileStructureItemSchema = R.curry((prefix, item) => {
    const data = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                enum: [prefix + item.name]
            },
            type: {
                type: 'string',
                enum: [item.type]
            },
        },
        required: ['name', 'type'],
        additionalProperties: false
    };

    let properties;
    switch (item.type) {
    case 'text':
    case 'string':
        data.properties.regexString = {
            type: 'string',
            minLength: 0
        };
        data.required.push('regexString');
        break;
    case 'number':
        data.properties.num = {
            type: 'number'
        };
        data.properties.condition = {
            type: 'string',
            enum: ['greater', 'lesser', 'equal']
        };
        data.required.push('num');
        data.required.push('condition');
        break;
    case 'checkbox':
        data.properties.selectedOptions = {
            type: 'object',
            properties: {
                false: {},
                true: {}
            },
            additionalProperties: false
        };
        data.required.push('selectedOptions');
        break;
    case 'enum':
        properties = item.value.split(',').reduce((result, item2) => {
            result[item2] = {};
            return result;
        }, {});
        data.properties.selectedOptions = {
            type: 'object',
            properties,
            additionalProperties: false
        };
        data.required.push('selectedOptions');
        break;
    case 'multiEnum':
        data.properties.condition = {
            type: 'string',
            enum: ['every', 'equal', 'some']
        };
        properties = item.value.split(',').reduce((result, item2) => {
            result[item2] = {};
            return result;
        }, {});
        data.properties.selectedOptions = {
            type: 'object',
            properties,
            additionalProperties: false
        };
        data.required.push('selectedOptions');
        data.required.push('condition');
        break;
    default:
        console.log(`Unexpected type ${item.type}`);
    }
    return data;
});

function getProfileSchema(profileSettings) {
    const characterProperties = {
        name: {
            type: 'string'
        }
    };
    let value;
    profileSettings.forEach((item) => {
        switch (item.type) {
        case 'text':
        case 'string':
        case 'multiEnum': // it is hard to check multiEnum with schema. There is second check in consistency checker.
            value = {
                type: 'string'
            };
            break;
        case 'checkbox':
            value = {
                type: 'boolean'
            };
            break;
        case 'number':
            value = {
                type: 'number'
            };
            break;
        case 'enum':
            value = {
                type: 'string',
                enum: item.value.split(',').map(R.trim)
            };
            break;
        default:
            console.log(`Unexpected type ${item.type}`);
        }
        characterProperties[item.name] = value;
    });

    //        console.log(characterProperties);

    const schema = {
        type: 'object',
        additionalProperties: {
            type: 'object',
            properties: characterProperties,
            required: Object.keys(characterProperties),
            additionalProperties: false
        }
    };
    return schema;
}

function getProfileBindings(characters, players) {
    let playerNames = Object.keys(players);
    if (playerNames.length === 0) {
        playerNames = ['123'];
    }

    const names = `^(${R.keys(characters).map(CU.escapeRegExp).join('|')})$`;
    const schema = {
        type: 'object',
        additionalProperties: false,
        patternProperties: {}
    };
    schema.patternProperties[names] = {
        type: 'string',
        enum: playerNames
    };

    return schema;
}

function getStoriesSchema(characters) {
    const charNames = Object.keys(characters);

    const eventCharacter = {
        type: 'object',
        properties: {
            text: {
                type: 'string'
            },
            time: {
                type: 'string'
            },
            ready: {
                type: 'boolean'
            }
        },
        required: ['text', 'time'],
        additionalProperties: false
    };

    const eventSchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            text: {
                type: 'string'
            },
            time: {
                type: 'string'
            },
            characters: {
                type: 'object',
                // depends on story but for simplicity we check charNames only
                properties: charNames.reduce((obj, char) => {
                    obj[char] = eventCharacter;
                    return obj;
                }, {}),
                additionalProperties: false
            }
        },
        required: ['name', 'text', 'time', 'characters'],
        additionalProperties: false
    };

    const storyCharacterSchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                enum: charNames
            },
            inventory: {
                type: 'string'
            },
            activity: {
                type: 'object',
                properties: {
                    active: {
                        type: 'boolean'
                    },
                    follower: {
                        type: 'boolean'
                    },
                    defensive: {
                        type: 'boolean'
                    },
                    passive: {
                        type: 'boolean'
                    },
                },
                additionalProperties: false
            },
        },
        required: ['name', 'inventory', 'activity'],
        additionalProperties: false
    };

    const storySchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            story: {
                type: 'string'
            },
            characters: {
                type: 'object',
                properties: charNames.reduce((obj, char) => {
                    obj[char] = storyCharacterSchema;
                    return obj;
                }, {}),
                additionalProperties: false
            },
            events: {
                type: 'array',
                items: eventSchema
            }
        },
        required: ['name', 'story', 'characters', 'events'],
        additionalProperties: false
    };

    const storiesSchema = {
        type: 'object',
        additionalProperties: storySchema
    };

    return storiesSchema;
}

function getManagementInfoSchema(managementInfo, characters, stories, groups, players) {
    let charNames = Object.keys(characters);
    let storyNames = Object.keys(stories);
    let groupNames = Object.keys(groups);
    let playerNames = Object.keys(players);
    const userNames = Object.keys(managementInfo.UsersInfo);
    // enum can't be empty, ask about it here
    // http://stackoverflow.com/questions/37635675/how-to-validate-empty-array-of-strings-with-ajv
    if (storyNames.length === 0) {
        storyNames = ['123'];
    }
    if (charNames.length === 0) {
        charNames = ['123'];
    }
    if (groupNames.length === 0) {
        groupNames = ['123'];
    }
    if (playerNames.length === 0) {
        playerNames = ['123'];
    }

    const userSchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            stories: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: storyNames
                },
                minItems: 0
            },
            characters: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: charNames
                }
            },
            groups: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: groupNames
                }
            },
            players: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: playerNames
                }
            },
            salt: {
                type: 'string'
            },
            hashedPassword: {
                type: 'string'
            },
        },
        required: ['name', 'stories', 'characters', 'groups', 'players', 'salt', 'hashedPassword'],
        additionalProperties: false
    };
    const playerSchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            salt: {
                type: 'string'
            },
            hashedPassword: {
                type: 'string'
            },
        },
        required: ['name', 'salt', 'hashedPassword'],
        additionalProperties: false
    };
    const playersOptionsSchema = {
        type: 'object',
        properties: {
            allowPlayerCreation: {
                type: 'boolean'
            },
            allowCharacterCreation: {
                type: 'boolean'
            },
        },
        required: ['allowPlayerCreation', 'allowCharacterCreation'],
        additionalProperties: false
    };

    const managementInfoSchema = {
        type: 'object',
        properties: {
            UsersInfo: {
                type: 'object',
                additionalProperties: userSchema
            },
            PlayersInfo: {
                type: 'object',
                additionalProperties: playerSchema
            },
            admin: {
                type: 'string',
                enum: userNames
            },
            editor: {
                type: ['string', 'null'],
                enum: userNames.concat(null)
            },
            adaptationRights: {
                type: 'string',
                enum: Constants.adaptationRightsModes
            },
            WelcomeText: {
                type: 'string',
            },
            PlayersOptions: playersOptionsSchema,
        },
        required: ['UsersInfo', 'PlayersInfo', 'admin', 'editor', 'adaptationRights', 'WelcomeText', 'PlayersOptions'],
        additionalProperties: false
    };

    return managementInfoSchema;
}

function getRelationsSchema(Characters, definitions) {
    let chars = R.keys(Characters);
    const names = `^(${R.keys(Characters).map(CU.escapeRegExp).join('|')})$`;
    if (chars.length === 0) {
        chars = ['123'];
    }

    const schema = {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                origin: {
                    type: 'string'
                },
                starterTextReady: {
                    type: 'boolean'
                },
                enderTextReady: {
                    type: 'boolean'
                },
                essence: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: Constants.relationEssences
                    }
                },
                starter: {
                    type: 'string',
                    enum: chars
                },
                ender: {
                    type: 'string',
                    enum: chars
                },
            },
            required: ['origin', 'starterTextReady', 'enderTextReady', 'essence', 'starter', 'ender'],
            patternProperties: {
                [names]: {
                    type: 'string',
                }
            },
            additionalProperties: false,
            minProperties: 8,
            maxProperties: 8
        }
    };
    return schema;
}
