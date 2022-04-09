import PermissionInformer from 'permissionInformer';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';
import {
  getAdaptationsTemplate,
  getAdaptationRow,
  getOrigin,
  getAdaptation
} from './AdaptationsTemplate.jsx';
import { getAlertBlock } from '../commons/uiCommons2.jsx';
import {
  getStoryCharacterCompleteness, getStoryEventCompleteness, getCharacterNames, getEventIndexes
} from './adaptationUtils';

const root = '.adaptations-tab ';

let content;
function getContent() {
  return content;
}

function init() {
  content = U.makeEl('div');
  U.addEl(U.qe('.tab-container'), content);
  ReactDOM.render(getAdaptationsTemplate(), content);
  L10n.localizeStatic(content);

  U.listen(U.queryEl('#events-storySelector'), 'change', updateAdaptationSelectorDelegate);
  U.listen(U.queryEl('#events-characterSelector'), 'change', showPersonalStoriesByCharacters);
  U.listen(U.queryEl('#events-eventSelector'), 'change', showPersonalStoriesByEvents);
  U.listen(U.queryEl('#finishedStoryCheckbox'), 'change', refresh);
  U.queryEls('.adaptations-tab input[name=adaptationFilter]').map(U.listen(R.__, 'change', updateFilter));
  content = U.queryEl(root);
}

function refresh() {
  const selector = U.clearEl(U.queryEl('#events-storySelector'));
  U.clearEl(U.queryEl('#events-characterSelector'));
  U.clearEl(U.queryEl('#events-eventSelector'));
  U.clearEl(U.queryEl('#personalStories'));

  Promise.all([
    PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }),
    DBMS.getFilteredStoryNames({ showOnlyUnfinishedStories: U.queryEl('#finishedStoryCheckbox').checked })
  ]).then((results) => {
    const [allStoryNames, storyNames] = results;
    U.showEl(U.qe(`${root} .alert`), storyNames.length === 0);
    U.showEl(U.qe(`${root} .adaptations-content`), storyNames.length !== 0);

    if (storyNames.length <= 0) { return; }

    const selectedStoryName = getSelectedStoryName(storyNames);

    const filteredArr = R.indexBy(R.prop('storyName'), storyNames);

    const storyNames2 = allStoryNames.filter((story) => R.contains(story.value, R.keys(filteredArr))).map((story) => {
      const elem = filteredArr[story.value];
      elem.displayName = story.displayName;
      elem.value = story.value;
      return elem;
    });

    let option;
    storyNames2.forEach((storyName) => {
      option = U.addEl(U.makeEl('option'), (U.makeText(storyName.displayName)));
      U.addClass(option, getIconClass(storyName));
      U.setProp(option, 'selected', storyName.value === selectedStoryName);
      U.setProp(option, 'storyInfo', storyName.value);
      U.addEl(selector, option);
    });
    U.setAttr(selector, 'size', Math.min(storyNames2.length, 10));
    showPersonalStories(selectedStoryName);
  }).catch(UI.handleError);
}

function updateAdaptationSelectorDelegate(event) {
  U.clearEl(U.queryEl('#personalStories'));
  const storyName = event.target.selectedOptions[0].storyInfo;
  updateSettings('storyName', storyName);
  updateSettings('characterNames', null);
  updateSettings('eventIndexes', null);
  showPersonalStories(storyName);
}

