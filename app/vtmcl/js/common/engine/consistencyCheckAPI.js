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

(function (callback) {
    function consistencyCheckAPI(LocalDBMS, opts) {
        const R = opts.R;
        const CommonUtils = opts.CommonUtils;
        const validatorLib = opts.Ajv;
        const schemaBuilder = opts.Schema;

        LocalDBMS.prototype.getConsistencyCheckResult = function (callback) {
            let errors = [];
            const pushError = function (str) {
                errors.push(str);
            };

            const schema = schemaBuilder.getSchema(this.database);
            const validator = validatorLib({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
            const validate = validator.compile(schema);
            const valid = validate(this.database);
            if (!valid) {
                errors = errors.concat(validate.errors);
            }

            callback(null, errors);
        };

        const getErrorProcessor = function (callback) {
            return R.curry(R.compose(callback, CommonUtils.strFormat));
        };
    }

    callback(consistencyCheckAPI);
}((api) => {
    typeof exports === 'undefined' ? this.consistencyCheckAPI = api : module.exports = api;
}));
