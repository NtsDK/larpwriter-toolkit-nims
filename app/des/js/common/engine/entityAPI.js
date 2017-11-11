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

    function entityAPI(LocalDBMS, opts) {
        
        var R             = opts.R           ;
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var Constants     = opts.Constants   ;
        var Errors        = opts.Errors      ;
        
        LocalDBMS.prototype.getEntityNamesArray = function(type, callback) {
            var chain = PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.ownedEntityTypes)]);
            PC.precondition(chain, callback, () => {
                switch(type){
                case 'character':
                case 'player':
                    this.getProfileNamesArray(type, callback);
                    break;
                case 'group':
                    this.getGroupNamesArray(callback);
                    break;
                case 'story':
                    this.getStoryNamesArray(callback);
                    break;
                case 'shop':
                    this.getShopNamesArray(callback);
                    break;
                case 'asset':
                    this.getAssetNamesArray(callback);
                    break;
                default:
                    callback(new Errors.InternalError('errors-unexpected-switch-argument', [type]));
                }
            });
        };
    
    };
    callback(entityAPI);

})(function(api){
    typeof exports === 'undefined'? this['entityAPI'] = api: module.exports = api;
}.bind(this));
