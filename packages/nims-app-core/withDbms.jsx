import React from 'react';
import { DbmsContextConsumer } from './dbmsContext';

export const withDbms = (Wrapped) => (props) => (
  <DbmsContextConsumer>
    {
      ({ dbms, permissionInformer }) => (
        <Wrapped
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          dbms={dbms}
          permissionInformer={permissionInformer}
        />
      )
    }
  </DbmsContextConsumer>
);
