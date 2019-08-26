import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Groups.css';

import {
  NavLink, Route, Redirect
} from 'react-router-dom';

import GroupProfile from './GroupProfile';

export default class Groups extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('Groups mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Groups did update');
  }

  componentWillUnmount = () => {
    console.log('Groups will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'group' })
    ]).then((results) => {
      const [groupNames] = results;
      this.setState({
        groupNames
      });
    });
  }

  render() {
    const { groupNames } = this.state;
    const { t, dbms } = this.props;

    if (!groupNames) {
      return <div> Groups stub </div>;
      // return null;
    }
    return (
      <div className="groups profile-editor block">
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
                      groupNames.map(primaryName => (

                        <li className="flex-row">
                          <NavLink className="btn btn-default flex-1-1-auto text-align-left" to={`/groups/${primaryName}`}>
                            <div>{primaryName}</div>
                            {/* {profileBinding[primaryName] && <div className="small">{profileBinding[primaryName]}</div>} */}
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
              <div className="alert-block alert alert-info">{t('advices.no-group')}</div>
              <Route
                path="/groups"
                render={() => (groupNames.length === 0
                  ? <div className="alert-block alert alert-info">{t('advices.no-group')}</div>
                  : <Redirect to={`/groups/${groupNames[0]}`} />)}
                exact
              />
              <Route
                path="/groups/:id"
                render={({ match }) => {
                  const { id } = match.params;
                  if (!groupNames.includes(id)) {
                    if (groupNames.length === 0) {
                      return <Redirect to="/groups" />;
                    }
                    return <Redirect to={`/groups/${groupNames[0]}`} />;
                  }

                  return (
                    <div>
                      {/* <StoryReport id={id} dbms={dbms} />
                      <RelationReport id={id} dbms={dbms} />
                       */}
                      <GroupProfile id={id} dbms={dbms} />
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Groups.propTypes = {
  // bla: PropTypes.string,
};

Groups.defaultProps = {
  // bla: 'test',
};
