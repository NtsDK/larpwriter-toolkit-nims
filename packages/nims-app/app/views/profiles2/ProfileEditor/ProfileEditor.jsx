import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import './ProfileEditor.css';

import {
  NavLink, Route, Redirect
} from 'react-router-dom';
import { CU } from 'nims-dbms-core';

import { CharacterProfile } from './CharacterProfile';
import { StoryReport } from './StoryReport';
import { RelationReport } from './RelationReport';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { EntityNav } from '../../commons/EntityNav';
import { CreateProfileDialog } from './CreateProfileDialog.jsx';
import { ProfileDropdown } from './ProfileDropdown.jsx';

export class ProfileEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      primaryNames: null,
      secondaryNames: null,
      profileBinding: null,
      profileList: null
    };
    this.refresh = this.refresh.bind(this);
    this.getEntityDropdown = this.getEntityDropdown.bind(this);
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
    const { dbms } = this.props;
    return Promise.all([
      dbms.getEntityNamesArray({ type: 'character' }),
      dbms.getEntityNamesArray({ type: 'player' }),
      dbms.getProfileBindings(),
    ]).then((results) => {
      const [primaryNames, secondaryNames, profileBinding] = results;
      primaryNames.sort(CU.charOrdA);

      const profileList = primaryNames.map((primaryName) => ({
        primaryName,
        secondaryName: profileBinding[primaryName]
      }));

      this.setState({
        primaryNames, secondaryNames, profileBinding, profileList
      });
    }).catch(UI.handleError);
  }

  getEntityDropdown(entity) {
    const {
      primaryNames, secondaryNames, profileBinding
    } = this.state;
    return (
      <ProfileDropdown
        entity={entity}
        primaryNames={primaryNames}
        secondaryNames={secondaryNames}
        profileBinding={profileBinding}
        refresh={this.refresh}
      />
    );
  }

  render() {
    const {
      primaryNames, secondaryNames, profileBinding, profileList
    } = this.state;

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
                <EntityNav
                  entityList={profileList}
                  createEntityText="profiles.create-character"
                  entityUrl="/characters/characterEditor"
                  createEntityDialog={<CreateProfileDialog refresh={this.refresh} />}
                  getEntityDropdown={this.getEntityDropdown}
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
                      <RelationReport id={id} />
                      <CharacterProfile key={id} id={id} />
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
