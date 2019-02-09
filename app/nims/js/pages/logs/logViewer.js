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

require('./logViewer.css');
const dateFormat = require('dateformat');
const R = require('ramda');


// ((exports) => {
const root = '.log-viewer-tab ';

exports.init = () => {
    const pagination = U.clearEl(U.queryEl(`${root}.pagination`));
    U.addEls(pagination, R.range(0, 20).map((num) => {
        const a = U.setAttr(U.makeEl('a'), 'href', '#');
        const li = U.addEl(U.makeEl('li'), a);
        li.num = num;
        U.addEl(a, U.makeText(num + 1));
        U.listen(a, 'click', () => {
            getData({ target: { value: num } });
            const prevActive = U.queryEl(`${root}.pagination li.active`);
            if (prevActive !== null) {
                U.removeClass(prevActive, 'active');
            }
            U.addClass(li, 'active');
        });
        return li;
    }));

    U.listen(U.queryEl(`${root}button.clear-filter`), 'click', () => {
        U.queryEls(`${root}input[filter]`).forEach(el => (el.value = ''));
        exports.refresh();
    });

    U.queryEls(`${root}input[filter]`).forEach(U.listen(R.__, 'input', exports.refresh));

    exports.content = U.queryEl(root);
};

exports.refresh = () => {
    U.queryEls(`${root}.pagination li a`)[0].click();
};

function dataRecieved(data) {
    U.addEl(U.clearEl(U.queryEl(`${root}.result-number`)), U.makeText(L10n.format('log-viewer', 'total', [data.max])));

    const container = U.clearEl(U.queryEl(`${root}.log-data`));
    U.queryEls(`${root}.pagination li`).forEach(li => U.hideEl(li, li.num > data.logSize - 1));
    R.ap([U.addEl(container)], data.requestedLog.map(makeRow));
}

function getData(event) {
    const filter = R.fromPairs(U.queryEls(`${root}input[filter]`).map(el => [U.getAttr(el, 'filter'), el.value]));
    DBMS.getLog({ pageNumber: Number(event.target.value), filter }).then(dataRecieved).catch(UI.handleError);
}

function makeRow(rowData) {
    const addText = text => U.addEl(U.makeEl('td'), U.addEl(U.makeEl('span'), U.makeText(text)));
    return U.addEls(U.makeEl('tr'), [
        addText(`${rowData[0]}`),
        addText(dateFormat(new Date(rowData[2]), 'yyyy/mm/dd HH:MM:ss')),
        addText(rowData[1]),
        addText(rowData[3]),

        U.addEls(U.makeEl('td'), JSON.parse(rowData[4]).map(item => U.addEl(U.addClass(U.makeEl('div'), 'log-param'), U.makeText(R.is(Object, item) ? JSON.stringify(item) : item)))),
        U.addEls(U.makeEl('td'), JSON.parse(rowData[5]).map(item => U.addEl(U.addClass(U.makeEl('div'), 'log-param'), U.makeText(R.is(Object, item) ? JSON.stringify(item) : item)))),
    ]);
}
// })(window.LogViewer = {});
