import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { StatisticDiagrams } from './StatisticDiagrams.jsx';

const tmp = pipe(withTranslation(), withDbms)(StatisticDiagrams);

export { tmp as StatisticDiagrams };
