import React, { Component } from 'react';
import { useTranslation } from 'react-i18next';

export function EventGroupSelector(props) {
  const {
    timelineFilter, onTimelineFilterChange, selectedValues, selectorValues, onSelectChange
  } = props;
  const { t } = useTranslation();
  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">{t('timeline.timeline')}</h3>
      </div>
      <div className="panel-body panel-resizable">
        <div>
          <input
            type="radio"
            name="timelineFilter"
            value="ByStory"
            id="timelineFilterByStory"
            className="hidden"
            checked={timelineFilter === 'ByStory'}
            onChange={onTimelineFilterChange}
          />
          <label htmlFor="timelineFilterByStory" className="radio-label-icon common-radio">
            <span>{t('timeline.filter-by-stories')}</span>
          </label>
        </div>
        <div>
          <input
            type="radio"
            name="timelineFilter"
            value="ByCharacter"
            id="timelineFilterByCharacter"
            className="hidden"
            checked={timelineFilter === 'ByCharacter'}
            onChange={onTimelineFilterChange}
          />
          <label htmlFor="timelineFilterByCharacter" className="radio-label-icon common-radio">
            <span>{t('timeline.filter-by-characters')}</span>
          </label>
        </div>

        <select
          value={selectedValues}
          size={selectorValues.length > 20 ? 20 : selectorValues.length}
          multiple
          className="form-control"
          onChange={onSelectChange}
        >
          {
            selectorValues.map((obj) => (
              <option
                key={obj.value}
                value={obj.value}
                className={obj.hasEvents
                  ? 'fa-icon finished transparent-icon select-icon-padding'
                  : 'fa-icon empty icon-padding select-icon-padding'}
              >
                {obj.displayName}
              </option>
            ))
          }
        </select>
      </div>
    </div>
  );
}
