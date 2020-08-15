import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { HistChart } from './HistChart.jsx';

const tmp = pipe(withTranslation())(HistChart);

export { tmp as HistChart };
