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
    
    var root = '.shop-passwords-tab ';
    var state = {};

    exports.init = function() {
        listen(queryEl(root + '.show-passwords-button'), 'click', onShowPasswords);
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        clearEl(queryEl(root + '.shop-passwords-table-body'));
    };
    
    var onShowPasswords = () => {
        DBMS.getShopPasswords(function(err, shopPasswords){
            addEls(clearEl(queryEl(root + '.shop-passwords-table-body')), shopPasswords.map(makePassRow));
        });
    };
    
    var makePassRow = (data) => {
        return addEls(makeEl('tr'), [addEl(makeEl('td'), makeText(data.name)), addEl(makeEl('td'), makeText(data.password))]);
    };

})(this['ShopPasswords']={});