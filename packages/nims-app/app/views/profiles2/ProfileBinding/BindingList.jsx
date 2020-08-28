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

export function BindingList(props) {
  const { bindings, removeBinding } = props;
  const { t } = useTranslation();
  return (
    <div className="entity-list binding-list2">
      {
        bindings.map((binding) => (
          <div className="BindingItem btn-group tw-flex">
            <div className="btn btn-default tw-text-left tw-flex-auto">
              {binding.name}
            </div>
            <button
              type="button"
              className="btn btn-default btn-reduced fa-icon unlink flex-0-0-auto transparent"
              onClick={removeBinding}
              data-binding-str={JSON.stringify(binding.value)}
              title={t('binding.unlink-binding')}
            />
          </div>
        ))
      }
    </div>
  );
}
