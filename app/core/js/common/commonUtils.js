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

"use strict";

(function(callback){
        
    function CommonUtils(exports, R) {
    
        exports.startsWith = function(str1, str2){
            return str1.substring(0, str2.length) === str2;
        };
    
        exports.removeFromArrayByIndex = function(array, from, to) {
            "use strict";
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        };
        
        exports.charOrdAFactoryBase = R.curry(function(sortDir, prepare){
            return function(a, b) {
                a = prepare(a);
                b = prepare(b);
                if(R.isNil(a) && R.isNil(b)) return 0;
                if(R.isNil(a)) return 1;
                if(R.isNil(b)) return -1;
                if (a > b)
                    return sortDir === "asc" ? 1 : -1;
                if (a < b)
                    return sortDir === "asc" ? -1 : 1;
                return 0;
            };
        });
        
        exports.charOrdAFactory = exports.charOrdAFactoryBase('asc');
        
        exports.charOrdA = exports.charOrdAFactory(function(a){return a.toLowerCase();});
        
        exports.eventsByTime = exports.charOrdAFactory(a => new Date(a.time));
    
        exports.strFormat = function(str, vals){
            "use strict";
            return str.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
                if (m == "{{") { return "{"; }
                if (m == "}}") { return "}"; }
                return vals[n];
            });
        };
        
        exports.consoleLog = function(str){
            "use strict";
            console.log(str);
        };
        
        exports.clone = function(o) {
            "use strict";
            if (!o || 'object' !== typeof o) {
                return o;
            }
            var c = 'function' === typeof o.pop ? [] : {};
            var p, v;
            for (p in o) {
                if (o.hasOwnProperty(p)) {
                    v = o[p];
                    if (v && 'object' === typeof v) {
                        c[p] = exports.clone(v);
                    } else {
                        c[p] = v;
                    }
                }
            }
            return c;
        };
        
        var preg_quote = function (str, delimiter) {
            "use strict";
            // http://kevin.vanzonneveld.net
            // + original by: booeyOH
            // + improved by: Ates Goral (http://magnetiq.com)
            // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // + bugfixed by: Onno Marsman
            // + improved by: Brett Zamir (http://brett-zamir.me)
            // * example 1: preg_quote("$40");
            // * returns 1: '\$40'
            // * example 2: preg_quote("*RRRING* Hello?");
            // * returns 2: '\*RRRING\* Hello\?'
            // * example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
            // * returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
            return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\'
                    + (delimiter || '') + '-]', 'g'), '\\$&');
        };
        
        exports.globStringToRegex = function (str) {
            "use strict";
            return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(
                    /\\\?/g, '.'), 'g');
        };
        
        // taken from MDN https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
        exports.escapeRegExp = function(string){
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        };
        
        exports.arr2map = function(array, key){
            return array.reduce(function(a, b) {
                a[b[key]] = b;
                return a;
            }, {});
        };
        
    }
    
    callback(CommonUtils);

})(function(api){
    typeof exports === 'undefined'? api(this['CommonUtils'] = {}, R) : module.exports = api;
}.bind(this));