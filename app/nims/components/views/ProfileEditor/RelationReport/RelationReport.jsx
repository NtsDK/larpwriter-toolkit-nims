import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './RelationReport.css';

const { get2ndRelChar } = require('db-utils/projectUtils');

export default class RelationReport extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('RelationReport mounted');
    this.getStateInfo();
  }

  componentDidUpdate = (prevProps) => {
    console.log('RelationReport did update');
    if (prevProps.id === this.props.id) {
      return;
    }
    this.getStateInfo();
  }

  componentWillUnmount = () => {
    console.log('RelationReport will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getRelationsSummary({ characterName: id }),
    ]).then((results) => {
      const [relationsSummary] = results;
      relationsSummary.relations.sort(CU.charOrdAFactory(rel => get2ndRelChar(id, rel).toLowerCase()));
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
      <div className="relation-report panel panel-default">
        <div className="panel-heading">
          {/* <a href="#"> */}
          <h3 className="panel-title">{t('profiles.character-report-by-relations')}</h3>
          {/* </a> */}
        </div>
        <div className="panel-body report-by-relations-div">
          <div className="alert alert-info">{t('advices.character-has-no-relations')}</div>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>{t('profiles.character')}</th>
                <th colSpan="3">{t('profiles.direction')}</th>
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
                      <td className="character-name">{get2ndRelChar(name, rel)}</td>
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
        </div>
      </div>
    );
  }
}

RelationReport.propTypes = {
  // bla: PropTypes.string,
};

RelationReport.defaultProps = {
  // bla: 'test',
};
