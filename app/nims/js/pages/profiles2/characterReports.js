/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

// ((exports) => {
    const root = '.character-reports-tmpl';

    exports.makeStoryReportRow = (storyInfo) => {
        const act = storyInfo.activity;
        const completeness = makeCompletenessLabel(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
        const color = getCompletenessColor(storyInfo.finishedAdaptations, storyInfo.totalAdaptations);
        const row = U.qte(`${root} .story-report-row-tmpl`);
        const qe = U.qee(row);
        L10n.localizeStatic(row);
        U.addEl(U.qe('.story-name'), U.makeText(storyInfo.storyName));
        U.setClassByCondition(U.qe('.activity-active'), 'active-item-in-report', act.active);
        U.setClassByCondition(U.qe('.activity-follower'), 'active-item-in-report', act.follower);
        U.setClassByCondition(U.qe('.activity-defensive'), 'active-item-in-report', act.defensive);
        U.setClassByCondition(U.qe('.activity-passive'), 'active-item-in-report', act.passive);
        U.addEl(U.qe('.completeness'), U.makeText(completeness));
        U.setStyle(U.qe('.completeness'), 'background-color', color);
        U.addEl(U.qe('.meets'), U.makeText(storyInfo.meets.join(', ')));
        U.addEl(U.qe('.inventory'), U.makeText(storyInfo.inventory));
        return row;
    };

    exports.makeRelationReportRow = R.curry((characterName, rel) => {
        const row = U.qte(`${root} .relation-report-row-tmpl`);
        const qe = U.qee(row);
        L10n.localizeStatic(row);
        const secondCharacter = ProjectUtils.get2ndRelChar(characterName, rel);
        U.addEl(U.qe('.character-name'), U.makeText(secondCharacter));
        const isStarter = rel.starter === characterName;

        if (isStarter) {
            U.setAttr(
                U.qe('.direction-starterToEnder'), 'title',
                L10n.format('briefings', 'starterToEnder', [characterName, secondCharacter])
            );
            U.setAttr(
                U.qe('.direction-enderToStarter'), 'title',
                L10n.format('briefings', 'enderToStarter', [secondCharacter, characterName])
            );
        } else {
            U.setAttr(
                U.qe('.direction-starterToEnder'), 'title',
                L10n.format('briefings', 'starterToEnder', [secondCharacter, characterName])
            );
            U.setAttr(
                U.qe('.direction-enderToStarter'), 'title',
                L10n.format('briefings', 'enderToStarter', [characterName, secondCharacter])
            );
        }

        U.setClassByCondition(
            U.qe('.direction-starterToEnder'), 'active-item-in-report',
            R.contains(isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence)
        );
        U.setClassByCondition(U.qe('.direction-allies'), 'active-item-in-report', R.contains('allies', rel.essence));
        U.setClassByCondition(
            U.qe('.direction-enderToStarter'), 'active-item-in-report',
            R.contains(!isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence)
        );

        const finished = isStarter ? rel.starterTextReady : rel.enderTextReady;

        U.addEl(U.qe('.completeness'), U.makeText(L10n.get('constant', finished ? 'finished' : 'unfinished')));
        U.setClassByCondition(U.qe('.completeness'), 'relation-finished', finished);
        U.setClassByCondition(U.qe('.completeness'), 'relation-unfinished', !finished);

        U.addEl(U.qe('.origin'), U.makeText(rel.origin));
        return row;
    });

    function makeCompletenessLabel(value, total) {
        return U.strFormat('{0} ({1}/{2})', [total === 0 ? '-' : `${((value / total) * 100).toFixed(0)}%`, value, total]);
    }

    function getCompletenessColor(value, total) {
        if (total === 0) { return 'transparent'; }
        function calc(b, a, part) {
            return ((a * part) + ((1 - part) * b)).toFixed(0);
        }

        let p = value / total;
        if (p < 0.5) {
            p *= 2;
            return U.strFormat('rgba({0},{1},{2}, 1)', [calc(251, 255, p), calc(126, 255, p), calc(129, 0, p)]); // red to yellow mapping
        }
        p = (p - 0.5) * 2;
        return U.strFormat('rgba({0},{1},{2}, 1)', [calc(255, 123, p), calc(255, 225, p), calc(0, 65, p)]); // yellow to green mapping
    }
// })(window.CharacterReports = {});
