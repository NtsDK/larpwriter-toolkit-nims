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
 Utils, DBMS
 */


"use strict";

(function(exports){
    
    var root = ".enter-tab ";
    
    exports.init = function () {
        $(document.forms['login-form']).on('submit', submit);
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {

    };
            
    var submit = function() {
        var form = $(this);

        $('.error', form).html('');
        $(":submit", form).button("loading");

        var request = $.ajax({
            url : "/login",
            method : "POST",
            data : form.serialize(),
            complete : function() {
                $(":submit", form).button("reset");
            },
//             statusCode : {
//                 200 : function() {
//                 },
//                 403 : function(jqXHR) {
//                     var error = JSON.parse(jqXHR.responseText);
//                     $('.error', form).html(error.message);
//                 }
//             }
        });
        request.done(function(data) {
            form.html("Вы вошли в сайт").addClass('alert-success');
//             //window.location.href = "/chat";
//             window.location.href = "/nims.html";
            window.location.href = "/page.html";
        });
        
        request.fail(function(errorInfo, textStatus, errorThrown) {
            var msg;
            try {
                msg = Utils.handleErrorMsg(JSON.parse(errorInfo.responseText));
            } catch(err){
                msg = Utils.handleErrorMsg(errorInfo.responseText || textStatus || 'error');
            }
//             var error = JSON.parse(jqXHR.responseText);
//             $('.error', form).html(error.message); 
//            $('.error', form).html(textStatus); 
            $('.error', form).html(msg); 
        });
        
        return false;
    };
    
})(this['Enter']={});