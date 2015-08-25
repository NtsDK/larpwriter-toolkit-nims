/*global
PageManager, Utils, Overview, Characters, Stories, Events, Briefings, Timeline, SocialNetwork, FileUtils
 */

"use strict";

var PageManager = {};

PageManager.onLoad = function () {
    var root = PageManager;
    root.views = {};
    var nav = "navigation";
    var content = "contentArea";
    Utils.addView(root, "Overview", Overview, "Обзор", nav, content, true);
    Utils.addView(root, "Characters", Characters, "Персонажи", nav, content);
    Utils.addView(root, "Stories", Stories, "Истории", nav, content);
    Utils.addView(root, "Events", Events, "События", nav, content);
    Utils.addView(root, "Briefings", Briefings, "Вводные", nav, content);
    Utils.addView(root, "Timeline", Timeline, "Хронология", nav, content);
    Utils.addView(root, "SocialNetwork", SocialNetwork, "Социальная сеть", nav,
            content);

    var navigation = document.getElementById(nav);
    var button = document.createElement("input");
    button.type = "file";
    button.id = "dataLoadButton";
    navigation.appendChild(button);

    button = document.createElement("button");
    button.appendChild(document.createTextNode("Сохранить"));
    button.id = "dataSaveButton";
    navigation.appendChild(button);

    FileUtils.init();

    PageManager.currentView.refresh();
};

window.onbeforeunload = function (evt) {
    var message = "Убедитесь, что сохранили данные. После закрытия страницы все несохраненные изменения будут потеряны.";
    if (typeof evt == "undefined") {
        evt = window.event;
    }
    if (evt) {
        evt.returnValue = message;
    }
    return message;
};
