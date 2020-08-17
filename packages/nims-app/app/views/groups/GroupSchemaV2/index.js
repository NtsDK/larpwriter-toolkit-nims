import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { withDbms } from 'nims-app-core/withDbms.jsx';
import { GroupSchemaV2 } from './GroupSchemaV2.jsx';

const tmp = pipe(withTranslation(), withDbms)(GroupSchemaV2);

export { tmp as GroupSchemaV2 };
