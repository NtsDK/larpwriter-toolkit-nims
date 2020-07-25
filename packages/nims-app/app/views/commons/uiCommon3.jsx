import React, { Component, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
// import * as CU from 'nims-dbms-core/commonUtils';
import classNames from 'classnames';

export function PanelCore(props) {
  const { title, children, initExpanded = true } = props;
  const [expanded, setExpanded] = useState(initExpanded);
  return (
    <div className="panel panel-default">
      <button
        type="button"
        className={classNames('panel-heading expanded',
          expanded ? 'expanded' : 'collapsed')}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="panel-title">{title}</span>
      </button>
      <div className={classNames('panel-body', { hidden: !expanded })}>
        {children}
      </div>
    </div>
  );
}
