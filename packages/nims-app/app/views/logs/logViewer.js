
import ReactDOM from 'react-dom';
import dateFormat from 'dateformat';

import { getLogViewerTemplate } from "./LogViewerTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';

import './logViewer.css';

const root = '.log-viewer-tab ';

export class LogViewer {
    subContainer;

    constructor(){
        this.refresh = this.refresh.bind(this);
        this.dataRecieved = this.dataRecieved.bind(this);
    }

    getContent = () => this.subContainer;

    init(){
        this.subContainer = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), this.subContainer);
        ReactDOM.render(getLogViewerTemplate(), this.subContainer);
        L10n.localizeStatic(this.subContainer);

        const pagination = U.clearEl(U.queryEl(`${root}.pagination`));
        U.addEls(pagination, R.range(0, 20).map((num) => {
            const a = U.setAttr(U.makeEl('a'), 'href', '#');
            const li = U.addEl(U.makeEl('li'), a);
            li.num = num;
            U.addEl(a, U.makeText(num + 1));
            U.listen(a, 'click', () => {
                this.getData({ target: { value: num } });
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
            this.refresh();
        });

        U.queryEls(`${root}input[filter]`).forEach(U.listen(R.__, 'input', this.refresh));
    };

    refresh() {
        U.queryEls(`${root}.pagination li a`)[0].click();
    }

    dataRecieved(data) {
        U.addEl(U.clearEl(U.queryEl(`${root}.result-number`)), U.makeText(L10n.format('log-viewer', 'total', [data.max])));

        const container = U.clearEl(U.queryEl(`${root}.log-data`));
        U.queryEls(`${root}.pagination li`).forEach(li => U.hideEl(li, li.num > data.logSize - 1));
        R.ap([U.addEl(container)], data.requestedLog.map(this.makeRow));
    }

    getData(event) {
        const filter = R.fromPairs(U.queryEls(`${root}input[filter]`).map(el => [U.getAttr(el, 'filter'), el.value]));
        DBMS.getLog({ pageNumber: Number(event.target.value), filter }).then(this.dataRecieved).catch(UI.handleError);
    }

    makeRow(rowData) {
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
}

