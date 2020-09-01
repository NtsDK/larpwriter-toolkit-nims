import React from 'react';
import { DbmsContextConsumer } from './dbmsContext';

export const withDbms = (Wrapped) => (props) => (
  <DbmsContextConsumer>
    {
      // eslint-disable-next-line react/jsx-props-no-spreading
      ({ dbms }) => <Wrapped {...props} dbms={dbms} />
    }
  </DbmsContextConsumer>
);
