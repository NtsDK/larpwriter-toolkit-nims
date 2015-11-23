/*global
 Utils, PageManager, Database, saveAs, FileReader, Blob, Migrator
 */

"use strict";

var FileUtils = {};

FileUtils.init = function () {
    "use strict";
    document.getElementById('dataLoadButton').addEventListener('change', FileUtils.readSingleFile, false);

    var button = document.getElementById('dataSaveButton');
    button.addEventListener('click', FileUtils.saveFile);
    
    button = document.getElementById('newBaseButton');
    button.addEventListener('click', FileUtils.makeNewBase);

    button = document.getElementById('mainHelpButton');
    button.addEventListener('click', FileUtils.openHelp);
};

FileUtils.makeNewBase = function () {
    "use strict";
    if(Utils.confirm("Вы уверены, что хотите создать новую базу? Все несохраненные изменения будут потеряны.")) {
        Database = {
            "Meta": {
                "name" : "",
                "date" : "",
                "preGameDate" : "",
                "description" : ""
            },
            "Characters": {},
            "ProfileSettings" : [],
            "Stories": {},
            "Settings" : {
                "Events" : {
                },
                "BriefingPreview" : {
                },
                "Stories" : {
                },
                "CharacterProfile" : {
                }
            },
        };
        PageManager.currentView.refresh();
    }
    
};

FileUtils.openHelp = function () {
    "use strict";
    window.open("doc/nims.html");
};

FileUtils.readSingleFile = function (evt) {
    "use strict";
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            // Utils.alert("Got the file.n" + "name: " + f.name + "n" + "type: "
            // + f.type + "n" + "size: " + f.size + " bytesn"
            // + JSON.parse(contents)
            // // + "starts with: " + contents.substr(1, contents.indexOf("n"))
            // );
            Database = JSON.parse(contents);
            Database = Migrator.migrate(Database);
            PageManager.currentView.refresh();
            // onLoad();
        };
        r.readAsText(f);
    } else {
        Utils.alert("Failed to load file");
    }
};

FileUtils.saveFile = function () {
    "use strict";
    var blob = new Blob([ JSON.stringify(Database, null, '  ') ], {
        type : "text/plain;charset=utf-8"
    });
    saveAs(blob, "nims-base.json");
    // window.open("data:application/json;charset=utf-8," +
    // encodeURIComponent(JSON.stringify(Database, null, ' ')) );
    //window.open(document.getElementById("testst").toDataURL("image/png"))
};