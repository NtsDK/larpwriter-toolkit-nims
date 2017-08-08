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
    var root = '.shops-tab2 ';
    var currentShop = undefined;
    
    exports.init = function () {
        listen(queryEl(root + ".create-user-button"),"click", createShop);
        listen(queryEl(root + ".change-password-button"),"click", changeShopPassword);
        listen(queryEl(root + ".remove-user-button"),"click", removeShop);
        state.views = {};
        var nav = root + ".sub-tab-navigation";
        var content = root + ".sub-tab-content";
        var containers = {
            root: state,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
        Utils.addView(containers, "shop-profile", ShopProfile,{mainPage:true});
        Utils.addView(containers, "shop-passwords", ShopPasswords);
//        Utils.addView(containers, "shop-view", ShopView);
//        Utils.addView(containers, "shop-binding", ShopBinding);
//    
//        listen(queryEl(root + ".create-entity-button"), "click", createProfile());
//        listen(queryEl(root + ".rename-entity-button"), "click", renameProfile());
//        listen(queryEl(root + ".remove-entity-button"), "click", removeProfile());
//        
//        $("#shopSelector").select2().on("change", onShopSelectorChangeDelegate);

        exports.content = queryEl(root);
    };
    
    exports.refresh = function () {
        PermissionInformer.getEntityNamesArray('shop', true, function(err, entityNames){
            if(err) {Utils.handleError(err); return;}
            rebuildInterface(entityNames);
            state.currentView.refresh();
        });
    };
    
    var rebuildInterface = function (names) {
        var data = getSelect2Data(names);
        
        clearEl(queryEl(root + ".change-password-user-select"));
        $(root + ".change-password-user-select").select2(data);
        
        clearEl(queryEl(root + ".remove-user-select"));
        $(root + ".remove-user-select").select2(data);
    };
    
    var createShop = function () {
        var userNameInput = queryEl(root + ".create-user-name-input");
        var userPasswordInput = queryEl(root + ".create-user-password-input");
        DBMS.createShop(userNameInput.value.trim(), userPasswordInput.value, Utils.processError(function(){
            userNameInput.value = '';
            userPasswordInput.value = '';
            exports.refresh();
        }));
    };
    
    
    var changeShopPassword = function () {
        var userName = queryEl(root + ".change-password-user-select").value.trim();
        var passwordInput = queryEl(root + ".change-password-password-input");
        DBMS.changeShopPassword(userName, passwordInput.value, Utils.processError(function(){
            queryEl(root + ".change-password-password-input").value = '';
            exports.refresh();
        }));
    };
    
    var removeShop = function () {
        var name = queryEl(root + ".remove-user-select").value.trim();
        Utils.confirm(strFormat(getL10n('shop-confirm-shop-remove'), [name]), () => {
            DBMS.removeShop(name, Utils.processError(exports.refresh));
        });
    };
    
//    exports.getCurrentShop = () => currentShop;
    
//    var onShopSelectorChangeDelegate = (event) =>{
//        currentShop = event.target.value;
//        state.currentView.refresh();
////        exports.refresh();
//    };
    

//    
//    var createProfile = function () {
//        return function(){
//            var input = queryEl(root + ".create-entity-input");
//            var name = input.value.trim();
//            
//            DBMS.createShop(name, function(err){
//                if(err) {Utils.handleError(err); return;}
//                PermissionInformer.refresh(function(err){
//                    if(err) {Utils.handleError(err); return;}
////                    if(state.currentView.updateSettings){
////                        state.currentView.updateSettings(name);
////                    }
//                    input.value = '';
//                    exports.refresh();
//                });
//            });
//        }
//    };
//    
//    var renameProfile = function () {
//        return function(){
//            var toInput = queryEl(root + ".rename-entity-input");
//            var fromName = queryEl(root + ".rename-entity-select").value.trim();
//            var toName = toInput.value.trim();
//        
//            DBMS.renameShop(fromName, toName, function(err){
//                if(err) {Utils.handleError(err); return;}
//                PermissionInformer.refresh(function(err){
//                    if(err) {Utils.handleError(err); return;}
//                    toInput.value = '';
////                    if(state.currentView.updateSettings){
////                        state.currentView.updateSettings(type, toName);
////                    }
//                    exports.refresh();
//                });
//            });
//        }
//    };
//    
//    var removeProfile = function () {
//        return function(){
//            var name = queryEl(root + ".remove-entity-select").value.trim();
//        
//            Utils.confirm(strFormat(getL10n("profiles-are-you-sure-about-character-removing"),[name]), () => {
//                DBMS.removeShop(name, function(err){
//                    if(err) {Utils.handleError(err); return;}
//                    PermissionInformer.refresh(function(err){
//                        if(err) {Utils.handleError(err); return;}
//                        exports.refresh();
//                    });
//                });
//            });
//        }
//    };

})(this['Shops2']={});