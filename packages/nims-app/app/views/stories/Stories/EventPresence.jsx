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
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { ConfirmDialog } from '../../commons/uiCommon3/ConfirmDialog.jsx';
import { EventPresenceCell } from './EventPresenceCell.jsx';

export function EventPresence(props) {
  const { storyName, ee } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  function refresh() {
    Promise.all([
      PermissionInformer.isEntityEditable({ type: 'story', name: storyName }),
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
      dbms.getStoryCharacterNamesArray({ storyName }),
      dbms.getStoryEvents({ storyName })
    ]).then((results) => {
      const [isStoryEditable, allCharacters, characterArray, events] = results;
      const allCharactersIndex = R.indexBy(R.prop('value'), allCharacters);

      const sortedCharacterList = R.sort(CU.charOrdAObject,
        R.values(R.pick(characterArray, allCharactersIndex)));
      setState({
        sortedCharacterList,
        events,
      });
      setSelectedCharacters(CU.sortStrIgnoreCase(characterArray));
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  useEffect(() => {
    ee.on('eventsChange', refresh);
    ee.on('charactersChange', refresh);
    return () => {
      ee.off('eventsChange', refresh);
      ee.off('charactersChange', refresh);
    };
  }, []);

  if (!state) {
    return null;
  }

  const { sortedCharacterList, events } = state;

  function onSelectedCharactersChange(e) {
    const selectedCharacters = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedCharacters(CU.sortStrIgnoreCase(selectedCharacters));
  }

  return (
    <div id="eventPresenceDiv">
      <div className="panel panel-default">
        <InlineNotification type="info" showIf={sortedCharacterList.length === 0}>
          {t('advices.no-characters-in-story')}
        </InlineNotification>
        <InlineNotification type="info" showIf={events.length === 0}>
          {t('advices.no-events-in-story')}
        </InlineNotification>
        {
          events.length !== 0 && sortedCharacterList.length !== 0
          && (
            <div className="panel-body flex-row" style={{ overflowX: 'auto' }}>
              <div className="flex-0-0-auto margin-right-8">
                <span className="margin-bottom-8 inline-block">{t('stories.show-characters')}</span>
                <FormControl
                  multiple
                  size={sortedCharacterList.length}
                  componentClass="select"
                  value={selectedCharacters}
                  onChange={onSelectedCharactersChange}
                >
                  {
                    sortedCharacterList.map((char) => <option value={char.value} key={char.value}>{char.displayName}</option>)
                  }
                </FormControl>
              </div>
              <div className="flex-1-1-auto">
                <table cellSpacing="0" cellPadding="0" className="table table-bordered">
                  <thead id="eventPresenceTableHead">
                    <tr>
                      <th>{t('stories.event')}</th>
                      {
                        selectedCharacters.map((el) => <th key={el}>{el}</th>)
                      }
                    </tr>
                  </thead>
                  <tbody id="eventPresenceTable">
                    {
                      events.map((event, i) => (
                        <tr>
                          <td>{event.name}</td>
                          {
                            selectedCharacters.map((char) => (
                              <EventPresenceCell
                                checked={!!event.characters[char]}
                                eventIndex={i}
                                eventName={event.name}
                                characterName={char}
                                isReady={event.characters[char]?.ready}
                                hasText={event.characters[char] && event.characters[char].text !== ''}
                                refresh={refresh}
                                storyName={storyName}
                              />
                            ))
                          }
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}
