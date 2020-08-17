import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { RelationRow } from './RelationRow.jsx';

const tmp = pipe(withTranslation(), withDbms)(RelationRow);

export { tmp as RelationRow };
