import React from 'react';
import { UI, U, L10n } from 'nims-app-core';
import { useTranslation } from 'react-i18next';
import './OriginCard.css';
import { DateTimePicker } from '../../../commons/uiCommon3';

export function OriginCard(props) {
  const {
    event, metaInfo, storyName, cardTitle,
    showTimeInput, showTextInput, showLockButton
  } = props;
  const { t } = useTranslation();

  function onChangeOriginText(e) {
    const text = e.target.value;
    DBMS.setEventOriginProperty({
      storyName,
      index: event.index,
      property: 'text',
      value: text
    }).catch(UI.handleError);
  }

  function onChangeDateTimeCreator({ dateStr }) {
    DBMS.setEventOriginProperty({
      storyName,
      index: event.index,
      property: 'time',
      value: dateStr
    }).catch(UI.handleError);
  }

  return (
    <div className="OriginCard Origin col-xs-6">
      <div className="panel panel-primary">
        <div className="panel-heading flex-row">
          <h1 className="panel-title card-title flex-1-1-auto">{cardTitle}</h1>
          {
            // showTimeInput && <input className="isStoryEditable time-input form-control flex-0-0-auto" />
            showTimeInput && (
              <DateTimePicker
                className="time-input form-control"
                date={new Date(event.time)}
                defaultDate={new Date(metaInfo.date)}
                onChange={onChangeDateTimeCreator}
              />
            )
          }
          {
            showLockButton && (
              <button
                type="button"
                className="btn btn-default btn-reduced fa-icon locked btn-primary flex-0-0-auto margin-left-8 isStoryEditable"
                title={t('briefings.unlock-event-source')}
              />
            )
          }
        </div>
        <div className="panel-body">
          {
            showTextInput && (
              <textarea
                className="isStoryEditable eventPersonalStory form-control text-input"
                defaultValue={event.text}
                onChange={onChangeOriginText}
              />
            )
          }
        </div>
      </div>
    </div>
  );
}

// // eslint-disable-next-line no-var,vars-on-top
// var onChangeDateTimeCreator = R.curry((storyName, myInput) => (dp, input) => {
//   DBMS.setEventOriginProperty({
//     storyName,
//     index: myInput.eventIndex,
//     property: 'time',
//     value: input.val()
//   }).catch(UI.handleError);
//   U.removeClass(myInput, 'defaultDate');
// });

// const makeOriginCard = (event, metaInfo, storyName, opts) => {
//   const content = U.makeEl('div');
//   ReactDOM.render(getOrigin(), content);
//   const card = U.qee(content, '.Origin');

//   // const card = U.qmte(`${root} .origin-tmpl`);
//   U.addEl(U.qee(card, '.card-title'), U.makeText(opts.cardTitle));
//   const textInput = U.qee(card, '.text-input');
//   const timeInput = U.qee(card, '.time-input');
//   const lockButton = U.qee(card, 'button.locked');

//   if (opts.showTimeInput === true) {
//     UI.makeEventTimePicker2(timeInput, {
//       eventTime: event.time,
//       index: event.index,
//       preGameDate: metaInfo.preGameDate,
//       date: metaInfo.date,
//       onChangeDateTimeCreator: onChangeDateTimeCreator(storyName)
//     });
//   } else {
//     U.addClass(timeInput, 'hidden');
//   }

//   if (opts.showTextInput === true) {
//     textInput.value = event.text;
//     textInput.dataKey = JSON.stringify([storyName, event.index]);
//     U.listen(textInput, 'change', onChangeOriginText);
//   } else {
//     U.addClass(textInput, 'hidden');
//   }

//   if (opts.showLockButton === true) {
//     U.listen(lockButton, 'click', onOriginLockClick(timeInput, textInput));
//     UI.enableEl(timeInput, false);
//     UI.enableEl(textInput, false);
//     L10n.localizeStatic(card);
//   } else {
//     U.addClass(lockButton, 'hidden');
//   }

//   return card;
// };
