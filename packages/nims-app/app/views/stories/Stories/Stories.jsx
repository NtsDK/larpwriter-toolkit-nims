import React, { useContext, useEffect, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import PermissionInformer from 'permissionInformer';
import './Stories.css';

import {
  NavLink, Route, Redirect
} from 'react-router-dom';

// import { CharacterProfile } from './CharacterProfile';
// import { StoryReport } from './StoryReport';
// import { RelationReport } from './RelationReport';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { EntityNav } from '../../commons/EntityNav';
import { CreateStoryDialog } from './CreateStoryDialog.jsx';
import { StoryDropdown } from './StoryDropdown.jsx';

export function Stories(props) {
  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }).then((allStoryNames) => {
      setState({ allStoryNames });
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  if (!state) {
    return null;
  }

  const { allStoryNames } = state;

  const storyList = allStoryNames.map((el) => ({
    primaryName: el.displayName
  }));

  function getEntityDropdown(entity) {
    return (
      <StoryDropdown
        entity={entity}
        primaryNames={storyList}
        refresh={refresh}
      />
    );
  }

  return (

    <div className="Stories block">
      <Route path="/stories">
        {allStoryNames.length > 0 && <Redirect to={`/stories/${allStoryNames[0].displayName}`} />}
      </Route>
      <div className="container-fluid height-100p">
        <div className="row height-100p">
          <div className="col-xs-3 height-100p">
            <Route path={['/stories/:id', '/stories']}>
              <EntityNav
                entityList={storyList}
                createEntityText="stories.create-entity"
                entityUrl="/stories"
                createEntityDialog={<CreateStoryDialog refresh={refresh} />}
                getEntityDropdown={getEntityDropdown}
              />
            </Route>
          </div>

          <div className="col-xs-9 content-column height-100p">
            <InlineNotification type="info" showIf={allStoryNames.length === 0}>
              {t('advices.no-story')}
            </InlineNotification>
            <Route
              path="/stories/:id"
              render={({ match }) => {
                const { id } = match.params;
                if (R.pluck('primaryName', storyList).includes(id)) {
                  return null;
                }
                return (
                  <InlineNotification type="info" showIf>
                    {t('advices.story-not-found', { storyName: id })}
                  </InlineNotification>
                );
              }}
            />

            {/* <Route
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
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
