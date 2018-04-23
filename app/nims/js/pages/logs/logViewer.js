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
    const root = '.log-viewer-tab ';

    exports.init = () => {
        const pagination = clearEl(queryEl(`${root}.pagination`));
        addEls(pagination, R.range(0, 20).map((num) => {
            const a = setAttr(makeEl('a'), 'href', '#');
            const li = addEl(makeEl('li'), a);
            li.num = num;
            addEl(a, makeText(num + 1));
            listen(a, 'click', () => {
                getData({ target: { value: num } });
                const prevActive = queryEl(`${root}.pagination li.active`);
                if (prevActive !== null) {
                    removeClass(prevActive, 'active');
                }
                addClass(li, 'active');
            });
            return li;
        }));

        listen(queryEl(`${root}button.clear-filter`), 'click', () => {
            queryEls(`${root}input[filter]`).forEach(el => (el.value = ''));
            exports.refresh();
        });

        queryEls(`${root}input[filter]`).forEach(listen(R.__, 'input', exports.refresh));

        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        queryEls(`${root}.pagination li a`)[0].click();
    };

    function dataRecieved(err, data) {
        if (err) { Utils.handleError(err); return; }
        addEl(clearEl(queryEl(`${root}.result-number`)), makeText(L10n.format('log-viewer', 'total', [data.max])));

        const container = clearEl(queryEl(`${root}.log-data`));
        queryEls(`${root}.pagination li`).forEach(li => hideEl(li, li.num > data.logSize - 1));
        R.ap([addEl(container)], data.requestedLog.map(makeRow));
    }

    function getData(event) {
        const filter = R.fromPairs(queryEls(`${root}input[filter]`).map(el => [getAttr(el, 'filter'), el.value]));
        DBMS.getLog(Number(event.target.value), filter, dataRecieved);
    }

    function makeRow(rowData) {
        const tr = makeEl('tr');
        const addText = (text) => {
            addEl(tr, addEl(makeEl('td'), addEl(makeEl('span'), makeText(text))));
        };
        addText(`${rowData[0]}`);
        addText(new Date(rowData[2]).format('yyyy/mm/dd HH:MM:ss'));
        addText(rowData[1]);
        addText(rowData[3]);
        addText(rowData[4]);
        addText(rowData[5]);
        return tr;
    }
})(this.LogViewer = {});
