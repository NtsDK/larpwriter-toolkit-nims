import React from 'react';
import * as R from 'ramda';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';
import classNames from 'classnames';
import Switch from 'react-switch';
import camelCase from 'camelcase';
import { useTranslation } from 'react-i18next';

export function ToggleButton(props) {
  const {
    checked, onChange, title, data, tooltip, type, name, className, text, ...elementProps
  } = props;
  const { t } = useTranslation();

  if (type === 'radio' && !name) {
    throw new Error('Name is required for radio');
  }

  let body;
  if (type === 'radio' || type === 'checkbox') {
    body = getStandardBody(props);
  } else if (type === 'switch') {
    body = getSwitchBody(props, t);
  } else {
    throw new Error(`Unexpected toggle type ${type}`);
  }

  return tooltip ? (
    <OverlayTrigger placement="top" overlay={tooltip}>
      {body}
    </OverlayTrigger>
  ) : body;
}

function getStandardBody(props) {
  const {
    checked, onChange, title, data, tooltip, type, name, className, text, ...elementProps
  } = props;
  const dataAttrs = getDataAttrs(data);
  return (
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
        onChange={onChange}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...dataAttrs}
      />
    </label>
  );
}

function getSwitchBody(props, t) {
  const {
    checked, onChange, title, data, tooltip, type, name, className, text, ...elementProps
  } = props;
  const dataAttrs = getDataAttrs(data);
  function customOnChange(checked) {
    onChange({
      target: {
        checked,
        dataset: getDataset(data)
      }
    });
  }
  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: 12,
    color: '#333333',
  };
  return (
    <label className={className} {...elementProps}>
      {
        title && <span className="tw-mr-4 tw-font-medium">{title}</span>
      }
      <Switch
        onChange={customOnChange}
        name={name}
        onColor="#c6f6d5"
        offColor="#dddddd"
        checked={checked}
        className="tw-align-middle"
        height={20}
        width={48}
        uncheckedIcon={<div style={{ ...style, paddingRight: 2 }}>{t('constant.no')}</div>}
        checkedIcon={<div style={{ ...style, paddingLeft: 2 }}>{t('constant.yes')}</div>}
      />
    </label>
  );
}

function getDataAttrs(data) {
  const dataAttrs = {};
  if (data) {
    R.keys(data).forEach((name) => (dataAttrs[`data-${name}`] = data[name]));
  }
  return dataAttrs;
}

function getDataset(data) {
  const dataset = {};
  if (data) {
    R.keys(data).forEach((name) => (dataset[camelCase(name)] = data[name]));
  }
  return dataset;
}
