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

    function accessManagerAPI(LocalDBMS, CommonUtils, R) {
        
        LocalDBMS.prototype.getManagementInfo = function(callback){
            var ManagementInfo = this.database.ManagementInfo;
            var usersInfo = CommonUtils.clone(R.keys(ManagementInfo.UsersInfo).reduce(function(result, user){
                result[user] = R.pick(['characters', 'groups','stories','players'], ManagementInfo.UsersInfo[user]);
                return result;
            }, {}));
            callback(null, {
                usersInfo : usersInfo,
                admin : ManagementInfo.admin,
                editor : ManagementInfo.editor,
                adaptationRights : ManagementInfo.adaptationRights
            });
        };
        
        LocalDBMS.prototype.assignAdmin = function(name, callback){
            this.database.ManagementInfo.admin = name;
            this.publishPermissionsUpdate();
            callback();
        };
        LocalDBMS.prototype.assignEditor = function(name, callback){
            this.database.ManagementInfo.editor = name;
            this.publishPermissionsUpdate();
            callback();
        };
        LocalDBMS.prototype.removeEditor = function(callback){
            this.database.ManagementInfo.editor = null;
            this.publishPermissionsUpdate();
            callback();
        };
        LocalDBMS.prototype.changeAdaptationRightsMode = function(mode, callback){
            this.database.ManagementInfo.adaptationRights = mode;
            this.publishPermissionsUpdate();
            callback();
        };
        
        LocalDBMS.prototype.isMasterNameUsed = function(name, callback){
            callback(null, this.database.ManagementInfo.UsersInfo[name] !== undefined);
        };
        
        LocalDBMS.prototype.createMaster = function(name, password, callback){
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['createMaster']));
        };
        
        LocalDBMS.prototype.changeMasterPassword = function(userName, newPassword, callback){
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['changeMasterPassword']));
        };
        
        LocalDBMS.prototype.removeMaster = function(name, callback){
            delete this.database.ManagementInfo.UsersInfo[name];
            this.publishPermissionsUpdate();
            callback();
        };
        
        LocalDBMS.prototype.removePermission = function(userName, names, callback){
            var ManagementInfo = this.database.ManagementInfo;
            for(var entity in names){
                if(names[entity].length != 0){
                    ManagementInfo.UsersInfo[userName][entity] = ManagementInfo.UsersInfo[userName][entity].filter(function(charName){
                        return names[entity].indexOf(charName) === -1;
                    });
                }
            }
            this.publishPermissionsUpdate();
            callback();
        };
        
        LocalDBMS.prototype.assignPermission = function(userName, names, callback){
            var ManagementInfo = this.database.ManagementInfo;
            for(var entity in names){
                if(names[entity].length != 0){
                    names[entity].forEach(function(charName){
                        if(ManagementInfo.UsersInfo[userName][entity].indexOf(charName) === -1){
                            ManagementInfo.UsersInfo[userName][entity].push(charName);
                        }
                    });
                    
                    Object.keys(ManagementInfo.UsersInfo).forEach(function(name){
                        if(name === userName){
                            return;
                        }
                        
                        ManagementInfo.UsersInfo[name][entity] = ManagementInfo.UsersInfo[name][entity].filter(function(charName){
                            return names[entity].indexOf(charName) === -1;
                        });
                    });
                }
            }
            this.publishPermissionsUpdate();
            callback();
        };
        
        LocalDBMS.prototype.publishPermissionsUpdate = function(callback) {
            callback(new Errors.ValidationError('admins-function-must-be-overriden-on-server', ['publishPermissionsUpdate']));
        };
        
        LocalDBMS.prototype.getPlayerLoginsArray = function(callback) {
            callback(null, R.keys(this.database.ManagementInfo.PlayersInfo));
        };
        
        LocalDBMS.prototype.createPlayer = function(userName, password, callback) {
            var err = this._passwordNotEmptyPrecondition(password);
            if(err){callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
            
            var that = this;
            this.createProfile('player', userName, function(err){
                if(err) callback(err);
                that.database.ManagementInfo.PlayersInfo[userName] = {
                    name : userName,
                    salt: 'dfgdfg',
                    hashedPassword: 'sdfsdfsdf'  +password
                };
                if(callback) callback();
            });
        };
        
        LocalDBMS.prototype.createPlayerLogin = function(userName, password, callback) {
            var err = this._createPlayerLoginPrecondition(userName, password);
            if(err){callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
            
            this.database.ManagementInfo.PlayersInfo[userName] = {
                name : userName,
                salt: 'dfgdfg',
                hashedPassword: 'sdfsdfsdf' + password
            };
            if(callback) callback();
        };
        
        LocalDBMS.prototype.changePlayerPassword = function(userName, password, callback) {
            var err = this._changePlayerPasswordPrecondition(userName, password);
            if(err){callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
            
            this.database.ManagementInfo.PlayersInfo[userName].hashedPassword = 'sdfsdfsdf' + password;
            if(callback) callback();
        };
        
        LocalDBMS.prototype.removePlayerLogin = function(userName, callback) {
            var err = this._playerHasLoginPrecondition(userName);
            if(err){callback(new (Function.prototype.bind.apply(Errors.ValidationError, err)));return;}
            
            delete this.database.ManagementInfo.PlayersInfo[userName];
            if(callback) callback();
        };
        
        LocalDBMS.prototype.getWelcomeText = function(callback){
            callback(null, this.database.ManagementInfo.WelcomeText);
        };

        LocalDBMS.prototype.setWelcomeText = function(text, callback){
            this.database.ManagementInfo.WelcomeText = text;
            if(callback) callback();
        };
        
        LocalDBMS.prototype.getPlayersOptions = function(callback){
            callback(null, CommonUtils.clone(this.database.ManagementInfo.PlayersOptions));
        };
        
        LocalDBMS.prototype.setPlayerOption = function(name, value, callback){
            this.database.ManagementInfo.PlayersOptions[name] = value;
            if(callback) callback();
        };
        
        var prepareInfo = function(profile, profileStructure){
            var hiddenItems = profileStructure.filter(item => item.playerAccess === 'hidden').map( item => item.name);
            profileStructure = profileStructure.filter(item => item.playerAccess !== 'hidden');
            return {
                'profile':R.omit(hiddenItems, profile),
                'profileStructure':profileStructure,
            };
        };
        
        LocalDBMS.prototype.getPlayerProfileInfo = function(callback){
            var that = this;
            that.getProfileStructure('player', function(err, playerProfileStructure){
                if(err) return callback(err);
                that.getProfile('player', '123', function(err, playerProfile){
                    if(err) return callback(err);
                    that.getProfileBinding('player', '123', function(err, binding){
                        if(err) return callback(err);
                        var playerInfo = prepareInfo(playerProfile, playerProfileStructure);
                        if(binding[0] === ''){
                            callback(null, { 'player': playerInfo });
                        } else {
                            that.getProfileStructure('character', function(err, characterProfileStructure){
                                if(err) return callback(err);
                                that.getProfile('character', binding[0], function(err, characterProfile){
                                    if(err) return callback(err);
                                    callback(null, { 
                                        'player': playerInfo,
                                        'character':prepareInfo(characterProfile, characterProfileStructure)
                                    });
                                });
                            });
                        }
                    });
                });
            });
        };
        
        LocalDBMS.prototype.createCharacterByPlayer = function(characterName, callback) {
            var that = this;
            that.createProfile('character', characterName, function(err){
                if(err) return callback(err);
                that.createBinding(characterName, '123', function(err){
                    if(err) return callback(err);
                    callback();
                });
            });
        };
        
        LocalDBMS.prototype._passwordNotEmptyPrecondition = function(password){
            if (password === '') {
                return [ null, 'admins-password-is-not-specified' ];
            }
        };
        
        LocalDBMS.prototype._playerHasLoginPrecondition = function(userName){
            if (this.database.ManagementInfo.PlayersInfo[userName] === undefined) {
                return [ null, 'admins-player-has-no-login', [userName] ];
            }
        };

        LocalDBMS.prototype._createPlayerLoginPrecondition = function(userName, password){
            if (this.database.ManagementInfo.PlayersInfo[userName] !== undefined) {
                return [ null, 'admins-player-already-has-password', [userName] ];
            } else if (this.database.Players[userName] === undefined) {
                return [ null, 'profiles-player-is-not-exist' ];
            } else {
                return this._passwordNotEmptyPrecondition(password);
            }
        };
        
        LocalDBMS.prototype._changePlayerPasswordPrecondition = function(userName, password){
            return this._passwordNotEmptyPrecondition(password) || this._playerHasLoginPrecondition(userName);
        };
    };
    

    callback(accessManagerAPI);

})(function(api){
    typeof exports === 'undefined'? this['accessManagerAPI'] = api: module.exports = api;
}.bind(this));