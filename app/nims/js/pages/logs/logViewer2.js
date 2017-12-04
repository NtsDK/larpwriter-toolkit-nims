/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

((exports) => {
    const state = {};

    exports.init = () => {
        state.views = {};
        const nav = '.log-viewer2-tab .sub-tab-navigation';
        const content = '.log-viewer2-tab .sub-tab-content';
        const containers = {
            root: state,
            navigation: queryEl(nav),
            content: queryEl(content)
        };
        Utils.addView(containers, 'logViewer', LogViewer, { mainPage: true });
        Utils.addView(containers, 'about', About);

        exports.content = queryEl('.log-viewer2-tab');
    };

    exports.refresh = () => {
        state.currentView.refresh();
    };
})(this.LogViewer2 = {});