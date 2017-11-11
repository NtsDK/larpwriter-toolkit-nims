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

((callback) => {
    function Schema(exports, R, CommonUtils, Constants) {
        exports.getSchema = (base) => {
            const schema = {
                $schema: 'http://json-schema.org/draft-04/schema#',
                title: 'SMTK NIMS base',
                description: 'SMTK NIMS base schema.',
                type: 'object',
                definitions: {}
            };

            const Meta = getMetaSchema();
            const Log = getLogSchema();
            const Charsheet = getCharsheetSchema();

            schema.properties = {
                Meta,
                Version: {
                    type: 'string'
                },
                Charsheet,
                Log,
                Settings: {},
                Misc: {},
            };
            schema.required = ['Meta', 'Version', 'Log', 'Charsheet'];
            schema.additionalProperties = false;

            return schema;
        };

        function getCharsheetSchema() {
            const arr2PointsObj = arr => ({
                type: 'object',
                properties: arr.reduce((acc, el) => {
                    acc[el] = {
                        type: 'number',
                        minimum: 0,
                        maximum: exports.maxPoints,
                    };
                    return acc;
                }, {}),
                required: arr,
                additionalProperties: false
            });

            return {
                type: 'object',
                properties: {
                    profile: {
                        type: 'object',
                        properties: Constants.profileItemList.reduce((acc, el) => {
                            acc[el] = { type: 'string' };
                            return acc;
                        }, {}),
                        required: Constants.profileItemList,
                        additionalProperties: false
                    },
                    attributes: arr2PointsObj(Constants.attributeList),
                    abilities: arr2PointsObj(Constants.abilityList),
                    disciplines: {
                        type: 'object',
                        additionalProperties: {
                            type: 'number',
                            minimum: 0,
                            maximum: Constants.maxPoints,
                        }
                    },
                    backgrounds: {
                        type: 'object',
                        additionalProperties: {
                            type: 'number',
                            minimum: 0,
                            maximum: Constants.maxPoints,
                        }
                    },
                    virtues: arr2PointsObj(Constants.virtues),
                    merits: {
                        type: 'object',
                        additionalProperties: {
                            type: 'boolean',
                            enum: [true],
                        }
                    },
                    flaws: {
                        type: 'object',
                        additionalProperties: {
                            type: 'boolean',
                            enum: [true],
                        }
                    },
                    state: {
                        type: 'object',
                        properties: {
                            humanity: {
                                type: 'number',
                                minimum: 0,
                                maximum: Constants.extrasMaxPoints,
                            },
                            willpower: {
                                type: 'number',
                                minimum: 0,
                                maximum: Constants.extrasMaxPoints,
                            },
                            willpower2: {
                                type: 'number',
                                minimum: 0,
                                maximum: Constants.extrasMaxPoints,
                            },
                            bloodpool: {
                                type: 'number',
                                minimum: 0,
                                maximum: Constants.bloodpoolMax,
                            },
                            health: {
                                type: 'object',
                                properties: Constants.healthList.reduce((acc, el) => {
                                    acc[el] = {
                                        type: 'number',
                                        minimum: 0,
                                        maximum: 2,
                                    };
                                    return acc;
                                }, {}),
                                required: Constants.healthList,
                                additionalProperties: false
                            }
                        },
                        required: ['humanity', 'willpower', 'willpower2',
                            'bloodpool', 'health'],
                        additionalProperties: false
                    },
                    notes: {
                        type: 'string',
                    },
                },
                required: ['profile', 'attributes', 'abilities',
                    'disciplines', 'backgrounds', 'virtues', 'merits',
                    'flaws', 'state', 'notes'],
                additionalProperties: false
            };
        }

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

        function getLogSchema() {
            return {
                type: 'array',
                items: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    minItems: 4,
                    maxItems: 4
                }
            };
        }
    }

    callback(Schema);
})(api => ((typeof exports === 'undefined') ? api((this.Schema = {}), R, CommonUtils, Constants) : (module.exports = api)));
