import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Relations.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';

import RelationsBody from '../RelationsBody';


export default class Relations extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('Relations mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Relations did update');
  }

  componentWillUnmount = () => {
    console.log('Relations will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }),
    ]).then((results) => {
      const [charNames] = results;
      this.setState({
        charNames
      });
    });
  }

  render() {
    const { charNames } = this.state;
    const { t, dbms } = this.props;

    if (!charNames) {
      // return <div> Relations stub </div>;
      return null;
    }
    return (
      <Switch className="Relations">
        <Route
          path="/relations"
          render={() => (charNames.length === 0
            ? <div className="alert-block alert alert-info margin-bottom-8">{t('advices.no-character')}</div>
            : <Redirect to={`/relations/${charNames[0]}`} />)}
          exact
        />
        <Route
          path="/relations/:id"
          render={({ match }) => {
            const { id } = match.params;
            if (!charNames.includes(id)) {
              return <Redirect to={`/relations/${charNames[0]}`} />;
            }
            return (
              <div className="block flex-row">
                <div className="panel panel-default">
                  {/* <div className="panel-heading">
                    <h3 className="panel-title">{t('adaptations.story')}</h3>
                  </div> */}
                  <div className="panel-body panel-resizable form-group">
                    <ul className="entity-list ">
                      {
                        charNames.map(charName => (
                          <li className="flex-row">
                            <NavLink className="btn btn-default flex-1-1-auto text-align-left" to={`/relations/${charName}`}>
                              <div>{charName}</div>
                            </NavLink>
                          </li>
                        ))
                      }
                    </ul>
                    {/* <input selector-filter="#events-storySelector" />
                        <select id="events-storySelector" className="form-control" /> */}
                  </div>
                </div>

                <RelationsBody id={id} dbms={dbms} />
                {/* <SubjectiveVisionsBody id={id} dbms={dbms} /> */}
              </div>
            );
          }
          }
        />

      </Switch>
    );
  }
}

Relations.propTypes = {
  // bla: PropTypes.string,
};

Relations.defaultProps = {
  // bla: 'test',
};
