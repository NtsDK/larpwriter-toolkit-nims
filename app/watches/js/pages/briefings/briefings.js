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
 Utils, BriefingPreview, BriefingExport
 */

"use strict";

var Briefings = {};

Briefings.init = function () {
    "use strict";
    var root = Briefings;
    root.views = {};
    var nav = "briefingsNavigation";
    var content = "briefingsContent";
    var containers = {
        root: root,
        navigation: getEl(nav),
        content: getEl(content)
    };
    Utils.addView(containers, "briefing-preview", BriefingPreview, {mainPage:true});
    Utils.addView(containers, "briefing-export", BriefingExport);

    Briefings.content = getEl("briefingsDiv");
};

Briefings.refresh = function () {
    "use strict";
    Briefings.currentView.refresh();
};
