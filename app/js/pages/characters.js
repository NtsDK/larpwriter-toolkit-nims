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
 Utils, CharacterProfile, CharacterProfileConfigurer, DBMS
 */

"use strict";

(function(exports){

    var state = {};
    var root = '#charactersDiv ';
    
    exports.init = function () {
        state.views = {};
        var nav = "charactersNavigation";
        var content = "charactersContent";
        var containers = {
            root: state,
            navigation: getEl(nav),
            content: getEl(content)
        };
        Utils.addView(containers, "character-profile", CharacterProfile,{mainPage:true});
        Utils.addView(containers, "character-profile-constructor", CharacterProfileConfigurer);
    
        listen(queryEl(root + ".create-entity-button"), "click", createProfile);
        listen(queryEl(root + ".rename-entity-button"), "click", renameProfile);
        listen(queryEl(root + ".remove-entity-button"), "click", removeProfile);
    
        exports.content = queryEl(root);
    };
    
    exports.refresh = function () {
        PermissionInformer.getCharacterNamesArray(true, Utils.processError(rebuildInterface));
    };
    
    var rebuildInterface = function (names) {
        var data = getSelect2Data(names);
        
        clearEl(queryEl(root + ".rename-entity-select"));
        $(root + ".rename-entity-select").select2(data);
        
        clearEl(queryEl(root + ".remove-entity-select"));
        $(root + ".remove-entity-select").select2(data);
    
        state.currentView.refresh();
    };
    
    var createProfile = function () {
        var name = queryEl(root + ".create-entity-input").value.trim();
    
        if (name === "") {
            Utils.alert(getL10n("characters-character-name-is-not-specified"));
            return;
        }
        
        DBMS.isProfileNameUsed(name, function(err, isProfileNameUsed){
            if(err) {Utils.handleError(err); return;}
            if (isProfileNameUsed) {
                Utils.alert(strFormat(getL10n("characters-character-name-already-used"), [name]));
            } else {
                DBMS.createProfile(name, function(err){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.refresh(function(err){
                        if(err) {Utils.handleError(err); return;}
                        if(state.currentView.updateSettings){
                            state.currentView.updateSettings(name);
                        }
                        exports.refresh();
                    });
                });
            }
        });
    };
    
    var renameProfile = function () {
        var fromName = queryEl(root + ".rename-entity-select").value.trim();
        var toName = queryEl(root + ".rename-entity-input").value.trim();
    
        if (toName === "") {
            Utils.alert(getL10n("characters-new-character-name-is-not-specified"));
            return;
        }
    
        if (fromName === toName) {
            Utils.alert(getL10n("characters-names-are-the-same"));
            return;
        }
    
        DBMS.isProfileNameUsed(toName, function(err, isProfileNameUsed){
            if(err) {Utils.handleError(err); return;}
            if (isProfileNameUsed) {
                Utils.alert(strFormat(getL10n("characters-character-name-already-used"), [toName]));
            } else {
                DBMS.renameProfile(fromName, toName, function(err){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.refresh(function(err){
                        if(err) {Utils.handleError(err); return;}
                        if(state.currentView.updateSettings){
                            state.currentView.updateSettings(toName);
                        }
                        exports.refresh();
                    });
                });
            }
        });
    };
    
    var removeProfile = function () {
        var name = queryEl(root + ".remove-entity-select").value.trim();
    
        if (Utils.confirm(strFormat(getL10n("characters-are-you-sure-about-character-removing"),[name]))) {
            DBMS.removeProfile(name, function(err){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.refresh(function(err){
                    if(err) {Utils.handleError(err); return;}
                    exports.refresh();
                });
            });
        }
    };

})(this['Characters']={});
