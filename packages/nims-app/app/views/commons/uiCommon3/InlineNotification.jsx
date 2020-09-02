import React from 'react';
import classNames from 'classnames';

export function InlineNotification(props) {
  const {
    showIf = true, children, type = 'info', className
  } = props;
  if (!showIf) {
    return null;
  }
  if (type == undefined) {
    console.error('Notification type is not specified');
  }
  return (
    <div className={classNames('alert tw-mb-0', {
      'alert-info': type === 'info',
      'alert-warning': type === 'warning',
    }, className)}
    >
      {children}
    </div>
  );
}
