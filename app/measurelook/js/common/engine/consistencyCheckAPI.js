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

((callback2) => {
    function consistencyCheckAPI(LocalDBMS, opts) {
        const { R } = opts;
        const { CommonUtils } = opts;
        const validatorLib = opts.Ajv;
        const schemaBuilder = opts.Schema;

        // eslint-disable-next-line func-names
        LocalDBMS.prototype.getConsistencyCheckResult = function (callback) {
            let errors = [];
            const pushError = (str) => {
                errors.push(str);
            };
            
            const validator = validatorLib({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
            
            this.bases.forEach(base => {
                checkMeasures(base, pushError);
                checkParams(base, pushError);
    
                const schema = schemaBuilder.getSchema(base);
                const validate = validator.compile(schema);
                const valid = validate(base);
                if (!valid) {
                    errors = errors.concat(validate.errors);
                }
            });

            callback(null, errors);
        };

        const getErrorProcessor = callback => R.curry(R.compose(callback, CommonUtils.strFormat));
        
        var checkMeasures = function(data, callback){
            var processError = getErrorProcessor(callback);
            R.keys(data.measures).forEach((elt) => {
                if(data.measures[elt].measureKey !== elt){
                    processError("measureKey is inconsistent with measure id: measureKey {0}, measure id {1}", [data.measures[elt].measureKey, elt]);
                }
            });
        };
        
        var checkParams = function(data, callback){
            var processError = getErrorProcessor(callback);
            
            var names = R.flatten([data.constantParams.map(R.prop('name')), data.changedParams.map(R.prop('name')), data.measuredParams.map(R.prop('name'))]);
            
            if(R.uniq(names).length !== names.length){
                var diff = R.toPairs(R.groupBy((name) => name, names)).filter(pair => pair[1].length > 1).map(pair => pair[0]);
                processError("some param names are reused: difference {0}", [diff]);
            }
            
            if(R.difference(names,['measureKey','passId','raw']).length !== names.length){
                processError("measureKey, passId and raw are prohibited param names", []);
            }
        };
    }

    callback2(consistencyCheckAPI);
})(api => (typeof exports === 'undefined' ? (this.consistencyCheckAPI = api) : (module.exports = api)));
