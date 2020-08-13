import React from 'react';
import * as R from 'ramda';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import classNames from 'classnames';

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
