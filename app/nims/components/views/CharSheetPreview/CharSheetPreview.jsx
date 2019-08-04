import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './CharSheetPreview.css';

import {
  BrowserRouter as Router, Switch, Route, Redirect, Link, NavLink
} from 'react-router-dom';

import CharSheetPreviewBody from '../CharSheetPreviewBody';

export default class CharSheetPreview extends Component {
  state = {
    charNames: null
  };

  componentDidMount = () => {
    // console.log('CharSheetPreview mounted');
    this.getStateInfo();
  }

  componentDidUpdate = () => {
    console.log('CharSheetPreview did update');
  }

  componentWillUnmount = () => {
    console.log('CharSheetPreview will unmount');
  }

  getStateInfo = () => {
    const { dbms } = this.props;
    Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }),
    ]).then((results) => {
      const [charNames] = results;
      charNames.sort(CU.charOrdA);
      this.setState({
        charNames
      });
    });
  }

  render() {
    const {
      charNames
    } = this.state;
    const { t, dbms } = this.props;

    if (!charNames) {
      return null;
    }

    // if (!id) {
    //   if (!charNames) {
    //     return null;
    //   }
    //   if (charNames.length === 0) {
    //     return <div className="alert alert-info">{t('advices.no-character')}</div>;
    //   }
    //   return <Redirect to={`/characterSheets/preview/${charNames[0]}`} />;
    // }

    // if (redirect) {
    //   // this.setState({
    //   //   redirect: false
    //   // });
    //   return <Redirect to={`/characterSheets/preview/${to}`} />;
    // }

    // if (!something) {
    //   return <div> CharSheetPreview stub </div>;
    // // return null;
    // }
    return (
      <Switch>
        <Route path="/characterSheets" render={() => <Redirect to="/characters/preview" />} exact />
        <Route
          path="/characterSheets/preview"
          render={() => (charNames.length === 0
            ? <div className="alert-block alert alert-info">{t('advices.no-character')}</div>
            : <Redirect to={`/characterSheets/preview/${charNames[0]}`} />)}
          exact
        />
        <Route
          path="/characterSheets/preview/:id"
          render={({ match }) => {
            const { id } = match.params;
            return (
              <div className="block">
                <CharSheetPreviewBody id={id} dbms={dbms} />
              </div>
            );
          }}
        />

      </Switch>
    );
  }
}

CharSheetPreview.propTypes = {
  // bla: PropTypes.string,
};

CharSheetPreview.defaultProps = {
  // bla: 'test',
};
