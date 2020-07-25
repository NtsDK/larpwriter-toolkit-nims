import React, { Component } from 'react';
import dateFormat from 'dateformat';
import { useTranslation } from 'react-i18next';

export function TimelineList(props) {
  const { events } = props;
  const { t } = useTranslation();
  return (
    <div className="tab-pane active" id="timeline-list">
      <div className="container-fluid">
        <div className="row margin-bottom-8">
          <div className="col-xs-2 white-space-normal tw-font-bold">{t('timeline.time')}</div>
          <div className="col-xs-2 white-space-normal tw-font-bold">{t('timeline.story-name')}</div>
          <div className="col-xs-3 white-space-normal tw-font-bold">{t('timeline.event-name')}</div>
          <div className="col-xs-5 white-space-normal tw-font-bold">{t('timeline.characters')}</div>
        </div>
      </div>
      <div className="container-fluid timeline-list">
        {
          events.map((event) => (
            <div className="row">
              <div className="col-xs-2 white-space-normal time">{dateFormat(event.time, 'yyyy/mm/dd h:MM')}</div>
              <div className="col-xs-2 white-space-normal story-name">{event.storyName}</div>
              <div className="col-xs-3 white-space-normal event-name">{event.name}</div>
              <div className="col-xs-5 white-space-normal characters">{event.characters.join(', ')}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
