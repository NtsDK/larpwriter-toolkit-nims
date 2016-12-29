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

/*global
 Utils, ProfileEditor, ProfileConfigurer, DBMS
 */

"use strict";

(function(exports){

    var state = {};
    var root = '.profiles-tab ';
    var characterRoot = root + '.character-profile-panel ';
    var playerRoot = root + '.player-profile-panel ';
    
    exports.init = function () {
        state.views = {};
        var nav = root + ".sub-tab-navigation";
        var content = root + ".sub-tab-content";
        var containers = {
            root: state,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
        Utils.addView(containers, "profile-editor", ProfileEditor);
        Utils.addView(containers, "profile-constructor", ProfileConfigurer);
        Utils.addView(containers, "profile-binding", ProfileBinding,{mainPage:true});
    
        listen(queryEl(characterRoot + ".create-entity-button"), "click", createProfile('character', characterRoot));
        listen(queryEl(characterRoot + ".rename-entity-button"), "click", renameProfile('character', characterRoot));
        listen(queryEl(characterRoot + ".remove-entity-button"), "click", removeProfile('character', characterRoot));

        listen(queryEl(playerRoot + ".create-entity-button"), "click", createProfile('player', playerRoot));
        listen(queryEl(playerRoot + ".rename-entity-button"), "click", renameProfile('player', playerRoot));
        listen(queryEl(playerRoot + ".remove-entity-button"), "click", removeProfile('player', playerRoot));
    
        exports.content = queryEl(root);
    };
    
    exports.refresh = function () {
        PermissionInformer.getEntityNamesArray('character', true, function(err, characterNames){
            if(err) {Utils.handleError(err); return;}
            PermissionInformer.getEntityNamesArray('player', true, function(err, playerNames){
                if(err) {Utils.handleError(err); return;}
                rebuildInterface(characterRoot, characterNames);
                rebuildInterface(playerRoot, playerNames);
                state.currentView.refresh();
            });
        });
    };
    
    var rebuildInterface = function (root, names) {
        var data = getSelect2Data(names);
        
        clearEl(queryEl(root + ".rename-entity-select"));
        $(root + ".rename-entity-select").select2(data);
        
        clearEl(queryEl(root + ".remove-entity-select"));
        $(root + ".remove-entity-select").select2(data);
    };
    
    var createProfile = function (type, root) {
        return function(){
            var input = queryEl(root + ".create-entity-input");
            var name = input.value.trim();
            
            if (name === "") {
                Utils.alert(getL10n("profiles-character-name-is-not-specified"));
                return;
            }
            
            DBMS.isProfileNameUsed(type, name, function(err, isProfileNameUsed){
                if(err) {Utils.handleError(err); return;}
                if (isProfileNameUsed) {
                    Utils.alert(strFormat(getL10n("profiles-character-name-already-used"), [name]));
                } else {
                    DBMS.createProfile(type, name, function(err){
                        if(err) {Utils.handleError(err); return;}
                        PermissionInformer.refresh(function(err){
                            if(err) {Utils.handleError(err); return;}
                            if(state.currentView.updateSettings){
                                state.currentView.updateSettings(name);
                            }
                            input.value = '';
                            exports.refresh();
                        });
                    });
                }
            });
        }
    };
    
    var renameProfile = function (type, root) {
        return function(){
            var toInput = queryEl(root + ".rename-entity-input");
            var fromName = queryEl(root + ".rename-entity-select").value.trim();
            var toName = toInput.value.trim();
        
            if (toName === "") {
                Utils.alert(getL10n("profiles-new-character-name-is-not-specified"));
                return;
            }
        
            if (fromName === toName) {
                Utils.alert(getL10n("profiles-names-are-the-same"));
                return;
            }
        
            DBMS.isProfileNameUsed(type, toName, function(err, isProfileNameUsed){
                if(err) {Utils.handleError(err); return;}
                if (isProfileNameUsed) {
                    Utils.alert(strFormat(getL10n("profiles-character-name-already-used"), [toName]));
                } else {
                    DBMS.renameProfile(type, fromName, toName, function(err){
                        if(err) {Utils.handleError(err); return;}
                        PermissionInformer.refresh(function(err){
                            if(err) {Utils.handleError(err); return;}
                            if(state.currentView.updateSettings){
                                state.currentView.updateSettings(toName);
                            }
                            toInput.value = '';
                            exports.refresh();
                        });
                    });
                }
            });
        }
    };
    
    var removeProfile = function (type, root) {
        return function(){
            var name = queryEl(root + ".remove-entity-select").value.trim();
        
            if (Utils.confirm(strFormat(getL10n("profiles-are-you-sure-about-character-removing"),[name]))) {
                DBMS.removeProfile(type, name, function(err){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.refresh(function(err){
                        if(err) {Utils.handleError(err); return;}
                        exports.refresh();
                    });
                });
            }
        }
    };

})(this['Characters']={});
