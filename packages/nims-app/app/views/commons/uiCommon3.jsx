import React, { Component, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import { useTranslation } from 'react-i18next';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
// import * as CU from 'nims-dbms-core/commonUtils';
import classNames from 'classnames';

export function PanelCore(props) {
  const { title, children, initExpanded = true } = props;
  const [expanded, setExpanded] = useState(initExpanded);
  return (
    <div className="panel panel-default">
      <button
        type="button"
        className={classNames('panel-heading expanded',
          expanded ? 'expanded' : 'collapsed')}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="panel-title">{title}</span>
      </button>
      <div className={classNames('panel-body', { hidden: !expanded })}>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog(props) {
  const {
    message, onConfirm, onCancel, show, title
  } = props;
  if (!show) {
    return null;
  }

  const { t } = useTranslation();

  const callback = (val) => {
    if (val) {
      if (onConfirm) onConfirm();
    } else if (onCancel) onCancel();
  };

  const handleCancel = () => callback(false);
  const handleConfirm = () => callback(true);
  return (
    <Modal show onHide={handleCancel}>
      {
        title && (
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
        )
      }
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {t('common.ok')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function InlineNotification(props) {
  const { showIf, children, type } = props;
  if (!showIf) {
    return null;
  }
  if (type == undefined) {
    console.error('Notification type is not specified');
  }
  return (
    <div className={classNames('alert', {
      'alert-info': type === 'info',
      'alert-warning': type === 'warning',
    })}
    >
      {children}
    </div>
  );
}

export function ToggleButton(props) {
  const {
    checked, onChange, title, data, tooltip, type, name, className, text, ...elementProps
  } = props;
  const dataAttrs = {};
  if (data) {
    R.keys(data).forEach((name) => (dataAttrs[`data-${name}`] = data[name]));
  }
  if (type === 'radio' && !name) {
    throw new Error('Name is required for radio');
  }

  const body = (
    <label
      // need this to use OverlayTrigger. Otherwise it doesn't work
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...elementProps}
      className={classNames('btn btn-default fa-icon', className, { 'btn-primary': checked })}
      title={title}
    >
      {text}
      <input
        type={type}
        name={name}
        checked={checked}
        autoComplete="off"
        className="sr-only"
        // className="tw-hidden"
        onChange={onChange}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...dataAttrs}
      />
    </label>
  );

  return tooltip ? (
    <OverlayTrigger placement="top" overlay={tooltip}>
      {body}
    </OverlayTrigger>
  ) : body;
}
