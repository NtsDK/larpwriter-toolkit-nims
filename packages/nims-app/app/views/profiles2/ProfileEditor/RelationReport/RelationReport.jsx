import React, { Component } from 'react';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import ProjectUtils from 'nims-dbms/db-utils/projectUtils';
import { InlineNotification } from '../../../commons/uiCommon3/InlineNotification.jsx';
import { PanelCore } from '../../../commons/uiCommon3/PanelCore.jsx';
import './RelationReport.css';

// const { get2ndRelChar } = require('db-utils/projectUtils');

export class RelationReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    // console.log('RelationReport mounted');
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    console.log('RelationReport did update');
    // if (prevProps.id === this.props.id) {
    //   return;
    // }
    // this.getStateInfo();
  }

  componentWillUnmount() {
    console.log('RelationReport will unmount');
  }

  refresh() {
    const { id } = this.props;
    Promise.all([
      DBMS.getRelationsSummary({ characterName: id }),
    ]).then((results) => {
      const [relationsSummary] = results;
      relationsSummary.relations.sort(CU.charOrdAFactory((rel) => ProjectUtils.get2ndRelChar(id, rel).toLowerCase()));
      this.setState({
        relationsSummary
      });
    });
  }

  render() {
    const { relationsSummary } = this.state;
    const { t, id: name } = this.props;

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
                  const isStarter = rel.starter === name;
                  const first = rel.starter === name ? rel.starter : rel.ender;
                  const second = rel.starter !== name ? rel.starter : rel.ender;
                  const finished = isStarter ? rel.starterTextReady : rel.enderTextReady;
                  const starterToEnderActive = R.contains(isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence);
                  const enderToStarterActive = R.contains(!isStarter ? 'starterToEnder' : 'enderToStarter', rel.essence);
                  return (
                    <tr className="relation-report-row">
                      <td className="character-name">{ProjectUtils.get2ndRelChar(name, rel)}</td>
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
}
