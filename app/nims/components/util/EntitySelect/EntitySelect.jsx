import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './EntitySelect.css';

export default function EntitySelect({ onChange, names, id }) {
  return (
    <select className="common-select form-control" onChange={onChange} value={id}>
      {
        names.map(name => (<option key={name} value={name}>{name}</option>))
      }
    </select>
  );
}

EntitySelect.propTypes = {
  // bla: PropTypes.string,
};

EntitySelect.defaultProps = {
  // bla: 'test',
};
