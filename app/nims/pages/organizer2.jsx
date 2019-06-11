import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap-sass';
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';

import '@fortawesome/fontawesome-free/css/all.css';

import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/i18n';


// import 'bootstrap/dist/css/bootstrap.min.css';

// import 'bootswatch/dist/slate/bootstrap.min.css';
// import 'bootswatch/dist/darkly/bootstrap.min.css';

// import './organizer2.scss';
// import 'react-datetime/css/react-datetime.css';

import './index.html';

import App from '../components/app';

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById('root')
);
