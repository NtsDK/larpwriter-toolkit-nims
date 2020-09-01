import React, { useContext } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch, useHistory, useRouteMatch
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import Button from 'react-bootstrap/es/Button';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';
import { CommonCreateProfileDialog } from './CommonCreateProfileDialog.jsx';

export function CreateProfileDialog(props) {
  const {
    refresh, ...elementProps
  } = props;
  const history = useHistory();
  const { permissionInformer } = useContext(DbmsContext);
  async function onCreateProfile({ profileName }) {
    try {
      try {
        await permissionInformer.refresh();
        await refresh();
        history.push(`/characters/characterEditor/${profileName}`);
      } catch (err) {
        UI.handleError(err);
      }
    } catch (err) {
      console.error(err);
      return UI.handleErrorMsg(err);
    }
    return null;
  }
  return (
    <CommonCreateProfileDialog
      onCreate={onCreateProfile}
      {...elementProps}
    />
  );
}
