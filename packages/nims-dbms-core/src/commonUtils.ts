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

import * as R from 'ramda';

/** sdsfsdf
 * @ param {any[]} array
 * @ param {number} from
 * @ param {number} to
 * @ return {any[]}
 */

export function removeFromArrayByIndex<T extends any[]>(array: T, from: number, to?: number): number {
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

/**
 * @param {any} a
 * @param {any} b
 * @return {0|1|-1}
 */
export const charOrdA = charOrdAFactory((a) => a.toLowerCase());
// exports.charOrdA = charOrdA;

export const sortStrIgnoreCase = R.sort(charOrdA);

export const eventsByTime = charOrdAFactory((a) => new Date(a.time));

export const charOrdAObject = charOrdAFactory((a) => a.displayName.toLowerCase());

export const strFormat = R.curry((str, vals) => str.replace(/\{\{|\}\}|\{(\d+)\}/g, (m, n) => {
  if (m === '{{') { return '{'; }
  if (m === '}}') { return '}'; }
  return vals[n];
}));

export const strFormatInsertsCount = (str) => (str.match(/\{\{|\}\}|\{(\d+)\}/g) || []).length;

// taken from MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
export const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

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

/**
 * @param {string} input
 * @param {string} replacement
 * @return {string}
 */
export const sanitizeStr2FileName = (input, replacement = '') => {
  const sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return sanitized.substring(0, 255);
};
