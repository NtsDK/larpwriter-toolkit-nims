import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { Relations } from './Relations.jsx';

const tmp = pipe(withTranslation(), withDbms)(Relations);

export { tmp as Relations };
