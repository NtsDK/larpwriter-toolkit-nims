import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { TextSearch } from './TextSearch.jsx';

const tmp = pipe(withTranslation())(TextSearch);

export { tmp as TextSearch };
