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
import { InlineNotification } from '../../commons/uiCommon3/InlineNotification.jsx';

export function ProfileBinding(props) {
  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState(null);
  useEffect(() => {
    Promise.all([
      PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }),
      PermissionInformer.getEntityNamesArray({ type: 'player', editableOnly: false }),
      dbms.getProfileBindings()
    ]).then((results) => {
      const [characterNames, playerNames, profileBindings] = results;
      setState({ characterNames, playerNames, profileBindings });
    }).catch(UI.handleError);
    // console.log('useEffect called');
  }, []);

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

  // function rebuildInterface(characterNames, playerNames, profileBindings) {
  //   const bondedCharacterList = R.keys(profileBindings);
  //   const bondedPlayerList = R.values(profileBindings);
  //   const filter = (list) => R.compose(R.not, R.contains(R.__, list), R.prop('value'));

  //   U.showEl(U.queryEl(`${root} .alert.no-character`), characterNames.length === 0);
  //   UI.enableEl(U.queryEl(`${root} .character-filter`), characterNames.length !== 0);
  //   U.showEl(U.queryEl(`${root} .character-list`), characterNames.length !== 0);

  //   U.showEl(U.queryEl(`${root} .alert.no-player`), playerNames.length === 0);
  //   UI.enableEl(U.queryEl(`${root} .player-filter`), playerNames.length !== 0);
  //   U.showEl(U.queryEl(`${root} .player-list`), playerNames.length !== 0);

  //   UI.enableEl(U.queryEl(`${root} .binding-filter`), R.keys(profileBindings).length !== 0);

  //   U.addEls(
  //     U.clearEl(U.queryEl(`${root} .entity-list.character-list`)),
  //     characterNames.filter(filter(bondedCharacterList)).map(profile2el('character'))
  //   );

  //   U.addEls(
  //     U.clearEl(U.queryEl(`${root} .entity-list.player-list`)),
  //     playerNames.filter(filter(bondedPlayerList)).map(profile2el('player'))
  //   );

  //   const bindings = R.toPairs(profileBindings).map((binding) => ({
  //     name: R.join('/', binding),
  //     value: binding
  //   }));
  //   bindings.sort(CU.charOrdAFactory(R.prop('name')));

  //   U.addEls(U.clearEl(U.queryEl(`${root} .entity-list.binding-list`)), bindings.map(binding2el));
  // }

  // const { t } = props;

  return (
    <div className="ProfileBinding profile-binding2-tab block fixed-tab">
      <div className="panel panel-default height-100p">
        <div className="panel-body height-100p">
          <label>{t('binding.binding-tip')}</label>
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
                      <input className="form-control character-filter" type="search" placeholder={t('binding.character-search')} />
                      <div className="entity-list character-list2 tw-flex tw-flex-col">
                        {
                          characterNames.filter(filter(bondedCharacterList)).map((character) => (
                            <div className="btn btn-default tw-flex-auto tw-text-left">{character.displayName}</div>
                          ))
                        }
                      </div>
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
                      <input className="form-control player-filter" type="search" placeholder={t('binding.player-search')} />
                      <div className="entity-list player-list2 tw-flex tw-flex-col">
                        {
                          playerNames.filter(filter(bondedPlayerList)).map((player) => (
                            <div className="btn btn-default tw-flex-auto tw-text-left">{player.displayName}</div>
                          ))
                        }
                      </div>
                    </>
                  )
                }
                {/* <input className="form-control player-filter" type="search" placeholder={t('binding.player-search')} />
                <div className="entity-list player-list2" /> */}
              </div>
              <div className="col-xs-4 height-100p">
                <h4>{t('binding.bonded-characters-n-players')}</h4>
                <input className="form-control binding-filter" type="search" placeholder={t('binding.binding-search')} />
                <div className="entity-list binding-list2">
                  {
                    bindings.map((binding) => (
                      <div className="BindingItem btn-group tw-flex">
                        <div className="btn btn-default tw-text-left tw-flex-auto">
                          {/* <span className="primary-name" /> */}
                          {binding.name}
                        </div>
                        <button type="button" className="btn btn-default btn-reduced fa-icon unlink flex-0-0-auto transparent" />
                      </div>
                      // <div className="btn btn-default tw-flex-auto tw-text-left">{player.displayName}</div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
