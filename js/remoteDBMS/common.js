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
 Utils, Database, Migrator
 */
"use strict";

//var url = "http://127.0.0.1:1337/"
	var url = "/"

function RemoteDBMS(){
    this.clearSettings();
};

RemoteDBMS.prototype.clearSettings = function(){
    "use strict";
    this.Settings = {
            "Events" : {
            },
            "BriefingPreview" : {
            },
            "Stories" : {
            },
            "CharacterProfile" : {
            }
      };
};

RemoteDBMS._simpleGet = function(name, params, callback){
    "use strict";
    var paramStr = "";
    if(params){
    	paramStr = "?params=" + encodeURIComponent(JSON.stringify(params)); ; 
    }
    
    var request = $.ajax({
        url : url + name + paramStr,
        dataType : "text",
        method : "GET",
        contentType : "application/json;charset=utf-8",
    });
    
    request.done(function(data) {
        callback(JSON.parse(data));
    });
    
    request.fail(function(errorInfo, textStatus, errorThrown) {
        alert("Ошибка : " + errorInfo.responseText);
    });
};

RemoteDBMS._simplePut = function(name, data, callback){
    "use strict";
    var request = $.ajax({
        url : url + name,
        dataType : "text",
        method : "PUT",
        contentType : "application/json;charset=utf-8",
        data: JSON.stringify(data)
    });
    
    request.done(function(data) {
        if(callback) callback();
    });
    
    request.fail(function(errorInfo, textStatus, errorThrown) {
        alert("Ошибка : " + errorInfo.responseText);
    });
};


RemoteDBMS.prototype.getDatabase = function(callback){
    "use strict";
    RemoteDBMS._simpleGet("getDatabase", null, callback);
};

RemoteDBMS.prototype.setDatabase = function(database, callback){
    "use strict";
    var that = this;
    RemoteDBMS._simplePut("setDatabase", [database], function(){
        that.clearSettings();
        callback();
    });
};

RemoteDBMS.prototype.newDatabase = function(callback){
    "use strict";
    var request = $.ajax({
        url : url + "newDatabase",
        dataType : "text",
        method : "POST",
        contentType : "application/json;charset=utf-8",
        data: "{}"
    });
    
    var that = this;
    request.done(function(data) {
        that.clearSettings();
        callback();
    });
    
    request.fail(function(errorInfo, textStatus, errorThrown) {
        alert("Ошибка : " + errorInfo.responseText);
    });
};

RemoteDBMS.prototype.getMetaInfo = function(callback){
    "use strict";
    RemoteDBMS._simpleGet("getMetaInfo", null,  callback);
};
// overview
RemoteDBMS.prototype.setMetaInfo = function(name, value){
    "use strict";
    RemoteDBMS._simplePut("setMetaInfo", [name, value]);
};

RemoteDBMS.prototype.getSettings = function(){
    "use strict";
    return this.Settings;
};

RemoteDBMS.prototype.getCharacterNamesArray = function (callback) {
    "use strict";
    RemoteDBMS._simpleGet("getCharacterNamesArray", null,  callback);
};

// stories, timeline
RemoteDBMS.prototype.getStoryNamesArray = function (callback) {
    "use strict";
    RemoteDBMS._simpleGet("getStoryNamesArray", null,  callback);
};

RemoteDBMS.prototype.getAllProfileSettings = function(callback){
    "use strict";
    RemoteDBMS._simpleGet("getAllProfileSettings", null,  callback);
};

