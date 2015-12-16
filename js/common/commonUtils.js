/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

(function(exports) {

	exports.removeFromArrayByIndex = function(array, from, to) {
		"use strict";
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
	};

	exports.charOrdA = function(a, b) {
		"use strict";
		a = a.toLowerCase();
		b = b.toLowerCase();
		if (a > b)
			return 1;
		if (a < b)
			return -1;
		return 0;
	};

	exports.eventsByTime = function(a, b) {
		"use strict";
		a = new Date(a.time);
		b = new Date(b.time);
		if (a > b)
			return 1;
		if (a < b)
			return -1;
		return 0;
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
})(typeof exports === 'undefined' ? this['CommonUtils'] = {} : exports);