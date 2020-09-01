import React from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import Button from 'react-bootstrap/es/Button';
import { useTranslation } from 'react-i18next';
import { ModalTrigger } from '../uiCommon3/ModalTrigger.jsx';

import './EntityNav.css';

export function EntityNav(props) {
  const {
    entityList, createEntityText, entityUrl, createEntityDialog, getEntityDropdown
  } = props;
  const { t } = useTranslation();

  return (
    <div className="EntityNav panel panel-default  entity-select height-100p">
      <div className="panel-body height-100p">
        <div className="flex-row entity-toolbar">
          <input className="form-control entity-filter flex-1-1-auto" type="search" />
          <ModalTrigger
            modal={createEntityDialog}
          >
            <Button
              className="btn-reduced fa-icon create flex-0-0-auto"
              title={t(createEntityText)}
            />
          </ModalTrigger>
        </div>
        <ul className="entity-list ">
          {
            entityList.map((entity) => (
              <li className="flex-row">
                <NavLink className="btn btn-default flex-1-1-auto text-align-left" to={`${entityUrl}/${entity.primaryName}`}>
                  <div>{entity.primaryName}</div>
                  {entity.secondaryName && <div className="small">{entity.secondaryName}</div>}
                </NavLink>
                {getEntityDropdown(entity)}
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
}
