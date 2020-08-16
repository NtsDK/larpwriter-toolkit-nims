import React, { cloneElement, useState } from 'react';

export function ModalTrigger(props) {
  const { children, modal } = props;

  const child = React.Children.only(children);

  const [show, setShow] = useState(false);

  const triggerProps = {};
  triggerProps.onClick = () => setShow(true);

  const modalProps = {};
  modalProps.onCancel = () => setShow(false);
  modalProps.show = show;

  return (
    <>
      {cloneElement(child, triggerProps)}
      {show && cloneElement(modal, modalProps)}
    </>
  );
}
