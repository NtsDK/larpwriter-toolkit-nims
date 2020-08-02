import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { RelationRow } from './RelationRow.jsx';

const tmp = pipe(withTranslation())(RelationRow);

export { tmp as RelationRow };
