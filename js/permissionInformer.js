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
 */

"use strict";

var PermissionInformer = {};

PermissionInformer.summary = {
//		isAdmin: true
};


if(MODE === "NIMS_Server"){
	PermissionInformer.refresh = function(callback) {
		var request = $.ajax({
			url : "/getPermissionsSummary",
			dataType : "text",
			method : "GET",
			contentType : "application/json;charset=utf-8",
		});
		
		request.done(function(data) {
			PermissionInformer.summary = JSON.parse(data);
			if(callback){
				callback();
			} else {
				PermissionInformer.subscribe();
			}
//		alert(data);
//		alert(PermissionInformer.summary);
		});
		
		request.fail(function(errorInfo, textStatus, errorThrown) {
			if(callback){
				callback(errorInfo.responseText);
			} else {
				setTimeout(PermissionInformer.subscribe, 500);
			}
		});
	};
	
	PermissionInformer.subscribe = function() {
		
		var request = $.ajax({
			url : "/subscribeOnPermissionsUpdate",
			dataType : "text",
			method : "GET",
			contentType : "application/json;charset=utf-8",
		});
		
		request.done(function(data) {
			PermissionInformer.summary = JSON.parse(data);
//		alert(data);
//		alert(PermissionInformer.summary);
			PermissionInformer.subscribe();
		});
		
		request.fail(function(errorInfo, textStatus, errorThrown) {
			setTimeout(PermissionInformer.subscribe, 500);
		});
	};
	
	PermissionInformer.refresh();

	PermissionInformer.isAdmin = function(callback){
		callback(null, PermissionInformer.summary.isAdmin);
	};
	
	PermissionInformer.isCharacterEditable = function(characterName, callback){
		var isEditor = PermissionInformer.summary.isEditor;
		var userCharacters = PermissionInformer.summary.userCharacters;
		callback(null, isEditor || userCharacters.indexOf(characterName) !== -1);
	};
	
	PermissionInformer.isStoryEditable = function(storyName, callback){
		var isEditor = PermissionInformer.summary.isEditor;
		var userStories = PermissionInformer.summary.userStories;
		callback(null, isEditor || userStories.indexOf(storyName) !== -1);
	};
	
	PermissionInformer.getCharacterNamesArray = function(editableOnly, callback){
		var newNames = [];
		var userCharacters = PermissionInformer.summary.userCharacters;
		var isEditor = PermissionInformer.summary.isEditor;
		var allCharacters = PermissionInformer.summary.allCharacters;
		var ownerMap = PermissionInformer.summary.characterOwnerMap;
		allCharacters.filter(function(name){
			if(editableOnly){
				return isEditor || userCharacters.indexOf(name) !== -1;
			} else {
				return true;
			}
		}).forEach(function(name){
			newNames.push({
				displayName:ownerMap[name] + ". " + name,
				value:name,
				editable: isEditor || userCharacters.indexOf(name) !== -1
			});
		});
		
		newNames.sort(Utils.charOrdAObject);
		
		callback(null, newNames);
	};
	
	PermissionInformer.getStoryNamesArray = function(editableOnly, callback){
		var newNames = [];
		var userStories = PermissionInformer.summary.userStories;
		var isEditor = PermissionInformer.summary.isEditor;
		var allStories = PermissionInformer.summary.allStories;
		var ownerMap = PermissionInformer.summary.storiesOwnerMap;
		allStories.filter(function(name){
			if(editableOnly){
				return isEditor || userStories.indexOf(name) !== -1;
			} else {
				return true;
			}
		}).forEach(function(name){
			newNames.push({
				displayName:ownerMap[name] + ". " + name,
				value:name,
				editable: isEditor || userStories.indexOf(name) !== -1
			});
		});
		
		newNames.sort(Utils.charOrdAObject);
		
		callback(null, newNames);
	};
	
//	PermissionInformer.getCharacterOwnerMap = function(callback){
//		callback(null, PermissionInformer.summary.characterOwnerMap);
//	};
	
//	PermissionInformer.getUserStories = function(callback){
//		callback(null, PermissionInformer.summary.userStories);
//	};
} else {
	
	PermissionInformer.refresh = function(callback) {
		callback();
	};
	
	PermissionInformer.isAdmin = function(callback){
		callback(null, true);
	};
	
	PermissionInformer.getCharacterNamesArray = function(editableOnly, callback){
		DBMS.getCharacterNamesArray(function(err, names){
			if(err) {Utils.handleError(err); return;}
			var newNames = [];
			names.forEach(function(name){
				newNames.push({
					displayName:name,
					value:name,
					editable: true
				});
			});
			callback(null, newNames);
		});
	};
	
	PermissionInformer.getStoryNamesArray = function(editableOnly, callback){
		DBMS.getStoryNamesArray(function(err, names){
			if(err) {Utils.handleError(err); return;}
			var newNames = [];
			names.forEach(function(name){
				newNames.push({
					displayName:name,
					value:name,
					editable: true
				});
			});
			callback(null, newNames);
		});
	};
	
	PermissionInformer.isCharacterEditable = function(characterName, callback){
		callback(null, true);
	};
	PermissionInformer.isStoryEditable = function(storyName, callback){
		callback(null, true);
	};
	
//	PermissionInformer.getCharacterOwnerMap = function(callback){
//		DBMS.getCharacterNamesArray(function(err, characterNames){
//			if(err) {Utils.handleError(err); return;}
//			var ownerMap = {};
//			characterNames.forEach(function(elem){
//				ownerMap[elem] = "";
//			});
//			callback(null, ownerMap);
//		});
//	};
	
//	PermissionInformer.getUserStories = function(callback){
//		callback(null, PermissionInformer.summary.userStories);
//	};
}

