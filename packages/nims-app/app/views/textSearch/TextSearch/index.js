import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { TextSearch } from './TextSearch.jsx';

const tmp = pipe(withTranslation(), withDbms)(TextSearch);

export { tmp as TextSearch };
