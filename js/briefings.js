Briefings = {};

Briefings.init = function() {
    var root = Briefings;
    root.views = {};
    var nav = "briefingsNavigation";
    var content = "briefingsContent";
    Utils.addView(root, "BriefingPreview", BriefingPreview,
            "Предварительный просмотр", nav, content, true);
    Utils.addView(root, "BriefingExport", BriefingExport, "Экспорт", nav,
            content);

    Briefings.content = document.getElementById("briefingsDiv");
};

Briefings.refresh = function() {
    Briefings.currentView.refresh();
};
