import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Stories.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';
import StoriesBody from '../StoriesBody';


export default class Stories extends Component {
  state = {
  };

  componentDidMount = () => {
    console.log('Stories mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('Stories did update');
  }

  componentWillUnmount = () => {
    console.log('Stories will unmount');
  }


  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'story' }),
    ]).then((results) => {
      const [storyNames] = results;
      storyNames.sort(CU.charOrdA);
      this.setState({
        storyNames
      });
    });
  }

  render() {
    const { storyNames } = this.state;
    const { dbms, t } = this.props;

    if (!storyNames) {
      return null;
    }
    return (
      <Switch>
        <Route
          path="/stories"
          render={() => (storyNames.length === 0
            ? <div className="alert-block alert alert-info">{t('advices.no-story')}</div>
            : <Redirect to={`/stories/writerStory/events/${storyNames[0]}`} />)}
          exact
        />
        <Route
          path="/stories/:tab1/:tab2/:id"
          render={({ match }) => {
            const { tab1, tab2, id } = match.params;
            return (
              <div className="block">
                <StoriesBody tab1={tab1} tab2={tab2} id={id} dbms={dbms} />
              </div>
            );
          }}
        />

      </Switch>
    );
  }
}

Stories.propTypes = {
  // bla: PropTypes.string,
};

Stories.defaultProps = {
  // bla: 'test',
};
