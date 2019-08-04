import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './SubjectiveVisions.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';

import SubjectiveVisionsBody from '../SubjectiveVisionsBody';

export default class SubjectiveVisions extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('SubjectiveVisions mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('SubjectiveVisions did update');
  }

  componentWillUnmount = () => {
    console.log('SubjectiveVisions will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'story' }),
    ]).then((results) => {
      const [storyNames] = results;
      this.setState({
        storyNames
      });
    });
  }

  render() {
    const { storyNames } = this.state;
    const { t, dbms } = this.props;

    if (!storyNames) {
      // return (<div className="alert-block alert alert-info margin-bottom-8">{t('advices.no-story')}</div>);
      return null;
    }
    return (
      <Switch>
        <Route
          path="/subjectiveVisions"
          render={() => (storyNames.length === 0
            ? <div className="alert-block alert alert-info margin-bottom-8">{t('advices.no-story')}</div>
            : <Redirect to={`/subjectiveVisions/${storyNames[0]}`} />)}
          exact
        />
        <Route
          path="/subjectiveVisions/:id"
          render={({ match }) => {
            const { id } = match.params;
            if (!storyNames.includes(id)) {
              return <Redirect to={`/subjectiveVisions/${storyNames[0]}`} />;
              // id = storyNames[0];
            }
            return (
              <div className="block flex-row">
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title">{t('adaptations.story')}</h3>
                  </div>
                  <div className="panel-body panel-resizable form-group">
                    <ul className="entity-list ">
                      {
                        storyNames.map(storyName => (
                          <li className="flex-row">
                            <NavLink className="btn btn-default flex-1-1-auto text-align-left" to={`/subjectiveVisions/${storyName}`}>
                              <div>{storyName}</div>
                            </NavLink>
                          </li>
                        ))
                      }
                    </ul>
                    {/* <input selector-filter="#events-storySelector" />
                    <select id="events-storySelector" className="form-control" /> */}
                  </div>
                </div>

                <SubjectiveVisionsBody id={id} dbms={dbms} />
              </div>
            );
          }
          }
        />

      </Switch>
    );
  }
}

SubjectiveVisions.propTypes = {
  // bla: PropTypes.string,
};

SubjectiveVisions.defaultProps = {
  // bla: 'test',
};
