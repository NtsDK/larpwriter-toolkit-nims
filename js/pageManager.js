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
    var button;
    var navigation = document.getElementById(nav);
    Utils.addView(root, "Overview", Overview, "Обзор", nav, content, true);
    Utils.addView(root, "Characters", Characters, "Персонажи", nav, content);
    Utils.addView(root, "Stories", Stories, "Истории", nav, content);
    Utils.addView(root, "Events", Events, "События", nav, content);
    Utils.addView(root, "Briefings", Briefings, "Вводные", nav, content);
    
    button = document.createElement("div");
    addClass(button, "nav-separator");
    navigation.appendChild(button);
    
    Utils.addView(root, "Timeline", Timeline, "Хронология", nav, content);
    Utils.addView(root, "SocialNetwork", SocialNetwork, "Социальная сеть", nav,
            content);
    Utils.addView(root, "CharacterFilter", CharacterFilter, "Фильтр", nav,
            content);

    button = document.createElement("div");
    addClass(button, "nav-separator");
    navigation.appendChild(button);
    
    button = document.createElement("div");
    button.id = "dataLoadButton";
    addClass(button, "action-button");
        var input = document.createElement("input");
        input.type = "file";
        button.appendChild(input);
    navigation.appendChild(button);

    button = document.createElement("div");
    addClass(button, "action-button");
    button.id = "dataSaveButton";
    navigation.appendChild(button);
    
    button = document.createElement("div");
    button.id = "newBaseButton";
    addClass(button, "action-button");
    navigation.appendChild(button);

    button = document.createElement("div");
    button.id = "mainHelpButton";
    addClass(button, "action-button");
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
