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
    
    var root = '.asset-presence-tab ';
    var assetSelectContainer = root +'.asset-select-container ';
    var shopSelectContainer = root +'.shop-select-container ';
    var state = {};

    exports.init = function() {
        listen(queryEl(root + '.show-asset-select'), "change", UI.showSelectedEls("-row-dependent"));
        listen(queryEl(assetSelectContainer + '.select-all-button'), "click", makeSelectAllFun(root + '.show-asset-select', UI.showSelectedEls("-row-dependent"), true));
        listen(queryEl(assetSelectContainer + '.deselect-all-button'), "click", makeSelectAllFun(root + '.show-asset-select', UI.showSelectedEls("-row-dependent"), false));
        
        listen(queryEl(root + '.show-shop-select'), "change", UI.showSelectedEls("-col-dependent"));
        listen(queryEl(shopSelectContainer + '.select-all-button'), "click", makeSelectAllFun(root + '.show-shop-select', UI.showSelectedEls("-col-dependent"), true));
        listen(queryEl(shopSelectContainer + '.deselect-all-button'), "click", makeSelectAllFun(root + '.show-shop-select', UI.showSelectedEls("-col-dependent"), false));
        
        exports.content = queryEl(root);
    };
    
    var makeSelectAllFun = (selector, callback, value) => {
        return () => {
            nl2array(queryEl(selector).options).filter(opt => !hasClass(opt,'hidden')).forEach( option => option.selected = value);
            callback({target:queryEl(selector)});
        };
    };
    
    exports.refresh = function() {
        PermissionInformer.getEntityNamesArray('asset', true, function(err, assetNames){
            if(err) {Utils.handleError(err); return;}
            DBMS.getShopAssets(function(err, shopAssets){
                if(err) {Utils.handleError(err); return;}
            
            
//                fillSelector(clearEl(queryEl(root + ".show-asset-select")), assetNames.map(remapProps4Select));
                fillSelector(clearEl(queryEl(root + ".show-asset-select")), assetNames.map(asset => R.zipObj(['name','selected'], [asset.value, true])));
                fillSelector(clearEl(queryEl(root + ".show-shop-select")), shopAssets.map(shop => R.zipObj(['name','selected'], [shop.name, true])));
                
                setAttr(queryEl(root + ".show-asset-select"), 'size', assetNames.length > 15 ? 15 : assetNames.length);  
                setAttr(queryEl(root + ".show-shop-select"), 'size', shopAssets.length > 15 ? 15 : shopAssets.length);  
                
                var head = clearEl(queryEl(root + ".asset-presence-table-head"));
                var body = clearEl(queryEl(root + ".asset-presence-table-body"));
                
                addEl(head, makeTableHead(shopAssets));
                addEls(body, assetNames.map( (asset, i) => makeTableInput(asset, i, shopAssets)));
            });
        });
    };
    
    var makeTableHead = function (shopAssets) {
        var els = shopAssets.map((item, i) => addClass(addEl(makeEl("th"),makeText(item.name)), i + "-col-dependent"));
        return addEls(makeEl("tr"), [makeEl("th")].concat(els));
    };
    
    var makeTableInput = function (asset, i, shopAssets) {
        var tr = makeEl("tr");
        var td = makeEl("td");
        td.appendChild(makeText(asset.value));
        tr.appendChild(td);
        addClass(tr, i + "-row-dependent");

        shopAssets.forEach( (shopAssetData, j) => {
            td = addClass(makeEl("td"),'vertical-aligned-td');
            addClass(td, j + "-col-dependent");
            var input = makeEl("input");
//            addClass(input, "isStoryEditable");
            input.type = "checkbox";
            if (shopAssetData.assets[asset.value]) {
                input.checked = true;
            }
//            input.eventIndex = i;
//            input.eventName = event.name;
            input.assetName = asset.value;
            input.shopName = shopAssetData.name;
//            input.hasText = event.characters[character] != null && event.characters[character].text != "";
            listen(input, "change", onChangeCharacterCheckbox);
            
            var id = i+shopAssetData.name;
            setAttr(input, 'id', id);
            addClass(input, 'hidden');
            addEl(td, input);
            var label = addClass(makeEl('label'),'checkbox-label');
            setAttr(label, 'for', id);
            addEl(td, label);
            
            tr.appendChild(td);
        });
        
        return tr;
    };
    
    var onChangeCharacterCheckbox = (event)=>{
        var target = event.target;
        if (target.checked) {
//            Utils.confirm(strFormat(getL10n('asset-confirm-adding-asset'), [target.assetName, target.shopName]), () => {  
                DBMS.addAssetToShop(target.assetName, target.shopName, Utils.processError());
//            }, () => target.checked = !target.checked); 
        } else {
//            Utils.confirm(strFormat(getL10n('asset-confirm-removing-asset'), [target.assetName, target.shopName]), () => {  
                DBMS.removeAssetFromShop(target.assetName, target.shopName, Utils.processError());
//            }, () => target.checked = !target.checked); 
        }
    }

})(this['AssetPresence']={});