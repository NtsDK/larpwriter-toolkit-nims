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

var ShopManagement = {};

var ShopManagementTmpl = (function(exports, enableShopSelect, shopShopWindow){
    
    var root = '.shop-management-tab ';
    var categoryRoot = root + '.category-management ';
    var localAssetRoot = root + '.local-asset-management ';
    var categoryContentRoot = root + '.category-content-management ';
    var state = {};

    exports.init = function() {
        state.views = {};
        var nav = root + ".sub-tab-navigation";
        var content = root + ".sub-tab-content";
        var containers = {
            root: state,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
        Utils.addView(containers, "category-content-management", CategoryContentManagement, {mainPage:true});
        Utils.addView(containers, "local-asset-profile", LocalAssetProfile);
        Utils.addView(containers, "global-asset-profile", GlobalAssetProfile);
        if(shopShopWindow){
            Utils.addView(containers, "shop-window", ShopWindow);
        }
        
        listen(queryEl(categoryRoot + ".create-entity-button"),"click", createCategory);
        listen(queryEl(categoryRoot + ".rename-entity-button"),"click", renameCategory);
        listen(queryEl(categoryRoot + ".remove-entity-button"),"click", removeCategory);
        
        listen(queryEl(localAssetRoot + ".create-entity-button"),"click", createLocalAsset);
        listen(queryEl(localAssetRoot + ".rename-entity-button"),"click", renameLocalAsset);
        listen(queryEl(localAssetRoot + ".remove-entity-button"),"click", removeLocalAsset);
        
        ShopManagement.getCurrentShopName = () => state.shopName;
        
        if(enableShopSelect){
            $(root + ".shop-select").select2().on("change", buildContentDelegate);
        }
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        if(enableShopSelect){
            clearEl(queryEl(root + ".shop-select"));
            
            PermissionInformer.getEntityNamesArray('shop', true, function(err, entityNames){
                if(err) {Utils.handleError(err); return;}
                
                var data = getSelect2Data(entityNames);
                if(entityNames.length > 0){
                    if(state.shopName != undefined && R.contains(state.shopName, entityNames.map(R.prop('value')))){
                        $(root + ".shop-select").select2(data).val(state.shopName).trigger('change');
                    } else {
                        $(root + ".shop-select").select2(data).val(entityNames[0].value).trigger('change');
                    }
                } else {
                    $(root + ".shop-select").select2(data);
                }
            });
        } else {
            DBMS.getShopName(function(err, shopName){
                if(err) {Utils.handleError(err); return;}
                state.shopName = shopName;
                buildContent(shopName);
            });
        }
    };
    
    var buildContentDelegate = (event) => buildContent(event.target.value);
    
    exports.getCurrentShopName = () => state.shopName;
    
    var buildContent = (shopName) => {
        state.shopName = shopName;
        DBMS.getShop(shopName, function(err, shopData){
            if(err) {Utils.handleError(err); return;}
            
            var data = arr2Select2(R.keys(shopData.categories).sort(CommonUtils.charOrdA));
            clearEl(queryEl(categoryRoot + ".rename-entity-select"));
            $(categoryRoot + ".rename-entity-select").select2(data);
            clearEl(queryEl(categoryRoot + ".remove-entity-select"));
            $(categoryRoot + ".remove-entity-select").select2(data);
            
            data = arr2Select2(R.keys(shopData.localAssets).sort(CommonUtils.charOrdA));
            clearEl(queryEl(localAssetRoot + ".rename-entity-select"));
            $(localAssetRoot + ".rename-entity-select").select2(data);
            clearEl(queryEl(localAssetRoot + ".remove-entity-select"));
            $(localAssetRoot + ".remove-entity-select").select2(data);
            
            state.currentView.refresh();
//            DBMS.getShopIndex(shopName, function(err, index){
//                if(err) {Utils.handleError(err); return;}
//                addEl(clearEl(queryEl(root + ".third-panel")), setAttr(addEl(makeEl('h2'), makeText(index)), 'style', 'text-align: center;'));
//            });
        });
        
    };
    
    var createCategory = function () {
        var input = queryEl(categoryRoot + ".create-entity-input");
        DBMS.createCategory(state.shopName, input.value.trim(), Utils.processError(function(){
            input.value = '';
            exports.refresh();
        }));
    };
    
    var renameCategory = function () {
        var toInput = queryEl(categoryRoot + ".rename-entity-input");
        var fromName = queryEl(categoryRoot + ".rename-entity-select").value.trim();
        var toName = toInput.value.trim();
        DBMS.renameCategory(state.shopName, fromName, toName, function(err){
            if(err) {Utils.handleError(err); return;}
            toInput.value = '';
            exports.refresh();
        });
    };
    
    var removeCategory = function () {
        var name = queryEl(categoryRoot + ".remove-entity-select").value.trim();
        Utils.confirm(strFormat(getL10n('shop-confirm-category-remove'), [name]), () => {
            DBMS.removeCategory(state.shopName, name, Utils.processError(exports.refresh));
        });
    };
    
    var createLocalAsset = function () {
        var input = queryEl(localAssetRoot + ".create-entity-input");
        DBMS.createLocalAsset(state.shopName, input.value.trim(), Utils.processError(function(){
            input.value = '';
            exports.refresh();
        }));
    };
    
    var renameLocalAsset = function () {
        var toInput = queryEl(localAssetRoot + ".rename-entity-input");
        var fromName = queryEl(localAssetRoot + ".rename-entity-select").value.trim();
        var toName = toInput.value.trim();
        DBMS.renameLocalAsset(state.shopName, fromName, toName, function(err){
            if(err) {Utils.handleError(err); return;}
            toInput.value = '';
            exports.refresh();
        });
    };
    
    var removeLocalAsset = function () {
        var name = queryEl(localAssetRoot + ".remove-entity-select").value.trim();
        Utils.confirm(strFormat(getL10n('shop-confirm-local-asset-remove'), [name]), () => {
            DBMS.removeLocalAsset(state.shopName, name, Utils.processError(exports.refresh));
        });
    };

});

ShopManagementTmpl(this['MasterShopManagement']={}, true, true);

ShopManagementTmpl(this['PlayerShopManagement']={}, false, false);

//(this['ShopManagement']={});