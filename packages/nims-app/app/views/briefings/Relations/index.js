import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { Relations } from './Relations.jsx';

const tmp = pipe(withTranslation())(Relations);

export { tmp as Relations };
