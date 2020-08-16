import React from 'react';
import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import { FormDialog } from './FormDialog.jsx';

export function PromptDialog(props) {
  const {
    defaultValue = '', ...elementProps
  } = props;
  return (
    <FormDialog {...elementProps} data={{ defaultValue }} formId="promptDialogForm">
      <FormGroup>
        <FormControl
          type="text"
          name="value"
          autoFocus
          defaultValue={defaultValue}
          // onChange={() => setErrorText(null)}
          // validationState={errorText ? 'error' : null}
          autoComplete="off"
        />
      </FormGroup>
    </FormDialog>
  );
}
