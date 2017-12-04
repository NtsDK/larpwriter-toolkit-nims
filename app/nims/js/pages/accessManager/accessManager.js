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
 Utils
 */

"use strict";

(function(exports){

    var state = {};
    state.views = {};
    var root = '.access-manager-tab '

    exports.init = function () {
        var containers = {
            root: state,
            navigation: queryEl(root + ' .navigation'),
            content: queryEl(root + ' .content')
        };

        Utils.addView(containers, "masterManagement", MasterManagement, {mainPage:true});
        Utils.addView(containers, "playerManagement", PlayerManagement);

        exports.content = queryEl(root);
    };

    exports.refresh = function () {
        state.currentView.refresh();
    };

})(this['AccessManager']={});
