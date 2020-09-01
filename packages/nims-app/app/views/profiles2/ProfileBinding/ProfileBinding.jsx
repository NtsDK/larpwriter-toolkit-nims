import React, { useContext, useEffect, useState } from 'react';
import './ProfileBinding.css';
import { UI, U, L10n } from 'nims-app-core';
import { useTranslation } from 'react-i18next';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import Dropdown from 'react-bootstrap/es/Dropdown';
import PermissionInformer from 'permissionInformer';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';
import { BindingList } from './BindingList.jsx';
import { ProfileList } from './ProfileList.jsx';

export function ProfileBinding(props) {
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  const [state, setState] = useState(null);

  function refresh() {
    Promise.all([
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
      PermissionInformer.getEntityNamesArray({ type: 'player', editableOnly: false }),
      dbms.getProfileBindings()
    ]).then((results) => {
      const [characterNames, playerNames, profileBindings] = results;
      setState({ characterNames, playerNames, profileBindings });
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  if (!state) {
    return null;
  }

  const { characterNames, playerNames, profileBindings } = state;

  const bondedCharacterList = R.keys(profileBindings);
  const bondedPlayerList = R.values(profileBindings);
  const filter = (list) => R.compose(R.not, R.contains(R.__, list), R.prop('value'));

  const bindings = R.toPairs(profileBindings).map((binding) => ({
    name: R.join('/', binding),
    value: binding
  }));
  bindings.sort(CU.charOrdAFactory(R.prop('name')));

  function removeBinding(e) {
    const { bindingStr } = e.target.dataset;
    const binding = JSON.parse(bindingStr);
    dbms.removeBinding({
      characterName: binding[0],
      playerName: binding[1]
    }).then(refresh, UI.handleError);
  }

  function onDragEnd(result) {
    console.log(result);
    const { combine, source, draggableId } = result;
    if (!combine) {
      return;
    }
    if (combine.droppableId === source.droppableId) {
      return;
    }
    const pair1 = JSON.parse(draggableId);
    const pair2 = JSON.parse(combine.draggableId);
    // console.log(result);
    dbms.createBinding({
      [pair1[0]]: pair1[1],
      [pair2[0]]: pair2[1],
    }).then(refresh, UI.handleError);
  }

  return (
    <div className="ProfileBinding profile-binding2-tab block">
      <div className="panel panel-default height-100p">
        <div className="panel-body height-100p">
          <label>{t('binding.binding-tip')}</label>
          <DragDropContext onDragEnd={onDragEnd}>

            <div className="container-fluid height-100p">
              <div className="row height-100p">
                <div className="col-xs-4 height-100p">
                  <h4>{t('binding.characters')}</h4>
                  <InlineNotification type="info" showIf={characterNames.length === 0}>
                    {t('advices.no-character')}
                  </InlineNotification>
                  {
                    characterNames.length !== 0 && (
                      <>
                        <input className="form-control character-filter tw-mb-4" type="search" placeholder={t('binding.character-search')} />
                        <ProfileList
                          droppableId="characterNames"
                          profileType="characterName"
                          profileNames={characterNames.filter(filter(bondedCharacterList))}
                        />
                      </>
                    )
                  }
                </div>
                <div className="col-xs-4 height-100p">
                  <h4>{t('binding.players')}</h4>
                  <InlineNotification type="info" showIf={playerNames.length === 0}>
                    {t('advices.no-player')}
                  </InlineNotification>
                  {
                    playerNames.length !== 0 && (
                      <>
                        <input className="form-control player-filter tw-mb-4" type="search" placeholder={t('binding.player-search')} />
                        <ProfileList
                          droppableId="playerNames"
                          profileType="playerName"
                          profileNames={playerNames.filter(filter(bondedPlayerList))}
                        />
                      </>
                    )
                  }
                </div>
                <div className="col-xs-4 height-100p">
                  <h4>{t('binding.bonded-characters-n-players')}</h4>
                  <input className="form-control binding-filter tw-mb-4" type="search" placeholder={t('binding.binding-search')} />
                  <BindingList bindings={bindings} removeBinding={removeBinding} />
                </div>
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