function updateAdaptationSelector(story, allCharacters) {
  const characterSelector = U.clearEl(U.queryEl('#events-characterSelector'));
  const eventSelector = U.clearEl(U.queryEl('#events-eventSelector'));

  let characterArray = getStoryCharacterCompleteness(story);
  let eventArray = getStoryEventCompleteness(story);

  const showOnlyUnfinishedStories = U.queryEl('#finishedStoryCheckbox').checked;
  if (showOnlyUnfinishedStories) {
    characterArray = characterArray.filter((elem) => !elem.isFinished || elem.isEmpty);
    eventArray = eventArray.filter((elem) => !elem.isFinished || elem.isEmpty);
  }

  const characterNames = getCharacterNames(characterArray);
  const eventIndexes = getEventIndexes(eventArray);

  const map = R.indexBy(R.prop('value'), allCharacters);

  characterArray.forEach((elem) => {
    elem.displayName = map[elem.characterName].displayName;
    elem.value = map[elem.characterName].value;
  });

  characterArray.sort(CU.charOrdAObject);

  let option;
  characterArray.forEach((elem) => {
    option = U.addEl(U.makeEl('option'), (U.makeText(elem.displayName)));
    U.addClass(option, getIconClass(elem));
    U.setProp(option, 'selected', characterNames.indexOf(elem.value) !== -1);
    U.setProp(option, 'storyInfo', story.name);
    U.setProp(option, 'characterName', elem.value);
    U.addEl(characterSelector, option);
  });
  U.setAttr(characterSelector, 'size', characterArray.length);

  eventArray.forEach((elem) => {
    option = U.addEl(U.makeEl('option'), (U.makeText(elem.name)));
    U.addClass(option, getIconClass(elem));
    U.setProp(option, 'selected', eventIndexes.indexOf(elem.index) !== -1);
    U.setProp(option, 'storyInfo', story.name);
    U.setProp(option, 'eventIndex222', elem.index);
    U.addEl(eventSelector, option);
  });
  U.setAttr(eventSelector, 'size', eventArray.length);

  const { selectedFilter } = SM.getSettings().Adaptations;
  U.queryEl(`#${selectedFilter}`).checked = true;
  updateFilter({
    target: {
      id: selectedFilter
    }
  });
}

function updateFilter(event) {
  updateSettings('selectedFilter', event.target.id);
  const byCharacter = event.target.id === 'adaptationFilterByCharacter';
  U.hideEl(U.queryEl('#events-characterSelectorDiv'), !byCharacter);
  U.hideEl(U.queryEl('#events-eventSelectorDiv'), byCharacter);
  if (byCharacter) {
    showPersonalStoriesByCharacters();
  } else {
    showPersonalStoriesByEvents();
  }
}

function showPersonalStoriesByCharacters() {
  const eventRows = U.queryElEls(content, '.eventRow-dependent');
  eventRows.map(U.removeClass(R.__, 'hidden'));
  U.nl2array(U.queryElEls(content, 'div[dependent-on-character]')).map(U.addClass(R.__, 'hidden'));

  const characterNames = U.nl2array(U.queryEl('#events-characterSelector').selectedOptions).map((opt) => opt.characterName);
  characterNames.forEach((name) => U.queryElEls(content, `div[dependent-on-character="${name}"]`).map(U.removeClass(R.__, 'hidden')));
  eventRows.map((row) => U.hideEl(row, R.intersection(row.dependsOnCharacters, characterNames).length === 0));

  updateSettings('characterNames', characterNames);
}

function showPersonalStoriesByEvents() {
  U.queryElEls(content, 'div[dependent-on-character]').map(U.removeClass(R.__, 'hidden'));
  U.queryElEls(content, '.eventRow-dependent').map(U.addClass(R.__, 'hidden'));

  const eventIndexes = U.nl2array(U.queryEl('#events-eventSelector').selectedOptions).map((opt) => opt.eventIndex222);
  eventIndexes.forEach((index) => U.removeClass(U.queryEls(`.${index}-dependent`)[0], 'hidden'));
  updateSettings('eventIndexes', eventIndexes);
}

function showPersonalStories(storyName) {
  Promise.all([
    DBMS.getMetaInfo(),
    DBMS.getStory({ storyName }),
    PermissionInformer.isEntityEditable({ type: 'story', name: storyName }),
    PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false })
  ]).then((results) => {
    const [metaInfo, story, isStoryEditable, allCharacters] = results;
    const characterNames = R.keys(story.characters);
    const adaptations = characterNames.map((characterName) => ({
      characterName,
      storyName
    }));
    PermissionInformer.areAdaptationsEditable({ adaptations }).then((areAdaptationsEditable) => {
      story.events.forEach((item, i) => (item.index = i));
      buildAdaptationInterface(
        storyName, characterNames, story.events, areAdaptationsEditable,
        metaInfo
      );
      updateAdaptationSelector(story, allCharacters);
      UI.enable(content, 'isStoryEditable', isStoryEditable);
      UI.enable(content, 'notEditable', false);
    }).catch(UI.handleError);
  }).catch(UI.handleError);
}

