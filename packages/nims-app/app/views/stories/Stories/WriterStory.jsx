import React, { useContext, useEffect, useState } from 'react';
import { UI, U, L10n } from 'nims-app-core';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import * as Constants from 'nims-dbms/nimsConstants';
import { DbmsContext } from 'nims-app-core/dbmsContext';
import { useTranslation } from 'react-i18next';

export function WriterStory(props) {
  const { storyName } = props;

  const { t } = useTranslation();
  const dbms = useContext(DbmsContext);

  const [state, setState] = useState({ storyText: null });

  function refresh() {
    dbms.getWriterStory({ storyName }).then((storyText) => {
      setState({ storyText });
    }).catch(UI.handleError);
  }

  useEffect(refresh, []);

  function onStoryChange(e) {
    const { value } = e.target;
    dbms.setWriterStory({
      storyName,
      value
    }).catch(UI.handleError);
  }

  // if (!state) {
  //   return null;
  // }

  const { storyText } = state;

  return (
    <div id="writerStoryDiv2">
      <div className="panel panel-default">
        <div className="panel-body">
          <textarea
            id="writerStoryArea"
            readOnly={storyText === null}
            defaultValue={storyText}
            className="isStoryEditable form-control"
            onChange={onStoryChange}
          />
        </div>
      </div>
    </div>
  );
}
