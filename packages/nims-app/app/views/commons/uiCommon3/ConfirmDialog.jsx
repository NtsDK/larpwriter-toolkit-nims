import React from 'react';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import { useTranslation } from 'react-i18next';

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
