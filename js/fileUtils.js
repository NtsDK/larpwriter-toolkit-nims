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
 Utils, saveAs, FileReader, Blob
 */

"use strict";

var FileUtils = {};

FileUtils.init = function (callback) {
    "use strict";
    FileUtils.callback = callback;
};

FileUtils.makeNewBase = function () {
    "use strict";
    if(Utils.confirm("Вы уверены, что хотите создать новую базу? Все несохраненные изменения будут потеряны.")) {
        "use strict";
        DBMS.setDatabase(EmptyBase.data, FileUtils.callback);
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
            var database = JSON.parse(contents);
            DBMS.setDatabase(database, FileUtils.callback);
        };
        r.readAsText(f);
    } else {
        Utils.alert("Ошибка при загрузке файла");
    }
};

FileUtils.saveFile = function () {
    "use strict";
    DBMS.getDatabase(function(err, database){
    	if(err) {Utils.handleError(err); return;}
    	FileUtils.json2File(database, "nims-base.json");
    });
};

FileUtils.json2File = function (str, fileName) {
    "use strict";
    FileUtils.str2File(JSON.stringify(str, null, '  '), fileName);
};

FileUtils.str2File = function (str, fileName) {
    "use strict";
    var blob = new Blob([ str ], {
        type : "text/plain;charset=utf-8"
    });
    saveAs(blob, fileName);
};

