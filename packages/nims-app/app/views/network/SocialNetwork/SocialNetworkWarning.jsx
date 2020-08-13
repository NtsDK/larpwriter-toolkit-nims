import React, { Component, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { InlineNotification } from '../../commons/uiCommon3';

export function SocialNetworkWarning() {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  return (
    <InlineNotification type="warning" showIf={show}>
      {t('social-network.require-resources-warning')}
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="tw-bg-gray-200"
      >
        {t('social-network.remove-resources-warning')}
      </button>
    </InlineNotification>
  );
}