function buildAdaptationInterface(storyName, characterNames, events, areAdaptationsEditable, metaInfo) {
  const div = U.clearEl(U.queryEl('#personalStories'));
  if (events.length === 0) {
    const content = U.makeEl('div');
    ReactDOM.render(getAlertBlock(), content);
    const alert = U.qee(content, '.AlertBlock');
    // const alert = U.qmte('.alert-block-tmpl');
    U.addEl(alert, U.makeText(L10n.get('advices', 'no-events-in-story')));
    U.addClass(alert, 'margin-bottom-8');
    U.addEl(div, alert);
  }
  if (characterNames.length === 0) {
    const content = U.makeEl('div');
    ReactDOM.render(getAlertBlock(), content);
    const alert = U.qee(content, '.AlertBlock');
    // const alert = U.qmte('.alert-block-tmpl');
    U.addEl(alert, U.makeText(L10n.get('advices', 'no-characters-in-story')));
    U.addClass(alert, 'margin-bottom-8');
    U.addEl(div, alert);
  }
  const adaptationsNum = R.flatten(events.map((event) => R.keys(event.characters))).length;
  if (adaptationsNum === 0) {
    const content = U.makeEl('div');
    ReactDOM.render(getAlertBlock(), content);
    const alert = U.qee(content, '.AlertBlock');
    // const alert = U.qmte('.alert-block-tmpl');
    U.addEl(alert, U.makeText(L10n.get('advices', 'no-adaptations-in-story')));
    U.addClass(alert, 'margin-bottom-8');
    U.addEl(div, alert);
  }

  U.addEls(div, events.map((event) => {
    const content = U.makeEl('div');
    ReactDOM.render(getAdaptationRow(), content);
    const row = U.qee(content, '.AdaptationRow');

    // const row = U.qmte(`${root} .adaptation-row-tmpl`);
    U.addClass(row, `${event.index}-dependent`);
    row.dependsOnCharacters = R.keys(event.characters);
    U.addEl(U.qee(row, '.eventMainPanelRow-left'), makeOriginCard(event, metaInfo, storyName, {

      showTimeInput: true,
      showTextInput: true,
      cardTitle: event.name
    }));
    U.addEls(U.qee(row, '.events-eventsContainer'), characterNames
      .filter((characterName) => event.characters[characterName])
      .map((characterName) => {
        const isEditable = areAdaptationsEditable[`${storyName}-${characterName}`];
        return makeAdaptationCard(isEditable, event, storyName, characterName, {
          showFinishedButton: true,
          showTimeInput: true,
          showTextInput: true,
          cardTitle: characterName
        });
      }));

    return row;
  }));
}

const makeOriginCard = (event, metaInfo, storyName, opts) => {
  const content = U.makeEl('div');
  ReactDOM.render(getOrigin(), content);
  const card = U.qee(content, '.Origin');

  // const card = U.qmte(`${root} .origin-tmpl`);
  U.addEl(U.qee(card, '.card-title'), U.makeText(opts.cardTitle));
  const textInput = U.qee(card, '.text-input');
  const timeInput = U.qee(card, '.time-input');
  const lockButton = U.qee(card, 'button.locked');

  if (opts.showTimeInput === true) {
    UI.makeEventTimePicker2(timeInput, {
      eventTime: event.time,
      index: event.index,
      preGameDate: metaInfo.preGameDate,
      date: metaInfo.date,
      onChangeDateTimeCreator: onChangeDateTimeCreator(storyName)
    });
  } else {
    U.addClass(timeInput, 'hidden');
  }

  if (opts.showTextInput === true) {
    textInput.value = event.text;
    textInput.dataKey = JSON.stringify([storyName, event.index]);
    U.listen(textInput, 'change', onChangeOriginText);
  } else {
    U.addClass(textInput, 'hidden');
  }

  if (opts.showLockButton === true) {
    U.listen(lockButton, 'click', onOriginLockClick(timeInput, textInput));
    UI.enableEl(timeInput, false);
    UI.enableEl(textInput, false);
    L10n.localizeStatic(card);
  } else {
    U.addClass(lockButton, 'hidden');
  }

  return card;
};

function onOriginLockClick(timeInput, textInput) {
  return (event) => {
    const { target } = event;
    const isLocked = U.hasClass(target, 'btn-primary');
    U.setClassByCondition(target, 'btn-primary', !isLocked);
    U.setClassByCondition(target, 'locked', !isLocked);
    U.setClassByCondition(target, 'unlocked', isLocked);
    UI.enableEl(timeInput, isLocked);
    UI.enableEl(textInput, isLocked);
  };
}

