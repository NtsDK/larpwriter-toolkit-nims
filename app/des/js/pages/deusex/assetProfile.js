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

var AssetProfileTmpl = (function(exports, root, assetProfileStructure, isEditable, getAssetNames, updateAssetField, getAsset){
    
    var state = {};
    var l10n = L10n.get('asset');

    exports.init = function() {
        listen(queryEl(root +".entity-selector"), "change", showProfileInfoDelegate);
        
        var tbody = clearEl(queryEl(root + ".entity-profile"));
        
        state.inputItems = {};
        
        Constants[assetProfileStructure].forEach(function (profileSettings) {
            profileSettings.displayName = l10n(profileSettings.name);
            addEl(tbody, makeInput(profileSettings));
        });
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        getAssetNames(function(err, names){
            if(err) {Utils.handleError(err); return;}
            var sel = clearEl(queryEl(root + ".entity-selector"));
            fillSelector(sel, names.map(remapProps4Select));
        });
    };
    
    var makeInput = function (profileItemConfig) {
        var span = setAttr(makeEl('span'), "l10n-id", "asset-" + profileItemConfig.name);
        var tr = addEl(makeEl("tr"), addEl(makeEl('td'), addEl(span, makeText(profileItemConfig.displayName))))
        var input;
        switch (profileItemConfig.type) {
        case "text":
            input = makeEl("textarea");
            addClass(input, "profileTextInput");
            addClass(input,'form-control');
            break;
        case "string":
            input = makeEl("input");
            addClass(input, "profileStringInput");
            addClass(input,'form-control');
            break;
        case "number":
            input = makeEl("input");
            input.type = "number";
            addClass(input,'form-control');
            break;
        case "checkbox":
            input = makeEl("input");
            input.type = "checkbox";
            break;
        default:
            throw new Error('Unexpected type ' + profileItemConfig.type);
        }
        input.selfName = profileItemConfig.name;
        
        if(!isEditable){
            setAttr(input, 'disabled', 'true');
        }
//        addClass(input,"isGroupEditable");
        state.inputItems[profileItemConfig.name] = input;
        
        listen(input, "change", updateFieldValue(profileItemConfig.type));
    
        return addEl(tr, addEl(makeEl('td'), input));
    };
    
    var updateFieldValue = function(type){
        return function(event){
            var fieldName = event.target.selfName;
            var assetName = state.name;
            
            var value;
            switch(type){
            case "text":
            case "string":
                value = event.target.value;
                break;
            case "number":
                if (isNaN(event.target.value)) {
                    Utils.alert(getL10n("profiles-not-a-number"));
                    event.target.value = event.target.oldValue;
                    return;
                }
                value = Number(event.target.value);
                break;
            case "checkbox":
                value = event.target.checked;
                break;
            default:
                throw new Error('Unexpected type ' + type);
            }
            updateAssetField(assetName, fieldName, value, Utils.processError());
        }
    };
    
    var showProfileInfoDelegate = function (event) {
        var name = event.target.value.trim();
        getAsset(name, showProfileInfoCallback);
    };
    
    var showProfileInfoCallback = function (err, asset) {
        if(err) {Utils.handleError(err); return;}
        var name = asset.name;
        state.name = name;
        var inputItems = state.inputItems;
        Object.keys(inputItems).forEach(function (inputName) {
            if (inputItems[inputName].type === "checkbox") {
                inputItems[inputName].checked = asset[inputName];
            } else {
                inputItems[inputName].value = asset[inputName];
            }
            inputItems[inputName].oldValue = asset[inputName];
        });
    };
    
});

AssetProfileTmpl(this['AssetProfile']={}, '.asset-profile-tab ', 'assetProfileStructure', true, (callback) => {
    PermissionInformer.getEntityNamesArray('asset', false, callback);
}, (assetName, fieldName, value, callback) => {
    DBMS.updateAssetField(assetName, fieldName, value, callback);
}, (name, callback) => {
    DBMS.getAsset(name, callback);
});

AssetProfileTmpl(this['GlobalAssetProfile']={}, '.global-asset-profile-tab ', 'assetProfileStructure', false, (callback) => {
    var shopName = ShopManagement.getCurrentShopName();
    DBMS.getShop(shopName, function(err, shopData){
        if(err) {callback(err); return;}
        var assets = R.keys(shopData.assets).sort(CommonUtils.charOrdA).map(name => {
            return {
                displayName: name,
                value: name
            }
        });
        callback(null,assets);
    });
}, (assetName, fieldName, value, callback) => {
    Utils.alert(getL10n('errors-unsupported-operation'));
}, (name, callback) => {
    DBMS.getAsset(name, callback);
});

AssetProfileTmpl(this['LocalAssetProfile']={}, '.local-asset-profile-tab ', 'localAssetProfileStructure', true, (callback) => {
    var shopName = ShopManagement.getCurrentShopName();
    DBMS.getShop(shopName, function(err, shopData){
        if(err) {callback(err); return;}
        var localAssets = R.keys(shopData.localAssets).sort(CommonUtils.charOrdA).map(name => {
            return {
                displayName: name,
                value: name
            }
        });
        callback(null,localAssets);
    });
}, (assetName, fieldName, value, callback) => {
    DBMS.updateLocalAssetField(ShopManagement.getCurrentShopName(), assetName, fieldName, value, callback);
}, (name, callback) => {
    DBMS.getLocalAsset(ShopManagement.getCurrentShopName(), name, (err, asset) => {
        if(err) {callback(err); return;}
        asset.name = name;
        callback(null, asset);
    });
});