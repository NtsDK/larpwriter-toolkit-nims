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

var Overview = {};

Overview.init = function() {
    "use strict";
    var overviewDiv = document.createElement("div");
    overviewDiv.id = overviewDiv;
    overviewDiv.appendChild(document.createTextNode("Overview"));

    Overview.content = overviewDiv;
};

Overview.refresh = function() {
    "use strict";

};