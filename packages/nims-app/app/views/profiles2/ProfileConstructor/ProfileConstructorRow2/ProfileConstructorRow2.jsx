import React, { useContext } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import { useTranslation } from 'react-i18next';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { Draggable } from 'react-beautiful-dnd';
import { RenameProfileItemDialog } from '../RenameProfileItemDialog.jsx';
import { RemoveProfileItemDialog } from '../RemoveProfileItemDialog.jsx';
import { ChangeProfileItemTypeDialog } from '../ChangeProfileItemTypeDialog.jsx';
import { ModalTrigger } from '../../../commons/uiCommon3/ModalTrigger.jsx';
import { ToggleButton } from '../../../commons/uiCommon3/ToggleButton.jsx';

import './ProfileConstructorRow2.css';

export function ProfileConstructorRow2(props) {
  const { t } = useTranslation();
  const {
    profileStructureItem, i, refresh
  } = props;

  const dbms = useContext(DbmsContext);

  function changeProfileItemPlayerAccess(event) {
    const { value } = event.target;
    const { profileItemName } = event.target.dataset;

    dbms.changeProfileItemPlayerAccess({
      type: 'character',
      profileItemName,
      playerAccessType: value
    }).then(refresh).catch((err) => {
      UI.processError()(err);
    });
  }

  function doExportProfileItemChange(e) {
    const { checked } = e.target;
    const { profileItemName } = e.target.dataset;
    dbms.doExportProfileItemChange({
      type: 'character',
      profileItemName,
      checked
    }).then(refresh).catch((err) => {
      UI.processError()(err);
    });
  }

  const selectData = R.keys(Constants.profileFieldTypes).map((type) => ({
    value: type,
    displayName: t(`constant.${type}`)
  }));

  selectData.sort(CU.charOrdAObject);

  const playerAccessData = Constants.playerAccessTypes.map((type) => ({
    value: type,
    displayName: t(`constant.${type}`)
  }));

  return (
    <Draggable draggableId={profileStructureItem.name} index={i}>
      {
        (provided) => (
          <div
            className="ProfileConstructorRow2 tw-relative tw-bg-white tw-px-12 tw-py-8 tw-mb-4 tw-rounded-md"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <div className="tw-float-right">
              <Dropdown pullRight>
                <Dropdown.Toggle noCaret className="btn btn-default fa-icon kebab" />
                <Dropdown.Menu>
                  <MenuItem>
                    {t('profiles.move-profile-item')}
                  </MenuItem>

                  <ModalTrigger
                    modal={(
                      <RenameProfileItemDialog
                        profileItemName={profileStructureItem.name}
                        onRename={refresh}
                      />
                    )}
                  >
                    <MenuItem>
                      {t('profiles.rename-profile-item')}
                    </MenuItem>
                  </ModalTrigger>

                  <ModalTrigger
                    modal={(
                      <ChangeProfileItemTypeDialog
                        profileItemName={profileStructureItem.name}
                        profileItemType={profileStructureItem.type}
                        onChange={refresh}
                      />
                    )}
                  >
                    <MenuItem>
                      {t('profiles.change-profile-item-type')}
                    </MenuItem>
                  </ModalTrigger>

                  <MenuItem divider />

                  <ModalTrigger
                    modal={(
                      <RemoveProfileItemDialog
                        profileItemName={profileStructureItem.name}
                        index={i}
                        onRemove={refresh}
                      />
                    )}
                  >
                    <MenuItem>
                      {t('profiles.remove-profile-item')}
                    </MenuItem>
                  </ModalTrigger>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="tw-mb-8">
              <div className="tw-text-4xl tw-mb-2">{profileStructureItem.name}</div>
              <div className="tw-text-2xl tw-text-gray-600">{t(`constant.${profileStructureItem.type}`)}</div>
            </div>
            <div className="tw-mb-8">
              body
            </div>
            <div className="tw-text-right">
              <span className="tw-mr-16">
                <span className="tw-mr-4">{t('profiles.profile-item-player-access')}</span>
                <span className="tw-inline-block">
                  <select
                    className="player-access form-control"
                    value={profileStructureItem.playerAccess}
                    onChange={changeProfileItemPlayerAccess}
                    data-profile-item-name={profileStructureItem.name}
                  >
                    {
                      playerAccessData.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.displayName}
                        </option>
                      ))
                    }
                  </select>
                </span>
              </span>

              {/* <span>{t('profiles.profile-item-do-export')}</span> */}
              <span>
                <ToggleButton
                  type="switch"
                  checked={profileStructureItem.doExport}
                  title={t('profiles.profile-item-do-export')}
                  onChange={doExportProfileItemChange}
                  // className="print"
                  data={{ 'profile-item-name': profileStructureItem.name }}
                />
              </span>
            </div>
          </div>
        )
      }
    </Draggable>
  );
}
