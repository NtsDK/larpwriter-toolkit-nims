import React, { Component, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

export function SocialNetworkWarning() {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  return (
    <div
      id="socialNetworkWarning"
      className={classNames('alert alert-warning', {
        hidden: !show
      })}
    >
      {t('social-network.require-resources-warning')}
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="tw-bg-gray-200"
      >
        {t('social-network.remove-resources-warning')}
      </button>
    </div>
  );
}
