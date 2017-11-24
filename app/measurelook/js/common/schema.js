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
                title: 'measurelook base',
                description: 'measurelook base schema.',
                type: 'object',
                definitions: {}
            };

            const directMeasuredParamsList = base.measuredParams.filter(param => param.type === 'direct')
                .map(param => param.name);
            const measuredParamsList = base.measuredParams.map(param => param.name);
            const paramList = R.concat(base.changedParams.map(param => param.name), measuredParamsList);
            schema.properties = {
                name: { type: 'string' },
                timestamp: { type: 'string' },
                meta: {},
                constantParams: constSchema(),
                changedParams: changedParamsSchema(),
                measuredParams: measuredParamsSchema(directMeasuredParamsList),
                measures: measuresSchema(paramList),
                version: { type: 'string' },
            };

            schema.required = R.keys(schema.properties);
            schema.additionalProperties = false;

            return schema;
        };

        function constSchema() {
            return {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string'
                        },
                        units: {
                            type: 'string',
                        },
                        value: {
                            type: ['number', 'string']
                        },
                    },
                    required: ['name', 'units', 'value'],
                    additionalProperties: false
                }
            };
        }

        function changedParamsSchema() {
            return {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string'
                        },
                        units: {
                            type: 'string',
                        }
                    },
                    required: ['name', 'units'],
                    additionalProperties: false
                }
            };
        }
        function measuredParamsSchema(directParamsList) {
            return {
                type: 'array',
                items: {
                    oneOf: [{
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string'
                            },
                            units: {
                                type: 'string',
                            },
                            type: {
                                type: 'string',
                                enum: ['direct']
                            },
                        },
                        required: ['name', 'units', 'type'],
                        additionalProperties: false
                    }, {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string'
                            },
                            units: {
                                type: 'string',
                            },
                            type: {
                                type: 'string',
                                enum: ['indirect']
                            },
                            sumOf: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    enum: directParamsList
                                },
                                minItems: 0
                            },
                        },
                        required: ['name', 'units', 'type', 'sumOf'],
                        additionalProperties: false
                    }]
                }
            };
        }

        function measuresSchema(paramList) {
            const staticEls = {
                measureKey: {
                    type: 'string',
                    minLength: 0
                },
                passId: {
                    type: 'number'
                },
                raw: {}
            };

            const dynamicEls = paramList.reduce((acc, el) => {
                acc[el] = {
                    type: 'number'
                };
                return acc;
            }, {});

            return {
                type: 'object',
                additionalProperties: {
                    type: 'object',
                    properties: R.merge(staticEls, dynamicEls),
                    required: R.concat(R.keys(staticEls), R.keys(dynamicEls)),
                    additionalProperties: false
                }
            };
        }
    }

    callback(Schema);
})(api => ((typeof exports === 'undefined') ? api((this.Schema = {}), R, CommonUtils, Constants) : (module.exports = api)));
