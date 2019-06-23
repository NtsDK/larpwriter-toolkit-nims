import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ProfileBinding.css';

export default class ProfileBinding extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('ProfileBinding mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('ProfileBinding did update');
  }

  componentWillUnmount = () => {
    console.log('ProfileBinding will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }),
      dbms.getEntityNamesArray({ type: 'player' }),
      dbms.getProfileBindings()
    ]).then((results) => {
      const [characterNames, playerNames, profileBindings] = results;
      characterNames.sort(CU.charOrdA);
      playerNames.sort(CU.charOrdA);
      // const [profileModel, profile] = results;
      this.setState({
        characterNames, playerNames, profileBindings
      });
    });
  }

  //   Promise.all([
  //     PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
  //     PermissionInformer.getEntityNamesArray({ type: 'player', editableOnly: false }),
  //     DBMS.getProfileBindings()
  // ]).then((results) => {
  //     const [characterNames, playerNames, profileBindings] = results;
  //     rebuildInterface(characterNames, playerNames, profileBindings);
  // }).catch(UI.handleError);

  render() {
    const { characterNames, playerNames, profileBindings } = this.state;
    const { t } = this.props;

    if (!characterNames) {
      return null;
    }

    const bondedCharacters = R.keys(profileBindings);
    const bondedPlayers = R.values(profileBindings);

    const bindings = R.toPairs(profileBindings).map(binding => ({
      name: R.join('/', binding),
      value: binding
    }));
    bindings.sort(CU.charOrdAFactory(R.prop('name')));

    return (
      <div className="profile-binding block">
        <div className="panel panel-default height-100p">
          <div className="panel-body height-100p">
            <label>{t('binding.binding-tip')}</label>
            <div className="container-fluid height-100p">
              <div className="row height-100p">
                <div className="col-xs-4 height-100p">
                  <h4>{t('binding.characters')}</h4>
                  <input className="form-control character-filter" type="search" placeholder={t('binding.character-search')} />
                  <div className="alert no-character alert-info">{t('advices.no-character')}</div>
                  <div className="entity-list character-list">
                    {
                      R.difference(characterNames, bondedCharacters).map(name => (
                        <div className="btn-group flex-row">
                          <a draggable="true" role="button" href="#" className="select-button btn btn-default btn-reduced flex-1-1-auto text-align-left white-space-normal">
                            <span className="primary-name">{name}</span>
                          </a>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="col-xs-4 height-100p">
                  <h4>{t('binding.players')}</h4>
                  <input className="form-control player-filter" type="search" placeholder={t('binding.player-search')} />
                  <div className="alert no-player alert-info">{t('advices.no-player')}</div>
                  <div className="entity-list player-list">
                    {
                      R.difference(playerNames, bondedPlayers).map(name => (
                        <div className="btn-group flex-row">
                          <a draggable="true" role="button" href="#" className="select-button btn btn-default btn-reduced flex-1-1-auto text-align-left white-space-normal">
                            <span className="primary-name">{name}</span>
                          </a>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="col-xs-4 height-100p">
                  <h4>{t('binding.bonded-characters-n-players')}</h4>
                  <input className="form-control binding-filter" type="search" placeholder={t('binding.binding-search')} />
                  <div className="entity-list binding-list">
                    {
                      bindings.map(binding => (
                        <div className="btn-group flex-row">
                          <button type="button" className="select-button btn btn-default btn-reduced flex-1-1-auto text-align-left white-space-normal">
                            <span className="primary-name">{binding.name}</span>
                          </button>
                          <button type="button" className="btn btn-default btn-reduced fa-icon unlink flex-0-0-auto transparent" />
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProfileBinding.propTypes = {
  // bla: PropTypes.string,
};

ProfileBinding.defaultProps = {
  // bla: 'test',
};
