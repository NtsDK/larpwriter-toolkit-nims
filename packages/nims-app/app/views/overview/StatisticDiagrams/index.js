import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { StatisticDiagrams } from './StatisticDiagrams.jsx';

const tmp = pipe(withTranslation())(StatisticDiagrams);

export { tmp as StatisticDiagrams };
