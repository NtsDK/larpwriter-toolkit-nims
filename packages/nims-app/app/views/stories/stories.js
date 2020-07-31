import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import PermissionInformer from 'permissionInformer';
import * as CU from 'nims-dbms-core/commonUtils';

import { getStoriesTemplate } from './StoriesTemplate.jsx';
import { createModalDialog } from '../commons/uiCommons';
import { getModalPromptBody } from '../commons/uiCommons2.jsx';

import { NavComponentV1 } from '../../pages/NavComponentV1';

import createWriterStory from './writerStory';
import createStoryEvents from './storyEvents';
import createStoryCharacters from './storyCharacters';
import createEventPresence from './eventPresence';

const Stories = {};

const WriterStory = createWriterStory(Stories);
const StoryEvents = createStoryEvents(Stories);
const StoryCharacters = createStoryCharacters(Stories);
const EventPresence = createEventPresence(Stories);

const state = {};
const root = '.stories-tab ';
// let content;
Stories.getContent = () => Stories.content;

Stories.init = () => {
  Stories.content = U.makeEl('div');
  U.addEl(U.qe('.tab-container'), Stories.content);
  ReactDOM.render(getStoriesTemplate(), Stories.content);
  L10n.localizeStatic(Stories.content);

  const createStoryDialog = createModalDialog(root, createStory, {
    // bodySelector: 'modal-prompt-body',
    dialogTitle: 'stories-enter-story-name',
    actionButtonTitle: 'common-create',
    getComponent: getModalPromptBody,
    componentClass: 'ModalPromptBody'
  });

  const renameStoryDialog = createModalDialog(root, renameStory, {
    // bodySelector: 'modal-prompt-body',
    dialogTitle: 'stories-enter-new-story-name',
    actionButtonTitle: 'common-rename',
    getComponent: getModalPromptBody,
    componentClass: 'ModalPromptBody'
  });

  state.left = new NavComponentV1(
    U.queryEl('.stories-navigation-container .left-side'),
    U.queryEl('.stories-content-container .left-side'),
    true
  );
  state.left.addView('writer-story', 'WriterStory', WriterStory);
  state.left.addView('story-events', 'StoryEvents', StoryEvents);
  state.left.addView('story-characters', 'StoryCharacters', StoryCharacters);
  state.left.addView('event-presence', 'EventPresence', EventPresence);
  state.right = new NavComponentV1(
    U.queryEl('.stories-navigation-container .right-side'),
    U.queryEl('.stories-content-container .right-side'),
    true
  );
  state.left.setFirstView('WriterStory');
  state.left.render();
  state.right.addView('writer-story', 'WriterStory', WriterStory);
  state.right.addView('story-events', 'StoryEvents', StoryEvents);
  state.right.addView('story-characters', 'StoryCharacters', StoryCharacters);
  state.right.addView('event-presence', 'EventPresence', EventPresence);
  state.right.setFirstView('StoryEvents');
  state.right.render();

  U.listen(U.queryEl(`${root}.remove.story`), 'click', removeStory);

  U.listen(U.qe(`${root}.create.story`), 'click', () => createStoryDialog.showDlg());
  U.listen(U.qe(`${root}.rename.story`), 'click', () => {
    U.qee(renameStoryDialog, '.entity-input').value = U.queryEl(`${root}#storySelector`).value.trim();
    renameStoryDialog.showDlg();
  });

  // U.listen(U.qe(`${root}.create.event`), 'click', () => StoryEvents.createEventDialog.showDlg());
  U.listen(U.qe(`${root}.create.event`), 'click', () => StoryEvents.getCreateEventDialog().showDlg());
  // U.listen(U.qe(`${root}.add.character`), 'click', () => StoryCharacters.addCharacterDialog.showDlg());
  U.listen(U.qe(`${root}.add.character`), 'click', () => StoryCharacters.getAddCharacterDialog().showDlg());

  $('#storySelector').select2().on('change', onStorySelectorChangeDelegate);

  Stories.content = U.queryEl(root);
};

Stories.chainRefresh = () => {
  if (state.left.сurrentViewNameIs('EventPresence')
        || state.right.сurrentViewNameIs('EventPresence')) {
    EventPresence.refresh();
  }
};

