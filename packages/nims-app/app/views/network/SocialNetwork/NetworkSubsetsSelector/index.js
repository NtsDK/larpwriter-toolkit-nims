import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { NetworkSubsetsSelector } from './NetworkSubsetsSelector.jsx';

const tmp = pipe(withTranslation())(NetworkSubsetsSelector);

export { tmp as NetworkSubsetsSelector };
