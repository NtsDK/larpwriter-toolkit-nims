import PermissionInformer from 'permissionInformer';
import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import { CU } from 'nims-dbms-core';

import { getStoryEventTemplate } from './StoryEventTemplate.jsx';
import {
  getStoryEventsTemplate,
  getCreateEventBody,
  getMoveEventBody
} from './StoryEventsTemplate.jsx';
import { createModalDialog } from '../commons/uiCommons';

export default function createStoryEvents(Stories) {
  const state = {};
  const root = '.story-events-tab ';
  let initialized = false;

  let createEventDialog;
  function getCreateEventDialog() {
    return createEventDialog;
  }
  let content;
  function getContent() {
    return content;
  }

  function init() {
    if (initialized) return;

    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getStoryEventsTemplate(), content);
    L10n.localizeStatic(content);

    createEventDialog = createModalDialog('.stories-tab ', createEvent, {
      // bodySelector: 'create-event-body',
      dialogTitle: 'stories-event-creation',
      actionButtonTitle: 'common-create',
      getComponent: getCreateEventBody,
      componentClass: 'CreateEventBody'
    });

    //        U.listen(U.qe(`${root}.create.event`), 'click', () => createEventDialog.showDlg());

    state.moveEventDialog = createModalDialog(root, moveEvent, {
      // bodySelector: 'move-event-body',
      dialogTitle: 'stories-move-event',
      actionButtonTitle: 'common-move',
      getComponent: getMoveEventBody,
      componentClass: 'MoveEventBody'
    });
    content = U.qe(root);
    initialized = true;
  }

  function refresh() {
    clearInterface();
    if (Stories.getCurrentStoryName() === undefined) {
      return;
    }

    Promise.all([
      PermissionInformer.isEntityEditable({ type: 'story', name: Stories.getCurrentStoryName() }),
      DBMS.getMetaInfo(),
      DBMS.getStoryEvents({ storyName: Stories.getCurrentStoryName() })
    ]).then((results) => {
      const [isStoryEditable, metaInfo, events] = results;
      rebuildInterface(events, metaInfo);
      UI.enable(content, 'isStoryEditable', isStoryEditable);
      Stories.chainRefresh();
    }).catch(UI.handleError);
  }

  function clearInterface() {
    U.clearEl(U.queryEl('#eventBlock'));
    const positionSelectors = U.nl2array(document.querySelectorAll('.eventPositionSelector'));
    R.ap([U.clearEl], positionSelectors);
    const selectorArr = U.nl2array(document.querySelectorAll('.eventEditSelector'));
    R.ap([U.clearEl], selectorArr);
  }

  function rebuildInterface(events, metaInfo) {
    // event part
    const table = U.clearEl(U.queryEl('#eventBlock'));

    U.showEl(table, events.length !== 0);
    U.showEl(U.qe(`${root} .alert`), events.length === 0);

    // refresh position selector
    const addOpt = R.curry((sel, text) => {
      U.addEl(sel, U.addEl(U.makeEl('option'), U.makeText(text)));
    });

    let option, addOptLoc;
    const positionSelectors = U.nl2array(document.querySelectorAll('.eventPositionSelector'));
    R.ap([U.clearEl], positionSelectors);
    positionSelectors.forEach((positionSelector) => {
      addOptLoc = addOpt(positionSelector);

      events.forEach((event) => {
        addOptLoc(CU.strFormat(L10n.getValue('common-set-item-before'), [event.name]));
      });

      addOptLoc(L10n.getValue('common-set-item-as-last'));

      positionSelector.selectedIndex = events.length;
    });

    state.eventsLength = events.length;

    R.ap([U.addEl(table)], events.map((event, i, events2) => appendEventInput(event, i, events2, metaInfo.date, metaInfo.preGameDate)));

    // refresh swap selector
    const selectorArr = U.nl2array(document.querySelectorAll('.eventEditSelector'));
    R.ap([U.clearEl], selectorArr);

    events.forEach((event, i) => {
      selectorArr.forEach((selector) => {
        option = U.makeEl('option');
        option.appendChild(U.makeText(event.name));
        option.eventIndex = i;
        selector.appendChild(option);
      });
    });
  }

  function createEvent(dialog) {
    return () => {
      const eventNameInput = U.qee(dialog, '.eventNameInput');
      const eventName = eventNameInput.value.trim();
      const positionSelector = U.qee(dialog, '.positionSelector');

      DBMS.createEvent({
        storyName: Stories.getCurrentStoryName(),
        eventName,
        selectedIndex: positionSelector.selectedIndex
      }).then(() => {
        eventNameInput.value = '';
        dialog.hideDlg();
        refresh();
      }).catch((err) => UI.setError(dialog, err));
    };
  }

  function appendEventInput(event, index, events, date, preGameDate) {
    const content = U.makeEl('tbody');
    ReactDOM.render(getStoryEventTemplate(), content);
    const el = U.qee(content, '.StoryEventTemplate');

    L10n.localizeStatic(el);
    const qe = U.qee(el);
    U.addEl(qe('.event-number'), U.makeText(index + 1));
    const nameInput = qe('.event-name-input');
    nameInput.value = event.name;
    nameInput.eventIndex = index;
    U.listen(nameInput, 'change', updateEventName);

    const textInput = qe('.event-text');
    textInput.value = event.text;
    textInput.eventIndex = index;
    U.listen(textInput, 'change', updateEventText);

    UI.makeEventTimePicker2(qe('.event-time'), {
      eventTime: event.time,
      index,
      preGameDate,
      date,
      onChangeDateTimeCreator
    });

    U.listen(U.qee(el, '.move'), 'click', () => {
      state.moveEventDialog.index = index;
      state.moveEventDialog.showDlg();
    });

    U.listen(U.qee(el, '.clone'), 'click', cloneEvent(index));
    if (state.eventsLength === index + 1) {
      U.setAttr(U.qee(el, '.merge'), 'disabled', 'disabled');
    } else {
      U.listen(U.qee(el, '.merge'), 'click', mergeEvents(index, event.name, events[index + 1].name));
    }
    U.listen(U.qee(el, '.remove'), 'click', removeEvent(event.name, index));

    return el;
  }

  function moveEvent(dialog) {
    return () => {
      const newIndex = U.queryEl('.movePositionSelector').selectedIndex;
      DBMS.moveEvent({
        storyName: Stories.getCurrentStoryName(),
        index: dialog.index,
        newIndex
      }).then(() => {
        dialog.hideDlg();
        refresh();
      }).catch((err) => UI.setError(dialog, err));
    };
  }

  function cloneEvent(index) {
    return () => {
      DBMS.cloneEvent({
        storyName: Stories.getCurrentStoryName(),
        index
      }).then(refresh, UI.handleError);
    };
  }

  function mergeEvents(index, firstName, secondName) {
    return () => {
      if (state.eventsLength === index + 1) {
        UI.alert(L10n.getValue('stories-cant-merge-last-event'));
        return;
      }

      UI.confirm(L10n.format('stories', 'confirm-event-merge', [firstName, secondName]), () => {
        DBMS.mergeEvents({
          storyName: Stories.getCurrentStoryName(),
          index
        }).then(refresh, UI.handleError);
      });
    };
  }

  function removeEvent(name, index) {
    return () => {
      UI.confirm(CU.strFormat(L10n.getValue('stories-remove-event-warning'), [name]), () => {
        DBMS.removeEvent({
          storyName: Stories.getCurrentStoryName(),
          index
        }).then(refresh, UI.handleError);
      });
    };
  }

  function getEventHeader() {
    const tr = U.makeEl('tr');
    U.addEl(tr, U.addEl(U.makeEl('th'), U.makeText('№')));
    U.addEl(tr, U.addEl(U.makeEl('th'), U.makeText(L10n.getValue('stories-event'))));
    return tr;
  }

  function onChangeDateTimeCreator(myInput) {
    return (dp, input) => {
      DBMS.setEventOriginProperty({
        storyName: Stories.getCurrentStoryName(),
        index: myInput.eventIndex,
        property: 'time',
        value: input.val()
      }).catch(UI.handleError);
      U.removeClass(myInput, 'defaultDate');
    };
  }

  function updateEventName(event) {
    const input = event.target;
    DBMS.setEventOriginProperty({
      storyName: Stories.getCurrentStoryName(),
      index: input.eventIndex,
      property: 'name',
      value: input.value
    }).then(refresh, UI.handleError);
  }

  function updateEventText(event) {
    const input = event.target;
    DBMS.setEventOriginProperty({
      storyName: Stories.getCurrentStoryName(),
      index: input.eventIndex,
      property: 'text',
      value: input.value
    }).catch(UI.handleError);
  }
  return {
    init, refresh, getContent, getCreateEventDialog
  };
}