const makeAdaptationCard = R.curry((isEditable, event, storyName, characterName, opts) => {
  const content = U.makeEl('div');
  ReactDOM.render(getAdaptation(), content);
  const card = U.qee(content, '.Adaptation');

  // const card = U.qmte(`${root} .adaptation-tmpl`);
  U.setAttr(card, 'dependent-on-character', characterName);

  U.addEl(U.qee(card, '.card-title'), U.makeText(opts.cardTitle));
  const textInput = U.qee(card, '.text-input');
  const timeInput = U.qee(card, '.time-input');
  const finishedButton = U.qee(card, 'button.finished');
  const id = JSON.stringify([storyName, event.index, characterName]);

  if (opts.showTimeInput === true) {
    UI.populateAdaptationTimeInput(timeInput, storyName, event, characterName, isEditable);
  } else {
    U.addClass(timeInput, 'hidden');
  }

  if (opts.showTextInput === true) {
    U.setClassByCondition(textInput, 'notEditable', !isEditable);
    textInput.value = event.characters[characterName].text;
    textInput.dataKey = JSON.stringify([storyName, event.index, characterName]);
    U.listen(textInput, 'change', onChangeAdaptationText);
  } else {
    U.addClass(textInput, 'hidden');
  }

  if (opts.showFinishedButton === true) {
    const isFinished = event.characters[characterName].ready;
    U.setClassByCondition(finishedButton, 'notEditable', !isEditable);
    U.setClassIf(finishedButton, 'btn-primary', isFinished);
    finishedButton.id = id;
    const enableInputs = (value) => {
      UI.enableEl(textInput, !value);
      UI.enableEl(timeInput, !value);
    };
    enableInputs(isFinished);
    U.listen(finishedButton, 'click', UI.onChangeAdaptationReadyStatus2(enableInputs));
    L10n.localizeStatic(card);
  } else {
    U.addClass(finishedButton, 'hidden');
  }

  return card;
});

// eslint-disable-next-line no-var,vars-on-top
var onChangeDateTimeCreator = R.curry((storyName, myInput) => (dp, input) => {
  DBMS.setEventOriginProperty({
    storyName,
    index: myInput.eventIndex,
    property: 'time',
    value: input.val()
  }).catch(UI.handleError);
  U.removeClass(myInput, 'defaultDate');
});

function onChangeOriginText(event) {
  const dataKey = JSON.parse(event.target.dataKey);
  const text = event.target.value;
  DBMS.setEventOriginProperty({
    storyName: dataKey[0],
    index: dataKey[1],
    property: 'text',
    value: text
  }).catch(UI.handleError);
}

function onChangeAdaptationText(event) {
  const dataKey = JSON.parse(event.target.dataKey);
  const text = event.target.value;
  DBMS.setEventAdaptationProperty({
    storyName: dataKey[0],
    eventIndex: dataKey[1],
    characterName: dataKey[2],
    type: 'text',
    value: text
  }).catch(UI.handleError);
}

function getIconClass(object) {
  if (object.isEmpty) return 'fa-icon empty select-icon-padding';
  if (object.isFinished) return 'fa-icon finished select-icon-padding';
  return 'fa-icon finished transparent-icon select-icon-padding';
}

function updateSettings(name, value) {
  const settings = SM.getSettings();
  settings.Adaptations[name] = value;
}

function getSelectedStoryName(storyNames) {
  const storyNamesOnly = storyNames.map(R.prop('storyName'));

  const settings = SM.getSettings();
  if (!settings.Adaptations) {
    settings.Adaptations = {
      storyName: storyNamesOnly[0],
      characterNames: null,
      eventIndexes: null,
      selectedFilter: 'adaptationFilterByCharacter'
    };
  }
  let { storyName } = settings.Adaptations;
  if (storyNamesOnly.indexOf(storyName) === -1) {
    // eslint-disable-next-line prefer-destructuring
    settings.Adaptations.storyName = storyNamesOnly[0];
    // eslint-disable-next-line prefer-destructuring
    storyName = storyNamesOnly[0];
  }
  return storyName;
}

export default {
  init, refresh, getContent, makeOriginCard, makeAdaptationCard
};
