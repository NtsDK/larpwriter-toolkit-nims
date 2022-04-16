import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// import { initReactI18next } from 'react-i18next';

import { Dictionaries, defaultLang } from 'nims-resources';

import Logger from './logger';

const log = Logger('i18n', 'info');

log.info('defaultLang', defaultLang);
log.debug('Dictionaries', Dictionaries);

const resources = Object.keys(Dictionaries).reduce((acc, key) => {
  acc[key] = { translation: Dictionaries[key] };
  return acc;
}, {});

log.debug('resources', resources);

i18n
  .use(LanguageDetector)
  .init({
    // we init with resources
    resources,
    lng: defaultLang,
    fallbackLng: defaultLang,
    // lng: 'en',
    // fallbackLng: 'en',
    debug: true,

    // have a common namespace used around the full app
    // ns: ['translations'],
    // defaultNS: 'translations',

    // keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false, // not needed for react!!
      // formatSeparator: ','
    },


    react: {
      wait: true
    }
  });

export { i18n };
