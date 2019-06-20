import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ProfileEditor.css';

import {
  NavLink, Route, Redirect
} from 'react-router-dom';

import CharacterProfile from './CharacterProfile';

export default class ProfileEditor extends Component {
  state = {
  };

  componentDidMount = () => {
    // console.log('ProfileEditor mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('ProfileEditor did update');
  }

  componentWillUnmount = () => {
    console.log('ProfileEditor will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }),
      dbms.getEntityNamesArray({ type: 'player' }),
      dbms.getProfileBindings(),
    ]).then((results) => {
      const [primaryNames, secondaryNames, profileBinding] = results;
      this.setState({
        primaryNames, secondaryNames, profileBinding
      });
    });
  }

  render() {
    const { primaryNames, secondaryNames, profileBinding } = this.state;

    if (!primaryNames) {
      return null;
    }

    primaryNames.sort(CU.charOrdA);

    const { dbms, t } = this.props;

    // <div class="btn-group flex-row">
    //   <button class="btn btn-default btn-reduced fa-icon remove flex-0-0-auto transparent"></button>
    //   <button class="btn btn-default btn-reduced fa-icon rename flex-0-0-auto transparent"></button>
    //   <button type="button" class="select-button btn btn-default btn-reduced flex-1-1-auto text-align-left white-space-normal">
    //     <span class="primary-name"></span>
    //     <small><div class="secondary-name"></div></small>
    //   </button>
    // </div>

    return (
      <div className="profile-editor block">
        <div className="container-fluid height-100p">
          <div className="row height-100p">
            <div className="col-xs-3 height-100p">
              <div className="panel panel-default  entity-select height-100p">
                <div className="panel-body height-100p">
                  <div className="flex-row entity-toolbar">
                    <button type="button" className="btn btn-default btn-reduced fa-icon create flex-0-0-auto" />
                    <input className="form-control entity-filter flex-1-1-auto" type="search" />
                  </div>
                  <ul className="entity-list ">

                    {
                      primaryNames.map(primaryName => (

                        <li className="flex-row">
                          <NavLink className="btn btn-default flex-1-1-auto text-align-left" to={`/characters/profiles/${primaryName}`}>
                            <div>{primaryName}</div>
                            {profileBinding[primaryName] && <div className="small">{profileBinding[primaryName]}</div>}
                          </NavLink>
                          {/* <a className="btn btn-default flex-1-1-auto text-align-left" href="#">
                            <div>{primaryName}</div>
                            {profileBinding[primaryName] && <div className="small">{profileBinding[primaryName]}</div>}
                          </a> */}
                          <button type="button" className="btn btn-default fa-icon kebab" />
                        </li>
                      ))
                    }

                    {/* <a class="btn btn-primary dropdown-toggle" data-toggle="dropdown" href="#">
                      <span class="fa fa-caret-down" title="Toggle dropdown menu"></span>
                    </a>
                    <ul class="dropdown-menu">
                      <li><a href="#"><i class="fa fa-pencil fa-fw"></i> Edit</a></li>
                      <li><a href="#"><i class="fa fa-trash-o fa-fw"></i> Delete</a></li>
                      <li><a href="#"><i class="fa fa-ban fa-fw"></i> Ban</a></li>
                      <li class="divider"></li>
                      <li><a href="#"><i class="fa fa-unlock"></i> Make admin</a></li>
                    </ul> */}


                    {/* <a className="list-group-item">Dapibus ac facilisis in</a>
                    <a className="list-group-item">Morbi leo risus</a>
                    <li className="list-group-item">Porta ac consectetur ac</li>
                    <li className="list-group-item">Vestibulum at eros</li> */}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-xs-9 content-column height-100p">
              <div className="alert-block alert alert-info">{t('advices.no-character')}</div>
              ProfileEditor body

              <Route
                path="/characters/profiles"
                render={() => (primaryNames.length === 0
                  ? <div className="alert-block alert alert-info">{t('advices.no-character')}</div>
                  : <Redirect to={`/characters/profiles/${primaryNames[0]}`} />)}
                exact
              />
              <Route
                path="/characters/profiles/:id"
                render={({ match }) => {
                  const { id } = match.params;
                  if (!primaryNames.includes(id)) {
                    if (primaryNames.length === 0) {
                      return <Redirect to="/characters/profiles" />;
                    }
                    return <Redirect to={`/characters/profiles/${primaryNames[0]}`} />;
                  }

                  return <CharacterProfile id={id} dbms={dbms} />;
                }}
              />
              {/* return <StarshipDetails itemId={id} /> */}
              {/* <Route path="/characters/profiles" render={() => <ProfileEditor dbms={dbms} />} /> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProfileEditor.propTypes = {
  // bla: PropTypes.string,
};

ProfileEditor.defaultProps = {
  // bla: 'test',
};
