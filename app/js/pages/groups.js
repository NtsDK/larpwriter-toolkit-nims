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
 Utils, CharacterProfile, CharacterFilter, CharacterProfileConfigurer, DBMS
 */

"use strict";

var Groups = {};

Groups.init = function () {
    "use strict";
    var root = Groups;
    root.views = {};
    var nav = ".groups-tab .sub-tab-navigation";
    var content = ".groups-tab .sub-tab-content";
    var containers = {
        root: root,
        navigation: queryEl(nav),
        content: queryEl(content)
    };
    Utils.addView(containers, "group-profile", GroupProfile);
    Utils.addView(containers, "group-schema", GroupSchema);
    Utils.addView(containers, "investigation-board", InvestigationBoard,{mainPage:true});

    listen(queryEl(".groups-tab .create-entity-button"), "click", Groups.createGroup(".groups-tab", Groups.refresh));
    listen(queryEl(".groups-tab .rename-entity-button"), "click", Groups.renameGroup(".groups-tab", Groups.refresh));
    listen(queryEl(".groups-tab .remove-entity-button"), "click", Groups.removeGroup(".groups-tab", Groups.refresh));

    Groups.content = queryEl(".groups-tab");
};

Groups.refresh = function () {
    "use strict";
    PermissionInformer.getGroupNamesArray(true, Utils.processError(function(names){
        Groups.rebuildInterface(".groups-tab", names);
        Groups.currentView.refresh();
    }));
};

Groups.rebuildInterface = function (selector, names) {
    "use strict";
    
    var data = getSelect2Data(names);
    
    clearEl(queryEl(selector + " .rename-entity-select"));
    $(selector + " .rename-entity-select").select2(data);
    
    clearEl(queryEl(selector + " .remove-entity-select"));
    $(selector + " .remove-entity-select").select2(data);
};

Groups.createGroup = function (selector, refresh) {
    "use strict";
    return function(){
        var name = queryEl(selector + " .create-entity-input").value.trim();
        
        if (name === "") {
            Utils.alert(getL10n("groups-group-name-is-not-specified"));
            return;
        }
        
        DBMS.isGroupNameUsed(name, function(err, isGroupNameUsed){
            if(err) {Utils.handleError(err); return;}
            if (isGroupNameUsed) {
                Utils.alert(strFormat(getL10n("groups-group-name-already-used"), [name]));
                return;
            } 
            DBMS.createGroup(name, function(err){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.refresh(function(err){
                    if(err) {Utils.handleError(err); return;}
//                    if(Groups.currentView.updateSettings){
//                        Groups.currentView.updateSettings(name);
//                    }
                    refresh();
                });
            });
        });
    }
};

Groups.renameGroup = function (selector, refresh) {
    "use strict";
    return function(){
        var fromName = queryEl(selector + " .rename-entity-select").value.trim();
        var toName = queryEl(selector + " .rename-entity-input").value.trim();
        
        if (toName === "") {
            Utils.alert(getL10n("groups-new-group-name-is-not-specified"));
            return;
        }
        
        if (fromName === toName) {
            Utils.alert(getL10n("groups-names-are-the-same"));
            return;
        }
        
        DBMS.isGroupNameUsed(toName, function(err, isGroupNameUsed){
            if(err) {Utils.handleError(err); return;}
            if (isGroupNameUsed) {
                Utils.alert(strFormat(getL10n("groups-group-name-already-used"), [toName]));
            } else {
                DBMS.renameGroup(fromName, toName, function(err){
                    if(err) {Utils.handleError(err); return;}
                    PermissionInformer.refresh(function(err){
                        if(err) {Utils.handleError(err); return;}
//                        if(Groups.currentView.updateSettings){
//                            Groups.currentView.updateSettings(toName);
//                        }
                        refresh();
                    });
                });
            }
        });
    }
};

Groups.removeGroup = function (selector, refresh) {
    "use strict";
    return function(){
        var name = queryEl(selector + " .remove-entity-select").value.trim();
        
        if (Utils.confirm(strFormat(getL10n("groups-are-you-sure-about-group-removing"),[name]))) {
            DBMS.removeGroup(name, function(err){
                if(err) {Utils.handleError(err); return;}
                PermissionInformer.refresh(function(err){
                    if(err) {Utils.handleError(err); return;}
                    refresh();
                });
            });
        }
    }
};
