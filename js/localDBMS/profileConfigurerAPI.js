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

//profile configurer
LocalDBMS.prototype.createProfileItem= function(name, type, value, toEnd, selectedIndex, callback){
    "use strict";
    var profileItem = {
        name : name,
        type : type,
        value : value
    };
    
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        that.database.Characters[characterName][name] = value;
    });
    
    if (toEnd) {
        this.database.ProfileSettings.push(profileItem);
    } else {
        this.database.ProfileSettings.splice(selectedIndex, 0, profileItem);
    }
    callback();
};

//profile configurer
LocalDBMS.prototype.swapProfileItems = function(index1,index2, callback){
    "use strict";
    var tmp = this.database.ProfileSettings[index1];
    this.database.ProfileSettings[index1] = this.database.ProfileSettings[index2];
    this.database.ProfileSettings[index2] = tmp;
    callback();
};
//profile configurer
LocalDBMS.prototype.removeProfileItem = function(index, name, callback){
    "use strict";
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        delete that.database.Characters[characterName][name];
    });
//    this.database.ProfileSettings.remove(index);
    CommonUtils.removeFromArrayByIndex(this.database.ProfileSettings, index);
//    this.database.ProfileSettings.remove(index);
    callback();
};
//profile configurer
LocalDBMS.prototype.changeProfileItemType = function(name, newType, callback){
    "use strict";
    
    var profileItem = this.database.ProfileSettings.filter(function(elem){
        return elem.name === name;
    })[0];
    
    profileItem.type = newType;
    profileItem.value = Constants.profileFieldTypes[newType].value;
    
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        that.database.Characters[characterName][name] = Constants.profileFieldTypes[newType].value;
    });
    callback();
};

//profile configurer
LocalDBMS.prototype.isProfileItemNameUsed = function(name, callback){
    "use strict";
    var nameUsedTest = function (profile) {
      return name === profile.name;
    };
    
    callback(this.database.ProfileSettings.some(nameUsedTest));
};

//profile configurer
LocalDBMS.prototype.renameProfileItem = function(newName, oldName, callback){
    "use strict";
    var that = this;
    Object.keys(this.database.Characters).forEach(function (characterName) {
        var tmp = that.database.Characters[characterName][oldName];
        delete that.database.Characters[characterName][oldName];
        that.database.Characters[characterName][newName] = tmp;
    });
    
    this.database.ProfileSettings.filter(function(elem){
        return elem.name === oldName;
    })[0].name = newName;
    callback();
};

//profile configurer
LocalDBMS.prototype.updateDefaultValue = function(name, value){
    "use strict";
    
    var info = this.database.ProfileSettings.filter(function(elem){
        return elem.name === name;
    })[0];
    
    var oldOptions, newOptions, newOptionsMap, missedValues;
    
    switch (info.type) {
    case "text":
    case "string":
    case "checkbox":
        info.value = value;
        break;
    case "number":
//        if (isNaN(value)) {
//            Utils.alert("Введено не число");
//            callback(info.value);
//            return;
//        }
        info.value = Number(value);
        break;
    case "enum":
//        if (value === "") {
//            Utils.alert("Значение поля с единственным выбором не может быть пустым");
//            callback(info.value);
//            return;
//        }
        oldOptions = info.value.split(",");
        newOptions = value.split(",");
        
        newOptions = newOptions.map(function(elem){
            return elem.trim();
        });
        
        newOptionsMap = [{}].concat(newOptions).reduce(function (a, b) {
            a[b] = true;
            return a;
        });
        
        missedValues = oldOptions.filter(function (oldOption) {
            return !newOptionsMap[oldOption];
        });
        
        if (missedValues.length !== 0) {
            info.value = newOptions.join(",");
            
            var that = this;
            Object.keys(this.database.Characters).forEach(function (characterName) {
                var enumValue = that.database.Characters[characterName][name];
                if (!newOptionsMap[enumValue]) {
                    that.database.Characters[characterName][name] = newOptions[0];
                }
            });
            
            return;
        }
        
        info.value = newOptions.join(",");
        break;
    }
};