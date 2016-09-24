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
 Utils, DBMS
 */

"use strict";

var GroupProfile = {};

GroupProfile.profileSettings = [{
    name: "filterModel",
    type: "container",
},{
    name: "masterDescription",
    type: "text",
},{
    name: "doExport",
    type: "checkbox",
},{
    name: "characterDescription",
    type: "text",
}];

GroupProfile.init = function () {
    "use strict";
    listen(queryEl(".group-profile-tab .entity-selector"), "change", GroupProfile.showProfileInfoDelegate);
    
    var tbody = clearEl(queryEl(".group-profile-tab .entity-profile"));
    
    GroupProfile.inputItems = {};
    
    GroupProfile.profileSettings.forEach(function (profileSettings) {
        profileSettings.displayName = getL10n("groups-" + profileSettings.name);
        addEl(tbody, GroupProfile.makeInput(profileSettings));
    });
    
    GroupProfile.content = queryEl(".group-profile-tab");
};

GroupProfile.refresh = function () {
    PermissionInformer.getGroupNamesArray(false, function(err, groupNames){
        if(err) {Utils.handleError(err); return;}
        
        var sel = clearEl(queryEl(".group-profile-tab .entity-selector"));
        fillSelector(sel, groupNames.map(remapProps4Select));
        
        GroupProfile.applySettings(groupNames, sel);
        
    });
};

GroupProfile.applySettings = function (names, selector) {
    "use strict";
    if (names.length > 0) {
        var name = names[0].value;
        var settings = DBMS.getSettings();
        if(!settings["GroupProfile"]){
            settings["GroupProfile"] = {
                groupName : name
            };
        }
        var groupName = settings["GroupProfile"].groupName;
        if(names.map(function(nameInfo){return nameInfo.value;}).indexOf(groupName) === -1){
            settings["GroupProfile"].groupName = name;
            groupName = name;
        }
        DBMS.getGroup(groupName, GroupProfile.showProfileInfoCallback);
        selector.value = groupName;
    }
};

GroupProfile.makeInput = function (profileItemConfig) {
    "use strict";
    var tr = makeEl("tr");
    var td = makeEl("td");
    td.appendChild(makeText(profileItemConfig.displayName));
    tr.appendChild(td);

    td = makeEl("td");
    
    var input, values;

    switch (profileItemConfig.type) {
    case "text":
        input = makeEl("textarea");
        addClass(input, "profileTextInput");
        input.addEventListener("change", GroupProfile.updateFieldValue(profileItemConfig.type));
        break;
    case "checkbox":
        input = makeEl("input");
        input.type = "checkbox";
        input.addEventListener("change", GroupProfile.updateFieldValue(profileItemConfig.type));
        break;
    case "container":
        input = makeEl("div");
        input.type = "container";
        break;
    }
    input.selfName = profileItemConfig.name;
    addClass(input,"isGroupEditable");
    td.appendChild(input);
    GroupProfile.inputItems[profileItemConfig.name] = input;

    tr.appendChild(td);
    return tr;
};

GroupProfile.updateFieldValue = function(type){
    "use strict";
    return function(event){
        var fieldName = event.target.selfName;
        var groupName = GroupProfile.name;
        
        var value;
        switch(type){
        case "text":
            value = event.target.value;
            break;
        case "checkbox":
            value = event.target.checked;
            break;
        }
        DBMS.updateGroupField(groupName, fieldName, value, Utils.processError());
    }
}

GroupProfile.showProfileInfoDelegate = function (event) {
    var name = event.target.value.trim();
    DBMS.getGroup(name, GroupProfile.showProfileInfoCallback);
};

GroupProfile.showProfileInfoCallback = function (err, group) {
    if(err) {Utils.handleError(err); return;}
    var name = group.name;
    PermissionInformer.isGroupEditable(name, function(err, isGroupEditable){
        if(err) {Utils.handleError(err); return;}
        CharacterProfile.updateSettings(name);
        
        GroupProfile.name = name;
        var inputItems = GroupProfile.inputItems;
        Object.keys(inputItems).forEach(function (inputName) {
            if (inputItems[inputName].type === "checkbox") {
                inputItems[inputName].checked = group[inputName];
            } else if (inputItems[inputName].type === "container") {
                addEl(clearEl(inputItems[inputName]), makeText(JSON.stringify(group.filterModel)));
            } else {
                inputItems[inputName].value = group[inputName];
            }
            inputItems[inputName].oldValue = group[inputName];
            Utils.enable(GroupProfile.content, "isGroupEditable", isGroupEditable);
        });
    });
};

GroupProfile.updateSettings = function (name) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["GroupProfile"].groupName = name;
};
