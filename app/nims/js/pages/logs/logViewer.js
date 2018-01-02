/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
 Utils, DBMS
 */

'use strict';

((exports) => {
    exports.init = () => {
        listen(getEl('logPageSelector'), 'change', (event) => {
            DBMS.getLog(Number(event.target.value), dataRecieved);
        });

        exports.content = getEl('logViewerDiv');
    };

    exports.refresh = () => {
        getEl('logPageSelector').selectedIndex = 0;
        DBMS.getLog(0, dataRecieved);
    };

    function dataRecieved(err, data) {
        if (err) { Utils.handleError(err); return; }

        const sel = getEl('logPageSelector');
        const { selectedIndex } = sel;
        clearEl(sel);

        const selData = [];
        for (let i = 0; i < data.logSize; i++) {
            selData.push({ name: i + 1, value: String(i), selected: selectedIndex === i });
        }
        fillSelector(sel, selData);

        const container = clearEl(getEl('logData'));

        R.ap([addEl(container)], data.requestedLog.map(makeRow));
    }

    function makeRow(rowData) {
        const tr = makeEl('tr');
        const addText = (text) => {
            addEl(tr, addEl(makeEl('td'), addEl(makeEl('span'), makeText(text))));
        };
        addText(rowData[0]);
        addText(new Date(rowData[2]).format('yyyy/mm/dd HH:MM:ss'));
        addText(rowData[1]);
        addText(rowData[3]);
        addText(rowData[4]);
        addText(rowData[5]);
        return tr;
    }
})(this.LogViewer = {});
