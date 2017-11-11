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
    
    var root = '.shop-about-tab ';
    var state = {};
    var l10n = L10n.get('shop');

    exports.init = function() {
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        var shopName = ShopManagement.getCurrentShopName();
        DBMS.getShop(shopName, function(err, shopData){
            if(err) {Utils.handleError(err); return;}
            var body = clearEl(queryEl(root + '.shop-info-table-body'));
            var el1 = addEls(makeEl('tr'), [ addEl(makeEl('td'), addEl(makeEl('span'), makeText(l10n('corporation-name')))),
                                             addEl(makeEl('td'), addEl(makeEl('span'), makeText(shopData.corporation)))])
            var el2 = addEls(makeEl('tr'), [ addEl(makeEl('td'), addEl(makeEl('span'), makeText(l10n('legal-body')))),
                                             addEl(makeEl('td'), addEl(makeEl('span'), makeText(shopData.sellerLogin)))])
            addEls(body, [el1, el2]);
        });
    };

})(this['ShopAbout']={});