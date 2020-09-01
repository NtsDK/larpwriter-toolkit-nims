import React, {
  Component, useEffect, useState, useContext
} from 'react';
import * as CU from 'nims-dbms-core/commonUtils';
import { UI, U, L10n } from 'nims-app-core';
import { useTranslation } from 'react-i18next';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { InlineNotification } from '../../../commons/uiCommon3/InlineNotification.jsx';
import { PanelCore } from '../../../commons/uiCommon3/PanelCore.jsx';
import './StoryReport.css';

const makeCompletenessLabel = (value, total) => CU.strFormat('{0} ({1}/{2})', [total === 0 ? '-' : `${((value / total) * 100).toFixed(0)}%`, value, total]);

const getCompletenessColor = (value, total) => {
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
};

export function StoryReport(props) {
  const { id } = props;
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  const [characterReport, setCharacterReport] = useState(null);
  useEffect(() => {
    dbms.getCharacterReport({ characterName: id }).then((characterReport) => {
      setCharacterReport(characterReport);
    }).catch(UI.handleError);
  }, [id]);

  if (!characterReport) {
    return null;
  }
  return (
    <PanelCore
      className="story-report"
      title={t('profiles.character-report-by-stories')}
    >
      <InlineNotification type="info" showIf={characterReport.length === 0}>
        {t('advices.character-has-no-stories')}
      </InlineNotification>
      {
        characterReport.length !== 0
          && (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>{t('profiles.story')}</th>
                  <th colSpan={4}>{t('profiles.activity')}</th>
                  <th>{t('profiles.completeness')}</th>
                  <th>{t('profiles.meets')}</th>
                  <th>{t('profiles.inventory')}</th>
                </tr>
              </thead>
              <tbody>
                {
                  characterReport.map((storyInfo) => (
                    <tr className="story-report-row">
                      <td className="story-name">{storyInfo.storyName}</td>
                      <td
                        className={`fa-icon activity-icon activity-icon-active ${storyInfo.activity.active && 'active'}`}
                        title={t('constant.active')}
                      />
                      <td
                        className={`fa-icon activity-icon activity-icon-follower ${storyInfo.activity.follower && 'active'}`}
                        title={t('constant.follower')}
                      />
                      <td
                        className={`fa-icon activity-icon activity-icon-defensive ${storyInfo.activity.defensive && 'active'}`}
                        title={t('constant.defensive')}
                      />
                      <td
                        className={`fa-icon activity-icon activity-icon-passive ${storyInfo.activity.passive && 'active'}`}
                        title={t('constant.passive')}
                      />
                      <td
                        className="completeness text-right"
                        style={
                          {
                            backgroundColor: getCompletenessColor(storyInfo.finishedAdaptations, storyInfo.totalAdaptations)
                          }
                        }
                      >
                        {makeCompletenessLabel(storyInfo.finishedAdaptations, storyInfo.totalAdaptations)}
                      </td>
                      <td className="meets">{storyInfo.meets.join(', ')}</td>
                      <td className="inventory">{storyInfo.inventory}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )
      }
    </PanelCore>
  );
}
