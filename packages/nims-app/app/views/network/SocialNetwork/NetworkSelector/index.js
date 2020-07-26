import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { NetworkSelector } from './NetworkSelector.jsx';

const tmp = pipe(withTranslation())(NetworkSelector);

export { tmp as NetworkSelector };