Stories.refresh = () => {
  const storySelector = U.clearEl(U.queryEl('#storySelector'));

  PermissionInformer.getEntityNamesArray({ type: 'story', editableOnly: false }).then((allStoryNames) => {
    const data = UI.getSelect2Data(allStoryNames);

    UI.enableEl(U.qe(`${root}.rename.story`), allStoryNames.length > 0);
    UI.enableEl(U.qe(`${root}.remove.story`), allStoryNames.length > 0);
    UI.enableEl(U.qe(`${root}.create.event`), allStoryNames.length > 0);
    UI.enableEl(U.qe(`${root}.add.character`), allStoryNames.length > 0);
    UI.enableEl(U.qe(`${root}#storySelector`), allStoryNames.length > 0);

    U.showEl(U.qe(`${root}.alert`), allStoryNames.length === 0);
    U.showEl(U.qe(`${root}.stories-main-container`), allStoryNames.length !== 0);

    if (allStoryNames.length > 0) {
      const storyName = getSelectedStoryName(allStoryNames);
      $('#storySelector').select2(data).val(storyName).trigger('change');
      onStorySelectorChange(storyName);
    } else {
      $('#storySelector').select2(data);
      onStorySelectorChange();
    }

    state.left.refreshAllNews();
    state.left.refreshCurrentView();
    state.right.refreshCurrentView();
  }).catch(UI.handleError);
};

function getSelectedStoryName(storyNames) {
  const settings = SM.getSettings();
  if (!settings.Stories) {
    settings.Stories = {
      storyName: storyNames[0].value
    };
  }
  let { storyName } = settings.Stories;
  if (storyNames.map((nameInfo) => nameInfo.value).indexOf(storyName) === -1) {
    settings.Stories.storyName = storyNames[0].value;
    storyName = storyNames[0].value;
  }
  return storyName;
}

function createStory(dialog) {
  return () => {
    const input = U.qee(dialog, '.entity-input');
    const storyName = input.value.trim();

    DBMS.createStory({ storyName }).then(() => {
      updateSettings(storyName);
      PermissionInformer.refresh().then(() => {
        input.value = '';
        dialog.hideDlg();
        Stories.refresh();
      }).catch(UI.handleError);
    }).catch((err) => UI.setError(dialog, err));
  };
}

function renameStory(dialog) {
  return () => {
    const toInput = U.qee(dialog, '.entity-input');
    const fromName = U.queryEl(`${root}#storySelector`).value.trim();
    const toName = toInput.value.trim();

    DBMS.renameStory({ fromName, toName }).then(() => {
      updateSettings(toName);
      PermissionInformer.refresh().then(() => {
        toInput.value = '';
        dialog.hideDlg();
        Stories.refresh();
      }).catch(UI.handleError);
    }).catch((err) => UI.setError(dialog, err));
  };
}

function removeStory() {
  const name = U.queryEl(`${root}#storySelector`).value.trim();

  UI.confirm(CU.strFormat(L10n.getValue('stories-are-you-sure-about-story-removing'), [name]), () => {
    DBMS.removeStory({ storyName: name }).then(() => {
      PermissionInformer.refresh().then(() => {
        Stories.refresh();
      }).catch(UI.handleError);
    }).catch(UI.handleError);
  });
}

function onStorySelectorChangeDelegate(event) {
  const storyName = event.target.value;
  onStorySelectorChange(storyName);
}

function onStorySelectorChange(storyName) {
  state.CurrentStoryName = storyName;

  if (storyName) {
    updateSettings(storyName);
    PermissionInformer.isEntityEditable({ type: 'story', name: storyName }).then((isStoryEditable) => {
      state.left.refreshCurrentView();
      state.right.refreshCurrentView();
      UI.enable(Stories.content, 'isStoryEditable', isStoryEditable);
    }).catch(UI.handleError);
  } else { // when there are no stories at all
    updateSettings(null);
    state.left.refreshCurrentView();
    state.right.refreshCurrentView();
  }
}

Stories.getCurrentStoryName = () => state.CurrentStoryName;

function updateSettings(storyName) {
  const settings = SM.getSettings();
  settings.Stories.storyName = storyName;
}

export default {
  init: Stories.init,
  refresh: Stories.refresh,
  getContent: Stories.getContent,
};
