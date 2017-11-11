/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
        
        LocalDBMS.prototype.getInfluences = function(callback) {
            callback(null, CU.clone(this.database.Influences));
        }
        
        LocalDBMS.prototype.createInfluence = function(time, sender, latitude, longitude, power, callback) {
            var chain = [PC.isString(time), PC.isString(sender), PC.isNumber(latitude), PC.isNumber(longitude), 
                PC.isNumber(power), PC.isInRange(power, -7,7)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                this.database.Influences.push({
                    time,
                    sender, 
                    latitude, 
                    longitude, 
                    power
                });
                if(callback) callback();
            });
        }
        
        LocalDBMS.prototype.removeInfluence = function(influence, callback) {
            var chain = [PC.isString(influence)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                try{
                    influence = JSON.parse(influence);
                } catch(err){
                    callback(err);
                    return;
                }
                var index = R.indexOf(influence, this.database.Influences);
                if(index !== -1){
                    this.database.Influences.splice(index, 1)
                }
                if(callback) callback();
            });
        }
        
        LocalDBMS.prototype.removePersonInfluence = function(characterName, callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['removePersonInfluence']));
        };
        LocalDBMS.prototype.createMasterPersonInfluence = function(characterName, callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['createMasterPersonInfluence']));
        };
        LocalDBMS.prototype.getAnalystInfluences = function(characterName, callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['getAnalystInfluences']));
        };
        
//        LocalDBMS.prototype.getEntityNamesArray = function(type, callback) {
//            var chain = PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.ownedEntityTypes)]);
//            PC.precondition(chain, callback, () => {
//                switch(type){
//                case 'character':
//                case 'player':
//                    this.getProfileNamesArray(type, callback);
//                    break;
//                case 'group':
//                    this.getGroupNamesArray(callback);
//                    break;
//                case 'story':
//                    this.getStoryNamesArray(callback);
//                    break;
//                default:
//                    callback(new Errors.InternalError('errors-unexpected-switch-argument', [type]));
//                }
//            });
//        };
    
    };
    callback(api);

})(function(api){
    typeof exports === 'undefined'? this['influencesAPI'] = api: module.exports = api;
}.bind(this));
