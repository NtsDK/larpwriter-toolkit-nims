import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { CommonNetworkSettings } from './CommonNetworkSettings.jsx';

const tmp = pipe(withTranslation())(CommonNetworkSettings);

export { tmp as CommonNetworkSettings };
