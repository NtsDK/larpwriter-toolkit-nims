import ProjectUtils from "nims-dbms/db-utils/projectUtils";
import ReactDOM from 'react-dom';
import { getRelationReportRow, getStoryReportRow } from "./CharacterReportsTemplate.jsx";
// ((exports) => {
const root = '.character-reports-tmpl';

function makeStoryReportRow(storyInfo) {
    const act = storyInfo.activity;
    const completeness = makeCompletenessLabel(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
    const color = getCompletenessColor(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
    // const row = U.qte(`${root} .story-report-row-tmpl`);

    const content = U.makeEl('tbody');
    ReactDOM.render(getStoryReportRow(), content);
    const row =  U.qee(content, '.StoryReportRow');

    const qe = U.qee(row);
    L10n.localizeStatic(row);
    U.addEl(qe('.story-name'), U.makeText(storyInfo.storyName));
    U.setClassByCondition(qe('.activity-active'), 'active-item-in-report', act.active);
    U.setClassByCondition(qe('.activity-follower'), 'active-item-in-report', act.follower);
    U.setClassByCondition(qe('.activity-defensive'), 'active-item-in-report', act.defensive);
    U.setClassByCondition(qe('.activity-passive'), 'active-item-in-report', act.passive);
    U.addEl(qe('.completeness'), U.makeText(completeness));
    U.setStyle(qe('.completeness'), 'background-color', color);
    U.addEl(qe('.meets'), U.makeText(storyInfo.meets.join(', ')));
    U.addEl(qe('.inventory'), U.makeText(storyInfo.inventory));
    return row;
};

const makeRelationReportRow = R.curry((characterName, rel) => {
    // const row = U.qte(`${root} .relation-report-row-tmpl`);
    const content = U.makeEl('tbody');
    ReactDOM.render(getRelationReportRow(), content);
    const row =  U.qee(content, '.RelationReportRow');

    const qe = U.qee(row);
    L10n.localizeStatic(row);
    const secondCharacter = ProjectUtils.get2ndRelChar(characterName, rel);
    U.addEl(qe('.character-name'), U.makeText(secondCharacter));
    const isStarter = rel.starter === characterName;

    if (isStarter) {
        U.setAttr(
            qe('.direction-starterToEnder'), 'title',
            L10n.format('briefings', 'starterToEnder', [characterName, secondCharacter])
        );
        U.setAttr(
            qe('.direction-enderToStarter'), 'title',
            L10n.format('briefings', 'enderToStarter', [secondCharacter, characterName])
        );
    } else {
        U.setAttr(
            qe('.direction-starterToEnder'), 'title',
            L10n.format('briefings', 'starterToEnder', [secondCharacter, characterName])
        );
        U.setAttr(
            qe('.direction-enderToStarter'), 'title',
            L10n.format('briefings', 'enderToStarter', [characterName, secondCharacter])
        );
    }

    U.setClassByCondition(
        qe('.direction-starterToEnder'), 'active-item-in-report',
        R.contains(isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence)
    );
    U.setClassByCondition(qe('.direction-allies'), 'active-item-in-report', R.contains('allies', rel.essence));
    U.setClassByCondition(
        qe('.direction-enderToStarter'), 'active-item-in-report',
        R.contains(!isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence)
    );

    const finished = isStarter ? rel.starterTextReady : rel.enderTextReady;

    U.addEl(qe('.completeness'), U.makeText(L10n.get('constant', finished ? 'finished' : 'unfinished')));
    U.setClassByCondition(qe('.completeness'), 'relation-finished', finished);
    U.setClassByCondition(qe('.completeness'), 'relation-unfinished', !finished);

    U.addEl(qe('.origin'), U.makeText(rel.origin));
    return row;
});

function makeCompletenessLabel(value, total) {
    return CU.strFormat('{0} ({1}/{2})', [total === 0 ? '-' : `${((value / total) * 100).toFixed(0)}%`, value, total]);
}

function getCompletenessColor(value, total) {
    if (total === 0) { return 'transparent'; }
    function calc(b, a, part) {
        return ((a * part) + ((1 - part) * b)).toFixed(0);
    }

    let p = value / total;
    if (p < 0.5) {
        p *= 2;
        return CU.strFormat('rgba({0},{1},{2}, 1)', [calc(251, 255, p), calc(126, 255, p), calc(129, 0, p)]); // red to yellow mapping
    }
    p = (p - 0.5) * 2;
    return CU.strFormat('rgba({0},{1},{2}, 1)', [calc(255, 123, p), calc(255, 225, p), calc(0, 65, p)]); // yellow to green mapping
}
// })(window.CharacterReports = {});
export default {
    makeStoryReportRow,
    makeRelationReportRow
}
