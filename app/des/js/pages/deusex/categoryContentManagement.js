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
    
    var root = '.category-content-management-tab ';
    var categoryContentRoot = root + '.category-content-management ';
    var state = {};
    state.sortKey = 0;
    state.sortDir = "asc";

    var headArr = [ 'categoryName',
        'assetName',
        'displayString',
        'cost',
        'type',
        'resourceCost',
        'isPhysical',
        'description' ];

    exports.init = function() {
        listen(queryEl(categoryContentRoot + ".add-entity-button-1"),"click", addGlobalAssetToCategory);
        listen(queryEl(categoryContentRoot + ".add-entity-button-2"),"click", addLocalAssetToCategory);
        listen(queryEl(categoryContentRoot + ".remove-entity-button-1"),"click", removeGlobalAssetFromCategory);
        listen(queryEl(categoryContentRoot + ".remove-entity-button-2"),"click", removeLocalAssetFromCategory);
        
        initSortIcons();
        queryEls(categoryContentRoot + "thead tr input").map(listen(R.__, 'input', exports.refresh));
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        var shopName = ShopManagement.getCurrentShopName();
        DBMS.getShop(shopName, function(err, shopData){
            if(err) {Utils.handleError(err); return;}
            
            var data = arr2Select2(R.keys(shopData.categories).sort(CommonUtils.charOrdA));
            
            clearEl(queryEl(categoryContentRoot + ".add-entity-select-12"));
            $(categoryContentRoot + ".add-entity-select-12").select2(data);
            
            clearEl(queryEl(categoryContentRoot + ".add-entity-select-22"));
            $(categoryContentRoot + ".add-entity-select-22").select2(data);

            var globalAssets = arr2Select2(R.keys(shopData.assets));
//            globalAssets.placeholder = "Select an option";
            clearEl(queryEl(categoryContentRoot + ".add-entity-select-11"));
            $(categoryContentRoot + ".add-entity-select-11").select2((globalAssets));
            
            var localAssets = arr2Select2(R.keys(shopData.localAssets));
            clearEl(queryEl(categoryContentRoot + ".add-entity-select-21"));
            $(categoryContentRoot + ".add-entity-select-21").select2((localAssets));
            
            var getList = (container) => {
                return R.unnest(R.keys(shopData.categories).map(categoryName => {
                    return R.keys(shopData.categories[categoryName][container]).map(assetName => [categoryName, assetName])
                }));
            }
            var assets = getList('globals').map( arr => R.zipObj(['displayName','value'], [arr[0] + '/' + arr[1], JSON.stringify(arr)]));
            assets.sort(CommonUtils.charOrdAFactory(R.prop('displayName')))
            clearEl(queryEl(categoryContentRoot + ".remove-entity-select-1"));
            $(categoryContentRoot + ".remove-entity-select-1").select2(getSelect2Data(assets));
            
            var assets = getList('locals').map( arr => R.zipObj(['displayName','value'], [arr[0] + '/' + arr[1], JSON.stringify(arr)]));
            assets.sort(CommonUtils.charOrdAFactory(R.prop('displayName')))
            clearEl(queryEl(categoryContentRoot + ".remove-entity-select-2"));
            $(categoryContentRoot + ".remove-entity-select-2").select2(getSelect2Data(assets));
            
            fillShopTable(shopData);
        });
    };
    
    var initSortIcons = () => {
        var icons = queryEls(categoryContentRoot + "thead tr.first-row th");
        icons.map((icon, i) => {
            icon.index = i;
            listen(icon, "click", onSortChange);
        });
    };
    
    var onSortChange = function (event) {
        var target = event.target;
        if(target.tagName.toLowerCase() === "span"){
            target = target.parentElement;
        }
        
        if (state.sortKey === target.index) {
            state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
            setClassByCondition(target, 'sortDesc', state.sortDir === 'desc');
            setClassByCondition(target, 'sortAsc', state.sortDir === 'asc');
        } else {
            var filterHead = queryEl(categoryContentRoot + "thead");
            nl2array(filterHead.getElementsByClassName("sortAsc")).forEach(removeClass(R.__, "sortAsc"));
            nl2array(filterHead.getElementsByClassName("sortDesc")).forEach(removeClass(R.__, "sortDesc"));
            
            state.sortKey = target.index;
            state.sortDir = "asc";
            addClass(target, "sortAsc");
        }
        exports.refresh();
    };
    
    var data2str = (data) => {
        if(data.cost !== -1){
            var input = addClass(makeEl('input'),'form-control');
            setAttr(input, 'type', 'number');
            setAttr(input, 'min', '0');
            input.value = data.cost;
            listen(input, "change", (event) => {
                DBMS.setAssetCost(ShopManagement.getCurrentShopName(), data.type, data.categoryName, data.assetName, Number(event.target.value), Utils.processError());
            });
        } else {
            input = makeText('');
        }
        return addEls(makeEl('tr'), [addEl(makeEl('td'), makeText(data.categoryName)),
                addEl(makeEl('td'), makeText(data.assetName)),
                addEl(makeEl('td'), makeText(data.displayString)),
                addEl(makeEl('td'), input),
//                addEl(makeEl('td'), makeText(data.cost)),
                addEl(makeEl('td'), makeText(data.type)),
                addEl(makeEl('td'), makeText(data.resourceCost)),
                addEl(makeEl('td'), makeText(data.isPhysical ? L10n.get('constant', 'yes') : '')),
                addEl(makeEl('td'), makeText(data.description))]);
    };
    
    var fillShopTable = (shopData) => {
        var table = clearEl(queryEl(categoryContentRoot + "tbody.table-content"));
        var data = R.unnest(R.keys(shopData.categories).map(categoryName => {
            var globals = shopData.categories[categoryName].globals;
            var data = R.keys(globals).map(global => {
                return {
                    categoryName: categoryName,
                    assetName: global,
                    displayString: shopData.globalAssets[global].displayString,
                    cost: globals[global].cost,
                    type: 'global',
                    resourceCost: shopData.globalAssets[global].resourceCost,
                    isPhysical: shopData.globalAssets[global].isPhysical,
                    description: shopData.globalAssets[global].description,
                }
            });
            
            var locals = shopData.categories[categoryName].locals;
            data = data.concat(R.keys(locals).map(local => {
                return {
                    categoryName: categoryName,
                    assetName: local,
                    displayString: shopData.localAssets[local].displayString,
                    cost: locals[local].cost,
                    type: 'local',
                    resourceCost: 0,
                    isPhysical: false,
                    description: shopData.localAssets[local].description,
                }
            }));
            
            return data;
        }));
        var usedGlobals = R.uniq(R.flatten(R.keys(shopData.categories).map(categoryName => R.keys(shopData.categories[categoryName].globals))));
        var usedLocals = R.uniq(R.flatten(R.keys(shopData.categories).map(categoryName => R.keys(shopData.categories[categoryName].locals))));
        var allGlobals = R.keys(shopData.assets);
        var allLocals = R.keys(shopData.localAssets);
        
        data = R.concat(data, R.difference(allGlobals, usedGlobals).map(global => {
            return {
                categoryName: L10n.get('shop','not-in-category'),
                assetName: global,
                displayString: shopData.globalAssets[global].displayString,
                cost: -1,
                type: 'global',
                resourceCost: shopData.globalAssets[global].resourceCost,
                isPhysical: shopData.globalAssets[global].isPhysical,
                description: shopData.globalAssets[global].description,
            }
        }));
        data = R.concat(data, R.difference(allLocals, usedLocals).map(local => {
            return {
                categoryName: L10n.get('shop','not-in-category'),
                assetName: local,
                displayString: shopData.localAssets[local].displayString,
                cost: -1,
                type: 'local',
                resourceCost: 0,
                isPhysical: false,
                description: shopData.localAssets[local].description,
            }
        }));

        var sortFunc = CommonUtils.charOrdAFactoryBase(state.sortDir, function(a){
            var value = a[headArr[state.sortKey]]; 
            if(R.is(String, value)){
                value = value.toLowerCase();
            }
            return value;
        });
        addEls(table, data.filter(makeFilterFunc()).sort(sortFunc).map(data2str));
    };
    
    var makeFilterFunc = () => {
        var values = queryEls(categoryContentRoot + "thead tr input").map(R.prop('value'));
        return function(data){
            return headArr.every((el, index) => {
                if(values[index].trim() === ''){
                    return true;
                }
                return String(data[headArr[index]]).toLowerCase().indexOf(String(values[index]).toLowerCase()) != -1;
            })
        };
    };
    
    var addGlobalAssetToCategory = ()=>{
        var asset = queryEl(categoryContentRoot + ".add-entity-select-11").value.trim();
        var category = queryEl(categoryContentRoot + ".add-entity-select-12").value.trim();
        DBMS.addGlobalAssetToCategory(ShopManagement.getCurrentShopName(), category, asset, Utils.processError(exports.refresh));
    };
    var addLocalAssetToCategory = ()=>{
        var asset = queryEl(categoryContentRoot + ".add-entity-select-21").value.trim();
        var category = queryEl(categoryContentRoot + ".add-entity-select-22").value.trim();
        DBMS.addLocalAssetToCategory(ShopManagement.getCurrentShopName(), category, asset, Utils.processError(exports.refresh));
    };
    var removeGlobalAssetFromCategory = ()=>{
        var arr = JSON.parse(queryEl(categoryContentRoot + ".remove-entity-select-1").value.trim());
        DBMS.removeGlobalAssetFromCategory(ShopManagement.getCurrentShopName(), arr[0], arr[1], Utils.processError(exports.refresh));
    };
    var removeLocalAssetFromCategory = ()=>{
        var arr = JSON.parse(queryEl(categoryContentRoot + ".remove-entity-select-2").value.trim());
        DBMS.removeLocalAssetFromCategory(ShopManagement.getCurrentShopName(), arr[0], arr[1], Utils.processError(exports.refresh));
    };

})(this['CategoryContentManagement']={});