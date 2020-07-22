import { withTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { GroupSchemaV2 } from './GroupSchemaV2.jsx';

const tmp = pipe(withTranslation())(GroupSchemaV2);

export { tmp as GroupSchemaV2 };
