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

const R = require('ramda');

exports.removeFromArrayByIndex = (array, from, to) => {
    const rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push(...rest);
};

exports.charOrdAFactoryBase = R.curry((sortDir, greater, prepare) => function cmp(a, b) {
    a = prepare(a);
    b = prepare(b);
    if (R.isNil(a) && R.isNil(b)) return 0;
    if (R.isNil(a)) return 1;
    if (R.isNil(b)) return -1;
    if (greater(a, b)) { return sortDir === 'asc' ? 1 : -1; }
    if (greater(b, a)) { return sortDir === 'asc' ? -1 : 1; }
    return 0;
});

exports.charOrdAFactory = exports.charOrdAFactoryBase('asc', (a, b) => a > b);

exports.charOrdA = exports.charOrdAFactory(a => a.toLowerCase());

exports.eventsByTime = exports.charOrdAFactory(a => new Date(a.time));

exports.charOrdAObject = exports.charOrdAFactory(a => a.displayName.toLowerCase());

exports.strFormat = R.curry((str, vals) => str.replace(/\{\{|\}\}|\{(\d+)\}/g, (m, n) => {
    if (m === '{{') { return '{'; }
    if (m === '}}') { return '}'; }
    return vals[n];
}));

exports.strFormatInsertsCount = str => (str.match(/\{\{|\}\}|\{(\d+)\}/g) || []).length;

// taken from MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
exports.escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

// exports.colorPattern = /^#[0-9A-Fa-f]{6}$/;

// exports.isColor = str => exports.colorPattern.test(str);

// eslint-disable-next-line no-useless-escape
const illegalRe = /[\/\?<>\\:\*\|":]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
// eslint-disable-next-line no-useless-escape
const windowsTrailingRe = /[\. ]+$/;

exports.sanitizeStr2FileName = (input, replacement) => {
    replacement = replacement || '';
    const sanitized = input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement)
        .replace(windowsTrailingRe, replacement);
    return sanitized.substring(0, 255);
};
