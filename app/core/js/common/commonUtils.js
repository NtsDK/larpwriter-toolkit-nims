// const R = require("ramda");
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

// ((callback) => {
//     function CommonUtils(exports, R) {
        exports.startsWith = (str1, str2) => str1.substring(0, str2.length) === str2;

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
        //        exports.charOrdAFactoryBase = R.curry((sortDir, prepare) => function cmp(a, b) {
        //            a = prepare(a);
        //            b = prepare(b);
        //            if (R.isNil(a) && R.isNil(b)) return 0;
        //            if (R.isNil(a)) return 1;
        //            if (R.isNil(b)) return -1;
        //            if (a > b) { return sortDir === 'asc' ? 1 : -1; }
        //            if (a < b) { return sortDir === 'asc' ? -1 : 1; }
        //            return 0;
        //        });

        exports.charOrdAFactory = exports.charOrdAFactoryBase('asc', (a, b) => a > b);

        exports.charOrdA = exports.charOrdAFactory(a => a.toLowerCase());

        exports.eventsByTime = exports.charOrdAFactory(a => new Date(a.time));

        exports.strFormat = (str, vals) => str.replace(/\{\{|\}\}|\{(\d+)\}/g, (m, n) => {
            if (m === '{{') { return '{'; }
            if (m === '}}') { return '}'; }
            return vals[n];
        });
        
        exports.strFormatInsertsCount = str => (str.match(/\{\{|\}\}|\{(\d+)\}/g) || []).length;

        exports.consoleLog = str => console.log(str);
        exports.consoleErr = str => console.error(str);

        exports.clone = R.clone;

        const pregQuote = (str, delimiter) =>
            // http://kevin.vanzonneveld.net
            // + original by: booeyOH
            // + improved by: Ates Goral (http://magnetiq.com)
            // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // + bugfixed by: Onno Marsman
            // + improved by: Brett Zamir (http://brett-zamir.me)
            // * example 1: pregQuote("$40");
            // * returns 1: '\$40'
            // * example 2: pregQuote("*RRRING* Hello?");
            // * returns 2: '\*RRRING\* Hello\?'
            // * example 3: pregQuote("\\.+*?[^]$(){}=!<>|:");
            // * returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
            (`${str}`).replace(new RegExp(`[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\${
                delimiter || ''}-]`, 'g'), '\\$&');

        exports.globStringToRegex = str => new RegExp(pregQuote(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.'), 'g');

        // taken from MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        exports.escapeRegExp = string =>
            string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

        exports.arr2map = (array, key) => array.reduce((a, b) => {
            a[b[key]] = b;
            return a;
        }, {});

        exports.colorPattern = /^#[0-9A-Fa-f]{6}$/;

        exports.isColor = str => exports.colorPattern.test(str);
        
        const illegalRe = /[\/\?<>\\:\*\|":]/g;
        const controlRe = /[\x00-\x1f\x80-\x9f]/g;
        const reservedRe = /^\.+$/;
        const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
        const windowsTrailingRe = /[\. ]+$/;

        exports.sanitizeStr2FileName = (input, replacement) => {
            replacement = replacement || '';
            var sanitized = input
                .replace(illegalRe, replacement)
                .replace(controlRe, replacement)
                .replace(reservedRe, replacement)
                .replace(windowsReservedRe, replacement)
                .replace(windowsTrailingRe, replacement);
            return sanitized.substring(0, 255);
        }
    // }

//     callback(CommonUtils);
// // })(api => ((typeof exports === 'undefined') ? api((window.CommonUtils = {}), R) : (module.exports = api)));
// })(api => window.CommonUtils = api);
