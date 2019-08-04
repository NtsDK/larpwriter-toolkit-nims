import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './SimpleExport.css';

export default function SimpleExport(props) {
  const { t } = props;

  return (
    <div className=" SimpleExportexportContainer">
      <button type="button" className="btn btn-default btn-reduced">{t('briefings.make-docx-by-time')}</button>
      <button type="button" className="btn btn-default btn-reduced">{t('briefings.make-docx-by-stories')}</button>
      <button type="button" className="btn btn-default btn-reduced">{t('briefings.make-inventory')}</button>
    </div>
  );
}

SimpleExport.propTypes = {
  // bla: PropTypes.string,
};

SimpleExport.defaultProps = {
  // bla: 'test',
};
