import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { RelationReport } from './RelationReport.jsx';

const tmp = pipe(withTranslation())(RelationReport);

export { tmp as RelationReport };
