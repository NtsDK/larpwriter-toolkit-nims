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
    
    function consistencyCheckAPI(LocalDBMS, opts) {
        var R             = opts.R           ;
        var CommonUtils   = opts.CommonUtils ;
        var validatorLib  = opts.Ajv         ;
        var schemaBuilder = opts.Schema      ;
        
        LocalDBMS.prototype.getConsistencyCheckResult = function(callback) {
            var errors = [];
            var pushError = function(str){
                errors.push(str);
            }
            
//            innerAndOuterNameCheck(this.database.Assets, pushError);
//            innerAndOuterNameCheck(this.database.Shops, pushError);
//            var globalsList = R.keys(this.database.Assets);
//            R.values(this.database.Shops).forEach(function(shop) {
//                var address = JSON.stringify({shop: shop.name, srcArr: 'shop.assets', dstArr: 'globalsList'});
//                allValuesFromListCheck(R.keys(shop.assets), globalsList, address, pushError);
//                var localsList = R.keys(shop.localAssets);
//                R.keys(shop.categories).forEach((categoryName) => {
//                    var category = shop.categories[categoryName];
//                    address = JSON.stringify({shop: shop.name, category: categoryName, srcArr: 'category.globals', dstArr: 'shop.assets'});
//                    allValuesFromListCheck(R.keys(category.globals), R.keys(shop.assets), address, pushError);
//                    address = JSON.stringify({shop: shop.name, category: categoryName, srcArr: 'category.locals', dstArr: 'localsList'});
//                    allValuesFromListCheck(R.keys(category.locals), localsList, address, pushError);
//                });
//            });
            
            var schema = schemaBuilder.getSchema(this.database);
            var validator = validatorLib({allErrors: true}); // options can be passed, e.g. {allErrors: true}
            var validate = validator.compile(schema);
            var valid = validate(this.database);
            if (!valid) {
                errors = errors.concat(validate.errors);
            }
            
            callback(null, errors);
        };
        
//        var allValuesFromListCheck = function(list, fromList, address, callback){
//            var processError = getErrorProcessor(callback);
//            var diff = R.difference(list, fromList);
//            if(diff.length !== 0){
//                processError("Object is inconsistent, list includes not existing values: address {0}, diff {1}, list {2}, fromList {3}", [address, diff, list, fromList]);
//            }
//        };
//        var innerAndOuterNameCheck = function(obj, callback){
//            var processError = getErrorProcessor(callback);
//            R.keys(obj).forEach((outerName) => {
//                if(obj[outerName].name !== outerName){
//                    processError("Object is inconsistent, outer name is not equal to inner name: outer {0}, inner {1}", [outerName, obj[outerName].name]);
//                }
//            })
//        };
        
        var getErrorProcessor = function(callback){
            return R.curry(R.compose(callback, CommonUtils.strFormat));
        }
        
    };
    
    callback(consistencyCheckAPI);

})(function(api){
    typeof exports === 'undefined'? this['consistencyCheckAPI'] = api: module.exports = api;
}.bind(this));