import React from 'react';
import classNames from 'classnames';

export function InlineNotification(props) {
  const { showIf = true, children, type = 'info' } = props;
  if (!showIf) {
    return null;
  }
  if (type == undefined) {
    console.error('Notification type is not specified');
  }
  return (
    <div className={classNames('alert', {
      'alert-info': type === 'info',
      'alert-warning': type === 'warning',
    })}
    >
      {children}
    </div>
  );
}
