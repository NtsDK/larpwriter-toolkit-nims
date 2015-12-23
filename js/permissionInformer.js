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

PermissionInformer.summary = null;

PermissionInformer.init = function() {
	var request = $.ajax({
		url : "/getPermissionsSummary",
		dataType : "text",
		method : "GET",
		contentType : "application/json;charset=utf-8",
	});

	request.done(function(data) {
		PermissionInformer.summary = JSON.parse(data);
		alert(data);
//		alert(PermissionInformer.summary);
		PermissionInformer.subscribe();
	});

	request.fail(function(errorInfo, textStatus, errorThrown) {
		setTimeout(PermissionInformer.subscribe, 500);
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
		alert(data);
//		alert(PermissionInformer.summary);
		PermissionInformer.subscribe();
	});

	request.fail(function(errorInfo, textStatus, errorThrown) {
		setTimeout(PermissionInformer.subscribe, 500);
	});
};

PermissionInformer.init();