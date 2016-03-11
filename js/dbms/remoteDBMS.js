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
        cache: false,
    });
    
    request.done(function(data) {
        callback(null, JSON.parse(data));
    });
    
    request.fail(function(errorInfo, textStatus, errorThrown) {
        try {
            callback(JSON.parse(errorInfo.responseText));
        } catch(err){
            callback(errorInfo.responseText);
        }
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
        try {
            callback(JSON.parse(errorInfo.responseText));
        } catch(err){
            callback(errorInfo.responseText);
        }
    });
};


Object.keys(LocalDBMS.prototype).forEach(function(name){
	RemoteDBMS.prototype[name] = function(){
		var arr = [];
		for (var i = 0; i < arguments.length-1; i++) {
			arr.push(arguments[i]);
		}
		if(CommonUtils.startsWith(name, "get") || CommonUtils.startsWith(name, "is")){
			RemoteDBMS._simpleGet(name, arr, arguments[arguments.length-1]);
		} else {
			RemoteDBMS._simplePut(name, arr, arguments[arguments.length-1]);
		}
	}
});


RemoteDBMS.prototype.clearSettings = function() {
	"use strict";
	this.Settings = {
		"BriefingPreview" : {},
		"Stories" : {},
		"CharacterProfile" : {}
	};
};

RemoteDBMS.prototype.getSettings = function(){
    "use strict";
    return this.Settings;
};