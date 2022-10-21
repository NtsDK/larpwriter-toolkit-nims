import * as R from "ramda";
import { ValidationError } from "./errors";

export const makeValidationError = (err) => {
    err.splice(0, 0, null);
    return new (Function.prototype.bind.apply(ValidationError, err))();
};

// precondition API
export const precondition = R.curry((check, reject, resolve) => {
    const err = check();
    if (err === null) {
        resolve();
    } else {
        reject(makeValidationError(err));
    }
});

export const precondition2 = R.curry((check) => {
    const err = check();
    if (err === null) {
        return Promise.resolve();
    }
    return Promise.reject(makeValidationError(err));
});

export const chainCheck = R.curry(arr => () => arr.reduce((err, item) => {
    if (err) return err;
    return item();
}, null));

export const eitherCheck = R.curry((func1, func2) => () => {
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

export const elementsFromEnum = arrContainsElsCheck('errors-unsupported-types-in-list');
export const entitiesExist = arrContainsElsCheck('errors-entities-are-not-exist');

const arrContainsElCheck = R.curry((msg, el, valueList) => () => (R.contains(el, valueList) ? null : [msg, [el]]));

export const elementFromEnum = arrContainsElCheck('errors-unsupported-type-in-list');
export const entityExists = arrContainsElCheck('errors-entity-is-not-exist');

export const entityIsNotUsed = R.curry((el, valueList) => () => (!R.contains(el, valueList) ? null : ['errors-entity-is-used', [el]]));

export const isString = R.curry(el => () => (R.is(String, el) ? null : ['errors-argument-is-not-a-string', [el]]));

export const isEmptyString = R.curry(el => () => (R.equals('', el) ? null : ['errors-argument-is-not-empty-string', [el]]));

export const isNotEmptyString = R.curry(el => () => (!R.equals('', el) ? null : ['errors-argument-is-empty-string', [el]]));

export const nameIsNotEmpty = R.curry(el => () => (!R.equals('', el) ? null : ['errors-name-is-empty-string', [el]]));

export const nameIsNotEmpty2 = R.curry((el, nameType, entityTypeKey) => () => (!R.equals('', el) ? null : ['errors-name-is-empty-string2', [nameType, entityTypeKey]]));

export const isArray = R.curry(el => () => (R.is(Array, el) ? null : ['errors-argument-is-not-an-array', [el]]));

export const isObject = R.curry(el => () => (R.is(Object, el) ? null : ['errors-argument-is-not-an-object', [el]]));

export const isBoolean = R.curry(el => () => (R.is(Boolean, el) ? null : ['errors-argument-is-not-a-boolean', [el]]));

export const isNumber = R.curry(el => () => (R.is(Number, el) ? null : ['errors-argument-is-not-a-number', [el]]));

export const isNil = R.curry(el => () => (R.isNil(el) ? null : ['errors-argument-is-not-nil', [el]]));

export const nil = R.curry(() => () => null);

export const notEquals = R.curry((el, el2) => () => (!R.equals(el, el2) ? null : ['errors-argument-must-not-be-equal', [el]]));

export const equals = R.curry((el, el2) => () => (R.equals(el, el2) ? null : ['errors-arguments-must-be-equal', [el, el2]]));

export const isInRange = R.curry((el, low, up) => () => (low <= el && el <= up ? null : ['errors-argument-is-not-in-range', [el, low, up]]));

export const isNonNegative = R.curry(el => () => (el >= 0 ? null : ['errors-argument-is-negative', [el]]));

export const createEntityCheck = R.curry((entityName, entityList) => chainCheck([isString(entityName), nameIsNotEmpty(entityName),
    entityIsNotUsed(entityName, entityList)]));

export const createEntityCheck2 = R.curry((entityName, entityList, nameType, entityTypeKey) => chainCheck([isString(entityName),
    nameIsNotEmpty2(entityName, nameType, entityTypeKey),
    entityIsNotUsed(entityName, entityList)]));

export const removeEntityCheck = R.curry((entityName, entityList) => chainCheck([isString(entityName), entityExists(entityName, entityList)]));

export const entityExistsCheck = removeEntityCheck;

export const renameEntityCheck = R.curry((fromName, toName, entityList) => chainCheck([removeEntityCheck(fromName, entityList),
    createEntityCheck(toName, entityList)]));

export const switchEntityCheck = R.curry((entity1, entity2, entityList, entityContainerList) => chainCheck([entityExistsCheck(entity1, entityList),
    entityExistsCheck(entity2, entityList),
    entityExists(entity1, entityContainerList),
    entityIsNotUsed(entity2, entityContainerList)]));

export const patternCheck = R.curry((el, regex) => () => (regex.test(el) ? null : ['errors-argument-doesnt-match-pattern', [el, regex.toString()]]));

export const arrayCheck = R.curry((arr, check) => chainCheck(arr.map(check)));

export const getValueCheck = (type) => {
    switch (type) {
    case 'checkbox':
        return isBoolean;
    case 'number':
        return isNumber;
    default:
        return isString;
    }
};
