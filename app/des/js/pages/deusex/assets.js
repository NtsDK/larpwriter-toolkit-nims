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

    var state = {};
    var root = '.assets-tab ';
    var currentShop = undefined;
    
    exports.init = function () {
        state.views = {};
        var nav = root + ".sub-tab-navigation";
        var content = root + ".sub-tab-content";
        var containers = {
            root: state,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
//        Utils.addView(containers, "shop-editor", ShopEditor,{mainPage:true});
//        Utils.addView(containers, "shop-view", ShopView);
//        Utils.addView(containers, "shop-binding", ShopBinding);
        Utils.addView(containers, "asset-profile", AssetProfile, {mainPage:true});
        Utils.addView(containers, "asset-presence", AssetPresence);
    
        listen(queryEl(root + ".create-entity-button"), "click", createProfile());
        listen(queryEl(root + ".rename-entity-button"), "click", renameProfile());
        listen(queryEl(root + ".remove-entity-button"), "click", removeProfile());
        
        listen(queryEl(root + ".import-implants-button"), "click", importImplants);
        listen(queryEl(root + ".import-pills-button"), "click", importPills);
//        $("#assetSelector").select2().on("change", onShopSelectorChangeDelegate);

        exports.content = queryEl(root);
    };
    
    exports.refresh = function () {
        PermissionInformer.getEntityNamesArray('asset', true, function(err, entityNames){
            if(err) {Utils.handleError(err); return;}
            rebuildInterface(entityNames);
            state.currentView.refresh();
        });
    };
    
    exports.getCurrentShop = () => currentShop;
    
    var onShopSelectorChangeDelegate = (event) =>{
        currentShop = event.target.value;
//        state.currentView.refresh();
//        exports.refresh();
    };
    
    var rebuildInterface = function (names) {
//        if(names.length === 0){
//            currentShop = undefined;
//        } else {
//            if(currentShop !== undefined){
//                if(R.find(R.equals(currentShop), names.map(R.prop('value'))) === undefined){
//                    currentShop = names[0].value;
//                }
//            } else {
//                currentShop = names[0].value;
//            }
//        }
        var data = getSelect2Data(names);
//        
//        clearEl(queryEl( "#assetSelector"));
//        if(currentShop === undefined){
//            $("#assetSelector").select2(data);
//        } else {
//            $("#assetSelector").select2(data).val(currentShop).trigger('change');
////            $("#shopSelector").select2(data).val(currentShop);
//        }
        
        clearEl(queryEl(root + ".rename-entity-select"));
        $(root + ".rename-entity-select").select2(data);
        
        clearEl(queryEl(root + ".remove-entity-select"));
        $(root + ".remove-entity-select").select2(data);
    };
    
    var importImplants = () => {
        DBMS.importImplants(function(err){
            if(err) {Utils.handleError(err); return;}
            exports.refresh();
        });
    };
    
    var importPills = () => {
        DBMS.importPills(function(err){
            if(err) {Utils.handleError(err); return;}
            exports.refresh();
        });
    };
    
    var createProfile = function () {
        return function(){
            var input = queryEl(root + ".create-entity-input");
            var name = input.value.trim();
            
            DBMS.createAsset(name, function(err){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.refresh(function(err){
                    if(err) {Utils.handleError(err); return;}
//                    if(state.currentView.updateSettings){
//                        state.currentView.updateSettings(name);
//                    }
                    input.value = '';
                    exports.refresh();
                });
            });
        }
    };
    
    var renameProfile = function () {
        return function(){
            var toInput = queryEl(root + ".rename-entity-input");
            var fromName = queryEl(root + ".rename-entity-select").value.trim();
            var toName = toInput.value.trim();
        
            DBMS.renameAsset(fromName, toName, function(err){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.refresh(function(err){
                    if(err) {Utils.handleError(err); return;}
                    toInput.value = '';
//                    if(state.currentView.updateSettings){
//                        state.currentView.updateSettings(type, toName);
//                    }
                    exports.refresh();
                });
            });
        }
    };
    
    var removeProfile = function () {
        return function(){
            var name = queryEl(root + ".remove-entity-select").value.trim();
        
            Utils.confirm(strFormat(getL10n("asset-are-you-sure-about-asset-removing"),[name]), () => {
                DBMS.removeAsset(name, function(err){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.refresh(function(err){
                        if(err) {Utils.handleError(err); return;}
                        exports.refresh();
                    });
                });
            });
        }
    };

})(this['Assets']={});