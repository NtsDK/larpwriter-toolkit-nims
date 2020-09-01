import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UI, U, L10n } from 'nims-app-core';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { ToggleButton } from '../../../commons/uiCommon3';
import './AdaptationCard.css';

export function AdaptationCard(props) {
  const {
    isEditable, event, storyName, characterName,
    showFinishedButton, showTimeInput, showTextInput, cardTitle
  } = props;
  const { t } = useTranslation();
  const { dbms } = useContext(DbmsContext);

  const [isFinished, setIsFinished] = useState(event.characters[characterName].ready);

  function onChangePersonalTime(e) {
    const time = e.target.value;
    dbms.setEventAdaptationProperty({
      storyName,
      eventIndex: event.index,
      characterName,
      type: 'time',
      value: time
    }).catch(UI.handleError);
  }

  function onChangeAdaptationText(e) {
    // const dataKey = JSON.parse(event.target.dataKey);
    const text = e.target.value;
    dbms.setEventAdaptationProperty({
      storyName,
      eventIndex: event.index,
      characterName,
      type: 'text',
      value: text
    }).catch(UI.handleError);
  }

  function onChangeAdaptationReadyStatus2(e) {
    const { checked } = e.target;
    setIsFinished(checked);

    dbms.setEventAdaptationProperty({
      storyName,
      eventIndex: event.index,
      characterName,
      type: 'ready',
      value: checked
    }).catch(UI.handleError);
  }

  return (
    <div className="AdaptationCard col-xs-6">
      <div className="panel panel-default">
        <div className="panel-heading flex-row">
          <h1 className="panel-title card-title flex-1-1-auto">{cardTitle}</h1>
          {
            showTimeInput
            && (
              <input
                className=" time-input form-control flex-0-0-auto"
                placeholder={t('adaptations.subjective-time')}
                defaultValue={event.characters[characterName].time}
                onChange={onChangePersonalTime}
                disabled={isFinished}
              />
            )
          }
          {
            showFinishedButton
            && (
              <ToggleButton
                type="checkbox"
                checked={isFinished}
                title={t('constant.finishedText')}
                onChange={onChangeAdaptationReadyStatus2}
                className="finished"
              />
            )
          }
        </div>
        <div className="panel-body">
          {
            showTextInput
            && (
              <textarea
                className="eventPersonalStory form-control text-input"
                placeholder={t('adaptations.adaptation-text')}
                defaultValue={event.characters[characterName].text}
                onChange={onChangeAdaptationText}
                readOnly={isFinished}
              />
            )
          }
        </div>
      </div>
    </div>
  );
}

// export const populateAdaptationTimeInput = (input, storyName, event, characterName, isEditable) => {
//   U.setClassByCondition(input, 'notEditable', !isEditable);
//   input.value = event.characters[characterName].time;
//   input.dataKey = JSON.stringify([storyName, event.index, characterName]);
//   U.listen(input, 'change', onChangePersonalTimeDelegate);
//   return input;
// };

// var onChangePersonalTimeDelegate = (event) => {
//   const dataKey = JSON.parse(event.target.dataKey);
//   const time = event.target.value;
//   DBMS.setEventAdaptationProperty({
//     storyName: dataKey[0],
//     eventIndex: dataKey[1],
//     characterName: dataKey[2],
//     type: 'time',
//     value: time
//   }).catch(handleError);
// };

// const makeAdaptationCard = R.curry((isEditable, event, storyName, characterName, opts) => {
//   const content = U.makeEl('div');
//   ReactDOM.render(getAdaptation(), content);
//   const card = U.qee(content, '.Adaptation');

//   // const card = U.qmte(`${root} .adaptation-tmpl`);
//   U.setAttr(card, 'dependent-on-character', characterName);

//   U.addEl(U.qee(card, '.card-title'), U.makeText(opts.cardTitle));
//   const textInput = U.qee(card, '.text-input');
//   const timeInput = U.qee(card, '.time-input');
//   const finishedButton = U.qee(card, 'button.finished');
//   const id = JSON.stringify([storyName, event.index, characterName]);

//   if (opts.showTimeInput === true) {
//     UI.populateAdaptationTimeInput(timeInput, storyName, event, characterName, isEditable);
//   } else {
//     U.addClass(timeInput, 'hidden');
//   }

//   if (opts.showTextInput === true) {
//     U.setClassByCondition(textInput, 'notEditable', !isEditable);
//     textInput.value = event.characters[characterName].text;
//     textInput.dataKey = JSON.stringify([storyName, event.index, characterName]);
//     U.listen(textInput, 'change', onChangeAdaptationText);
//   } else {
//     U.addClass(textInput, 'hidden');
//   }

//   if (opts.showFinishedButton === true) {
//     const isFinished = event.characters[characterName].ready;
//     U.setClassByCondition(finishedButton, 'notEditable', !isEditable);
//     U.setClassIf(finishedButton, 'btn-primary', isFinished);
//     finishedButton.id = id;
//     const enableInputs = (value) => {
//       UI.enableEl(textInput, !value);
//       UI.enableEl(timeInput, !value);
//     };
//     enableInputs(isFinished);
//     U.listen(finishedButton, 'click', UI.onChangeAdaptationReadyStatus2(enableInputs));
//     L10n.localizeStatic(card);
//   } else {
//     U.addClass(finishedButton, 'hidden');
//   }

//   return card;
// });
