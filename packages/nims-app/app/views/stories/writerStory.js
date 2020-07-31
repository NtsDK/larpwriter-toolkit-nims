import ReactDOM from 'react-dom';
import { UI, U, L10n } from 'nims-app-core';
import { getWriterStoryTemplate } from './WriterStoryTemplate.jsx';

export default function createWriterStory(Stories) {
  const state = {};

  let content;
  function getContent() {
    return content;
  }

  function init() {
    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getWriterStoryTemplate(), content);
    L10n.localizeStatic(content);

    U.listen(U.queryEl('#writerStoryArea'), 'change', updateWriterStory);
    content = U.queryEl('#writerStoryDiv2');
  }

  function refresh() {
    const storyArea = U.queryEl('#writerStoryArea');
    const storyName = Stories.getCurrentStoryName();

    if (storyName) {
      DBMS.getWriterStory({ storyName }).then((story) => {
        storyArea.value = story;
      }).catch(UI.handleError);
    } else {
      storyArea.value = '';
    }
  }

  function updateWriterStory() {
    const storyArea = U.queryEl('#writerStoryArea');
    DBMS.setWriterStory({
      storyName: Stories.getCurrentStoryName(),
      value: storyArea.value
    }).catch(UI.handleError);
  }
  return {
    init, getContent, refresh
  };
}
