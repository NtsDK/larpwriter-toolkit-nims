import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { RelationsContent } from './RelationsContent.jsx';

const tmp = pipe(withTranslation())(RelationsContent);

export { tmp as RelationsContent };
