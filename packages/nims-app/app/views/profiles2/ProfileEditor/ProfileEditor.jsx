import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import './ProfileEditor.css';

import {
  NavLink, Route, Redirect
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';

import { CharacterProfile } from './CharacterProfile';
import { StoryReport } from './StoryReport';
import { RelationReport } from './RelationReport';
import { ProfileNav } from './ProfileNav';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';

export class ProfileEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      primaryNames: null,
      secondaryNames: null,
      profileBinding: null,
    };
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
    console.log('ProfileEditor mounted');
  }

  componentDidUpdate() {
    console.log('ProfileEditor did update');
  }

  componentWillUnmount() {
    console.log('ProfileEditor will unmount');
  }

  refresh() {
    // const { dbms } = this.props;
    return Promise.all([
      DBMS.getEntityNamesArray({ type: 'character' }),
      DBMS.getEntityNamesArray({ type: 'player' }),
      DBMS.getProfileBindings(),
    ]).then((results) => {
      const [primaryNames, secondaryNames, profileBinding] = results;
      primaryNames.sort(CU.charOrdA);
      this.setState({
        primaryNames, secondaryNames, profileBinding
      });
    }).catch(UI.handleError);
  }

  render() {
    const { primaryNames, secondaryNames, profileBinding } = this.state;

    if (!primaryNames) {
      return null;
    }

    const { dbms, t } = this.props;

    return (
      <div className="profile-editor block">
        <Route path="/characters/characterEditor">
          {primaryNames.length > 0 && <Redirect to={`/characters/characterEditor/${primaryNames[0]}`} />}
        </Route>
        <div className="container-fluid height-100p">
          <div className="row height-100p">
            <div className="col-xs-3 height-100p">
              <Route path={['/characters/characterEditor/:id', '/characters/characterEditor']}>
                <ProfileNav
                  primaryNames={primaryNames}
                  profileBinding={profileBinding}
                  refresh={this.refresh}
                />
              </Route>
            </div>

            <div className="col-xs-9 content-column height-100p">
              <InlineNotification type="info" showIf={primaryNames.length === 0}>
                {t('advices.no-character')}
              </InlineNotification>
              <Route
                path="/characters/characterEditor/:id"
                render={({ match }) => {
                  const { id } = match.params;
                  if (primaryNames.includes(id)) {
                    return null;
                  }
                  return (
                    <InlineNotification type="info" showIf>
                      {t('advices.character-not-found', { characterName: id })}
                    </InlineNotification>
                  );
                }}
              />

              <Route
                path="/characters/characterEditor/:id"
                render={({ match }) => {
                  const { id } = match.params;

                  return (
                    <>
                      <StoryReport id={id} />
                      <RelationReport key={id} id={id} />
                      {/*

                      <CharacterProfile key={id} id={id} /> */}
                    </>
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
