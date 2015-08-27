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
    Utils.addView(root, "BriefingPreview", BriefingPreview, "Предварительный просмотр", nav, content, true);
    Utils.addView(root, "BriefingExport", BriefingExport, "Экспорт", nav,content);

    Briefings.content = document.getElementById("briefingsDiv");
};

Briefings.refresh = function () {
    "use strict";
    Briefings.currentView.refresh();
};
