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
    
    var root = ".other-tab ";

    exports.init = function() {
        exports.content = queryEl(root);
        
        listen(queryEl(root + '.apply-influence-button'), 'click', applyInfluence);
    };
    
    exports.refresh = function() {
    };
    
    var applyInfluence = () => {
        var input = queryEl(root + '.power');
        navigator.geolocation.getCurrentPosition(function(position) {
            DBMS.applyInfluence(Number(input.value), position.coords.latitude, position.coords.longitude, (err) => {
                if(err) {Utils.handleError(err); return;}
                Utils.alert('Воздействие применено');
            })
        });
    };

})(this['Other']={});