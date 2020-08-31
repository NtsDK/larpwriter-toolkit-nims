import React, { useContext, useEffect, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import PermissionInformer from 'permissionInformer';
import FormControl from 'react-bootstrap/es/FormControl';
import classNames from 'classnames';
import { InlineNotification } from '../../../commons/uiCommon3/InlineNotification.jsx';
import { StoryCharacterRow } from './StoryCharacterRow.jsx';

export function StoryCharacters(props) {
  const { storyName, ee } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    Promise.all([
      PermissionInformer.isEntityEditable({ type: 'story', name: storyName }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
      dbms.getStoryCharacters({ storyName })
    ]).then((results) => {
      const [isStoryEditable, allCharacters, localCharacters] = results;
      const charGroups = R.groupBy((nameInfo) => (localCharacters[nameInfo.value] ? 'inStoryChars' : 'outOfStoryChars'), allCharacters);
      setState({
        ...charGroups,
        localCharacters
      });
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  useEffect(() => {
    // console.log('on eventsChange subscription');
    ee.on('charactersChange', refresh);
    return () => {
      // console.log('off eventsChange subscription');
      ee.off('charactersChange', refresh);
    };
  }, []);

  if (!state) {
    return null;
  }

  const { localCharacters, inStoryChars, outOfStoryChars } = state;
  return (
    <div className="story-characters-tab">
      <div className="panel panel-default">
        <InlineNotification type="info" showIf={localCharacters.length === 0}>
          {t('advices.no-characters-in-story')}
        </InlineNotification>
        {
          localCharacters.length !== 0
        && (
          <table className="table table-bordered character-inventory-area">
            <thead>
              <tr>
                <th>{t('stories.name')}</th>
                <th>{t('stories.inventory')}</th>
                <th>{t('constant.active')}</th>
                <th>{t('constant.follower')}</th>
                <th>{t('constant.defensive')}</th>
                <th>{t('constant.passive')}</th>
              </tr>
            </thead>
            <tbody className="storyCharactersTable">
              {
                inStoryChars.map((char) => (
                  <StoryCharacterRow
                    storyName={storyName}
                    character={localCharacters[char.value]}
                    outOfStoryChars={outOfStoryChars}
                    refresh={refresh}
                  />
                ))
              }
            </tbody>
          </table>
        )
        }
      </div>
    </div>
  );
}
