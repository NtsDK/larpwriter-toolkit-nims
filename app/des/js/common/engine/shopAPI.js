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

"use strict";

(function(callback){

    function api(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        var listeners     = opts.listeners   ;
        
        var containerPath = ['Shops'];
        var containerPath2 = ['Assets'];
        
        var assetTypeCheck = function(type){
            return PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.assetTypes)]);
        };
        
        LocalDBMS.prototype.getShopNamesArray = function(callback) {
            callback(null, Object.keys(R.path(containerPath, this.database)).sort(CU.charOrdA));
        };
        LocalDBMS.prototype.getShopName = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getShopName']));
        };
        
        LocalDBMS.prototype.getShopAssets = function(callback) {
            var container = CU.clone(R.path(containerPath, this.database));
            var names = Object.keys(container).sort(CU.charOrdA);
            callback(null, names.map( name => container[name]).map(R.pick(['name','assets'])));
        };
        LocalDBMS.prototype.getShopPasswords = function(callback) {
            var container = CU.clone(R.path(containerPath, this.database));
            var names = Object.keys(container).sort(CU.charOrdA);
            callback(null, names.map( name => container[name]).map(R.pick(['name','password'])));
        };
        
        LocalDBMS.prototype.addAssetToShop = function(assetName, shopName, callback){
            var container = R.path(containerPath, this.database);
            var container2 = R.path(containerPath2, this.database);
            var chain = [PC.entityExistsCheck(shopName, R.keys(container)), PC.entityExistsCheck(assetName, R.keys(container2))];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                container[shopName].assets[assetName] = true;
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.removeAssetFromShop = function(assetName, shopName, callback){
            var container = R.path(containerPath, this.database);
            var container2 = R.path(containerPath2, this.database);
            var chain = [PC.entityExistsCheck(shopName, R.keys(container)), PC.entityExistsCheck(assetName, R.keys(container2))];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                delete container[shopName].assets[assetName];
                R.values(container[shopName].categories).forEach(category => {
                    if(category.globals[assetName] !== undefined){
                        delete category.globals[assetName];
                    }
                });
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.setShopData = function(shopName, fieldType, dataStr, callback){
            var container = R.path(containerPath, this.database);
            var chain = [PC.entityExistsCheck(shopName, R.keys(container)), PC.isString(fieldType), PC.elementFromEnum(fieldType, Constants.shopDataTypes), PC.isString(dataStr)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                container[shopName][fieldType] = dataStr;
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.createShop = function(name, password, callback){
//            var usersInfo = this.database.ManagementInfo.UsersInfo;
            var container = R.path(containerPath, this.database);
            var chain = [PC.createEntityCheck(name, R.keys(container)), PC.isString(password), PC.isNotEmptyString(password)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var entity = {
                    name : name,
                    password: password,
                    corporation: "",
                    sellerLogin: "",
                    sellerPassword: "",
                    assets: {},
                    categories: {},
                    localAssets: {}
                };
                
                container[name] = entity;
          //      this.ee.trigger("createShop", arguments);
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.changeShopPassword = function(name, newPassword, callback){
            var container = R.path(containerPath, this.database);
            var chain = [PC.entityExistsCheck(name, R.keys(container)), PC.isString(newPassword), PC.isNotEmptyString(newPassword)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                container[name].password = newPassword;
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.getShop = function(name, callback){
            var container = R.path(containerPath, this.database);
            var chain = [PC.entityExistsCheck(name, R.keys(container))];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                var shop = CU.clone(container[name]);
                shop.globalAssets = R.indexBy(R.prop('name'), R.keys(shop.assets).map(name => CU.clone(this.database.Assets[name])));
                callback(null, shop);
            });
        };
        
        LocalDBMS.prototype.removeShop = function(shopName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(shopName, R.keys(container)), callback, () => {
                delete container[shopName];
//                this.ee.trigger("removeShop", arguments);
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.createCategory = function(shopName, categoryName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].categories;
                PC.precondition(PC.createEntityCheck(categoryName, R.keys(container2)), callback, () => {
                    container2[categoryName] = {
                        "globals": {},
                        "locals": {}
                    };
                    //                this.ee.trigger("removeShop", arguments);
                    if(callback) callback();
                });
            });
        };
        
        LocalDBMS.prototype.renameCategory = function(shopName, fromName, toName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].categories;
                PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container2)), callback, () => {
                    var data = container2[fromName];
                    container2[toName] = data;
                    delete container2[fromName];
                    
//                    this.ee.trigger("renameAsset", arguments);
                    
                    if(callback) callback();
                });
            });
        };
        
        LocalDBMS.prototype.removeCategory = function(shopName, categoryName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].categories;
                PC.precondition(PC.removeEntityCheck(categoryName, R.keys(container2)), callback, () => {
                    delete container2[categoryName];
    //                this.ee.trigger("removeShop", arguments);
                    if(callback) callback();
                });
            });
        };
        
        LocalDBMS.prototype.getLocalAsset = function(shopName, assetName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.entityExistsCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].localAssets;
                PC.precondition(PC.entityExistsCheck(assetName, R.keys(container2)), callback, () => {
                    callback(null, CU.clone(container2[assetName]));
                });
            });
        };
        
        LocalDBMS.prototype.createLocalAsset = function(shopName, assetName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].localAssets;
                PC.precondition(PC.createEntityCheck(assetName, R.keys(container2)), callback, () => {
                    container2[assetName] = {
                        description: '',
                        displayString: ''
                    };
                    //                this.ee.trigger("removeShop", arguments);
                    if(callback) callback();
                });
            });
        };
        
        LocalDBMS.prototype.renameLocalAsset = function(shopName, fromName, toName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].localAssets;
                PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container2)), callback, () => {
                    var data = container2[fromName];
                    container2[toName] = data;
                    delete container2[fromName];
                    
                    R.values(container[shopName].categories).forEach(category => {
                        if(category.locals[fromName] !== undefined){
                            category.locals[toName] = category.locals[fromName];
                            delete category.locals[fromName];
                        }
                    });
                    
//                    this.ee.trigger("renameAsset", arguments);
                    
                    if(callback) callback();
                });
            });
        };
        
        LocalDBMS.prototype.removeLocalAsset = function(shopName, assetName, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.removeEntityCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].localAssets;
                PC.precondition(PC.removeEntityCheck(assetName, R.keys(container2)), callback, () => {
                    delete container2[assetName];
                    
                    R.values(container[shopName].categories).forEach(category => {
                        if(category.locals[assetName] !== undefined){
                            delete category.locals[assetName];
                        }
                    });
                    
                    //                this.ee.trigger("removeShop", arguments);
                    if(callback) callback();
                });
            });
        };
        
        var getTypeCheck = (fieldName, value) => {
            switch(fieldName){
            case 'displayString':
            case 'description':
            case 'apiKey':
                return PC.isString(value);
            case 'isPhysical':
                return PC.isBoolean(value);
            default: // resourceCost
                return PC.chainCheck([PC.isNumber(value), PC.isNonNegative(value)]);
            }
        };
        
        LocalDBMS.prototype.updateLocalAssetField = function(shopName, assetName, fieldName, value, callback) {
            var container = R.path(containerPath, this.database);
            PC.precondition(PC.entityExistsCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].localAssets;
                var chain = PC.chainCheck([PC.entityExistsCheck(assetName, R.keys(container2)), 
                                           PC.isString(fieldName), PC.elementFromEnum(fieldName, Constants.localAssetEditableItems),
                                           getTypeCheck(fieldName, value)]);
                PC.precondition(chain, callback, () => {
                    var data = container2[assetName];
                    data[fieldName] = value;
                    if(callback) callback();
                });
            });
        };
        
        var addAssetToCategory = function(shopName, categoryName, asset, database, fromContainer, toContainer, callback) {
            var container = R.path(containerPath, database);
            PC.precondition(PC.entityExistsCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].categories;
                var container3 = container[shopName][fromContainer];
                var chain = PC.chainCheck([PC.entityExistsCheck(categoryName, R.keys(container2)), 
                                           PC.entityExistsCheck(asset, R.keys(container3))]); 
                PC.precondition(chain, callback, () => {
                    container2[categoryName][toContainer][asset] = {
                            cost: 0
                    };
                    if(callback) callback();
                });
            });
        };
        
        LocalDBMS.prototype.setAssetCost = function(shopName, type, categoryName, asset, cost, callback){
            var container = R.path(containerPath, this.database);
            var chain = PC.chainCheck([assetTypeCheck(type), PC.entityExistsCheck(shopName, R.keys(container)), PC.isNumber(cost), PC.isNonNegative(cost)]); 
            PC.precondition(chain, callback, () => {
                var container2 = container[shopName].categories;
                PC.precondition(PC.entityExistsCheck(categoryName, R.keys(container2)), callback, () => {
                    var fromContainer = type === 'local' ? 'locals' : 'globals';
                    var container3 = container[shopName].categories[categoryName][fromContainer];
                    PC.precondition(PC.entityExistsCheck(asset, R.keys(container3)), callback, () => {
                        container3[asset].cost = cost;
                        if(callback) callback();
                    });
                });
            });
        };
        
        LocalDBMS.prototype.addGlobalAssetToCategory = function(shopName, categoryName, asset, callback) {
            addAssetToCategory(shopName, categoryName, asset, this.database, 'assets', 'globals', callback)
        };
        LocalDBMS.prototype.addLocalAssetToCategory = function(shopName, categoryName, asset, callback) {
            addAssetToCategory(shopName, categoryName, asset, this.database, 'localAssets', 'locals', callback)
        };
        
        var removeAssetFromCategory = function(shopName, categoryName, asset, database, fromContainer, callback) {
            var container = R.path(containerPath, database);
            PC.precondition(PC.entityExistsCheck(shopName, R.keys(container)), callback, () => {
                var container2 = container[shopName].categories;
                PC.precondition(PC.entityExistsCheck(categoryName, R.keys(container2)), callback, () => {
                    var container3 = container[shopName].categories[categoryName][fromContainer];
                    PC.precondition(PC.entityExistsCheck(asset, R.keys(container3)), callback, () => {
                        delete container3[asset];
                        if(callback) callback();
                    });
                });
            });
        };
        LocalDBMS.prototype.removeGlobalAssetFromCategory = function(shopName, categoryName, asset, callback) {
            removeAssetFromCategory(shopName, categoryName, asset, this.database, 'globals', callback)
        };
        LocalDBMS.prototype.removeLocalAssetFromCategory = function(shopName, categoryName, asset, callback) {
            removeAssetFromCategory(shopName, categoryName, asset, this.database, 'locals', callback)
        };
        
        
        function _renameAsset(fromAssetName, toAssetName){
            var container = R.path(containerPath, this.database);
            R.values(container).filter(shop => shop.assets[fromAssetName]).forEach(shop => {
                delete shop.assets[fromAssetName];
                shop.assets[toAssetName] = true;
                
                R.values(shop.categories).forEach(category => {
                    if(category.globals[fromAssetName] !== undefined){
                        category.globals[toAssetName] = category.globals[toAssetName];
                        delete category.globals[fromAssetName];
                    }
                });
            });
        };
        
        listeners.renameAsset = listeners.renameAsset || [];
        listeners.renameAsset.push(_renameAsset);
        
        function _removeAsset(assetName){
            var container = R.path(containerPath, this.database);
            R.values(container).forEach(shop => {
                delete shop.assets[assetName];
                
                R.values(shop.categories).forEach(category => {
                    if(category.globals[assetName] !== undefined){
                        delete category.globals[assetName];
                    }
                });
            });
        };
        
        listeners.removeAsset = listeners.removeAsset || [];
        listeners.removeAsset.push(_removeAsset);
        
    };
    
    callback(api);

})(function(api){
    typeof exports === 'undefined'? this['shopAPI'] = api: module.exports = api;
}.bind(this));