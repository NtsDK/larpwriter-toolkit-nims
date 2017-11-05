/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

const LogViewer2 = {};

LogViewer2.init = function () {
    const root = LogViewer2;
    root.views = {};
    const nav = '.log-viewer2-tab .sub-tab-navigation';
    const content = '.log-viewer2-tab .sub-tab-content';
    const containers = {
        root,
        navigation: queryEl(nav),
        content: queryEl(content)
    };
    Utils.addView(containers, 'logViewer', LogViewer, { mainPage: true });
    Utils.addView(containers, 'about', About);

    LogViewer2.content = queryEl('.log-viewer2-tab');
};

LogViewer2.refresh = function () {
    LogViewer2.currentView.refresh();
};
