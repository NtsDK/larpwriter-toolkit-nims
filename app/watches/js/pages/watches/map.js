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
    
    var root = ".map-tab ";
    var state = {};

    exports.init = function() {
        
//        Influences.initMap('analyst-map', state, root);
        
        exports.content = queryEl(root);
    };
    
    exports.refresh = function() {
//        DBMS.getInfluences(function(err, influences){
//            if(err) {Utils.handleError(err); return;}
////            influences.sort(CommonUtils.charOrdAFactoryBase('desc', a => new Date(a.time)));
//            var now = Date.now();
//            var activeInfluences = Influences.getActiveInfluences(influences, now);
//            Influences.fillMap(activeInfluences, state);
//        });
    };

})(this['Map']={});