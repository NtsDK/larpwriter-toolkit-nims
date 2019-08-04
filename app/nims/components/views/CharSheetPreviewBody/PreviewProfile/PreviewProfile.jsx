import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PreviewProfile.css';

export default function PreviewProfile({ structure, profile, t }) {
  return (
    <div className=" PreviewProfile form-horizontal insertion-point profile-table">
      {
        structure.filter(element => element.doExport).map(element => (
          <div className="form-group">
            <label className="col-xs-3 control-label profile-item-name">{element.name}</label>
            <div className="col-xs-9 profile-item-input form-control-static">
              {
                formatValue(element, profile, t)
              }
            </div>
          </div>
        ))
      }
    </div>
  );
}

function formatValue(element, profile, t) {
  switch (element.type) {
  case 'text':
    return <span className="briefingTextSpan">{profile[element.name]}</span>;
  case 'enum':
  case 'multiEnum':
  case 'number':
  case 'string':
    return <>{profile[element.name]}</>;
  case 'checkbox':
    return <>{t(`constant.${String(profile[element.name])}`)}</>;
  default:
    return <>{`Unexpected type ${element.type}`}</>;
  }
}

PreviewProfile.propTypes = {
  // bla: PropTypes.string,
};

PreviewProfile.defaultProps = {
  // bla: 'test',
};
