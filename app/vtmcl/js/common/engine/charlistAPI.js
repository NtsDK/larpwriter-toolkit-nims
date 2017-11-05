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
        var Migrator      = opts.Migrator    ;
        var CU            = opts.CommonUtils ;
        var PC            = opts.Precondition;
        var EventEmitter  = opts.EventEmitter;
        var Constants     = opts.Constants   ;
        var R             = opts.R   ;
        
        var containerPath = ['Charlist'];
        
        var char = (db) => R.path(containerPath, db.database);
        
        const getter = R.curry(function(subPath, enumArr, itemName, callback){
            var chain = PC.chainCheck([PC.isString(itemName), PC.elementFromEnum(itemName, enumArr())]);
            PC.precondition(chain, callback, () => {
                callback(null, R.path(subPath, char(this))[itemName]);
            });
        });
        const setter = R.curry(function(subPath, enumArr, valueCheck, itemName, itemValue, callback){
            var chain = PC.chainCheck([PC.isString(itemName), PC.elementFromEnum(itemName, enumArr.bind(this)()), valueCheck(itemValue)]);
            PC.precondition(chain, callback, () => {
                R.path(subPath, char(this))[itemName] = itemValue;
                if(callback) callback();
            });
        });
        
        const objListGetter = (container) => {
            return function(){
                return R.keys(char(this)[container])
            };
        };
        
        const isValString = value => PC.chainCheck([PC.isString(value)]);
        const isValInRange = R.curry((min, max, value) => PC.chainCheck([PC.isNumber(value), PC.isInRange(value, min, max)]));
        
        LocalDBMS.prototype.getProfileItem = getter(['profile'], R.always(Constants.profileItemList));
        LocalDBMS.prototype.setProfileItem = setter(['profile'], R.always(Constants.profileItemList), isValString);
        
        LocalDBMS.prototype.getAttribute = getter(['attributes'], R.always(Constants.attributeList));
        LocalDBMS.prototype.setAttribute = setter(['attributes'], R.always(Constants.attributeList), isValInRange(0, Constants.maxPoints));
        
        LocalDBMS.prototype.getAbility = getter(['abilities'], R.always(Constants.abilityList));
        LocalDBMS.prototype.setAbility = setter(['abilities'], R.always(Constants.abilityList), isValInRange(0, Constants.maxPoints));
        
        LocalDBMS.prototype.getVirtue = getter(['virtues'], R.always(Constants.virtues));
        LocalDBMS.prototype.setVirtue = setter(['virtues'], R.always(Constants.virtues), isValInRange(1, Constants.maxPoints));
        
        LocalDBMS.prototype.getState = getter(['state'], R.always(Constants.basicStateList));
        LocalDBMS.prototype.setState = setter(['state'], R.always(Constants.basicStateList), isValInRange(1, Constants.extrasMaxPoints));
        
        LocalDBMS.prototype.getHealth = getter(['state','health'], R.always(Constants.healthList));
        LocalDBMS.prototype.setHealth = setter(['state','health'], R.always(Constants.healthList), isValInRange(0, 2));
        
        LocalDBMS.prototype.setBackground = setter(['backgrounds'], objListGetter('backgrounds'), isValInRange(0, Constants.maxPoints));
        
        LocalDBMS.prototype.setDiscipline = setter(['disciplines'], objListGetter('disciplines'), isValInRange(0, Constants.maxPoints));
        
        const arrGetter = R.curry(function(initter, enumArr, type, callback){
            var chain = PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, enumArr)]);
            PC.precondition(chain, callback, () => {
                callback(null, initter(char(this)[type]));
            });
        });
        
        const namer = R.curry(function(defaultValue, enumArr, type, oldName, newName, callback) {
            const chain = [PC.isString(type), PC.elementFromEnum(type, enumArr), PC.isString(oldName), PC.isString(newName)];
            PC.precondition(PC.chainCheck(chain), callback, () => {
                const container = char(this)[type];
                oldName = oldName.trim();
                newName = newName.trim();
                const chain2 = [];
                if(oldName !== ''){
                    chain2.push(PC.entityExistsCheck(oldName, R.keys(container)));
                }
                if(newName !== ''){
                    chain2.push(PC.createEntityCheck(newName, R.keys(container)));
                }
                PC.precondition(PC.chainCheck(chain2), callback, () => {
                    if(oldName === '' && newName !== ''){
                        char(this)[type][newName] = defaultValue;
                    }
                    if(oldName !== '' && newName === ''){
                        delete char(this)[type][oldName];
                    }
                    if(oldName !== '' && newName !== ''){
                        char(this)[type][newName] = char(this)[type][oldName];
                        delete char(this)[type][oldName];
                    }
                    if(callback) callback();
                });
            });
        });

        LocalDBMS.prototype.getBackstory = arrGetter(R.keys, Constants.backstoryList);
        LocalDBMS.prototype.setBackstory = namer(true, Constants.backstoryList);

        LocalDBMS.prototype.getAdvantages = arrGetter(R.toPairs, Constants.advantagesList);
        LocalDBMS.prototype.renameAdvantage = namer(0, Constants.advantagesList);


//        LocalDBMS.prototype._init = function(listeners){
//            this.ee = new EventEmitter();
//            var that = this;
//            for(var triggerName in listeners){
//                listeners[triggerName].forEach(function(listener){
//                    that.ee.on(triggerName, listener.bind(that));
//                });
//            }
//        };
//    
//        LocalDBMS.prototype.getDatabase = function(callback){
//            this.database.Meta.saveTime = new Date().toString();
//            callback(null, CU.clone(this.database));
//        };
//    
//        LocalDBMS.prototype.setDatabase = function(database, callback){
//            try {
//                this.database = Migrator.migrate(database);
//            } catch(err){
//                return callback(err);
//            }
//            if(callback) callback();
//        };
//    
//        LocalDBMS.prototype.getMetaInfo = function(callback){
//            callback(null, CU.clone(this.database.Meta));
//        };
//    
//        // overview
//        LocalDBMS.prototype.setMetaInfo = function(name, value, callback){
//            var chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoList), PC.isString(value)]);
//            PC.precondition(chain, callback, () => {
//                this.database.Meta[name] = value;
//                if(callback) callback();
//            });
//        };
    };
  
    callback(api);
})(function(api){
    typeof exports === 'undefined'? this['charlistAPI'] = api: module.exports = api;
}.bind(this));