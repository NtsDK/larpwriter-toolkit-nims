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

/*global
 Utils, DBMS
 */

"use strict";

(function(exports){
    
    var root = '.api-check-tab ';
    var state = {};
    var l10n = L10n.get('api-check');

    exports.init = function() {
        listen(queryEl(root + '.shop-check-button'), 'click', checkAPI('.shop-check-area', 'getShopsAPICheck'));
        listen(queryEl(root + '.implant-check-button'), 'click', checkAPI('.implant-check-area', 'getImplantsAPICheck'));
        listen(queryEl(root + '.pills-check-button'), 'click', checkAPI('.pills-check-area', 'getPillsAPICheck'));
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
    };
    
    var checkAPI = R.curry((clazz,dbCall) => {
        return () => {
            clearEl(queryEl(root + clazz + ' .container'));
            DBMS[dbCall](function(err, arr){
                if(err) {Utils.handleError(err); return;}
                arr.sort(CommonUtils.charOrdAFactory(R.prop('name')))
                console.log(arr);
                var container = clearEl(queryEl(root + clazz + ' .container'));
                addEls(container, arr.map(makeStr));
            });
        }
    });
    
    var makeStr = (el) => {
        return addEls(setClassByCondition(makeEl('tr'), 'red-row', !(200 <= el.statusCode && el.statusCode < 300)), [
            addEl(makeEl('td'), makeText(el.name)                     ),
            addEl(makeEl('td'), makeText(el.statusCode)               ),
            addEl(makeEl('td'), makeText(l10n(String(el.statusCode))) )
        ]);
    };

})(this['ApiCheck']={});