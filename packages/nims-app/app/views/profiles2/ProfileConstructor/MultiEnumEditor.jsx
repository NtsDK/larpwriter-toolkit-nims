import React, { useContext, useState } from 'react';
import * as R from 'ramda';
import * as CU from 'nims-dbms-core/commonUtils';
import { UI, U, L10n } from 'nims-app-core';
import HelpBlock from 'react-bootstrap/es/HelpBlock';
import { EnumListEditor } from './EnumListEditor.jsx';
import { EnumDefaultValueEditor } from './EnumDefaultValueEditor.jsx';

export function MultiEnumEditor(props) {
  const { profileStructureItem, refresh } = props;
  const [errorText, setErrorText] = useState(null);
  const [list, setList] = useState(profileStructureItem.value.split(','));

  return (
    <div>
      <div className="tw-mb-6">
        <EnumListEditor
          profileItemName={profileStructureItem.name}
          list={list}
          setList={setList}
          setErrorText={setErrorText}
          canRemoveLast
        />
      </div>
      <div>
        {errorText && <HelpBlock>{errorText}</HelpBlock>}
      </div>
    </div>
  );
}
