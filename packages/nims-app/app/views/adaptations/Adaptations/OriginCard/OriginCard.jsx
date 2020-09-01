import React, { useContext } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import { useTranslation } from 'react-i18next';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import FormControl from 'react-bootstrap/es/FormControl';
import './OriginCard.css';
import { Draggable } from 'react-beautiful-dnd';
import { DateTimePicker } from '../../../commons/uiCommon3';
import { StoryEventDropdown } from '../../../stories/Stories/StoryEventDropdown/index';

export function OriginCard(props) {
  const {
    event, metaInfo, storyName, refresh, nextEvent
    // showTimeInput, showTextInput, showLockButton
  } = props;
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  function onChangeEventName(e) {
    const text = e.target.value;
    dbms.setEventOriginProperty({
      storyName,
      index: event.index,
      property: 'name',
      value: text
    }).then(UI.handleError);
  }

  function onChangeOriginText(e) {
    const text = e.target.value;
    dbms.setEventOriginProperty({
      storyName,
      index: event.index,
      property: 'text',
      value: text
    }).catch(UI.handleError);
  }

  function onChangeDateTimeCreator({ dateStr }) {
    dbms.setEventOriginProperty({
      storyName,
      index: event.index,
      property: 'time',
      value: dateStr
    }).catch(UI.handleError);
  }

  return (
    // <Draggable draggableId={storyName + event.name + event.index} index={event.index}>
    //   {
    //     (provided) => (
    <div
      className="OriginCard Origin"
      // {...provided.draggableProps}
      // {...provided.dragHandleProps}
      // ref={provided.innerRef}
    >
      <div className="panel panel-primary">
        <div className="panel-heading flex-row">
          <FormControl defaultValue={event.name} onChange={onChangeEventName} className="tw-mr-4" />
          {
            // showTimeInput && <input className="isStoryEditable time-input form-control flex-0-0-auto" />
            // showTimeInput && (
            <DateTimePicker
              className="time-input form-control tw-mr-4"
              date={event.time !== '' ? new Date(event.time) : null}
              defaultDate={new Date(metaInfo.date)}
              onChange={onChangeDateTimeCreator}
            />
            // )
          }
          {/* {
            showLockButton && (
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon locked btn-primary flex-0-0-auto margin-left-8 isStoryEditable"
                title={t('briefings.unlock-event-source')}
              />
            )
          } */}
          <StoryEventDropdown
            event={event}
            storyName={storyName}
            refresh={refresh}
            nextEvent={nextEvent}
          />
        </div>
        <div className="panel-body">
          {/* {
            showTextInput && ( */}
          <textarea
            className="isStoryEditable eventPersonalStory form-control text-input"
            defaultValue={event.text}
            onChange={onChangeOriginText}
          />
        </div>
      </div>
    </div>
    //     )
    //   }
    // </Draggable>
  );
}
