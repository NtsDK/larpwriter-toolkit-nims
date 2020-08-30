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

function EventPresenceCell(props) {
  const {
    checked, onChange, eventIndex, characterName,
    isReady, hasText
  } = props;
  const { t } = useTranslation();
  return (
    <td className="EventPresenceCell vertical-aligned-td">
      <input
        className="isStoryEditable hidden"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        data-event-index={eventIndex}
        data-character-name={characterName}
        id={characterName + eventIndex}
      />
      <label htmlFor={characterName + eventIndex} className="checkbox-label checkbox-label-icon">
        {(isReady || hasText)
          && (
            <span
              title={isReady ? t('adaptations.adaptation-finished') : t('adaptations.adaptation-in-progress')}
              className={classNames('margin-left-8', {
                finished: isReady,
                'in-progress': hasText && !isReady,
              })}
            />
          )}

      </label>
    </td>
  );
}

export function EventPresence(props) {
  const { storyName } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  function refresh() {
    // dbms.getWriterStory({ storyName }).then((storyText) => {
    //   setState({ storyText });
    // }).catch(UI.handleError);
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

      // dataArray.sort(CU.charOrdAObject);

      // const displayArray = dataArray.map((elem) => elem.displayName);
      // const characterArray2 = dataArray.map((elem) => elem.value);
      setState({
        sortedCharacterList,
        // characterArray2,
        events,
        // displayArray,
      });
      setSelectedCharacters(CU.sortStrIgnoreCase(characterArray));
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  if (!state) {
    return null;
  }

  const { sortedCharacterList, events } = state;

  // events.forEach((event, i) => {
  //   appendTableInput(table, event, i, characterArray2);
  //   UI.enable(content, 'isStoryEditable', isStoryEditable);
  // });

  // function appendTableInput(table, event, i, characterArray) {
  //   const tr = U.makeEl('tr');
  //   const td1 = U.makeEl('td');
  //   td1.appendChild(U.makeText(event.name));
  //   tr.appendChild(td1);

  //   U.addEls(tr, characterArray.map((character, j) => {
  //     const content = U.makeEl('tr');
  //     ReactDOM.render(getEventPresenceCell(), content);
  //     const td = U.qee(content, '.EventPresenceCell');

  //     U.addClass(td, 'dependent');
  //     U.setAttr(td, 'dependent-index', j);
  //     const input = U.qee(td, 'input');
  //     const label = U.qee(td, 'label');
  //     if (event.characters[character]) {
  //       input.checked = true;
  //     }
  //     input.eventIndex = i;
  //     input.eventName = event.name;
  //     input.characterName = character;
  //     input.hasText = event.characters[character] !== undefined && event.characters[character].text !== '';
  //     input.addEventListener('change', onChangeCharacterCheckbox);

  //     const span = U.qee(td, 'span');
  //     if (event.characters[character] !== undefined) {
  //       if (event.characters[character].ready) {
  //         U.addClass(span, 'finished');
  //         U.setAttr(span, 'title', L10n.get('adaptations', 'adaptation-finished'));
  //       } else if (input.hasText) {
  //         U.addClass(span, 'in-progress');
  //         U.setAttr(span, 'title', L10n.get('adaptations', 'adaptation-in-progress'));
  //       }
  //     }

  //     const id = i + character;
  //     U.setAttr(input, 'id', id);
  //     U.setAttr(label, 'for', id);
  //     return td;
  //   }));

  //   table.appendChild(tr);
  // }

  function onChangePresenceCheckbox(event) {
    const { eventIndex, characterName } = event.target.dataset;
    if (event.target.checked) {
      dbms.addCharacterToEvent({
        storyName,
        eventIndex: Number(eventIndex),
        characterName
      }).then(refresh).catch(UI.handleError);
    } else if (true || !event.target.hasText) {
      dbms.removeCharacterFromEvent({
        storyName,
        eventIndex: Number(eventIndex),
        characterName
      }).then(refresh).catch(UI.handleError);
    }
    // else {
    //   UI.confirm(CU.strFormat(
    //     L10n.getValue('stories-remove-character-from-event-warning'),
    //     [event.target.characterName, event.target.eventName]
    //   ), () => {
    //     DBMS.removeCharacterFromEvent({
    //       storyName: Stories.getCurrentStoryName(),
    //       eventIndex: event.target.eventIndex,
    //       characterName: event.target.characterName
    //     }).catch(UI.handleError);
    //   }, () => {
    //     event.target.checked = true;
    //   });
    // }
  }

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
                                onChange={onChangePresenceCheckbox}
                                eventIndex={i}
                                characterName={char}
                                isReady={event.characters[char]?.ready}
                                hasText={event.characters[char] && event.characters[char].text !== ''}
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
