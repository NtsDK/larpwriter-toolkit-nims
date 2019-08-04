import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './RelationsBody.css';

export default class RelationsBody extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('RelationsBody mounted');
    this.getStateInfo();
  }

  componentDidUpdate = (prevProps) => {
    console.log('RelationsBody did update');
    // eslint-disable-next-line react/destructuring-assignment
    if (prevProps.id === this.props.id) {
      return;
    }
    this.getStateInfo();
  }

  componentWillUnmount = () => {
    console.log('RelationsBody will unmount');
  }

  getStateInfo = () => {
    const { dbms, id } = this.props;
    Promise.all([
      dbms.getAllProfiles({ type: 'character' }),
      dbms.getRelationsSummary({ characterName: id }),
      dbms.getExtendedProfileBindings(),
      dbms.getEntityNamesArray({ type: 'character' }),
      dbms.getProfileStructure({ type: 'character' }),
    ]).then((results) => {
      const [profiles, relationsSummary, profileBindings, characterNames, profileStructure] = results;
      this.setState({
        profiles,
        relationsSummary,
        profileBindings: R.fromPairs(profileBindings),
        characterNames,
        profileStructure
      });
    });
  }

  render() {
    const {
      profiles, relationsSummary, profileBindings, characterNames, profileStructure
    } = this.state;
    const { t, id } = this.props;

    if (!profiles) {
      // return <div> RelationsBody stub </div>;
      return null;
    }

    const fromChar = id;
    const nonCharNames = characterNames.filter(R.compose(R.not, R.equals(id)));

    const get2ndCharName = CU.get2ndRelChar(id);
    const showCharacters = relationsSummary.relations.map(get2ndCharName).sort(CU.charOrdA);

    const sortedRels = relationsSummary.relations.sort(CU.charOrdAFactory(a => get2ndCharName(a).toLowerCase()));


    const noRelsList = nonCharNames.filter(R.compose(R.not, R.contains(R.__, showCharacters)));
    const predicate = R.compose(R.contains(R.__, R.keys(relationsSummary.knownCharacters)));
    const [knownNoRels, unknownNoRels] = R.partition(predicate, noRelsList);

    return (
      <div className="RelationsBody block">
        <div className="alert alert-info">{t('advices.no-characters-for-relations')}</div>
        <div className="panel panel-default">
          <div className="panel-body">
            <div>
              <div className="entity-management relations-management">
                <div>
                  <span className="known-characters-label" />
                  <span>
                    <select className="common-select known-characters-select">
                      {
                        knownNoRels.map(rel => <option>{rel}</option>)
                      }
                    </select>
                  </span>
                  <button type="button" className="add-known-character-relation btn btn-default btn-reduced" />
                </div>
                <div>
                  <span className="unknown-characters-label" />
                  <span>
                    <select className="common-select unknown-characters-select">
                      {
                        unknownNoRels.map(rel => <option>{rel}</option>)
                      }
                    </select>
                  </span>
                  <button type="button" className="add-unknown-character-relation btn btn-default btn-reduced" />
                </div>
                <div>
                  <span className="profile-item-label" />
                  <span>
                    <select className="common-select profile-item-select">
                      {
                        profileStructure.map(R.prop('name')).map(name => <option>{name}</option>)
                      }
                    </select>
                  </span>
                </div>
              </div>

              <div className="relation-content container-fluid">
                {

                  sortedRels.map((rel) => {
                    const toChar = get2ndCharName(rel);
                    const stories = relationsSummary.knownCharacters[toChar];
                    return (

                      <div className="row">
                        <div className="to-character-data col-xs-3">
                          <h4 className="to-character-name">{`${toChar}/${profileBindings[toChar]}`}</h4>
                          <div>
                            <div className="where-meets-label bold-cursive">{t('briefings.where-meets')}</div>
                            <div className="where-meets-content">{stories === undefined ? '' : R.keys(stories).join(', ')}</div>
                          </div>
                          <div tocharacter="">
                            <div className="profile-item-name bold-cursive">{}</div>
                            <div className="profile-item-value">{}</div>
                          </div>
                          <div>
                            <button type="button" className="btn btn-default fa-icon remove">{}</button>
                          </div>
                        </div>
                        <div className="direct text-column col-xs-3">
                          <div className="pre-text-area">
                            <button type="button" className="btn btn-default fa-icon finished" title={t('constant.finishedText')} />
                          </div>
                          <textarea className="briefing-relation-area form-control" value={rel[fromChar]} />
                        </div>
                        <div className="origin text-column col-xs-3">
                          <div className="pre-text-area btn-group">
                            <button type="button" className="btn btn-default fa-icon starterToEnder">{}</button>
                            <button type="button" className="btn btn-default fa-icon allies">{}</button>
                            <button type="button" className="btn btn-default fa-icon enderToStarter">{}</button>
                          </div>
                          <textarea className="briefing-relation-area form-control" value={rel.origin} />
                        </div>
                        <div className="reverse text-column col-xs-3">
                          <div className="pre-text-area">
                            <button type="button" className="btn btn-default fa-icon finished" title={t('constant.finishedText')} />
                          </div>
                          <textarea className="briefing-relation-area form-control" value={rel[toChar]} />
                        </div>
                      </div>
                    );
                  })


                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

RelationsBody.propTypes = {
  // bla: PropTypes.string,
};

RelationsBody.defaultProps = {
  // bla: 'test',
};
