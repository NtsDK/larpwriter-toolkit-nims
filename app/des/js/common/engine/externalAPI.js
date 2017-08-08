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
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        var listeners     = opts.listeners   ;
        
        LocalDBMS.prototype.getShopAPICheck = function(shopName, callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getShopAPICheck']));
        };
        
        LocalDBMS.prototype.getShopsAPICheck = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getShopsAPICheck']));
        };
        
        LocalDBMS.prototype.getImplantsAPICheck = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getImplantsAPICheck']));
        };
        
        LocalDBMS.prototype.getPillsAPICheck = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getPillsAPICheck']));
        };
        
        LocalDBMS.prototype.importImplants = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['importImplants']));
        };
        
        LocalDBMS.prototype.importPills = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['importPills']));
        };
        
        LocalDBMS.prototype.getShopIndex = function(shopName, callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getShopIndex']));
        };

        LocalDBMS.prototype.buyAsset = function(shopName, assetName, assetType, cost, customerLogin, customerPassword, opts, callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['buyAsset']));
        };
        
        LocalDBMS.prototype.getTheme = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getTheme']));
        };
        
        LocalDBMS.prototype.setTheme = function(theme, callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['setTheme']));
        };
    };
    
    callback(api);

})(function(api){
    typeof exports === 'undefined'? this['externalAPI'] = api: module.exports = api;
}.bind(this));