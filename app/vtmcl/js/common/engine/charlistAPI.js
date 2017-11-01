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
        
        var containerPath = ['Charlist'];
        
        var char = (db) => R.path(containerPath, db.database);
        
        LocalDBMS.prototype.getProfileItem = function(itemName, callback){
            callback(null, char(this).profile[itemName]);
        };

        LocalDBMS.prototype.setProfileItem = function(itemName, itemValue, callback){
            char(this).profile[itemName] = itemValue.trim();
            if(callback) callback();
        };

        LocalDBMS.prototype.getAttribute = function(itemName, callback){
            callback(null, char(this).attributes[itemName]);
        };

        LocalDBMS.prototype.setAttribute = function(itemName, itemValue, callback){
            char(this).attributes[itemName] = itemValue;
            if(callback) callback();
        };

        LocalDBMS.prototype.getAbility = function(itemName, callback){
            callback(null, char(this).abilities[itemName]);
        };

        LocalDBMS.prototype.setAbility = function(itemName, itemValue, callback){
            char(this).abilities[itemName] = itemValue;
            if(callback) callback();
        };

        LocalDBMS.prototype.getVirtue = function(itemName, callback){
            callback(null, char(this).virtues[itemName]);
        };

        LocalDBMS.prototype.setVirtue = function(itemName, itemValue, callback){
            char(this).virtues[itemName] = itemValue;
            if(callback) callback();
        };

        LocalDBMS.prototype.getState = function(itemName, callback){
            callback(null, char(this).state[itemName]);
        };

        LocalDBMS.prototype.setState = function(itemName, itemValue, callback){
            char(this).state[itemName] = itemValue;
            if(callback) callback();
        };

        LocalDBMS.prototype.getHealth = function(itemName, callback){
            callback(null, char(this).state.health[itemName]);
        };

        LocalDBMS.prototype.setHealth = function(itemName, itemValue, callback){
            char(this).state.health[itemName] = itemValue;
            if(callback) callback();
        };

        LocalDBMS.prototype.getBackstory = function(type, callback){
            callback(null, Object.keys(char(this)[type]));
        };

        LocalDBMS.prototype.setBackstory = function(type, oldName, newName, callback){
            oldName = oldName.trim();
            newName = newName.trim();
            if(oldName === '' && newName !== ''){
                char(this)[type][newName] = true;
            }
            if(oldName !== '' && newName === ''){
                delete char(this)[type][oldName];
            }
            if(oldName !== '' && newName !== ''){
                delete char(this)[type][oldName];
                char(this)[type][newName] = true;
            }
            if(callback) callback();
        };

        LocalDBMS.prototype.getAdvantages = function(type, callback){
            callback(null, R.toPairs(char(this)[type]));
        };

        LocalDBMS.prototype.renameAdvantage = function(type, oldName, newName, callback){
            oldName = oldName.trim();
            newName = newName.trim();
            if(oldName === '' && newName !== ''){
                char(this)[type][newName] = 0;
            }
            if(oldName !== '' && newName === ''){
                delete char(this)[type][oldName];
            }
            if(oldName !== '' && newName !== ''){
                char(this)[type][newName] = char(this)[type][oldName];
                delete char(this)[type][oldName];
            }
            if(callback) callback();
        };

        LocalDBMS.prototype.getBackground = function(itemName, callback){
            callback(null, char(this).backgrounds[itemName]);
        };

        LocalDBMS.prototype.setBackground = function(itemName, itemValue, callback){
            char(this).backgrounds[itemName] = itemValue;
            if(callback) callback();
        };

        LocalDBMS.prototype.getDiscipline = function(itemName, callback){
            callback(null, char(this).disciplines[itemName]);
        };

        LocalDBMS.prototype.setDiscipline = function(itemName, itemValue, callback){
            char(this).disciplines[itemName] = itemValue;
            if(callback) callback();
        };

        LocalDBMS.prototype.getTrait = function(itemName, callback){
            callback(null, char(this).traits[itemName]);
        };

        LocalDBMS.prototype.setTrait = function(itemName, itemValue, callback){
            char(this).traits[itemName] = itemValue;
            if(callback) callback();
        };
        
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