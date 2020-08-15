import React, { useState } from 'react';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import HelpBlock from 'react-bootstrap/es/HelpBlock';
import { useTranslation } from 'react-i18next';

export function PromptDialog(props) {
  const {
    onCancel, onSubmit, show, title, defaultValue = ''
  } = props;
  if (!show) {
    return null;
  }

  const { t } = useTranslation();
  const [errorText, setErrorText] = useState(null);

  const handleCancel = onCancel;
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('value');

    console.log('handleSubmit called', value);
    onSubmit(value).then((res) => {
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
        <form id="promptDialogForm" onSubmit={handleSubmit}>
          <FormGroup>
            <FormControl
              type="text"
              name="value"
              autoFocus
              defaultValue={defaultValue}
              onChange={() => setErrorText(null)}
              validationState={errorText ? 'error' : null}
              autoComplete="off"
            />
            {errorText && <HelpBlock>{errorText}</HelpBlock>}
          </FormGroup>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" bsStyle="primary" form="promptDialogForm">
          {t('common.ok')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
