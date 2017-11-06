/*Copyright 2015-2017 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

const FileUtils = {};

FileUtils.init = function (callback) {
    FileUtils.callback = callback;
};

FileUtils.makeNewBase = function () {
    Utils.confirm(getL10n('utils-new-base-warning'), () => {
        DBMS.setDatabase(CommonUtils.clone(EmptyBase.data), FileUtils.callback);
    });
};

FileUtils.openHelp = function () {
    window.open('extras/doc/nims.html');
};

FileUtils.readSingleFile = function (evt) {
    // Retrieve the first (and only!) File from the FileList object
    const f = evt.target.files[0];

    if (f) {
        const r = new FileReader();
        r.onload = function (e) {
            const contents = e.target.result;
            const database = JSON.parse(contents);
            DBMS.setDatabase(database, FileUtils.callback);
        };
        r.readAsText(f);
    } else {
        Utils.alert(getL10n('utils-base-file-loading-error'));
    }
};

FileUtils.saveFile = function () {
    DBMS.getDatabase((err, database) => {
        if (err) { Utils.handleError(err); return; }
        FileUtils.json2File(database, 'nims-base.json');
    });
};

FileUtils.json2File = function (str, fileName) {
    FileUtils.str2File(JSON.stringify(str, null, '  '), fileName);
};

FileUtils.str2File = function (str, fileName) {
    const blob = new Blob([str], {
        type: 'text/plain;charset=utf-8'
    });
    saveAs(blob, fileName);
};
