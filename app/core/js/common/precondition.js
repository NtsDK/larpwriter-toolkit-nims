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
    function Precondition(exports, R, Errors) {
        exports.makeValidationError = function (err) {
            err.splice(0, 0, null);
            return new (Function.prototype.bind.apply(Errors.ValidationError, err))();
        };

        // precondition API
        exports.precondition = R.curry((check, reject, resolve) => {
            const err = check();
            if (err === null) {
                resolve();
            } else {
                reject(exports.makeValidationError(err));
            }
        });

        exports.chainCheck = R.curry(arr => () => arr.reduce((err, item) => {
            if (err) return err;
            return item();
        }, null));

        exports.eitherCheck = R.curry((func1, func2) => () => {
            const res1 = func1();
            if (res1 === null) {
                return null;
            }
            const res2 = func2();
            if (res2 === null) {
                return null;
            }
            return res1;
        });

        // primitive precondition checks
        const arrContainsElsCheck = R.curry((msg, els, valueList) => () => {
            const diff = R.difference(els, valueList);
            return diff.length === 0 ? null : [msg, [JSON.stringify(diff)]];
        });

        exports.elementsFromEnum = arrContainsElsCheck('errors-unsupported-types-in-list');
        exports.entitiesExist = arrContainsElsCheck('errors-entities-are-not-exist');

        const arrContainsElCheck = R.curry((msg, el, valueList) => () => (R.contains(el, valueList) ? null : [msg, [el]]));

        exports.elementFromEnum = arrContainsElCheck('errors-unsupported-type-in-list');
        exports.entityExists = arrContainsElCheck('errors-entity-is-not-exist');

        exports.entityIsNotUsed = R.curry((el, valueList) => () => (!R.contains(el, valueList) ? null : ['errors-entity-is-used', [el]]));

        exports.isString = R.curry(el => () => (R.is(String, el) ? null : ['errors-argument-is-not-a-string', [el]]));

        exports.isEmptyString = R.curry(el => () => (R.equals('', el) ? null : ['errors-argument-is-not-empty-string', [el]]));

        exports.isNotEmptyString = R.curry(el => () => (!R.equals('', el) ? null : ['errors-argument-is-empty-string', [el]]));

        exports.nameIsNotEmpty = R.curry(el => () => (!R.equals('', el) ? null : ['errors-name-is-empty-string', [el]]));

        exports.isArray = R.curry(el => () => (R.is(Array, el) ? null : ['errors-argument-is-not-an-array', [el]]));

        exports.isObject = R.curry(el => () => (R.is(Object, el) ? null : ['errors-argument-is-not-an-object', [el]]));

        exports.isBoolean = R.curry(el => () => (R.is(Boolean, el) ? null : ['errors-argument-is-not-a-boolean', [el]]));

        exports.isNumber = R.curry(el => () => (R.is(Number, el) ? null : ['errors-argument-is-not-a-number', [el]]));

        exports.isNil = R.curry(el => () => (R.isNil(el) ? null : ['errors-argument-is-not-nil', [el]]));

        exports.nil = R.curry(() => () => null);

        exports.notEquals = R.curry((el, el2) => () => (!R.equals(el, el2) ? null : ['errors-argument-must-not-be-equal', [el]]));

        exports.equals = R.curry((el, el2) => () => (R.equals(el, el2) ? null : ['errors-arguments-must-be-equal', [el, el2]]));

        exports.isInRange = R.curry((el, low, up) => () => (low <= el && el <= up ? null : ['errors-argument-is-not-in-range', [el, low, up]]));

        exports.isNonNegative = R.curry(el => () => (el >= 0 ? null : ['errors-argument-is-negative', [el]]));

        exports.createEntityCheck = R.curry((entityName, entityList) => exports.chainCheck([exports.isString(entityName), exports.nameIsNotEmpty(entityName), exports.entityIsNotUsed(entityName, entityList)]));

        exports.entityExistsCheck = exports.removeEntityCheck = R.curry((entityName, entityList) => exports.chainCheck([exports.isString(entityName), exports.entityExists(entityName, entityList)]));

        exports.renameEntityCheck = R.curry((fromName, toName, entityList) => exports.chainCheck([exports.removeEntityCheck(fromName, entityList), exports.createEntityCheck(toName, entityList)]));

        exports.switchEntityCheck = R.curry((entity1, entity2, entityList, entityContainerList) => exports.chainCheck([exports.entityExistsCheck(entity1, entityList),
            exports.entityExistsCheck(entity2, entityList),
            exports.entityExists(entity1, entityContainerList),
            exports.entityIsNotUsed(entity2, entityContainerList)]));

        exports.patternCheck = R.curry((el, regex) => () => (regex.test(el) ? null : ['errors-argument-doesnt-match-pattern', [el, regex.toString()]]));

        exports.arrayCheck = R.curry((arr, check) => exports.chainCheck(arr.map(check)));

        exports.getValueCheck = function (type) {
            switch (type) {
            case 'checkbox':
                return exports.isBoolean;
            case 'number':
                return exports.isNumber;
            }
            return exports.isString;
        };
    }

    callback(Precondition);
}((api) => {
    typeof exports === 'undefined' ? api(this.Precondition = {}, R, Errors) : module.exports = api;
}));
