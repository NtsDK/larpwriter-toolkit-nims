import React, { useState } from 'react';
import './AdaptationsStorySelector.css';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  Redirect,
  useParams,
  useHistory
} from 'react-router-dom';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ToggleButton } from '../../../commons/uiCommon3';

export function AdaptationsStorySelector(props) {
  const { options } = props;
  if (options === null) {
    return null;
  }
  const [showType, setShowType] = useState('showAllStories');
  const { id: value } = useParams();
  const history = useHistory();
  function onChange(e) {
    history.push(`/adaptations/${e.target.value}`);
  }
  const { t } = useTranslation();
  function onShowTypeChange(e) {
    setShowType(e.target.dataset.showType);
  }
  return (
    <div className="AdaptationsStorySelectorpanel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">
          {t('adaptations.stories')}
        </h3>
      </div>
      <div className="panel-body panel-resizable form-group">
        <div className="btn-group tw-flex">
          <ToggleButton
            type="radio"
            checked={showType === 'showAllStories'}
            text={t('adaptations.all-stories-label')}
            name="adaptation-story-switch"
            className="tw-flex-auto"
            data={{ 'show-type': 'showAllStories' }}
            onChange={onShowTypeChange}
          />
          <ToggleButton
            type="radio"
            checked={showType === 'showUnfinishedStories'}
            name="adaptation-story-switch"
            className="tw-flex-auto"
            text={t('adaptations.unfinished-stories-label')}
            data={{ 'show-type': 'showUnfinishedStories' }}
            onChange={onShowTypeChange}
          />
        </div>
        {/* <input selector-filter="#events-storySelector" /> */}
        <select className="form-control" value={value} onChange={onChange} size={Math.min(15, options.length)}>
          {
            options.filter((option) => showType === 'showAllStories' || !option.isFinished).map(({ value, displayName, status }) => (
              <option
                key={value}
                value={value}
                className={classNames('fa-icon select-icon-padding', {
                  empty: status === 'empty',
                  finished: status === 'finished',
                  'finished transparent-icon': status === 'unfinished',
                })}
              >
                {displayName}
              </option>
            ))
          }
        </select>
      </div>
    </div>
  );
}
