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

var Chat = {};

Chat.init = function() {
    "use strict";
    
    var button = document.getElementById("sendMessageButton");
    button.addEventListener("click", Chat.onSubmit);
    
//    Chat.subscribe();

    Chat.content = document.getElementById("chatDiv");;
};

Chat.refresh = function() {
    "use strict";

};

Chat.onSubmit = function() {
	var chatMessage = document.getElementById("chatMessage");
	
	var request = $.ajax({
		url : "/publish",
		dataType : "text",
		method : "PUT",
		contentType : "application/json;charset=utf-8",
		data : JSON.stringify({
			message : chatMessage.value
		})
	});

	request.done(function(data) {
	});

	request.fail(function(errorInfo, textStatus, errorThrown) {
		alert(errorInfo.responseText);
	});

	chatMessage.value = '';

	return false;
};

Chat.subscribe = function() {

	var request = $.ajax({
		url : "/subscribe",
		dataType : "text",
		method : "GET",
		contentType : "application/json;charset=utf-8",
	});

	request.done(function(data) {
		var li = document.createElement('li');
		li.appendChild(document.createTextNode(data));
		messages.appendChild(li);
		Chat.subscribe();
	});

	request.fail(function(errorInfo, textStatus, errorThrown) {
		setTimeout(Chat.subscribe, 500);
	});
}