/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
 Utils, CharacterFilter, DBMS
 */

"use strict";

((exports) => {

    const state = {};
    
    exports.init = function () {
        var root = state;
        root.views = {};
        var nav = ".groups-tab .sub-tab-navigation";
        var content = ".groups-tab .sub-tab-content";
        var containers = {
            root: root,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
        Utils.addView(containers, "group-profile", GroupProfile,{mainPage:true});
        Utils.addView(containers, "group-schema", GroupSchema);
        Utils.addView(containers, "investigation-board", InvestigationBoard);
    
        listen(queryEl(".groups-tab .create-entity-button"), "click", exports.createGroup(".groups-tab", exports.refresh));
        listen(queryEl(".groups-tab .rename-entity-button"), "click", exports.renameGroup(".groups-tab", exports.refresh));
        listen(queryEl(".groups-tab .remove-entity-button"), "click", exports.removeGroup(".groups-tab", exports.refresh));
    
        exports.content = queryEl(".groups-tab");
    };
    
    exports.refresh = function () {
        PermissionInformer.getEntityNamesArray('group', true, Utils.processError(function(names){
            rebuildInterface(".groups-tab", names);
            state.currentView.refresh();
        }));
    };
    
    var rebuildInterface = function (selector, names) {
        var data = getSelect2Data(names);
        
        clearEl(queryEl(selector + " .rename-entity-select"));
        $(selector + " .rename-entity-select").select2(data);
        
        clearEl(queryEl(selector + " .remove-entity-select"));
        $(selector + " .remove-entity-select").select2(data);
    };
    
    exports.createGroup = function (selector, refresh) {
        return function(){
            var input = queryEl(selector + " .create-entity-input");
            
            DBMS.createGroup(input.value.trim(), function(err){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.refresh(function(err){
                    if(err) {Utils.handleError(err); return;}
    //                    if(Groups.currentView.updateSettings){
    //                        Groups.currentView.updateSettings(name);
    //                    }
                    input.value = '';
                    refresh();
                });
            });
        }
    };
    
    exports.renameGroup = function (selector, refresh) {
        return function(){
            var toInput = queryEl(selector + " .rename-entity-input");
            var fromName = queryEl(selector + " .rename-entity-select").value.trim();
            DBMS.renameGroup(fromName, toInput.value.trim(), function(err){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.refresh(function(err){
                    if(err) {Utils.handleError(err); return;}
    //                        if(Groups.currentView.updateSettings){
    //                            Groups.currentView.updateSettings(toName);
    //                        }
                    toInput.value = '';
                    refresh();
                });
            });
        }
    };
    
    exports.removeGroup = function (selector, refresh) {
        return function(){
            var name = queryEl(selector + " .remove-entity-select").value.trim();
            Utils.confirm(strFormat(getL10n("groups-are-you-sure-about-group-removing"),[name]), () => {
                DBMS.removeGroup(name, function(err){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.refresh(function(err){
                        if(err) {Utils.handleError(err); return;}
                        refresh();
                    });
                });
            });
        }
    };

})(this.Groups = {});
