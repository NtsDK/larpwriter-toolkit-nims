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
 Utils, Database, DBMS, StoryEvents, StoryCharacters, EventPresence
 */

"use strict";

var Stories = {};

Stories.init = function () {
    "use strict";
    var root = Stories;
    root.views = {};
    var nav = "storiesNavigation";
    var content = "storiesContent";
    Utils.addView(root, "StoryEvents", StoryEvents, "События", nav, content);
    Utils.addView(root, "StoryCharacters", StoryCharacters, "Персонажи", nav, content, true);
    Utils.addView(root, "EventPresence", EventPresence, "Присутствие", nav, content);

    var selector = document.getElementById("storySelector");
    selector.addEventListener("change", Stories.onStorySelectorChangeDelegate);

    var button = document.getElementById("createStoryButton");
    button.addEventListener("click", Stories.createStory);

    button = document.getElementById("renameStoryButton");
    button.addEventListener("click", Stories.renameStory);

    button = document.getElementById("removeStoryButton");
    button.addEventListener("click", Stories.removeStory);

    button = document.getElementById("masterStoryArea");
    button.addEventListener("change", Stories.updateMasterStory);

    Stories.content = document.getElementById("storiesDiv");
};

Stories.refresh = function () {
    "use strict";
    var selector1 = document.getElementById("storySelector");
    Utils.removeChildren(selector1);
    var selector2 = document.getElementById("fromStory");
    Utils.removeChildren(selector2);
    var selector3 = document.getElementById("storyRemoveSelector");
    Utils.removeChildren(selector3);

    var storyNames = DBMS.getStoryNamesArray();
    
    if (storyNames.length > 0) {
        if(!Database.Settings["Stories"]){
            Database.Settings["Stories"] = {
                storyName : storyNames[0]
            };
        }
        var storyName = Database.Settings["Stories"].storyName;
        if(storyNames.indexOf(storyName) === -1){
            Database.Settings["Stories"].storyName = storyNames[0];
            storyName = storyNames[0];
        }
        
        var first = true;
        storyNames.forEach(function (name) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(name));
            selector1.appendChild(option);
            if(name === storyName){
                option.selected = true;
                first = false;
            }
            option = document.createElement("option");
            option.appendChild(document.createTextNode(name));
            selector2.appendChild(option);
            option = document.createElement("option");
            option.appendChild(document.createTextNode(name));
            selector3.appendChild(option);
        });
        
        Stories.onStorySelectorChange(storyName);
    } else {
        Stories.onStorySelectorChange();
    }


    Stories.currentView.refresh();
};

Stories.createStory = function () {
    "use strict";
    var storyName = document.getElementById("createStoryName").value.trim();
    if (storyName === "") {
        Utils.alert("Название истории пусто.");
        return;
    }

    if (Database.Stories[storyName]) {
        Utils.alert("История с таким именем уже существует.");
        return;
    }

    Database.Stories[storyName] = {
        name : storyName,
        story : "",
        characters : {},
        events : []
    };

    Stories.CurrentStory = Database.Stories[storyName];
    Stories.refresh();

};

Stories.renameStory = function () {
    "use strict";
    var fromName = document.getElementById("fromStory").value.trim();
    var toName = document.getElementById("toStory").value.trim();

    if (toName === "") {
        Utils.alert("Новое имя не указано.");
        return;
    }

    if (fromName === toName) {
        Utils.alert("Имена совпадают.");
        return;
    }

    if (Database.Stories[toName]) {
        Utils.alert("Имя " + toName + " уже используется.");
        return;
    }

    var data = Database.Stories[fromName];
    data.name = toName;
    Database.Stories[toName] = data;
    delete Database.Stories[fromName];
    Stories.refresh();

};

Stories.removeStory = function () {
    "use strict";
    var name = document.getElementById("storyRemoveSelector").value.trim();

    if (Utils.confirm("Вы уверены, что хотите удалить историю " + name
            + "? Все данные связанные с историей будут удалены безвозвратно.")) {
        delete Database.Stories[name];
        Stories.refresh();
    }
};

Stories.onStorySelectorChangeDelegate = function (event) {
    "use strict";
    var storyName = event.target.value;
    Stories.onStorySelectorChange(storyName);
};

Stories.onStorySelectorChange = function (storyName) {
    "use strict";
    Stories.CurrentStory = Database.Stories[storyName];
    var storyArea = document.getElementById("masterStoryArea");
    
    if(Stories.CurrentStory){
        Database.Settings["Stories"].storyName = storyName;
        storyArea.value = Stories.CurrentStory.story;
    } else {
        Database.Settings["Stories"].storyName = null;
        storyArea.value = "";
    }

    Stories.currentView.refresh();
};

Stories.updateMasterStory = function () {
    "use strict";
    var storyArea = document.getElementById("masterStoryArea");
    Stories.CurrentStory.story = storyArea.value;
};
