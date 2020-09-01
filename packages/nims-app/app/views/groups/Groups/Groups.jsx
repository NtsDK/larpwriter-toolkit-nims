import React, {
  useContext, useEffect, useState, useMemo
} from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import PermissionInformer from 'permissionInformer';
import {
  NavLink, Route, Redirect
} from 'react-router-dom';
import {
  NavButton, NavSeparator, NavViewLink, NavContainer
} from '../../commons/NavComponent.jsx';

import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { EntityNav } from '../../commons/EntityNav';
import { GroupDropdown } from './GroupDropdown.jsx';
import { CreateGroupDialog } from './CreateGroupDialog.jsx';
import { GroupProfile } from './GroupProfile/index';

import './Groups.css';

export function Groups(props) {
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    PermissionInformer.getEntityNamesArray({ type: 'group', editableOnly: false }).then((groupNames) => {
      setState({ groupNames });
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  if (!state) {
    return null;
  }

  const { groupNames } = state;

  const groupList = groupNames.map((el) => ({
    primaryName: el.displayName
  }));

  function getEntityDropdown(entity) {
    return (
      <GroupDropdown
        entity={entity}
        primaryNames={groupList}
        refresh={refresh}
      />
    );
  }

  return (
    <div className="Groups block">
      <Route path="/groups">
        {groupNames.length > 0 && <Redirect to={`/groups/${groupNames[0].displayName}`} />}
      </Route>
      <div className="container-fluid height-100p">
        <div className="row height-100p">
          <div className="col-xs-3 height-100p">
            <Route path={['/groups/:id', '/groups']}>
              <EntityNav
                entityList={groupList}
                createEntityText="groups.create-entity"
                entityUrl="/groups"
                createEntityDialog={<CreateGroupDialog refresh={refresh} />}
                getEntityDropdown={getEntityDropdown}
              />
            </Route>
          </div>

          <div className="col-xs-9 content-column height-100p">
            <InlineNotification type="info" showIf={groupNames.length === 0}>
              {t('advices.no-group')}
            </InlineNotification>

            <Route
              path="/groups/:id"
              render={({ match }) => {
                const { id } = match.params;
                if (R.pluck('primaryName', groupList).includes(id)) {
                  return null;
                }
                return (
                  <InlineNotification type="info" showIf>
                    {t('advices.group-not-found', { groupName: id })}
                  </InlineNotification>
                );
              }}
            />

            <Route
              path="/groups/:id"
              render={({ match }) => {
                const { id } = match.params;

                return (
                  <GroupProfile key={id} id={id} />
                  // <GroupProfile id={id} />
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
