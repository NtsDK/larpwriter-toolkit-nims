import * as R from "ramda";

const R = require('ramda');

export const removeFromArrayByIndex = (array, from, to) => {
    const rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push(...rest);
};

export const charOrdAFactoryBase = R.curry((sortDir, greater, prepare) => function cmp(a, b) {
    a = prepare(a);
    b = prepare(b);
    if (R.isNil(a) && R.isNil(b)) return 0;
    if (R.isNil(a)) return 1;
    if (R.isNil(b)) return -1;
    if (greater(a, b)) { return sortDir === 'asc' ? 1 : -1; }
    if (greater(b, a)) { return sortDir === 'asc' ? -1 : 1; }
    return 0;
});

export const charOrdAFactory = charOrdAFactoryBase('asc', (a, b) => a > b);

export const charOrdA = charOrdAFactory(a => a.toLowerCase());

export const eventsByTime = charOrdAFactory(a => new Date(a.time));

export const charOrdAObject = charOrdAFactory(a => a.displayName.toLowerCase());

export const strFormat = R.curry((str, vals) => str.replace(/\{\{|\}\}|\{(\d+)\}/g, (m, n) => {
    if (m === '{{') { return '{'; }
    if (m === '}}') { return '}'; }
    return vals[n];
}));

export const strFormatInsertsCount = str => (str.match(/\{\{|\}\}|\{(\d+)\}/g) || []).length;

// taken from MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
export const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

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

export const sanitizeStr2FileName = (input, replacement) => {
    replacement = replacement || '';
    const sanitized = input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement)
        .replace(windowsTrailingRe, replacement);
    return sanitized.substring(0, 255);
};
