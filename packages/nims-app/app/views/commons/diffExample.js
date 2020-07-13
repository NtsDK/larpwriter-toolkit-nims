import dateFormat from 'dateformat';
import { TestUtils } from 'nims-app-core';
import ReactDOM from 'react-dom';
import {
    getDiffExampleTemplate
} from "./DiffExampleTemplate.jsx";



export const showDiffExample = () => {
    U.addEl(U.queryEl('body'), U.queryEl('.show-diff-dialog'));
    $(U.queryEl('.show-diff-dialog')).modal('show');

    DBMS.getLog({
        pageNumber: 0,
        filter: {
            action: 'setMetaInfo',
            date: '',
            params: '',
            status: 'OK',
            user: ''
        }
    }).then((data) => {
        const el = U.clearEl(U.queryEl('.show-diff-dialog .container-fluid'));

        U.addEls(el, R.aperture(2, data.requestedLog).map((pair) => {
            const content = U.makeEl('div');
            ReactDOM.render(getDiffExampleTemplate(), content);
            const row = U.qee(content, '.DiffExampleTemplate');

            // const row = U.qmte('.diff-row-tmpl');
            U.addEl(U.qee(row, '.first .user'), U.makeText(pair[0][1]));
            U.addEl(U.qee(row, '.first .time'), U.makeText(dateFormat(new Date(pair[0][2]), 'yyyy/mm/dd h:MM')));
            const firstText = JSON.parse(pair[0][4])[0].value;
            U.addEl(U.qee(row, '.first .text'), U.makeText(firstText));

            U.addEl(U.qee(row, '.last .user'), U.makeText(pair[1][1]));
            U.addEl(U.qee(row, '.last .time'), U.makeText(dateFormat(new Date(pair[1][2]), 'yyyy/mm/dd h:MM')));
            const lastText = JSON.parse(pair[1][4])[0].value;
            U.addEl(U.qee(row, '.last .text'), U.makeText(lastText));

            ////        const diff = JsDiff.diffChars(prevData[4] || '', rowData[4]);
            ////        const diff = JsDiff.diffWords(prevData[4] || '', rowData[4]);
            //                const diff = JsDiff.diffWordsWithSpace(firstText, lastText);
            const diff = TestUtils.JsDiff.diffWordsWithSpace(lastText, firstText);

            // eslint-disable-next-line no-nested-ternary
            const part2status = (part) => (part.added ? 'added' : (part.removed ? 'removed' : 'same'));
            const els = diff.map((part) => [part.value, part]).map((pair2) => U.addClasses(U.addEl(U.makeEl('span'), U.makeText(pair2[0])), ['log-diff', pair2[1]]));
            U.addEls(U.qee(row, '.diff .text'), els);

            return row;
        }));
    }).catch(UI.handleError);
};
