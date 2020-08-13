import React, { useState } from 'react';
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
