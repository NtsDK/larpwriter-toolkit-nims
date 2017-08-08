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
    
    var root = '.shop-profile-tab ';
    var state = {};

    exports.init = function() {
        listen(queryEl(root + '.entity-selector'), "change", onShopSelect);
        listen(queryEl(root + '.corp-name-input'), "change", onShopDataInput('.corp-name-input', 'corporation'));
        listen(queryEl(root + '.seller-login-input'), "change", onShopDataInput('.seller-login-input', 'sellerLogin'));
        listen(queryEl(root + '.seller-password-input'), "change", onShopDataInput('.seller-password-input', 'sellerPassword'));
        listen(queryEl(root + '.check-shop-button'), "click", checkShopCredentials);
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        PermissionInformer.getEntityNamesArray('shop', false, function(err, names){
            if(err) {Utils.handleError(err); return;}
            
            var sel = clearEl(queryEl(root + ".entity-selector"));
            fillSelector(sel, names.map(remapProps4Select));
            
//            applySettings(groupNames, sel);
        });
    };
    
    var onShopSelect = (event)  => {
        var shopName = event.target.selectedOptions[0].value;
        clearEl(queryEl(root + ".check-shop-result"));
        DBMS.getShop(shopName, function(err, shopData){
            if(err) {Utils.handleError(err); return;}
            queryEl(root + '.corp-name-input').value = shopData.corporation;
            queryEl(root + '.seller-login-input').value = shopData.sellerLogin;
            queryEl(root + '.seller-password-input').value = shopData.sellerPassword;
        });
    };
    
    var onShopDataInput = (clazz, type)  => {
        return function(){
            var input = queryEl(root + clazz);
            var value = input.value.trim();
            var shopSelector = queryEl(root + ".entity-selector");
            if(shopSelector.selectedOptions.length === 0){
                Utils.alert(L10n.get('shop', 'shop-is-not-selected'));
                return;
            }
            var shopName = shopSelector.selectedOptions[0].value;
            DBMS.setShopData(shopName, type, value,  Utils.processError(function(){
                input = '';
            }));
        }
    };
    
    var checkShopCredentials = () => {
        var opt = queryEl(root + ".entity-selector").selectedOptions[0];
        if(opt === undefined){
            return;
        }
        var shopName = opt.value;
        DBMS.getShopAPICheck(shopName, function(err, res){
            if(err) {Utils.handleError(err); return;}
            addEls(clearEl(queryEl(root + ".check-shop-result")), [
                addEl(makeEl('span'), makeText(res.statusCode)               ),
                addEl(makeEl('span'), makeText(L10n.get('api-check', String(res.statusCode))) )
            ]);
        });
        
    };
    

})(this['ShopProfile']={});