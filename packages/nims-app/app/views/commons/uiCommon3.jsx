import React, { Component, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import { useTranslation } from 'react-i18next';
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
