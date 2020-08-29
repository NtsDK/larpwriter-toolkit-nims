import React, { Component } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import {
  NavLink, Route, Redirect, Switch, useHistory, useRouteMatch
} from 'react-router-dom';
import * as CU from 'nims-dbms-core/commonUtils';
import * as R from 'ramda';
import PermissionInformer from 'permissionInformer';
import Button from 'react-bootstrap/es/Button';
import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import { useTranslation } from 'react-i18next';
import { CommonCreateStoryDialog } from './CommonCreateStoryDialog.jsx';

export function CreateStoryDialog(props) {
  const {
    refresh, ...elementProps
  } = props;
  const history = useHistory();
  async function onCreate({ profileName }) {
    try {
      try {
        await PermissionInformer.refresh();
        await refresh();
        history.push(`/stories/${profileName}`);
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
    <CommonCreateStoryDialog
      onCreate={onCreate}
      {...elementProps}
    />
  );
}
