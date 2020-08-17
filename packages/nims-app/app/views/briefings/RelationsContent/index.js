import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { RelationsContent } from './RelationsContent.jsx';

const tmp = pipe(withTranslation(), withDbms)(RelationsContent);

export { tmp as RelationsContent };
