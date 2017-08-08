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
    
    var root = '.shop-window-tab ';
    var state = {};
    var l10n = L10n.get('shop');

    exports.init = function() {
//        listen(queryEl(root + '.refreshButton'), 'click', exports.refresh);
//        queryEls(root + '.discount-button').map(listen(R.__, 'click', (event)=>{
////            state.discount = Number(getAttr(event.target, 'value'));
//            updateFinalCost();
//        }));
        checkForQR();
        listen(queryEl(root + ".amount-input"), 'change', onAmountChange);
        listen(queryEl(root + ".buy-button"), 'click', onBuy);
        listen(queryEl(root + ".start-qr-read"), 'click', readQR);
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
        var shopName = ShopManagement.getCurrentShopName();
        DBMS.getShop(shopName, function(err, shopData){
            if(err) {Utils.handleError(err); return;}
            state.shopData = shopData;
            var categoryList  = R.keys(state.shopData.categories).sort(CommonUtils.charOrdA);
            
            var catSelect = clearEl(queryEl(root + ".category-select"));
            clearEl(queryEl(root + ".asset-select"));
            
            
            var catBtns = categoryList.map( name => {
                var btn = addEl(makeEl('button'), makeText(name));
                addClass(btn, 'select-button');
                btn.catName = name;
                listen(btn, "click", onCategorySelect);
                return btn;
            });
            addEls(catSelect, catBtns);
            if(catBtns.length > 0) onCategorySelect({target:catBtns[0]});
        });
    };

    var makeBtn = R.curry((catName, el) => {
        var btn = addEl(makeEl('button'), makeText(el.dispName));
        addClass(btn, 'select-button');
        btn.name = el.name;
        btn.catName = catName;
        btn.assetType = el.type;
        listen(btn, "click", onAssetSelect);
        return btn;
    });
    
    var onCategorySelect = (event) => {
        queryEls(root + ".category-select > button").map(removeClass(R.__, 'active'));
        addClass(event.target, 'active');
        var catName = event.target.catName;
        var category = state.shopData.categories[catName];
        
        clearEl(queryEl(root + ".asset-info"));
        addClass(queryEl(root + ".buy-controls"), 'hidden');
        var assetSelect = clearEl(queryEl(root + ".asset-select"));
        
        var arr = R.keys(category.globals).map(R.pair(R.__, 'global'));
        arr = R.concat(arr, R.keys(category.locals).map(R.pair(R.__, 'local')));

        DBMS.getGlobalAssetDisplayNames( (err, globalDisplayNames) => {
            if(err) {Utils.handleError(err); return;}
            
            arr = arr.map(el => {
                if(el[1] === 'global'){
                    var dispName = globalDisplayNames[el[0]].displayString;
                } else {
                    var dispName = state.shopData.localAssets[el[0]].displayString;
                }
                return {
                    name: el[0],
                    type: el[1],
                    dispName: dispName.trim() === '' ? el[0] : dispName
                }
            }).sort(CommonUtils.charOrdAFactory(R.prop('dispName')));
            
            addEls(assetSelect, arr.map(makeBtn(catName)))
        });
    };
    
    var onAssetSelect = (event) => {
        queryEls(root + ".asset-select > button").map(removeClass(R.__, 'active'));
        addClass(event.target, 'active');
        removeClass(queryEl(root + ".buy-controls"), 'hidden');
        queryEl('.customer-login').value = '';
        queryEl('.customer-password').value = '';
        state.curAsset = {
            name : event.target.name ,
            catName : event.target.catName ,
            assetType : event.target.assetType 
        };
        showAssetInfo();
    };
    
    var showAssetInfo = () => {
        var set = state.curAsset.assetType === 'local' ? 'locals' : 'globals';
        var cost = state.shopData.categories[state.curAsset.catName][set][state.curAsset.name].cost;
        state.cost = cost;
        queryEl(root + ".final-cost-input").value = cost;
//        state.discount = 0;
        if(state.curAsset.assetType === 'local'){
            state.assetData = state.shopData.localAssets[state.curAsset.name];
            renderAssetInfo();
        } else {
            DBMS.getAsset(state.curAsset.name, (err, assetData) => {
                if(err) {Utils.handleError(err); return;}
                state.assetData = assetData;
                renderAssetInfo();
            });
        }
    };
    
    var renderAssetInfo = () => {
        var info = clearEl(queryEl(root + ".asset-info"));
        var displayName = state.assetData.displayString.trim() !== '' ? state.assetData.displayString : state.curAsset.name;
        addEl(info, addEl(makeEl('h2'), makeText(displayName)));
        addEl(info, addEl(makeEl('span'), makeText(state.assetData.description)));
        addEl(clearEl(queryEl(root + ".initial-cost-value")), makeText(state.cost));

        setClassByCondition(queryEl(root + ".activation-codes-container"), 'hidden', !state.assetData.isPhysical);
        setClassByCondition(queryEl(root + ".qr-reader"), 'hidden', !(state.assetData.isPhysical && state.isCanvasOk));
        var amount = clearEl(queryEl(root + ".amount-input"));
        amount.value = 1;
        if(state.assetData.isPhysical){
            delAttr(amount, 'disabled');
        } else {
            setAttr(amount, 'disabled', 'disabled');
        }
        onAmountChange({target: amount});
    };
    
    var onAmountChange = (event) => {
        var num = Number(event.target.value);
        var el = clearEl(queryEl(root + ".activation-codes"));
        if(num < 1) num = 1;
        if(num > 10) num = 10;
        addEls(el, R.repeat(1, num).map(val => {
//            return setAttr(makeEl('input'), 'type', 'number');
            return addClasses(makeEl('input'), ['form-control','qr-code-input']);
        }));
    };
    
    var onBuy = () => {
        var shopName = ShopManagement.getCurrentShopName();
        var cost = Number(queryEl(root + ".final-cost-input").value);
        var customerLogin = queryEl('.customer-login').value;
        var customerPassword = queryEl('.customer-password').value;
        var opts = {
            amount: Number(queryEl(root + ".amount-input").value)
        };
        if(state.assetData.isPhysical){
            var values = queryEls(root + ".activation-codes input").map(R.compose(R.trim, R.prop('value')));
            if(values.some(R.isEmpty)){
                Utils.alert(l10n('not-all-activation-codes-are-full'));
                return;
            }
            opts.codes = values;
        }
        DBMS.buyAsset(shopName, state.curAsset.name, state.curAsset.assetType, cost, customerLogin, customerPassword, opts, function(err){
            if(err) {Utils.handleError(err); return;}
            queryEl('.customer-login').value = '';
            queryEl('.customer-password').value = '';
            Utils.alert(l10n('on-purchase-success'));
        });
    };
    
    var checkForQR = () => {
        function isCanvasSupported(){
          var elem = document.createElement('canvas');
          return !!(elem.getContext && elem.getContext('2d'));
        }
        state.isCanvasOk = isCanvasSupported() && window.File && window.FileReader;
    };
    
    var readQR = () => {
        qrcode.callback = read;
        qrcode.customCanvas = queryEl(root + ".qr-canvas");
        var video = setAttr(makeEl('video'), 'autoplay','autoplay');
        addEl(clearEl(queryEl(root + ".video")), video);
        qrcode.setWebcam(video);
    };
    
    var read = (a) => {
        console.log('read called');
        console.log(a);
        queryEl(root + ".video video").pause();
        clearEl(queryEl(root + ".video"));
        
        var request = $.ajax({
//            url : 'http://dev.alice.digital:8159/decode?content=' + a,
            url : 'https://alice.digital/app/qr/decode?content=' + a,
            dataType : "text",
            method : "GET",
            contentType : "application/json;charset=utf-8",
            cache: false,
            timeout: Constants.httpTimeout,
        });
        
        request.done(function(data) {
            data = JSON.parse(data);
            var length = data.payload.length;
            var payload = data.payload.substring(length-6, length);
            var values = queryEls(root + ".activation-codes input").map(R.compose(R.trim, R.prop('value')));
            if(R.contains(payload, values)){
                Utils.alert(l10n('this-qr-code-already-used-in-inputs'));
                return;
            }
            var inputs = queryEls(root + ".activation-codes input").filter(R.compose(R.isEmpty, R.trim, R.prop('value')));
            if(inputs.length > 0){
                inputs[0].value = data.payload.substring(length-6, length);
            } else {
                Utils.alert(l10n('all-activation-codes-are-full'));
            }
        });
        
        request.fail(function(errorInfo, textStatus, errorThrown) {
            Utils.alert(errorInfo.responseText || textStatus || 'error');
        });
    };
    

})(this['ShopWindow']={});