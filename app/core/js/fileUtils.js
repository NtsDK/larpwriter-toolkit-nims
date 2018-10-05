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

((exports) => {
    exports.makeNewBase = () => {
        return new Promise((resolve, reject) => {
            Utils.confirm(getL10n('utils-new-base-warning'), () => {
                DBMS.setDatabase({database:CommonUtils.clone(EmptyBase.data)}).then(() => {
                    resolve(true);
                    // TestUtils.addGroupTestingData();
                }).catch(reject);
            }, () => resolve(false));
        });
    };

    exports.openHelp = () => {
        window.open('extras/doc/nims.html');
    };

    exports.readSingleFile = (evt) => {
        return new Promise((resolve, reject) => {
            // Retrieve the first (and only!) File from the FileList object
            const f = evt.target.files[0];

            if (f) {
                const r = new FileReader();
                r.onload = (e) => {
                    const contents = e.target.result;
                    try {
                        const database = JSON.parse(contents);
                        DBMS.setDatabase({database}).then(resolve, reject);
                    } catch (err) {
                        reject(err);
                    }
                };
                r.readAsText(f);
            } else {
                Utils.alert(getL10n('utils-base-file-loading-error'));
                reject();
            }
        });
    };

    exports.saveFile = () => {
        DBMS.getDatabase().then(database => {
            exports.json2File(database, exports.makeFileName(`${BASE_FILE_NAME}_${database.Meta.name}`, 'json', new Date(database.Meta.saveTime)));
        }).catch(Utils.handleError);
    };

    exports.makeFileName = (root, extension, date) => {
        date = date || new Date();
        const timeStr = date.format('dd-mmm-yyyy_HH-MM-ss');
        const fileName = `${root}_${timeStr}`;
        return `${CommonUtils.sanitizeStr2FileName(fileName)}.${extension}`;
    };

    exports.json2File = (str, fileName) => {
        exports.str2File(JSON.stringify(str, null, '  '), fileName);
    };

    exports.str2File = (str, fileName) => {
        const blob = new Blob([str], {
            type: 'text/plain;charset=utf-8'
        });
        saveAs(blob, fileName);
    };

    function preprocessCsvStr(str) {
        if (!(typeof str === 'string' || str instanceof String)) {
            return str;
        }
        let result = str.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) {
            result = `"${result}"`;
        }
        return result;
    }

    exports.arr2d2Csv = (arr, fileName) => {
        const csv = `\ufeff${arr.map(dataArray => dataArray.map(preprocessCsvStr).join(';')).join('\n')}`;

        const out = new Blob([csv], {
            type: 'text/csv;charset=utf-8;'
        });
        saveAs(out, exports.makeFileName(fileName, 'csv'));
    };
})(this.FileUtils = {});
