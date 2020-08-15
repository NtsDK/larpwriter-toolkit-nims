import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { PieChart } from './PieChart.jsx';

const tmp = pipe(withTranslation())(PieChart);

export { tmp as PieChart };
