import React, {
  Component, useEffect, useState, useContext
} from 'react';
import { CU } from 'nims-dbms-core';
import * as R from 'ramda';
import { ProjectUtils } from 'nims-dbms';
import { useTranslation } from 'react-i18next';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { InlineNotification } from '../../../commons/uiCommon3/InlineNotification.jsx';
import { PanelCore } from '../../../commons/uiCommon3/PanelCore.jsx';
import './RelationReport.css';

export function RelationReport(props) {
  const { id } = props;
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  const [relationsSummary, setRelationsSummary] = useState(null);
  useEffect(() => {
    dbms.getRelationsSummary({ characterName: id }).then((relationsSummary) => {
      setRelationsSummary(relationsSummary);
    }).catch(UI.handleError);
  }, [id]);

  if (!relationsSummary) {
    return null;
  }

  return (
    <PanelCore
      className="relation-report"
      title={t('profiles.character-report-by-relations')}
    >
      <InlineNotification type="info" showIf={relationsSummary.relations.length === 0}>
        {t('advices.character-has-no-relations')}
      </InlineNotification>
      {
        relationsSummary.relations.length !== 0
      && (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>{t('profiles.character')}</th>
              <th colSpan={3}>{t('profiles.direction')}</th>
              <th>{t('profiles.completeness')}</th>
              <th>{t('profiles.origin')}</th>
            </tr>
          </thead>
          <tbody>
            {
              relationsSummary.relations.map((rel) => {
                const isStarter = rel.starter === id;
                const first = rel.starter === id ? rel.starter : rel.ender;
                const second = rel.starter !== id ? rel.starter : rel.ender;
                const finished = isStarter ? rel.starterTextReady : rel.enderTextReady;
                const starterToEnderActive = R.contains(isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence);
                const enderToStarterActive = R.contains(!isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence);
                return (
                  <tr className="relation-report-row">
                    <td className="character-name">{ProjectUtils.get2ndRelChar(id, rel)}</td>
                    <td
                      className={`activity-icon fa-icon starterToEnder text-center ${starterToEnderActive && 'active'}`}
                      title={t('briefings.starterToEnder', { first, second })}
                    />
                    <td
                      className={`activity-icon fa-icon allies text-center ${R.contains('allies', rel.essence) && 'active'}`}
                      title={t('constant.allies')}
                    />
                    <td
                      className={`activity-icon fa-icon enderToStarter text-center  ${enderToStarterActive && 'active'}`}
                      title={t('briefings.starterToEnder', { first: second, second: first })}
                    />
                    <td className={`completeness ${finished ? 'relation-finished' : 'relation-unfinished'}`}>{t(`constant.${finished ? 'finished' : 'unfinished'}`)}</td>
                    <td className="origin">{rel.origin}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      )
      }
    </PanelCore>
  );
}
