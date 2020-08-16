import React, { useState } from 'react';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import FormGroup from 'react-bootstrap/es/FormGroup';
import HelpBlock from 'react-bootstrap/es/HelpBlock';
import { useTranslation } from 'react-i18next';

export function FormDialog(props) {
  const {
    onCancel, onSubmit, show, title, formId, children, data
  } = props;
  if (!formId) {
    throw new Error('formId is required');
  }
  if (!show) {
    return null;
  }

  const { t } = useTranslation();
  const [errorText, setErrorText] = useState(null);

  const handleCancel = onCancel;
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorText(null);
    const formData = new FormData(e.target);

    const formDataObj = {};

    for (const [name, value] of formData) {
      formDataObj[name] = value;
    }

    console.log('handleSubmit called', formDataObj);
    onSubmit(formDataObj, data).then((res) => {
      if (!res) {
        onCancel();
      } else {
        setErrorText(res);
      }
      // console.log('res', res);
    }).catch((err) => {
      console.error('err', err);
    });
  };
  return (
    <Modal show onHide={handleCancel}>
      {
        title && (
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
        )
      }
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit}>
          {children}
          <FormGroup>
            {errorText && <HelpBlock>{errorText}</HelpBlock>}
          </FormGroup>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" bsStyle="primary" form={formId}>
          {t('common.ok')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
